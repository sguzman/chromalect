# Source-aligned color and semantic presentation comparison v0.1

The [three-condition browser](../site/visual-semantic-comparison.html) compares a single Mandarin character with a **constant underlying source glyph outline**:

1. **Plain geometry** — the same versioned source SVG used as an alpha mask, drawn in the current neutral ink color.
2. **Component identity** — the source SVG with the active v0.6 component colors assigned by the project’s palette and stroke ownership mapping.
3. **Component identity plus semantic candidate** — the identical colored SVG plus an independently removable, source-linked pictogram hypothesis from the character's semantic screening.

The conditions deliberately hide citation Pinyin, tone contours, alternative spellings, and other nonsemantic overlays. Only the tested visual dimension changes. The Unicode character remains the source identity in all conditions.

## Data and rejection gates

The browser reads the *generated* `site/profiles/mandarin-1000-v1.json` and the source-screened `site/semantic/mandarin-1000-v0.1.json`. Both must contain exactly 1,000 aligned source ranks and characters. Every displayed source glyph must carry `source_aligned_visual_review_pending` and the expected character-indexed SVG asset. The semantic file must retain 881 characters with candidates, 119 with no selected pictogram, 897 expressions, and zero production-verified senses. Every expression is checked with the versioned semantic grammar. A deferred character displays **semantic abstention**, not a guessed substitute pictogram.

The source-linked [glyph review worklist](../site/glyph-review-worklist.html) is independently generated from the same final-source geometry and palette. The comparison checks all 1,000 review identities against the matching character, SVG filename and pending approval state. Its color-review cohort contains **25 machine-flagged glyphs and 26 component color pairs** below the project’s ΔOK 0.07 threshold. It checks each warning against the source glyph’s component ID, form and original hex color, without reassigning the palette. A filter visits exactly those 25 glyphs; separate filters surface the 119 pictogram-deferral cases and multiply proposed meanings. Warnings are reproducible review priorities, not established human discrimination thresholds. Individual review cards deep-link to the matching comparison character.

The third condition also has an independent **Show technical event markers** toggle. The default pictogram-only display remains unchanged. When an experimental expression is typed as an `event`, the toggle reveals an explicit `▶` prefix from the already documented [semantic-expression grammar](semantic-expression-grammar-v0.1.md). It is not a Mandarin character meaning, an audio/playback control, or an approved semantic symbol. This enables side-by-side inspection of a known ambiguity: 73 pictogram forms are shared by action and non-action research candidates, as documented in the [event-role contrast audit](mandarin-event-role-contrast.md). The toggle must not introduce or silently infer participant roles, especially because the active event candidate records contain no populated participant-role assignments.

The variable glyph-size control applies to all conditions simultaneously. The independent **Inspect component colors in grayscale** toggle applies the browser's CSS grayscale filter to the identity-colored and color-plus-semantic SVGs and their exact-color swatch displays, leaving the source geometry, original palette data, neutral condition and pictogram tokens untouched. This is a practical monochrome display diagnostic, **not** a validated simulation of color-vision deficiency or an accessibility certification. The original hex labels remain available even when displayed patches are desaturated. Source definitions and the proposed meaning label are hidden by default to avoid making the candidate visually self-explanatory in an informal first look. A reversible control reveals them. This is not a blinded or randomized human comprehension trial and collects no subject data. Browser font and emoji rendering, display profile, and perceptual discriminability remain uncontrolled; no learning-effectiveness or legibility outcomes are asserted.

The plain condition uses an SVG transparency mask instead of a native font, so it preserves the same source geometry as the colored conditions. This avoids confounding a plain/colored comparison with changes in font shape. Rendering support for CSS masks must still be visually checked in target browsers before experimental use.

## Scope and unfinished work

This comparison is **not** the independent semantic-family recoloring condition listed in Phase 1. The colored glyphs use the existing invariant identity palette, not a new semantic hue palette. It does not modify palette identities, accept dictionary readings or lexical senses, certify geometry, perform source-aligned human color discrimination, or measure retention. The remaining independent visual audit, legitimate semantic family membership definitions, user comprehension testing, and appropriate randomized comparison protocols are separate gates.

Run the regression suite using:

    node tools/glyph-pipeline/visual_semantic_comparison_viewer_smoke.mjs

The validator checks all 1,000 original character ranks against original source-screening records, identical geometry links across conditions, all 26 machine proximity pairs linked to their glyph/component colors, clear abstention on deferred meanings, independently selected research focus, source-rank deep links, size/source-label controls, and rejection of fabricated approvals or source drift.
