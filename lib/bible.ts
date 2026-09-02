export type BibleSource = "bible-api" | "youversion";

export type BibleVersion = {
  id: string;
  label: string;
  shortLabel: string;
  language: string;
  languageLabel: string;
  source: BibleSource;
  upstreamId: string;
  attribution: string;
  attributionUrl: string;
  requiresPublisherAccess?: boolean;
};

export type BibleBook = {
  name: string;
  usfm: string;
  chapters: number;
};

export type BibleVerse = {
  v: number;
  text: string;
  reference: string;
};

export const BIBLE_BOOKS: readonly BibleBook[] = [
  { name: "Genesis", usfm: "GEN", chapters: 50 },
  { name: "Exodus", usfm: "EXO", chapters: 40 },
  { name: "Leviticus", usfm: "LEV", chapters: 27 },
  { name: "Numbers", usfm: "NUM", chapters: 36 },
  { name: "Deuteronomy", usfm: "DEU", chapters: 34 },
  { name: "Joshua", usfm: "JOS", chapters: 24 },
  { name: "Judges", usfm: "JDG", chapters: 21 },
  { name: "Ruth", usfm: "RUT", chapters: 4 },
  { name: "1 Samuel", usfm: "1SA", chapters: 31 },
  { name: "2 Samuel", usfm: "2SA", chapters: 24 },
  { name: "1 Kings", usfm: "1KI", chapters: 22 },
  { name: "2 Kings", usfm: "2KI", chapters: 25 },
  { name: "1 Chronicles", usfm: "1CH", chapters: 29 },
  { name: "2 Chronicles", usfm: "2CH", chapters: 36 },
  { name: "Ezra", usfm: "EZR", chapters: 10 },
  { name: "Nehemiah", usfm: "NEH", chapters: 13 },
  { name: "Esther", usfm: "EST", chapters: 10 },
  { name: "Job", usfm: "JOB", chapters: 42 },
  { name: "Psalm", usfm: "PSA", chapters: 150 },
  { name: "Proverbs", usfm: "PRO", chapters: 31 },
  { name: "Ecclesiastes", usfm: "ECC", chapters: 12 },
  { name: "Song of Solomon", usfm: "SNG", chapters: 8 },
  { name: "Isaiah", usfm: "ISA", chapters: 66 },
  { name: "Jeremiah", usfm: "JER", chapters: 52 },
  { name: "Lamentations", usfm: "LAM", chapters: 5 },
  { name: "Ezekiel", usfm: "EZK", chapters: 48 },
  { name: "Daniel", usfm: "DAN", chapters: 12 },
  { name: "Hosea", usfm: "HOS", chapters: 14 },
  { name: "Joel", usfm: "JOL", chapters: 3 },
  { name: "Amos", usfm: "AMO", chapters: 9 },
  { name: "Obadiah", usfm: "OBA", chapters: 1 },
  { name: "Jonah", usfm: "JON", chapters: 4 },
  { name: "Micah", usfm: "MIC", chapters: 7 },
  { name: "Nahum", usfm: "NAM", chapters: 3 },
  { name: "Habakkuk", usfm: "HAB", chapters: 3 },
  { name: "Zephaniah", usfm: "ZEP", chapters: 3 },
  { name: "Haggai", usfm: "HAG", chapters: 2 },
  { name: "Zechariah", usfm: "ZEC", chapters: 14 },
  { name: "Malachi", usfm: "MAL", chapters: 4 },
  { name: "Matthew", usfm: "MAT", chapters: 28 },
  { name: "Mark", usfm: "MRK", chapters: 16 },
  { name: "Luke", usfm: "LUK", chapters: 24 },
  { name: "John", usfm: "JHN", chapters: 21 },
  { name: "Acts", usfm: "ACT", chapters: 28 },
  { name: "Romans", usfm: "ROM", chapters: 16 },
  { name: "1 Corinthians", usfm: "1CO", chapters: 16 },
  { name: "2 Corinthians", usfm: "2CO", chapters: 13 },
  { name: "Galatians", usfm: "GAL", chapters: 6 },
  { name: "Ephesians", usfm: "EPH", chapters: 6 },
  { name: "Philippians", usfm: "PHP", chapters: 4 },
  { name: "Colossians", usfm: "COL", chapters: 4 },
  { name: "1 Thessalonians", usfm: "1TH", chapters: 5 },
  { name: "2 Thessalonians", usfm: "2TH", chapters: 3 },
  { name: "1 Timothy", usfm: "1TI", chapters: 6 },
  { name: "2 Timothy", usfm: "2TI", chapters: 4 },
  { name: "Titus", usfm: "TIT", chapters: 3 },
  { name: "Philemon", usfm: "PHM", chapters: 1 },
  { name: "Hebrews", usfm: "HEB", chapters: 13 },
  { name: "James", usfm: "JAS", chapters: 5 },
  { name: "1 Peter", usfm: "1PE", chapters: 5 },
  { name: "2 Peter", usfm: "2PE", chapters: 3 },
  { name: "1 John", usfm: "1JN", chapters: 5 },
  { name: "2 John", usfm: "2JN", chapters: 1 },
  { name: "3 John", usfm: "3JN", chapters: 1 },
  { name: "Jude", usfm: "JUD", chapters: 1 },
  { name: "Revelation", usfm: "REV", chapters: 22 },
] as const;

