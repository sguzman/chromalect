# Component color palettes

The first artifact is a **40-component, identity-first experimental palette**, without app code.

- [Visual swatch sheet](mandarin-component-identity-v0.1.svg) — a human-readable inventory.
- [Machine-readable assignments](mandarin-component-identity-v0.1.json) — stable IDs, exact hex fills, shape relations and optional mnemonic labels.
- [Color policy](../docs/component-color-policy.md) — what qualifies as a component and what never gets recolored.
- [Character specimen hypotheses](../specimens/mandarin-component-pilot-v0.1.json) — combinations and IDS topologies to validate.

The relationships in the palette are **metadata**; it is primarily a visual discrimination scheme. It intentionally breaks loose hue-family clustering when co-occurring components need more separation. No complete public writing-system mapping has been claimed.

Versioning: references must include the palette ID and version. A distinct perceptual-distance-optimized alternative or semantics-first alternative is a new *scheme*, not a silent update to these 40 values.

**Important:** a colored glyph preview needs *component geometry*; coloring a full Unicode text string character-by-character is not a valid test of component identity.
