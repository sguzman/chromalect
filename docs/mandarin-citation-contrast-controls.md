# Working Mandarin orthographic contrast-control cohorts (v0.1)

This source-indexed candidate inventory is generated deterministically from the first 1,000 source characters and their **1,171 listed citation readings**. It selects the earliest-ranked source character for each of the 673 distinct (written initial, written final, citation tone) triples, then constructs **710 possible contrast controls**. All resulting pairs are candidates for researcher inspection, not established *spoken phonetic minimal pairs*.

The three bounded cohorts are:

- **533 written-tone controls:** fixed Pinyin initial and final tokens with two differing listed citation tone labels.
- **89 working aspiration controls:** fixed written final and source citation tone across b/p, d/t, g/k, j/q, zh/ch and z/c initial categories (respectively 11, 18, 15, 19, 24 and 2 source-attested matches).
- **88 final-spelling controls:** same source initial and citation tone, with the written final spellings differing by exactly one Unicode code point. The generator retains at most one candidate for each observed initial/tone group, choosing the smallest sum of source character ranks, with deterministic tie-breaking. A written-letter difference is **not** evidence of a single distinctive acoustic or articulatory feature difference.

This source is not a word-context pronunciation corpus. A Chinese character may have multiple citation readings and does not certify how either spelling is pronounced in speech or in a word. No external expert review, audio discrimination, human decoding, or learning effectiveness testing has been performed.

The [machine-readable cohort index](../data/phonetics/citation-orthographic-contrast-controls-v0.1.json) records attribution and the original source revision. The authoritative builder is `tools/glyph-pipeline/citation_orthographic_contrast_controls.mjs`; use `--check` or `--write` after changing the source tranche. The complete audit and source-selection invariants run in the Pages build.
