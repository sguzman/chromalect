# Forty-component historical-hint color counterfactual

The [counterfactual comparison](../site/mnemonic-group-counterfactual.html) isolates a **nonproduction design hypothesis** from the immutable [520-component v0.6 identity palette](../palettes/mandarin-component-identity-v0.6.json).

The source palette records 40 original pilot components in eight mnemonic-hint groups. Those groups are historical design labels, **not independently adjudicated Mandarin lexical or semantic classes**. Exactly 480 other component identities have no hint and are **excluded** from this controlled color hypothesis. Nothing is inferred for them.

## Experimental construction

The [deterministic generator](../tools/glyph-pipeline/pilot_group_counterfactual.mjs) assigns each of the eight historical groups an evenly spaced OKLCH hue anchor: 20°, 65°, 110°, 155°, 200°, 245°, 290°, and 335°. Chroma is 0.09; base lightness is 0.62; successive component identities within each original group use fixed lightness offsets of −0.060, −0.045, −0.030, −0.015, +0.015, +0.030, +0.045, and +0.060 as applicable. The source's group and member ordering is retained. The conversion to six-digit sRGB uses OKLab D65 matrices and explicitly rejects colors outside the sRGB gamut rather than silently clipping them.

This creates 40 distinct *hypothetical* swatches with unchanged component IDs and source forms. It does not overwrite the original hex values, create a successor identity palette, update component-owned glyph SVGs, or represent itself as a verified semantic-family scheme. The report is generated separately at [`site/mnemonic-group-counterfactual-v0.1.json`](../site/mnemonic-group-counterfactual-v0.1.json), preserving both source and proposed hex values and their provenance.

## Source-identical glyph research gallery

The [research-only glyph comparison](../site/hint-hue-glyph-comparison.html) tests how those 40 hypothetical fills would appear *inside actual Chinese source strokes*, rather than judging isolated color squares. The [source-reconciled renderer](../tools/glyph-pipeline/source_glyph_counterfactual.mjs) reads the final 1,000-character catalog, the production SVG-to-component ownership manifest, the unchanged source SVGs, and this isolated candidate-color schema. It creates alternative files **only** for glyphs that contain at least one of the 40 candidate component IDs; all unaffected glyphs remain production-only.

For every source path, the renderer checks the path owner's original palette identity and source fill. In the isolated research image, the only permitted change is the `fill` attribute of paths whose owner is in the 40-component counterfactual. It compares normalized original and research SVG documents, requiring **byte-for-byte equality everywhere outside the selected path fill attributes**. The generated [machine-readable manifest](../site/glyphs/research/hint-counterfactual-v0.1/index-v0.1.json) records affected glyph ranks, original and candidate SHA-256 hashes, changed path counts, unchanged path counts, owner IDs and explicit pending-review status. The original active SVG files and palette are neither overwritten nor automatically linked as accepted alternatives.

This is a stronger *engineering* comparison, but does not prove that the historical hints correspond to appropriate semantic categories, that original individual components remain distinguishable under the alternative, or that a human can interpret the glyph more accurately.

The gallery additionally loads the existing **1,000-character provisional semantic screening source** and typed semantic grammar. A separate optional display toggle adds the **same** selected pictogram hypothesis under the original and experimental glyph, retaining the ability to hide or reveal the source definition and provisional candidate-meaning label. The controls preserve multiple separately proposed senses and explicitly abstain where no semantic pictogram was selected. The glyph-color conditions never differ in their meaning cue, source identity, geometry or character. The semantic-source guards keep all 897 expressions provisional and reject approvals without independent lexical or comprehension evidence.

No pictogram, historical group label, or shared-hue choice is thereby accepted as a verified Mandarin sense or educational benefit. This is a source-aligned visual **presentation** comparison, not a controlled human trial.


Run:

    node tools/glyph-pipeline/source_glyph_counterfactual_smoke.mjs
    node tools/glyph-pipeline/source_glyph_counterfactual.mjs --write
    node tools/glyph-pipeline/source_glyph_counterfactual.mjs --check
    node tools/glyph-pipeline/hint_hue_glyph_comparison_viewer_smoke.mjs

The source glyph renderer requires the generated production atlas before it can be run; these checks execute in the GitHub Pages build after the existing Rust source generation and reconciliation stages.


## Measurement and design tradeoff

The baseline [historical-group pilot](mandarin-mnemonic-hint-color-pilot.md) found almost no descriptive difference in mean OKLab distance between members of the same hint (0.216695) and members of different hints (0.220038). A separate [deterministic fixed-size random-partition benchmark](../site/mnemonic-partition-benchmark-v0.1.json) compares the observed within-group mean to 10,000 randomized label assignments. It retains the eight source group sizes, all 40 colors, and the original RGB→OKLab computation. This is a **descriptive reference distribution**, not a statistical hypothesis test or a source of linguistic validation.

The experimental grouped-hue swatches deliberately decrease same-group color distance. This sharpens the distinction between the two questions that an eventual properly controlled study must ask: (1) does sharing a hue communicate independently verified semantic affinity, and (2) does bringing component colors close together damage exact component identity recognition? The generated report includes minimum pairwise distances because even with all 40 colors unique in hex, visually tiny differences can undermine identity decoding.

**No claim of human-visible distinctiveness or educational benefit follows from the measured distances.** The historic hint categories must be independently verified before any scheme based on them is called a semantic-family color variant. The counterfactual is only a limited design control and does not close the roadmap's independent semantic-family comparison or human-testing gates.

## Reproduce and verify

    node tools/glyph-pipeline/pilot_group_counterfactual.mjs --write
    node tools/glyph-pipeline/pilot_group_counterfactual.mjs --check
    node tools/glyph-pipeline/pilot_group_counterfactual_smoke.mjs
    node tools/glyph-pipeline/mnemonic_group_counterfactual_viewer_smoke.mjs

The generator and browser reject changes to source identities, member hints or forms, duplicated proposed colors, contradictory provenance, added claims of independent semantic approval, new source scope, and direct promotion of any experimental color into the active glyph palette.

No new human comprehension, real-size glyph discrimination, or learning-effectiveness data is produced by this counterfactual.
