# Khmer Old Version 1954 — data and backend

How Faith In serves ព្រះគម្ពីរបរិសុទ្ធ ១៩៥៤, where the text comes from, and what
licence it needs.

## The problem this fixes

Before this change, selecting the Khmer 1954 mostly did not give you Khmer.

`lib/bible-service.ts` held about **60 Khmer verses across ~13 partial
chapters** — roughly **0.2%** of the Bible. For every other chapter the code
fell through to:

```ts
const englishChapter = await fetchEnglishChapter(book.name, chapter, "WEB");
// …returned with version: "KHMER_OLD_1954", source: "bilingual-sync"
```

So a member opening Genesis 12 in Khmer was shown **English World English Bible
text, labelled as the 1954 Khmer Bible**. Not a missing feature — a wrong
answer, in a Bible app, about Scripture.

A second bug guaranteed it stayed that way. `.env.example`,
`/api/bible/versions` and `tests/bible.test.ts` all use `YVP_APP_KEY`, but the
one line that actually fetched Khmer text read `CV_YOUVERSION_APP_KEY` /
`YOUVERSION_APP_KEY`. Setting the documented variable made
`/api/bible/versions` report Khmer as configured while chapters kept serving
English.

## How it works now

```
getBibleChapter(book, chapter, "KHMER_OLD_1954")
  │
  ├─ a. Supabase  bible_verse           ← the whole Bible, once imported
  ├─ b. embedded seed verses            ← the ~60 verses in bible-service.ts
  ├─ c. YouVersion Platform (id 1270)   ← licensed API; also warms Supabase
  └─ d. status: "setup_required"        ← honest notice, never another language
```

Rule: **a chapter is only ever returned as `status: "ready"` when `items` really
is that version.** There is no path that substitutes another translation. A test
asserts the Khmer branch never calls `fetchEnglishChapter`.

When nothing has the chapter, the reader shows "ជំពូកនេះមិនទាន់មានទេ • Not
available yet", a link to read it on bible.com, and a button to switch to
English **by the member's own choice**.

## Licence — read this first

The Khmer Old Version 1954 is published by the **Bible Society in Cambodia**.
**It is not public domain.** There is no legitimate bulk download, and the text
must not be extracted from bible.com or from the `bscambodia.org` apps.

Two lawful routes:

| Route | Cost | How |
| --- | --- | --- |
| **YouVersion Platform** (chosen) | Free | Register Faith In at [platform.youversion.com](https://platform.youversion.com/), accept the publisher licence for **Bible 1270**, set `YVP_APP_KEY` |
| **Direct data licence** | Ask | Email the Bible Society in Cambodia at `info@biblecambodia.org` for a USFM file, then import with `--from-usfm` |

Wherever the text is displayed it carries
`ព្រះគម្ពីរបរិសុទ្ធ ១៩៥៤ © Bible Society in Cambodia`
(`KHMER_1954_ATTRIBUTION` in `lib/bible-service.ts`).

`bible_version.licence` and `licence_holder` record which licence each stored
text arrived under, so the question can always be answered later.

## Setup

**1. Run the migration** — `supabase/migrations/0002_bible_scripture.sql` in the
Supabase SQL Editor (same project as `0001_bible_studio.sql`). Idempotent.

**2. Add the key** — in Vercel, set `YVP_APP_KEY` to your YouVersion Platform
app key. Optionally `YVP_KHMER_BIBLE_ID` (defaults to `1270`).

At this point Khmer chapters work: the first reader of a chapter fetches it from
YouVersion and it is cached to Supabase for everyone after.

**3. Import the whole Bible** (recommended) so no reader ever waits on the API:

```bash
SUPABASE_URL=...  SUPABASE_SECRET_KEY=...  YVP_APP_KEY=...  \
  node scripts/import-khmer-bible.mjs --i-have-a-licence
```

Roughly 1,189 chapters at the default 250 ms spacing — about 5–6 minutes.

### Importer options

| Flag | Effect |
| --- | --- |
| `--i-have-a-licence` | **Required.** The script refuses to run without it |
| `--dry-run` | Fetch and report, write nothing |
| `--book=John` | One book only |
| `--from=Isaiah` | Resume from a book after an interruption |
| `--delay=500` | Milliseconds between requests |
| `--from-usfm=DIR` | Import licensed USFM files instead of using the API |

Every write is an upsert on `(version, book, chapter, verse)`, so re-running is
safe. Progress is recorded in `bible_import_run`.

## Schema

| Table | Holds |
| --- | --- |
| `bible_version` | One row per translation: name, source, **licence, licence holder, attribution**, import stats |
| `bible_verse` | The text, keyed `(version, book, chapter, verse)` |
| `bible_import_run` | Audit trail of what was imported, when, from where |
| `bible_chapter_coverage` | View: which chapters are present |

`book` is the canonical English book name already used across
`lib/bible-service.ts`, so lookups need no mapping table. A chapter read is one
index scan.

RLS is enabled with **no policies** — the anon and authenticated Supabase keys
cannot read these tables. Licensed text is only ever served through the Next.js
route, which is where attribution is applied.

Khmer search uses `to_tsvector('simple', …)` deliberately: Postgres has no Khmer
stemmer, and English stemming rules would mangle Khmer strings.

## Also fixed here

`lib/bible-service.ts` re-exported `"./bible-memory-data"` without a file
extension, which Node cannot resolve when it runs TypeScript directly. That
broke `tests/bible-backend.test.mjs` on `main` and would have broken the import
script too. The import now carries its `.ts` extension, with
`allowImportingTsExtensions` enabled in `tsconfig.json` (safe — `noEmit` is
already true and resolution is `bundler`). `npm test` is green again.

## Other Khmer translations

If the 1954 licence stalls, these are alternatives worth knowing about — all
different translations, not substitutes for the wording your members know:

- **Khmer Standard Version 2005 (គខប)** — on eBible.org and Bible.is
- **Khmer Christian Bible 2011 (KCB)** — YouVersion version 315
- **ព្រះគម្ពីរខ្មែរសាកល (GKHB)** — YouVersion version 2287

The store is version-keyed, so any of them can sit alongside the 1954 by adding
a `bible_version` row and importing under its own licence.

## Sources

- [ព្រះគម្ពីរបរិសុទ្ធ ១៩៥៤ on Bible.com (version 1270)](https://www.bible.com/versions/1270)
- [Bible Society in Cambodia](https://www.biblecambodia.org)
- [Khmer Scripture index — ScriptureEarth](https://www.scriptureearth.org/00i-Scripture_Index.php?iso=khm)
- [Bible data sets and APIs — Get.Bible](https://get.bible/bible-data-sets/)
