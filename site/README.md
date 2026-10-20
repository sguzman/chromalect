# Chromalect static GitHub Pages prototype

The published directory is `site/`, deployed by `.github/workflows/pages.yml` from the existing `main` branch. It contains **plain HTML and CSS, without JavaScript**. This is intentional: the first UX experiment only requires native radio inputs, CSS `:has()`, and `details`/ `summary` to open a character inspector.

**Preview structure:** overview + 10 pages of 100 Chinese characters, one-to-one with the first 1000 records in `data/catalog/characters-0001-1000.json`; colors from `palettes/mandarin-component-identity-v0.4.json`; listed Pinyin readings from the upstream Apache-2.0 level-1 standard transcription (see [source](pronunciation-citations-0001-1000.json) and `THIRD_PARTY_NOTICES.md`). The static pages reflect their generated snapshot and must be regenerated when those data files change.

**Layer modes:** OFF / DIRECT / MARKER independently per channel. Direct currently styles glyph **cells**, not verified internal strokes. Marker supplies anchored chips/symbols. Semantic unavailable (no verified sense dataset). Pinyin preview uses a **first-listed citation reading** as a display default; additional readings are visible in each inspector. `y` and `w` are orthographic spelling initials, not claimed true consonant phonemes. Colors for phonetic initials/finals and tone are intentionally separate namespaces from component colors.

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
- The prototype does **not** include word segmentation, accurate character-internal multicolor glyphs, contextual readings, hidden tracking or persistence.
