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
