# Research roadmap

This is a sequence of **evidence gates**, not a promise to build a large application.

## Phase 0 — research foundation [documentation started]

- [x] Establish independent repository scope and first Mandarin language profile.
- [x] Define independent semantics, identity, historical-phonetic-role, actual-sound, tone, and animation channels.
- [x] Record test specimens, research questions, experiment versioning, licensing policy.
- [ ] Verify each proposed character decomposition with reputable evidence.
- [ ] Locate the authoritative component-standard text and verify coverage.
- [ ] Select an experimental normalization policy and small component inventory.

## Phase 1 — palette experiment [proposed]

- [ ] Pick a bounded set of frequent components (small enough to audit manually).
- [ ] Assign every normalized component a stable, unique color within a semantic-family neighborhood.
- [ ] Produce precise, non-generative specimens of the same text under plain, identity, and semantic modes.
- [ ] Test whether users can reliably distinguish the selected identities and remember them.
- [ ] Version the palette and record failures and revisions.

**Gate:** repeatable, internally consistent component rendering. Do not expand to thousands of components before this.

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

Only after an experiment needs reproducible generation should we choose an implementation. **Any implementation source will be Rust.** Prefer an isolated, testable renderer and data model; choose UI/WebAssembly/native details by proven requirements rather than preference.

## Future language profiles [not committed]

Spanish and other Latin-script languages, Arabic, Korean, and other Chinese varieties can reveal what is genuinely universal and what is script- or language-specific. Do not broaden the initial program before the first Mandarin experiment is measurable.
