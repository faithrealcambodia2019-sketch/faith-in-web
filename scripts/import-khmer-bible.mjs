#!/usr/bin/env node
/**
 * Faith In — Khmer Old Version 1954 importer
 * ==========================================
 *
 * Loads the complete Khmer 1954 Bible into Supabase so faithin.co serves
 * Scripture from its own database instead of calling a third-party API on
 * every chapter read.
 *
 * ---------------------------------------------------------------------------
 * LICENCE — READ BEFORE RUNNING
 * ---------------------------------------------------------------------------
 * The Khmer Old Version 1954 (ព្រះគម្ពីរបរិសុទ្ធ ១៩៥៤) is published by the
 * Bible Society in Cambodia. It is NOT public domain.
 *
 * Run this only if you hold a licence to reproduce the text:
 *   • Register the Faith In app at https://platform.youversion.com/ and accept
 *     the publisher licence for Bible version 1270, then set YVP_APP_KEY; or
 *   • Obtain a data licence direct from the Bible Society in Cambodia
 *     (info@biblecambodia.org) and use --from-usfm instead.
 *
 * The importer refuses to start without an explicit licence acknowledgement.
 *
 * ---------------------------------------------------------------------------
 * USAGE
 * ---------------------------------------------------------------------------
 *   SUPABASE_URL=...  SUPABASE_SECRET_KEY=...  YVP_APP_KEY=...  \
 *     node scripts/import-khmer-bible.mjs --i-have-a-licence
 *
 * Options
 *   --i-have-a-licence   Required. Confirms you hold rights to the text.
 *   --book=John          Import one book only.
 *   --from=John          Resume from this book (books before it are skipped).
 *   --dry-run            Fetch and report, write nothing.
 *   --delay=250          Milliseconds between chapter requests (default 250).
 *   --from-usfm=DIR      Import from a directory of licensed USFM files
 *                        instead of the API.
 *
 * Safe to re-run: every write is an upsert keyed by
 * (version, book, chapter, verse), and --from lets an interrupted run continue.
 */

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const VERSION = "KHMER_OLD_1954";
const BIBLE_ID = process.env.YVP_KHMER_BIBLE_ID || "1270";

// ---------------------------------------------------------------------------
// Arguments
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const value = (name) => {
  const hit = args.find((arg) => arg.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : "";
};

const options = {
  licensed: flag("i-have-a-licence"),
  book: value("book"),
  from: value("from"),
  dryRun: flag("dry-run"),
  delayMs: Number(value("delay")) || 250,
  usfmDir: value("from-usfm"),
};

function fail(message) {
  console.error(`\n  ${message}\n`);
  process.exit(1);
}

if (!options.licensed) {
  fail(
    [
      "Refusing to run without a licence acknowledgement.",
      "",
      "The Khmer Old Version 1954 is published by the Bible Society in Cambodia",
      "and is not public domain. Obtain rights first — the YouVersion Platform",
      "publisher licence for Bible 1270, or a data licence from the Bible",
      "Society (info@biblecambodia.org) — then re-run with:",
      "",
      "    node scripts/import-khmer-bible.mjs --i-have-a-licence",
    ].join("\n"),
  );
}

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) {
  fail("SUPABASE_URL and SUPABASE_SECRET_KEY must be set (copy them from Vercel).");
}

// ---------------------------------------------------------------------------
// Book catalogue — reuses the canonical list the app already ships
// ---------------------------------------------------------------------------

const { BIBLE_BOOKS } = await import("../lib/bible-service.ts");
const {
  writeVerses,
  updateVersionStats,
  startImportRun,
  updateImportRun,
  finishImportRun,
} = await import("../lib/scripture-store.ts");

let books = BIBLE_BOOKS;
if (options.book) {
  books = books.filter((b) => b.name.toLowerCase() === options.book.toLowerCase());
  if (!books.length) fail(`Unknown book: ${options.book}`);
}
if (options.from) {
  const index = books.findIndex((b) => b.name.toLowerCase() === options.from.toLowerCase());
  if (index === -1) fail(`Unknown book: ${options.from}`);
  books = books.slice(index);
}

const chaptersTotal = books.reduce((sum, book) => sum + book.chapters, 0);

