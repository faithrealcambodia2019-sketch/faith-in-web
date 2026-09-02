-- =============================================================================
-- Faith In — Scripture text store (Khmer Old Version 1954 and friends)
-- =============================================================================
--
-- Run this in the Supabase SQL Editor of the same project as
-- 0001_bible_studio.sql. No new environment variables are required.
--
-- What this is for
-- ----------------
-- Chapter text was being fetched from an external API on every single read,
-- and the Khmer 1954 text was not stored anywhere at all — only about sixty
-- verses were hard-coded in lib/bible-service.ts. These tables hold complete
-- Scripture text so a chapter is served from Faith In's own database in one
-- indexed query, with no third-party call on the hot path.
--
-- Licensing
-- ---------
-- These tables are storage; they grant no rights to any text placed in them.
-- The Khmer Old Version 1954 (ព្រះគម្ពីរបរិសុទ្ធ ១៩៥៤) is published by the
-- Bible Society in Cambodia and is NOT public domain. Import it only through
-- a licence you hold — the YouVersion Platform publisher licence for Bible
-- 1270, or a data licence direct from the Bible Society (info@biblecambodia.org).
-- `bible_version.licence` and `licence_holder` record which licence each text
-- was imported under, so this can always be answered later.
--
-- This script is idempotent.
-- =============================================================================

create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. Version catalogue — one row per translation held in bible_verse
-- -----------------------------------------------------------------------------
create table if not exists public.bible_version (
  code            text primary key,
  name            text        not null,
  native_name     text        not null default '',
  language        text        not null default 'km',
  language_label  text        not null default '',
  -- Provenance and rights. Never leave these blank for a licensed text.
  source          text        not null default '',
  source_id       text        not null default '',
  licence         text        not null default '',
  licence_holder  text        not null default '',
  attribution     text        not null default '',
  attribution_url text        not null default '',
  -- Import state
  total_verses    integer     not null default 0,
  total_chapters  integer     not null default 0,
  is_complete     boolean     not null default false,
  imported_at     timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- 2. Verse text
-- -----------------------------------------------------------------------------
-- Keyed by (version, book, chapter, verse). `book` is the canonical English
-- book name used throughout lib/bible-service.ts, so a lookup needs no mapping
-- table. A whole chapter is one index scan.
create table if not exists public.bible_verse (
  version    text        not null references public.bible_version(code) on delete cascade,
  book       text        not null,
  chapter    integer     not null,
  verse      integer     not null,
  text       text        not null,
  updated_at timestamptz not null default now(),
  primary key (version, book, chapter, verse)
);

-- Chapter reads: the primary key already covers (version, book, chapter, …),
-- so this index exists for the coverage queries the importer and the admin
-- endpoint run.
create index if not exists bible_verse_chapter_idx
  on public.bible_verse (version, book, chapter);

-- Khmer full-text search. `simple` is deliberate: Postgres has no Khmer stemmer,
-- and the simple configuration tokenises without English stemming rules that
-- would mangle Khmer strings.
create index if not exists bible_verse_text_idx
  on public.bible_verse using gin (to_tsvector('simple', text));

-- -----------------------------------------------------------------------------
-- 3. Import runs — an audit trail for what was loaded, when, and from where
-- -----------------------------------------------------------------------------
create table if not exists public.bible_import_run (
  id             uuid        primary key default gen_random_uuid(),
  version        text        not null,
  source         text        not null default '',
  status         text        not null default 'running',
  chapters_done  integer     not null default 0,
  chapters_total integer     not null default 0,
  verses_written integer     not null default 0,
  last_book      text        not null default '',
  last_chapter   integer     not null default 0,
  error          text        not null default '',
  started_at     timestamptz not null default now(),
  finished_at    timestamptz,
  constraint bible_import_run_status_check
    check (status in ('running', 'complete', 'failed', 'cancelled'))
);

create index if not exists bible_import_run_version_idx
  on public.bible_import_run (version, started_at desc);

-- -----------------------------------------------------------------------------
-- 4. Coverage helper — which chapters are actually present
-- -----------------------------------------------------------------------------
-- Used by the reader to decide between serving text and showing the honest
-- "not available yet" panel, without pulling verse rows to find out.
create or replace view public.bible_chapter_coverage as
select
  version,
  book,
  chapter,
  count(*)::integer as verses
from public.bible_verse
group by version, book, chapter;

-- -----------------------------------------------------------------------------
-- Lock down to the service role
-- -----------------------------------------------------------------------------
-- Scripture text is licensed content. RLS on with no policies means the anon
-- and authenticated keys cannot read these tables directly — the text is only
-- ever served through the Next.js route, which is where attribution and any
-- licence conditions are applied.
alter table public.bible_version    enable row level security;
alter table public.bible_verse      enable row level security;
alter table public.bible_import_run enable row level security;

revoke all on public.bible_version    from anon, authenticated;
revoke all on public.bible_verse      from anon, authenticated;
revoke all on public.bible_import_run from anon, authenticated;
revoke all on public.bible_chapter_coverage from anon, authenticated;

-- -----------------------------------------------------------------------------
-- 5. Seed the version catalogue
-- -----------------------------------------------------------------------------
-- Rows are created empty. Nothing is readable until an importer has written
-- verses under a licence you hold.
insert into public.bible_version
  (code, name, native_name, language, language_label, source, source_id,
   licence, licence_holder, attribution, attribution_url)
values
  ('KHMER_OLD_1954',
   'Khmer Old Version 1954',
   'ព្រះគម្ពីរបរិសុទ្ធ ១៩៥៤ (ពគប)',
   'km',
   'ភាសាខ្មែរ (Khmer)',
   'youversion',
   '1270',
   'Publisher licence required — not public domain',
   'Bible Society in Cambodia',
   'ព្រះគម្ពីរបរិសុទ្ធ ១៩៥៤ © Bible Society in Cambodia',
   'https://www.bible.com/versions/1270'),
  ('KJV',
   'King James Version',
   'King James Version',
   'en',
   'English',
   'public-domain',
   'kjv',
   'Public domain',
   '',
   'King James Version (public domain)',
   ''),
  ('WEB',
   'World English Bible',
   'World English Bible',
   'en',
   'English',
   'public-domain',
   'web',
   'Public domain',
   '',
   'World English Bible (public domain)',
   '')
on conflict (code) do nothing;
