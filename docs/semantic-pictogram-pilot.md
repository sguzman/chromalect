# Semantic pictogram composition: first-tranche pilot

**Status:** experimental design, not a finished semantic layer or a sourced Mandarin sense inventory. Scope: the existing first 1,000 Mandarin characters and short lexical examples using those characters. Pronunciation and tone are out of scope.

## Decision

Test **small pictographic annotations** to convey selected source-supported meanings. An annotation may contain **one emoji, a structured combination of two or three, or no emoji at all**. A concise written gloss is always available and takes precedence when a pictogram would be ambiguous.

**Do not encode meaning by recoloring Chinese strokes, inserting pictures into radicals, or asserting that character components add up to modern word meanings.** Component color identity is a separate, stable channel. Historical semantic components may motivate a separately evidenced *role* annotation, not an automatic sense assignment.

The semantic layer begins **Marker-only**. `off` restores ordinary text. `direct` remains **unavailable** until an independently motivated, accessible direct-cell encoding is tested; a floating emoji pasted inside a Hanzi is not a meaningful direct-encoding system. Do not steal the existing component-color stripe, pronunciation edges, or tone anchors.

## Why not one emoji per character?

- A Chinese character is not necessarily one word, one morpheme, or one meaning. One character can have several readings, senses, and uses, including grammatical ones with no clear picture.
- A modern two-character word can have a meaning not compositionally recoverable from its individual characters.
- Emoji conventions vary by operating system, culture, and font. Emoji names are not proof of lexical meaning.
- Emoji sequences have no intrinsic grammar. Two pictures juxtaposed do not uniquely say which is the action, which is the object, or what their relation means.
- Abstract concepts, grammatical markers, nuanced emotions, negation, and specialized senses often need a gloss, not a forced pictogram.

## Semantic design model

1. **Evidence-first sense inventory.** Collect separately sourced, reviewable `Lexeme` and `Sense` records; distinguish standalone character uses from words, their actual lexical senses, grammatical function, and reading constraints. Preserve alternative senses. Do not silently select the first dictionary gloss as the unique meaning.
2. **Presentation assignment.** Assign each *sense*, not each glyph, an optional symbol recipe. The same sense may appear in several words; different senses of one character must not silently share a misleading symbol.
3. **Compositional recipe.** `simple` (one icon), `sequence` (up to three icons with an explicit relation), or `gloss_only`. A combination must declare what its symbols jointly mean: for example, `associated`, `agent_action`, `action_patient`, or `property_of`. Do not treat untyped emoji adjacency as formal compositional semantics.
4. **Human-legible rendering.** A small external badge contains one to three emojis where appropriate, with an accessible Chinese/English gloss and a source/sense inspector. Make it optional, selectable, and separately toggleable from phonetics and component identity. Never replace the original Hanzi.
5. **Evidence & review.** Store a stable sense ID, headword and granularity (`character_usage` vs. `lexeme`), sourced Chinese explanation and/or bilingual gloss, source/license/revision, applicable contexts, emoji text and Unicode/CLDR version, relation, confidence, and review status. `illustrative` examples cannot be admitted into production.
6. **Abstention.** If meaning is disputed, senses cannot be disambiguated from context, or a recipe is misleading, show a short labeled gloss or an explicit `sense unresolved` indicator. Coverage must not be inflated by guesses.

## Examples for a **visual** pilot (NOT vetted dictionary entries)

| Unit | Possible meaning | Trial symbol | Reason for the trial |
| --- | --- | --- | --- |
| 山 | mountain | ⛰️ | one picture may be enough |
| 水 | water | 💧 | one picture may be enough |
| 火 | fire | 🔥 | simple concrete sense |
| 学 | study/learn | 📖🧠 | two-picture association; intentionally ambiguous |
| 火山 | volcano | 🌋 vs. 🔥⛰️ | compare one familiar symbol with a compositional pair |
| 火车 | train | 🚆, **not** literal 🔥🚆 | modern word sense overrides literal character combination |
| 生 | birth/life/raw (different usages) | 👶 / 🌱 / 🥩 | *alternatives*, not one three-emoji combined meaning |
| 行 | multiple uses and readings | gloss-only until sense selected | suppress ambiguity instead of guessing |

These are interface design specimens, not imported data, source claims, or automated 1,000-character assignments. Source work follows design selection.

## Pilot protocol

Use 20–30 varied, correctly sourced *senses*, not merely 20–30 glyphs: simple objects/actions, multi-sense characters, abstract qualities, function words, and non-literal compound words. Compare in randomized order:

- A. Written sense gloss alone.
- B. One pictogram plus an optional gloss.
- C. Two/three pictograms with a declared relation plus an optional gloss.
- D. No semantic overlay (for baseline readability).

For each specimen, test **meaning recognition without revealing the gloss**, user-rated ambiguity, reading speed, space occupied at phone/desktop sizes, and ability to distinguish competing senses. If an emoji composition is worse than a short gloss, the system should select the gloss. Emoji encodings are aids, not a universal dictionary substitute.

## Implementation sequence

1. Keep current semantic mode unavailable in production while the lab is illustrative.
2. Build the independent [visual semantic lab](../site/semantic-lab.html), with one, two/three, and gloss-only variants and plain-language warnings.
3. Select a license-compatible Chinese source for character uses and word senses, build a separate machine-readable, review-status-bearing sense inventory, and bind sound reading **only if** needed to distinguish which sense is meant. Sound-channel expansion is out of scope.
4. Turn on **Marker** only where the sense evidence and pictogram review both pass; preserve an immediate Off state and expose alternative meanings.
5. Treat semantic **Direct** as a separate experiment: do not force icon pictures or meaning color assignments into radical shapes. Evaluate semantic component **roles** separately from modern senses.

**Invariant:** the source character string, its glyph path identities, all v0.4/v0.5/v0.6 component colors, pronunciation and tone layers, and existing Mandarin 1,000 coverage must be unchanged by this experiment.
