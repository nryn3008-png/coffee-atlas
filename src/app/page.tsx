import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import AtlasView, { type AtlasRegion } from "@/components/AtlasView";
import { fallbackBrewerRules } from "@/lib/brewer-rules";
import { seedRegions } from "@/lib/seed-atlas";
import type { BrewerRule } from "@/types/db";

// Reference data (regions, estates, brewer rules) is shared and world-readable
// per the RLS policies, so it is fetched server-side with the anon key.
// Personal tastings are still client-side localStorage — see src/lib/tastings.ts
// and handoff.md step 4 for the swap to the `tastings` table once auth lands.
async function getAtlas(): Promise<{ regions: AtlasRegion[]; rules: BrewerRule[]; live: boolean }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return { regions: seedRegions, rules: fallbackBrewerRules, live: false };

  const cookieStore = cookies();
  const supabase = createServerClient(url, anonKey, {
    cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} },
  });

  const [regionsRes, rulesRes] = await Promise.all([
    supabase
      .from("regions")
      .select("id,name,note,sort_order,estates(slug,name,subtitle,typical_process_note)")
      .order("sort_order"),
    supabase.from("brewer_rules").select("*"),
  ]);

  const live = !!regionsRes.data?.length;
  return {
    regions: live ? (regionsRes.data as unknown as AtlasRegion[]) : seedRegions,
    rules: rulesRes.data?.length ? (rulesRes.data as BrewerRule[]) : fallbackBrewerRules,
    live,
  };
}

export default async function Home() {
  const { regions, rules, live } = await getAtlas();
  const total = regions.reduce((sum, r) => sum + (r.estates?.length ?? 0), 0);

  return (
    <main className="wrap">
      <header>
        <div className="eyebrow">Field log · Western Ghats &amp; beyond</div>
        <h1>Coffee Atlas</h1>
        <p className="sub">
          An estate-first census of specialty coffee — {total} origins across India
          and beyond. Tap any estate to set its process and get a brewer recommendation, log
          the roaster, and jot tasting notes.
        </p>

        {!live && (
          <div className="empty-state">
            <strong>Preview — not connected to Supabase.</strong> These {total} origins are
            being read from the bundled <code>supabase/seed/data.json</code>, and anything you
            check off is saved only in this browser. To go live: apply{" "}
            <code>supabase/migrations/0001_init.sql</code>, fill in <code>.env.local</code>,
            then run <code>npm run seed</code>. See <code>handoff.md</code>.
          </div>
        )}
      </header>

      <AtlasView regions={regions} brewerRules={rules} />
    </main>
  );
}
