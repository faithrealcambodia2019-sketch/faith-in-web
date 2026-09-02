import assert from "node:assert/strict";
import test from "node:test";
import { NextRequest } from "next/server";
import { GET as getBibleChapter } from "../app/api/bible/chapter/route";
import {
  BIBLE_BOOKS,
  BIBLE_VERSIONS,
  BibleRequestError,
  parseBibleApiPayload,
  parseYouVersionChapterHtml,
  publicBibleVersions,
  resolveBibleChapter,
} from "../lib/bible";

test("Bible catalog contains all 66 books and real multilingual choices", () => {
  assert.equal(BIBLE_BOOKS.length, 66);
  assert.equal(BIBLE_BOOKS.find((book) => book.name === "Psalm")?.chapters, 150);
  assert.equal(BIBLE_BOOKS.find((book) => book.name === "Revelation")?.chapters, 22);

  const languages = new Set(BIBLE_VERSIONS.map((version) => version.language));
  for (const language of ["km", "en", "zh", "pt", "ro", "cs", "la"]) {
    assert.equal(languages.has(language), true, `${language} should be available`);
  }
});

test("Khmer Old Version 1954 is publisher-gated without hiding the option", () => {
  const unavailable = publicBibleVersions(false).find((version) => version.id === "KHMER_OLD_1954");
  const available = publicBibleVersions(true).find((version) => version.id === "KHMER_OLD_1954");
  assert.equal(unavailable?.available, false);
  assert.equal(unavailable?.requiresPublisherAccess, true);
  assert.equal(available?.available, true);
  assert.match(unavailable?.attribution || "", /Bible Society in Cambodia/);
});

test("chapter requests validate versions, books, aliases, and chapter limits", () => {
  const resolved = resolveBibleChapter("KJV", "Psalms", "150");
  assert.equal(resolved.book.usfm, "PSA");
  assert.equal(resolved.chapter, 150);
  assert.throws(
    () => resolveBibleChapter("KJV", "Psalm", "151"),
    (error) => error instanceof BibleRequestError && error.status === 400,
  );
  assert.throws(() => resolveBibleChapter("UNKNOWN", "John", "3"), BibleRequestError);
});

test("official YouVersion HTML is converted into safe aligned verse text", () => {
  const html = [
    '<div class="p"><span class="yv-v" v="1"></span><span class="yv-vlbl">1</span>នៅដើមដំបូង &amp; test</div>',
    '<div class="p"><span v="2" class="yv-v"></span><span class="yv-vlbl">2</span>Verse <strong>two</strong>.</div>',
  ].join("");
  assert.deepEqual(parseYouVersionChapterHtml(html, "John", 1), [
    { v: 1, text: "នៅដើមដំបូង & test", reference: "John 1:1" },
    { v: 2, text: "Verse two.", reference: "John 1:2" },
  ]);
});

test("public Bible API payloads are normalized and empty rows are removed", () => {
  assert.deepEqual(
    parseBibleApiPayload(
      {
        verses: [
          { verse: 1, text: "  In the beginning\n" },
          { verse: 2, text: "" },
        ],
      },
      "John",
      1,
    ),
    [{ v: 1, text: "In the beginning", reference: "John 1:1" }],
  );
});

test("Khmer chapter route returns a graceful setup state when no app key exists", async () => {
  const previous = process.env.YVP_APP_KEY;
  delete process.env.YVP_APP_KEY;
  try {
    const request = new NextRequest(
      "https://faithin.co/api/bible/chapter?version=KHMER_OLD_1954&book=John&chapter=3",
    );
    const response = await getBibleChapter(request);
    const payload = (await response.json()) as Record<string, unknown>;
    assert.equal(response.status, 200);
    assert.equal(payload.status, "setup_required");
    assert.equal(payload.translation, "KHMER_OLD_1954");
    assert.match(String(payload.readUrl), /bible\.com\/bible\/1270\/JHN\.3\.KHB/);
  } finally {
    if (previous === undefined) delete process.env.YVP_APP_KEY;
    else process.env.YVP_APP_KEY = previous;
  }
});
