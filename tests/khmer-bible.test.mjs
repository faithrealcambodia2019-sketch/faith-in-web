import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// ---------------------------------------------------------------------------
// The central guarantee: Khmer means Khmer
// ---------------------------------------------------------------------------
//
// Faith In used to answer a request for the Khmer Old Version 1954 with
// English World English Bible verses stamped `version: "KHMER_OLD_1954"`.
// A Khmer reader opening any chapter outside the ~13 seeded ones was shown
// English and told it was the 1954 Khmer Bible. These tests exist so that
// cannot come back.

const serviceSource = readFileSync(new URL('../lib/bible-service.ts', import.meta.url), 'utf8');

test('Khmer Bible: the Khmer path never falls back to an English translation', () => {
  const start = serviceSource.indexOf('// 1. Khmer Version Resolution');
  const end = serviceSource.indexOf('// 2. English / Public Domain Translations');
  assert.ok(start > -1 && end > start, 'the Khmer resolution block should still exist');

  const khmerBlock = serviceSource.slice(start, end);
  assert.doesNotMatch(
    khmerBlock,
    /fetchEnglishChapter/,
    'the Khmer branch must never call the English chapter fetcher',
  );
  assert.doesNotMatch(
    khmerBlock,
    /bilingual-sync/,
    'the bilingual-sync fallback served English labelled as Khmer and must stay gone',
  );
  assert.match(
    khmerBlock,
    /status: "setup_required"/,
    'an unavailable Khmer chapter must report setup_required',
  );
});

test('Khmer Bible: the licensed API key is read under the documented name', () => {
  assert.match(
    serviceSource,
    /process\.env\.YVP_APP_KEY/,
    'must read YVP_APP_KEY — the name .env.example, /api/bible/versions and the tests all use',
  );

  // The older names stay accepted so an existing deployment does not break.
  assert.match(serviceSource, /CV_YOUVERSION_APP_KEY/, 'legacy name kept as a fallback');
  assert.match(serviceSource, /YOUVERSION_APP_KEY/, 'legacy name kept as a fallback');

  const keyLine = serviceSource.slice(
    serviceSource.indexOf('const youversionKey ='),
    serviceSource.indexOf('const youversionKey =') + 220,
  );
  assert.ok(
    keyLine.indexOf('YVP_APP_KEY') < keyLine.indexOf('CV_YOUVERSION_APP_KEY'),
    'YVP_APP_KEY must be tried first',
  );
});

test('Khmer Bible: the attribution the publisher requires is present', () => {
  assert.match(serviceSource, /Bible Society in Cambodia/, 'the copyright holder must be credited');
  assert.match(serviceSource, /KHMER_1954_ATTRIBUTION/, 'attribution is exported for the reader');
});

// ---------------------------------------------------------------------------
// Behaviour, with the store and API both absent
// ---------------------------------------------------------------------------

test('Khmer Bible: an unconnected deployment reports unavailable, not English', async () => {
  const saved = {
    yvp: process.env.YVP_APP_KEY,
    cv: process.env.CV_YOUVERSION_APP_KEY,
    yv: process.env.YOUVERSION_APP_KEY,
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_SECRET_KEY,
  };
  delete process.env.YVP_APP_KEY;
  delete process.env.CV_YOUVERSION_APP_KEY;
  delete process.env.YOUVERSION_APP_KEY;
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_SECRET_KEY;

  try {
    const { getBibleChapter } = await import('../lib/bible-service.ts');

    // Genesis 12 is not among the seeded verses, so nothing can supply it.
    const chapter = await getBibleChapter('Genesis', 12, 'KHMER_OLD_1954');
    assert.equal(chapter.version, 'KHMER_OLD_1954');
    assert.equal(chapter.status, 'setup_required');
    assert.equal(chapter.items.length, 0, 'no verses rather than the wrong verses');
    assert.ok(chapter.message, 'the member is told why');
    assert.match(chapter.readUrl || '', /bible\.com\/versions\/1270/, 'links to the publisher');

    // A seeded chapter still reads, and reads in Khmer.
    const john1 = await getBibleChapter('John', 1, 'KHMER_OLD_1954');
    assert.equal(john1.status, 'ready');
    assert.ok(john1.items.length > 0, 'the embedded Khmer verses still serve');
    assert.match(
      john1.items[0].text,
      /[ក-៿]/,
      'a chapter reported as Khmer must actually contain Khmer script',
    );
  } finally {
    for (const [name, value] of [
      ['YVP_APP_KEY', saved.yvp],
      ['CV_YOUVERSION_APP_KEY', saved.cv],
      ['YOUVERSION_APP_KEY', saved.yv],
      ['SUPABASE_URL', saved.url],
      ['SUPABASE_SECRET_KEY', saved.key],
    ]) {
      if (value !== undefined) process.env[name] = value;
    }
  }
});

