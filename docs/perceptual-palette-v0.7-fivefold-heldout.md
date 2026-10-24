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

No independently accepted component decompositions, human visual separation,
low-vision accessibility, semantic-family classifications, learner retention or transfer
outcomes are supplied by this test. The active component palette stays v0.6, and
the full Phase 1 human failure/iteration acceptance gate remains open.
