# Component palette background reference audit

The [520-component comparison browser](../site/color-reference-audit.html) evaluates the immutable active [v0.6 component registry](../palettes/mandarin-component-identity-v0.6.json) against pure white and pure black **sRGB reference surfaces**. The derived [audit JSON](../site/color-reference-contrast-v0.1.json) is built by the existing GitHub Pages pipeline and not edited as an independent source registry.

## Reproducible measurements

The audit uses the official W3C [WCAG 2.2 luminance and contrast ratio arithmetic](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), implemented in [reference-contrast.js](../site/reference-contrast.js). Its source color is the component's exact six-digit sRGB value; each output record preserves the original component ID, shape, source scope, and optional mnemonic hint. The formula computes the WCAG relative luminance in linearized sRGB, then the ratio `(lighter + .05) / (darker + .05)`. Rounded ratios in the JSON have six decimal places; categorical threshold tests use the **unrounded** values.

| Source reference measure | Component identities |
| --- | ---: |
| Total source component identities | 520 |
| Ratio below 3:1 on pure white | 49 |
| Ratio below 3:1 on pure black | 69 |
| Ratio below 4.5:1 on pure white | 264 |
| Ratio below 4.5:1 on pure black | 241 |
| Independently visually certified | 0 |
| Completed human discrimination trials | 0 |

These counts are reproducible current-palette properties, **not WCAG conformance grades**. The requirements and practical interpretation of WCAG text/non-text contrast vary by presentation. This experiment does not determine which criterion applies to each glyph, simulate rendered stroke antialiasing, guarantee differentiation between component neighbors, measure screen calibration or color vision, or assess comprehension. A component's visual similarity to another is a distinct issue from its solid-color contrast against a background; the separate [25-glyph/26-pair OKLab warning cohort](../site/visual-semantic-comparison.html) addresses that research question.

## Review controls

The [browser](../site/color-reference-audit.html) provides threshold filters, exact ID/form/hex search, sorting by weakest black or white reference ratio, and pagination through all 520 identities. Every result shows the identical component fill on a pure-white and a pure-black neutral square; no palette reassignment or semantic mapping is performed. A mnemonic group hint from the original registry is displayed as a **hint**, not an independently approved semantic family.

The three-condition color and meaning comparison additionally supports a theme/white/black surface selector, experimental grayscale inspection, 40–144 px source glyph sizes, and the original glyph review caution cohort.

## Verification

From the repository root after the component source is available:

    node tools/glyph-pipeline/component_palette_background_contrast.mjs --write
    node tools/glyph-pipeline/component_palette_background_contrast.mjs --check
    node tools/glyph-pipeline/component_palette_background_contrast_smoke.mjs
    node tools/glyph-pipeline/color_reference_audit_viewer_smoke.mjs

The automated tests reject changed original colors, repeated identities, mismatched source records, fabricated accessibility approvals, altered numerical ratios, and the accidental omission of records. Source-v0.6 assignment stability is independently enforced by the existing Rust project pipeline.

**Next evidence gates:** independent glyph legibility review across representative sizes and themes, structural owner correctness, palette/co-occurrence distinctions, and controlled participant evaluations before any versioned palette alternatives are proposed as improvements.
