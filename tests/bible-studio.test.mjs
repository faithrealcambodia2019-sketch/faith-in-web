import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  BibleStoreUnavailable,
  DEFAULT_PREFERENCES,
  EMPTY_NOTES,
  isBibleStoreConfigured,
  getPreferences,
  saveCurrentNote,
  streakFromDays,
  text,
  whole,
} from '../lib/bible-store.ts';

// ---------------------------------------------------------------------------
// Input hygiene
// ---------------------------------------------------------------------------

test('Bible Studio: text() trims, strips control characters, and caps length', () => {
  assert.equal(text('  Doctrine notes  ', 100), 'Doctrine notes');
  assert.equal(text('a\u0001b\u001fc', 100), 'abc', 'control characters are removed');
  assert.equal(text('line one\nline two', 100), 'line one\nline two', 'newlines survive');
  assert.equal(text('word one two', 100), 'word one two', 'ordinary spaces survive');
  assert.equal(text('abcdef', 3), 'abc');
  assert.equal(text(null, 10), '');
  assert.equal(text(undefined, 10), '');

  // Khmer script must pass through untouched — this is a Khmer-first product.
  const khmer = 'ព្រះយេហូវ៉ាទ្រង់ជាអ្នកគង្វាលខ្ញុំ';
  assert.equal(text(khmer, 200), khmer);
});

test('Bible Studio: whole() clamps to range and falls back on nonsense', () => {
  assert.equal(whole('42', 0, 100), 42);
  assert.equal(whole(999, 0, 100), 100, 'clamped to max');
  assert.equal(whole(-5, 0, 100), 0, 'clamped to min');
  assert.equal(whole('not a number', 0, 100, 7), 7, 'falls back');
  assert.equal(whole(3.9, 0, 100), 3, 'truncated, not rounded');
});

// ---------------------------------------------------------------------------
// Reading streak
// ---------------------------------------------------------------------------

test('Bible Studio: reading streak counts consecutive days', () => {
  const today = '2026-09-02';
  assert.equal(streakFromDays([], today), 0, 'no reading is no streak');
  assert.equal(streakFromDays([today], today), 1);
  assert.equal(streakFromDays(['2026-09-02', '2026-09-01', '2026-08-31'], today), 3);
  assert.equal(
    streakFromDays(['2026-09-02', '2026-09-02', '2026-09-01'], today),
    2,
    'a duplicated day counts once',
  );
  assert.equal(
    streakFromDays(['2026-09-02', '2026-08-31'], today),
    1,
    'a gap ends the streak',
  );
  assert.equal(
    streakFromDays(['2026-09-01', '2026-08-31'], today),
    2,
    'yesterday still counts, so the streak is not lost before today is used',
  );
  assert.equal(
    streakFromDays(['2026-08-30', '2026-08-29'], today),
    0,
    'a streak that ended two days ago is over',
  );
});

// ---------------------------------------------------------------------------
// Degrading safely when the backend is not configured
// ---------------------------------------------------------------------------

test('Bible Studio: an unconfigured deployment reports itself rather than crashing', async () => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_SECRET_KEY;

  try {
    assert.equal(isBibleStoreConfigured(), false);
    await assert.rejects(() => getPreferences('uid-1'), BibleStoreUnavailable);
    await assert.rejects(() => saveCurrentNote('uid-1', { notes: EMPTY_NOTES }), BibleStoreUnavailable);
  } finally {
    if (url) process.env.SUPABASE_URL = url;
    if (key) process.env.SUPABASE_SECRET_KEY = key;
  }
});

test('Bible Studio: defaults are sane for a member with nothing saved', () => {
  assert.equal(DEFAULT_PREFERENCES.primaryVersion, 'KHMER_OLD_1954', 'Khmer stays the default');
  assert.equal(DEFAULT_PREFERENCES.book, 'John');
  assert.deepEqual(
    { ...EMPTY_NOTES },
    { Doctrine: '', Encouragement: '', Application: '' },
    'the three-part sermon framework is preserved',
  );
});

// ---------------------------------------------------------------------------
// The Bible Studio page keeps every function it had
// ---------------------------------------------------------------------------

const biblePage = readFileSync(new URL('../public/faithin-app/bible.html', import.meta.url), 'utf8');

