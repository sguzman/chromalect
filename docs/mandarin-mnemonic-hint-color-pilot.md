# Original mnemonic-hint color pilot

Chromalect's active v0.6 [component palette](../palettes/mandarin-component-identity-v0.6.json) preserves 520 stable component identities. Exactly **40 original pilot identities** carry recorded `mnemonic_group_hint` labels. The other **480** do not. These historical hints are not independently verified Mandarin semantic families, and the palette was not optimized to cluster them semantically.

The [pilot viewer](../site/mnemonic-color-pilot.html) and [machine-readable report](../site/semantic-group-color-pilot-v0.1.json) study one limited design question: how closely do original hinted components lie in the *existing* color palette?

## Source-verified cohort

| Original mnemonic hint | Source components |
| --- | ---: |
| human-body | 8 |
| movement-space | 6 |
| speech-senses | 5 |
| earth-material | 5 |
| structural-series | 5 |
| water-fluid | 4 |
| heat-light | 4 |
| plant-growth | 3 |
| **Total** | **40** |

Pairs within a named hint total 88. Pairs across different hints, among the same original 40 components, total 692. These form all 780 unordered pairs among the original 40. Each output preserves exact source component ID, Chinese form and original hex code. No hint is synthesized for the other 480 colors, and no independent language-family membership is presumed.

The [reproducible estimator](../tools/glyph-pipeline/mnemonic_group_color_pilot.mjs) converts sRGB to OKLab with the published [Björn Ottosson D65 sRGB matrices](https://bottosson.github.io/posts/oklab/) and computes Euclidean distances in OKLab. Per-hint minimum, mean and maximum within-group distances and a global between-group mean are included as **measurements of this palette**, not proof of perceptual or semantic neighborhood utility. Both within-group and between-group distributions may overlap; a lower or higher mean alone cannot establish the value of semantic visual grouping.

## Constraints and further experiment

- A mnemonic hint is historical **experimental design metadata**, not a verified lexical/semantic classification.
- A color’s visual proximity or separation does not demonstrate that a participant can remember or recognize a component.
- **No** original component color is changed, no new family hue is assigned, and no candidate is promoted to the production visual encoding.
- This is **not yet** the roadmap's independent semantic-family recoloring condition. That requires independently justified category memberships, a separately versioned alternative palette, fair control for component recognition and accessibility, and independent human study acceptance.
- The first-1,000-character [three-condition viewer](../site/visual-semantic-comparison.html) continues to use v0.6 **identity colors** with a separately toggleable provisional emoji meaning. It is not automatically reinterpreted as a semantic-family scheme.

## Reproduce

From the repository root:

    node tools/glyph-pipeline/mnemonic_group_color_pilot.mjs --write
    node tools/glyph-pipeline/mnemonic_group_color_pilot.mjs --check
    node tools/glyph-pipeline/mnemonic_group_color_pilot_smoke.mjs
    node tools/glyph-pipeline/mnemonic_color_pilot_viewer_smoke.mjs

The source validators reject changed color assignments, reassigned historical groups, unsourced new hints, duplicate component IDs/colors, changed approval states and missing pair measurements. Results remain **machine-only research evidence** with zero independently accepted semantic families and zero human comprehension outcomes.
