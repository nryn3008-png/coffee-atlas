# Coffee Atlas — Handoff

_A briefing for Claude Code (or any dev) picking this up. Read this first._

## What this is

An **estate-first atlas of specialty coffee**. It began as a personal tracker for one serious home brewer (V60 / Kalita pour-over, single-origin purist, based in Indore, India) and is being taken to the next level as a **multi-user product** for other coffee enthusiasts ("coffee heads").

It is three things layered on one data model:
1. **A reference atlas** — a near-complete, honestly-sourced database of coffee estates/origins, the roasters who sell them, and how each is processed. Shared; everyone reads it.
2. **A personal coffee passport** — each user tracks which estates they've tasted, from which roaster, with their own notes. Private per user.
3. **A brewing mentor** — every coffee maps (via its process + roast) to a recommended brewer with a plain-English "why." This is the differentiator; no competitor writes the "why."

## The non-negotiable principles (these shaped every design decision)

- **The estate is the permanent unit of identity — not the roaster.** Roasters are a layer on top, joined to estates through `lots`. A person "has tried Karadykan," which they happened to buy via Blue Tokai — the estate is the anchor, the roaster is metadata.
- **Blends are never estates.** A blend is not tracked as an entry. Only its *named constituent estates* are. (If a bag says "Winter Blend = St. Joseph + Attikan," those two estates get logged, the blend does not.)
- **Process is a lot/roaster attribute, not a fixed estate fact.** The same estate is sold washed by one roaster, natural by another, honey by a third. So estates carry a *typical/known-processes note* (fuzzy, multi-value), while the actual process lives on `lots` (what a roaster made) and on `tastings.process_bucket` (what's in the user's bag).
- **The brewer recommendation is derived, not hand-written per estate.** 6 rules map a process/roast "bucket" → a brewer + params + why. See `brewer_rules`. Washed-light → V60; natural → Kalita; honey → Clever/Kalita; anaerobic → AeroPress; dark → moka/AeroPress/S.Indian filter; dense-body → French press/moka.
- **Honesty over completeness.** Where an estate's process isn't reliably documented, the field is BLANK, never guessed. ~39 of 184 origins are intentionally blank. Preserve this discipline — fabricated data would poison a reference tool.

## What has already been done

- **A working prototype** (`legacy/estate-tracker.html`) — a single-file HTML app with localStorage. Fully functional: 184 origins, process line, per-estate roaster + process + notes, brewer recommendation, tried-tracking, progress bar, filters. This is the product's proven UX; the Next.js app should reproduce and extend it, not reinvent it.
- **The data** (`supabase/seed/data.json`) — extracted from the prototype:
  - **184 origins** across **20 regions** (17 Indian regions + 3 international continent groups: Africa & Arabia, Asia-Pacific, Americas).
  - **145 have a documented `typical_process_note`**; the rest are honest blanks.
  - **6 brewer rules**, **6 canonical processes**.
  - **9 `confirmed_tried`** — the original owner's tasting history (estate slug + roaster + process bucket). NOT seeded (needs a user_id); see "Owner's tried list" below.
- **The schema** (`supabase/migrations/0001_init.sql`) — full multi-user Postgres/Supabase schema with RLS. Reviewed and considered final for v1.
- **The seed script** (`supabase/seed/seed.ts`) — idempotent upsert of reference data.
- **A Next.js skeleton** (`src/`) — a read-only page that lists estates from Supabase to prove the wiring. Everything else is TODO.

## Data model (see 0001_init.sql for the truth)

**Reference (shared, world-readable, admin-writable via service role):**
- `regions` — origin regions / continent groups.
- `estates` — the permanent unit. `slug` matches the prototype ids. `entity_type` ∈ single_estate | estate_group | cooperative | region_origin. `typical_process_note` = the fuzzy known-processes string.
- `processes` — lookup (washed, natural, honey, anaerobic, wet-hulled, experimental).
- `roasters` — Blue Tokai, Siolim, Third Wave, SICC, Subko, etc.
- `lots` — **the estate↔roaster graph.** One row = one roaster's offering of one estate, with process + roast + brewer bucket. Currently unseeded; populate as data comes in.
- `brewer_rules` — the 6 process/roast → brewer mappings.

**Per-user (private, RLS: `auth.uid() = user_id`):**
- `profiles` — mirrors auth.users; `is_admin` gates reference-data edits. Auto-created on signup via trigger.
- `tastings` — one row per (user, estate). Holds their roaster(s), their bag's `process_bucket` (drives their brewer rec), notes, tried date.

## What to build next (suggested order)

1. **Stand up Supabase** on a PERSONAL account (see the warning below), apply `0001_init.sql`, run `npm run seed`. Verify the skeleton page lists 184 origins.
2. **Auth** — Supabase Auth, email + Google (owner is on a Google account). `@supabase/ssr` is already a dependency.
3. **Port the prototype UX** to React/Next: region sections, the check-to-track interaction, the expand panel with process dropdown → brewer recommendation card, roaster field (multi), notes. `legacy/estate-tracker.html` is the spec.
4. **Wire tastings to the DB** instead of localStorage, gated by auth. Offer to import the 9 `confirmed_tried` into the owner's account on first login.
5. **The estate↔roaster graph** — UI to add/browse `lots` (which roaster sells which estate, in which process). This is the feature no competitor has.
6. **Filters / search** — by region, process, tried/untried, brewer.
7. **Deploy to Vercel** from the GitHub repo; set the three env vars from `.env.example`.

## Owner's tried list (9 estates)

In `data.json → confirmed_tried`. Not seeded because tastings need a `user_id`. After the owner signs in, insert these as their tastings (map `slug` → `estates.id`). They are: baarbara (Tulum, honey), lungdai-mizoram (Grey Soul, natural), raxidi-lobo (Siolim, anaerobic), ratnagiri (Siolim, anaerobic), baankubedda (Araku, natural), marcala-honduras (washed-light), attikan (Blue Tokai, dark), basankhan (Blue Tokai, dark), st-joseph (Blue Tokai, natural).

## ⚠️ Important warnings

- **DO NOT use the "Brdg" Supabase org.** The Supabase connector in the originating chat was pointed at the user's *company* org (Bridge — 15 production projects like `investors`, `perks-portal`). This coffee project must live under a **personal** Supabase account. Same caution for the Vercel account.
- **Service role key is server-only.** It's used by `seed.ts`. Never import it into any `src/app` client code or expose it via `NEXT_PUBLIC_`.
- **This is now a reference others rely on.** Two responsibilities come with multi-user: (1) **data stewardship** — keep the honesty discipline (blanks over guesses); (2) **moderation** — if community ratings / public passports get added (see the v2 notes at the bottom of the migration), design them so raw per-user rows stay private (aggregate via views).
- **Region/country modeling is v1-rough** — the 3 international "regions" are continent groups (`country = 'Various'`); estates like "Ethiopia · Yirgacheffe" carry the country in their name. Normalizing country per estate is a good early refinement.

## Naming

Working name is "Coffee Atlas." The owner floated others (Terroir, Origin, The Estate Index, Kaapi). Not final — rename freely.

## File guide

```
handoff.md                     ← you are here
README.md                      ← setup / run instructions
schema note                    → supabase/migrations/0001_init.sql
seed data (184 origins)        → supabase/seed/data.json
seed script                    → supabase/seed/seed.ts
app skeleton                   → src/app/page.tsx, layout.tsx, globals.css
db client                      → src/lib/supabase.ts
types                          → src/types/db.ts
working prototype (UX spec)    → legacy/estate-tracker.html
brewer ruleset (source)        → legacy/brewer-rules.md
```
