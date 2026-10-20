# Chromalect ontology artifacts

This directory contains the **self-contained, machine-readable vocabulary and example graph** for Chromalect's multilingual visual-language research. The human-facing account of classes, relationships, evidence, and implementation boundaries is [ONTOLOGY.md](../ONTOLOGY.md).

| Artifact | Role |
| --- | --- |
| [ontology-v1.json](ontology-v1.json) | Namespaced typed vocabulary: entity classes, relation domain/range signatures, controlled terms, profile bindings, and compatibility principles |
| [vocabulary.schema.json](vocabulary.schema.json) | JSON Schema 2020-12 for the ontology vocabulary |
| [specimens-v1.json](specimens-v1.json) | A source-attributed, typed example graph for 好, separating character, glyph, component, cited readings, scheme, palette, and evidence |
| [instances.schema.json](instances.schema.json) | JSON Schema 2020-12 for example/instance graphs |

## Scope

The ontology applies to scripts, alphabets, phonology, morphology, lexicon, semantics, prosody, and reversible visual encoding. The first **implemented** profile is Standard Mandarin written in Mainland simplified Chinese with citation Hanyu Pinyin. Other language-specific analyses and datasets remain future work. No script is required to exhibit Chinese-style radicals or phonological tones.

The ontology vocabulary is **versioned separately** from color palettes and rendering schemes. Machine bindings reference source documents that remain authoritative; copies of the source catalog and palette are not embedded into the vocabulary.

## Validation and publication

The Rust glyph pipeline runs referential integrity, class and relation signature, source-binding, and specimen consistency checks:

```sh
cargo test --manifest-path tools/glyph-pipeline/Cargo.toml
cargo run --manifest-path tools/glyph-pipeline/Cargo.toml -- check
```

The [GitHub Pages workflow](../.github/workflows/pages.yml) publishes these JSON documents under `/chromalect/ontology/`. The public [ontology overview](../site/ontology.html) presents the complete vocabulary and its sample for browsing; the main repository remains authoritative.

## Evidence and publication requirements

The example's component assignments and Pinyin readings reference committed, provenance-annotated datasets. Source-aligned stroke geometry is **not** an independently validated reconstruction. Unresolved or alternate analyses must not be promoted into authoritative instances without review.

All public ontology changes must follow [CONSTITUTION.md](../CONSTITUTION.md) and [AGENTS.md](../AGENTS.md). Private communications, private tone, and confidential material are not permitted in ontology artifacts or their commit history.

No external registry enrollment is implied or performed by maintaining this directory.
