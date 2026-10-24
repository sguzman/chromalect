# Five-fold character-held-out test of the v0.7 numerical palette candidate

The existing experimental [v0.7 color reassignment](perceptual-palette-v0.7-candidate.md)
eliminates 26 original same-glyph OKLab pair warnings by applying ten swaps to the original
520-color v0.6 multiset. **Those 26-to-zero observations are in-sample**, because the
algorithm selected color swaps using the same 1,000 ranked characters on which it reported
the zero warnings.

The [native Rust held-out evaluator](../tools/glyph-pipeline/src/palette_candidate_cv.rs)
reuses the *identical deterministic greedy color swap algorithm* but keeps each excluded
fifth of the original 1,000 ranked glyphs entirely outside color fitting:

- Five folds, each with **800 training** and **200 unseen** original source ranks.
  Rank `r` belongs to fold `(r-1) % 5`; every original character is held out once.
- During a fold, **only the 800 training glyphs' exact component-owner pairs** are passed
  to the optimization algorithm. Training swaps may not introduce any new near-color
  co-occurrence on those training glyphs. The globally assigned v0.6 520 sRGB colors
  are only permuted; no color, component ID, source stroke geometry or owner is changed.
- Once the fold's candidate assignment is fixed, the other **200 glyphs** are scored
  against both the unmodified v0.6 assignment and that *fold-specific* candidate.
  A near-color pair is a machine warning below **ΔOK 0.07**, not a demonstrated
  perceptual or learning failure. Each fold counts newly introduced, resolved and retained
  warnings separately, and identifies its original held-out source ranks.
- The five evaluation folds add up to the same **1,020 ranked intra-glyph component-pair
  observations**, and each original rank is included in an unseen test set exactly once.
  The [fold report](https://sguzman.github.io/chromalect/palettes/mandarin-component-identity-v0.7-fivefold-heldout-v0.1.json)
  is generated and bytewise re-verified during the existing Pages build.

This result is **not a held-out test of the one, already-fitted full-tranche v0.7
assignment**. Rather, it measures how the *method* generalizes when independently fitted
to each of five 800-glyph training subsets. These are separate candidate palettes.
The training constraints cannot guarantee zero warnings on excluded characters, and
the results must be interpreted exactly as observed—not automatically marked a win.

## Observed five-fold outcome, verified 24 October 2026

The first **successful source-built run** on `main`,
[GitHub Pages CI run 40126043451](https://github.com/sguzman/chromalect/actions/runs/40126043451)
at commit `ceb8ef681a674e588e78d4dd8f712950ffd8f919`, generated
the exact [versioned fold JSON](https://sguzman.github.io/chromalect/palettes/mandarin-component-identity-v0.7-fivefold-heldout-v0.1.json).
The log independently reports the baseline and candidate counts, and the
published build artifact supplies the fold-level source observations.

| Excluded fold | Training warnings before → after | Unseen pair observations | v0.6 unseen warnings | Trained candidate unseen warnings | Newly introduced | Resolved | Retained | Swaps |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 21 → 0 | 195 | 5 | 4 | 1 | 2 | 3 | 9 |
| 2 | 22 → 0 | 223 | 4 | 5 | 3 | 2 | 2 | 9 |
| 3 | 16 → 0 | 199 | 10 | 9 | 4 | 5 | 5 | 8 |
| 4 | 20 → 0 | 203 | 6 | 6 | 0 | 0 | 6 | 8 |
| 5 | 25 → 0 | 200 | 1 | 5 | 5 | 1 | 0 | 9 |
| **Total** | **0 remaining on each training subset** | **1,020** | **26** | **29** | **13** | **10** | **16** | **43** |

Every original glyph was excluded from fitting in exactly one of the five tests;
the 1,000 unseen ranks and 1,020 source pair observations are preserved. The fold
permutations remove **all** their *training* warnings yet **increase** the pooled
held-out warnings from **26 to 29**, introducing 13 new near-color pairs and resolving
10 baseline warnings. Five separately trained palettes contributed 43 swaps in
aggregate; this is **not** the ten-swap whole-sample palette.

**Decision: numerical generalization failed on this exact warning metric.**
The unmodified v0.6 identity palette performs better in aggregate on these held-out
source co-occurrences. Keep v0.7 **experimental and nonactive**; do not promote it
from the earlier 26-to-zero in-sample result. This does *not* prove that v0.6 is
perceptually superior—no original stroke-owner mapping has independent visual
approval, and ΔOK thresholds do not represent measured human discrimination.

The [pinned numerical acceptance check](../tools/glyph-pipeline/palette_candidate_cv_observed_smoke.mjs)
requires the build to reproduce these independently observed per-fold counts
and conservation identities. The numerical result is a real research deliverable,
but it does not complete the Phase 1 human palette iteration gate.

No independently accepted component decompositions, human visual separation,
low-vision accessibility, semantic-family classifications, learner retention or transfer
outcomes are supplied by this test. The active component palette stays v0.6, and
the full Phase 1 human failure/iteration acceptance gate remains open.
