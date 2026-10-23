# Mandarin polysemy and pronunciation triage

**Status:** automated dictionary-complexity screening for all **1,000 first-tranche characters (100%)**; **0 independently verified complete lexical sense inventories**. This is separate from the initial emoji screening and from the first source intake.

The first-pass pictogram corpus includes only **897 provisional meaning-expression assignments** over 881 characters. This is not a complete sense inventory. In particular, different readings and several senses of a Chinese character can require distinct entries; a character's existing emoji is not automatically a universal gloss for all its uses.

## Reproducible dictionary evidence

The [full source-linked triage](../data/semantic/cedict-crossref/polysemy-triage-v0.1.json) derives pronunciation counts and approximate English gloss-segment counts from five pinned [CC-CEDICT excerpt blocks](../data/semantic/cedict-crossref/), revision \`63c2569948629323b515833930fdd10f285401b6\`. Retained dictionary provenance and content use **CC BY-SA 4.0**; see [third-party notices](../THIRD_PARTY_NOTICES.md). The [compact browser index](../data/semantic/cedict-crossref/polysemy-review-index-v0.1.json) summarizes those records without duplicating source definitions.

| Review signal | Characters | Percent of 1,000 |
| --- | ---: | ---: |
| Dictionary complexity screened | 1,000 | 100% |
| Multiple dictionary reading entries | 339 | 33.9% |
| Eight or more English definition fragments | 232 | 23.2% |
| One initial pictogram sense despite multiple reading/gloss cues | 367 | 36.7% |
| No proposed pictogram at initial screening | 119 | 11.9% |
| Both multiple readings and eight or more gloss fragments | 142 | 14.2% |
| Independent human lexical inventory approvals | 0 | 0% |
| Independent emoji comprehension approvals | 0 | 0% |
| Production semantic approvals | 0 | 0% |

**Important:** a dictionary reading may simply be a surname, a historical usage, a tonal variant, or a grammaticalized function. English entries separated by semicolons may be synonyms, examples, part-of-speech variants, classifier uses, or distinct senses. **Neither reading counts nor semicolon counts measure the number of genuinely distinct modern Mandarin senses.** The threshold of eight fragments is a transparent review-priority heuristic, not a linguistic boundary.

## Work queue

- **Higher attention (142):** the source has multiple reading records and at least eight gloss fragments. Inspect current Mandarin reading and sense distinctions first; note whether the proposed emoji matches only one usage.
- **Targeted (287):** one of those complexity signals is present but not both. Check whether different usages need different candidate senses.
- **Deferred-only (67):** there is no selected emoji and neither complexity threshold is met. Review the lexical sense without being forced to invent an icon.
- **Baseline (504):** neither high-complexity cue applies and an experimental pictogram exists. This still does **not** mean fully mapped or verified.

The [semantic browser](../site/semantic-coverage.html) exposes filters for multiple readings, higher-attention records, and characters with one pictogram cue despite lexical complexity. The component/color, pronunciation, and tone channels remain independently selectable and unchanged.

## Next verification gates

For each character, record attested modern readings, concrete usage examples and word boundaries, sense identity, register, historical or proper-name exceptions, and source license/revision. An independent reviewer should decide which distinct senses matter for the target Mandarin learning corpus **before** accepting or revising emoji compositions. Character-level meaning and future whole-word meaning must remain separate layers.

Regenerate the full triage with \`node tools/glyph-pipeline/polysemy_triage.mjs\` and its compact index with \`node tools/glyph-pipeline/polysemy_review_index.mjs\`. CI invokes both with \`--check\`, ensuring no unexplained changes to research metrics.
