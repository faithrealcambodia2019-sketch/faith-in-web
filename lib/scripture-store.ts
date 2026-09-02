/**
 * Faith In — Scripture text store
 * ===============================
 *
 * Reads and writes complete Bible text held in Supabase (`bible_verse`).
 *
 * Why this exists
 * ---------------
 * Chapter text used to come from an external API on every read, and the Khmer
 * Old Version 1954 was not stored at all — around sixty verses were hard-coded
 * in lib/bible-service.ts and everything else silently fell back to English.
 * A chapter now comes from one indexed query against Faith In's own database.
 *
 * Licensing
 * ---------
 * This module moves text; it grants no rights to it. The Khmer 1954 is
 * published by the Bible Society in Cambodia and is not public domain. Import
 * it only under a licence you hold (see docs/KHMER_BIBLE.md). The version row
 * records which licence each text arrived under, and `attributionFor()` returns
 * the credit line the reader must display.
 *
 * Failure behaviour matches lib/bible-store.ts: if Supabase is unconfigured or
 * the migration has not been run, reads return null rather than throwing, and
 * the caller falls back to its previous behaviour.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type StoredVerse = { v: number; text: string };

export type StoredChapter = {
  version: string;
  book: string;
  chapter: number;
  items: StoredVerse[];
  attribution: string;
  attributionUrl: string;
  versionName: string;
  nativeName: string;
};

export type VersionRow = {
  code: string;
  name: string;
  native_name: string;
  language: string;
  language_label: string;
  source: string;
  source_id: string;
  licence: string;
  licence_holder: string;
  attribution: string;
  attribution_url: string;
  total_verses: number;
  total_chapters: number;
  is_complete: boolean;
  imported_at: string | null;
};

let cachedClient: SupabaseClient | null = null;

export function isScriptureStoreConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL?.trim() && process.env.SUPABASE_SECRET_KEY?.trim());
}

function store(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SECRET_KEY?.trim();
  if (!url || !key) return null;
  if (!cachedClient) {
    cachedClient = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { "X-Client-Info": "faith-in-scripture" } },
    });
  }
  return cachedClient;
}

/** A missing table means the migration has not run — a setup state, not a fault. */
function isSetupError(code?: string) {
  return code === "PGRST205" || code === "42P01" || code === "PGRST106";
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

const versionCache = new Map<string, { row: VersionRow | null; expires: number }>();
const VERSION_TTL_MS = 5 * 60 * 1000;

export async function getVersion(code: string): Promise<VersionRow | null> {
  const cached = versionCache.get(code);
  if (cached && cached.expires > Date.now()) return cached.row;

  const client = store();
  if (!client) return null;

  const { data, error } = await client
    .from("bible_version")
    .select("*")
    .eq("code", code)
    .maybeSingle();

  if (error) {
    if (!isSetupError(error.code)) {
      console.error("[Faith In] Scripture version read failed", error);
    }
    return null;
  }

  const row = (data as VersionRow) || null;
  versionCache.set(code, { row, expires: Date.now() + VERSION_TTL_MS });
  return row;
}

/**
 * Returns a stored chapter, or null when this version has no text for it.
 *
 * Null is the signal to show the honest "not available yet" panel. It must
 * never be turned into text from another language.
 */
export async function getStoredChapter(
  version: string,
  book: string,
  chapter: number,
): Promise<StoredChapter | null> {
  const client = store();
  if (!client) return null;

  const { data, error } = await client
    .from("bible_verse")
    .select("verse, text")
    .eq("version", version)
    .eq("book", book)
    .eq("chapter", chapter)
    .order("verse", { ascending: true });

  if (error) {
    if (!isSetupError(error.code)) {
      console.error("[Faith In] Scripture chapter read failed", error);
    }
    return null;
  }
  if (!data || !data.length) return null;

  const meta = await getVersion(version);
  return {
    version,
    book,
    chapter,
    items: (data as { verse: number; text: string }[]).map((row) => ({
      v: row.verse,
      text: row.text,
    })),
    attribution: meta?.attribution || "",
    attributionUrl: meta?.attribution_url || "",
    versionName: meta?.name || version,
    nativeName: meta?.native_name || "",
  };
}

/** Which chapters of a version are present, for coverage reporting. */
export async function getCoverage(version: string) {
  const client = store();
  if (!client) return { chapters: 0, verses: 0, books: [] as string[] };

  const { data, error } = await client
    .from("bible_chapter_coverage")
    .select("book, chapter, verses")
    .eq("version", version);

  if (error || !data) return { chapters: 0, verses: 0, books: [] as string[] };

  const rows = data as { book: string; chapter: number; verses: number }[];
  return {
    chapters: rows.length,
    verses: rows.reduce((sum, row) => sum + row.verses, 0),
    books: [...new Set(rows.map((row) => row.book))].sort(),
  };
}

/**
 * Full-text search within a stored version. Uses the `simple` text search
 * configuration, because Postgres has no Khmer stemmer and English stemming
 * rules would mangle Khmer strings.
 */
export async function searchStored(version: string, query: string, limit = 20) {
  const client = store();
  const cleaned = (query || "").trim();
  if (!client || !cleaned) return [];

  const { data, error } = await client
    .from("bible_verse")
    .select("book, chapter, verse, text")
    .eq("version", version)
    .ilike("text", `%${cleaned}%`)
    .limit(Math.min(Math.max(limit, 1), 100));

  if (error || !data) return [];
  return data as { book: string; chapter: number; verse: number; text: string }[];
}

// ---------------------------------------------------------------------------
// Writes — used by the importer, never by a request handler
// ---------------------------------------------------------------------------

export type VerseInput = { book: string; chapter: number; verse: number; text: string };

export async function writeVerses(version: string, verses: VerseInput[]): Promise<number> {
  const client = store();
  if (!client || !verses.length) return 0;

  const rows = verses
    .filter((verse) => verse.text && verse.text.trim())
    .map((verse) => ({
      version,
      book: verse.book,
      chapter: verse.chapter,
      verse: verse.verse,
      text: verse.text.trim(),
      updated_at: new Date().toISOString(),
    }));
  if (!rows.length) return 0;

  const { error } = await client
    .from("bible_verse")
    .upsert(rows, { onConflict: "version,book,chapter,verse" });

  if (error) {
    console.error("[Faith In] Scripture write failed", error);
    throw new Error(`Could not save verses: ${error.message}`);
  }
  return rows.length;
}

export async function updateVersionStats(version: string) {
  const client = store();
  if (!client) return;
  const coverage = await getCoverage(version);
  await client
    .from("bible_version")
    .update({
      total_verses: coverage.verses,
      total_chapters: coverage.chapters,
      is_complete: coverage.chapters >= 1189,
      imported_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("code", version);
  versionCache.delete(version);
}

// ---------------------------------------------------------------------------
// Import run bookkeeping
// ---------------------------------------------------------------------------

export async function startImportRun(version: string, source: string, chaptersTotal: number) {
  const client = store();
  if (!client) return null;
  const { data, error } = await client
    .from("bible_import_run")
    .insert({ version, source, chapters_total: chaptersTotal, status: "running" })
    .select("id")
    .single();
  if (error) return null;
  return (data as { id: string }).id;
}

export async function updateImportRun(
  id: string | null,
  patch: Record<string, unknown>,
): Promise<void> {
  const client = store();
  if (!client || !id) return;
  await client.from("bible_import_run").update(patch).eq("id", id);
}

export async function finishImportRun(
  id: string | null,
  status: "complete" | "failed" | "cancelled",
  patch: Record<string, unknown> = {},
) {
  await updateImportRun(id, { ...patch, status, finished_at: new Date().toISOString() });
}
