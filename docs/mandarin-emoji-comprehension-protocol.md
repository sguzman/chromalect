# Blind emoji comprehension protocol (experimental v0.1)

## Purpose

Chromalect already has 897 **unverified** pictogram expressions attached to selected Mandarin character-use meanings. A dictionary definition or a technically well-formed expression does **not** show that a reader can recover its intended meaning. The [blind emoji comprehension worksheet](../site/emoji-comprehension.html) supplies a **local-only** testing surface for that question. This is independent of, and does not replace, lexical sense validation.

## Procedure

1. Select a scope: all candidates, automatically flagged expressions, actions/processes, or multiple-emoji compositions.
2. Choose a batch size (20, 50, 100, or the entire eligible set). Order is randomized within the selected scope. This randomization is not a statistically representative participant sample.
3. Each initial trial displays **only the emoji expression**. Do not show the Chinese glyph, English candidate meaning, definition, automated source-match status, or alternative answers before the response. A free-text interpretation may be blank when the participant is unsure. Record confidence before revealing anything.
4. Lock the response, then reveal the proposed character meaning. Rate whether the pictogram conveys the proposed meaning: **clear, partial, misleading, or can't judge**. These are subjective ratings, not pass/fail grades.
5. Export the answers explicitly as JSON. They remain in the browser session unless exported and are never automatically sent to GitHub, Chromalect, or a remote service. Starting another session abandons unexported responses.

## Machine-readable output

The downloaded \`chromalect.emoji-comprehension-session.v0.1\` object contains the source-audit name, scope, total trial counts, local-only status, and per-trial identifiers, selected characters, visible emoji expression, **blind response**, prereveal confidence, automatic risk flags and **post-reveal clarity rating**. It never marks a record production verified. Avoid including reviewers' names, email addresses, identifying details or medical information in the free-text answers.

## Limits and gates

- English and Chinese target labels are **provisional hypotheses**, not confirmed exhaustive modern Mandarin sense inventories. Even a "clear" pictogram may encode an incorrect or overly broad target.
- Emoji rendering varies across platforms, screen readers, fonts, and cultures. Repeated expressions across characters are valid and are not inherently errors.
- Semantic verbs can rely on roles represented in machine-readable grammar without those roles surviving in an emoji-only projection. This may lead to systematic errors; compare action and non-action scopes.
- A participant seeing the target on earlier trials may learn to interpret repeated pictograms. This worksheet does not yet control cross-trial priming, balanced recruitment, blind independent raters, response similarity coding, or inter-rater agreement.
- Blind free responses and post-reveal ratings are **not interchangeable**: subjective post-reveal plausibility cannot establish unaided recognition.
- No expression should be promoted solely because a user clicked "clear" or exported a file. A real promotion requires an independently verified lexical sense, documented test design, multiple eligible participants and adjudicated comprehension results, accessibility review, and explicit human approval.

**Progress invariant:** first-1,000 screening 100%; CC-CEDICT headword cross-reference 100%; the 248 flagged semantic desk analyses 100%; **independently approved lexical senses 0%, independently approved emoji comprehension 0%, production verified 0%.**

The worksheet is an evaluation *instrument*, not a completed evaluation. Its existence and use must never change the three zero-approval metrics in the source manifests.
