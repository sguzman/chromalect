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
