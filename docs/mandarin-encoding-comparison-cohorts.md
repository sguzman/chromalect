# Mandarin citation encoding comparison cohorts

The fixed, source-attested research ledger partitions the pinned 1,171 citation readings into three distinct **presentation eligibility** groups. They do not indicate validated speech features or learner comprehension.

| Cohort | Source readings | Presentation |
| --- | ---: | --- |
| Six-simple-final written candidate, no listed caution | 320 | Allow a visibly labeled **provisional** height/backness/rounding marker |
| Six-simple-final written candidate with source caution | 112 | Suppress the feature marker; retain the original written final and a caution |
| Remaining 27 written-final spellings | 739 | Suppress the vowel-feature marker; show that the model has no feature proposal |

All **1,171** source readings still have exact written final spelling and an independently labeled arbitrary geometric **letter** code. There are **213 source reading occurrences with caution flags overall**, including the 112 withheld simple-final candidates and 101 compound-final readings. Absence of a warning for a reading is not positive evidence of pronunciation validity.

The independent visual-comparison protocol must preserve the source Unicode character, its written Pinyin citation, tone label, and source character rank. The current 21 working conventional initial classes can be shown as **unapproved** proposed feature shapes; three spelling-only onset conventions are not consonants.

The source-independent status gate is defined by `data/phonetics/mandarin-encoding-comparison-cohorts-v0.1.json`. The recomputing builder is `tools/glyph-pipeline/mandarin_encoding_comparison_cohorts.mjs`. All counts are independently sourced from the citation tranche, six-simple-final candidate file, written-final letter control, and contextual spelling caution index. No new IPA values, lexical senses, corpus sentences, or changes to existing color identities are introduced.

**Acceptance still outstanding:** expert review of the Mandarin inventory, full phonological rather than written spelling decoder, typography/accessibility comparison, human decoding and learning tests.