// ---------------------------------------------------------------------------
// Source A — YouVersion Platform
// ---------------------------------------------------------------------------

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchChapterFromApi(book, chapter, attempt = 1) {
  const key = process.env.YVP_APP_KEY || process.env.YOUVERSION_APP_KEY;
  if (!key) fail("YVP_APP_KEY is not set. Register at https://platform.youversion.com/");

  const url = `https://api.youversion.com/v1/bibles/${BIBLE_ID}/books/${book.usfm}/chapters/${chapter}/verses?format=text`;
  try {
    const response = await fetch(url, {
      headers: { "X-YVP-App-Key": key, Accept: "application/json" },
      signal: AbortSignal.timeout(15000),
    });

    if (response.status === 429 || response.status >= 500) {
      if (attempt > 4) throw new Error(`HTTP ${response.status} after 4 attempts`);
      const backoff = options.delayMs * 2 ** attempt;
      console.log(`      rate limited (${response.status}), waiting ${backoff}ms`);
      await sleep(backoff);
      return fetchChapterFromApi(book, chapter, attempt + 1);
    }
    if (response.status === 403) {
      throw new Error(
        "403 Forbidden — the app key is valid but the publisher licence for " +
          `Bible ${BIBLE_ID} has not been accepted. Accept it at platform.youversion.com.`,
      );
    }
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const payload = await response.json();
    const raw = Array.isArray(payload.data) ? payload.data : Array.isArray(payload) ? payload : [];
    return raw
      .map((item, index) => ({
        book: book.name,
        chapter,
        verse: Number(item.verse) || index + 1,
        text: String(item.content || item.text || "")
          .replace(/<[^>]*>/g, "")
          .replace(/\s+/g, " ")
          .trim(),
      }))
      .filter((verse) => verse.text);
  } catch (error) {
    if (attempt <= 3 && /timeout|fetch failed|network/i.test(String(error?.message))) {
      await sleep(options.delayMs * 2 ** attempt);
      return fetchChapterFromApi(book, chapter, attempt + 1);
    }
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Source B — licensed USFM files on disk
// ---------------------------------------------------------------------------

/** Minimal USFM reader: \c starts a chapter, \v starts a verse. */
function parseUsfm(source, bookName) {
  const verses = [];
  let chapter = 0;
  let verse = 0;
  let buffer = [];

  const flush = () => {
    if (chapter && verse && buffer.length) {
      const text = buffer
        .join(" ")
        .replace(/\\[a-z]+\*?/g, "")
        .replace(/\s+/g, " ")
        .trim();
      if (text) verses.push({ book: bookName, chapter, verse, text });
    }
    buffer = [];
  };

  for (const line of source.split(/\r?\n/)) {
    const chapterMatch = line.match(/^\\c\s+(\d+)/);
    if (chapterMatch) {
      flush();
      chapter = Number(chapterMatch[1]);
      verse = 0;
      continue;
    }
    const verseMatch = line.match(/^\\v\s+(\d+)\s*(.*)$/);
    if (verseMatch) {
      flush();
      verse = Number(verseMatch[1]);
      buffer = [verseMatch[2] || ""];
      continue;
    }
    if (verse && !line.startsWith("\\")) buffer.push(line);
  }
  flush();
  return verses;
}

async function importFromUsfm() {
  const entries = await readdir(options.usfmDir);
  const usfmFiles = entries.filter((name) => /\.(usfm|sfm|SFM|USFM)$/.test(name));
  if (!usfmFiles.length) fail(`No .usfm files found in ${options.usfmDir}`);

  let written = 0;
  for (const file of usfmFiles) {
    const source = await readFile(path.join(options.usfmDir, file), "utf8");
    const idMatch = source.match(/^\\id\s+([A-Z0-9]{3})/m);
    const usfmCode = idMatch ? idMatch[1] : "";
    const book = BIBLE_BOOKS.find((b) => b.usfm === usfmCode);
    if (!book) {
      console.log(`  skipped ${file} — USFM id "${usfmCode}" is not a canonical book`);
      continue;
    }

    const verses = parseUsfm(source, book.name);
    console.log(`  ${book.name.padEnd(16)} ${String(verses.length).padStart(5)} verses`);
    if (!options.dryRun && verses.length) {
      for (let i = 0; i < verses.length; i += 500) {
        written += await writeVerses(VERSION, verses.slice(i, i + 500));
      }
    }
  }
  return written;
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

console.log("");
console.log("  Faith In — Khmer Old Version 1954 import");
console.log("  ----------------------------------------");
console.log(`  Source:   ${options.usfmDir ? `USFM files in ${options.usfmDir}` : `YouVersion Bible ${BIBLE_ID}`}`);
console.log(`  Books:    ${books.length}`);
console.log(`  Chapters: ${chaptersTotal}`);
if (options.dryRun) console.log("  Mode:     DRY RUN — nothing will be written");
console.log("");

const runId = options.dryRun
  ? null
  : await startImportRun(VERSION, options.usfmDir ? "usfm" : "youversion", chaptersTotal);

let chaptersDone = 0;
let versesWritten = 0;
const failures = [];

try {
  if (options.usfmDir) {
    versesWritten = await importFromUsfm();
  } else {
    for (const book of books) {
      process.stdout.write(`  ${book.name.padEnd(16)}`);
      let bookVerses = 0;

      for (let chapter = 1; chapter <= book.chapters; chapter += 1) {
        try {
          const verses = await fetchChapterFromApi(book, chapter);
          if (!options.dryRun && verses.length) {
            versesWritten += await writeVerses(VERSION, verses);
          }
          bookVerses += verses.length;
          chaptersDone += 1;
          process.stdout.write(".");
        } catch (error) {
          failures.push(`${book.name} ${chapter}: ${error.message}`);
          process.stdout.write("x");
          // A licence failure will not fix itself — stop rather than hammer it.
          if (/403|licence/i.test(error.message)) throw error;
        }
        await sleep(options.delayMs);
      }

      console.log(` ${String(bookVerses).padStart(5)} verses`);
      await updateImportRun(runId, {
        chapters_done: chaptersDone,
        verses_written: versesWritten,
        last_book: book.name,
        last_chapter: book.chapters,
      });
    }
  }

  if (!options.dryRun) {
    await updateVersionStats(VERSION);
    await finishImportRun(runId, failures.length ? "failed" : "complete", {
      chapters_done: chaptersDone,
      verses_written: versesWritten,
      error: failures.slice(0, 20).join("; "),
    });
  }

  console.log("");
  console.log(`  Chapters read:  ${chaptersDone}/${chaptersTotal}`);
  console.log(`  Verses written: ${versesWritten}`);
  if (failures.length) {
    console.log(`  Failed:         ${failures.length}`);
    failures.slice(0, 10).forEach((line) => console.log(`    - ${line}`));
    if (failures.length > 10) console.log(`    …and ${failures.length - 10} more`);
    console.log("");
    console.log("  Re-run with --from=<Book> to retry from where it stopped.");
  }
  console.log("");
  process.exit(failures.length ? 1 : 0);
} catch (error) {
  await finishImportRun(runId, "failed", {
    chapters_done: chaptersDone,
    verses_written: versesWritten,
    error: String(error?.message || error).slice(0, 1000),
  });
  console.log("");
  fail(`Import stopped: ${error?.message || error}`);
}
