# Mandarin first-1,000 semantic screening

**Status:** early source intake and first-pass emoji candidates, not a verified Mandarin lexicon or completed pictographic language. [Open the browsing view](../site/semantic-coverage.html).

## Scope and preservation

The first 1,000 characters are the **exact ranked entries** in [the existing 2013 standard character tranche](../data/catalog/characters-0001-1000.json). Do not change their membership, component owner geometry, stable palette colors, pronunciation, or tone encoding.

Two distinct semantic layers are modeled:

- **Character-use meanings:** currently screened as individual source-referenced candidates; the visible pictogram layer can be toggled independently.
- **Whole-word meanings:** reserved but **not populated**. Future word mappings need their own sourced senses, and each word's constituent character meanings should remain separately inspectable. Do not infer a compound word's meaning by mechanically combining character meanings.

An emoji expression can be one icon, several reusable icons, or no icon. A typed expression tree describes relationships underneath the emoji display; its operator punctuation is not a required part of the visual system.

## Source and licensing

The dataset [data/semantic/mandarin-1000-v0.1.json](../data/semantic/mandarin-1000-v0.1.json) imports the **kDefinition** property from [Unicode's Unihan database](https://github.com/unicode-org/unihan-database/blob/667c2d180a75ddd749b774dbb7588d4786b63222/kDefinition.txt), pinned at commit \`667c2d180a75ddd749b774dbb7588d4786b63222\`.

- Source owner: Unicode, Inc.; data under [Unicode License v3](../licenses/UNICODE-3.0.txt), reproduced in this repository.
- Source status: Unicode's **draft-review repository**, not a fixed release of the normative Unicode database. It is useful evidence but **not independent verification** of Mandarin vocabulary.
- The raw definition text, Unicode code point, source record, and candidate segments are retained. Semicolon-separated segments are organizational candidates, **not verified distinct lexical senses**. Commas frequently separate synonyms or loosely related usages. This data does not establish occurrence frequency, grammatical categories, modern everyday meaning, or historical etymology.
- Future validation must compare independently sourced Mandarin dictionaries or corpora, verify applicable word vs character uses, and retain provenance and licenses separately for every source. CC-CEDICT may be a candidate supplementary source, subject to compatible attribution and ShareAlike requirements; it is **not** imported into this dataset.
- Emoji assignments are hypotheses that need human linguistic and visual-comprehension review before promotion.

This new semantic data's separate source license is not replaced by the project's code license.

## Progress definitions

The percentages have deliberately distinct denominators and meanings:

| Metric | Definition |
| --- | --- |
| Source intake | Character has a pinned source definition; source coverage alone is **not** semantic completion |
| First-pass screened | Character has received at least one explicit initial review decision, either pictogram candidate or deferred |
| Emoji candidates | Screened character has at least one proposed, structurally valid emoji expression for **a selected definition group only** |
| Deferred | Screened character was considered but no sufficiently clear emoji was selected |
| Pending | Character with source evidence but no initial emoji decision |
| Production verified | Character whose relevant source senses and visual mappings completed independent linguistic and comprehension review; **none as of this draft** |

The first pass currently covers **ranks 1–100**. Each screened character receives one first-pass decision. It **does not claim to resolve every sense of a polysemous character**. Candidate entries identify the selected source definition group, the specific cue meaning, typed emoji expression, and pending review status. Characters with no selected emoji retain a documented abstention and the original source evidence.

The data's \`summary\` is regenerated from the records and checked by [semantic_inventory_smoke.mjs](../tools/glyph-pipeline/semantic_inventory_smoke.mjs), which also checks correspondence with the original ranked catalog and validates expressions against the [formal emoji grammar](../ontology/semantic-expression-v0.1.schema.json).

## Next screening and acceptance

Continue contiguous rank batches. For each character, inspect multiple candidate meanings and the lexical unit involved, select usable icon expressions only where credible, and keep explicit abstentions or unresolved senses. Reuse the same emojis and grammar rules across records. Do not require uniqueness or introduce an arbitrary emoji-count cap.

Before an entry moves to production, evidence must distinguish the selected **Mandarin character usage** from other senses and from whole-word usage; visual recognition must be evaluated separately. No color, Pinyin, tone, glyph, or structural data may be rewritten by this process.
