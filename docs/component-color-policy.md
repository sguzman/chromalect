# What Chromalect colors: identity-first pilot

**Status:** provisional design, 2026-10-19. See [the exact 40-color registry](../palettes/mandarin-component-identity-v0.1.json) and its [swatch sheet](../palettes/mandarin-component-identity-v0.1.svg).

## Color the reusable component, not the dictionary's indexing category

The primary target is the **visible recurring piece** of Chinese writing: 氵 in 清 and 河; 青 in 清, 情, 请, 晴; 女 in 好 and 妈; 木 in 林 and 休. A dictionary radical is sometimes one of those pieces, but indexing radicals are not an exhaustive visual vocabulary.

**Do not give every stroke a fresh color.** Individual strokes are lower-level motor/graphic units, useful for separate stroke-study modes. For recognition, coloring every stroke independently would dissolve recurring meaningful shapes. If a stroke form is deliberately made an atomic component in a later scheme, it can receive a stable identity just like any other unit.

The 2009 Chinese component standard GF 0014-2009 reports **514 identified components in 3,500 modern common characters, organized into 441 groups**. These are not 514 universal, indivisible atoms and we are not claiming this pilot is an authoritative subset of its inventory. Reference: [PRC Ministry of Education announcement](https://www.moe.gov.cn/jyb_xwfb/gzdt_gzdt/moe_1485/tnull_45766.html).

## Frozen decisions for *this experimental palette*

1. **Exactly one hex color per component ID per palette version.** Never reassign it by character, position, semantic interpretation, or phonetic function.
2. **Visible shape variants are separate IDs** in this pilot even if historically or semantically linked: 水/氵, 火/灬, 人/亻, 心/忄, 手/扌, 言/讠, 金/钅. Their relationships are explicit metadata. Whether a future palette merges certain variants is a *different experiment*.
3. **One active nonoverlapping decomposition cut.** A nested piece (for example 青) can be treated as one recognizable unit inside 清. The same 青 must have the same color in every supported context at that decomposition level. A deeper dissection mode must explicitly change its active cut instead of overlaying two competing color assignments on the same stroke.
4. **Meaning is secondary.** `mnemonic_group_hint` suggests an association, not a normative ontology. Some deliberately contrasting components use distant hues despite belonging to related mnemonic groups.
5. **Actual hue only carries identity**, not phonetic role, sound, lexical meaning, tone, position, or stroke-order. The future phonetic and tone systems must not silently recolor identity fills.
6. **Missing components stay neutral**, with inspection support for "unknown"; they do not inherit a misleading color from a guessed radical.
7. **A repeated component is repeated identically.** 林 = 木 + 木, 炎 = 火 + 火, 森 = 木 + 木 + 木. Every occurrence retains the same identity color.
8. **The original Unicode text never changes.** Removing overlays reconstructs the ordinary text. Do not generate replacement Unicode characters to encode color.

## Why these 40?

They cover common visual forms, explicitly linked variant shapes, semantically recognizable pieces and a few frequent phonetic series (青, 可, 亥). This is a *small, auditable pilot*, not an exhaustive frequency ranking, official educational list, or verified set of graphical leaf atoms.

This palette deliberately balances familiar mnemonic hues (water broadly blue, fire broadly orange, wood green) against **high contrast within a single compound** (especially 青 versus the other components in 清/情/请/晴). A color family is a helpful suggestion; a component collision in a common character is a concrete problem.

The **swatch SVG** shows exact per-component fills. It deliberately does *not* pretend to cut up actual Chinese glyph outlines. The separate [specimen hypotheses](../specimens/mandarin-component-pilot-v0.1.json) describe character topology; accurate clipping/colorized compound rendering still needs verified geometry and font handling.

## What needs verification

- Independently source the component analysis for each pilot character.
- Decide whether GF 0014-2009, another decomposition tree, or a manually audited hybrid will anchor the shape registry.
- Add valid geometry or per-stroke ownership data if a renderer is built; Unicode IDS strings **do not provide rendering coordinates**. [Unicode's explanation](https://www.unicode.org/L2/L2012/12081-ids.html) explicitly describes IDS as an abstract description rather than a composed character.
- Measure distinction at actual small glyph sizes under light/dark themes, multiple font weights, color-vision deficiencies and reduced color discrimination.
- Run stable-colors versus arbitrary-colors versus monochrome controls before claiming a pedagogical benefit.

## Extension policy

Expand the palette by creating new stable IDs and exact colors, recording any relationship to existing IDs. Do not recycle old IDs or hex mappings within v0.1.x. A redesign that changes current assignments becomes a new **versioned palette**, and earlier specimens must retain a reference to the old version.
