# Provisional Mandarin initial-feature machine codec

The v0.1 codec preserves exact *source Pinyin initial labels* across a strict feature tuple representation, not an approved phonological transcription. For twenty-one conventional consonantal initial spellings, `encode` produces a versioned place/manner/aspiration tuple. The inverse `decode` maps each unique tuple back to its original Pinyin token. For y, w and ∅, the encoding is explicitly an **orthographic onset convention**, never a fake consonant/IPA phoneme.

The machine test covers all 1,171 pinned citation readings: 997 conventional consonantal-initial occurrences plus 174 orthographic-onset occurrences. Any unrecognized token, feature tuple, extra field, malformed encoding or collision fails closed. It also tests the six existing aspiration contrasts while retaining the original citation source and palette unchanged.

The JSON audit file and CLI command are:

- `data/phonetics/initial-feature-codec-audit-v0.1.json`
- `node tools/glyph-pipeline/mandarin_initial_feature_codec.mjs --check`

**Scope limitation:** A successful machine roundtrip only shows that the three declared *metadata* features uniquely identify each of the 21 provisional orthographic initial categories. It does not prove an accurate phoneme inventory, context-specific speech production, legible featural glyphs, or a human learning advantage. Finals and tone remain separate. The full phonetic decoding grammar and external review are outstanding.
