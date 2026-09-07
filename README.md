# Coffee Atlas

[![Next.js](https://img.shields.io/badge/Next.js-14-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20RLS-3FCF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![Status](https://img.shields.io/badge/status-early%20WIP-orange)](./handoff.md)

An estate-first atlas of specialty coffee. Browse a near-complete database of coffee
estates and origins, track which you've tasted, and get a brewer recommendation for
each based on its processing method and roast.

> New here? Read **[handoff.md](./handoff.md)** first — it explains the vision, the
> design principles, and exactly what's built vs. what's next.

## Stack

- **Next.js 14** (App Router) + TypeScript
- **Supabase** (Postgres + Auth + Row-Level Security)
- **Vercel** for hosting

## Getting started

1. **Create a Supabase project** on your own personal account
   (⚠️ not a shared/company org — see handoff.md).

2. **Apply the schema.** In the Supabase SQL editor, run
   [`supabase/migrations/0001_init.sql`](./supabase/migrations/0001_init.sql).

3. **Configure env.** Copy `.env.example` to `.env.local` and fill in your project's
   URL, anon key, and service-role key (Project Settings → API).

4. **Install & seed.**
   ```bash
   npm install
   npm run seed      # loads 184 origins + brewer rules into your DB
   ```

5. **Run.**
   ```bash
   npm run dev       # http://localhost:3000
   ```
   You should see all 184 origins listed by region.

## Deploy (Vercel)

1. Push this repo to GitHub.
2. Import it in Vercel.
3. Add the two `NEXT_PUBLIC_` env vars (`NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in the Vercel project settings.
   **Do not add `SUPABASE_SERVICE_ROLE_KEY`** — it bypasses RLS and is only
   used by the local seed script, never by the deployed app.
4. Deploy — Vercel auto-builds on every push to `main`.

## What's in here

| Path | What |
|---|---|
| `supabase/migrations/0001_init.sql` | Full multi-user schema + RLS |
| `supabase/seed/data.json` | 184 origins, 6 brewer rules, processes |
| `supabase/seed/seed.ts` | Seed script (`npm run seed`) |
| `src/app/` | Next.js app (read-only skeleton so far) |
| `src/lib/supabase.ts` | Browser client |
| `src/types/db.ts` | Types mirroring the schema |
| `legacy/estate-tracker.html` | The original working prototype — the UX spec |
| `legacy/brewer-rules.md` | The brewer ruleset, explained |

## Status

Early. The data model, schema, and seed data are solid and the reference page renders
from Supabase. Auth, personal tastings, the roaster↔estate graph, the brewer-recommendation
UI, search/filters, and deploy are the next steps — see **handoff.md**.
