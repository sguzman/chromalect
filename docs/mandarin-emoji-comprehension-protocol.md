# Blind emoji comprehension protocol (experimental v0.1)

## Purpose

Chromalect already has 897 **unverified** pictogram expressions attached to selected Mandarin character-use meanings. A dictionary definition or a technically well-formed expression does **not** show that a reader can recover its intended meaning. The [blind emoji comprehension worksheet](../site/emoji-comprehension.html) supplies a **local-only** testing surface for that question. This is independent of, and does not replace, lexical sense validation.

## Procedure

1. Select a scope: all candidates, automatically flagged expressions, actions/processes, **shared action/non-action emoji**, or multiple-emoji compositions. The shared-role scope includes 73 visual forms used by 341 candidate sense assignments, and is separately documented in [the contrast audit](mandarin-event-role-contrast.md).
2. Choose a **repeat policy** before the batch size. The default presents each distinct visible emoji form **at most once per session**, preventing within-session repetition of one pictogram under different selected meanings. The 897 candidate sense expressions contain **388 distinct visible emoji sequences**; 191 visual forms are reused, with 700 assignments belonging to repeated-form groups. This reuse is **valid** and not a uniqueness failure. The alternate **allow repeated** mode is explicitly available for cross-character reuse experiments.
3. Choose a batch size (20, 50, 100, or all eligible forms under that repeat policy). Order is randomized within scope. Randomization and visual deduplication do not establish a statistically representative participant sample.
4. Each initial trial displays **only the emoji expression**. Do not show the Chinese glyph, English candidate meaning, definition, automated source-match status, or alternative answers before the response. A free-text interpretation may be blank when the participant is unsure. Record confidence and a **blind grammatical-kind guess** (action/process, entity, property/state, relation, other, or unsure) before revealing anything.
5. Lock the response, then reveal the proposed character meaning. Rate whether the pictogram conveys the proposed meaning: **clear, partial, misleading, or can't judge**. These are subjective ratings, not pass/fail grades.
6. Export the answers explicitly as JSON. They remain in the browser session unless exported and are never automatically sent to GitHub, Chromalect, or a remote service. Starting another session abandons unexported responses.

## Machine-readable output

The downloaded \`chromalect.emoji-comprehension-session.v0.2\` object contains the source-audit name, scope, explicit repeat policy, total trial counts, local-only status, and per-trial identifiers, selected characters, visible emoji expression, **blind response**, prereveal confidence, predicted concept kind, the existing machine-readable event-type label (for later comparison), automatic risk flags and **post-reveal clarity rating**. It never marks a record production verified. Avoid including reviewers' names, email addresses, identifying details or medical information in the free-text answers.

## Validate local export integrity

The [no-dependency review-session validator](../tools/glyph-pipeline/review_session_validate.mjs) checks exports against the pinned 897-expression audit, validates the declared sampling cohort, rejects unknown or duplicate trial IDs, enforces visual uniqueness in v0.2 distinct-form sessions, and prohibits invented canonical approvals. Legacy v0.1 exploratory exports remain readable. Its smoke test builds synthetic fixtures only; it does not introduce participant results into the repository.

This validator checks **identity and format integrity**, not the truth of an interpretation, participant independence, or a pictogram's effectiveness.

## Limits and gates

- English and Chinese target labels are **provisional hypotheses**, not confirmed exhaustive modern Mandarin sense inventories. Even a "clear" pictogram may encode an incorrect or overly broad target.
- Emoji rendering varies across platforms, screen readers, fonts, and cultures. Repeated expressions across characters are valid and are not inherently errors.
- Semantic verbs can rely on roles represented in machine-readable grammar without those roles surviving in an emoji-only projection. This may lead to systematic errors; compare action and non-action scopes.
- Distinct-form sampling now controls **identical visible emoji repetition within a single session**. It does not prevent learning across separate sessions or eliminate semantic overlap, near-identical symbols, balanced-recruitment issues, blind independent-rater problems, response-similarity coding, or inter-rater agreement limitations. Repeated forms are allowed under an explicit alternate experimental policy.
- Blind free responses and post-reveal ratings are **not interchangeable**: subjective post-reveal plausibility cannot establish unaided recognition.
- No expression should be promoted solely because a user clicked "clear" or exported a file. A real promotion requires an independently verified lexical sense, documented test design, multiple eligible participants and adjudicated comprehension results, accessibility review, and explicit human approval.

**Progress invariant:** first-1,000 screening 100%; CC-CEDICT headword cross-reference 100%; the 248 flagged semantic desk analyses 100%; **independently approved lexical senses 0%, independently approved emoji comprehension 0%, production verified 0%.**

The worksheet is an evaluation *instrument*, not a completed evaluation. Its existence and use must never change the three zero-approval metrics in the source manifests.
