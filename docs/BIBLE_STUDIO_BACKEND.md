# Bible Studio backend

Everything a member creates in the Bible Studio now persists to Postgres in the
existing Supabase project — the same project that already hosts the
`faithin-media` storage bucket.

## What changed

Before this, most of the Bible Studio only *looked* like it saved:

| Feature | Before | Now |
| --- | --- | --- |
| Sermon Notes Planner | Written to `localStorage` and **never read back**; the server route answered `{ saved: true }` and discarded the notes | Saved to the member's account, restored on load, autosaves while typing, and keeps a note history |
| Scripture Card designs | Nothing saved — a refresh lost the design | "Save Design" plus a **My Cards** gallery; reopening a card restores the verse, wallpaper, fonts, colours and format |
| Scripture Memory progress | Nothing saved | Per-passage status (learning / reviewing / memorised), mastery, review count and personal best |
| Typing scores | Pushed into an in-memory `Map` that a serverless cold start discarded, and never readable | Full history per member, personal best, and a real accuracy figure measured against the passage |
| Verse bookmarks | Did not exist | Bookmark any verse from the Reader; kept per member |
| Reader position, translations, font size | `localStorage` only, lost on a new device | Saved to the account, so the Bible reopens where it was left |
| Reading streak | Did not exist | Counted from chapters opened, one per day |
| Concordance searches | Not recorded | Recent searches kept per member |

No existing function was removed. The Firestore data path in
`public/assets/js/faith-in-backend.js` is untouched and still reachable through
`window.cvDataRequest`.

## Setup — one step

**Run `supabase/migrations/0001_bible_studio.sql` in the Supabase SQL Editor**
of the project that holds the `faithin-media` bucket.

That is the whole deployment. **No new environment variables are needed.** The
server reaches Postgres with the `SUPABASE_URL` and `SUPABASE_SECRET_KEY` that
the media upload route already uses in Vercel.

The script is idempotent, so running it twice is safe.

### Before the SQL is run

Nothing breaks. Every route answers `200` with `persisted: false`, and the
browser keeps using local storage exactly as the Studio behaved before. Members
see no errors — the features simply do not follow them between devices yet.

## Architecture

```
Browser (bible.html)
   │
   ├── window.BibleStore            public/faithin-app/assets/faithin-bible-store.js
   │     • local mirror in localStorage (instant render, offline, signed-out)
   │     • sends the Firebase ID token from window.cvIdToken
   ▼
/api/bible/*                        app/api/bible/**/route.ts
   │     • verifies the token against Google's public signing certificates
   │       (lib/verify-firebase-token.ts — no service-account key anywhere)
   ▼
lib/bible-store.ts                  Supabase service-role client
   ▼
Postgres  bible_* tables            RLS on, no policies → service role only
```

### Identity

Sign-in stays on **Firebase Authentication**. Every row is keyed by the Firebase
uid taken from the verified token — never from a request body. Existing members
keep their logins, and the `auth.faithin.co` Google consent screen is unaffected.

### Authorisation

The `bible_*` tables have Row Level Security enabled with **no policies**, which
denies the anon and authenticated Supabase keys outright. Only the server's
service-role key can read or write, and it only ever does so for the uid in the
verified token. The browser never holds a database credential.

## Endpoints

All accept and return `{ success, persisted, data }`.

| Route | Methods | Purpose |
| --- | --- | --- |
| `/api/bible/notes` | GET, POST, DELETE | Sermon notes; `?history=1` for past notes, `action: "archive"` to file the current sheet away |
| `/api/bible/cards` | GET, POST, DELETE | Saved Scripture Card designs |
| `/api/bible/bookmarks` | GET, POST, DELETE | Verse bookmarks and highlights |
| `/api/bible/memory/progress` | GET, POST | Scripture Memory progress and summary |
| `/api/bible/typing` | GET, POST | Typing scores and personal best |
| `/api/bible/preferences` | GET, POST | Reader position, translations, font size, designer defaults |
| `/api/bible/progress` | GET, POST | Reading history and streak |
| `/api/bible/studio` | GET | Everything above in one round trip |

The Scripture-text routes (`/chapter`, `/passage`, `/search`, `/daily`,
`/dictionary`, `/quotes`, `/media`, `/versions`, `/memory`) are unchanged.

### Compatibility actions

`/api/compat` gained the matching `cv_bible_*` actions for the jQuery transport:
`cv_bible_save_card`, `cv_bible_get_cards`, `cv_bible_delete_card`,
`cv_bible_save_memory_progress`, `cv_bible_get_memory_progress`,
`cv_bible_save_bookmark`, `cv_bible_get_bookmarks`, `cv_bible_delete_bookmark`,
`cv_bible_save_preferences`, `cv_bible_get_preferences`,
`cv_bible_record_reading`, `cv_bible_get_typing_scores` and
`cv_bible_get_studio`.

`cv_bible_save_notes`, `cv_bible_get_notes` and `cv_bible_save_typing_score`
kept their names and shapes but now actually store the data instead of
returning a stub.

## Data retention

A member's Bible Studio rows are keyed by their Firebase uid. If an account is
deleted, delete the matching rows:

```sql
delete from public.bible_preference          where user_id = '<uid>';
delete from public.bible_sermon_note         where user_id = '<uid>';
delete from public.bible_bookmark            where user_id = '<uid>';
delete from public.bible_card_design         where user_id = '<uid>';
delete from public.bible_memory_progress     where user_id = '<uid>';
delete from public.bible_typing_score        where user_id = '<uid>';
delete from public.bible_reading_progress    where user_id = '<uid>';
delete from public.bible_concordance_history where user_id = '<uid>';
```

## Tests

`tests/bible-studio.test.mjs` covers input hygiene (including that Khmer text
passes through untouched), the streak calculation, safe degradation when the
store is unconfigured, the migration's idempotency and lock-down, and a guard
that every pre-existing `window.*` Studio function still exists.

```
npm test
npm run typecheck
npm run lint
```
