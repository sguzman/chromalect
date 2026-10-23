# CC-CEDICT written-form and pronunciation reference cues

**Status:** automated extraction of source-internal cross-reference tokens, not independent contemporary Mandarin word-usage evidence.

The existing pinned dictionary text embeds references in the form `文字[pin1 yin1]`, including occasional `traditional|simplified[pinyin]` alternatives. An exact-token scanner captures only explicit written-form/Pinyin matches from the source excerpts under their documented character reading sections. It does not normalize regional variants, infer examples, or invent missing links.

| Inventory measure | Count |
| --- | ---: |
| Pinned first-tranche characters checked | 1,000 |
| Pinned dictionary reading sections checked | 1,393 |
| Explicit source cross-reference token occurrences | **469** |
| Source reading sections containing such tokens | **349** |
| Characters containing any cross-reference token | **314** |
| Distinct written-form/Pinyin target pairs | **342** |

Occurrences are preserved even when a source repeats a target. A reference can denote a related word, radical, alternative orthography, surname or unrelated lexicographic pointer: **none is automatically an attested contextual example or approved sense**. In particular, the collection does not populate Chromalect's separate whole-word semantic layer.

## Reproduction and provenance

The [machine-readable inventory](../data/semantic/cedict-crossref/dictionary-reference-cues-v0.1.json) retains the original character, reading, source file path/blob SHA, and exact reference spellings. The [reproducible extractor](../tools/glyph-pipeline/dictionary_reference_cues.mjs) uses the shared [source reading parser](../site/dictionary-readings.js) and [reference scanner](../site/dictionary-reference-cues.js). It checks its pinned output using `node tools/glyph-pipeline/dictionary_reference_cues.mjs --check`.

The [reading-inventory worksheet](../site/reading-inventory.html) displays these tokens under the corresponding dictionary reading, independently of provisional emoji. Additional genuine Chinese usage examples require separately documented corpus or dictionary attestation. The study has not performed that independent acceptance work.

Source: CC-CEDICT JSON mirror at revision `63c2569948629323b515833930fdd10f285401b6`, licensed under **CC BY-SA 4.0** with attribution in [third-party notices](../THIRD_PARTY_NOTICES.md). No independent lexical, emoji comprehension or production semantic approvals are granted by this audit.
