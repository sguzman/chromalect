# Local Mandarin word-context review intake

The 27 live-checked Tatoeba word-substring matches are research leads, not independently established word boundaries, pronunciations or senses. The source-linked [candidate browser](../site/word-context-candidates.html) records contributor attribution and dated source-integrity observations; it does not reproduce sentence text.

`tools/glyph-pipeline/word_context_review_validate.mjs` validates explicitly exported local review JSON against all five pinned source ledgers. The v0.1 format records the exact lead ID, sentence ID, written lead, publisher heading reading, Tatoeba link and contributor, SHA-256 text fingerprint, preliminary word-boundary/reading/sense assessments, a distinct HTTPS evidence URL and a rationale. Assessment values are `undetermined`, `supports` and `contradicts`, never `verified` or `approved`. Assertions require a substantive rationale and an additional evidence URL; that validation is structural, **not** an independent linguistic assessment.

Do not add source sentence text, internal discussions, identifying private reviewer data, production decisions, pictograms, or purported reuse permissions to exports. Preserve quotation clearance, contextual reading, and lexical/sense adjudication as independent future gates. Exports stay local unless a separate evidence audit authorizes publishing an independently substantiated non-private record.

Validate an explicitly exported JSON session from the repository root:

`node tools/glyph-pipeline/word_context_review_validate.mjs /path/to/local-export.json`

The smoke test exercises rejection of mismatched lead/sentence identities, changed attribution, altered hashes, unsupported verification claims, unlicensed copied text, duplicates, malformed corroboration and fabricated approval fields. The test does not imply that any reviewed sentence has been adjudicated.
