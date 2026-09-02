-- =============================================================================
-- Faith In — Bible Studio persistent backend
-- =============================================================================
--
-- Run this once in the Supabase SQL Editor of the SAME project that already
-- hosts the "faithin-media" storage bucket. No new environment variables are
-- required: the server talks to these tables with the SUPABASE_URL and
-- SUPABASE_SECRET_KEY that the media upload route already uses.
--
-- Identity model
-- --------------
-- Sign-in stays on Firebase Authentication. Every row is keyed by the Firebase
-- uid (the `sub` claim of the ID token), stored as text. The Next.js route
-- verifies that token against Google's public signing certificates before it
-- ever touches these tables, so `user_id` is never taken from the client.
--
-- Authorisation
-- -------------
-- Row Level Security is ENABLED with no permissive policies. That denies the
-- anon and authenticated Supabase keys entirely; only the service role key
-- held by the server can read or write. The browser never gets a direct
-- connection to these tables.
--
-- This script is idempotent — running it twice is safe.
-- =============================================================================

create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. Reader + Studio preferences (one row per member)
-- -----------------------------------------------------------------------------
create table if not exists public.bible_preference (
  user_id           text primary key,
  primary_version   text        not null default 'KHMER_OLD_1954',
  secondary_version text        not null default 'KJV',
  book              text        not null default 'John',
  chapter           integer     not null default 3,
  font_size         integer     not null default 16,
  active_tool       text        not null default 'reader',
  designer_defaults jsonb       not null default '{}'::jsonb,
  updated_at        timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- 2. Sermon Notes Planner (Doctrine / Encouragement / Application)
-- -----------------------------------------------------------------------------
create table if not exists public.bible_sermon_note (
  id            uuid        primary key default gen_random_uuid(),
  user_id       text        not null,
  title         text        not null default 'Untitled note',
  reference     text        not null default '',
  doctrine      text        not null default '',
  encouragement text        not null default '',
  application   text        not null default '',
  is_current    boolean     not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists bible_sermon_note_user_idx
  on public.bible_sermon_note (user_id, updated_at desc);

-- Exactly one "current" scratch note per member, so the Notes tab can
-- autosave without creating a new row on every keystroke.
create unique index if not exists bible_sermon_note_current_idx
  on public.bible_sermon_note (user_id)
  where is_current;

-- -----------------------------------------------------------------------------
-- 3. Verse bookmarks and highlights
-- -----------------------------------------------------------------------------
create table if not exists public.bible_bookmark (
  id         uuid        primary key default gen_random_uuid(),
  user_id    text        not null,
  book       text        not null,
  chapter    integer     not null,
  verse      integer     not null default 0,
  version    text        not null default 'KHMER_OLD_1954',
  reference  text        not null default '',
  snippet    text        not null default '',
  colour     text        not null default 'gold',
  note       text        not null default '',
  created_at timestamptz not null default now()
);

create unique index if not exists bible_bookmark_unique_idx
  on public.bible_bookmark (user_id, book, chapter, verse, version);

create index if not exists bible_bookmark_user_idx
  on public.bible_bookmark (user_id, created_at desc);

-- -----------------------------------------------------------------------------
-- 4. Saved Scripture Card designs (Designer Pro Studio)
-- -----------------------------------------------------------------------------
-- `design` holds the full designer state object: text, reference, wallpaper,
-- fonts, colours, aspect ratio, overlay, blur and branding. Storing it as
-- jsonb means new designer controls persist without another migration.
create table if not exists public.bible_card_design (
  id            uuid        primary key default gen_random_uuid(),
  user_id       text        not null,
  title         text        not null default 'Untitled card',
  reference     text        not null default '',
  aspect_ratio  text        not null default '1:1',
  design        jsonb       not null default '{}'::jsonb,
  thumbnail_url text        not null default '',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists bible_card_design_user_idx
  on public.bible_card_design (user_id, updated_at desc);

-- -----------------------------------------------------------------------------
-- 5. CPTI Scripture Memory progress
-- -----------------------------------------------------------------------------
create table if not exists public.bible_memory_progress (
  id             uuid        primary key default gen_random_uuid(),
  user_id        text        not null,
  passage_id     text        not null,
  part           integer     not null default 0,
  status         text        not null default 'learning',
  mastery        integer     not null default 0,
  hide_level     integer     not null default 0,
  review_count   integer     not null default 0,
  best_wpm       integer     not null default 0,
  best_accuracy  integer     not null default 0,
  last_mode      text        not null default 'recite',
  last_review_at timestamptz not null default now(),
  created_at     timestamptz not null default now(),
  constraint bible_memory_progress_status_check
    check (status in ('learning', 'reviewing', 'memorised')),
  constraint bible_memory_progress_mastery_check
    check (mastery between 0 and 100)
);

create unique index if not exists bible_memory_progress_unique_idx
  on public.bible_memory_progress (user_id, passage_id);

create index if not exists bible_memory_progress_user_idx
  on public.bible_memory_progress (user_id, last_review_at desc);

-- -----------------------------------------------------------------------------
-- 6. Scripture typing scores (one row per attempt, for history + personal best)
-- -----------------------------------------------------------------------------
create table if not exists public.bible_typing_score (
  id          uuid        primary key default gen_random_uuid(),
  user_id     text        not null,
  passage_id  text        not null default '',
  passage     text        not null default '',
  wpm         integer     not null default 0,
  accuracy    integer     not null default 0,
  duration_ms integer     not null default 0,
  characters  integer     not null default 0,
  created_at  timestamptz not null default now(),
  constraint bible_typing_score_accuracy_check check (accuracy between 0 and 100)
);

create index if not exists bible_typing_score_user_idx
  on public.bible_typing_score (user_id, created_at desc);

-- -----------------------------------------------------------------------------
-- 7. Reading progress + daily verse streak
-- -----------------------------------------------------------------------------
create table if not exists public.bible_reading_progress (
  id         uuid        primary key default gen_random_uuid(),
  user_id    text        not null,
  read_on    date        not null default (now() at time zone 'utc')::date,
  book       text        not null default '',
  chapter    integer     not null default 0,
  version    text        not null default '',
  reference  text        not null default '',
  source     text        not null default 'reader',
  created_at timestamptz not null default now()
);

-- One row per member per day per chapter keeps the streak calculation cheap
-- and stops a page refresh from inflating the history.
create unique index if not exists bible_reading_progress_unique_idx
  on public.bible_reading_progress (user_id, read_on, book, chapter, source);

create index if not exists bible_reading_progress_user_idx
  on public.bible_reading_progress (user_id, read_on desc);

-- -----------------------------------------------------------------------------
-- 8. Concordance search history
-- -----------------------------------------------------------------------------
create table if not exists public.bible_concordance_history (
  id         uuid        primary key default gen_random_uuid(),
  user_id    text        not null,
  query      text        not null,
  results    integer     not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists bible_concordance_history_user_idx
  on public.bible_concordance_history (user_id, created_at desc);

-- -----------------------------------------------------------------------------
-- Lock every table down to the service role
-- -----------------------------------------------------------------------------
-- RLS on with zero policies = the anon and authenticated keys can do nothing.
-- The service role key used by the Next.js route bypasses RLS by design.
alter table public.bible_preference          enable row level security;
alter table public.bible_sermon_note         enable row level security;
alter table public.bible_bookmark            enable row level security;
alter table public.bible_card_design         enable row level security;
alter table public.bible_memory_progress     enable row level security;
alter table public.bible_typing_score        enable row level security;
alter table public.bible_reading_progress    enable row level security;
alter table public.bible_concordance_history enable row level security;

revoke all on public.bible_preference          from anon, authenticated;
revoke all on public.bible_sermon_note         from anon, authenticated;
revoke all on public.bible_bookmark            from anon, authenticated;
revoke all on public.bible_card_design         from anon, authenticated;
revoke all on public.bible_memory_progress     from anon, authenticated;
revoke all on public.bible_typing_score        from anon, authenticated;
revoke all on public.bible_reading_progress    from anon, authenticated;
revoke all on public.bible_concordance_history from anon, authenticated;
