# Mandarin lexical verification: independent dictionary intake

**Status (2026-10-22):** first 100 character headwords cross-referenced; human linguistic verification and pictogram comprehension review not yet completed. The original 1,000-character screening is already complete.

## Independent second source

The original first-pass semantic evidence came from pinned Unicode Unihan draft \`kDefinition\` records. The [new cross-reference manifest](../data/semantic/cedict-crossref/manifest-v0.1.json) examines ranks **1–100** against a **separate CC-CEDICT** headword dictionary, using a pinned per-character [cedict-json](https://github.com/krmanik/cedict-json) mirror revision \`63c2569948629323b515833930fdd10f285401b6\`.

- Original compiler: CC-CEDICT community project. Mirror/JSON adaptation: Mani (Infinyte7), **CC BY-SA 4.0**; source licenses apply separately to the [batch records](../data/semantic/cedict-crossref/), and attribution is in [third-party notices](../THIRD_PARTY_NOTICES.md).
- The 7 batch files preserve the selected headword, traditional form, pinyin readings, dictionary gloss text, mirror file SHA, and source provenance. They **do not relicense** CC-CEDICT under the repository's software license.
- The manifest summarizes support flags without copying the full dictionary. The actual database snapshot is not a live dictionary and may contain old, infrequent, regional, proper-name, or character-only usages.
- A **literal gloss match** is a case-insensitive English substring check only. It is not semantic inference, independent human lexical validation, and certainly not a comprehension test. The same meaning can be expressed with different English words, and a literal match can still be misleading.

## Progress (each uses the same 1,000-character denominator unless otherwise noted)

| Stage | Count | Percentage | Meaning |
| --- | ---: | ---: | --- |
| Unihan initial source coverage | 1,000 / 1,000 | 100% | One provisional definition source available |
| Initial pictogram screening | 1,000 / 1,000 | 100% | Candidate or explicit abstention |
| Independent CC-CEDICT headword cross-reference | 100 / 1,000 | 10% | Separate dictionary retrieved and indexed |
| Independent human lexical sense approval | 0 / 1,000 | 0% | No completed linguistic review |
| Independent emoji comprehension approval | 0 / 1,000 | 0% | No completed human tests |
| Production semantic verification | 0 / 1,000 | 0% | Requires both linguistic and pictographic acceptance |

Among the first 100 characters, 71 have initial emoji candidates (73 expression assignments, including two senses of 云). **64 of 73** proposed sense glosses were found as literal English substrings in the corresponding CC-CEDICT headword; **9 of 73** require synonym, polysemy, or lexical-category inspection. All 100 characters have independent headword entries; 29 currently have no candidate emoji. The literal matches are a **triage signal, not 64 verified translations**.

## Candidate discrepancy queue (preliminary human-authored triage)

These are observations on the 9 nonliteral expression alignments, not independent verification or promotions:

| Character | Selected candidate | CC-CEDICT wording / issue | Action |
| --- | --- | --- | --- |
| 丁 | male adult | Mirror primarily records fourth Heavenly Stem, surname and other uses | Confirm current/historical sense against authoritative Chinese-language source; avoid approving male-adult cue |
| 卜 | fortune telling | Headword gives *to divine / forecast* | Related meaning; check verb/event distinction and whether 🔮 is too generic |
| 亏 | lose | Dictionary gives *deficiency / deficit* | Likely difference in sense and part of speech; hold 📉 for review |
| 下 | under | Dictionary gives *below / down / lower* | Likely related; disambiguate position versus movement |
| 久 | long time | Dictionary gives *(long) time / duration* | Likely equivalent English paraphrase; still needs sense review |
| 亡 | death | Dictionary gives *to die / deceased* | Check noun/verb distinction and polysemy |
| 已 | finished | Dictionary gives *already / to stop* | Completion-aspect cue ✅ could be misleading; hold |
| 刃 | knife edge | Dictionary gives *edge of blade* | Same referent but 🔪 depicts whole knife, not just blade edge; reevaluate pictogram |
| 云 | clouds | Dictionary says *cloud*, also *classical: to say* | Singular/plural wording difference; preserve the separate "say" candidate |

## Approval gates

1. An independent lexical reviewer must determine which **modern Mandarin character senses** exist, and attach context, reading and evidence. The English gloss-matching code cannot approve a meaning.
2. A pictogram must be reviewed independently for accuracy and ambiguity, including its relation to an action or role where relevant. Reusable emoji may work for many characters; pictograms need not be unique or limited to a fixed count.
3. The reviewer records decisions **per sense**, with abstentions for cases lacking defensible imagery. Whole-word senses remain separate and not yet populated.
4. Production verification advances only when both independent lexical evidence and comprehension acceptance exist. Source ingestion and automation never increment it.

The [semantic browser](../site/semantic-coverage.html) shows separate progress bars for these stages. Existing glyph, Pinyin, tone and component-color evidence is unchanged.
