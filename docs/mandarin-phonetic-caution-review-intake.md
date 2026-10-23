# Local Mandarin phonetic caution review intake

The [source-pinned review validator](../tools/glyph-pipeline/phonetic_caution_review_validate.mjs) accepts local-only, noncertifying phonetic research notes for any of the 213 citation-reading occurrences belonging to the nine source warning families. A note identifies its character rank, original Chinese character, Pinyin display, written initial, final, tone, and caution family. It must match an actual pinned reading, not just the final spelling.

## Purpose and limits

This is an exploratory source-comparison log, not an audio dataset, participant study, final transcription system, expert-review certificate, or a path to production pronunciation approval. No external source sentences or recordings are included.

Session schema: chromalect.phonetics.local-caution-review-session.v0.1. Session status: unverified_local_phonetic_research_notes_not_ipa_or_phoneme_approval. Each exported JSON file declares localOnly: true, an export timestamp, an observation count and the pinned source blob SHA.

Each observation contains source identity fields (rank, character, display, initial, final, tone, cautionFamily) and exactly the research fields assessment, evidenceURL, evidenceRationale, declaredVariety, transcriptionConvention and workingTranscription.

Allowed assessments: undetermined, tentative_lead, needs_correction. A non-undetermined assessment or any nonempty working transcription needs an HTTPS reference, a substantive rationale, a declared language variety and a named transcription convention. Working transcription remains **unapproved**, even if the JSON passes mechanical validation. The validator rejects unrecognized approval fields, duplicate occurrences, source-version drift, and URLs containing credentials or fragments.

## Command-line validation

From the repository root, run:

    node tools/glyph-pipeline/phonetic_caution_review_validate.mjs /path/to/local-session.json

The output counts local notes and preliminary hypotheses while reporting zero approved IPA analyses, phoneme inventories and acoustic verification. The command does not mutate source ledgers. Keep unpublished review notes outside the public repository until rights and publication suitability have been evaluated.

The [negative tests](../tools/glyph-pipeline/phonetic_caution_review_validate_smoke.mjs) cover incorrect citation identities, fabricated approvals, invalid URLs, missing rationale and duplicate observations.

Independent language-variety analysis, appropriate original acoustic material, speaker and register conventions, contextual realizations, and perception/decoding experiments remain prerequisites for scientific acceptance.
