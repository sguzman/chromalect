# Historical-hue in-sample collision-constrained proposal v0.2

Chromalect maintains an immutable, production **520-component identity palette** in `mandarin-component-identity@0.6.0`. The historical-mnemonic-group [v0.1 counterfactual](forty-component-group-hue-counterfactual.md) changes 40 research-only swatches while retaining the other 480 original identities. No independent lexical or semantic classification has accepted the eight historical mnemonic hints.

## Measured reason for revising the hypothetical swatches

Across 1,000 source-mapped glyphs, the [first-trial co-occurrence audit](../site/glyphs/research/hint-counterfactual-v0.1/pair-risk-v0.1.json) measures 1,020 distinct component-ID pairs within individual glyphs. Its original 520-color palette has **26** pairs below ΔOK 0.07. The first hypothetical group-hue assignment has **76**: 70 newly close, 20 resolved and six retained; 66 characters acquire at least one new warning. This is an **in-sample geometric-color proximity result**, not an observed human misrecognition rate.

The first hypothetical scheme deliberately clusters swatches under eight hue anchors. Tight cluster structure and exact component identity discriminability can work against one another; its untested semantic usefulness cannot justify silently accepting many new same-glyph conflicts.

## Second experimental construction

The independently generated `site/mnemonic-group-risk-optimized-v0.2.json` is a separate **nonproduction proposal**. The [generator](../tools/glyph-pipeline/pilot_group_collision_optimization.mjs) uses the final source-owned component mappings and the published first-trial risk report. It builds a co-occurrence graph with one pair per two *distinct component identities* in a catalog character. If the same pair appears in several characters, that multiplicity is retained.

The candidate search uses deterministic coordinate descent with a fixed order prioritizing high-co-occurrence component IDs, fixed three-pass ceiling, and no stochastic external dataset. Each of the 40 originally hinted identities can consider sRGB colors derived from bounded OKLCH combinations: lightness 0.46–0.78; chroma 0.07–0.13; and hue within ±15° of its historic 45°-spaced group anchor. Candidates outside sRGB gamut are **rejected**, not clipped. The first-trial hex value is always an available fallback.

Local choices minimize the count of below-0.07 distances among source co-occurrence edges first, then shortfall/severity, then near-threshold proximity, then deviation from the previous research swatch. The generator rejects duplicates among the 40 selected hypothetical hex colors. Resulting counts and group-level within/between distances are written into the separate report, never into the active source palette or rendered atlas.

## Evidence limits and acceptance boundary

- Optimization is evaluated **on the very same first 1,000 glyphs used to select candidate colors**. No held-out test set, randomized participants, or independent visual adjudication has been completed.
- A lower measured color-pair risk count, if obtained, would represent only a better value on this **numerical source-cooccurrence objective**. It would not validate a semantic-family classification, legibility, memory retention, or transfer to unseen glyphs.
- The base historical-hint groups remain provisional. The algorithm never assigns any of the other 480 identities to a semantic family.
- The output is intentionally a counterfactual research dataset, not a successor palette, not a source-stroke recoloring and not a production approval. All original source glyphs and palette colors remain unchanged.

## Reproduce

    node tools/glyph-pipeline/pilot_group_collision_optimization_smoke.mjs
    node tools/glyph-pipeline/pilot_group_collision_optimization.mjs --write
    node tools/glyph-pipeline/pilot_group_collision_optimization.mjs --check

These commands require the complete generated source-glyph mappings and the first-trial risk audit, so they run within the existing GitHub Pages source-reconciliation pipeline. The candidate must be compared with the original production colors and a genuinely independent validation cohort before any later palette promotion is considered.
