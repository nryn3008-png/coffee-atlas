import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Minimal read-only starting point: lists estates grouped by region,
// straight from Supabase, to prove the wiring end-to-end.
// TODO (Claude Code): auth, personal tastings, brewer-recommendation UI,
// roaster/lot graph, filters, search — see handoff.md.

async function getData() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );
  const { data: regions } = await supabase
    .from("regions")
    .select("id,name,continent_group,sort_order,estates(name,subtitle,typical_process_note,entity_type)")
    .order("sort_order");
  return regions ?? [];
}

export default async function Home() {
  const regions = await getData();
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "40px 20px 80px" }}>
      <h1 style={{ fontSize: 34, color: "var(--pine-deep)", marginBottom: 4 }}>Coffee Atlas</h1>
      <p style={{ color: "var(--ink-soft)", marginTop: 0 }}>
        Estate-first specialty coffee — {regions.reduce((s: number, r: any) => s + (r.estates?.length ?? 0), 0)} origins.
      </p>
      {regions.length === 0 && (
        <p style={{ color: "var(--umber)" }}>
          No data yet — apply the migration and run <code>npm run seed</code>. See handoff.md.
        </p>
      )}
      {regions.map((r: any) => (
        <section key={r.id} style={{ marginTop: 28 }}>
          <h2 style={{ fontSize: 18, borderBottom: "1px solid var(--line)", paddingBottom: 6 }}>{r.name}</h2>
          {r.estates?.map((e: any, i: number) => (
            <div key={i} style={{ padding: "10px 0", borderBottom: "1px solid rgba(43,38,32,0.08)" }}>
              <div style={{ fontWeight: 600 }}>{e.name}</div>
              {e.subtitle && <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>{e.subtitle}</div>}
              {e.typical_process_note && (
                <div style={{ fontSize: 12, color: "var(--umber)", fontFamily: "monospace", marginTop: 2 }}>
                  process · {e.typical_process_note}
                </div>
              )}
            </div>
          ))}
        </section>
      ))}
    </main>
  );
}
