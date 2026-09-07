# Coffee Atlas

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
3. Add the three env vars from `.env.example` in the Vercel project settings.
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
