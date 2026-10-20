# Research roadmap

This is a sequence of **evidence gates**, not a promise to build a large application.

## Phase 0 — research foundation [documentation and pilot design underway]

- [x] Establish independent repository scope and first Mandarin language profile.
- [x] Define independent semantics, identity, historical-phonetic-role, actual-sound, tone, and animation channels.
- [x] Record test specimens, research questions, experiment versioning, licensing policy.
- [x] Locate an authoritative public description of GF 0014-2009 and its limited 3,500-character scope.
- [x] Define an **experimental** shape-variant policy and a bounded 40-component pilot inventory.
- [x] Assign unique colors to **all 514 transcribed GF 0014 records** through a 510-key identity registry; preserve 3 extra pilot macros for 513 total colored identities.
- [ ] Verify the transcription and the 30 descriptive forms against the official standard and obtain glyph geometry.
- [ ] Verify each selected component and compound decomposition with an authoritative source and geometry.

## Phase 1 — palette experiment [v0.4 all-identities reassigned; human testing pending]

- [x] Assign 40 unique exact colors to stable component IDs; preserve them in a 513-identity expanded catalog.
- [x] Produce machine-readable v0.1, v0.2, and v0.3 color catalogs, corresponding reference indices and swatch sheets.
- [x] Compute and document v0.3 with historic protected-40 constraint.
- [x] Correct that constraint: v0.4 freely reassigns all 513 identities without sacrificing global color separation.
- [x] Produce a Rust-based source-aligned component-colored compound SVG renderer; validate against pinned stroke-outline records.
- [ ] Independently visually audit stroke ownership and expand beyond the currently source-aligned two-component subset.
- [ ] Compare plain, identity-only, and independently specified semantic-family variants.
- [ ] Test legibility, distinctions at real glyph sizes, recall, and transfer.
- [ ] Document failure cases and iterate with **new palette versions**.

**Gate:** repeatable, linguistically accurate component rendering and defensible experimental comparisons. Do not mistake complete catalog assignment for complete glyph-level rendering or learning evidence.

## Phase 2 — phonetic notation experiment [proposed]

- [ ] Freeze the Mandarin phonological contrast inventory and a phonetic reference notation.
- [ ] Compare Pinyin/IPA labels, initial-final symbols, and constructed featural glyphs.
- [ ] Specify a decoding grammar and round-trip tests.
- [ ] Test tone contours independently from segmental notation.
- [ ] Try one integrated character-cell layout without changing the original strokes.

**Gate:** reliable decoding, not simply an attractive-looking sound diagram.

## Phase 3 — fusion and contextual experiments [proposed]

- [ ] Put all channels into a dense but toggleable rendering.
- [ ] Introduce segmented words, polyphones, sandhi, and contextual glosses.
- [ ] Compare assisted learning, retention, and transfer to plain text.
- [ ] Add reduced-motion semantic/articulatory animation trials.

**Gate:** measured gain over simpler visual aids.

## Phase 4 — software decision [deferred]

Choose an implementation only when an experiment requires reproducible generation. **Implementation source must be Rust.** Prefer an isolated, testable renderer and data model; choose UI/WebAssembly/native details by proven requirements rather than preference.

## Future language profiles [not committed]

Spanish and other Latin-script languages, Arabic, Korean, and other Chinese varieties can reveal what is genuinely universal and what is script- or language-specific. Do not broaden the initial program before the first Mandarin experiment is measurable.
