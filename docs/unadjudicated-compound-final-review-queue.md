# Unadjudicated compound written-final review workqueue

The pinned first-1,000-character Mandarin citation source contains 33 distinct *written Pinyin final remainders*, six of which have **provisional, unapproved simple-final feature hypotheses**. The remaining **27** are explicitly deferred rather than assigned guessed vowel/coda or IPA representations.

Those 27 written remainders account for **739 of the 1,171 cited reading occurrences**, including **101 occurrences** falling into the current nine source-dependent orthographic caution groups. The remaining 638 are unflagged by this bounded screen, not independently approved.

The [machine-readable queue](../data/phonetics/unadjudicated-compound-final-review-queue-v0.1.json) prioritizes the 27 written remainders with an explicit source caution first, then by decreasing occurrence count in the limited first-1,000-character tranche, and finally by token spelling. Each item has a source example list, caution families, original written spelling, no IPA transcription, no asserted contrastive phoneme status, and zero human decoding evidence.

**No dataset should interpret these observed counts as language-wide Mandarin usage frequencies.** This is an ordering aid for acquiring independently reviewed phonetic and linguistic evidence, not a vowel categorization by fiat. The source glyph palette and original character citations remain unchanged.

Follow-on acceptance requirements: independent expertise in Mandarin phonological/phonetic analysis, explicit source/speaker/register conventions, contextual realizations (including umlaut suppression, contraction, apical vowels and labial `o`), and empirical interpretation/decoding tests. The queue does not authorize a full syllable IPA label.

## External orthographic rule correspondence (research only)

A separate [machine-readable spelling-rule crosswalk](../data/phonetics/external-orthographic-spelling-rule-crosswalk-v0.1.json) links three source warning families to the [Hong Kong Polytechnic University BEPTH description of Pinyin spelling rules](https://www.polyu.edu.hk/bepth/introduction-to-phonetics/spelling-rules-in-pinyin/?sc_lang=en). It compares **written** `iu` with `iou` (24 source reading occurrences), `ui` with `uei` (19), and **nonpalatal** `un` with `uen` (20). These 63 occurrences belong to three of nine existing spelling-caution categories. The other six categories account for 150 occurrences and have no correspondence approved by this crosswalk.

A crucial scope limit: the pinned source also has 18 **palatal-written** `un` occurrences. Those are excluded from the `un`/`uen` contraction correspondence, even though both have the same written final token. A final-spelling lookup without its source initial and warning family is not sufficient to make that distinction.

The source is a description of Pinyin orthography, not independent measurement of Mandarin acoustic realizations, evidence for contextual lexical readings, or a published inventory of contrastive phonemes. The spelling-rule comparison does **not** supply IPA, articulatory feature approval, human recognition data, or permission to promote either of the other six families. The [validator](../tools/glyph-pipeline/external_orthographic_spelling_rules.mjs) and negative regression tests enforce this narrow correspondence; the public [workqueue browser](../site/mandarin-compound-final-queue.html) links the source beside the affected readings.
