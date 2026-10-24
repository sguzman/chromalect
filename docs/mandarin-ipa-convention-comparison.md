# Three reported IPA conventions against working Mandarin symbol encodings

**Research scope.** Hana J. Cai's 2020 Indiana University doctoral document,
[*Making Chinese Choral Music Accessible in the United States: A Standardized IPA Guide for Chinese-Language Works*](https://scholarworks.iu.edu/iuswrrest/api/core/bitstreams/9dc66f3c-a3fb-4221-a9a6-815a1c4811a0/content),
compares IPA symbols attributed to Lin and Mei with Cai's own proposals for English-speaking singers.
See **Table 2, printed pp. 25–26 (PDF pp. 34–35)** and **Table 3, printed pp. 27–29 (PDF pp. 36–38)**.

The [source-linked comparison](../data/phonetics/mandarin-pinyin-ipa-source-disagreement-v0.1.json)
transcribes the **21 conventional Pinyin initial** rows and six ordinary written-simple-final
rows used by the working Chromalect feature codebook. The evidence has its own exact-symbol
[acceptance validator](../tools/glyph-pipeline/mandarin_ipa_source_comparison.mjs) and
[viewer tests](../tools/glyph-pipeline/mandarin_ipa_source_comparison_smoke.mjs).

## Measured comparison coverage

- All **21/21 source conventional initials** have attributed Lin, Mei and Cai proposed/reported symbols.
  **16/21** rows differ between these three columns. Chromalect's original, noncertified
  broad-IPA source candidate is a literal match for Lin's reported symbol in **19/21** rows.
  The nonidentical `zh` and `ch` rows reflect different written retroflex/transcription details
  and are not grounds to promote a competing source.
- All **six** working simple-final tokens, out of **33** total written-final categories,
  have the same three-way comparison. **Four of six** have identical source notation in all
  three reported columns. The source `e` and `ü` entries differ between conventions.
- Pinyin `y`, `w`, and zero initial remain orthographic spelling conventions, not
  additional independently verified consonants. The other **27** complex written-final
  categories have not been brought into this working single-vowel comparison.
- Existing **112 source-spelling cautions** within the 432 simple-final source occurrences
  remain active and unapproved; this table does not supply context-sensitive IPA realizations.

## Specific source cautions

Cai identifies Mei's Pinyin `t` entry as likely mistaken; Chromalect preserves the reported
`ts` table cell as source history, **not** as an endorsed realization. In several other rows
(e.g., Pinyin `b`, `d`, and `g`), the choral IPA values intentionally differ from
a voiceless-unaspirated stop convention, demonstrating a pedagogical transcription choice
rather than independently established new Mandarin phoneme categories.

Table 3 treats the retroflex/sibilant-conditioned Pinyin `i` separately, and some variants
of `o` as onset-conditioned. The table's `ü` row also illustrates glide transcription
differences. These facts prevent assigning one unconditional segmental acoustic target
from the spelling alone.

Cai's comparison of Lin and Mei **is one secondary comparison source**, not three
independent examinations of the corresponding publications. The dissertation's purpose
is *singing diction*, not a formal inventory of conversational Standard Mandarin phonemes.
A literal IPA glyph does not itself establish acoustic measurements or a valid decoding
experiment. The existing source glyphs, color palette and structural review status are
unchanged.

## Acceptance boundary

This research advances the unfinished Phase 2 **Pinyin / IPA / visual-feature comparison**
criterion through transparent, reproducible, source-qualified notation variants.
It **does not freeze the phonological inventory**, certify any actual speech sound or
phonemic contrast, finish context-sensitive finals, or establish human decoding success.
The broader Phase 2 checklist remains unchanged pending these independent gates.
