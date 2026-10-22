# Mandarin lexical verification: independent dictionary intake

**Status (2026-10-22): all 1,000 character headwords cross-referenced (100%), with a complete automated whole-term boundary audit.** No human linguistic verification or pictogram comprehension review has been completed. The original 1,000-character screening is already complete.

## Independent second source

The original first-pass semantic evidence came from pinned Unicode Unihan draft \`kDefinition\` records. The [new cross-reference manifest](../data/semantic/cedict-crossref/manifest-v0.1.json) examines ranks **1–1,000** against a **separate CC-CEDICT** headword dictionary, using a pinned per-character [cedict-json](https://github.com/krmanik/cedict-json) mirror revision \`63c2569948629323b515833930fdd10f285401b6\`.

- Original compiler: CC-CEDICT community project. Mirror/JSON adaptation: Mani (Infinyte7), **CC BY-SA 4.0**; source licenses apply separately to the [batch records](../data/semantic/cedict-crossref/), and attribution is in [third-party notices](../THIRD_PARTY_NOTICES.md).
- The 75 batch files preserve the selected headword, traditional form, pinyin readings, dictionary gloss text, mirror file SHA, and source provenance. They **do not relicense** CC-CEDICT under the repository's software license.
- The manifest summarizes support flags without copying the full dictionary. The actual database snapshot is not a live dictionary and may contain old, infrequent, regional, proper-name, or character-only usages.
- A **literal gloss match** is a case-insensitive English substring check only. It is not semantic inference, independent human lexical validation, and certainly not a comprehension test. The same meaning can be expressed with different English words, and a literal match can still be misleading.

## Progress (each uses the same 1,000-character denominator unless otherwise noted)

| Stage | Count | Percentage | Meaning |
| --- | ---: | ---: | --- |
| Unihan initial source coverage | 1,000 / 1,000 | 100% | One provisional definition source available |
| Initial pictogram screening | 1,000 / 1,000 | 100% | Candidate or explicit abstention |
| Independent CC-CEDICT headword cross-reference | 1,000 / 1,000 | 100% | Separate dictionary retrieved and indexed |
| Independent human lexical sense approval | 0 / 1,000 | 0% | No completed linguistic review |
| Independent emoji comprehension approval | 0 / 1,000 | 0% | No completed human tests |
| Production semantic verification | 0 / 1,000 | 0% | Requires both linguistic and pictographic acceptance |

All 1,000 characters now have CC-CEDICT headword entries, including 881 with experimental pictogram candidates (897 selected sense expressions) and 119 pictogram deferrals. The older substring check found 656/897 candidate English gloss matches; a subsequent Unicode-aware **whole-term** boundary audit reduced these to **649/897**, identifying seven substring-only false matches. **248/897** candidate glosses lack a strict whole-term match, but **all 897 remain unreviewed** for linguistic and pictographic correctness. The machine-readable [sense-review queue](../data/semantic/cedict-crossref/sense-review-queue-v0.1.json) prioritizes those 248 mismatches without counting them as approvals.

## Candidate discrepancy queue (preliminary human-authored triage)

These are observations on the first 9 nonliteral expression alignments (ranks 1–100), not independent verification or promotions. The currently indexed 248 strict whole-term discrepancies (including the historic first-200 review subset of 28) are traceable through the machine-readable [cross-reference manifest](../data/semantic/cedict-crossref/manifest-v0.1.json):

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

### Fourth batch: ranks 301–400

The fourth hundred adds 93 experimental sense expressions: 65 literal English-gloss matches and 28 candidates flagged for closer analysis. All 100 have independent headword evidence from the pinned CC-CEDICT source.

The flags include 汇, 汉, 让, 讯, 司, 民, 弘, 巩, 执, 扩, 场, 扬, 过, 厌, 夸, and 死. The complete 77 mismatches across the four hundred characters remain traceable through their rank and selected sense in the manifest. The following need special scrutiny:

- **汉**: a modern language or ethnic identification should not be inferred from a generic pictogram without evidence.
- **让**: the selected "allow" sense is narrower than the character's broader constructions; validate its grammar and event context.
- **民**: a collective people/citizens picture must be checked against the chosen lexical sense.
- **死**: "death" versus "die" entails a noun/verb distinction; skull imagery alone cannot establish either.

No mismatched expression, including a likely synonym, has been automatically accepted or rejected. Pictograms retain their experimental status.


## Full-tranche boundary review and next acceptance work

A complete [Unicode-aware whole-term audit](../data/semantic/cedict-crossref/boundary-audit-manifest-v0.1.json) was applied to all 897 proposed character-level sense expressions. This deliberately stricter automated English matching check found **649 potential whole-term matches**, **248 nonmatches**, and **7 entries** where an older substring search had been falsely positive: 丘/hill, 廷/court, 极/extreme, 兵/soldier, 状/shape, 没/drown, and 幸/luck. A match only indicates matching English wording in the dictionary; it is never an approval of Chinese sense alignment or human emoji comprehension.

A first-pass **desk analysis now covers all 248/248 flagged expressions (100%)**, including 15 high-priority, 11 medium-priority, and 222 otherwise unclassified cases, grounded in pinned CC-CEDICT headword excerpts. Zero entries remain without a preliminary assistant note. These notes are not independent lexical approvals. These observations are explicitly preliminary and do **not** constitute independent linguistic verification or emoji comprehension testing.

The [structured review queue](../data/semantic/cedict-crossref/sense-review-queue-v0.1.json) consolidates all 248 nonmatching expression records and preserves the selected character, word sense, original Unihan candidate group, emoji expression, dictionary reading availability, source revision, existing prioritized research notes, and pending verification statuses. Initial queue priority is purely organizational: 15 **high**, 11 **medium**, and 222 **not yet prioritized**. All 248 now have a preliminary desk-analysis note, while lexical and pictogram approval both remain pending for every entry; none is marked approved.

The earlier fifth-batch section and other per-100 observations are historical triage milestones, not the current coverage denominator. Source retrieval, boundary matching, sense verification, and emoji comprehension remain distinct gates.

## High-priority remediation overlay

For the 15 highest-priority flagged cases, a [machine-readable remediation overlay](../data/semantic/cedict-crossref/high-priority-remediation-v0.1.json) now proposes reversibly inspecting alternative senses or pictograms, retaining existing better-supported alternatives, or deferring misleading icons. The [research report](mandarin-high-priority-remediation.md) explains character-by-character limitations. No canonical source meaning or emoji is silently replaced by this overlay. The alternative proposals are not comprehension-approved.

## Approval gates

1. An independent lexical reviewer must determine which **modern Mandarin character senses** exist, and attach context, reading and evidence. The English gloss-matching code cannot approve a meaning.
2. A pictogram must be reviewed independently for accuracy and ambiguity, including its relation to an action or role where relevant. Reusable emoji may work for many characters; pictograms need not be unique or limited to a fixed count.
3. The reviewer records decisions **per sense**, with abstentions for cases lacking defensible imagery. Whole-word senses remain separate and not yet populated.
4. Production verification advances only when both independent lexical evidence and comprehension acceptance exist. Source ingestion and automation never increment it.

The [semantic browser](../site/semantic-coverage.html) shows separate progress bars for these stages. Existing glyph, Pinyin, tone and component-color evidence is unchanged.

### Fifth batch: ranks 401–500

The independently sourced intake now covers half of the 1,000-character tranche. The additional 100 headwords contain 98 candidate expression assignments, of which 71 matched a literal English substring and 27 need independent semantic alignment. The 97 character-level abstentions across ranks 1–500 remain abstentions rather than being filled with invented symbols.

Specific priorities include **乒** and **乓**: the familiar compound word 乒乓 (ping pong) is not evidence that each character independently means the sport. **华** has multiple character usages, so a whole-word or proper-name translation such as *Chinese* must not displace the selected character meaning without lexical context. **吗**, **屿**, **屹**, **则**, **丢**, **迁**, **仲**, **件**, **伪**, **合**, **爷**, **肋**, **危**, and **旬** also have candidate glosses that did not literally match their CC-CEDICT entries. These are review flags, not proof of error. The original emoji hypotheses remain experimental until an independent sense and comprehension review is completed.

