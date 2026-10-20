# Chromalect static GitHub Pages prototype

The published directory is `site/`, deployed by `.github/workflows/pages.yml` from the existing `main` branch. It publishes **plain HTML, CSS and SVG with small local-only JavaScript helpers for theme selection, Mandarin catalog search, and remembering presentation-layer choices**. Rust tooling builds the stroke-colored SVG gallery and enhances supported character cards during deployment. Native radio inputs, CSS `:has()`, and `details`/`summary` control the page.

**Preview structure:** overview + 10 pages of 100 Chinese characters, one-to-one with the first 1000 records in `data/catalog/characters-0001-1000.json`; colors from `palettes/mandarin-component-identity-v0.4.json`; listed Pinyin readings from the upstream Apache-2.0 level-1 standard transcription (see [source](pronunciation-citations-0001-1000.json) and `THIRD_PARTY_NOTICES.md`). The static pages reflect their generated snapshot and must be regenerated when those data files change.

**Layer modes:** OFF / DIRECT / MARKER independently per channel. Enabled component, pronunciation, and tone mode selections are stored locally across the homepage and all ten atlas pages by `layers.js` when browser storage is available; the controls still work without storage. Direct uses actual component-colored vector strokes where mappings exist and cell-level stripes elsewhere. Marker supplies anchored chips/symbols. Semantic unavailable (no verified sense dataset). Pinyin preview uses a **first-listed citation reading** as a display default; additional readings are visible in each inspector. `y` and `w` are orthographic spelling initials, not claimed true consonant phonemes. Colors for phonetic initials/finals and tone are intentionally separate namespaces from component colors.

## First-1,000 Mandarin exploration

The [character search](search.html) searches the complete first-1,000 catalog across written characters, Pinyin citations, component identities, and SVG ownership status. It reads a **generated, versioned, Mandarin-only ontology profile** at [`profiles/mandarin-1000-v1.json`](profiles/mandarin-1000-v1.json). The Rust pipeline constructs the profile from committed catalog, pronunciation, palette, ontology, and source-geometry records; no linguistic facts are inferred by browser JavaScript. Unmapped characters are present, with their glyph geometry explicitly marked unresolved. No other language profile is introduced here.

## Website appearance

The website has three appearance settings: **System (default)**, **Light**, and **Dark**. The appearance control is available on all authored pages and Rust-generated galleries. System follows the browser's `prefers-color-scheme` media query and responds when that preference changes, without refreshing. Explicit Light/Dark overrides are saved only in this site's browser `localStorage`, so navigation keeps the chosen theme; choosing System removes the stored override. No appearance settings are sent to an external service.

On Linux, a theme scheduler such as darkman can drive System mode **if the browser exposes the scheduler's light/dark preference**. The website reads the browser's preference, not darkman's internal state or files.

Only website interface tokens are theme-dependent; **v0.4 component identity colors, Pinyin and tone color assignments, source SVG fills, and original text never change**. The existing Off / Direct / Marker language layers are independent of the appearance setting.

## Human and machine color reference

- [Website color registry](colors.html): visible tables and swatches for Pinyin initial, final, and tone colors, plus links to all component swatches.
- [Canonical presentation-layer JSON](layers-v0.1.json): the 24 initial, 33 final, and five tone assignments.
- [Source component palette](../palettes/mandarin-component-identity-v0.4.json): all 513 graphic component identity colors, copied into `site/palettes/` at deployment for public machine access.
- [Repository Markdown color registry](../docs/color-registry.md): human-readable token/color mappings with scope and versioning.

The Rust pipeline validates that human-facing reference tables match their canonical JSON. Stroke path order is used only as a source-data index for component ownership, never as an educational goal.

## Deployment setup (one-time owner action)

1. In GitHub repository **Settings → Pages**, under **Build and deployment → Source**, choose **GitHub Actions**.
2. If GitHub prompts for workflow permissions or environment approval, use repository Actions/Environments to authorize the `github-pages` environment for deployments from `main`.
3. The workflow runs on changes to `site/**` or via **Actions → Publish Chromalect → Run workflow**. It does not create or push any branches.
4. Expected project site is `https://sguzman.github.io/chromalect/` **only after a successful GitHub Pages deployment**. Creating this workflow alone does not establish live publication.

No npm, external server, JavaScript framework, special fonts, or paid services are needed for the published static interface. If interactive filtering, precise glyph masks, and context-dependent readings become necessary, future application logic will be written in Rust. The project remains Rust-only for implementation source code.

## Development constraints

- v0.4 component identities stay immutable inside the palette version.
- Glyph geometry and semantic truth are not invented.
- Historical reading/corpus data comes with attribution; see repository third-party notices.
- The prototype does **not** include word segmentation, comprehensive verified character-internal mapping, contextual readings, hidden tracking or persistence.

## Actual component-colored Chinese strokes

The [colored glyph gallery](strokes.html) contains 12 source-aligned examples with actual vector paths for each stroke. The paths are from Hanzi Writer Data (Arphic Public License) and stroke/component correspondence from Make Me A Hanzi (LGPL-3.0-or-later). Colors use the v0.4 component identity registry. The [machine JSON](../data/catalog/colored-strokes-v0.1.json) is the portable reference.

This is not full character corpus coverage. At deployment, pinned Make Me A Hanzi dictionary and graphics sources are screened for complete terminal stroke ownership in ordinary, nested, and enclosing IDS layouts, alongside whole-glyph coloring for explicitly cataloged atomic components. Unresolvable, overlapping, or partial mappings are rejected. The current pipeline generates 792 source-derived candidates and 12 curated specimens; 797 of these 804 glyphs belong to the first 1,000-character catalog. A [coverage summary](glyphs/coverage.json), [unmapped-character page](glyphs/unmapped.html), [diagnostic breakdown](glyphs/diagnostics.html), and [side-by-side geometry review sheets](glyphs/review/index.html), including a [flagged-character shortlist](glyphs/review/flagged.html), are generated during deployment. Independent visual auditing is still required. The browser displays the resulting SVGs without JavaScript. The [source-path mapping manifest](glyphs/mappings.json) is available for other programs. [Documented alternative decompositions](glyphs/alternatives/index.html) and [neutral previews for partially owned source glyphs](glyphs/unknown-components/index.html) are separate, non-active research resources. Neither is silently substituted into the active Direct or Marker layer.
