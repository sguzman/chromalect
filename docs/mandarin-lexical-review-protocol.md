# Source-first Mandarin lexical review worksheet

The [lexical review worksheet](../site/lexical-review.html) provides a local, explicit, **non-production** review instrument for Chromalect's **248** disputed Mandarin character-use sense hypotheses.

## Independence of the tasks

Lexical validity (what a character or character-use sense means) must be assessed **without showing the emoji being evaluated**. The [blind emoji-comprehension worksheet](mandarin-emoji-comprehension-protocol.md) separately tests whether a pictogram communicates a chosen meaning. These questions must not be conflated.

The lexical worksheet displays the selected Chinese character, its unreviewed English sense candidate, the original Unihan definition segment, and a pinned CC-CEDICT excerpt. It deliberately withholds the emoji and earlier assistant desk-analysis commentary. It does **not** treat either source's English gloss as conclusive about contemporary reading, frequency, or grammatical use.

1. Select the priority class (all, higher, medium, or unclassified) and the number of trials.
2. Inspect the sources and provisionally mark the sense **supported in context**, **unsupported/misleading**, or **insufficient evidence**.
3. Enter an evidence explanation of at least 12 characters. These are cursory form checks, not guarantees of quality.
4. Lock the preliminary observation. Only then is the earlier assistant desk note displayed for comparison, reducing immediate anchoring.
5. Continue, or explicitly export the local JSON file. The page does not send answers or alter any GitHub records.

## Export schema and data governance

The exported \`chromalect.lexical-review-observation-session.v0.1\` object records candidate identity, original reference segment, pinned independent source locator, the provisional judgment and its rationale. Each record expressly contains \`lexicalApproval="not_granted"\`, \`emojiComprehensionApproval="not_granted"\`, \`productionVerified=false\`. Unreviewed observations are not canonical research claims. The worksheet does not collect reviewer identity by default. Do not include unnecessary personal information in free responses.

Derived CC-CEDICT content retains **CC BY-SA 4.0** attribution; the original Unihan material carries Unicode's licensing. The source pin, individual references, and notices in the repository govern redistribution.

## Acceptance and limitations

Only a separately documented review procedure can decide what constitutes **independent lexical verification**. A self-selected source-only reviewer, assistant-generated notes, automated synonyms, or one-click form judgments are insufficient. Robust assessment should record the actual applicable reading, representative word/character usage, whether a meaning is modern or historical, independent dictionary/corpus provenance, and independent adjudication of disagreements. A verified sense cannot be promoted until independent emoji comprehension and accessible display quality are also evaluated.

**Progress stays unchanged:** 1,000/1,000 dictionary headwords cross-referenced; 248/248 flagged desk analyses completed; 0 independently accepted lexical sense mappings; 0 independently accepted emoji comprehension mappings; 0 production-verified semantic mappings.
