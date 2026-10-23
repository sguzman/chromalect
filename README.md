# Chromalect

**A research laboratory for visual language encoding.**

Chromalect investigates whether writing can be made easier to learn by adding reversible, digital-only visual layers: **stable colors for graphemes and reusable components, semantic families, compositional phonetic notation, tone and prosody marks, and optional mnemonic animation**.

**Status:** the first Mainland Standard Mandarin simplified-Chinese tranche is **source-aligned across all 1,000/1,000 characters** (724 multicomponent, 276 atomic), with **zero unmapped** in the verified October 21, 2026 GitHub Pages build. The independent Rust pipeline renders the original Chinese Make Me a Hanzi outlines, assigns paths to documented component identities, and publishes reproducible per-glyph source evidence and diagnostics. The active **additive v0.6 component palette has 520 identities**; all 518 v0.5 identities and the immutable 513 v0.4 identities retain their original forms and colors. Full CI passes 48 Rust tests and an all-1,000-card catalog/Marker/Direct color audit. The [live coverage JSON](https://sguzman.github.io/chromalect/glyphs/coverage.json) and [evidence report](docs/mandarin-coverage-evidence.md) document the verified coverage. **Automated geometry correspondence remains pending independent visual/linguistic review.** This is not a completed human learning study or a finalized phonetic alphabet.

## Ontology and independent project structure

Chromalect contains its own [constitution](CONSTITUTION.md), [agent guidance](AGENTS.md), and versioned [formal multilingual ontology](ONTOLOGY.md). The ontology publishes **37 entity types**, **39 typed relations**, [JSON Schema definitions](ontology/vocabulary.schema.json), and a [source-grounded Mandarin instance graph](ontology/specimens-v1.json). The [public ontology gallery](site/ontology.html) exposes these distinctions independently of the Mandarin color prototype.

Ontological types support writing systems, alphabets, graphemes, phonemes, words, morphology, lexical meaning, prosody, and the relationship between evidence and reversible visual encodings. Types do not imply that corresponding corpora or learning experiments are already complete. The independent repo hosts the ontology and presentation; an external registry may link here but is not a prerequisite.

See the [published research roadmap checkpoint dashboard](https://sguzman.github.io/chromalect/roadmap-status.html) for source-derived phase percentages and outstanding work. These count documentary checkboxes, not scientific acceptance or overall product completion.

## Starting point

The first research profile is **Mainland Standard Mandarin (Putonghua), modern simplified Chinese, and Hanyu Pinyin**. This scope is deliberately narrow enough to test while the underlying concepts can later be evaluated on Latin alphabets, Arabic, Hangul, other Chinese language varieties, and additional writing systems.

### The core experiment

Compare a plain rendering with alternate overlays of the *same underlying text*:

1. **Identity:** every normalized reusable component gets a stable, uniquely assigned color.
2. **Semantics:** semantic families may optionally influence hue neighborhoods; **distinct identity and recognition take precedence**.
3. **Structure:** decomposition reveals component boundaries and positions.
4. **Historical sound clues:** identify which component plays a phonetic role *in this character*, if any.
5. **Actual pronunciation:** a separately designed compositional visual phonetic code, ideally inside the glyph cell, plus a clear fallback to verified phonetic transcription.
6. **Prosody:** conventional tone marks/contours, with contextual pronunciation kept distinct from citation readings.
7. **Motion:** optional, meaningful animations that aid learning, never mandatory or permanently moving.
8. **Plain mode:** turn all layers off and recover the original text.

**Hard rule:** a component never changes its assigned identity color simply because it appears in a different character. The same shape cannot be recolored stroke by stroke for decorative effect.

## What this repository is

A repository for hypotheses, competing visual encodings, reproducible component data, validated rendering tools, and controlled experiments.

It is **not** a branch of another knowledge base or a general language-learning platform. The SVG pipeline is written in Rust and GitHub Pages hosts the static browser prototype. More extensive software architecture remains undecided.

## Real colored character strokes

The [stroke gallery](site/strokes.html) demonstrates **12 actual Chinese glyphs made of separately colored component strokes**, with machine-readable [path ownership](data/catalog/colored-strokes-v0.1.json). The v0.4 colors remain intact. The Rust [glyph pipeline](tools/glyph-pipeline/README.md) builds a separate SVG for each assigned character; its source-backed importer handles exact leaf ownership for nested and enclosing component structures and whole-component atomic glyphs. The generated [coverage report](https://sguzman.github.io/chromalect/glyphs/coverage.json) distinguishes mapped and unmapped characters. [Source diagnostics](https://sguzman.github.io/chromalect/glyphs/diagnostics.html) document the source audit and remaining review qualifications, while [geometry contact sheets](https://sguzman.github.io/chromalect/glyphs/review/) show native-font glyphs alongside source SVGs for visual review. The [portable mapping manifest](https://sguzman.github.io/chromalect/glyphs/mappings.json) publishes component IDs, palette values, and source-path ownership for all currently rendered glyphs. Separate [alternate-decomposition comparisons](https://sguzman.github.io/chromalect/glyphs/alternatives/) (8 cases) and [partial source-ownership previews](https://sguzman.github.io/chromalect/glyphs/unknown-components/) (27 cases, with unresolved paths in neutral gray) support further analysis. Neither research queue is included in Direct mode, Marker mode, or the active coverage figure. The [hierarchical derivation manifest](https://sguzman.github.io/chromalect/glyphs/hierarchical-derivations.json) identifies 73 additional source-derived component assignments admitted through subglyph decomposition, stroke-index agreement, and normalized path-geometry checks. These are research candidates, not independently certified mappings. A separate, pinned [secondary evidence manifest](https://sguzman.github.io/chromalect/glyphs/hanzivg-transfers.json) documents HanziVG Chinese groups and independently aligned AnimCJK simplified-Chinese stroke-count decompositions, including 15 matched donor subglyph refinements. The existing Chinese Make Me a Hanzi outlines remain the rendered geometry; source artwork is not silently substituted. See [third-party notices](THIRD_PARTY_NOTICES.md). None of these checks constitutes independent visual certification.

## Public color references

- [Human-readable color registry](site/colors.html): component identities, 24 written Pinyin initials, 33 Pinyin finals, and all five citation-tone assignments.
- [Human-readable repository tables](docs/color-registry.md): the same token-to-color values with channel scope and examples.
- [Machine-readable pronunciation/tone palette](site/layers-v0.1.json): authoritative JSON for initial, final, and tone channels.
- [Active machine-readable component palette v0.6](palettes/mandarin-component-identity-v0.6.json): all 520 additive component identities, preserving earlier assignments exactly.
- [Historical immutable v0.4 palette](palettes/mandarin-component-identity-v0.4.json) and [v0.5 extension](palettes/mandarin-component-identity-v0.5.json): retained as versioned research records.

The displayed sound colors encode **Pinyin spelling** for the selected citation reading, not a complete phonetic analysis. The left, right, and top glyph-cell edges encode initial, final, and tone separately.

**Stroke order is not a learning objective.** Stroke paths are indexed solely to associate source outlines with component ownership; the visual system does not teach handwriting sequence.

## Shared character presentation

The Mandarin atlas, homepage examples, [search](site/search.html), [semantic coverage viewer](site/semantic-coverage.html), and [semantic grammar lab](site/semantic-lab.html) use the **same visual character presentation channels**: component identity, Pinyin initial/final, and citation tone. Each starts in **Direct** unless the visitor has saved another mode; the controls switch independently among Off, Direct, and Marker and persist across these surfaces. Direct component mode uses source-aligned colored glyph SVGs wherever available (otherwise a component stripe), while direct Pinyin and tone appear as independently colored edges. The semantic research viewer retains its separate provisional-emoji toggle; no production semantic default or word-sense presentation is implied.

## Mandarin first-tranche browsing

The [first-1,000 Mandarin search interface](site/search.html) uses a [generated ontology-backed Mandarin data profile](site/profiles/mandarin-1000-v1.json) to browse every cataloged character by orthography, source-backed Pinyin, component shapes/IDs, and source SVG coverage. A missing SVG is recorded as unresolved, not invented. This profile binds the existing data to the shared ontology; no other language implementation is introduced.

## Web presentation prototype

The [static GitHub Pages prototype](site/index.html) uses independent **off/direct/marker** settings for component identity, orthographic Pinyin initial/final, and tone; semantics are unavailable until source-backed meaning data exists. Direct component mode uses source-aligned colored stroke geometry where available and a cell-level fallback elsewhere. See the [layer architecture](docs/web-layer-architecture.md), [machine-readable layer schema](site/layers-v0.1.json), and [one-time Pages setup](site/README.md). Publication requires GitHub Pages to be enabled for Actions in repository settings.

## Experimental Mandarin phonetic controls

Chromalect has a reversible **source-orthographic**, not phonemically approved, first-tranche grammar: all **1,171** pinned citation readings round-trip across **673** distinct written initial/final/tone triples. The [citation-grammar browser](site/mandarin-syllable-grammar.html) shows the original spelling with separately qualified channels, and the [written-contrast controls](site/mandarin-contrast-controls.html) contain **710** source-label candidate comparisons, not validated spoken minimal pairs.

Experimental symbol references are intentionally separate: the [21-initial feature prototypes](site/mandarin-initial-features.html) are provisional consonantal categories, the [33 written-final geometric controls](site/mandarin-final-symbols.html) encode **letters, not phones**, and the [six-simple-final feature hypotheses](site/mandarin-simple-final-features.html) cover **432** source-reading occurrences, including **112** contextual spelling cautions. The [tone-contour reference](site/mandarin-tone-contours.html) shows idealized citation targets with context-dependent neutral tone. The [integrated citation cell](site/mandarin-citation-cell.html) independently toggles these research displays around an **unchanged native Chinese character**.

The broader [final-spelling exception ledger](docs/mandarin-final-spelling-context-gates.md) flags **213** source-reading occurrences across nine context categories; absence of a flag is not phonological approval. A Rust audit independently cross-checks these records and the written-final alphabet against the original source. **Zero source sentences, phonemic interpretations, human symbol-decoding results, or learning-effectiveness results are silently approved.** All future full-final IPA and contextual assignments require independent evidence.

The [nine-family spelling-caution browser](site/mandarin-spelling-cautions.html) now separates seven university-linked **written spelling rules** (134 source uses) from two explicitly unapproved **phonetic research leads** (79 source uses). Both reference types remain independent of accepted IPA analyses. A [local-only citation-specific review intake](site/mandarin-phonetic-review.html) can draft research notes for the 213 flagged source occurrences and export them for a strict [source-pinned validator](docs/mandarin-phonetic-caution-review-intake.md); passing that validator never promotes a phonetic claim. The [speech source registry](site/mandarin-speech-sources.html) documents four external Mandarin corpus leads with dataset-specific license, privacy and acquisition constraints. No audio has been acquired or matched to these citation readings.

## Mandarin semantic research

The first 1,000 Mandarin characters have provisional source-backed meaning records. Initial screening yielded **881 characters with candidate pictograms** and **119 explicit deferrals**, for **897 experimental meaning expressions**. These figures describe research proposals, not validated Mandarin senses or independently tested pictograms.

The [semantic browser](site/semantic-coverage.html) shows candidate mappings, source coverage, lexical complexity, and research-priority filters. The [source-aligned color × semantic comparison](site/visual-semantic-comparison.html) holds glyph geometry constant across three presentation modes: neutral source strokes, v0.6 identity-colored strokes, and the same identity colors plus a provisional pictogram. It exposes exact component swatches, machine-flagged close-color pairs, grayscale and white/black surface controls, and a reversible event-operator label. None of these certify a semantic-family palette or learning outcomes. The separate [all-520-component reference contrast audit](site/color-reference-audit.html) measures the original palette against solid white and black, without reassigning colors or declaring visual accessibility. An [eight-hint mnemonic-group color pilot](site/mnemonic-color-pilot.html) measures the original 40 historically grouped component colors, keeping 480 ungrouped and all 520 assignments unchanged. Its within-group and between-group OKLab averages are close, so the source hints are not presented as visually differentiated or linguistically verified semantic families. An [isolated historical-hint hue counterfactual](site/mnemonic-group-counterfactual.html) compares the original 40 swatches with separately derived grouping colors. The [source-aligned hypothetical glyph viewer](site/hint-hue-glyph-comparison.html) contrasts the unchanged production SVGs with generated research-only SVGs for the 542 affected first-tranche characters, with optional identical provisional semantic cues in both conditions. The [source-matched within-glyph proximity audit](site/glyphs/research/hint-counterfactual-v0.1/pair-risk-v0.1.json) finds 26 original versus 76 hypothetical pairs below ΔOK 0.07 (70 newly introduced, 20 resolved, six retained), spanning 66 glyphs with new machine review warnings; this is a numerical risk comparison, not a human readability judgment. The [second source-cooccurrence-optimized experimental palette](site/mnemonic-group-optimized.html) reduces the full-sample count to six, but the [five-fold held-out character evaluation](site/semantic-group-hue-heldout.html) finds **26 original, 76 first grouping and 28 fold-trained optimized** below-threshold pair observations. This cautions against treating the six-warning in-sample result as generalization or promoting unverified group hues. The [fold-specific visual warning queue](site/heldout-color-warning-review.html) presents the 23 newly close pairs, 21 resolved pairs and five retained pairs in source-identical Chinese SVGs using only each fold’s 800-character-trained candidate colors. It is a machine-prioritized, independently unreviewed visual audit aid. The gallery permits side-by-side source-identical comparisons at 16–160 CSS px, including 16, 24 and 32 px, without claiming those sizes have passed human legibility testing. No source geometry, main palette, ungrouped component assignment or independently approved sense is changed. The [lexical review worksheet](site/lexical-review.html), [dictionary reading inventory](site/reading-inventory.html), and [blind emoji-comprehension worksheet](site/emoji-comprehension.html) keep their observations local and separate from production mappings.

The [technical semantic research index](docs/mandarin-semantic-research-index.md) contains the detailed hypotheses, visibility and reading audits, source intake, reproducible evidence, review protocols, and outstanding verification gates. No proposed sense has independent lexical approval or independently established pictogram-comprehension approval.

## Contextual Mandarin evidence acquisition

The source-evidence [research queue](docs/mandarin-contextual-reading-evidence-queue.md) contains **319 high-attention pinned reading entries**, grouped into **241 case-normalized pronunciation search targets** without merging lexical senses. The [offline Tatoeba candidate extractor](docs/mandarin-tatoeba-offline-candidate-intake.md) can identify bounded, contributor-attributed Chinese sentence IDs from licensed snapshots. No corpus sentence is accepted as a reading or sense without contextual review. The [semantic browser](site/semantic-coverage.html) reports acquisition separately from lexical and pictogram approval.

The [word-context browser](site/word-context-candidates.html) displays eight dictionary source-word leads and their 27 unapproved corpus candidate IDs. The [context evidence browser](site/context-evidence.html) compares the original 423 surface-only candidate associations with 701 hash-sampled associations (1,087 unique character/sentence associations combined), without copying sentence text or approving meanings.

## Radical, component, and character catalogs

The [human-readable catalog](CATALOG.md) distinguishes **modern radicals (201 principal + explicitly listed variants)**, **214 traditional Kangxi radicals**, **513 original v0.4 component color identities** (extended additively to **520** in v0.6), and **characters 0001–1000** in ten 100-character pages. Their [machine-readable JSON and inverse indexes](CATALOG.md) preserve the original analyses; a generated, source-aligned catalog now has complete first-tranche SVG coverage. Third-party data attribution is recorded in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## Documentation map

| Document | Role |
| --- | --- |
| [Formal ontology](ONTOLOGY.md) | Typed multilingual classes, relations, evidence and encoding semantics |
| [Ontology instance graph](ontology/specimens-v1.json) | Source-grounded typed example and provenance |
| [Vision](docs/vision.md) | Motivation, scope, constraints |
| [Terminology](docs/terminology.md) | Precise linguistic and design terms |
| [Architecture](docs/architecture.md) | Conceptual information model; no code |
| [Color and rendering](docs/visual-encoding.md) | Identity invariants and independent channels |
| **[Component color policy](docs/component-color-policy.md)** | What gets colored, variants, nesting, and invariants |
| **[Palette v0.1 preview](palettes/mandarin-component-identity-v0.1.svg)** | Exact colors for 40 Mandarin components |
| [Palette registry](palettes/mandarin-component-identity-v0.1.json) | Machine-readable versioned color IDs and groups |
| [Pilot compound specimens](specimens/mandarin-component-pilot-v0.1.json) | Testable structural decomposition candidates |
| [Phonetic notation](docs/phonetic-notation.md) | Sound-glyph research and falsifiable constraints |
| [Mandarin baseline](docs/mandarin-baseline.md) | First language and orthographic targets |
| [Reference corpus](docs/specimens.md) | Controlled test cases; avoid misleading samples |
| [Data and licensing](docs/data-sources.md) | Potential sources and their license risks |
| [Experiment protocol](experiments/README.md) | Versioning, reproducibility, comparison rules |
| [Experiment 0001](experiments/EXP-0001-component-identity.md) | Stable per-component colors |
| [Experiment 0002](experiments/EXP-0002-featural-pronunciation.md) | Constructed visual sound notation |
| [Decisions](decisions/README.md) | Accepted, tentative, and rejected choices |
| [Roadmap](docs/roadmap.md) | Research-first development sequence |
| [Contributing](CONTRIBUTING.md) | Proposal and documentation discipline |

## Unfrozen component palette (v0.4)

![513 component colors with unrestricted identity assignments](palettes/mandarin-component-identity-v0.4.svg)

**[v0.4 methodology and results](docs/perceptual-palette-v0.4.md)** · [v0.4 registry](palettes/mandarin-component-identity-v0.4.json) · [comparison](palettes/perceptual-comparison-v0.4.json) · [v0.3](palettes/mandarin-component-identity-v0.3.json) · [v0.2](palettes/mandarin-component-identity-v0.2.json) · [v0.1](palettes/mandarin-component-identity-v0.1.json).

The original 40 are **not frozen** in v0.4. Their assigned colors can change between versions. A component's color remains constant *within an active version*. The standard contains duplicate shapes and 30 descriptive placeholders. This is an exhaustive **assignment for the transcribed reference inventory**, not a finished within-glyph renderer or a complete list of every possible Chinese character component. The [policy](docs/component-color-policy.md) explains the distinction.

## Why version experiments?

A beautiful rendering can be linguistically wrong. A pretty encoding can fail to be reversible. An attractive color palette can make characters less legible. Each scheme must therefore be explicit, testable, and reproducible; designs are not silently overwritten with unrelated rules.

## Current principles

- Preserve the source Unicode text independently of every visual overlay.
- Document assumptions and provenance; never treat an image mockup as validated linguistic analysis.
- Separate **component identity**, **component role**, **meaning**, **pronunciation**, and **display style**.
- A character may have multiple readings; context can change pronunciations and meanings.
- Use exact, uniform per-component fills before trying embellishments.
- Do not import third-party linguistic corpora or font outlines without reviewing their licenses.
- Visual density is adjustable by the learner; full information is a valid study mode.
- Accessibility means every encoded dimension can be inspected without reliance on color alone.

## License

The repository has the existing [MIT license](LICENSE). Third-party data and fonts may have different terms; the repository license does not supersede those terms.
