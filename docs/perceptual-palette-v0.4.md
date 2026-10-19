# Chromalect v0.4 — unfrozen color identities

**Correction:** v0.3 protected the first 40 color mappings unnecessarily. **v0.4 unlocks all 513 component IDs**, including the first 40. Identity colors are stable inside *each* version, not permanently across versions. All old palettes remain available for reproducibility.

## What changed

- **39/40 original assignments changed**, **512/513** total assignments changed.
- All component IDs, shapes, the complete 514-record reference mapping and uniqueness are preserved.
- The complete original set of 513 hex colors is retained, **but reassigned without any locked IDs**. That keeps the v0.3 global minimum OKLab and CIEDE2000 separation intact while improving color placement relative to the component-pair graph. This is *assignment optimization*, not proof of globally optimal 513-point color packing.
- Before this version, an unconstrained fresh-color trial achieved better graph metrics but reduced global minimum CIEDE2000 from 3.997 to approximately 3.84. That proposal was rejected. More sophisticated full-set optimization is a future experiment, not concealed inside v0.4.

## Reproducibility

Machine-readable [registry](../palettes/mandarin-component-identity-v0.4.json), [visual swatches](../palettes/mandarin-component-identity-v0.4.svg), [514 record mapping](../palettes/gf0014-2009-records-v0.4.json), and [v0.3/v0.4 metrics](../palettes/perceptual-comparison-v0.4.json).

The graph has 315 candidate edges: source components appearing together in 31 pilot decomposition specimens (weight 15); provisional visually confusable forms (weight 12); GF transcription shared shape groups (weight 4); and overlapping sample characters in a third-party transcription (weight 1; potentially OCR-affected). Group and confusability edges are **not** automatically actual co-occurrences.

Colors evaluated in **OKLab and CIEDE2000** (D65 Lab), not raw RGB. [CIE color difference definition](https://www.cie.co.at/publications/colorimetry-part-6-ciede2000-colour-difference-formula-1). The objective also includes approximate simulated protan/deutan separation, not a substitute for accessibility tests.

A weighted edge penalty increases when normal ΔE00 is below 26, with smaller penalties when simulated protan/deutan ΔE00 is below 10. Node assignments are greedy in descending weighted graph degree. All 513 colors are available to every node, then 40,000 deterministic proposed swaps (seed 4213373) refine assignments. Accepted swaps: 0.

## Computational results

| Measure | v0.3 | v0.4 |
|---|---:|---:|
| Frozen assignments | 40 | **0** |
| Global minimum OKLab | 0.02109 | 0.02109 |
| Global minimum CIEDE2000 | 3.997 | 3.997 |
| Weighted mean candidate-pair ΔE00 | 40.008 | 44.076 |
| Candidate pairs with ΔE00 under 12 | 6 | 0 |
| Candidate pairs with ΔE00 under 20 | 14 | 0 |
| Approximate protan pairs under 9 | 7 | 0 |
| Approximate deutan pairs under 9 | 12 | 0 |

There has been **no human visual-discrimination study**, no actual component-colored Chinese glyph rendering, and no reliable complete character decomposition data. The model does not ensure that each pair is distinguishable at reading size. Semantic families are subordinate to component-identity discrimination.

## Further experiment

A subsequent v0.5 could also **change the 513-color set itself**, replacing poorly separated members using a more advanced global packing strategy while maintaining graph-weighted co-occurrence contrast and ensuring neither global minimum worsens. Do not freeze any identity assignments in that study either.
