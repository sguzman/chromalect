# Research roadmap

This is a sequence of **evidence gates**, not a promise to build a large application.

## Phase 0 — research foundation [documentation and pilot design underway]

- [x] Establish independent repository scope and first Mandarin language profile.
- [x] Publish a language-independent typed ontology, JSON Schemas, source-grounded instance graph, and public ontology gallery in this repository.
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
- [x] Expand source-aligned coloring to nested/enclosing structures and single-component atomic glyphs (all 1,000 active first-tranche mappings; independent visual inspection remains pending).
- [x] Produce machine-readable source rejection diagnostics and side-by-side SVG/native-font review sheets, with non-certifying checks for component placement and perceptually close co-occurring colors.
- [x] Recover 73 additional mappings through source-owned subglyph decompositions, exact catalog identity and vector-geometry checks; retain source provenance and pending-review status.
- [x] Publish portable per-glyph source ownership records and isolated review images for 8 documented alternate decompositions and 27 partial unknown-source cases. Keep incomplete cases out of the active renderer.
- [x] Define a preregistration-ready three-arm component-color retention protocol with untested outcomes and explicit independent visual, accessibility, and ethical prerequisites.
- [ ] Independently visually audit all 1,000 active stroke ownership mappings and adjudicate retained alternate/partial mapping research cases separately.
- [ ] Compare plain, identity-only, and independently specified semantic-family variants.
- [ ] Test legibility, distinctions at real glyph sizes, recall, and transfer.
- [ ] Document failure cases and iterate with **new palette versions**.

**Gate:** repeatable, linguistically accurate component rendering and defensible experimental comparisons. Do not mistake complete catalog assignment for complete glyph-level rendering or learning evidence.

## Phase 2 — phonetic notation experiment [proposed]

- [x] Establish a reversible, source-pinned orthographic Pinyin citation baseline for all 1,171 first-tranche readings, without declaring phonemic or contextual verification.
- [x] Decode 1,392/1,393 pinned CC-CEDICT numbered Pinyin labels into the same orthographic tokens, preserving the exceptional r5 record and source capitalization.
- [x] Publish source-aligned citation-tone contour controls with five pinned example readings, leaving context-dependent neutral tone and all learning outcomes unresolved.
- [ ] Freeze the Mandarin phonological contrast inventory and a phonetic reference notation.
- [ ] Compare Pinyin/IPA labels, initial-final symbols, and constructed featural glyphs.
- [ ] Specify a decoding grammar and round-trip tests.
- [ ] Test tone contours independently from segmental notation.
- [ ] Try one integrated character-cell layout without changing the original strokes.

**Gate:** reliable decoding, not simply an attractive-looking sound diagram.

## Active Mandarin semantic verification [research infrastructure; approval pending]

- [x] Screen 1,000 characters, recording provisional emoji and explicit deferrals.
- [x] Cross-reference 1,000 CC-CEDICT headwords and triage 897 expression hypotheses (248 whole-term mismatches).
- [x] Build source-first lexical and blind emoji-comprehension worksheets with local-only exports.
- [x] Add reading-specific provisional selections, unresolved statuses, and high-attention polysemy cohorts without promotion.
- [x] Extend source-first review to all 1,393 pinned reading records, including deferred pictograms, with local-only observations and validation.
- [x] Collect independent dictionary source locations and provisional contrasts for five first-priority characters (11 reading entries).
- [x] Compare five high-attention dictionary-gloss discrepancies against a third-source character dictionary, retaining an unresolved surname-tone conflict.
- [x] Build a 319-entry context-evidence acquisition queue with distinct source access, attribution, word-boundary, reading, and adjudication gates; no synthetic attestations.
- [x] Normalize the 319 high-attention source reading entries into 241 phonetic search groups without merging distinct lexical source records.
- [x] Acquire, version, and cross-check two independently selected Tatoeba sentence-ID candidate cohorts: 1,087 deduplicated character/sentence associations, 1,015 distinct source IDs, across 141/142 characters.
- [x] Record four additional dictionary research pages for the corpus-unmatched 刨 and preserve separate Mainland/Taiwan source qualifications.
- [x] Scan eight publisher-documented multi-character word leads against the pinned Tatoeba snapshot, retain 27 source-only candidate associations for six leads, and record 24 new distinct IDs (1,039 across all three source cohorts).
- [x] Publish searchable research-only character and word-candidate browser pages, while blocking unadjudicated pronunciations and senses from approval.
- [x] Preserve the 27 selected corpus word-source IDs with 20 public contributor usernames and pinned sentence-text fingerprints, without reproducing source sentences.
- [x] Check 27 of 27 selected Tatoeba word-sentence records against the live API: owner, content hash, written form and observed CC BY 2.0 FR license; preserve a dated audit without republishing sentence text.
- [x] Build a local-only, source-pinned sentence-context review intake and validator for the 27 selected word matches, with explicit nonapproval export rules.
- [x] Acquire and preserve dated ICU v78.3 tokenization triage for the 27 source-integrity-matching word examples (17 single-token, 4 multi-token, 6 crossing token boundaries), without calling tool output verified word segmentation.
- [x] Acquire a hashed official 125,310-entry CC-CEDICT snapshot and reconcile five exact word headwords against separately published Wiktionary Pinyin, leaving three unresolved and every sentence-reading approval at zero.
- [ ] Independently check sentence-level reuse permissions, and record URLs before any corpus quotation or lexical promotion.
- [ ] Independently adjudicate attested readings and usage-specific lexical senses, including higher-attention cases.
- [ ] Conduct independently controlled blind emoji comprehension and accessibility evaluations.
- [ ] Promote only after separately demonstrated lexical and pictogram acceptance. Currently approved: 0.

## Phase 3 — fusion and contextual experiments [proposed]

- [ ] Put all channels into a dense but toggleable rendering.
- [ ] Introduce segmented words, polyphones, sandhi, and contextual glosses.
- [ ] Compare assisted learning, retention, and transfer to plain text.
- [ ] Add reduced-motion semantic/articulatory animation trials.

**Gate:** measured gain over simpler visual aids.

## Phase 4 — software decision [deferred]

Choose an implementation only when an experiment requires reproducible generation. **Implementation source must be Rust.** Prefer an isolated, testable renderer and data model; choose UI/WebAssembly/native details by proven requirements rather than preference.

## Future language profiles [ontology-ready; implementation pending]

Spanish and other Latin-script languages, Arabic, Hebrew, Korean, and other Chinese varieties can reveal what is universal and what is script- or language-specific. The ontology already supports these categories, while a full implemented dataset for each requires separate evidence and validation. The Mandarin prototype remains the initial implementation priority.
