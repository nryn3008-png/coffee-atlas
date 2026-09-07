import type { BrewerRule } from "@/types/db";
import seed from "../../supabase/seed/data.json";

// The brewer rules live in the `brewer_rules` table and are fetched per request.
// Before the database is seeded there is nothing to fetch, so we fall back to
// the same rows the seed script inserts — imported from data.json rather than
// re-typed, so the two can never drift apart.
export const fallbackBrewerRules: BrewerRule[] = (
  seed.brewer_rules as Omit<BrewerRule, "id">[]
).map((r, i) => ({ ...r, id: `fallback-${i}` }) as BrewerRule);
