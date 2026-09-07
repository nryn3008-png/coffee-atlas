# Brewer Recommendation Rules

A small, teachable ruleset that maps any coffee to its ideal brewer from its **process + roast + profile** — not from the specific bag. Bolt this onto the recipe layer so every coffee in the tracker gets a "best brewer + why" line automatically.

## The one idea behind all of it: the clarity ↔ body spectrum

Every brewer sits somewhere on a single axis. Pick the coffee's spot on that axis, and the brewer follows.

```
CLARITY  ◄──────────────────────────────────────────────►  BODY
Chemex   V60      Origami   Kalita    Clever    AeroPress   French Press
                  (flat)    (Wave)    Dripper               Moka / S.Indian filter
tea-like  bright  balanced  sweet+    body w/o  syrupy,     heavy, oily,
crisp     florals even bed  body      silt      controlled  textured
```

- **Cone drippers** (V60, Chemex) run fast and clean → highlight acidity, florals, aromatics; lighter body.
- **Flat-bottoms** (Kalita Wave, Origami-flat) run slower and more evenly → build sweetness and body while keeping decent clarity; also more forgiving of pour technique.
- **Immersion / hybrid** (Clever, AeroPress, French Press) → maximize body, extraction, and texture; forgiving; trade clarity for mouthfeel.

Everything below is just "where on this axis does this coffee want to be."

## The rules

**Rule 1 — Washed + light roast + floral/bright** (washed SL-9, washed Ethiopian-style Yirgacheffe, clean high-grown Chikmagalur)
→ **V60.** For an even cleaner, tea-like cup or a bigger batch, Chemex.
Avoid: French press, moka (they bury the florals in body).
Why: this is the one profile where clarity *is* the point. A fast cone lifts jasmine/citrus/bergamot; immersion mutes exactly what you paid for.

**Rule 2 — Natural + light-to-medium + fruit-forward** (berry, jammy, funky naturals)
→ **Kalita Wave** (or Origami with a flat-bottom filter).
Avoid: a fast V60 pour — dense naturals channel and run thin on a cone.
Why: the flat bed and slower, even flow build sweetness and body to carry the fruit, while keeping enough clarity that it doesn't turn to jam soup.

**Rule 3 — Honey process + medium + syrupy/balanced** (honey sun-dried lots — e.g. Blue Tokai's Karadykan honey, Baarbara HSD)
→ **Clever Dripper** or Kalita.
Why: honey coffees live on sweetness and round mouthfeel. The Clever's immersion-then-drain squeezes out that syrupy sweetness without leaving silt in the cup.

**Rule 4 — Anaerobic / experimental ferment + intense/boozy/wild** (W-strain naturals, carbonic maceration, culture ferments — e.g. Raxidi Lobo W1)
→ **AeroPress** (cooler water, ~88–90°C), or Kalita.
Avoid: a hot, fast V60 — it amplifies an already-loud coffee into something unbalanced.
Why: these are high-intensity and easy to over-extract. You want to *structure and tame* them, not turbo-charge them. AeroPress gives the most control over contact time and temperature.

**Rule 5 — Dark roast for milk + chocolatey/nutty** (Basankhan dark, Vienna-style, most "have with milk" lots)
→ **Moka pot**, AeroPress, or South Indian filter.
Avoid: V60 — dark roast on a fast cone goes flat, ashy, and over-extracts easily.
Why: pressure/percolation suits body and roast depth, and stands up to milk. This is the espresso-adjacent, breakfast-cup lane.

**Rule 6 — Dense natural or specialty robusta + body-forward** (heavy, low-acid, chocolate/tobacco; robusta microlots)
→ **French Press** or moka.
Why: here body *is* the goal. Embrace the oils and texture instead of filtering them out — a cone would strip the very thing that makes these lots satisfying.

**Rule 7 — Cold brew (any, but naturals & chocolatey lots shine)**
→ **Immersion steep**, 1:8 concentrate, 12–16h fridge.
Why: cold extraction is low-acid, sweet, and forgiving — it flatters dense naturals and dark chocolatey profiles far more than delicate washed florals (which lose their aromatics cold). Save your bright washed lots for hot pour-over; send the fruity/chocolatey ones to the cold-brew bottle.

**Rule 8 — Default / "I only own one dripper"**
→ **V60 for anything light and washed; Kalita for anything natural, honey, or medium+.**
Why: those two brewers cover ~90% of specialty coffee between them. If in doubt, fall back to the process: washed → cone, everything else → flat-bottom.

## How this plugs into the recipe layer

The recipe block for any coffee becomes:

> **Best brewer:** V60 · **Grind:** medium-fine · **Water:** 93°C · **Ratio:** 1:16
> **Why this brewer:** washed SL-9, floral and bright — a cone keeps the florals lifted; a French press would mute them.

The "why" line is the differentiator. Price-comparison sites can't write it; a process-to-brewer rule can generate it automatically from data the tracker already holds (process + roast + notes).

## Note on your current kit

You can already run Rules 1, 7, and 8-light on your V60 and cold-brew setup. Rules 2, 3, and 8-medium are exactly the argument for the **Kalita Wave** you've been eyeing — it unlocks the natural/honey half of the spectrum you currently can't brew to its best. Rules 4–6 (AeroPress / French press / moka) are optional expansions, not essentials — add them only if you start chasing the dark, dense, or experimental end.
