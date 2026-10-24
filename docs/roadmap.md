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

**Original standard cross-check (partial):** Unicode IRG N2739 provides the 41-page source standard. Its table contains 514 consecutively numbered components across printed pages 7–20. [Primary-source row evidence](../data/research/gf0014-official-descriptive-row-locations-v0.1.json) identifies all 30 nonfont descriptive catalog entries and confirms their official numeric ordinal/group pairs (30/30); **descriptive graphic shape matches and geometry remain 0/30 independently approved**. A [second primary-standard name/role audit](../data/research/gf0014-descriptive-name-role-evidence-v0.1.json) now also checks the **30/30 printed source naming characters and component positions** ([method](gf0014-descriptive-original-name-role-audit.md)). Exact illustrated shape equivalence, recoverable official geometry and independent human review remain 0; no Phase 0 checkpoint is promoted on numeric/name corroboration alone.

**Published-rule spot check:** Four named first-tranche characters have selected component cuts matching the Ministry's explicit split/no-split examples: 分, 执, 东 and 串 ([source evidence](../data/research/gf0014-explicit-decomposition-examples-v0.1.json)). This corroborates **4/1,000 structural choices**, not any independent SVG stroke ownership or the other 996 analyses.

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
- [x] Define a proposed three-arm component-color retention research scaffold with untested outcomes and outstanding visual, accessibility, ethics, and preregistration requirements.
- [x] Build a reproducible first-1,000-glyph independent-review worklist from final source-backed SVG ownership, sorting 26 OKLab proximity warnings in 25 glyphs without modifying colors or claiming certification.
- [ ] Independently visually audit all 1,000 active stroke ownership mappings and adjudicate retained alternate/partial mapping research cases separately.
- [ ] Compare plain, identity-only, and independently specified semantic-family variants.
- [ ] Test legibility, distinctions at real glyph sizes, recall, and transfer.
- [ ] Document failure cases and iterate with **new palette versions**.

