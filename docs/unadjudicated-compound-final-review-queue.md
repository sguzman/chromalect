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

### Umlaut-omission reference layer

A separate [versioned umlaut-omission crosswalk](../data/phonetics/external-umlaut-spelling-rule-crosswalk-v0.1.json) points to the same [university spelling-rule resource](https://www.polyu.edu.hk/bepth/introduction-to-phonetics/spelling-rules-in-pinyin/?sc_lang=en) for the conventional omission of written `ü` dots after `j`, `q`, `x`, or with syllable-initial `y`. In the pinned first-tranche warning index, this applies to `u` ↔ `ü` (33 observed occurrences), `un` ↔ `ün` (18), `ue` ↔ `üe` (10), and `uan` ↔ `üan` (10). These are **spelling comparisons in their listed initial contexts**, not unconditional replacements or approved speech transcriptions.

The contraction and umlaut evidence layers together link 7 of the 9 listed warning families (134 of 213 source-reading occurrences). The 79 still unlinked occurrences are **post-sibilant `i`** (63) and **labial-written `o`** (16); neither is assigned a guessed IPA sound or accepted phonological decomposition. The two `un` rules remain separately scoped: 20 nonpalatal `un`/`uen` observations versus 18 palatal `un`/`ün` observations. The [combined validator](../tools/glyph-pipeline/external_umlaut_spelling_rules.mjs) rejects shared-family collisions and inappropriate cross-application.

### Research references for the two remaining caution families

The [unresolved phonetic source-lead ledger](../data/phonetics/unresolved-phonetic-reference-leads-v0.1.json) documents external starting points for the remaining 79 source-reading occurrences without awarding an IPA or phonological approval.

- **Post-sibilant `i` (63 occurrences):** [LMU Munich, Mandarin Vowels](https://www.phonetik.uni-muenchen.de/studium/skripten/languagedemos/Demos/mandarin.html) discusses restricted so-called apical vowels or syllabic consonants. The repository has not independently selected between phonetic analyses, established speaker-specific realizations, or tested decoding.
- **Labial-written `o` (16 occurrences):** [Hong Kong Polytechnic University, Simple Finals](https://www.polyu.edu.hk/bepth/introduction-to-phonetics/simple-finals/?sc_lang=en) describes a possible weak `u`-like transition in conventional labial-plus-`o` examples. The repository does not infer a phoneme inventory, exact contextual IPA label, or measured acoustic realization for its citations.

The [nine-family caution browser](../site/mandarin-spelling-cautions.html) keeps seven **published spelling-rule correspondences** separate from these two **phonetic reference leads**, each with a source citation link and its unapproved status. All nine families account for 213 bounded source-reading occurrences; 0 acoustic checks and 0 human decoding studies are reported. Source links are research pointers, not endorsement of any particular final-feature depiction.
