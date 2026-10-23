# Mandarin dictionary reading-inventory review

**Status:** research instrument covering **1,393 dictionary reading records associated with all 1,000 first-tranche characters**. It does not validate the sense inventory or grant production approval.

## Purpose and denominator

The [reading-inventory worksheet](../site/reading-inventory.html), available from the site research navigation, complements the [897 selected meaning-candidate worksheet](../site/lexical-review.html). The former begins from independently pinned CC-CEDICT reading strings rather than provisional emoji: it therefore includes all **119 characters** without an initial pictogram (representing **173 recorded reading entries**). A dictionary reading is a headword-level source record, not a counted verified contemporary Mandarin sense.

| Scope | Reading records |
| --- | ---: |
| All 1,000 characters | 1,393 |
| High-attention: multiple readings and at least eight gloss fragments | 319 |
| Targeted complexity | 503 |
| Deferred-only low-complexity characters | 67 |
| Baseline | 504 |
| Characters with multiple readings (339 characters) | 732 |
| Characters without emoji candidates (119 characters) | 173 |

These cohorts overlap except for the four exclusive triage tiers. The tiers are defined in [polysemy triage](mandarin-polysemy-triage.md), not by verified senses. An additional source-evidence cohort includes 140 reading records belonging to 64 high-attention characters lacking explicit written-form/Pinyin cross-reference tokens; see the [evidence-acquisition queue](mandarin-high-attention-evidence-priority.md).

## Review and provenance

The static page loads the five pinned [CC-CEDICT excerpt blocks](../data/semantic/cedict-crossref/) and [polysemy-triage-v0.1.json](../data/semantic/cedict-crossref/polysemy-triage-v0.1.json) already published through Pages. Exact source reading markers are grouped using the shared [dictionary reading parser](../site/dictionary-readings.js). A character's glyph uses the existing source-aligned display; no color, glyph, sound or emoji mapping is altered.

For each selected reading, the worksheet asks for a **preliminary usage category** (ordinary, specialized, historical, name, graphic convention or undetermined), a **contextual unit** (standalone character, in-word use, both or undetermined), and an evidence rationale. An independently sourced example and locator can be included when available, but none is invented or automatically inferred from an English dictionary gloss. The original excerpt and any other source reading spellings remain inspectable. The worksheet also displays explicit written-form/Pinyin references within each pinned dictionary reading, labeled as source-internal links rather than independently attested usage examples. See the [cross-reference audit](mandarin-dictionary-reference-cues.md).

External-source links for ten high-attention characters, including five with [unresolved cross-dictionary wording or pronunciation differences](mandarin-external-dictionary-discrepancy.md), are exposed as source locations only. The preliminary assistant desk interpretations are not prefilled in the questionnaire. The optional **v0.2 contextual evidence fields** require an actual stable HTTPS source URL, record identifier, contributor/publisher credit, and explicit reuse disposition. A Tatoeba record must use the canonical numbered sentence URL; its ID is checked against the submitted URL. A `link_only` record cannot export example text. These are structural and licensing-intake assertions, not live verification of the linked sentence, contributor, license, contextual reading, or meaning. Source records should be checked independently before their claims are used. Existing exported v0.1 files remain validator-compatible; new worksheet sessions export v0.2.

Session scope and count are frozen when the session begins. A new batch cannot replace recorded local observations until an explicit JSON export has been initiated. Recording additional observations after an export makes the batch unexported again. This guards against accidental session loss but does not provide persistent browser storage. Observations remain browser-local until explicitly exported as `chromalect.reading-inventory-observation-session.v0.2`; no participant identity is collected by default. Free-text fields should omit personal information. The export is always marked preliminary; it does not create independent lexical approvals or affect production data.

## Validation

Run `node tools/glyph-pipeline/reading_inventory_validate.mjs <export.json>` on an explicitly exported local file. Its checks confirm immutable reading identity, source path and SHA, dictionary excerpt, selected cohort, unique entry keys, questionnaire values, rationale presence and explicit nonapproval fields. [Smoke tests](../tools/glyph-pipeline/reading_inventory_smoke.mjs) exercise the page and validator with synthetic responses. They test integrity, **not translation accuracy**. No synthetic participant observations are committed.

CC-CEDICT excerpt material remains subject to **CC BY-SA 4.0**, revision `63c2569948629323b515833930fdd10f285401b6`. The original Unihan candidate meanings are separately attributed under the Unicode source license.

## Independence gate

A qualified independent review must separately establish modern reading usage and representative attested contexts, distinguish names or graphic conventions from lexical senses, and adjudicate disagreements. A preliminary local worksheet observation, automated dictionary grouping, or assistant-authored reading summary is not an independently certified linguistic result. The research project still records **0 lexical approvals, 0 independent emoji comprehension approvals, and 0 production semantic approvals**.
