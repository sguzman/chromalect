# Perceptual color optimization: v0.3

**Status:** versioned experiment; numerical comparison complete; no human study and no colored-character renderer.

[513-color v0.3 registry](../palettes/mandarin-component-identity-v0.3.json) · [v0.3 swatches](../palettes/mandarin-component-identity-v0.3.svg) · [all metrics](../palettes/perceptual-comparison-v0.3.json) · [v0.2 unchanged](../palettes/mandarin-component-identity-v0.2.json)

## Why perceptual distance matters

Hex and RGB values are device encodings, not uniform units of perceived difference. v0.2 already spaced colors in OKLab; that was better than raw hex spacing, but not a guarantee. v0.3 additionally scores **CIEDE2000**, incorporating sensitivity differences in lightness, chroma and hue ([CIE's definition](https://www.cie.co.at/publications/colorimetry-part-6-ciede2000-colour-difference-formula-1)). All perceptual models are approximations; the standard's reference conditions are not identical to tiny glyph strokes on arbitrary monitors.

For potential red-green color-vision differences, approximate fixed linear-light transformation matrices based on the work of [Machado et al.](https://pubmed.ncbi.nlm.nih.gov/19834201/) inform the penalty, but this is **not an accessibility certification**. Colors must still be recognized by shape, optional boundary markings or explicit ID inspection when color is insufficient.

## Constraints

1. **Keep original first 40 IDs and exact colors unchanged.** All 513 IDs keep their associated shapes.
2. Improve *candidate* within-character co-occurrence contrast.
3. Prioritize visual lookalikes and variant component forms.
4. Distribute the entire set across perceptual color space.
5. Preserve v0.2 and its source mappings. **Never mutate older experiments in place.**

## Data and uncertainties

A graph of **315 pairs** was assembled from the repository's 31 candidate specimens (weight 15), example-character overlaps in a [third-party GF 0014 transcription](https://github.com/zispace/hanzi-chars-ext) (weight 1), source-standard shape-variant groups (weight 4), and 26 manually identified lookalike pairs (weight 12).

The transcription is at blob `3e1b8f893a5df24c92be76b05084dab964678eb1`. Example overlaps are **noisy indications**, not verified decompositions; some source examples have OCR errors. Variant and lookalike relationships are about confusion, not necessarily actual character co-occurrence. The graph is not representative of all 3,500 source characters, much less all modern Chinese.

The palette experiment reused only the factual component inventory, source group indices, and derived pair relationships. The upstream source's copyright and terms remain to be assessed before packaging third-party corpora.

## Reproducible algorithm parameters

- Candidate grid: OKLCH lightness `L = 0.395 + 0.021 i` for `i=0..15`; chroma `C = 0.072 + 0.021 j` for `j=0..8`; hue every 5 degrees.
- Convert to sRGB; remove out-of-gamut colors, duplicates, original anchor hex values, white contrast below 2.85 or black contrast below 2.45. **4463** candidates remain.
- Greedily choose 473 colors maximizing the minimum of `Euclidean OKLab` and `CIEDE2000 / 190` distance against already chosen colors, starting from 40 fixed anchors.
- Create weighted pair edges: 15 for a pilot specimen, 1 for a third-party example overlap, 4 for shared GF variant group, 12 for a manually proposed lookalike. Combine duplicate pairs by adding weights.
- Cost function for neighboring component colors: `max(0,(24-ΔE00)/24)^2 + 0.27 max(0,(9-ΔEprotan)/9)^2 + 0.27 max(0,(9-ΔEdeutan)/9)^2`. All cutoffs are *heuristic*.
- Assign colors to unfrozen components in decreasing total weighted edge degree, choosing the least-cost unused color relative to already assigned neighbors.
- Improve with 30,000 proposed edge-guided swaps among unfrozen components, LCG pseudorandom seed 4213373, accepting only decreases in total edge loss. **0** swaps accepted.
- Store exact hex colors and full objective comparison. These parameters alone are not an executable reference implementation; machine-readable assignments are authoritative.

## Measured model comparisons

| Metric | v0.2 | v0.3 |
| --- | ---: | ---: |
| Unique identity colors | 513 | 513 |
| Smallest global OKLab separation | 0.025 | 0.02109 |
| Smallest global CIEDE2000 separation | 1.99 | 3.997 |
| Smallest OKLab separation involving a movable color | 0.025 | 0.02109 |
| Weighted mean candidate-edge CIEDE2000 | 35.429 | 40.008 |
| Candidate pairs below ΔE00 12 | 35 | 6 |
| Candidate pairs below ΔE00 20 | 88 | 14 |
| Frozen-to-frozen graph edges | 39 | 39 |

**These numbers describe modeled color-distance results**, not improved retention, human discrimination, visual accessibility, or correct placement of colors inside real characters. No user study has been run.

## What is still needed

- Verify decompositions and secure a legal, repeatable glyph geometry source.
- Compare v0.2 and v0.3 *inside the same Chinese glyphs* at actual rendered size.
- Audit light/dark theme, smaller type, and multiple viewing conditions.
- Test color-vision differences with people rather than relying solely on simulations.
- Add an optional non-color discriminator for hard-to-distinguish combinations without changing their canonical color identity.

No Rust crate or UI introduced.
