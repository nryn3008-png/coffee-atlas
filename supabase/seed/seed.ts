/**
 * Seed script — loads data.json (regions, estates, brewer rules, processes)
 * into Supabase. Run AFTER the 0001_init.sql migration is applied.
 *
 * Uses the SERVICE ROLE key (bypasses RLS) — this is admin-only reference data.
 * NEVER ship the service role key to the browser; this runs locally / in CI only.
 *
 *   npm run seed
 *
 * Requires env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env");
}

const db = createClient(url, serviceKey, { auth: { persistSession: false } });

type Estate = {
  slug: string; name: string; subtitle: string | null;
  entity_type: string; typical_process_note: string | null;
};
type Region = {
  name: string; continent_group: string; country: string;
  note: string | null; sort_order: number; estates: Estate[];
};
type Data = {
  regions: Region[];
  brewer_rules: { bucket_key: string; label: string; brewer: string; params: string; why: string }[];
  processes: { key: string; label: string }[];
  confirmed_tried: { slug: string; roaster: string | null; process_bucket: string | null }[];
};

const data: Data = JSON.parse(readFileSync(join(__dirname, "data.json"), "utf8"));

async function main() {
  // 1) processes lookup
  await db.from("processes").upsert(
    data.processes.map((p) => ({ key: p.key, label: p.label })),
    { onConflict: "key" }
  );

  // 2) brewer rules
  await db.from("brewer_rules").upsert(data.brewer_rules, { onConflict: "bucket_key" });

  // 3) regions + estates
  for (const r of data.regions) {
    const { data: region, error: rErr } = await db
      .from("regions")
      .upsert(
        { name: r.name, continent_group: r.continent_group, country: r.country, note: r.note, sort_order: r.sort_order },
        { onConflict: "name" }
      )
      .select("id")
      .single();
    if (rErr) throw rErr;

    const rows = r.estates.map((e) => ({
      slug: e.slug,
      name: e.name,
      region_id: region!.id,
      subtitle: e.subtitle,
      entity_type: e.entity_type,
      typical_process_note: e.typical_process_note,
    }));
    const { error: eErr } = await db.from("estates").upsert(rows, { onConflict: "slug" });
    if (eErr) throw eErr;
    console.log(`seeded ${r.name} — ${rows.length} estates`);
  }

  const total = data.regions.reduce((s, r) => s + r.estates.length, 0);
  console.log(`\nDone. ${data.regions.length} regions, ${total} estates, ${data.brewer_rules.length} brewer rules seeded.`);
  console.log("NOTE: confirmed_tried is NOT seeded (needs a signed-in user_id). See handoff.md → 'Owner's tried list'.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
