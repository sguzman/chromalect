# Component color palettes

The first artifact is a **40-component, identity-first experimental palette**, without app code.

- [Visual swatch sheet](mandarin-component-identity-v0.1.svg) — a human-readable inventory.
- [Machine-readable assignments](mandarin-component-identity-v0.1.json) — stable IDs, exact hex fills, shape relations and optional mnemonic labels.
- [Color policy](../docs/component-color-policy.md) — what qualifies as a component and what never gets recolored.
- [Character specimen hypotheses](../specimens/mandarin-component-pilot-v0.1.json) — combinations and IDS topologies to validate.

The relationships in the palette are **metadata**; it is primarily a visual discrimination scheme. It intentionally breaks loose hue-family clustering when co-occurring components need more separation. No complete public writing-system mapping has been claimed.

Versioning: references must include the palette ID and version. A distinct perceptual-distance-optimized alternative or semantics-first alternative is a new *scheme*, not a silent update to these 40 values.

**Important:** a colored glyph preview needs *component geometry*; coloring a full Unicode text string character-by-character is not a valid test of component identity.

## Expanded complete catalog (v0.2)

- [Complete 513-identity swatch sheet](mandarin-component-identity-v0.2.svg)
- [513 component IDs and exact colors](mandarin-component-identity-v0.2.json)
- [514 source-standard records mapped to identities](gf0014-2009-records-v0.2.json)
- [Full catalog details, exceptions and provenance](../docs/complete-component-palette.md)

The initial 40 entries are frozen and unchanged. 30 descriptive forms are **assigned colors but have no validated drawable glyph**. Actual character-interior rendering remains future work.

## Perceptual v0.3

- [513-color v0.3 palette](mandarin-component-identity-v0.3.json)
- [v0.3 full swatch sheet](mandarin-component-identity-v0.3.svg)
- [514-record v0.3 mapping](gf0014-2009-records-v0.3.json)
- [Quantitative comparison](perceptual-comparison-v0.3.json)
- [Methodology and limitations](../docs/perceptual-palette-v0.3.md)

v0.2 and v0.1 remain unmodified and available.

## Unfrozen color assignment v0.4

- [513-identity JSON palette](mandarin-component-identity-v0.4.json)
- [Full color swatch sheet](mandarin-component-identity-v0.4.svg)
- [514-record mapping](gf0014-2009-records-v0.4.json)
- [Before/after perceptual model measurements](perceptual-comparison-v0.4.json)
- [Methodology and limitations](../docs/perceptual-palette-v0.4.md)

All original first-40 color mappings are free to change in any new version. Previous versions remain unmodified.
