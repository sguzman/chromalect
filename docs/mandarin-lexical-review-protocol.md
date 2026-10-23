# Source-first Mandarin lexical review worksheet

The [lexical review worksheet](../site/lexical-review.html) provides a local, explicit, **non-production** review instrument for **all 897 provisional Mandarin character-use meaning candidates**, including the 248 dictionary discrepancies and 649 literal wording matches. Literal wording matches are not approved meanings.

## Independence of the tasks

Lexical validity (what a character or character-use sense means) must be assessed **without showing the emoji being evaluated**. The [blind emoji-comprehension worksheet](mandarin-emoji-comprehension-protocol.md) separately tests whether a pictogram communicates a chosen meaning. These questions must not be conflated.

The lexical worksheet displays the selected Chinese character, its unreviewed English sense candidate, the original Unihan definition segment, and a pinned CC-CEDICT excerpt. It deliberately withholds the emoji and earlier assistant desk-analysis commentary. It does **not** treat either source's English gloss as conclusive about contemporary reading, frequency, or grammatical use.

1. Select all 897 candidates, the 248 disputed cases, the 649 literal-matched cases, or a priority subset (higher, medium, or unclassified), and choose the trial count.
2. Inspect the pinned dictionary readings and full excerpt. Select an applicable reading, unresolved multiple readings, or **undetermined** if context is insufficient. Reading and gloss counts are not independently verified senses. New cohorts select multi-reading records and high-attention records (multiple readings and eight or more gloss fragments).
3. Provisionally mark the sense **supported in context**, **unsupported/misleading**, or **insufficient evidence**.
4. Enter an evidence explanation of at least 12 characters. These are cursory form checks, not guarantees of quality.
5. Lock the preliminary observation. Only then is any earlier assistant desk note displayed for comparison. Literal-matched cases may have no prior desk note. This reduces initial anchoring.
6. Continue, or explicitly export the local JSON file. The page does not send answers or alter any GitHub records.

## Export schema and data governance

The exported \`chromalect.lexical-review-observation-session.v0.3\` object records candidate identity, original reference segment, pinned independent source locator, **readingSelection** (a pinned reading spelling, `multiple`, or `undetermined`), the provisional judgment and its rationale. Legacy v0.2 exports remain supported. Each record expressly contains \`lexicalApproval="not_granted"\`, \`emojiComprehensionApproval="not_granted"\`, \`productionVerified=false\`. Unreviewed observations are not canonical research claims. The worksheet does not collect reviewer identity by default. Do not include unnecessary personal information in free responses.

Derived CC-CEDICT content retains **CC BY-SA 4.0** attribution; the original Unihan material carries Unicode's licensing. The source pin, individual references, and notices in the repository govern redistribution.

## Validate local export integrity

The [review-session validator](../tools/glyph-pipeline/review_session_validate.mjs) checks v0.3 and legacy v0.2 lexical exports against the full [897-entry source-first queue](../data/semantic/cedict-crossref/full-lexical-review-queue-v0.1.json), validates v0.3 reading selections and polysemy cohort membership, and continues to accept legacy v0.1 observations against the pinned 248-entry discrepancy queue, verifies that each identity and definition segment matches the source, and rejects false approval fields or missing rationales. It does not certify the evidence or promote any dictionary sense. Automated smoke tests contain only synthetic responses.

## Acceptance and limitations

Only a separately documented review procedure can decide what constitutes **independent lexical verification**. A self-selected source-only reviewer, assistant-generated notes, automated synonyms, or one-click form judgments are insufficient. Robust assessment should record the actual applicable reading, representative word/character usage, whether a meaning is modern or historical, independent dictionary/corpus provenance, and independent adjudication of disagreements. A verified sense cannot be promoted until independent emoji comprehension and accessible display quality are also evaluated.

**Progress:** 1,000/1,000 dictionary headwords cross-referenced; 897/897 candidate meanings supplied with pinned, source-first lexical evidence (649 literal matches and 248 discrepancies); 248/248 flagged desk analyses completed; 0 independently accepted lexical senses; 0 independently accepted emoji comprehension mappings; 0 production-verified semantic mappings.
