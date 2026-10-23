# Mandarin final-spelling contextual exception triage (v0.1)

This first-source-only research inventory identifies **197 reading occurrences** across **97 distinct initial/final/tone spellings** requiring caution before translating written Pinyin remainders into phonetic features. The eight categories are source-token *flags*, not validated phonological analyses or pronunciation assignments. All eight are disjoint in the current pinned 1,171-reading source tranche.

| Source orthographic condition | Readings |
| --- | ---: |
| Written `i` after z/c/s/zh/ch/sh/r | 63 |
| Written `u` after j/q/x/y | 33 |
| Contracted written `iu` | 24 |
| Contracted written `ui` | 19 |
| Written `un` outside the j/q/x/y class | 20 |
| Written `un` after j/q/x/y | 18 |
| Written `ue` after j/q/x/y | 10 |
| Written `uan` after j/q/x/y | 10 |

University sources directly consulted: [Hong Kong Polytechnic University's Pinyin spelling rules](https://www.polyu.edu.hk/bepth/introduction-to-phonetics/spelling-rules-in-pinyin/?sc_lang=en) and [the Open University's Pinyin spelling conventions](https://www.open.edu/openlearn/mod/oucontent/view.php?id=108700&section=1.3) document contracted final spellings and omitted umlaut marks. [LMU Munich's Mandarin vowel reference](https://www.phonetik.uni-muenchen.de/studium/skripten/languagedemos/Demos/mandarin.html) distinguishes the post-sibilant vowel/syllabic-consonant cases. These sources motivate screening, not a certified IPA transcription convention. References can differ in their phonemic analyses and treatment of syllabic consonants, apical vowels and surface vowels. No source passage or dictionary definition has been copied.

**Interpretation constraint:** The 33 *published written final remainder tokens* are not automatically 33 independent phonological categories. A written `i` is not unconditionally a single IPA [i] in all source initial contexts; `u`-based spellings can reflect a different phonetic vowel after palatal contexts. Contracted Pinyin spellings do not directly enumerate all pronounced segments. Even unflagged entries cannot be promoted to an approved IPA reading.

The machine-recorded [exception index](../data/phonetics/mandarin-final-spelling-context-gates-v0.1.json) preserves original citation examples and zero approval counters. Re-run `node tools/glyph-pipeline/mandarin_final_spelling_context_gates.mjs --check` to compare against the pinned source. This forms an evidence gate for later independent phonological review, not a replacement for that review.
