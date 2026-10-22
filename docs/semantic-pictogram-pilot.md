# Semantic emoji composition: Mandarin pilot

**Status:** experimental presentation design, not a sourced Mandarin sense inventory or a completed production semantic layer. Scope is the first 1,000 Mandarin characters and short word examples drawn from them. Sound and tone encoding are outside this experiment.

## Design

Semantic annotations form **one optional emoji-expression layer**. A selected meaning can be expressed by a single emoji, a sequence of multiple reusable emojis, or no pictogram where none is clear. Single- and multiple-emoji expressions **coexist in the same view**. There is **no fixed maximum number of symbols**, no requirement for an expression to be unique to a character, and no requirement that every meaning receive an emoji expression. Extra symbols should clarify rather than lengthen the display.

An emoji symbol is a reusable visual unit, not an exclusive character ID. Different selected meanings can share symbols, and a meaning occurring across multiple units may reuse an entire expression where justified. A character may have several distinct meanings requiring different expressions. A word's meaning must be established independently rather than inferred by concatenating its characters' meanings.

Written meanings remain accessible for checking and interpreting pictograms. They are not a rival emoji scheme. Original Chinese remains unchanged, and the entire semantic layer can be turned off.

A symbol sequence can be interpreted in several ways; adjacency does not define a semantic grammar by itself. If a semantic relation is asserted for a sequence, record it as separately reviewable metadata, not as an assumed property of symbol order.

## Data model for future production work

1. Record source-backed lexemes, character usages, and **distinct senses**, with definitions, context, evidence, source revision, license, and review status.
2. Attach optional emoji-expression assignments to **reviewed senses**, not permanently to character glyphs. Store an ordered, **variable-length** list of reusable symbols; do not cap length or impose uniqueness constraints.
3. Preserve distinct character-level and word-level senses. Keep alternative meanings separately available. Do not collapse polysemy into one pictogram.
4. Preserve written meaning, uncertainty, emoji/Unicode version, accessibility labels, presentation review status, and evidence for any claimed semantic relations.
5. Count a sense as production-complete only after its lexical evidence and pictogram assignment have passed the relevant review. A source-backed sense without a satisfactory pictogram can be recorded as **no pictogram** rather than fabricated coverage.
6. Never publish illustrative lab examples as verified dictionary data.

Component identity colors, decomposition and glyph geometry, existing pronunciation and tone layers, and the original writing remain independent. Semantic **Marker** is the initial candidate presentation. Semantic Direct requires its own accessible design and separate evidence; it does not permit arbitrary recoloring or replacing Hanzi strokes with pictures.

## Unverified visual specimens

| Written unit | Selected illustrative meaning | Candidate expression | Observation |
| --- | --- | --- | --- |
| 山 | mountain | ⛰️ | One symbol may suffice |
| 水 | water | 💧 | One symbol may suffice |
| 火 | fire | 🔥 | One symbol may suffice |
| 学 | learn / study | 📖🧠 | Test a composed expression |
| 读 | read | 👀📖 | Reuse 📖 without reserving it for 学 |
| 火山 | volcano | 🌋 | A dedicated icon may be clearer than composing character meanings |
| 火车 | train | 🚆 | Use the word sense rather than 火 plus 车 |
| 生 | being born | 🤰👶 | One usage among several |
| 生 | raw / uncooked | none proposed | Written meaning retained until a clear expression is found |

These examples test a display model; they are **not** verified linguistic annotations or production mappings.

## Test protocol and implementation

The [semantic lab](../site/semantic-lab.html) displays all available expressions in one view, regardless of symbol count. A plain-character mode provides a baseline; a separate control reveals written meanings. The interface renders an ordered emoji array of any length and reuses vocabulary symbols.

A future sourced pilot should sample 20–30 varied **senses**, including polysemous characters, concrete actions, abstract concepts, function words, and opaque compounds. Evaluate meaning recognition without initially revealing written meanings, ambiguity, time to comprehension, accessibility, and legibility at different sizes. Compare candidate expressions *within* each sense as needed, without forcing all senses into the same symbol count.

Production semantic count at this design stage: **0 verified character mappings**. UI specimens do not contribute to coverage. Source selection, sense inventory, and independently reviewed emoji assignments remain the next steps.

**Invariant:** the first 1,000 Mandarin component-colored glyphs, versioned identity palettes, stroke-owner data, pronunciation, and tone mappings are unchanged by this experiment.
