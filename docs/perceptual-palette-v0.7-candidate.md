# v0.7 candidate: measured first-tranche color-cooccurrence revisions

The active Mandarin component palette remains **v0.6**. The v0.7-candidate experiment is a separately versioned, nonactive color assignment computed from the final generated first-1,000-glyph source-owner graph. No original stroke, shape, source identity, or active palette is modified.

## Existing numerical failure cases

Source-owned strokes in the first 1,000 ranked Chinese characters expose **1,020** distinct-component-pair observations, including **26** machine-measured close pairs at OKLab distance below **0.07**. These are color-distance *warning cases*, **not** demonstrated human failures or certifiable accessibility violations. Their input component ownership remains unverified by independent visual reviewers.

## Controlled new palette experiment

The verified candidate reduced the **26 v0.6 proximity warnings to zero** in the current 1,000-character source tranche, requiring **10 deterministic palette value swaps** and **introducing no new observed close pairs**. The evidence was checked against the source-owned glyph manifest in [GitHub Pages CI run 40117569240](https://github.com/sguzman/chromalect/actions/runs/40117569240). This is an in-sample numerical result, not a perceptual result.

The [native Rust source processor](../tools/glyph-pipeline/src/palette_candidate.rs) considers swapping exact color values among the full 520 component identities, using only the source-owned co-occurrence pairs. It chooses reproducible swaps that strictly reduce weighted close-pair warnings. It rejects any swap that introduces a close pair absent from the active palette's 1,000-glyph graph. Because every RGB value is only *permuted*, the complete global 520-color distance multiset and global closest distance remain unchanged. Color identities are stable **within each version**, never reassigned silently.

The source-aligned [candidate palette](https://sguzman.github.io/chromalect/palettes/mandarin-component-identity-v0.7-candidate.json) and its [per-glyph evidence ledger](https://sguzman.github.io/chromalect/palettes/mandarin-component-identity-v0.7-candidate-evidence.json) are generated during GitHub Pages builds from the pinned 520-color v0.6 palette and generated 1,000-glyph path-owner manifest. The initial project code does not check in generated source glyph manifests; the CI job reconstructs them from independently pinned upstream geometry before producing the candidate. A second deterministic run verifies byte-identical outputs. No candidate is published if the new mapping has zero numerical improvement.

## Unresolved acceptance requirements

This is an *in-sample optimization control*, not a held-out validation or an end-user perception study. Source decomposition and owner correctness, semantic-family assignment, near-glyph-size legibility, color-vision accessibility, learning and transfer remain unapproved. A candidate should not replace the active identity palette without external assessment and deliberate adoption of a new version. The roadmap's **"Document failure cases and iterate with new palette versions"** requirement stays pending until actual human-relevant failure cases and iteration evidence are obtained.
