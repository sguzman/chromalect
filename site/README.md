# Chromalect static GitHub Pages prototype

The published directory is `site/`, deployed by `.github/workflows/pages.yml` from the existing `main` branch. It publishes **plain HTML, CSS and SVG without browser-side JavaScript**. Rust tooling builds the stroke-colored SVG gallery and enhances supported character cards during deployment. Native radio inputs, CSS `:has()`, and `details`/`summary` control the page.

**Preview structure:** overview + 10 pages of 100 Chinese characters, one-to-one with the first 1000 records in `data/catalog/characters-0001-1000.json`; colors from `palettes/mandarin-component-identity-v0.4.json`; listed Pinyin readings from the upstream Apache-2.0 level-1 standard transcription (see [source](pronunciation-citations-0001-1000.json) and `THIRD_PARTY_NOTICES.md`). The static pages reflect their generated snapshot and must be regenerated when those data files change.

**Layer modes:** OFF / DIRECT / MARKER independently per channel. Direct uses actual component-colored vector strokes where mappings exist and cell-level stripes elsewhere. Marker supplies anchored chips/symbols. Semantic unavailable (no verified sense dataset). Pinyin preview uses a **first-listed citation reading** as a display default; additional readings are visible in each inspector. `y` and `w` are orthographic spelling initials, not claimed true consonant phonemes. Colors for phonetic initials/finals and tone are intentionally separate namespaces from component colors.

## Deployment setup (one-time owner action)

1. In GitHub repository **Settings → Pages**, under **Build and deployment → Source**, choose **GitHub Actions**.
2. If GitHub prompts for workflow permissions or environment approval, use repository Actions/Environments to authorize the `github-pages` environment for deployments from `main`.
3. The workflow runs on changes to `site/**` or via **Actions → Publish Chromalect → Run workflow**. It does not create or push any branches.
4. Expected project site is `https://sguzman.github.io/chromalect/` **only after a successful GitHub Pages deployment**. Creating this workflow alone does not establish live publication.

No npm, server, web JS, special fonts, paid services, or Rust code are needed for this static-first proof of concept. If interactive filtering, precise glyph masks, and context-dependent readings become necessary, future application logic will be written in Rust. The project remains Rust-only for implementation source code.

## Development constraints

- v0.4 component identities stay immutable inside the palette version.
- Glyph geometry and semantic truth are not invented.
- Historical reading/corpus data comes with attribution; see repository third-party notices.
- The prototype does **not** include word segmentation, comprehensive verified character-internal mapping, contextual readings, hidden tracking or persistence.

## Actual component-colored Chinese strokes

The [colored glyph gallery](strokes.html) contains 12 source-aligned examples with actual vector paths for each stroke. The paths are from Hanzi Writer Data (Arphic Public License) and stroke/component correspondence from Make Me A Hanzi (LGPL-3.0-or-later). Colors use the v0.4 component identity registry. The [machine JSON](../data/catalog/colored-strokes-v0.1.json) is the portable reference.

This is not full character corpus coverage. At deployment, pinned Make Me A Hanzi dictionary and graphics sources are screened conservatively for non-nested two-component mappings, all strokes assigned, palette agreement with the first 1,000-character catalog, and valid path geometry. The pipeline generates 436 additional candidates alongside the original 12. Independent visual auditing is still required. The browser displays the resulting SVGs without JavaScript.
