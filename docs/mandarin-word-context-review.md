# Local Mandarin word-context review intake

The 27 live-checked Tatoeba word-substring matches are research leads, not independently established word boundaries, pronunciations or senses. The source-linked [candidate browser](../site/word-context-candidates.html) records contributor attribution and dated source-integrity observations; it does not reproduce sentence text.

`tools/glyph-pipeline/word_context_review_validate.mjs` validates explicitly exported local review JSON against all five pinned source ledgers. The v0.1 format records the exact lead ID, sentence ID, written lead, publisher heading reading, Tatoeba link and contributor, SHA-256 text fingerprint, preliminary word-boundary/reading/sense assessments, a distinct HTTPS evidence URL and a rationale. Assessment values are `undetermined`, `supports` and `contradicts`, never `verified` or `approved`. Assertions require a substantive rationale and an additional evidence URL; that validation is structural, **not** an independent linguistic assessment.

Do not add source sentence text, internal discussions, identifying private reviewer data, production decisions, pictograms, or purported reuse permissions to exports. Preserve quotation clearance, contextual reading, and lexical/sense adjudication as independent future gates. Exports stay local unless a separate evidence audit authorizes publishing an independently substantiated non-private record.

Validate an explicitly exported JSON session from the repository root:

`node tools/glyph-pipeline/word_context_review_validate.mjs /path/to/local-export.json`

The smoke test exercises rejection of mismatched lead/sentence identities, changed attribution, altered hashes, unsupported verification claims, unlicensed copied text, duplicates, malformed corroboration and fabricated approval fields. The test does not imply that any reviewed sentence has been adjudicated.


## Provisional machine tokenization diagnostics

The optional GitHub Actions workflow **Inspect Mandarin word-boundary hints** fetches the 27 pinned source records, checks their contributor, exact sentence-text SHA-256, Chinese language tag, observed license label and current source-approval flag, and only then applies Node's `Intl.Segmenter` with Chinese word granularity. A mismatch produces no segmentation hints. The output preserves sentence IDs, lead IDs, UTF-16 offsets, and one of three runtime labels: `single_icu_segment`, `multiple_icu_segments`, or `cuts_icu_segment`. It also records the Node and ICU versions because different ICU versions may tokenize the same Chinese string differently. Full sentence text never enters the JSON output.

**These are segmentation-tool suggestions, not human-reviewed Chinese word boundaries.** A single ICU token does not establish the publisher's reading, target morpheme, usage sense, or independent corroboration. The artifact expires after 30 days; the pinned source fingerprint ledger remains the authoritative text identity. All independent approval counters remain zero.


## External published word-entry pronunciation comparison

The [source-linked word-reading observation ledger](../data/semantic/cedict-crossref/external-word-reading-observations-v0.1.json) records separate Wiktionary Mandarin entry pronunciations for five written dictionary leads: 长度 (chángdù), 长大 (zhǎngdà), 划船 (huáchuán), 计划 (jìhuà), and 经过 (jīngguò). Each observed target-character syllable agrees with the separate original dictionary heading reading. The three other leads remain **not yet confirmed in this external-word-entry cohort**; no negative dictionary-existence inference is warranted.

The ledger references each community-maintained word entry rather than copying definitions or sentences. The underlying editorial independence of Wiktionary content is not certified; a distinct website alone is not proof of an independent lexical authority. A dictionary entry's reading does not determine the actual pronunciation or morpheme boundaries of a particular corpus occurrence. All sentence-specific adjudications and production approvals remain at zero.


## Source-pinned CC-CEDICT exact word headword scan

The **Acquire CC-CEDICT word headwords** workflow tests a bounded reader against synthetic dictionary records, obtains the official MDBG CC-CEDICT gzip export, and preserves a small source digest and headword/Pinyin index for the eight pinned research leads. The full dictionary and its definitions are not published in Chromalect. The source project requires attribution and ShareAlike compliance (CC BY-SA 4.0); see the canonical [MDBG download and license page](https://www.mdbg.net/chinese/dictionary?page=cc-cedict).

An exact dictionary headword is not the same thing as an independently established Tatoeba word token, nor does it prove a sentence-specific reading or sense. An absent headword means only that no exact spelling appeared in the inspected dictionary snapshot; it must not become a judgment about grammatical acceptability or whether a multi-word expression exists. All independent verification gates stay separate.


The official 2026-10-23 download contained 125,310 parsed dictionary entries. Exactly five research leads have exact simplified-spelling headwords: 长度 (chang2 du4), 长大 (zhang3 da4), 划船 (hua2 chuan2), 计划 (ji4 hua4), and 经过 (jing1 guo4). The index preserves the source's compressed and decompressed SHA-256 checksums and the acquiring workflow/artifact IDs; it does **not** claim that the missing exact entries 看过, 刨坑, or 刨木头 cannot appear as grammatical Chinese expressions. The [compact source headword index](../data/semantic/cedict-crossref/cedict-word-headword-index-v0.1.json) contains no dictionary definitions and does not authorize sentence-level reading promotion.
