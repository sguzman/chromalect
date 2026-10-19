# Full component identity palette v0.2.0

**Catalog assignment complete; glyph rendering and linguistic validation incomplete.**

[Browse the 513-color swatch sheet](../palettes/mandarin-component-identity-v0.2.svg) · [Machine-readable palette](../palettes/mandarin-component-identity-v0.2.json) · [GF 0014 record index](../palettes/gf0014-2009-records-v0.2.json)

## Precisely what is colored?

**One stable color per recognized recurring visible component identity.** The original [v0.1 pilot](../palettes/mandarin-component-identity-v0.1.json) has **40 identical hex values and IDs**; not one was changed. Additional catalog shapes get new `cmp-0041` and later IDs.

The standard describes **514 component entries in 441 groups** based on **3,500 common characters** ([Ministry of Education announcement](https://www.moe.gov.cn/jyb_xwfb/gzdt_gzdt/moe_1485/tnull_45766.html)). It does **not** represent all characters ever used in Chinese or every nested component a learner might want as a recognition unit.

## What the transcribed rows reveal

- 514 source records, 441 numeric groups.
- 510 **distinct transcribed visible-form keys** because four shapes appear twice.
- The duplicates (**丷, 丁, ⺈, 𧘇**) use one component ID and color each, *not two competing colors*.
- Only 37 of the original 40 pilot component shapes directly match this standard's primitive list. **足, 青, 可** are retained as extra **macro/learning components** at their original IDs/colors. This is not an error: useful recurring graphic units need not be a leaf in a particular standard.
- This produces **513 unique Chromalect identities/colors**: the standard's 510 transcribed forms plus three original macro forms.
- **30 source forms are brace-delimited descriptions** (`{...}`), not ordinary displayable Unicode characters. They are legitimate **catalog placeholders with unique colors**, *not* ready-to-render outlines.
- Other entries may use uncommon Unicode characters or visual approximations (notably `リ`); font coverage and accuracy remain unverified.

## Source and rights

The base identity list was cross-referenced to a [community-maintained GF 0014 transcription](https://github.com/zispace/hanzi-chars-ext), at blob `3e1b8f893a5df24c92be76b05084dab964678eb1`. The project copied **only factual form/ordinal/group identifiers**, not the upstream table's OCR-suspect example text or named explanations. The transcript explicitly warns that its example data may contain OCR errors. This derivative metadata is **not formally certified** as the 2009 official table. The source has no confirmed explicit data license; rights for reuse of the original standard/transcription should be checked before broad dataset redistribution or packaging. The MIT repository license alone does not grant rights in upstream source material.

No downloadable font, pre-rendered outline, copyrighted font file, or external glyph geometry was imported.

## Color-generation method and limitations

Retained anchors: all 40 original pilot exact sRGB hex values.

For each new distinct form, in **official ordinal order**:
1. Generate OKLCH candidate colors at L = 0.43 to 0.67 (0.04 steps), C = 0.09 to 0.24 (0.03 steps), h = 0 to 356 degrees (4-degree steps).
2. Discard candidates outside sRGB or below preliminary light/dark luminance contrast filters (light ratio >= 2.65; dark ratio >= 2.3).
3. Convert to 8-bit sRGB hex, deduplicate, and choose the candidate with the greatest **minimum squared OKLab distance** from previously assigned colors; break ties in stable candidate enumeration order.
4. Never choose a color already assigned and never recolor a preserved pilot anchor.
5. Repeated appearances of one form and later extension IDs reuse the one registered color.

The canonical data file stores the **exact assignments**; the narrative above explains their generation intent. Perceptual distances between 513 colors cannot guarantee all hues are discriminable in ordinary text at small sizes. That is an **empirical limitation**, not permission to reuse colors or silently drop hard cases. Pairings inside real characters, luminance, backgrounds, color-vision differences and actual learning remain to be tested.

The official numeric group is primarily a **shape-variant classification**, not an automatically correct semantic family. As requested, recognition is the first job of the color layer. Semantic hints only exist for a few preserved pilot components.

## Component nesting and rendering

An individual source character may contain nested units and macro recognizers. A future renderer must choose a **nonoverlapping active decomposition cut** and apply each component's single fill to its owned glyph geometry. Example: if 清 is treated as 氵 + 青, its teal 青 macro is atomic at that cut, even if a deeper mode could split 青 into smaller primitives. Do not color competing nested components simultaneously.

- **Done:** 513 stable color assignments; full 514-entry standard record index; unique IDs; shape/group aliasing; 40 pilot colors preserved; swatch catalog; provenance and unresolved-form flags.
- **Not done:** mapping the components into the actual strokes of every character, validating every decomposition and 30 descriptive forms, creating a font-aware glyph renderer or testing learner performance.
- **Therefore:** no claim that text typed into Chinese apps will magically become component-colored yet.

## Next engineering gate

Before any UI or code, verify and version character-to-component decomposition choices and a compatible, redistribution-safe glyph/stroke geometry source. Once code is necessary, **Rust only**, on `main` by default.