test('Bible Studio: the page loads the persistence client', () => {
  assert.match(
    biblePage,
    /faithin-bible-store\.js/,
    'bible.html must load the store client',
  );
  const storeTag = biblePage.indexOf('faithin-bible-store.js');
  const backendTag = biblePage.indexOf('faith-in-backend.js');
  assert.ok(
    backendTag > -1 && storeTag > backendTag,
    'the store must load after faith-in-backend.js, which provides window.cvIdToken',
  );
});

test('Bible Studio: no existing tool function was removed', () => {
  // Every window.* entry point the Studio shipped with before this backend
  // existed. The brief was explicitly "do not remove any functions".
  const required = [
    'switchTool',
    'saveSermonNotesAction',
    'shareCardToFaithInFeed',
    'copyVerseText',
    'designSingleVerse',
    'sendChapterToDesigner',
    'designDailyVerse',
    'copyDailyVerse',
    'playAudioTrack',
    'searchConcordanceWord',
    'downloadCardImage',
    'randomizeCardStyle',
    'copyCardImageToClipboard',
    'selectCardBg',
    'setDesignerRatio',
    'setDesignerBgCategory',
    'setDesignerFontEnglish',
    'setDesignerTextAlign',
    'setDesignerAccentColor',
    'setDesignerBorderStyle',
    'setDesignerBlur',
    'filterMemoryPart',
    'selectMemoryPassage',
    'setMemoryMode',
    'setMemoryHideLevel',
    'revealSingleWord',
    'revealAllWords',
    'toggleFlashcard',
    'prevMemoryPassage',
    'nextMemoryPassage',
    'clearMemorySearch',
    'copyMemoryText',
    'designMemoryCard',
    'postMemoryToFeed',
  ];
  for (const name of required) {
    assert.match(biblePage, new RegExp(`window\\.${name}\\s*=`), `window.${name} must still exist`);
  }
});

test('Bible Studio: the new persistence entry points are wired up', () => {
  for (const name of [
    'saveCurrentCard',
    'openSavedCard',
    'deleteSavedCard',
    'toggleCardGallery',
    'toggleVerseBookmark',
    'markPassageMemorised',
    'archiveSermonNotesAction',
    'onSermonNoteInput',
  ]) {
    assert.match(biblePage, new RegExp(`window\\.${name}\\s*=`), `window.${name} should be defined`);
  }
  assert.match(biblePage, /oninput="window\.onSermonNoteInput\(\)"/, 'notes autosave on typing');
});

// ---------------------------------------------------------------------------
// Browser store client
// ---------------------------------------------------------------------------

const storeClient = readFileSync(
  new URL('../public/faithin-app/assets/faithin-bible-store.js', import.meta.url),
  'utf8',
);

test('Bible Studio: the store client sends the member token and falls back locally', () => {
  assert.match(storeClient, /Authorization/, 'requests must carry the Firebase ID token');
  assert.match(storeClient, /window\.cvIdToken/, 'the token comes from the Firebase backend module');
  assert.match(storeClient, /localStorage/, 'a local mirror keeps the tools working offline');
  assert.match(
    storeClient,
    /faithin_sermon_notes/,
    'the pre-backend notes key is honoured so nobody loses existing work',
  );
  assert.doesNotMatch(
    storeClient,
    /SUPABASE_SECRET_KEY|service_role/,
    'no server credential may ever reach the browser bundle',
  );
});

// ---------------------------------------------------------------------------
// Migration
// ---------------------------------------------------------------------------

const migration = readFileSync(
  new URL('../supabase/migrations/0001_bible_studio.sql', import.meta.url),
  'utf8',
);

test('Bible Studio: the migration is idempotent and locked down', () => {
  const tables = [
    'bible_preference',
    'bible_sermon_note',
    'bible_bookmark',
    'bible_card_design',
    'bible_memory_progress',
    'bible_typing_score',
    'bible_reading_progress',
    'bible_concordance_history',
  ];
  for (const table of tables) {
    assert.match(
      migration,
      new RegExp(`create table if not exists public\\.${table}`),
      `${table} must be created idempotently`,
    );
    assert.match(
      migration,
      new RegExp(`alter table public\\.${table}\\s+enable row level security`),
      `${table} must have row level security enabled`,
    );
  }
  assert.doesNotMatch(
    migration,
    /create policy/i,
    'no permissive policy: only the server service role may touch these tables',
  );
});
