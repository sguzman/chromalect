# Machine-decoded visual citation symbols (v0.1)

The visual citation codec combines three **existing** versioned encoding domains, without altering their palettes or inventing a phonological inventory:

- **Initial:** the provisional working place/manner/aspiration tuple for 21 conventional Pinyin initials, or a literal written-onset marker for `y`, `w` and zero.
- **Final:** an ordered array of registry indices addressing the nine independently authored geometric symbols for the 33 original **written final spellings**.
- **Tone:** one of the five original citation-tone symbols with its exact ordinal label (0–4).

The decoder reconstructs the original Pinyin source string and its exact initial/final/tone/glide tuple from **only the structured visual code**. It refuses unknown fields, unknown geometric index sequences, malformed tone symbols, changed initial tuples, and any initial/final/tone triple not present in the source tranche.

The [reproducible codec](../tools/glyph-pipeline/mandarin_visual_citation_codec.mjs) and [adversarial round-trip tests](../tools/glyph-pipeline/mandarin_visual_citation_codec_smoke.mjs) operate over all 1,171 readings of the first 1,000 source-ranked characters, covering 673 distinct observed triples. The [machine-readable audit](../data/phonetics/mandarin-visual-citation-codec-audit-v0.1.json) includes both the demonstrated machine counts and zero independently accepted scientific or learner outcomes.

**Scientific boundary:** this proves *machine reversibility of a literal orthographic visual notation*. The nine final symbols encode letters, **not IPA phones**, articulatory vowels or verified rhymes. The initial tuples remain provisional pedagogical candidates. No human has been shown to decode the code, and no sentence-specific reading or educational benefit has been established. The Phase 2 phonetic decoding acceptance checkpoint consequently remains open pending a validated sound-level representation and human decoding evidence.
