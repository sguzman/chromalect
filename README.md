# Chromalect

**A research laboratory for visual language encoding.**

Chromalect investigates whether writing can be made easier to learn by adding reversible, digital-only visual layers: **stable colors for graphemes and reusable components, semantic families, compositional phonetic notation, tone and prosody marks, and optional mnemonic animation**.

**Status:** research prototype with the v0.4 palette (513 distinct component identities), a Rust stroke-rendering pipeline, a static GitHub Pages atlas, and 12 curated source-aligned glyphs. Pinned-source import has generated 436 additional two-component candidates, explicitly marked pending visual review. No human learning study or finalized phonetic alphabet yet.

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

The [stroke gallery](site/strokes.html) demonstrates **12 actual Chinese glyphs made of separately colored component strokes**, with machine-readable [path ownership](data/catalog/colored-strokes-v0.1.json). The v0.4 colors remain intact. The Rust [glyph pipeline](tools/glyph-pipeline/README.md) builds a separate SVG for each assigned character; its source-backed import currently finds 436 additional first-tranche candidates, subject to independent visual auditing.

## Web presentation prototype

The [static GitHub Pages prototype](site/index.html) uses independent **off/direct/marker** settings for component identity, orthographic Pinyin initial/final, and tone; semantics are unavailable until source-backed meaning data exists. Direct component mode uses source-aligned colored stroke geometry where available and a cell-level fallback elsewhere. See the [layer architecture](docs/web-layer-architecture.md), [machine-readable layer schema](site/layers-v0.1.json), and [one-time Pages setup](site/README.md). Publication requires GitHub Pages to be enabled for Actions in repository settings.

## Radical, component, and character catalogs

The [human-readable catalog](CATALOG.md) distinguishes **modern radicals (201 principal + explicitly listed variants)**, **214 traditional Kangxi radicals**, **513 component color identities**, and **characters 0001–1000** in ten 100-character pages. Their [machine-readable JSON and inverse indexes](CATALOG.md) include explicit unresolved structures; some source-aligned component-colored SVGs are implemented, with incomplete corpus coverage. Third-party data attribution is recorded in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## Documentation map

| Document | Role |
| --- | --- |
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
