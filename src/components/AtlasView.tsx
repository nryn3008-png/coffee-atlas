"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { BrewerBucket, BrewerRule } from "@/types/db";
import {
  emptyEntry,
  hasDetail,
  localTastingStore,
  parseRoasters,
  type TastingEntry,
  type TastingMap,
} from "@/lib/tastings";

export interface AtlasEstate {
  slug: string;
  name: string;
  subtitle: string | null;
  typical_process_note: string | null;
}
export interface AtlasRegion {
  id: string;
  name: string;
  note: string | null;
  estates: AtlasEstate[];
}

type Filter = "all" | "tried" | "untried";
const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "tried", label: "Tried" },
  { key: "untried", label: "Not yet" },
];

export default function AtlasView({
  regions,
  brewerRules,
}: {
  regions: AtlasRegion[];
  brewerRules: BrewerRule[];
}) {
  const [tastings, setTastings] = useState<TastingMap>({});
  const [loaded, setLoaded] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [saveLabel, setSaveLabel] = useState(localTastingStore.label);

  // localStorage is only readable on the client, so the first paint is the
  // untouched atlas and tastings arrive immediately after mount.
  useEffect(() => {
    let active = true;
    localTastingStore.load().then((map) => {
      if (!active) return;
      setTastings(map);
      setExpanded(
        Object.fromEntries(
          Object.entries(map).filter(([, e]) => hasDetail(e)).map(([slug]) => [slug, true])
        )
      );
      setLoaded(true);
    });
    return () => {
      active = false;
    };
  }, []);

  const update = useCallback(
    (slug: string, patch: Partial<TastingEntry>) => {
      setTastings((prev) => {
        const next = { ...prev, [slug]: { ...emptyEntry, ...prev[slug], ...patch } };
        localTastingStore
          .save(next)
          .then(() => setSaveLabel(localTastingStore.label))
          .catch(() => setSaveLabel("Couldn't save — changes may not persist."));
        return next;
      });
    },
    []
  );

  const rulesByKey = useMemo(
    () => new Map(brewerRules.map((r) => [r.bucket_key, r])),
    [brewerRules]
  );

  const total = useMemo(
    () => regions.reduce((sum, r) => sum + r.estates.length, 0),
    [regions]
  );
  const triedCount = useMemo(
    () => Object.values(tastings).filter((t) => t.tried).length,
    [tastings]
  );
  const pct = total > 0 ? Math.round((triedCount / total) * 100) : 0;

  const isTried = (slug: string) => !!tastings[slug]?.tried;

  return (
    <>
      <div className="progress-card">
        <div className="progress-number">
          {triedCount}
          <span> / {total} tried</span>
        </div>
        <div className="bar-track">
          <div className="bar-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="filter-row" role="group" aria-label="Filter estates">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            className={`filter-btn${filter === f.key ? " active" : ""}`}
            aria-pressed={filter === f.key}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {regions.map((region) => {
        const visible = region.estates.filter((e) => {
          if (filter === "tried") return isTried(e.slug);
          if (filter === "untried") return !isTried(e.slug);
          return true;
        });
        if (visible.length === 0) return null;

        const regionTried = region.estates.filter((e) => isTried(e.slug)).length;
        const isCollapsed = !!collapsed[region.id];

        return (
          <section className="region" key={region.id}>
            <button
              type="button"
              className="region-head"
              aria-expanded={!isCollapsed}
              onClick={() => setCollapsed((c) => ({ ...c, [region.id]: !c[region.id] }))}
            >
              <span className="region-name">{region.name}</span>
              <span className="region-meta">
                {regionTried} / {region.estates.length}
              </span>
            </button>
            <div className={`region-body${isCollapsed ? " collapsed" : ""}`}>
              {region.note && <p className="region-note">{region.note}</p>}
              {visible.map((estate) => (
                <EstateRow
                  key={estate.slug}
                  estate={estate}
                  entry={tastings[estate.slug]}
                  rule={
                    tastings[estate.slug]?.process
                      ? rulesByKey.get(tastings[estate.slug].process as BrewerBucket)
                      : undefined
                  }
                  rules={brewerRules}
                  open={!!expanded[estate.slug]}
                  onToggleOpen={() =>
                    setExpanded((x) => ({ ...x, [estate.slug]: !x[estate.slug] }))
                  }
                  onChange={(patch) => update(estate.slug, patch)}
                />
              ))}
            </div>
          </section>
        );
      })}

      <footer>
        <span className="save-state">{loaded ? saveLabel : "Loading your log…"}</span>
      </footer>
    </>
  );
}

function EstateRow({
  estate,
  entry,
  rule,
  rules,
  open,
  onToggleOpen,
  onChange,
}: {
  estate: AtlasEstate;
  entry: TastingEntry | undefined;
  rule: BrewerRule | undefined;
  rules: BrewerRule[];
  open: boolean;
  onToggleOpen: () => void;
  onChange: (patch: Partial<TastingEntry>) => void;
}) {
  const tried = !!entry?.tried;
  const roasters = entry?.roasters ?? "";
  const roasterList = parseRoasters(roasters);

  return (
    <div className={`estate-row${tried ? " tried" : ""}`}>
      <button
        type="button"
        className={`check${tried ? " tried" : ""}`}
        aria-pressed={tried}
        aria-label={`Mark ${estate.name} as tried`}
        onClick={() => onChange({ tried: !tried })}
      >
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d="M3 8L6.5 11.5L13 4"
            stroke="#f2ecdc"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <div className="estate-main">
        <button type="button" className="estate-top" aria-expanded={open} onClick={onToggleOpen}>
          <span>
            <span className="estate-name">{estate.name}</span>
            {estate.subtitle && <span className="estate-sub">{estate.subtitle}</span>}
            {estate.typical_process_note && (
              <span className="estate-process">
                <b>process</b> · {estate.typical_process_note}
              </span>
            )}
            {roasterList.length > 0 && (
              <span className="roaster-tag">
                {roasterList.map((r) => (
                  <span key={r}>via {r}</span>
                ))}
              </span>
            )}
          </span>
          <span className="expand-arrow">notes</span>
        </button>

        <div className={`estate-notes${open ? " open" : ""}`}>
          <select
            className="process-select"
            aria-label={`Process of your ${estate.name} bag`}
            value={entry?.process ?? ""}
            onChange={(e) => onChange({ process: e.target.value as BrewerBucket | "" })}
          >
            <option value="">Set process for a brewer tip…</option>
            {rules.map((r) => (
              <option key={r.bucket_key} value={r.bucket_key}>
                {r.label}
              </option>
            ))}
          </select>

          {rule && (
            <div className="brewer-rec">
              <div className="rec-brewer">☕ {rule.brewer}</div>
              <div className="rec-params">{rule.params}</div>
              <div className="rec-why">{rule.why}</div>
            </div>
          )}

          <input
            className="roaster-input"
            type="text"
            placeholder="Roaster(s), comma-separated…"
            aria-label={`Roasters for ${estate.name}`}
            value={roasters}
            onChange={(e) => onChange({ roasters: e.target.value })}
          />
          <textarea
            placeholder="Process, altitude, tasting notes…"
            aria-label={`Notes on ${estate.name}`}
            value={entry?.notes ?? ""}
            onChange={(e) => onChange({ notes: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
