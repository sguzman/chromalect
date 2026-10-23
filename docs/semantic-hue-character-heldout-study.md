# Five-fold character-held-out evaluation of experimental component hues

This audit checks whether source-cooccurrence-informed component colors show **numerical transfer to source characters not used during a particular color fitting run**. It evaluates one limited part of Chromalect's Mandarin color research, without promoting a palette or semantic-family interpretation.

## Context

The active palette is **`mandarin-component-identity@0.6.0`** with 520 stable component identities. Exactly 40 historical pilot identities carry provisional mnemonic-group hints. The initial [historical-hue experiment](forty-component-group-hue-counterfactual.md) grouped those 40 components by shared hue; the in-sample optimized variant [v0.2](historical-hue-collision-constrained-pilot.md) reduced same-glyph ΔOK below 0.07 warnings from 76 to six across the first 1,000 Chinese characters. That reported optimization uses the **same 1,000 glyphs** for choosing and evaluating candidate colors. It is therefore an **in-sample** design result.

## Held-out character protocol

The new [deterministic evaluator](../tools/glyph-pipeline/semantic_group_hue_heldout.mjs) performs exactly five independent source-rank splits, using `(rank - 1) modulo 5`. Each split contains:

- **800 training characters:** only their original, source-owned component co-occurrence pairs are supplied to the coordinate-descent optimizer. The optimizer sees the active component palette and the previously defined 40 historical group-hue proposal.
- **200 excluded characters:** none of their component co-occurrences enter that fold's color-selection graph. Only after the candidate is fixed are its colors evaluated in these glyphs.
- **Two unchanged controls:** the original v0.6 palette and original first-grouped-hue variant are scored on the same 200 held-out characters.
- **One optimized hypothesis:** the 40 colors fitted on the *other 800* glyphs, scored on this held-out fold.

Every original source rank is held out **once and only once**; results are recombined to cover 1,000 held-out characters and the exact source-owned component-pair census. All five experiments preserve original glyph geometry and component identity. The distinct train/test separation is at the **character level**: the same component IDs can appear in training and held-out characters, and every fold uses the same historical mnemonic hints.

The canonical [fold report](../site/semantic-group-hue-fivefold-heldout-v0.1.json) publishes all five excluded rank lists, each fold's train and held-out pair counts, and the aggregate. The [browser](../site/semantic-group-hue-heldout.html) compares below-0.07 pair counts, with no automatic passing grade.

## Source-verified held-out result

The successful first build of the five-fold report found the following **held-out** counts across 1,020 distinct within-character source-owned component-pair observations:

| Color treatment | Pair observations below ΔOK 0.07 |
| --- | ---: |
| Unmodified active v0.6 | **26** |
| First historical-hue grouped pilot | 76 |
| Five fold-trained optimized color assignments | **28** |

There are 28 held-out glyphs with at least one warning under their corresponding fold-trained optimized colors, versus 71 glyphs with at least one warning under the first grouped-hue assignment. The **28** fold-trained close pair observations comprise **23 newly introduced** versus active v0.6, **21 resolved** original warnings, and **five retained** original warnings (23 + 5 = 28; 21 + 5 = 26). Exactly 23 held-out characters acquire at least one warning not present under v0.6. The identities of individual changed warnings should be inspected rather than treating a net +2 count as evidence that the same colors behave the same way. Each fold is fitted on the *other 800 glyphs*, so the above 28 is a sum across five independently derived candidate palettes, not the score of the full-sample v0.2 alternative.

This is substantial reduction relative to the original historical group-hue hypothesis but **does not improve on the unchanged active identity palette on this held-out warning count**. The apparent full-sample improvement to six warnings should not be treated as independent generalization evidence.

The five-fold randomization is a deterministic rank partition, not random allocation of human study participants or a pre-registered perceptual experiment. Source-specific and global palette effects remain potential confounders. These numeric results are sufficient to **withhold palette promotion**, not to pronounce a design perceptually superior or inferior.

## Source-exact color warning review gallery

The [held-out warning viewer](../site/heldout-color-warning-review.html) provides a source-ranked inspection queue for pair observations **introduced**, **resolved**, or **retained** by each fold-trained color assignment. The [generator](../tools/glyph-pipeline/heldout_color_warning_gallery.mjs) requires the exact fold-specific 40-component color map and source component IDs from the reproducible holdout report. A candidate color for a glyph comes only from the model trained on the *other 800 source glyphs*, not the separately fitted full-1,000 candidate.

Only glyphs containing a below-0.07 pair under either the original v0.6 or their fold-trained treatment receive review images. The generator:

- Cross-checks the 23 introduced, 21 resolved and five retained pair observations against source component IDs, exact hex codes, measured OKLab distances, fold exclusion rank lists and final stroke-owner mappings.
- Changes only the owned `fill` attribute of the original SVG path where a fold-specific hypothesis is available. The full SVG is checked for byte equality after normalizing the path fill attributes, preserving outlines, transforms, source component identifiers and other SVG markup.
- Publishes independent source/candidate SHA-256 checksums and unapproved review status in a [gallery manifest](../site/glyphs/research/heldout-warning-v0.1/index-v0.1.json); all original SVG files remain intact.
- Provides size, neutral background, grayscale, source rank, component ID and introduced/resolved/retained review controls. The presentation also displays W3C-formula sRGB luminance ratios for each source-versus-fold color pair. An optional semantic screening cue is displayed identically beneath the original and fold-trained glyphs, and may be hidden entirely to isolate the color condition. Multiple source-screened meanings remain separate, provisional candidates; deferred cases show no invented pictogram. There is no automated claim that a human can actually distinguish any particular pair or correctly interpret the pictogram.

The observed fold-trained warnings and source-linked glyph images are **review materials**, not independent visual testing results. This review preparation does not close the independent 1,000-glyph audit, semantic-grouping, or comprehension milestones.

## Research limitations

This evaluation is more meaningful for source-cooccurrence generalization than reporting only the full-1,000-glyph optimization score, but it **does not** validate:

- independent human component recognition, color discrimination, comprehension, memory or accessibility;
- novel component identities that are absent from the active source palette;
- any semantic grouping of the 40 source component hints, let alone a complete lexicon;
- actual acquisition or transfer beyond this fixed Mandarin character tranche.

The 5-fold total is a **collection of predictions from five differently trained color configurations**, not the held-out performance of the one in-sample-optimized v0.2 palette. The experimental colors remain strictly nonproduction, and no glyph, dictionary, person, or group is assigned independent semantic approval by a machine metric.

## Reproduce and verify

    node tools/glyph-pipeline/semantic_group_hue_heldout.mjs --write
    node tools/glyph-pipeline/semantic_group_hue_heldout.mjs --check
    node tools/glyph-pipeline/semantic_group_hue_heldout_smoke.mjs
    node tools/glyph-pipeline/semantic_group_hue_heldout_viewer_smoke.mjs

These commands run after the existing source-aligned Mandarin glyph and original first-experiment risk reports are available in GitHub Actions. Validator and viewer smoke tests reject duplicate held-out ranks, wrong fold membership, changed source palette, contradictory color counts, and fabricated human or semantic approvals.

No production colors, stroke paths, source glyphs or baseline semantic records are modified by this audit.
