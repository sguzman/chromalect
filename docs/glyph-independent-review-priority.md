# First-tranche glyph independent-review priority

The final source-backed Rust pipeline produces `site/glyphs/mappings.json`, `site/glyphs/review/report.json` and `site/glyphs/coverage.json` during GitHub Pages publication. They do **not** exist as independently edited source datasets. The review index is therefore regenerated **after** the full pinned Chinese-source recovery and 1,000/1,000 coverage checks.

Run `node tools/glyph-pipeline/glyph_independent_review_worklist.mjs --write` from the repository root **only after generating the complete source-backed glyph set**. Its output is `site/glyphs/review/independent-review-worklist-v0.1.json`, not a committed replacement of the source geometry. It rejects missing mapping/review pairs, changes in palette version, overlapping source identities, mismatched path-owner lengths, unexpected mapping methods and fabricated review approvals.

The source-first review order is:

1. Automatic geometry/color warnings, as *review hints*.
2. Documented alternate source cuts.
3. Other Chinese cross-source geometric reconciliations.
4. Source subglyph transfer candidates.
5. Direct multicomponent source alignments.
6. Atomic or single-component source alignments.

The same glyph appears only once, even when several review flags are present. Any automatic flag remains non-certifying. No source material is changed, and **all 1,000 glyphs are still pending independent visual and linguistic inspection**. A pipeline-generated list does not make glyphs eligible for participant studies.

The generated index should be checked with `--check` after production and preserved as part of the deployment. Machine-readable group counts are factual checks on the build output, not a completion score for independent review.

## Recorded OKLab proximity measurements

The dated October 23, 2026 source-backed Pages generation reported 25 first-tranche glyphs with 26 distinct component-color proximity pairs below ΔOK 0.07, spanning 0.0224 through 0.0692 in OKLab distance. These are **machine thresholds, not perceptual thresholds established by human subjects**. All warnings in that build are for close colors, not geometry-order flags. The worklist retains each flagged pair's original, immutable v0.6 component IDs, source colors, and recorded distance. Flagged rows are sorted by the smallest observed distance, then by source rank. No palette colors are reassigned.

## Reading-size visual controls

The [held-out warning gallery](../site/heldout-color-warning-review.html) supports original and fold-trained glyph inspection from 16 through 160 CSS pixels (8-pixel increments), including 16, 24 and 32 px reading-scale cases. Same-size source geometry and grayscale/white/black controls remain available. This is a *display inspection*, not calibrated human discrimination testing or independent readability certification.

## Source region evidence

The [49-region source-owner evidence intake](../site/component-owner-adjudication.html) permits separately sourced provisional judgments on the 49 held-out color-warning locator regions, with SHA-256-linked source identity, original v0.6 colors and fold-trained comparison. It does not count as independent glyph certification, overwrite source owners, or establish participant-study eligibility. See the [region review protocol](source-owner-region-adjudication-intake.md).

## Local-only observational intake

The [glyph review intake](../site/glyph-review-intake.html) reads the generated 1,000-glyph worklist and shows each original character alongside its source-colored SVG. It collects only local provisional assessments of geometry, source component ownership and visually close colors. A reasoned assessment requires a technical rationale and an independent HTTPS evidence reference. Export is source-linked JSON with absolute zero certification claims; nothing is automatically stored or uploaded.

This is a research instrument, **not** an independent visual review campaign. A recorded assessment does not confer source-path approval, expert linguistic certification or study eligibility. Evidence quality, reviewer provenance, sampling protocol and any independent adjudication procedure remain separate outstanding work.
