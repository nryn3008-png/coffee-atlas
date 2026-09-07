// Hand-written types mirroring the schema in supabase/migrations/0001_init.sql.
// TODO (Claude Code): replace with generated types via
//   npx supabase gen types typescript --project-id <ref> > src/types/db.ts

export type EntityType = "single_estate" | "estate_group" | "cooperative" | "region_origin";
export type ContinentGroup = "India" | "Africa & Arabia" | "Asia-Pacific" | "Americas";
export type BrewerBucket = "washed-light" | "natural" | "honey" | "anaerobic" | "dark" | "body";

export interface Region {
  id: string;
  name: string;
  country: string;
  continent_group: ContinentGroup;
  note: string | null;
  sort_order: number;
}

export interface Estate {
  id: string;
  slug: string;
  name: string;
  region_id: string;
  subtitle: string | null;
  entity_type: EntityType;
  altitude_min_m: number | null;
  altitude_max_m: number | null;
  varietals: string[] | null;
  established: string | null;
  typical_process_note: string | null;
}

export interface BrewerRule {
  id: string;
  bucket_key: BrewerBucket;
  label: string;
  brewer: string;
  params: string;
  why: string;
}

export interface Roaster {
  id: string;
  slug: string;
  name: string;
  country: string;
  url: string | null;
}

export interface Lot {
  id: string;
  estate_id: string;
  roaster_id: string;
  name: string | null;
  process_id: string | null;
  roast_level: "light" | "medium-light" | "medium" | "medium-dark" | "dark" | null;
  brewer_bucket: BrewerBucket | null;
  tasting_notes: string | null;
  url: string | null;
}

// Per-user, RLS-protected
export interface Tasting {
  id: string;
  user_id: string;
  estate_id: string;
  lot_id: string | null;
  roasters: string[] | null;
  process_bucket: BrewerBucket | null;
  notes: string | null;
  tried_at: string | null;
}
