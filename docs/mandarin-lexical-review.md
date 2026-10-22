# Mandarin lexical verification: independent dictionary intake

**Status (2026-10-22):** first 300 character headwords cross-referenced; human linguistic verification and pictogram comprehension review not yet completed. The original 1,000-character screening is already complete.

## Independent second source

The original first-pass semantic evidence came from pinned Unicode Unihan draft \`kDefinition\` records. The [new cross-reference manifest](../data/semantic/cedict-crossref/manifest-v0.1.json) examines ranks **1–300** against a **separate CC-CEDICT** headword dictionary, using a pinned per-character [cedict-json](https://github.com/krmanik/cedict-json) mirror revision \`63c2569948629323b515833930fdd10f285401b6\`.

- Original compiler: CC-CEDICT community project. Mirror/JSON adaptation: Mani (Infinyte7), **CC BY-SA 4.0**; source licenses apply separately to the [batch records](../data/semantic/cedict-crossref/), and attribution is in [third-party notices](../THIRD_PARTY_NOTICES.md).
- The 21 batch files preserve the selected headword, traditional form, pinyin readings, dictionary gloss text, mirror file SHA, and source provenance. They **do not relicense** CC-CEDICT under the repository's software license.
- The manifest summarizes support flags without copying the full dictionary. The actual database snapshot is not a live dictionary and may contain old, infrequent, regional, proper-name, or character-only usages.
- A **literal gloss match** is a case-insensitive English substring check only. It is not semantic inference, independent human lexical validation, and certainly not a comprehension test. The same meaning can be expressed with different English words, and a literal match can still be misleading.

## Progress (each uses the same 1,000-character denominator unless otherwise noted)

| Stage | Count | Percentage | Meaning |
| --- | ---: | ---: | --- |
| Unihan initial source coverage | 1,000 / 1,000 | 100% | One provisional definition source available |
| Initial pictogram screening | 1,000 / 1,000 | 100% | Candidate or explicit abstention |
| Independent CC-CEDICT headword cross-reference | 300 / 1,000 | 30% | Separate dictionary retrieved and indexed |
| Independent human lexical sense approval | 0 / 1,000 | 0% | No completed linguistic review |
| Independent emoji comprehension approval | 0 / 1,000 | 0% | No completed human tests |
| Production semantic verification | 0 / 1,000 | 0% | Requires both linguistic and pictographic acceptance |

Among the first 300 characters, 216 have initial emoji candidates (223 expression assignments). **174 of 223** proposed sense glosses were found as literal English substrings in the corresponding CC-CEDICT headword; **49 of 223** require synonym, polysemy, or lexical-category inspection. All 300 characters have independent headword entries; 84 currently have no candidate emoji. The literal matches are a **triage signal, not 64 verified translations**.

## Candidate discrepancy queue (preliminary human-authored triage)

These are observations on the first 9 nonliteral expression alignments (ranks 1–100), not independent verification or promotions. The complete 28-item discrepancy queue is indexed in the machine-readable [cross-reference manifest](../data/semantic/cedict-crossref/manifest-v0.1.json):

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


### Second batch: ranks 101–200

A [machine-readable triage register](../data/semantic/cedict-crossref/triage-0101-0200.json) now classifies these 19 cases into 8 higher-priority and 11 medium-priority follow-ups, retaining zero lexical and emoji approvals. The additional 19 nonliteral candidate matches occur on 互, 贝, 冈, 气, 升, 仁, 仍, 斤, 凶, 氏, 勿, 匀, 亢, 火, 订, 尺, 幻, 玉 and 扑. These have been **flagged, not rejected or confirmed**.

Examples requiring particular care:

- **气** can refer to air, gas or breath; the candidate "steam" must not be accepted as an undifferentiated modern sense based merely on visual similarity.
- **仁** involves benevolence/humaneness; ❤️ is an intuitive hypothesis but the ethical concept is broader than the icon.
- **斤** is a weight measure and may be confused with an axe-related character origin; pictograms should reflect a selected contemporary sense, not an inferred pictographic etymology.
- **火** has a directly recognizable fire icon, but the chosen source term "fire" can still fail a literal match depending on a particular dictionary headword's selected gloss. Automated mismatch is not definitive evidence of an error.

In all the flagged cases, the next action is to inspect the Chinese-language context, reading, and individual candidate sense before changing or approving any pictogram. Literal matches elsewhere still require that review.

### Third batch: ranks 201–300

The new 21 nonliteral alignment flags are attached to these characters: 去, 节, 术, 布, 夯, 卢, 业, 旧, 申, 叭, 叨, 冉, 凹, 付, 仗, 仔, 斥, 丛, 甩, 匆, and 主.

These flags need per-sense review, not automatic rejection. Particular issues include:
- **节**: the selected concept "knot" can conflict with the character's much broader sense set (joint, festival, section, restraint).
- **术**: "art" and techniques/methods require separate lexical interpretation.
- **旧**: "ancient" and "old/former" are not interchangeable without context.
- **主**: "chief" can be related to master, owner, primary, or principal without representing every usage equally.

Some apparent mismatches result solely from a different English grammatical form, and some may reflect a genuinely poor emoji candidate. Neither source lookup nor substring comparison resolves that ambiguity.

## Approval gates

1. An independent lexical reviewer must determine which **modern Mandarin character senses** exist, and attach context, reading and evidence. The English gloss-matching code cannot approve a meaning.
2. A pictogram must be reviewed independently for accuracy and ambiguity, including its relation to an action or role where relevant. Reusable emoji may work for many characters; pictograms need not be unique or limited to a fixed count.
3. The reviewer records decisions **per sense**, with abstentions for cases lacking defensible imagery. Whole-word senses remain separate and not yet populated.
4. Production verification advances only when both independent lexical evidence and comprehension acceptance exist. Source ingestion and automation never increment it.

The [semantic browser](../site/semantic-coverage.html) shows separate progress bars for these stages. Existing glyph, Pinyin, tone and component-color evidence is unchanged.