**Computational iteration only:** a [separately published v0.7 candidate](https://sguzman.github.io/chromalect/palettes/mandarin-component-identity-v0.7-candidate.json) uses ten source-conditioned swaps of the unchanged 520-color multiset to reduce 26 machine OKLab co-occurrence warnings to zero on the first 1,000 glyphs ([acceptance evidence](https://github.com/sguzman/chromalect/actions/runs/40117569240)). It is in-sample, with no independently certified component owner, human perceptual failure case, user discrimination result or educational assessment; the palette versioning/iteration acceptance checkpoint therefore remains unfinished.

**Held-out v0.7 method evaluation:** The [Rust five-fold source-rank experiment](../tools/glyph-pipeline/src/palette_candidate_cv.rs) trains five separate 520-color permutations on four-fifths of the original source glyphs and evaluates each on the unseen fifth ([method and scope](perceptual-palette-v0.7-fivefold-heldout.md)). This tests source co-occurrence warning transfer, not human perception, and does not promote the original full-tranche v0.7 candidate or complete the palette acceptance gate.

**Gate:** repeatable, linguistically accurate component rendering and defensible experimental comparisons. Do not mistake complete catalog assignment for complete glyph-level rendering or learning evidence.

## Phase 2 — phonetic notation experiment [proposed]

- [x] Establish a reversible, source-pinned orthographic Pinyin citation baseline for all 1,171 first-tranche readings, without declaring phonemic or contextual verification.
- [x] Decode 1,392/1,393 pinned CC-CEDICT numbered Pinyin labels into the same orthographic tokens, preserving the exceptional r5 record and source capitalization.
- [x] Publish source-aligned citation-tone contour controls with five pinned example readings, leaving context-dependent neutral tone and all learning outcomes unresolved.
- [x] Source-link a working 21-consonant Pinyin initial-feature codebook and publish a Pinyin / provisional IPA / featural-shape comparison with 3 nonconsonantal spelling conventions kept separate.
- [x] Demonstrate an initial-only strict source-token feature codec over all 1,171 cited readings (997 consonantal, 174 orthographic onset conventions), without claiming full phonological or visual-symbol decoding.
- [x] Round-trip all 1,171 pinned written initial/final/tone combinations through a source-attested orthographic grammar and publish 710 noncertifying written contrast candidates.
- [x] Flag 213 source citation readings in nine context-dependent final-spelling categories, preserving original spellings and pending IPA adjudication.
- [x] Publish a 33-final reversible nine-primitive written-letter geometric control and integrate provisional initial shapes, with independent channel toggles and source-linked caution labels; human decoding remains untested.
- [x] Source-link six provisional simple-final height/backness/rounding controls (432 citation readings, 112 context cautions) and test an independently switchable integrated-cell view without IPA approval.
- [x] Publish a three-way, source-gated comparison of 1,171 plain Pinyin, arbitrary geometric written-letter codes and unapproved feature candidates (320 provisionally displayable, 112 withheld, 739 without a final-feature proposal).
- [x] Publish an evidence-ranked research workqueue for 27 unadjudicated written-final categories (739 source readings; 101 explicit spelling cautions), without assigning IPA, phonemes or lexical context.
- [x] Verify five isolated source citation-tone labels (1,171 readings) and four unique idealized non-neutral contours in JavaScript and Rust; neutral pitch, contextual realization and human perception remain unapproved.
- [ ] Freeze the Mandarin phonological contrast inventory and a phonetic reference notation.

**Independent research-model source (partial):** Zhao–Li's peer-reviewed [34-unit CVVVCT research phonology](../data/phonetics/zhao-li-2009-34-unit-reference-model-v0.1.json) has 12 modeled vowel units, 22 consonants and two nonstandard apical vowel symbols ([source and qualifications](zhao-li-34-unit-research-model.md)). Its Pinyin / IPA labels are independent of the Cai choral-diction convention and disagree with three literal working initial candidates. The external model is preserved but **not adopted as a frozen phonemic inventory**; this checkpoint is pending.
- [ ] Compare Pinyin/IPA labels, initial-final symbols, and constructed featural glyphs.

**Four-lane source-controlled comparison:** The [first-tranche citation comparison](../site/mandarin-encoding-comparison.html) now displays plain original Pinyin, original geometric initial/final letter codes, eligible provisional featural glyphs, and separately attributed Cai/Lin/Mei/Zhao–Li IPA initial and final-heading alternatives for **1,171/1,171** original source readings. Source-final IPA headings are **not** concatenated into a fabricated full-syllable transcription, and the 112 warned and 739 unsupported feature candidates remain withheld. This completes the *software presentation* comparison but does not establish a verified speech contrast, human legibility, feature transfer or experiment result.

**Published IPA-source comparison (partial):** [Source-qualified Lin/Mei/Cai notation data](../data/phonetics/mandarin-pinyin-ipa-source-disagreement-v0.1.json) compare **21/21 conventional initials** and **6 simple written finals**, while a [33-final conditional source-table crosswalk](../data/phonetics/mandarin-written-final-ipa-source-crosswalk-v0.1.json) links **33/33 written finals** and their geometric written-letter symbols to editorial IPA alternatives, without certifying sound-level mappings with existing provisional initial/vowel-feature encoders ([research interpretation](mandarin-ipa-convention-comparison.md)). Sixteen initial rows differ between the three reported traditions. This is a single dissertation's IPA convention comparison, **not** a certified phonemic inventory, full final mapping, contextual realization or human decoding result; the Phase 2 comparison checkpoint remains unfinished. A second, [independent peer-reviewed Zhao–Li IPA table](../data/phonetics/zhao-li-2009-independent-pinyin-ipa-control-v0.1.json) records 21 initial and six vowel references, including unresolved `r` fricative/approximant and retroflex transcription differences. No model is declared an accepted phonemic inventory.
- [ ] Specify a decoding grammar and round-trip tests.

**External sound-model feature grammar (partial):** The separately published [Zhao–Li CVVVCT grammar audit](../data/phonetics/zhao-li-visual-feature-grammar-audit-v0.1.json) validates **34/34 feature-coded model units** and nine demonstration sequences with zero machine collisions. A [six-slot interactive decoder](../site/mandarin-model-feature-grammar.html) and [34-unit glyph gallery](../site/mandarin-model-feature-viewer.html) expose outer place shapes, manner/aspiration, vowel height/backness/rounding and a separate tone slot. These demonstrations are **constructed external model inputs**, not independently verified speech sounds, first-tranche pronunciations or human visual decoding; the full phonemic round-trip checkpoint remains unfinished.

**Feature-level decoding (partial):** A [34-unit CVVVCT phonological feature grammar](../tools/glyph-pipeline/zhao_li_visual_feature_grammar.mjs) machine-round-trips published consonant and vowel feature units without storing Pinyin spelling ([machine audit](../data/phonetics/zhao-li-visual-feature-grammar-audit-v0.1.json), [method](zhao-li-visual-feature-grammar.md)). Real source pronunciation assignments, human decoding and measured acoustic validation remain unapproved; this scientific acceptance checkpoint therefore remains pending.
- [ ] Test tone contours independently from segmental notation.

**Source-isolated, no-feedback recognition instrument (partial):** A [16-trial blinded contour-only assessment](../site/mandarin-tone-contours.html) now balances T1–T4 four times each, hides category feedback until completion, excludes neutral tone and every segmental/lexical cue, and generates participant-optional, locally copyable nonidentifying response JSON ([protocol](mandarin-tone-blind-recognition-assessment.md)). Automated acceptance tests simulate balanced answer records and confirm no fabricated study approval. **Actual independent participants, controlled comparison, acoustically validated tones and measured learning outcomes remain zero**, so the scientific tone-testing checkpoint stays open.
- [x] Prototype one independently switchable citation-tone, initial and written-final layout around unmodified Chinese characters; human decoding validation remains pending.

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

- [x] Put all channels into a dense but toggleable rendering.
- [x] Introduce segmented words, polyphones, sandhi, and contextual glosses.
- [ ] Compare assisted learning, retention, and transfer to plain text.
- [ ] Add reduced-motion semantic/articulatory animation trials.

**Opt-in trial instrument (partial):** The existing [static/one-shot motion page](../site/mandarin-motion-pretrial.html) now offers **16 balanced paired trials** covering four source-screened semantic event cues and four provisional articulatory place labels in both static and manually played animation modes, with conceal-before-answer, deferred feedback, system reduced-motion override and local-only unverified response JSON ([trial design and limitations](mandarin-motion-recall-trial.md)). CI simulates participants only; no actual independently controlled accessibility, comprehension, recall, retention or transfer findings are claimed, so the gate remains open.

**Functional integration evidence:** The [first-tranche integrated layer viewer](../site/mandarin-fusion.html) combines independently removable source component strokes, written Pinyin initial/final, idealized citation tone and provisional semantic pictograms for 1,000 aligned characters and 1,171 citation readings. The [fusion acceptance test](../tools/glyph-pipeline/mandarin_fusion_viewer_smoke.mjs) passed in [GitHub Pages CI](https://github.com/sguzman/chromalect/actions/runs/40054863964). This is completion of the **rendering checkpoint**, not the Phase 3 learning-effect gate: contextual pronunciations, lexical-sense and glyph certifications, human comprehension, educational gain, and animation remain unapproved or unimplemented.

**Contextual display evidence:** The [word-context research viewer](../site/mandarin-word-context.html) joins eight existing publisher word leads with five paired published word-entry readings and 27 source-identity-checked Tatoeba sentence-ID occurrences. Its source-grounded presentation includes provisional word-span grouping, contrasting heading readings for four polyphonic target characters, versioned ICU boundary hints, conditional gloss/query hints, and four tightly scoped two-syllable citation-versus-sandhi examples. [Interaction tests](../tools/glyph-pipeline/mandarin_word_context_viewer_smoke.mjs) passed in [GitHub Pages CI](https://github.com/sguzman/chromalect/actions/runs/40055563551). This marks implementation of **provisional contextual presentation controls only**: there are still zero independently adjudicated sentence boundaries, pronunciations, lexical glosses, reuse rights or measured learning effects. The viewer neither republishes sentences nor labels research hypotheses as verified usage.

**Gate:** measured gain over simpler visual aids.

## Phase 4 — software decision [deferred]

Choose an implementation only when an experiment requires reproducible generation. **Implementation source must be Rust.** Prefer an isolated, testable renderer and data model; choose UI/WebAssembly/native details by proven requirements rather than preference.

## Future language profiles [ontology-ready; implementation pending]

Spanish and other Latin-script languages, Arabic, Hebrew, Korean, and other Chinese varieties can reveal what is universal and what is script- or language-specific. The ontology already supports these categories, while a full implemented dataset for each requires separate evidence and validation. The Mandarin prototype remains the initial implementation priority.
