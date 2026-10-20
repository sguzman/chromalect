# Chromalect formal ontology (v1)

**Project scope:** multilingual, script-independent visual encoding of linguistic information. **Status:** versioned ontology foundation with a source-grounded Mandarin example; not a completed database of languages or an independently validated linguistic analysis.

This document is the human-readable ontology. Its canonical machine vocabulary is [`ontology/ontology-v1.json`](ontology/ontology-v1.json), governed by [`ontology/vocabulary.schema.json`](ontology/vocabulary.schema.json). A typed [`ontology/specimens-v1.json`](ontology/specimens-v1.json) graph is governed by [`ontology/instances.schema.json`](ontology/instances.schema.json). The [public ontology gallery](site/ontology.html) displays the taxonomy, relations, and linked data.

## Domain and boundaries

Chromalect describes linguistic *units*, evidence about those units, and versioned visual schemes that annotate them without changing source text. **No writing system is assumed to have Chinese radicals, nested components, fixed syllable initials/finals, or lexical tone.** The core vocabulary works without those structures; language profiles supply applicable concepts and evidence.

A project elsewhere may link here, but this repo retains its own ontology, data, renderer, and gallery. No external registry membership is established by this ontology.

### Key separation rules

- Language and script are distinct; no writing system is presumed to consist of Chinese components.
- Character identity, glyph geometry, orthographic segmentation, phoneme, and pronunciation are not interchangeable.
- An encoding scheme maps an explicitly typed linguistic target to a reversible presentation without rewriting source text.
- An instance carries one v0.4 component identity irrespective of its character context; a role is contextual.
- Citation readings and contextual readings have separate evidence and neither implies the other.
- A source-aligned geometric mapping is not independent visual or linguistic certification.
- Unknown facts and competing analyses remain explicit and cannot be silently promoted.
- Stroke path indices document geometry-to-component alignment only, not handwriting instruction.
- Each record is independently sourced, publicly distributable and versioned where appropriate.

## Entity classes (37)

Each class ID is a stable vocabulary term within ontology major version 1. Classes represent *types*, not a claim that instances have already been populated for every language.

### Language and varieties

| Class | Meaning |
| --- | --- |
| `Language` | An identified language as a linguistic system. |
| `LanguageVariety` | A regional, social, or standardized variety of a language. |

### Writing systems and graphic structure

| Class | Meaning |
| --- | --- |
| `Script` | A conventional collection of written graphic signs; not a language. |
| `WritingSystem` | Conventions for using a script to represent a language or its units. |
| `Orthography` | A documented set of spelling and character-use conventions for a language variety. |
| `Text` | Preserved source writing with its original sequence of characters. |
| `TextSpan` | A source-addressable span of written text with explicit offsets. |
| `Grapheme` | A contrastive graphic unit defined relative to a writing system. |
| `Character` | An abstract written character; distinguished from Unicode encoding and a rendered glyph. |
| `Glyph` | A particular visual realization of a character or written unit in a font or drawing system. |
| `GraphicComponent` | A reusable graphic constituent with an explicitly defined identity and normalization policy. |
| `ComponentInstance` | A located occurrence of a graphic component inside a particular glyph or decomposition. |
| `Decomposition` | A source-attributed structural analysis; may have competing alternatives. |
| `RadicalClassification` | A dictionary or standard-specific indexing category, distinct from exhaustive graphic components. |

### Pronunciation and prosody

| Class | Meaning |
| --- | --- |
| `OrthographicSegment` | A token of a particular transcription or spelling system, such as a Pinyin initial or final. |
| `Phone` | A speech-sound realization in a specified phonetic context. |
| `Phoneme` | A contrastive sound unit of a particular language variety. |
| `PhoneticFeature` | An independently defined articulatory or acoustic property. |
| `Syllable` | A syllabic unit within a specified pronunciation analysis. |
| `CitationReading` | A documented out-of-context reading of a written unit. |
| `ContextualReading` | A pronunciation realized in a particular lexical or textual context. |
| `ToneCategory` | A defined tone category under a language-specific phonological analysis. |
| `ProsodicFeature` | A suprasegmental feature or realization, including stress, timing, intonation, or tone contour. |

### Morphology, words, and meaning

| Class | Meaning |
| --- | --- |
| `Morpheme` | A minimal meaning-bearing or grammatical linguistic form in an analysis. |
| `Lexeme` | An abstract lexical entry, not identical to a printed word token. |
| `WordOccurrence` | An instance of a word in context with optional source offsets and sense resolution. |
| `Sense` | A source-supported interpretation associated with a lexical unit in context. |
| `SemanticFamily` | A justified grouping of meanings or forms, not an identity color by itself. |

### Visual encoding and rendering

| Class | Meaning |
| --- | --- |
| `EncodingScheme` | A versioned policy mapping specified information domains into visual representations. |
| `Palette` | A versioned registry of color assignments and related accessibility metadata. |
| `VisualAssignment` | One typed mapping from a declared linguistic target to a visual value or symbol. |
| `VisualLayer` | A configurable channel connecting an information domain to an independently selected presentation mode. |
| `RenderedSpecimen` | A concrete rendered example with source, scheme, layer state, and review status. |

