import type { BrewerBucket } from "@/types/db";

// One person's record for one estate, keyed by estate slug.
// Mirrors the columns of the `tastings` table (see 0001_init.sql) so that
// swapping the store below for Supabase is a change to this file only.
export interface TastingEntry {
  tried: boolean;
  roasters: string;            // comma-separated, as in the prototype
  process: BrewerBucket | "";   // "" = not set → no brewer recommendation
  notes: string;
}

export type TastingMap = Record<string, TastingEntry>;

export const emptyEntry: TastingEntry = { tried: false, roasters: "", process: "", notes: "" };

export interface TastingStore {
  load(): Promise<TastingMap>;
  save(map: TastingMap): Promise<void>;
  readonly label: string;
}

const STORAGE_KEY = "coffee-atlas:tastings:v1";

/**
 * Interim store: the browser's localStorage, matching the prototype's
 * behaviour so the UX can be ported and used before auth exists.
 *
 * TODO (handoff.md step 4): replace with a Supabase-backed store that writes
 * to `tastings` under the signed-in user, and offer to import whatever this
 * local store holds on first login.
 */
export const localTastingStore: TastingStore = {
  label: "Saved locally to your device.",

  async load() {
    if (typeof window === "undefined") return {};
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as TastingMap) : {};
    } catch {
      return {};
    }
  },

  async save(map) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  },
};

/** True if the entry holds anything worth persisting or auto-expanding for. */
export function hasDetail(e: TastingEntry | undefined): boolean {
  return !!e && (!!e.notes || !!e.roasters || !!e.process);
}

/** "Blue Tokai, Siolim" -> ["Blue Tokai", "Siolim"] */
export function parseRoasters(value: string): string[] {
  return value.split(",").map((r) => r.trim()).filter(Boolean);
}