export const BIBLE_VERSIONS: readonly BibleVersion[] = [
  {
    id: "KHMER_OLD_1954",
    label: "ព្រះគម្ពីរបរិសុទ្ធ ១៩៥៤ (ពគប)",
    shortLabel: "KHOV 1954",
    language: "km",
    languageLabel: "ភាសាខ្មែរ (Khmer)",
    source: "bible-api",
    upstreamId: "1270",
    attribution: "© 1954, 1962 Bible Society in Cambodia",
    attributionUrl: "https://www.bible.com/versions/1270",
    requiresPublisherAccess: false,
  },
  {
    id: "KJV",
    label: "King James Version",
    shortLabel: "KJV",
    language: "en",
    languageLabel: "English",
    source: "bible-api",
    upstreamId: "kjv",
    attribution: "King James Version — public domain",
    attributionUrl: "https://bible-api.com/",
  },
  {
    id: "WEB",
    label: "World English Bible",
    shortLabel: "WEB",
    language: "en",
    languageLabel: "English",
    source: "bible-api",
    upstreamId: "web",
    attribution: "World English Bible — public domain",
    attributionUrl: "https://worldenglish.bible/",
  },
  {
    id: "ASV",
    label: "American Standard Version (1901)",
    shortLabel: "ASV",
    language: "en",
    languageLabel: "English",
    source: "bible-api",
    upstreamId: "asv",
    attribution: "American Standard Version (1901) — public domain",
    attributionUrl: "https://bible-api.com/",
  },
  {
    id: "BBE",
    label: "Bible in Basic English",
    shortLabel: "BBE",
    language: "en",
    languageLabel: "English",
    source: "bible-api",
    upstreamId: "bbe",
    attribution: "Bible in Basic English",
    attributionUrl: "https://bible-api.com/",
  },
  {
    id: "CUV",
    label: "Chinese Union Version",
    shortLabel: "CUV",
    language: "zh",
    languageLabel: "中文 (Chinese)",
    source: "bible-api",
    upstreamId: "cuv",
    attribution: "Chinese Union Version",
    attributionUrl: "https://bible-api.com/",
  },
  {
    id: "BKR",
    label: "Bible kralická",
    shortLabel: "BKR",
    language: "cs",
    languageLabel: "Čeština (Czech)",
    source: "bible-api",
    upstreamId: "bkr",
    attribution: "Bible kralická",
    attributionUrl: "https://bible-api.com/",
  },
  {
    id: "ALMEIDA",
    label: "João Ferreira de Almeida",
    shortLabel: "Almeida",
    language: "pt",
    languageLabel: "Português (Portuguese)",
    source: "bible-api",
    upstreamId: "almeida",
    attribution: "João Ferreira de Almeida",
    attributionUrl: "https://bible-api.com/",
  },
  {
    id: "RCCV",
    label: "Cornilescu Corrected Version",
    shortLabel: "RCCV",
    language: "ro",
    languageLabel: "Română (Romanian)",
    source: "bible-api",
    upstreamId: "rccv",
    attribution: "Protestant Romanian Corrected Cornilescu Version",
    attributionUrl: "https://bible-api.com/",
  },
  {
    id: "CLEMENTINE",
    label: "Clementine Latin Vulgate",
    shortLabel: "Vulgate",
    language: "la",
    languageLabel: "Latina (Latin)",
    source: "bible-api",
    upstreamId: "clementine",
    attribution: "Clementine Latin Vulgate",
    attributionUrl: "https://bible-api.com/",
  },
] as const;

export class BibleRequestError extends Error {
  constructor(
    message: string,
    readonly status = 400,
  ) {
    super(message);
  }
}

export function findBibleVersion(value: string | null | undefined) {
  const id = String(value || "").trim().toUpperCase();
  const version = BIBLE_VERSIONS.find((item) => item.id === id);
  if (!version) throw new BibleRequestError("Choose a supported Bible version.");
  return version;
}

