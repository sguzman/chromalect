# Presentation architecture: independent information channels

## Principle

**Each information layer has two independently selectable expressions**: `direct` (visual treatment on the character or cell) and `marker` (an attached miniature glyph, symbol, diagram, or chip). `off` is always available. Neither expression is obligatory or automatically applicable to every layer: unsupported combinations must be clearly disabled.

Every layer's colors are **scoped to that information channel**. A green component identity and a green tone or consonant need not encode the same thing; their location, shape, and legend identify the channel. Future users may combine modes arbitrarily.

The [machine-readable contract](../site/layers-v0.1.json) is the reference. The [static Pages prototype](../site/index.html) demonstrates the design without JavaScript.

| Channel | Direct expression now | Floating marker now | Evidence |
| --- | --- | --- | --- |
| Component identity | Segmented multicolor underline on glyph cell (not individual strokes) | Small color dots above glyph | v0.4 palette + IDS candidate members |
| Pronunciation | Separate onset/orthographic-final colors on opposite glyph cell edges | Segmented Pinyin under glyph | First listed citation reading, no context |
| Tone | Colored top edge on glyph cell | Miniature color + tone contour shape | Tone in first listed Pinyin |
| Semantics | **Unavailable** | **Unavailable** | No verified character/word sense inventory yet |

The direct treatment should eventually become an actual glyph-level change **only where geometry and decoding are trustworthy**. A proposed IPA character-stroke redesign failed its earlier feasibility test; we do not smuggle it in. For featural phonetics, markers may be the *primary* representation rather than a fallback.

### Independent palettes

- `component_id` → exact fixed v0.4 hex colors (513 entries), reused consistently within its version.
- `initial` and `final` → separate experimental Pinyin **orthography token** colors in `site/layers-v0.1.json`. These are not confirmed phoneme-feature colors.
- `tone` → separate 5-way palette (four tones + neutral) with a textual contour as a redundant non-color cue.
- `semantics` → no palette yet. Sense identity needs source-backed data and word context.

### Reading caveats

The 2013 standard's entry order is not a real-world word-frequency list. Many characters are polyphonic; the prototype shows the *first listed* reading but exposes all listed variants. Tone sandhi, lexical readings, syllable boundaries in phrases, pinyin changes under context, and dialect preferences are **not inferred** from the isolated list. A future input text viewer must obtain contextual analysis from verified language resources before encoding speech data as authoritative.

### Layout geometry and accessibility

Markers use reserved anchor zones: component dots above, Pinyin below, tone top-right. Direct expressions target color-striped bottom, two colored side edges, and colored top edge. This avoids four overlapping color fills on the glyph. Character interior remains native monochrome. All modes have text, shape or visible IDs; do not rely entirely on colors or on color-vision simulations.

- CSS-only controls reset when navigating to another static page; no saved preferences.
- Browser native `details` inspectors expose component IDs, alternative readings and analysis uncertainty.
- No glyph geometry, fake colored strokes, SVG masks or animation is claimed.
- For 1,000 characters the presentation is chunked into **ten pages of 100**, distinct from the JSON's 1,000-entry tranche. Data and presentation chunking can evolve separately.

### Future Rust implementation

Once advanced capabilities are needed (search/filter, persistent layer controls, per-stroke masks, contextual phonetic parsing, semantic overlays), choose Rust-based build tooling and/or Rust/WASM. Avoid growing a JavaScript-only web application from this proof of concept.

### Publishing and limits

The [Pages workflow](../.github/workflows/pages.yml) uploads `site/` directly on main. Owner must select **Settings → Pages → GitHub Actions** once. The workflow's presence is not proof a site is live.

Source attribution, unverified glyph data and dataset copyrights remain governed by [THIRD_PARTY_NOTICES](../THIRD_PARTY_NOTICES.md).