test('Khmer Bible: English versions are unaffected and still labelled honestly', async () => {
  const { getBibleChapter } = await import('../lib/bible-service.ts');
  const result = await getBibleChapter('John', 1, 'KJV');
  assert.equal(result.version, 'KJV');
  assert.match(result.versionName, /King James/);
});

// ---------------------------------------------------------------------------
// Storage layer
// ---------------------------------------------------------------------------

test('Khmer Bible: the scripture store degrades quietly when unconfigured', async () => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_SECRET_KEY;

  try {
    const store = await import('../lib/scripture-store.ts');
    assert.equal(store.isScriptureStoreConfigured(), false);
    assert.equal(await store.getStoredChapter('KHMER_OLD_1954', 'John', 1), null);
    assert.equal(await store.getVersion('KHMER_OLD_1954'), null);
    assert.deepEqual(await store.searchStored('KHMER_OLD_1954', 'ព្រះ'), []);
    assert.equal(await store.writeVerses('KHMER_OLD_1954', []), 0);
  } finally {
    if (url) process.env.SUPABASE_URL = url;
    if (key) process.env.SUPABASE_SECRET_KEY = key;
  }
});

// ---------------------------------------------------------------------------
// Migration
// ---------------------------------------------------------------------------

const migration = readFileSync(
  new URL('../supabase/migrations/0002_bible_scripture.sql', import.meta.url),
  'utf8',
);

test('Khmer Bible: the scripture migration is idempotent, locked down, and records rights', () => {
  for (const table of ['bible_version', 'bible_verse', 'bible_import_run']) {
    assert.match(migration, new RegExp(`create table if not exists public\\.${table}`));
    assert.match(migration, new RegExp(`alter table public\\.${table}\\s+enable row level security`));
  }
  assert.doesNotMatch(migration, /create policy/i, 'service role only — Scripture text is licensed');
  assert.match(migration, /licence_holder/, 'each version records who holds the rights');
  assert.match(migration, /Bible Society in Cambodia/, 'the 1954 rights holder is seeded');
  assert.match(migration, /to_tsvector\('simple'/, 'Khmer search must not use an English stemmer');
});

// ---------------------------------------------------------------------------
// Importer
// ---------------------------------------------------------------------------

const importer = readFileSync(
  new URL('../scripts/import-khmer-bible.mjs', import.meta.url),
  'utf8',
);

test('Khmer Bible: the importer refuses to run without a licence acknowledgement', () => {
  assert.match(importer, /--i-have-a-licence/, 'an explicit licence flag is required');
  assert.match(importer, /if \(!options\.licensed\)/, 'and it is actually enforced');
  assert.match(importer, /Bible Society in Cambodia/, 'the rights holder is named in the refusal');
  assert.match(importer, /info@biblecambodia\.org/, 'and how to reach them');
});

test('Khmer Bible: the importer is resumable and rate limited', () => {
  assert.match(importer, /--from=/, 'an interrupted run can resume');
  assert.match(importer, /--dry-run/, 'can be rehearsed without writing');
  assert.match(importer, /429/, 'handles rate limiting');
  assert.match(importer, /onConflict|upsert|writeVerses/, 'writes are idempotent upserts');
});

// ---------------------------------------------------------------------------
// Reader
// ---------------------------------------------------------------------------

const biblePage = readFileSync(new URL('../public/faithin-app/bible.html', import.meta.url), 'utf8');

test('Khmer Bible: the reader shows an honest notice instead of "No verses found"', () => {
  assert.match(biblePage, /renderChapterUnavailable/, 'the notice renderer exists and is used');
  assert.doesNotMatch(
    biblePage,
    /No verses found\./,
    'the bare empty state was replaced by the explanatory panel',
  );
  assert.match(biblePage, /window\.setBibleVersion/, 'the member can choose another translation');
  assert.match(biblePage, /chapterStatus/, 'availability is tracked in state');
});
