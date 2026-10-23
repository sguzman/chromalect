# Presentation-masked source-owner rehearsal (v0.1)

The [rehearsal gallery](../site/source-owner-masked-preview.html) is a **read-only, non-collecting engineering preview** of both source-derived component region masks for the 49 color-warning pairs across 48 first-tranche Mandarin glyphs. It requires the same original source, five-fold warning, v0.6 palette, and independently unapproved complementary locator manifests as the source-owner evidence intake.

The viewer presents a font-dependent native character and two equally sized **charcoal-on-gray region masks**, labeled Region A and Region B. It does not display the machine owner-answer label or experimental source colors in its page text. Presentation sides follow a documented deterministic trial-ID checksum convention to avoid always showing the original locator in the same panel. This is **not random assignment** or a scientifically blinded stimulus procedure; component forms and source path locators remain provisional.

The page supports 16, 24, 32, 48, 64, 96, 128 and 160 CSS pixel comparisons; all 49 pairs or the exact 23 introduced, 21 resolved and five retained warning-cohort subsets; and link fragments selecting a known public pair ID. The neutral masks preserve the original source path geometry and component mapping attributes and are independently verified as source-derived *geometry*, not accepted owner interpretations.

## Blinding and eligibility boundary

This view is **not** an independently blinded expert-review instrument. The public manifests include machine owner keys and are fetched by the browser; static SVG filenames, embedded attributes, developer tools, and the adjacent machine-key-visible evidence intake can reveal the source assignment. The native-font rendering is locally variable. The source's paired component masks are mutually derived from the same mapping, so they do not provide independent corroboration.

The rehearsal intentionally has **no assessment response controls, reviewer identifiers, evidence-note export, browser persistence, or network submission actions**. No human trials are represented by its automated tests. The [independent protocol](source-owner-independent-adjudication-protocol.md) continues to record zero independent reviewers, accepted mappings and study eligibility. A future actual reviewer-blind procedure must separately freeze preregistration, remove machine-owner metadata from reviewer-facing materials and enforce reviewer isolation with provenance/independence checks before outcomes can be called independent.

## Reproducible checks

The publication pipeline regenerates original and complementary SVGs from pinned source glyphs, validates identities and SHA-256 hashes, and then checks the viewer:

    node tools/glyph-pipeline/source_owner_masked_preview_viewer_smoke.mjs

These checks test rendering inputs, pair/size navigation, negative cases and absence of collection behavior. They cannot establish reviewer independence, legibility, or source-owner correctness.
