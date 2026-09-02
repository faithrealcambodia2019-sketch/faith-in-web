import { NextRequest, NextResponse } from "next/server";
import {
  BibleRequestError,
  parseBibleApiPayload,
  parseYouVersionChapterHtml,
  resolveBibleChapter,
} from "@/lib/bible";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UPSTREAM_TIMEOUT_MS = 10_000;

type YouVersionPassage = {
  content?: unknown;
  reference?: unknown;
};

type YouVersionBible = {
  copyright?: unknown;
  localized_title?: unknown;
  localized_abbreviation?: unknown;
  youversion_deep_link?: unknown;
};

function safeText(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function errorResponse(error: unknown) {
  if (error instanceof BibleRequestError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error("Bible chapter request failed", error);
  return NextResponse.json(
    { error: "The Bible reader is temporarily unavailable. Please try again." },
    { status: 502 },
  );
}

async function fetchWithTimeout(url: string, init: RequestInit = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

function officialReadUrl(bookUsfm: string, chapter: number) {
  return `https://www.bible.com/bible/1270/${bookUsfm}.${chapter}.KHB`;
}

async function publicDomainChapter(
  upstreamId: string,
  bookUsfm: string,
  bookName: string,
  chapter: number,
  versionId: string,
  attribution: string,
  attributionUrl: string,
) {
  const response = await fetchWithTimeout(
    `https://bible-api.com/data/${encodeURIComponent(upstreamId)}/${encodeURIComponent(bookUsfm)}/${chapter}`,
    {
      headers: { Accept: "application/json" },
      cache: "no-store",
    },
  );
  if (!response.ok) throw new BibleRequestError("That chapter could not be loaded.", 502);
  const payload: unknown = await response.json();
  const items = parseBibleApiPayload(payload, bookName, chapter);
  if (!items.length) throw new BibleRequestError("No verses were returned for that chapter.", 502);
  const upstreamReference =
    payload && typeof payload === "object"
      ? safeText((payload as { reference?: unknown }).reference, `${bookName} ${chapter}`)
      : `${bookName} ${chapter}`;
  return {
    status: "ready",
    items,
    translation: versionId,
    reference: upstreamReference,
    attribution,
    attributionUrl,
  };
}

async function youVersionChapter(
  appKey: string,
  upstreamId: string,
  bookUsfm: string,
  bookName: string,
  chapter: number,
  versionId: string,
  fallbackAttribution: string,
  fallbackAttributionUrl: string,
) {
  const headers = {
    Accept: "application/json",
    "Accept-Language": "km",
    "X-YVP-App-Key": appKey,
  };
  const passageId = `${bookUsfm}.${chapter}`;
  const [passageResponse, bibleResponse] = await Promise.all([
    fetchWithTimeout(
      `https://api.youversion.com/v1/bibles/${encodeURIComponent(upstreamId)}/passages/${passageId}?format=html&include_headings=false&include_notes=false`,
      { headers, cache: "no-store" },
    ),
    fetchWithTimeout(`https://api.youversion.com/v1/bibles/${encodeURIComponent(upstreamId)}`, {
      headers,
      cache: "no-store",
    }),
  ]);

  if (passageResponse.status === 401 || passageResponse.status === 403 || passageResponse.status === 404) {
    return {
      status: "publisher_access_required",
      items: [],
      translation: versionId,
      reference: `${bookName} ${chapter}`,
      message:
        "Official Khmer Old Version 1954 access has not yet been approved for this app key.",
      setupUrl: "https://platform.youversion.com/",
      readUrl: officialReadUrl(bookUsfm, chapter),
      attribution: fallbackAttribution,
      attributionUrl: fallbackAttributionUrl,
    };
  }
  if (!passageResponse.ok) throw new BibleRequestError("The official Khmer chapter could not be loaded.", 502);

  const passage = (await passageResponse.json()) as YouVersionPassage;
  const bible = bibleResponse.ok ? ((await bibleResponse.json()) as YouVersionBible) : {};
  const html = safeText(passage.content);
  const items = parseYouVersionChapterHtml(html, bookName, chapter);
  if (!items.length) throw new BibleRequestError("The official Khmer chapter returned no verse text.", 502);

  return {
    status: "ready",
    items,
    translation: versionId,
    versionLabel: safeText(bible.localized_title),
    versionAbbreviation: safeText(bible.localized_abbreviation),
    reference: safeText(passage.reference, `${bookName} ${chapter}`),
    attribution: safeText(bible.copyright, fallbackAttribution),
    attributionUrl: safeText(bible.youversion_deep_link, fallbackAttributionUrl),
    readUrl: officialReadUrl(bookUsfm, chapter),
  };
}

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const { version, book, chapter } = resolveBibleChapter(
      params.get("version"),
      params.get("book"),
      params.get("chapter"),
    );

    if (version.source === "youversion") {
      const appKey = process.env.YVP_APP_KEY?.trim();
      if (!appKey) {
        return NextResponse.json({
          status: "setup_required",
          items: [],
          translation: version.id,
          reference: `${book.name} ${chapter}`,
          message:
            "Connect an official YouVersion Platform app key to display the licensed Khmer Old Version 1954 text inside Faith In.",
          setupUrl: "https://platform.youversion.com/",
          readUrl: officialReadUrl(book.usfm, chapter),
          attribution: version.attribution,
          attributionUrl: version.attributionUrl,
        });
      }
      const payload = await youVersionChapter(
        appKey,
        process.env.YVP_KHMER_BIBLE_ID?.trim() || version.upstreamId,
        book.usfm,
        book.name,
        chapter,
        version.id,
        version.attribution,
        version.attributionUrl,
      );
      return NextResponse.json(payload, {
        headers: { "Cache-Control": "private, no-store, max-age=0" },
      });
    }

    const payload = await publicDomainChapter(
      version.upstreamId,
      book.usfm,
      book.name,
      chapter,
      version.id,
      version.attribution,
      version.attributionUrl,
    );
    return NextResponse.json(payload, {
      headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=86400" },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
