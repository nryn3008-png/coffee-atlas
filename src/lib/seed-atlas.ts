import seed from "../../supabase/seed/data.json";
import type { AtlasRegion } from "@/components/AtlasView";

// The same 184 origins the seed script loads, read straight from data.json so
// the app is browsable before Supabase is connected. Used only when the live
// query returns nothing; the UI labels it as preview data when it kicks in.
export const seedRegions: AtlasRegion[] = (
  seed.regions as {
    name: string;
    note: string | null;
    estates: {
      slug: string;
      name: string;
      subtitle?: string | null;
      typical_process_note?: string | null;
    }[];
  }[]
).map((r) => ({
  id: r.name,
  name: r.name,
  note: r.note ?? null,
  estates: r.estates.map((e) => ({
    slug: e.slug,
    name: e.name,
    subtitle: e.subtitle ?? null,
    typical_process_note: e.typical_process_note ?? null,
  })),
}));
