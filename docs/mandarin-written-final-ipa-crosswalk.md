# Thirty-three written-final symbols versus published IPA options

The [2020 Indiana University doctoral dissertation by Hana J. Cai](https://scholarworks.iu.edu/iuswrrest/api/core/bitstreams/9dc66f3c-a3fb-4221-a9a6-815a1c4811a0/content), Table 3 (printed pp. 27–29; PDF pp. 36–38), provides a singer-oriented IPA guide for written Pinyin finals. These are **reported / recommended notation choices**, not a verified contextual phonemic inventory.

The [machine-readable crosswalk](../data/phonetics/mandarin-written-final-ipa-source-crosswalk-v0.1.json) covers the **33 source-final spelling strings** already encoded as arbitrary geometric letter sequences and all **1,171 source citation occurrences**. It aligns full-form source table labels with abbreviated or context-dependent Pinyin written spellings. The [source acceptance test](../tools/glyph-pipeline/mandarin_written_final_ipa_crosswalk.mjs) reconstructs the exact first-tranche occurrence counts, checks the published symbol registry, pins 37 original table-heading labels, and refuses any assertion of accepted acoustic or human decoding results.

## Explicit non-equivalences

- The written source finals **`iu`, `ui` and `ue`** correspond to the full-form published headings `iou`, `uei` and `üe` for *comparison*, not to the same literal source IPA characters.
- The written source finals **`i`, `o`, `ong`, `u`, `uan` and `un`** each have **multiple potentially relevant IPA source headings** depending on spelling conventions, onset class or other phonological context.
- The dissertation has a separate retroflex Pinyin `i` entry. This is not evidence that all sibilant-conditioned `i` variants can be collapsed to one reported IPA row; unrepresented dental-apical variants remain unresolved.
- Orthographic onset spellings `y`, `w` and zero represent written conventions in Chromalect's original first-tranche grammar. They are not automatically equivalent to separate Mandarin consonant phonemes, and can change the interpretation of the written-final substring.

In the crosswalk, the **six simple-vowel tokens** have provisional working height/backness/rounding feature symbols. The remaining **27** complex written finals only have arbitrary geometric **letter** encodings, not asserted full-segment articulatory constructions. Every source table alternative remains conditional and unapproved for particular source characters, words and sentence contexts.

## Experimental comparison status

The [source-paired final-symbol gallery](../site/mandarin-final-symbols.html) makes the contrast visible without changing any Chinese character, original Pinyin spelling, color assignment, glyph ownership or source geometry. All IPA source column labels are explicitly editorial alternatives. User decoding accuracy, sound production validation, lexical context and learning outcomes are still at zero.

This advances the existing Phase 2 three-way Pinyin/IPA/featural-visual comparison. It is **not** evidence for closing the phonemic inventory, human decoding, or sound-level round-trip acceptance gates. All four unfinished Phase 2 checkboxes remain open until their independent criteria have been met.