export function findBibleBook(value: string | null | undefined) {
  const requested = String(value || "").trim().toLowerCase();
  const alias = requested === "psalms" ? "psalm" : requested;
  const book = BIBLE_BOOKS.find(
    (item) => item.name.toLowerCase() === alias || item.usfm.toLowerCase() === alias,
  );
  if (!book) throw new BibleRequestError("Choose a valid Bible book.");
  return book;
}

export function resolveBibleChapter(
  versionValue: string | null | undefined,
  bookValue: string | null | undefined,
  chapterValue: string | null | undefined,
) {
  const version = findBibleVersion(versionValue);
  const book = findBibleBook(bookValue);
  const chapter = Number(chapterValue);
  if (!Number.isInteger(chapter) || chapter < 1 || chapter > book.chapters) {
    throw new BibleRequestError(`Choose a chapter from 1 to ${book.chapters}.`);
  }
  return { version, book, chapter };
}

export function publicBibleVersions(_youVersionConfigured?: boolean) {
  return BIBLE_VERSIONS.map((version) => ({
    id: version.id,
    label: version.label,
    shortLabel: version.shortLabel,
    language: version.language,
    languageLabel: version.languageLabel,
    attribution: version.attribution,
    attributionUrl: version.attributionUrl,
    available: true,
    requiresPublisherAccess: false,
  }));
}

function decodeHtmlEntities(value: string) {
  const named: Record<string, string> = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    nbsp: " ",
    quot: '"',
  };
  return value.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, entity: string) => {
    if (entity[0] !== "#") return named[entity.toLowerCase()] ?? match;
    const hexadecimal = entity[1]?.toLowerCase() === "x";
    const codePoint = Number.parseInt(entity.slice(hexadecimal ? 2 : 1), hexadecimal ? 16 : 10);
    if (!Number.isFinite(codePoint) || codePoint < 0 || codePoint > 0x10ffff) return "";
    try {
      return String.fromCodePoint(codePoint);
    } catch {
      return "";
    }
  });
}

function plainTextFromBibleHtml(value: string) {
  return decodeHtmlEntities(
    value
      .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<\/(?:div|p|li|h[1-6])>/gi, " ")
      .replace(/<[^>]+>/g, ""),
  )
    .replace(/\s+/g, " ")
    .trim();
}

function removeVerseLabelSpans(value: string) {
  return value.replace(/<span\b([^>]*)>[\s\S]*?<\/span>/gi, (span, attributes: string) => {
    return /\bclass\s*=\s*(["'])[^"']*\byv-vlbl\b[^"']*\1/i.test(attributes) ? "" : span;
  });
}

/** Convert YouVersion's documented chapter HTML into safe, aligned verse text. */
export function parseYouVersionChapterHtml(html: string, bookName: string, chapter: number) {
  const markers: Array<{ start: number; end: number; verse: number }> = [];
  const emptySpan = /<span\b([^>]*)>\s*<\/span>/gi;
  let match: RegExpExecArray | null;

  while ((match = emptySpan.exec(html))) {
    const attributes = match[1] || "";
    const classMatch = attributes.match(/\bclass\s*=\s*(["'])([^"']*)\1/i);
    if (!classMatch || !/(?:^|\s)yv-v(?:\s|$)/.test(classMatch[2])) continue;
    const verseMatch = attributes.match(/\bv\s*=\s*(["']?)(\d+)\1/i);
    const verse = Number(verseMatch?.[2]);
    if (!Number.isInteger(verse) || verse < 1) continue;
    markers.push({ start: match.index, end: emptySpan.lastIndex, verse });
  }

  return markers
    .map((marker, index): BibleVerse | null => {
      const next = markers[index + 1];
      const fragment = html.slice(marker.end, next ? next.start : html.length);
      const text = plainTextFromBibleHtml(removeVerseLabelSpans(fragment));
      if (!text) return null;
      return {
        v: marker.verse,
        text,
        reference: `${bookName} ${chapter}:${marker.verse}`,
      };
    })
    .filter((verse): verse is BibleVerse => Boolean(verse));
}

export function parseBibleApiPayload(
  payload: unknown,
  bookName: string,
  chapter: number,
): BibleVerse[] {
  if (!payload || typeof payload !== "object") return [];
  const verses = (payload as { verses?: unknown }).verses;
  if (!Array.isArray(verses)) return [];
  return verses
    .map((item): BibleVerse | null => {
      if (!item || typeof item !== "object") return null;
      const verse = Number((item as { verse?: unknown }).verse);
      const text = String((item as { text?: unknown }).text || "").replace(/\s+/g, " ").trim();
      if (!Number.isInteger(verse) || verse < 1 || !text) return null;
      return { v: verse, text, reference: `${bookName} ${chapter}:${verse}` };
    })
    .filter((verse): verse is BibleVerse => Boolean(verse));
}
