# CC-CEDICT numeric Pinyin spelling crosswalk

The versioned [numeric Pinyin index](../data/phonetics/cedict-numeric-pinyin-orthography-v0.1.json) mechanically converts the 1,393 recorded character-reading labels in the pinned CC-CEDICT screening ledger into NFC diacritic Pinyin using the same orthographic decoder as the separate 1,171-entry citation baseline.

**Source-preserving result:** 1,392 reading labels have a unique full-syllable split among Chromalect's published initial and final spelling tokens. The remaining source label, `r5` for 儿 (rank 12), is kept as an explicit nonconforming record. The codec does not invent an initial/final split or silently rewrite this rhotic suffix notation into a canonical citation syllable.

CC-CEDICT neutral tone 5 maps to the project's tone-0 channel for *display purposes only*. Source-case distinctions such as `Ding1` versus `ding1` are preserved in the original labels, with lowercase spelling normalization for comparison. That does not merge proper-name and general lexical uses.

Run `node tools/glyph-pipeline/cedict_numeric_pinyin_codec.mjs --check` to verify the published index deterministically. The index makes no contextual sentence assignments, no phonemic claims, and no sense or pictogram approvals. The 1,392/1,393 statistic is **mechanical spelling coverage**, not independent pronunciation validation.
