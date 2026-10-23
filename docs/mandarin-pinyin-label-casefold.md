# Dictionary Pinyin spelling-case contrast

**Status:** automated analysis of 1,393 pinned CC-CEDICT reading entries for 1,000 characters. This analysis compares *source labels*, not verified modern Mandarin pronunciations or lexical senses.

Some proper-name dictionary entries use initial capitalization for the same Pinyin pronunciation: 丁 is recorded under both `Ding1` and `ding1`. Preserving both records is correct for meaning/proper-name context; counting them automatically as distinct spoken readings is not.

| Measure | Count |
| --- | ---: |
| Source reading entries | 1,393 |
| Case-insensitive label classes (per character) | **1,191** |
| Redundant labels after casefolding | **202** |
| Characters with multiple raw dictionary reading entries | **339** |
| Characters with multiple entries differing **only in case** | **166** |
| Characters with multiple distinct lowercased Pinyin labels | **173** |
| Characters with any casefold duplicate entries | **201** |
| High-attention characters under existing triage | **142** |
| High-attention with only case-variant entries | **55** |
| High-attention with distinct lowercased labels | **87** |

The existing research triage stays intact: its "multi-reading" signal reflects lexicographic entry count, not 339 independently certified pronunciation contrasts. Even among the 173 distinct label groups, some may be historical, dialectal, neutral-tone, surname-related or otherwise restricted. No semantic approval or reclassification follows automatically.

The [machine-readable audit](../data/semantic/cedict-crossref/pinyin-reading-label-normalization-v0.1.json) retains exact original labels and lowercased derived labels. Regenerate with `node tools/glyph-pipeline/pinyin_reading_label_normalization.mjs --check`. Run the [smoke test](../tools/glyph-pipeline/pinyin_reading_label_normalization_smoke.mjs) for structural regression. The pinned dictionary is CC-CEDICT CC BY-SA 4.0, revision `63c2569948629323b515833930fdd10f285401b6`.

**Independently approved lexical senses: 0. Independent emoji comprehension approvals: 0. Production semantic mappings: 0.**
