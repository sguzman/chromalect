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

## Source-owned failure case coordinates

The versioned fold report now includes one record for **every near-color pair
observed under either the active assignment or its separately trained candidate**.
The measured categories comprise **13 introduced + 10 resolved + 16 retained =
39 source-glyph pair observations**. Each record names the original held-out
glyph rank/character, two stable component IDs, their before-and-after exact
sRGB colors, their original and candidate OKLab distances, its
introduced/resolved/retained classification, and explicit pending ownership
and human-discrimination status.

### All 13 newly introduced held-out warnings

These are the original character ranks and component identity pairs the
v0.7 training-fold assignments moved into the below-0.07 OKLab warning
range **without ever fitting to that character**. Both distances are shown
as four-place approximations; the generated JSON contains unrounded values
and is authoritative at the strict cutoff.

| Fold | Unseen source rank and character | Component IDs | Active → fold-candidate ΔOK |
| --- | --- | --- | ---: |
| 1 | 651 志 | cmp-0016 / cmp-0341 | 0.0974 → 0.0603 |
| 2 | 362 圾 | cmp-0025 / cmp-0186 | 0.1882 → 0.0700 |
| 2 | 642 抛 | cmp-0040 / cmp-0216 | 0.1906 → 0.0632 |
| 2 | 862 沃 | cmp-0002 / cmp-0438 | 0.3292 → 0.0605 |
| 3 | 243 号 | cmp-0020 / cmp-0168 | 0.2602 → 0.0491 |
| 3 | 463 伐 | cmp-0013 / cmp-0150 | 0.1780 → 0.0471 |
| 3 | 518 齐 | cmp-0351 / cmp-0390 | 0.3095 → 0.0618 |
| 3 | 858 汰 | cmp-0002 / cmp-0370 | 0.2497 → 0.0617 |
| 5 | 405 邪 | cmp-0359 / cmp-0427 | 0.2128 → 0.0305 |
| 5 | 485 全 | cmp-0012 / cmp-0383 | 0.1178 → 0.0599 |
| 5 | 495 肌 | cmp-0008 / cmp-0188 | 0.2355 → 0.0652 |
| 5 | 615 技 | cmp-0019 / cmp-0334 | 0.1910 → 0.0631 |
| 5 | 830 况 | cmp-0003 / cmp-0312 | 0.1232 → 0.0653 |

The 0.0700 displayed for 圾 rounds upward but is **strictly below 0.07
before rounding**, as verified by the raw generated report and acceptance
test. These are potential source color **proximity risks**, not confirmed
reader confusions or source stroke-owner approvals.

This identifies the **actual source components and glyphs** implicated by
held-out color warnings, rather than merely presenting aggregate counts.
The generator refuses missing source-glyph geometry ownership, component-color
mismatches or rank leakage; the JavaScript acceptance test separately verifies
the original generated mapping and every 39-item classification. The records
are a numerical **failure case worklist**, not 39 independently observed
visual errors or approved shapes. No existing glyph color or palette is altered.

## Exploratory swap-prefix diagnosis

The five-fold report also records the held-out warning count after **every
successive training-only greedy swap**, along with the strictly decreasing
training warning count. Replaying the fitted swap sequence does not alter its
final assignment: the last prefix must reproduce the reported outer-fold
warning counts exactly. The regression checker rejects prefix count
inconsistencies, non-decreasing training objectives or a replay mismatch.

These intermediate held-out scores are **post-hoc diagnostic evidence**, not a
method for choosing a stopping point. Selecting a prefix, algorithm or penalty
from the excluded 200 glyphs would reuse the test data for tuning. Any
promising rule requires a separately specified selection procedure within
the 800 training glyphs and evaluation on a fresh untouched test partition.
This analysis adds no glyph ownership, color-accessibility or human approval.

The [pinned numerical acceptance check](../tools/glyph-pipeline/palette_candidate_cv_observed_smoke.mjs)
requires the build to reproduce these independently observed per-fold counts
and conservation identities. The numerical result is a real research deliverable,
but it does not complete the Phase 1 human palette iteration gate.

No independently accepted component decompositions, human visual separation,
low-vision accessibility, semantic-family classifications, learner retention or transfer
outcomes are supplied by this test. The active component palette stays v0.6, and
the full Phase 1 human failure/iteration acceptance gate remains open.