### Evidence and provenance

| Class | Meaning |
| --- | --- |
| `Source` | An identified external or internal evidence source with revision and licensing context. |
| `Evidence` | A traceable support item connecting a source to a bounded claim. |
| `Claim` | An asserted interpretation or observed result with epistemic status and support. |

### Experiments

| Class | Meaning |
| --- | --- |
| `Experiment` | A reproducible comparison of encoding conditions, hypotheses, and outcomes. |

## Typed relations (39)

Relations have explicit source-domain and target-range classes. A relation's presence never implies an absent inverse or a source not recorded in the evidence layer.

| Relation | Domain → range | Semantics |
| --- | --- | --- |
| `hasVariety` | `Language` → `LanguageVariety` | A named variety belongs to a language. |
| `usesScript` | `WritingSystem` → `Script` | A writing system uses a particular script. |
| `servesVariety` | `WritingSystem` → `LanguageVariety` | A writing system is defined for a language variety. |
| `definesOrthography` | `WritingSystem` → `Orthography` | A writing system has a documented orthographic convention. |
| `containsSpan` | `Text` → `TextSpan` | A source text contains an addressable span. |
| `representsGrapheme` | `TextSpan` → `Grapheme` | A span encodes an orthographically defined grapheme. |
| `includesCharacter` | `Orthography` → `Character` | A character is admitted under a particular orthography. |
| `hasGlyph` | `Character` → `Glyph` | A character has a renderer-dependent visual realization. |
| `containsComponent` | `Glyph` → `ComponentInstance` | A glyph contains an instance of a reusable graphic component. |
| `instantiatesComponent` | `ComponentInstance` → `GraphicComponent` | An occurrence carries a normalized component identity. |
| `classifiedByRadical` | `Character` → `RadicalClassification` | A character has a source-specific indexing classification. |
| `hasDecomposition` | `Character` → `Decomposition` | A character has a cited structural analysis; alternatives remain separate. |
| `includesComponentInstance` | `Decomposition` → `ComponentInstance` | A decomposition includes a positioned component occurrence. |
| `hasCitationReading` | `Character` → `CitationReading` | A character is attested with an out-of-context reading. |
| `hasOrthographicSegment` | `CitationReading` → `OrthographicSegment` | A citation transcription contains spelling-system segments. |
| `hasSyllable` | `CitationReading` → `Syllable` | A citation reading is analyzed with one or more syllables. |
| `hasToneCategory` | `CitationReading` → `ToneCategory` | A language-specific citation tone is assigned without inferring sandhi. |
| `contextuallyReadAs` | `WordOccurrence` → `ContextualReading` | A word occurrence has context-dependent pronunciation. |
| `realizesPhoneme` | `Phone` → `Phoneme` | A phonetic realization is analyzed as a phoneme in context. |
| `hasPhoneticFeature` | `Phone` → `PhoneticFeature` | A phone has a defined phonetic feature. |
| `syllableContainsPhone` | `Syllable` → `Phone` | A syllable contains a phone under a selected transcription. |
| `hasProsodicFeature` | `ContextualReading` → `ProsodicFeature` | A contextual pronunciation bears a prosodic realization. |
| `representsMorpheme` | `TextSpan` → `Morpheme` | A written span is analyzed as a morpheme. |
| `instanceOfLexeme` | `WordOccurrence` → `Lexeme` | A word occurrence instantiates a lexeme. |
| `hasSense` | `Lexeme` → `Sense` | A lexeme has a source-attributed sense. |
| `selectedSense` | `WordOccurrence` → `Sense` | A contextual occurrence selects a justified sense. |
| `memberOfFamily` | `GraphicComponent` → `SemanticFamily` | A component is grouped by documented evidence, not just matching hue. |
| `cuesReading` | `ComponentInstance` → `CitationReading` | A source-substantiated phonetic role in a specific character, not guaranteed modern pronunciation. |
| `usesPalette` | `EncodingScheme` → `Palette` | A visual encoding scheme references a particular palette version. |
| `containsAssignment` | `EncodingScheme` → `VisualAssignment` | A scheme declares a reproducible visual assignment. |
| `assignmentTargets` | `VisualAssignment` → `GraphicComponent` / `Grapheme` / `OrthographicSegment` / `Phoneme` / `PhoneticFeature` / `ToneCategory` / `ProsodicFeature` / `Morpheme` / `Sense` / `Lexeme` | A visual assignment names its precise target information domain. |
| `controlsLayer` | `EncodingScheme` → `VisualLayer` | A scheme defines one independently configurable visual channel. |
| `rendersWithScheme` | `RenderedSpecimen` → `EncodingScheme` | A specimen was rendered using a declared scheme version. |
| `appliesLayer` | `RenderedSpecimen` → `VisualLayer` | A specimen applies an individually selected information layer. |
| `illustratesCharacter` | `RenderedSpecimen` → `Character` | A specimen depicts a specific written character. |
| `illustratesWord` | `RenderedSpecimen` → `WordOccurrence` | A specimen depicts a particular word occurrence. |
| `sourcedFrom` | `Evidence` → `Source` | Evidence points to a revision-addressable source. |
| `supportsClaim` | `Evidence` → `Claim` | Evidence supports a bounded factual or interpretive claim. |
| `evaluatesScheme` | `Experiment` → `EncodingScheme` | A controlled experiment studies a specified visual scheme. |

