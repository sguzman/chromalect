# Chromalect: radicals, primitives, and characters

**Catalog phase:** machine-readable and human-readable reference indexes; not yet a colored-glyph renderer.

The v0.4 palette supplies **513 distinct recurring component colors**. It is **not** itself a dictionary radical list. In the 2013 standard, the first 3,500 commonly taught characters constitute tier 1; Chromalect is indexing these in 1,000-character tranches, beginning with **0001–1000**.

| Layer | What it means | How the index is represented |
| --- | --- | --- |
| Modern principal radical | GF 0011 dictionary/indexing category | 201 principal entries |
| Modern attached radical form | GF 0011 recorded variant shapes | 83 explicitly listed stand-alone entries; standard transcription also claims 99, not all independently available in this source |
| Traditional Kangxi radical | Unicode's 214 symbolic historical index categories | U+2F00..U+2FD5, matched via cautious NFKC |
| Primitive / recurring component | Exact Chromalect color identity | 513 component IDs and v0.4 colors (510 GF 0014 transcription forms + three macro recognizers) |
| Character | Standard Chinese written ideograph | First 1,000 ordered standard characters, 10 human pages of 100 |
| Component participation | A component form appears within the selected IDS analysis cut | many-to-many reverse index; **not necessarily the indexing radical** |

## Readable indexes

- [Modern principal and variant radicals](catalog/radicals-modern.md)
- [214 Kangxi radicals](catalog/radicals-kangxi.md)
- [513 component identities, colors, and reverse counts](catalog/components.md)
- [Character tranche 0001–1000](catalog/characters-0001-1000/README.md)

## JSON contracts

- [Modern radical records](data/catalog/modern-radicals-gf0011.json)
- [Kangxi 214 records](data/catalog/kangxi-radicals-214.json)
- [First 1,000 characters + participation](data/catalog/characters-0001-1000.json)
- [Component → character inverse index](data/catalog/component-to-characters-0001-1000.json)
- [Radical → character inverse index](data/catalog/radical-to-characters-0001-1000.json)
- [Source provenance and coverage](data/catalog/provenance-v1.json)

**Coverage:** 998/1000 characters identify at least one known component; 987/1000 have no unmatched component tokens. 829/1000 have a listed modern radical form in their chosen decomposition cut. All 1,000 characters have records; unresolved members are retained as explicit issues rather than invented.

**Rendering:** 0 accurate component-colored whole characters. IDS provides structural operators and candidate participants, not pixel geometry, stroke ownership, or font-compatible clipping. No fake embedded glyph artwork is presented.

[Method and exceptions](docs/catalog-methodology.md) · [Third-party attribution](THIRD_PARTY_NOTICES.md)
