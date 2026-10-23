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

These rules are informed by separate published pedagogical and phonological descriptions, including [Carl Polley's Mandarin sound-system reference at Humanities LibreTexts](https://human.libretexts.org/Bookshelves/Languages/Chinese/CHN101_Elementary_Mandarin_I_Textbook/01:_Introduction/1.01:_The_Sound_System_of_Mandarin), and a [published Mandarin phonetic/phonological reference text](https://students.aiu.edu/submissions/profiles/resources/onlineBook/d5F8W2_A_Grammar_of_Mandarin.pdf). These references motivate screening, not a definitive transcription convention. References can differ in their phonemic analyses and treatment of syllabic consonants, apical vowels and surface vowels. No source passage or dictionary definition has been copied.

**Interpretation constraint:** The 33 *published written final remainder tokens* are not automatically 33 independent phonological categories. A written `i` is not unconditionally a single IPA [i] in all source initial contexts; `u`-based spellings can reflect a different phonetic vowel after palatal contexts. Contracted Pinyin spellings do not directly enumerate all pronounced segments. Even unflagged entries cannot be promoted to an approved IPA reading.

The machine-recorded [exception index](../data/phonetics/mandarin-final-spelling-context-gates-v0.1.json) preserves original citation examples and zero approval counters. Re-run `node tools/glyph-pipeline/mandarin_final_spelling_context_gates.mjs --check` to compare against the pinned source. This forms an evidence gate for later independent phonological review, not a replacement for that review.
