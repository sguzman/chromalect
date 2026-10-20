# Chromalect Constitution

## Identity and purpose

Chromalect is an independent, public project for researching, defining, and presenting **visual information encodings for written and spoken language**. Its purpose is to augment alphabets, characters, graphemes, components, syllables, morphemes, words, and larger units with useful, reversible information.

Color is a central technique, but not the only one. Supported avenues of research include spatial placement, outlines, typographic treatments, shapes, markers, phonetic and prosodic symbols, and optional purposeful motion. The aim is to make linguistic structure, identity, pronunciation, meaning, and relationships more legible and learnable, with claims tested rather than presumed.

**Chromalect is not a Chinese-only project.** Mandarin Chinese and Hanyu Pinyin are the first implemented research profile and may remain the most mature for some time. They do not constrain the ontology, project identity, or eventual support for Latin-script languages, Arabic, Hebrew, Hangul, or other writing systems. Each writing system must be modeled on its own terms rather than forced into Chinese-specific categories.

## Independent project

Chromalect owns its **ontology, source registry, machine-readable data, implementation, research records, and public presentation** within this repository. The ontology and gallery must be independently useful, without requiring a private knowledge base, another project's source tree, or a central monorepo.

An external registry, including Tarium, may **link to** Chromalect; it does not host, own, or contain this repository's ontology or presentation. Listing or enrollment in another registry requires an explicit separate decision. This document does not constitute automatic enrollment.

## Information architecture

1. **Linguistic entities:** Distinguish language, variety, script, character, grapheme, glyph realization, reusable graphic component, phone, phoneme, syllable, morpheme, lexeme, word occurrence, meaning, and prosody where relevant. Not every script has every kind of unit.
2. **Evidence and interpretation:** Record sources, revisions, licensing, uncertainty, alternatives, and the distinction between observed form, historical interpretation, citation reading, and contextual use. Unknown information remains unknown.
3. **Encoding schemes:** Keep identity colors and other visual mappings versioned, with explicit scopes and stable assignments within each version. Different information domains must not silently share a meaning simply because their colors match.
4. **Presentation:** The same underlying language data may be displayed plainly or with independent Direct and Marker layers. No visual treatment may silently change the original text or claim evidence that is not present.
5. **Reproducibility:** Publish human-readable explanations and machine-readable records for meaningful ontology classes, encoding assignments, source relationships, and implemented specimens. Document coverage gaps and known limitations.

The current Mandarin component palette, stroke geometry, and initial/final/tone encodings are specific instances of this broader system, not universal assumptions.

## Research and accessibility

Rendering, decomposition, pronunciation, and meaning are distinct claims. A source-aligned glyph is not automatically independently visually or linguistically verified. Report experimental results with their methods and limitations; do not present attractive demonstrations as proof of educational benefit.

Preserve accessible descriptions, a usable plain-text/plain-visual mode, and the ability to disable layers independently. Handwriting stroke order is **not an instructional objective**. Indexing source paths to match geometry to component ownership does not make stroke sequence part of the educational scheme.

## Public information boundary

**All repository content and publication surfaces must be public-safe by construction.**

- Never publish private conversations, chat transcripts, personal correspondence, private notes, personal outbursts, or language copied or paraphrased from confidential interactions.
- Never make public-facing text read like an answer to a private discussion. Describe the project, its data, its decisions, and its limitations in impersonal, neutral, technical language.
- Apply this boundary to the website, generated output, ontology, data, documentation, examples, tests, issue text, commit messages, and any other public artifact.
- Import from nonpublic materials only after the relevant **technical facts** have been independently restated, checked for provenance, and stripped of all private language and identifying context. Do not copy dialogue or conversational framing into public files.
- When provenance or publication safety is uncertain, omit the material until it can be verified. A useful implementation detail does not justify disclosure of private content.

## Changes and stewardship

The existing public website, machine-readable records, and stable palette versions are first-class artifacts. Preserve compatibility where practical, correct inconsistencies with tests, and version changes that alter the meaning of published encodings. Keep this repository independent and focused on visual linguistic representation.

This constitution establishes project scope and public-publication boundaries; implementation details belong in the other project documents.
