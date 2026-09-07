-- ============================================================
--  COFFEE ATLAS — Supabase schema (multi-user)
--  v1 · foundation migration
--
--  Design split:
--   • REFERENCE data  → shared, everyone reads, only admins write
--       regions · estates · roasters · lots · processes · brewer_rules
--   • USER data       → private per person, protected by RLS
--       profiles · tastings
--
--  Core principle carried over from the tracker:
--   the ESTATE is the permanent unit of identity; roasters are a
--   layer on top, joined to estates through LOTS. Blends are never
--   estates — only their named constituent estates are.
-- ============================================================

-- Needed for gen_random_uuid()
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- Reusable updated_at trigger
-- ------------------------------------------------------------
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ============================================================
--  REFERENCE TABLES  (the shared "atlas")
-- ============================================================

-- Regions / origins ------------------------------------------
create table regions (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,                 -- "Chikmagalur, Karnataka"
  country         text not null default 'India',
  continent_group text not null                  -- 'India' | 'Africa & Arabia' | 'Asia-Pacific' | 'Americas'
                  check (continent_group in ('India','Africa & Arabia','Asia-Pacific','Americas')),
  note            text,
  sort_order      int  not null default 0,
  created_at      timestamptz not null default now()
);

-- Estates (and estate-groups / cooperatives / region-origins) 
create table estates (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,             -- 'karadykan' — matches the tracker ids for a clean migration
  name         text not null,
  region_id    uuid not null references regions(id) on delete restrict,
  subtitle     text,                             -- the descriptive line
  entity_type  text not null default 'single_estate'
               check (entity_type in ('single_estate','estate_group','cooperative','region_origin')),
  altitude_min_m int,
  altitude_max_m int,
  varietals    text[],                           -- {'SL9','Catuai','Chandragiri'}
  established   text,
  typical_process_note text,                       -- human-readable 'known/typical processes' (e.g. 'Washed, natural, honey')
  created_at   timestamptz not null default now()
);
create index estates_region_idx on estates(region_id);

-- Processing methods lookup ----------------------------------
create table processes (
  id    uuid primary key default gen_random_uuid(),
  key   text unique not null,                    -- 'washed','natural','honey','anaerobic','wet-hulled','experimental'
  label text not null
);

-- Estate ↔ typical processes  (the "known/typical range" field)
-- Many estates run several processes → many-to-many.
create table estate_typical_processes (
  estate_id  uuid not null references estates(id) on delete cascade,
  process_id uuid not null references processes(id) on delete cascade,
  primary key (estate_id, process_id)
);

-- Roasters ---------------------------------------------------
create table roasters (
  id       uuid primary key default gen_random_uuid(),
  slug     text unique not null,
  name     text not null,
  country  text not null default 'India',
  url      text,
  created_at timestamptz not null default now()
);

-- Brewer rules  (the 6 process/roast → brewer buckets) --------
create table brewer_rules (
  id         uuid primary key default gen_random_uuid(),
  bucket_key text unique not null,               -- 'washed-light','natural','honey','anaerobic','dark','body'
  label      text not null,
  brewer     text not null,
  params     text not null,
  why        text not null
);

-- Lots  (the estate ↔ roaster graph) -------------------------
-- One row = a specific roaster's offering of one estate's coffee.
create table lots (
  id             uuid primary key default gen_random_uuid(),
  estate_id      uuid not null references estates(id) on delete cascade,
  roaster_id     uuid not null references roasters(id) on delete cascade,
  name           text,                           -- "Karadykan Honey Sun Dried"
  process_id     uuid references processes(id),
  roast_level    text check (roast_level in ('light','medium-light','medium','medium-dark','dark')),
  brewer_bucket  text references brewer_rules(bucket_key),
  tasting_notes  text,                            -- the roaster's stated notes
  url            text,
  created_at     timestamptz not null default now()
);
create index lots_estate_idx  on lots(estate_id);
create index lots_roaster_idx on lots(roaster_id);

-- ============================================================
--  USER TABLES  (private, RLS-protected)
-- ============================================================

-- Profile mirrors auth.users --------------------------------
create table profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  is_admin     boolean not null default false,   -- gates who may edit reference data
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create trigger profiles_updated before update on profiles
  for each row execute function set_updated_at();

-- Auto-create a profile row when a new auth user signs up
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles(id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)));
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Tastings  (one person's record of trying an estate) --------
create table tastings (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  estate_id      uuid not null references estates(id) on delete cascade,
  lot_id         uuid references lots(id) on delete set null,   -- optional: a specific roaster lot
  roasters       text[],                                        -- roaster(s) they had it from (freeform, multi)
  process_bucket text references brewer_rules(bucket_key),      -- process of THEIR bag → drives their brewer rec
  notes          text,
  tried_at       date,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (user_id, estate_id)                                    -- one record per estate per user
);
create index tastings_user_idx   on tastings(user_id);
create index tastings_estate_idx on tastings(estate_id);
create trigger tastings_updated before update on tastings
  for each row execute function set_updated_at();

-- ============================================================
--  ROW-LEVEL SECURITY
-- ============================================================

-- Reference tables: readable by everyone (incl. logged-out visitors),
-- writable by nobody through the API → admins edit via service-role key,
-- which bypasses RLS. Enabling RLS with only SELECT policies = safe default.
alter table regions                   enable row level security;
alter table estates                   enable row level security;
alter table processes                 enable row level security;
alter table estate_typical_processes  enable row level security;
alter table roasters                  enable row level security;
alter table brewer_rules              enable row level security;
alter table lots                      enable row level security;

create policy "reference readable by all" on regions                  for select using (true);
create policy "reference readable by all" on estates                  for select using (true);
create policy "reference readable by all" on processes                for select using (true);
create policy "reference readable by all" on estate_typical_processes for select using (true);
create policy "reference readable by all" on roasters                 for select using (true);
create policy "reference readable by all" on brewer_rules             for select using (true);
create policy "reference readable by all" on lots                     for select using (true);

-- Profiles: a user sees/edits only their own; profiles are not public in v1.
alter table profiles enable row level security;
create policy "own profile - select" on profiles for select using (auth.uid() = id);
create policy "own profile - update" on profiles for update using (auth.uid() = id);

-- Tastings: fully private to the owning user.
alter table tastings enable row level security;
create policy "own tastings - select" on tastings for select using (auth.uid() = user_id);
create policy "own tastings - insert" on tastings for insert with check (auth.uid() = user_id);
create policy "own tastings - update" on tastings for update using (auth.uid() = user_id);
create policy "own tastings - delete" on tastings for delete using (auth.uid() = user_id);

-- ============================================================
--  NOTES FOR v2 (not built yet — recorded so we design toward them)
--   • public profiles / shareable "coffee passport" → add a
--     `profiles.is_public` flag + a public SELECT policy on a
--     curated view, never on the raw tastings table.
--   • admin edits to reference data → either service-role key, or
--     add "is_admin" WITH CHECK policies for INSERT/UPDATE.
--   • community ratings → a separate `ratings` table, aggregated
--     into a materialized view so raw per-user rows stay private.
-- ============================================================
