/**
 * Faith In — Bible Studio persistent store
 * ========================================
 *
 * Every piece of member-generated Bible Studio data (sermon notes, saved
 * Scripture cards, Scripture Memory progress, typing scores, bookmarks,
 * reader preferences, reading streak, concordance history) is read and
 * written here, against Postgres in the existing Supabase project.
 *
 * Why Supabase rather than the half-built Drizzle/Postgres path
 * ------------------------------------------------------------
 * The media upload route already authenticates to Supabase with SUPABASE_URL
 * and SUPABASE_SECRET_KEY. Reusing that connection means this backend ships
 * with NO new environment variables and no connection-pooler string to
 * manage. The Drizzle tables and routes are left exactly as they are.
 *
 * Identity
 * --------
 * Callers pass the Firebase uid that `requireMember()` has already verified
 * against Google's public signing certificates. This module never reads an
 * identity out of a request body.
 *
 * Failure behaviour
 * -----------------
 * If Supabase is not configured, or the migration has not been run yet, every
 * function throws `BibleStoreUnavailable`. Routes catch that and fall back to
 * the previous behaviour, so the Bible Studio keeps working — it just stops
 * remembering. Nothing regresses while the SQL is still pending.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export class BibleStoreUnavailable extends Error {
  constructor(message = "Faith In is not connected to its Bible Studio database yet.") {
    super(message);
    this.name = "BibleStoreUnavailable";
  }
}

let cachedClient: SupabaseClient | null = null;

export function isBibleStoreConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL?.trim() && process.env.SUPABASE_SECRET_KEY?.trim());
}

function store(): SupabaseClient {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SECRET_KEY?.trim();
  if (!url || !key) throw new BibleStoreUnavailable();
  if (!cachedClient) {
    cachedClient = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { "X-Client-Info": "faith-in-bible-studio" } },
    });
  }
  return cachedClient;
}

/**
 * Supabase reports a missing table as PGRST205/42P01. That means the SQL
 * migration has not been run yet, which is a setup state rather than a fault,
 * so it is surfaced as BibleStoreUnavailable and the caller degrades quietly.
 */
function raise(error: { code?: string; message?: string } | null, what: string): never {
  const code = error?.code || "";
  if (code === "PGRST205" || code === "42P01" || code === "PGRST106") {
    throw new BibleStoreUnavailable(
      "The Bible Studio tables have not been created yet. Run supabase/migrations/0001_bible_studio.sql.",
    );
  }
  console.error(`[Faith In] Bible store ${what} failed`, error);
  throw new Error("Faith In could not save that just now. Please try again.");
}

// ---------------------------------------------------------------------------
// Shared input hygiene
// ---------------------------------------------------------------------------

const LIMITS = {
  title: 160,
  reference: 200,
  noteBody: 20_000,
  snippet: 2_000,
  query: 120,
  passage: 4_000,
  colour: 24,
  version: 40,
  book: 80,
  tool: 40,
  id: 128,
} as const;

/** Trims, strips control characters, and caps length. Never removes real content. */
export function text(value: unknown, max: number): string {
  if (value == null) return "";
  return String(value)
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
    .trim()
    .slice(0, max);
}

