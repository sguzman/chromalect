# Catalog method and unresolved boundaries

## Goal

Make a reproducible, stable taxonomy for v0.4's components, standard modern radicals, traditional Kangxi radicals, and common simplified Chinese characters in chronological **2013-standard numbered order**, 1,000 characters per tranche. Disentangle **classifying a character by one dictionary radical** from **the many structural components within its glyph**.

## Separation of axes

1. **Modern GF 0011-2009:** 201 principal radicals plus attached forms. The consulted transcription contains **83 explicit attached-form rows**, and **69 explanatory cross-reference rows** (these are *not* 69 additional characters). Its introductory comments claim 99 attached forms including special stroke forms; the unlisted forms are not invented. Main/variant relationships are tentative links based on described cross-references.
2. **Traditional Kangxi:** 214 Unicode radical *symbols*, not automatically simplified Chinese components. Normalization may map a symbol to an ideograph, but does not validate a modern radical classification.
3. **GF 0014 / Chromalect:** 513 stable v0.4 graphical component identities, not 513 dictionary radicals. A colored component can exist with no ordinary Unicode glyph, and vice versa.
4. **2013 ordered character list:** 8,105 total: tier 1 (3,500), tier 2 (3,000), tier 3 (1,605). The first 1,000 are recorded without treating list position as empirical corpus frequency.
5. **IDS relationships:** primary `yi-bai/ids` lv1 expression is parsed into candidate structural components. No official indexing radical chosen from IDS alone. Character components matched to the 513 palette are given stable IDs/colors.

## Parser and analysis discipline

- Every of the 1,000 characters receives one row, whether analysis succeeds or not.
- For characters *themselves* recognized as one v0.4 component, stop at the atomic unit: prevents nested coloring and preserves macro-recognizers such as 青.
- Otherwise select the first primary IDS alternative, strip simple trailing variant-region annotations, and parse two-/three-way IDC operators (⿰, ⿱, ⿲, ⿳, ⿴… ⿽).
- Expand an unrecognized intermediate ideograph only if its own **first primary** IDS is syntactically parseable; cap expansion depth and reject cycles.
- Keep explicit `missing_components` for undecodable shapes. Custom notations `#(...)`, brace forms, or bracket directives cannot silently be converted into ordinary strokes.
- `⿻`, `⿼` and `⿽` may describe **overlap** or interleaved strokes: the membership list can be useful, but no assumption of disjoint editable polygons is made.
- All participation is **evidence derived from a particular source and choice of decomposition cut**, never proof of historical semantic or phonetic roles.
- Modern radical participation is exact visual *form* intersection between GF 0011 listed forms and the chosen resolved component cut, **not the authoritative single indexing radical**.
- Membership is deduplicated at the index level, while separate identical instances remain counted and path-tagged for character renderers.
- No emoji, stroke-by-stroke invented coloring, or changing v0.4 HEX values.

## Confidence / validation needed

This catalog does not prove its third-party transcriptions match every original standard. Yi Bai's MIT IDS can have multiple alternatives and regional forms; the first alternative is a **selection policy**, not canonical scholarly truth. Some simple characters are atomic; others may have source expressions that are not renderer-safe.

Reliable final character rendering requires a separate **glyph geometry/stroke ownership** layer, fonts licensed for use and consistent with the chosen geographic glyph profile. Recording an IDS string is not enough to physically color the exact radical strokes within a complete character.

## Sources and licensing

See [THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md). Sources are version-labeled and original v0.4 color mapping is unchanged. Future changes to how components are normalized or decompositions are chosen must create a catalog schema/data version; historical palettes remain intact.

## Tranche policy

Human display: 10 pages × 100 characters = 1,000 characters. Machine files: one 1,000-record JSON and exact inverse mappings. Future tranches: 1001–2000, 2001–3000, etc., ending at 8001–8105 as permitted by source and project scope. Do not represent later tranches as completed.
