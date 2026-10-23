# Reversible written-final geometric symbol control (v0.1)

An independent source-orthographic visual baseline represents each of the **33 published final remainder spellings** with a sequence drawn from nine arbitrary, monochrome geometric primitives. The primitive inventory codes the literal characters `a, e, g, i, n, o, r, u, ü`; it does **not** represent phonological vowel height, backness, consonantal codas, or IPA symbols.

Every source final retains its original spelling and original identity palette. Across the pinned 1,171 Mandarin citation readings, all 33 written-final tokens round-trip exactly; the 33 resulting geometric sequences are distinct. Primitive ordering is preserved, not normalized into conjectural vowels. No rendered Hanzi stroke is edited.

This design provides a **non-featural symbolic control** for future experiments comparing plain Pinyin, arbitrary letter-code symbols and separately sourced actual phonetic-feature encodings. A reader's ability to infer or memorize these arbitrary symbols is unknown. Displaying a code without labels does not constitute a human decoding trial.

The [machine registry](../data/phonetics/written-final-symbol-control-v0.1.json) and `tools/glyph-pipeline/written_final_symbol_control.mjs` provide reproducible source alignment. The linked [final-spelling contextual exception inventory](../data/phonetics/mandarin-final-spelling-context-gates-v0.1.json) remains a hard caution: a one-letter written code cannot be mistaken for a one-sound phonetic code, particularly for the 213 source readings in selected context-dependent spelling categories.