export function whole(value: unknown, min: number, max: number, fallback = min): number {
  const parsed = Math.trunc(Number(value));
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

/** Keeps a designer/preferences blob small enough to be a sane database row. */
function jsonBlob(value: unknown, maxBytes = 200_000): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const serialised = JSON.stringify(value);
  if (serialised.length > maxBytes) {
    throw new Error("That design is too large to save. Try a smaller custom background.");
  }
  return JSON.parse(serialised) as Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// 1. Reader + Studio preferences
// ---------------------------------------------------------------------------

export type BiblePreferences = {
  primaryVersion: string;
  secondaryVersion: string;
  book: string;
  chapter: number;
  fontSize: number;
  activeTool: string;
  designerDefaults: Record<string, unknown>;
  updatedAt: string | null;
};

export const DEFAULT_PREFERENCES: BiblePreferences = {
  primaryVersion: "KHMER_OLD_1954",
  secondaryVersion: "KJV",
  book: "John",
  chapter: 3,
  fontSize: 16,
  activeTool: "reader",
  designerDefaults: {},
  updatedAt: null,
};

export async function getPreferences(userId: string): Promise<BiblePreferences> {
  const { data, error } = await store()
    .from("bible_preference")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) raise(error, "preferences read");
  if (!data) return { ...DEFAULT_PREFERENCES };
  return {
    primaryVersion: data.primary_version || DEFAULT_PREFERENCES.primaryVersion,
    secondaryVersion: data.secondary_version || DEFAULT_PREFERENCES.secondaryVersion,
    book: data.book || DEFAULT_PREFERENCES.book,
    chapter: data.chapter || DEFAULT_PREFERENCES.chapter,
    fontSize: data.font_size || DEFAULT_PREFERENCES.fontSize,
    activeTool: data.active_tool || DEFAULT_PREFERENCES.activeTool,
    designerDefaults: (data.designer_defaults as Record<string, unknown>) || {},
    updatedAt: data.updated_at || null,
  };
}

export async function savePreferences(
  userId: string,
  input: Partial<Record<keyof BiblePreferences, unknown>>,
): Promise<BiblePreferences> {
  const current = await getPreferences(userId);
  const row = {
    user_id: userId,
    primary_version: text(input.primaryVersion, LIMITS.version) || current.primaryVersion,
    secondary_version: text(input.secondaryVersion, LIMITS.version) || current.secondaryVersion,
    book: text(input.book, LIMITS.book) || current.book,
    chapter: input.chapter == null ? current.chapter : whole(input.chapter, 1, 150, current.chapter),
    font_size: input.fontSize == null ? current.fontSize : whole(input.fontSize, 12, 32, current.fontSize),
    active_tool: text(input.activeTool, LIMITS.tool) || current.activeTool,
    designer_defaults:
      input.designerDefaults == null ? current.designerDefaults : jsonBlob(input.designerDefaults),
    updated_at: new Date().toISOString(),
  };
  const { error } = await store().from("bible_preference").upsert(row, { onConflict: "user_id" });
  if (error) raise(error, "preferences write");
  return getPreferences(userId);
}

// ---------------------------------------------------------------------------
// 2. Sermon notes
// ---------------------------------------------------------------------------

export type SermonNote = {
  id: string;
  title: string;
  reference: string;
  notes: { Doctrine: string; Encouragement: string; Application: string };
  isCurrent: boolean;
  createdAt: string;
  updatedAt: string;
};

export const EMPTY_NOTES = { Doctrine: "", Encouragement: "", Application: "" } as const;

type SermonNoteRow = {
  id: string;
  title: string | null;
  reference: string | null;
  doctrine: string | null;
  encouragement: string | null;
  application: string | null;
  is_current: boolean | null;
  created_at: string;
  updated_at: string;
};