## Representation and epistemic states

- **Identity:** `GraphicComponent` is a reusable identity. `ComponentInstance` locates an occurrence in one glyph or structural analysis. `RadicalClassification` is a source-specific indexing convention, not a synonym for every graphic part.
- **Written versus pronounced:** `OrthographicSegment` such as written Pinyin `h` or `ao` is not automatically a `Phone` or `Phoneme`. `CitationReading`, `ContextualReading`, `ToneCategory`, and `ProsodicFeature` remain separate.
- **Words:** `Morpheme`, `Lexeme`, `WordOccurrence`, and `Sense` support actual words and text spans, not only isolated characters. These are ontological classes; no word-level corpus is asserted as implemented yet.
- **Visual layers:** `EncodingScheme` owns `VisualAssignment` records, optionally referencing a `Palette`; `VisualLayer` supports `off`, `direct`, and `marker`. The exact medium (fill, edge, outline, symbol, motion, etc.) is an explicit property of the assignment.
- **Evidence:** `Claim` and `Evidence` preserve competing analyses and identify `Source` records. Valid statuses include `source_aligned`, `candidate`, `unresolved`, `independently_verified`, `illustrative`, and `not_implemented`. These statuses are not synonyms.
- **Research:** `Experiment` is independent from `RenderedSpecimen`; producing an image or color chart is not evidence of learning benefits.

## Implemented language profile and example

The first profile is **Modern Standard Mandarin (Putonghua), Mainland simplified Chinese orthography, and Hanyu Pinyin**. The formal model explicitly allows additional language profiles with different linguistic units and scripts. This repository does not claim full implementations of those profiles today.

The source-grounded example [`ontology/specimens-v1.json`](ontology/specimens-v1.json) represents **好** (catalog rank 581): `⿰女子`, graphic components `cmp-0014` (女, `#EA5202`) and `cmp-0015` (子, `#98518A`), and two cited Pinyin readings, `hǎo` (tone 3) and `hào` (tone 4). The example distinguishes those written tokens from phonemic claims and records that the source-aligned vector geometry is **not independently visually certified**.

### Existing canonical data bindings

| Ontology binding | Canonical path | Status |
| --- | --- | --- |
| `mandarin-component-palette` | [`palettes/mandarin-component-identity-v0.4.json`](palettes/mandarin-component-identity-v0.4.json) | implemented |
| `mandarin-character-catalog` | [`data/catalog/characters-0001-1000.json`](data/catalog/characters-0001-1000.json) | source_catalog |
| `mandarin-citation-readings` | [`site/pronunciation-citations-0001-1000.json`](site/pronunciation-citations-0001-1000.json) | first_listed_display_not_contextual |
| `phonetic-and-tone-presentation` | [`site/layers-v0.1.json`](site/layers-v0.1.json) | implemented_orthographic_preview |
| `source-aligned-strokes` | [`data/catalog/colored-strokes-v0.1.json`](data/catalog/colored-strokes-v0.1.json) | curated_pilot_not_independently_certified |
| `provenance` | [`data/catalog/provenance-v1.json`](data/catalog/provenance-v1.json) | documented |
| `rendered-mappings` | [`site/glyphs/mappings.json`](site/glyphs/mappings.json) | generated_during_pages_build_source_aligned_not_independently_certified |

Generated site mappings under `site/glyphs/` are built by the Rust pipeline during deployment; they are **not** a committed independent source database. The committed source records and source revisions are authoritative for that generation.

## Versioning, validation, and constraints

1. Ontology **major versions** determine class and relation semantics; new language profiles do not silently redefine the same terms.
2. Visual color assignments are versioned **independently** from the ontology vocabulary (currently component palette v0.4 and presentation layers v0.1).
3. JSON Schemas check machine-record structure. Rust integrity checks also validate unique class/relation IDs, defined domain/range types, instance-graph referential integrity, profile bindings, and the source-backed Mandarin example.
4. Every externally derived linguistic assertion needs identifiable provenance, with unsupported or conflicting interpretations explicitly unresolved.
5. Reversibility, source-text fidelity, accessibility, alternative readings, and independent display-layer controls remain requirements.
6. Stroke path ordering is source geometry indexing only. No handwriting-order educational semantics are introduced.
7. All published ontology material must meet [CONSTITUTION.md](CONSTITUTION.md) and [AGENTS.md](AGENTS.md) confidentiality and neutral-publication standards.

## Scope of completion

The **ontology bootstrap** comprises a typed vocabulary, relation signatures, JSON Schemas, real-data bindings, source-grounded example instances, Rust validation, and a navigable public ontology page. Filling every term with validated corpora, adding all languages, independent visual auditing, and linguistic research trials are continuing work, not prerequisites for an honest foundation.
