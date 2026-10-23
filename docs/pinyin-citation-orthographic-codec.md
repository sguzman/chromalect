# Reversible Pinyin spelling baseline

Chromalect's **citation spelling codec v0.1** reconstructs Unicode NFC Hanyu Pinyin labels from the published 24 orthographic initial tokens, 33 final spellings and five citation-tone labels (0–4), and decodes those labels back into the same source tokens. Its intended contract is **exact orthographic round-trip**, not articulation, phoneme classification, IPA, or word-context reading approval.

The source is the existing Apache-2.0 `site/pronunciation-citations-0001-1000.json`, with palette/token identities from `site/layers-v0.1.json`. The audit covers 1,000 ranked characters and all 1,171 listed citation readings; 159 use the existing y/w orthographic-glide flag. Tone zero has no accent, while tones 1–4 use NFC combining-mark composition and canonical Hanyu Pinyin vowel placement. The parser requires an unambiguous initial/final split and rejects noncanonical or multiply accented spellings.

**Test gate:** `node tools/glyph-pipeline/pinyin_citation_roundtrip.mjs --check`. A separate smoke test exercises exact rendering, decoding, neutral vowels, ü, diacritic errors, invalid tone placement, and changed source records. Source meanings and original palette assignments remain unchanged.

This is a bounded experimental control for future phonetic notation comparisons. It is not an inventory of independently established Mandarin phonemes, a featural notation, contextual sentence disambiguation, or a finding that any visualization aids learning. Do not confuse 1,171/1,171 spelling reversibility with the pending independent phonological and educational acceptance gates.