function shapeNote(row: SermonNoteRow): SermonNote {
  return {
    id: row.id,
    title: row.title || "Untitled note",
    reference: row.reference || "",
    notes: {
      Doctrine: row.doctrine || "",
      Encouragement: row.encouragement || "",
      Application: row.application || "",
    },
    isCurrent: Boolean(row.is_current),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function notesInput(value: unknown, fallback: Record<string, unknown> = {}) {
  const source = (value && typeof value === "object" ? value : fallback) as Record<string, unknown>;
  return {
    doctrine: text(source.Doctrine ?? source.doctrine, LIMITS.noteBody),
    encouragement: text(source.Encouragement ?? source.encouragement, LIMITS.noteBody),
    application: text(source.Application ?? source.application, LIMITS.noteBody),
  };
}

/** The autosaving scratch note behind the Notes tab. */
export async function getCurrentNote(userId: string): Promise<SermonNote | null> {
  const { data, error } = await store()
    .from("bible_sermon_note")
    .select("*")
    .eq("user_id", userId)
    .eq("is_current", true)
    .maybeSingle();
  if (error) raise(error, "note read");
  return data ? shapeNote(data as SermonNoteRow) : null;
}

export async function saveCurrentNote(
  userId: string,
  input: { notes?: unknown; title?: unknown; reference?: unknown },
): Promise<SermonNote> {
  const body = notesInput(input.notes, input as Record<string, unknown>);
  const existing = await getCurrentNote(userId);
  const row = {
    user_id: userId,
    title: text(input.title, LIMITS.title) || existing?.title || "Sermon notes",
    reference: text(input.reference, LIMITS.reference) || existing?.reference || "",
    ...body,
    is_current: true,
    updated_at: new Date().toISOString(),
  };

  const query = existing
    ? store().from("bible_sermon_note").update(row).eq("id", existing.id).eq("user_id", userId)
    : store().from("bible_sermon_note").insert(row);

  const { data, error } = await query.select("*").single();
  if (error) raise(error, "note write");
  return shapeNote(data as SermonNoteRow);
}

/** Files the scratch note away as a keepsake and clears the tab for the next sermon. */
export async function archiveCurrentNote(userId: string, title?: unknown): Promise<SermonNote | null> {
  const existing = await getCurrentNote(userId);
  if (!existing) return null;
  const { data, error } = await store()
    .from("bible_sermon_note")
    .update({
      is_current: false,
      title: text(title, LIMITS.title) || existing.title,
      updated_at: new Date().toISOString(),
    })
    .eq("id", existing.id)
    .eq("user_id", userId)
    .select("*")
    .single();
  if (error) raise(error, "note archive");
  return shapeNote(data as SermonNoteRow);
}

export async function listNotes(userId: string, limit = 50): Promise<SermonNote[]> {
  const { data, error } = await store()
    .from("bible_sermon_note")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(whole(limit, 1, 200, 50));
  if (error) raise(error, "notes list");
  return (data as SermonNoteRow[]).map(shapeNote);
}

export async function deleteNote(userId: string, id: string): Promise<boolean> {
  const { error } = await store()
    .from("bible_sermon_note")
    .delete()
    .eq("user_id", userId)
    .eq("id", text(id, LIMITS.id));
  if (error) raise(error, "note delete");
  return true;
}

// ---------------------------------------------------------------------------
// 3. Bookmarks and highlights
// ---------------------------------------------------------------------------

export type Bookmark = {
  id: string;
  book: string;
  chapter: number;
  verse: number;
  version: string;
  reference: string;
  snippet: string;
  colour: string;
  note: string;
  createdAt: string;
};

type BookmarkRow = {
  id: string;
  book: string;
  chapter: number;
  verse: number;
  version: string;
  reference: string | null;
  snippet: string | null;
  colour: string | null;
  note: string | null;
  created_at: string;
};

function shapeBookmark(row: BookmarkRow): Bookmark {
  return {
    id: row.id,
    book: row.book,
    chapter: row.chapter,
    verse: row.verse,
    version: row.version,
    reference: row.reference || "",
    snippet: row.snippet || "",
    colour: row.colour || "gold",
    note: row.note || "",
    createdAt: row.created_at,
  };
}

export async function listBookmarks(userId: string, limit = 200): Promise<Bookmark[]> {
  const { data, error } = await store()
    .from("bible_bookmark")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(whole(limit, 1, 500, 200));
  if (error) raise(error, "bookmarks list");
  return (data as BookmarkRow[]).map(shapeBookmark);
}

export async function saveBookmark(userId: string, input: Record<string, unknown>): Promise<Bookmark> {
  const book = text(input.book, LIMITS.book);
  if (!book) throw new Error("Choose a book before bookmarking a verse.");
  const row = {
    user_id: userId,
    book,
    chapter: whole(input.chapter, 1, 150, 1),
    verse: whole(input.verse, 0, 200, 0),
    version: text(input.version, LIMITS.version) || "KHMER_OLD_1954",
    reference: text(input.reference, LIMITS.reference),
    snippet: text(input.snippet ?? input.text, LIMITS.snippet),
    colour: text(input.colour ?? input.color, LIMITS.colour) || "gold",
    note: text(input.note, LIMITS.snippet),
  };
  const { data, error } = await store()
    .from("bible_bookmark")
    .upsert(row, { onConflict: "user_id,book,chapter,verse,version" })
    .select("*")
    .single();
  if (error) raise(error, "bookmark write");
  return shapeBookmark(data as BookmarkRow);
}

export async function deleteBookmark(userId: string, input: Record<string, unknown>): Promise<boolean> {
  const id = text(input.id, LIMITS.id);
  const base = store().from("bible_bookmark").delete().eq("user_id", userId);
  const { error } = id
    ? await base.eq("id", id)
    : await base
        .eq("book", text(input.book, LIMITS.book))
        .eq("chapter", whole(input.chapter, 1, 150, 1))
        .eq("verse", whole(input.verse, 0, 200, 0))
        .eq("version", text(input.version, LIMITS.version) || "KHMER_OLD_1954");
  if (error) raise(error, "bookmark delete");
  return true;
}

// ---------------------------------------------------------------------------
// 4. Saved Scripture Card designs
// ---------------------------------------------------------------------------

export type CardDesign = {
  id: string;
  title: string;
  reference: string;
  aspectRatio: string;
  design: Record<string, unknown>;
  thumbnailUrl: string;
  createdAt: string;
  updatedAt: string;
};

type CardDesignRow = {
  id: string;
  title: string | null;
  reference: string | null;
  aspect_ratio: string | null;
  design: Record<string, unknown> | null;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
};

function shapeCard(row: CardDesignRow): CardDesign {
  return {
    id: row.id,
    title: row.title || "Untitled card",
    reference: row.reference || "",
    aspectRatio: row.aspect_ratio || "1:1",
    design: row.design || {},
    thumbnailUrl: row.thumbnail_url || "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Only a Supabase-hosted or same-origin thumbnail is stored. A data: URL of a
 * 4K export would blow the row size, and an arbitrary remote URL would let a
 * saved card beacon out to a third party when the gallery renders.
 */
function safeThumbnail(value: unknown): string {
  const raw = text(value, 1_000);
  if (!raw) return "";
  if (raw.startsWith("/")) return raw;
  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== "https:") return "";
    if (parsed.hostname.endsWith(".supabase.co") || parsed.hostname === "faithin.co") return raw;
    return "";
  } catch {
    return "";
  }
}

export async function listCards(userId: string, limit = 100): Promise<CardDesign[]> {
  const { data, error } = await store()
    .from("bible_card_design")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(whole(limit, 1, 300, 100));
  if (error) raise(error, "cards list");
  return (data as CardDesignRow[]).map(shapeCard);
}

export async function saveCard(userId: string, input: Record<string, unknown>): Promise<CardDesign> {
  const design = jsonBlob(input.design ?? input.designer);
  const id = text(input.id, LIMITS.id);
  const row = {
    user_id: userId,
    title: text(input.title, LIMITS.title) || text(design.ref, LIMITS.title) || "Scripture card",
    reference: text(input.reference ?? design.ref, LIMITS.reference),
    aspect_ratio: text(input.aspectRatio ?? design.aspectRatio, 16) || "1:1",
    design,
    thumbnail_url: safeThumbnail(input.thumbnailUrl),
    updated_at: new Date().toISOString(),
  };

  const query = id
    ? store().from("bible_card_design").update(row).eq("id", id).eq("user_id", userId)
    : store().from("bible_card_design").insert(row);

  const { data, error } = await query.select("*").single();
  if (error) raise(error, "card write");
  return shapeCard(data as CardDesignRow);
}

export async function deleteCard(userId: string, id: string): Promise<boolean> {
  const { error } = await store()
    .from("bible_card_design")
    .delete()
    .eq("user_id", userId)
    .eq("id", text(id, LIMITS.id));
  if (error) raise(error, "card delete");
  return true;
}

// ---------------------------------------------------------------------------
// 5. Scripture Memory progress
// ---------------------------------------------------------------------------

export type MemoryProgress = {
  passageId: string;
  part: number;
  status: "learning" | "reviewing" | "memorised";
  mastery: number;
  hideLevel: number;
  reviewCount: number;
  bestWpm: number;
  bestAccuracy: number;
  lastMode: string;
  lastReviewAt: string;
};

type MemoryProgressRow = {
  passage_id: string;
  part: number | null;
  status: string | null;
  mastery: number | null;
  hide_level: number | null;
  review_count: number | null;
  best_wpm: number | null;
  best_accuracy: number | null;
  last_mode: string | null;
  last_review_at: string;
};

const MEMORY_STATUSES = new Set(["learning", "reviewing", "memorised"]);

function shapeProgress(row: MemoryProgressRow): MemoryProgress {
  const status = MEMORY_STATUSES.has(row.status || "") ? row.status! : "learning";
  return {
    passageId: row.passage_id,
    part: row.part || 0,
    status: status as MemoryProgress["status"],
    mastery: row.mastery || 0,
    hideLevel: row.hide_level || 0,
    reviewCount: row.review_count || 0,
    bestWpm: row.best_wpm || 0,
    bestAccuracy: row.best_accuracy || 0,
    lastMode: row.last_mode || "recite",
    lastReviewAt: row.last_review_at,
  };
}

export async function listMemoryProgress(userId: string): Promise<MemoryProgress[]> {
  const { data, error } = await store()
    .from("bible_memory_progress")
    .select("*")
    .eq("user_id", userId)
    .order("last_review_at", { ascending: false })
    .limit(500);
  if (error) raise(error, "memory progress list");
  return (data as MemoryProgressRow[]).map(shapeProgress);
}

export async function saveMemoryProgress(
  userId: string,
  input: Record<string, unknown>,
): Promise<MemoryProgress> {
  const passageId = text(input.passageId ?? input.passage_id ?? input.id, LIMITS.id);
  if (!passageId) throw new Error("Choose a passage before saving progress.");

  const { data: existing } = await store()
    .from("bible_memory_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("passage_id", passageId)
    .maybeSingle();
  const previous = existing ? shapeProgress(existing as MemoryProgressRow) : null;

  const requestedStatus = text(input.status, 20);
  const row = {
    user_id: userId,
    passage_id: passageId,
    part: whole(input.part, 0, 10, previous?.part ?? 0),
    status: MEMORY_STATUSES.has(requestedStatus) ? requestedStatus : previous?.status || "learning",
    mastery: whole(input.mastery, 0, 100, previous?.mastery ?? 0),
    hide_level: whole(input.hideLevel, 0, 100, previous?.hideLevel ?? 0),
    // A review is counted server-side so a replayed request cannot inflate it
    // by an arbitrary amount.
    review_count: (previous?.reviewCount ?? 0) + (input.reviewed === false ? 0 : 1),
    best_wpm: Math.max(previous?.bestWpm ?? 0, whole(input.wpm, 0, 400, 0)),
    best_accuracy: Math.max(previous?.bestAccuracy ?? 0, whole(input.accuracy, 0, 100, 0)),
    last_mode: text(input.mode ?? input.lastMode, LIMITS.tool) || previous?.lastMode || "recite",
    last_review_at: new Date().toISOString(),
  };

  const { data, error } = await store()
    .from("bible_memory_progress")
    .upsert(row, { onConflict: "user_id,passage_id" })
    .select("*")
    .single();
  if (error) raise(error, "memory progress write");
  return shapeProgress(data as MemoryProgressRow);
}

// ---------------------------------------------------------------------------
// 6. Typing scores
// ---------------------------------------------------------------------------

export type TypingScore = {
  id: string;
  passageId: string;
  passage: string;
  wpm: number;
  accuracy: number;
  durationMs: number;
  characters: number;
  createdAt: string;
};

type TypingScoreRow = {
  id: string;
  passage_id: string | null;
  passage: string | null;
  wpm: number | null;
  accuracy: number | null;
  duration_ms: number | null;
  characters: number | null;
  created_at: string;
};

function shapeScore(row: TypingScoreRow): TypingScore {
  return {
    id: row.id,
    passageId: row.passage_id || "",
    passage: row.passage || "",
    wpm: row.wpm || 0,
    accuracy: row.accuracy || 0,
    durationMs: row.duration_ms || 0,
    characters: row.characters || 0,
    createdAt: row.created_at,
  };
}

export async function listTypingScores(userId: string, limit = 50): Promise<TypingScore[]> {
  const { data, error } = await store()
    .from("bible_typing_score")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(whole(limit, 1, 200, 50));
  if (error) raise(error, "typing scores list");
  return (data as TypingScoreRow[]).map(shapeScore);
}

export async function saveTypingScore(
  userId: string,
  input: Record<string, unknown>,
): Promise<{ score: TypingScore; personalBest: boolean }> {
  const row = {
    user_id: userId,
    passage_id: text(input.passageId ?? input.passage_id, LIMITS.id),
    passage: text(input.passage ?? input.reference, LIMITS.passage),
    wpm: whole(input.wpm ?? input.score, 0, 400, 0),
    accuracy: whole(input.accuracy, 0, 100, 100),
    duration_ms: whole(input.durationMs ?? input.duration_ms, 0, 86_400_000, 0),
    characters: whole(input.characters, 0, 100_000, 0),
  };

  const previous = await listTypingScores(userId, 200);
  const bestSoFar = previous.reduce((best, item) => Math.max(best, item.wpm), 0);

  const { data, error } = await store().from("bible_typing_score").insert(row).select("*").single();
  if (error) raise(error, "typing score write");

  const score = shapeScore(data as TypingScoreRow);
  return { score, personalBest: score.wpm > bestSoFar };
}

// ---------------------------------------------------------------------------
// 7. Reading progress + streak
// ---------------------------------------------------------------------------

export type ReadingEntry = {
  readOn: string;
  book: string;
  chapter: number;
  version: string;
  reference: string;
  source: string;
};

type ReadingRow = {
  read_on: string;
  book: string | null;
  chapter: number | null;
  version: string | null;
  reference: string | null;
  source: string | null;
};

function shapeReading(row: ReadingRow): ReadingEntry {
  return {
    readOn: row.read_on,
    book: row.book || "",
    chapter: row.chapter || 0,
    version: row.version || "",
    reference: row.reference || "",
    source: row.source || "reader",
  };
}

function utcDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Counts consecutive days ending today (or yesterday, so a streak is not lost
 * before the member has opened the app that day).
 */
export function streakFromDays(days: string[], today = utcDay(new Date())): number {
  const unique = [...new Set(days)].sort().reverse();
  if (!unique.length) return 0;

  const dayBefore = (iso: string) => {
    const date = new Date(`${iso}T00:00:00Z`);
    date.setUTCDate(date.getUTCDate() - 1);
    return utcDay(date);
  };

  let cursor = unique[0] === today ? today : unique[0] === dayBefore(today) ? dayBefore(today) : "";
  if (!cursor) return 0;

  let streak = 0;
  for (const day of unique) {
    if (day !== cursor) break;
    streak += 1;
    cursor = dayBefore(cursor);
  }
  return streak;
}

export async function recordReading(
  userId: string,
  input: Record<string, unknown>,
): Promise<{ entry: ReadingEntry; streak: number }> {
  const row = {
    user_id: userId,
    read_on: utcDay(new Date()),
    book: text(input.book, LIMITS.book),
    chapter: whole(input.chapter, 0, 150, 0),
    version: text(input.version, LIMITS.version),
    reference: text(input.reference, LIMITS.reference),
    source: text(input.source, LIMITS.tool) || "reader",
  };
  const { data, error } = await store()
    .from("bible_reading_progress")
    .upsert(row, { onConflict: "user_id,read_on,book,chapter,source" })
    .select("*")
    .single();
  if (error) raise(error, "reading write");
  return { entry: shapeReading(data as ReadingRow), streak: await getStreak(userId) };
}

export async function listReading(userId: string, limit = 120): Promise<ReadingEntry[]> {
  const { data, error } = await store()
    .from("bible_reading_progress")
    .select("*")
    .eq("user_id", userId)
    .order("read_on", { ascending: false })
    .limit(whole(limit, 1, 400, 120));
  if (error) raise(error, "reading list");
  return (data as ReadingRow[]).map(shapeReading);
}

export async function getStreak(userId: string): Promise<number> {
  const entries = await listReading(userId, 400);
  return streakFromDays(entries.map((entry) => entry.readOn));
}

// ---------------------------------------------------------------------------
// 8. Concordance history
// ---------------------------------------------------------------------------

export async function recordConcordanceSearch(
  userId: string,
  query: unknown,
  results: unknown,
): Promise<boolean> {
  const cleaned = text(query, LIMITS.query);
  if (!cleaned) return false;
  const { error } = await store().from("bible_concordance_history").insert({
    user_id: userId,
    query: cleaned,
    results: whole(results, 0, 100_000, 0),
  });
  if (error) raise(error, "concordance history write");
  return true;
}

export async function listConcordanceHistory(userId: string, limit = 20) {
  const { data, error } = await store()
    .from("bible_concordance_history")
    .select("query, results, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(whole(limit, 1, 100, 20));
  if (error) raise(error, "concordance history list");
  return (data as { query: string; results: number; created_at: string }[]).map((row) => ({
    query: row.query,
    results: row.results,
    createdAt: row.created_at,
  }));
}

// ---------------------------------------------------------------------------
// 9. Studio dashboard aggregate
// ---------------------------------------------------------------------------

export type StudioDashboard = {
  preferences: BiblePreferences;
  currentNote: SermonNote | null;
  notes: SermonNote[];
  cards: CardDesign[];
  bookmarks: Bookmark[];
  memory: MemoryProgress[];
  scores: TypingScore[];
  recentSearches: { query: string; results: number; createdAt: string }[];
  stats: {
    savedCards: number;
    savedNotes: number;
    bookmarks: number;
    passagesMemorised: number;
    passagesInProgress: number;
    bestWpm: number;
    averageAccuracy: number;
    chaptersRead: number;
    streak: number;
  };
};

export async function getStudioDashboard(userId: string): Promise<StudioDashboard> {
  const [preferences, currentNote, notes, cards, bookmarks, memory, scores, reading, recentSearches] =
    await Promise.all([
      getPreferences(userId),
      getCurrentNote(userId),
      listNotes(userId, 30),
      listCards(userId, 60),
      listBookmarks(userId, 200),
      listMemoryProgress(userId),
      listTypingScores(userId, 50),
      listReading(userId, 400),
      listConcordanceHistory(userId, 10),
    ]);

  const accuracies = scores.map((score) => score.accuracy);
  return {
    preferences,
    currentNote,
    notes,
    cards,
    bookmarks,
    memory,
    scores,
    recentSearches,
    stats: {
      savedCards: cards.length,
      savedNotes: notes.filter((note) => !note.isCurrent).length,
      bookmarks: bookmarks.length,
      passagesMemorised: memory.filter((item) => item.status === "memorised").length,
      passagesInProgress: memory.filter((item) => item.status !== "memorised").length,
      bestWpm: scores.reduce((best, score) => Math.max(best, score.wpm), 0),
      averageAccuracy: accuracies.length
        ? Math.round(accuracies.reduce((sum, value) => sum + value, 0) / accuracies.length)
        : 0,
      chaptersRead: new Set(reading.map((entry) => `${entry.book} ${entry.chapter}`)).size,
      streak: streakFromDays(reading.map((entry) => entry.readOn)),
    },
  };
}
