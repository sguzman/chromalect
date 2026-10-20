# Vision and research charter

**Research question:** can reversible visual augmentation reduce the effort needed to identify, pronounce, distinguish, and remember written-language units?

The first motivation is dense Chinese characters: their recurring pieces can be difficult to visually distinguish in ordinary monochrome print. Chromalect explores **pedagogical augmentation**, not an attempt to replace Chinese orthography for everyday public writing.

## Objectives

- Provide each normalized graphemic component with an unmistakable, stable visual identity.
- Preserve semantic relationships through structured **families** of related colors.
- Reveal character structure and historically phonetic/semantic roles where evidence supports those labels.
- Explore **genuinely encoded pronunciation** via reusable symbols formed from speech features, not arbitrary reading labels.
- Put tone/prosody into an independent visual channel.
- Test static versus contextual versus motion-based memory aids.
- Make every overlay toggleable and customizable while preserving information integrity.
- Define a language-independent ontology now; use Mandarin as the first implemented research profile and validate additional language-specific encodings with their own sources.

## Non-goals now

- Replacing Unicode, orthographic standards, Pinyin, the IPA, or existing teaching systems.
- Promising that components always transparently predict modern meaning or pronunciation.
- Packaging a complete dictionary, language course, spaced-repetition application, or TTS system.
- Drawing animated entertainment graphics as a substitute for data or research.
- Writing a product UI, Rust crate, or other implementation until there is a concrete experiment to support.

## Testable hypotheses

**H1: identity stability.** Fixed component-specific colors improve repeated recognition over random colors or plain text.

**H2: family organization.** Meaningful color neighborhoods help learners infer component families, compared with equally discriminable arbitrary color assignments.

**H3: compositional pronunciation.** A learned featural symbol can be decoded to sound more reliably than an equally sized arbitrary symbol.

**H4: layered learning.** Selectively enabling overlays improves transfer from assisted reading to unassisted reading.

**H5: purposeful motion.** Specific mnemonic animation improves retention or pronunciation accuracy without causing harmful distraction.

These are proposals requiring controlled comparisons, not established outcomes.

## Design tensions

- Stable unique identity versus perceptual confusion among nearby colors.
- Information density versus legibility at small sizes.
- Syllable-level codes versus truly cross-language phonetic feature primitives.
- Form-only decomposition versus historically justified semantic/phonetic decomposition.
- Citation pronunciation versus contextual pronunciation (e.g. polyphones and tone sandhi).
- Fine-grained animation versus overstimulation and reduced-motion requirements.

Treat each tension as a question to study; do not "solve" it by deleting information from the design.

## Scope boundary

The repository is autonomous and specific to experiments with visual representations of language. It should not become a general corpus ingestion system, linguistic encyclopedia, or cross-project utility warehouse.
