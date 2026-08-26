# Faith In UX/UI replacement

## Repository assessment

Faith In is a Next.js App Router application written in TypeScript and deployed from GitHub to Vercel. The public marketing experience and the member application share one repository but have deliberately separate runtime boundaries.

- `app/(marketing)` contains static, indexable public routes.
- `components/marketing` contains the new public design system and interactive journey components.
- `app/app` contains the authenticated community experience and loads its established browser runtime only within that route group.
- Firebase Authentication establishes browser identity. Cloud Firestore stores profiles, posts, prayers, jobs, settings, and other member records.
- Vercel Blob stores new uploads after server-side Firebase ID-token verification. Firebase Cloud Storage remains a compatibility path for legacy objects.
- `app/api`, `lib/runtime-config.ts`, `lib/firebase.ts`, and `lib/verify-firebase-token.ts` are integration boundaries and are not coupled to the marketing presentation layer.
- Public Firebase identifiers and feature switches are documented in `.env.example`; `BLOB_READ_WRITE_TOKEN` remains server-only.
- Vercel is the production host and GitHub `main` is the documented production source branch.

## Route map

| Route | Purpose | Rendering |
| --- | --- | --- |
| `/` | Journey-led landing page | Static |
| `/features` | Product capability overview | Static |
| `/bible-study` | Bilingual Scripture experience | Static |
| `/for-churches` | Church and ministry pathway | Static |
| `/about` | Mission, values, and trust | Static |
| `/contact` | Contact channels and email composer | Static + client form |
| `/privacy` | Privacy policy | Static |
| `/terms` | Terms and community standards | Static |
| `/app` | Existing authenticated community application | Static shell + browser integrations |
| `/api`, `/api/upload` | Authenticated Blob upload compatibility | Dynamic server routes |

## Replacement strategy

1. Replace the public visual language with warm gold, charcoal, soft white, calm blue, and natural green tokens.
2. Rebuild navigation, footer, buttons, cards, forms, typography, responsive spacing, and focus states without importing the member application's legacy CSS.
3. Replace the homepage with a journey-first flow: discover, explore, connect, and grow.
4. Add purposeful client-side interaction only where it improves understanding: the hero preview, journey selector, persona selector, FAQ, mobile navigation, and email composer.
5. Keep Firebase, Firestore, upload verification, legacy member data, and the `/app` browser runtime unchanged.
6. Improve search and sharing through route metadata, Open Graph rendering, structured data, `robots.txt`, `sitemap.xml`, and the web app manifest.
7. Validate with TypeScript, ESLint, backend compatibility tests, a production build, and responsive browser checks.

## Compatibility and rollback

The marketing replacement does not move or rewrite user data. The `/app` route retains its existing scripts, styles, authentication behavior, Firebase collections, and upload path. A rollback of the public redesign can therefore be performed independently of backend records and member application state.

Future work should continue moving authenticated features from the legacy browser runtime into typed React modules one feature at a time, with Firestore Rules tests added for every changed write path.
