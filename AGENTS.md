# AGENTS.md

## Scope

This file guides contributors and automated development agents working on **Chromalect**, an independent multilingual visual-language-encoding project. Read [CONSTITUTION.md](CONSTITUTION.md) and [ONTOLOGY.md](ONTOLOGY.md) before making changes. Apply it to source, data, documentation, the generated site, tests, and public Git metadata.

## Project intent

- Maintain a self-contained **formal ontology and public gallery** for visual encodings of linguistic information. Preserve typed definitions in `ontology/ontology-v1.json`, structure in `ontology/*.schema.json`, the sourced example in `ontology/specimens-v1.json`, and the public overview in `site/ontology.html`.
- Support languages, alphabets, characters, graphemes, components, phonetic and prosodic structure, morphemes, words, and contextual annotations where evidenced by suitable language profiles.
- Treat Mandarin as the **first implemented profile**, not the project's scope limit. Do not force other scripts into Chinese component or Pinyin models.
- Keep source text, linguistic analysis, encoding schemes, and rendering separate. Make meaningful structures, mappings, provenance, and coverage available in human- and machine-readable forms.
- Preserve reversible Off / Direct / Marker concepts. Color is one encoding medium among several.
- Do not introduce handwriting-stroke-order teaching; source stroke indices are only for mapping vector geometry to owners.

## Absolute public-content boundary

This is a **public repository**. Never commit, paste, generate, or publish:

- Private conversations, chat exchanges, prompts, answers, correspondence, personal working notes, or private narrative language.
- Insults, emotional outbursts, personal tone, or words copied or paraphrased from private interactions, even in examples, TODOs, test fixtures, comments, or commit messages.
- Internal nonpublic resources, confidential identifiers, credentials, or unexplained excerpts from another project.

Write public text as standalone, neutral project documentation. Avoid replying to a reader or referring to an unseen conversation: no conversational acknowledgments, argumentative reassurances, or claims that someone previously requested or criticized something.

For nonpublic research inputs, extract only independently supportable technical facts, verify licensing and provenance, and **rewrite from scratch** in neutral language. Do not migrate private wording, logs, or correspondence. If in doubt, exclude the material and flag the uncertainty outside the public repository.

**Pre-publication check:** inspect all changed public text and generated output, including Markdown, HTML, JSON strings, comments, fixtures, workflow messages, and Git commit messages, for private or chat-derived content. Confirm the text would make sense to a reader who has never seen any development conversation. Passing automated tests does not replace this review.

## Data and implementation rules

- Do not invent component ownership, glyph geometry, pronunciations, semantics, or attested linguistic facts.
- Preserve stable identity colors inside a published palette version. New interpretations or changed assignments require an explicit, versioned change.
- Keep Direct component identities consistent with Marker/inspector identities. Do not quietly promote partial-source or alternate-decomposition review candidates into the active atlas.
- Preserve source attributions, licenses, uncertainty status, and distinct citation/contextual readings. Do not claim experimental learning effectiveness without evidence.
- Prefer the existing Rust glyph tooling and static Pages infrastructure. Keep source and generated data consistent and testable. Do not create a monorepo or hidden runtime dependency on another project.
- Do not make unexpected changes to repository location, branches, history, or unrelated projects. Work on the existing `main` branch unless a specific task explicitly says otherwise.

## Verification

For changes affecting the Rust pipeline or published layers, run its tests and integrity checks when available:

- `cargo test --manifest-path tools/glyph-pipeline/Cargo.toml`
- `cargo run --manifest-path tools/glyph-pipeline/Cargo.toml -- check`

For generated site changes, verify the GitHub Pages workflow as well. Distinguish what was actually tested from what still requires visual or linguistic review. Do not describe a deployment as complete before verifying its result.

A central registry may link to this project. It is not a container for Chromalect code, ontology, or gallery, and linking/enrollment is never automatic.
