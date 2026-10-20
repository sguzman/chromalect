# Chromalect color registry

**Presentation schema:** `chromalect.presentation-layers.v0` · **Version:** `0.1.0`

This is the human-readable color key for the presentation prototype. The authoritative machine-readable token assignments are in [`site/layers-v0.1.json`](../site/layers-v0.1.json). Color domains are independent: an initial, final, tone, and component may have the same hex value without representing the same information.

## Component identities

There are **513 stable component identities in palette v0.4**, each with its own color. Unlike pronunciation or tone, the color is keyed to a reusable graphical component (e.g. 女), not the whole Unicode character. Each component keeps its assigned color within a palette version.

- [Component gallery with every visible swatch](../site/components.html)
- [Component color registry JSON (v0.4)](../palettes/mandarin-component-identity-v0.4.json)
- [v0.4 SVG swatch sheet](../palettes/mandarin-component-identity-v0.4.svg)

## Pronunciation and tone: scope

**These are experimental colors assigned to Pinyin spelling tokens; they do not assert acoustic similarity or linguistic universality.** For the direct glyph-cell presentation, initial colors go on the **left edge**, final colors on the **right edge**, and tone colors on the **top edge**. In marker mode the same assignments appear as colored Pinyin text and tone symbols. The underlying Unicode Chinese character does not change.

The displayed reading is the **first listed citation reading**, not a contextual or necessarily predominant pronunciation. Orthographic `y` and `w` are spelling initials, not necessarily consonants. `∅` denotes no written Pinyin initial. The `final` field is the written remainder after initial extraction, not a standardized phonetic rime. Tone `0` means neutral tone. More than one reading may exist for one character.

## Pinyin initials (24)

Hanyu Pinyin initial spelling token (not necessarily a consonant or a phoneme).

| Token | Color | Notation |
| :--- | :--- | :--- |
| `∅` | `#8781CC` | No written initial |
| `b` | `#9F4E64` | Pinyin initial |
| `c` | `#649D5D` | Pinyin initial |
| `ch` | `#5F64AA` | Pinyin initial |
| `d` | `#BE7A45` | Pinyin initial |
| `f` | `#007F7E` | Pinyin initial |
| `g` | `#B372AA` | Pinyin initial |
| `h` | `#71700F` | Pinyin initial |
| `j` | `#4F92CB` | Pinyin initial |
| `k` | `#A24F4C` | Pinyin initial |
| `l` | `#43A177` | Pinyin initial |
| `m` | `#755CA2` | Pinyin initial |
| `n` | `#B28235` | Pinyin initial |
| `p` | `#007B92` | Pinyin initial |
| `q` | `#BF6F94` | Pinyin initial |
| `r` | `#57782C` | Pinyin initial |
| `s` | `#6D8ACF` | Pinyin initial |
| `sh` | `#9F5432` | Pinyin initial |
| `t` | `#1AA291` | Pinyin initial |
| `w` | `#875594` | Pinyin initial |
| `x` | `#9F8C33` | Pinyin initial |
| `y` | `#0475A1` | Pinyin initial |
| `z` | `#C56E7B` | Pinyin initial |
| `zh` | `#367D47` | Pinyin initial |

## Pinyin finals (33)

Remaining written Pinyin syllable segment (not a canonical IPA rime).

| Token | Color | Notation |
| :--- | :--- | :--- |
| `a` | `#6D7215` | Pinyin final |
| `ai` | `#5690CC` | Pinyin final |
| `an` | `#A25047` | Pinyin final |
| `ang` | `#3BA17C` | Pinyin final |
| `ao` | `#795BA0` | Pinyin final |
| `e` | `#AF8433` | Pinyin final |
| `ei` | `#007A96` | Pinyin final |
| `en` | `#C06F8F` | Pinyin final |
| `eng` | `#527932` | Pinyin final |
| `er` | `#7388CF` | Pinyin final |
| `i` | `#9E562D` | Pinyin final |
| `ia` | `#11A196` | Pinyin final |
| `ian` | `#8A5490` | Pinyin final |
| `iang` | `#9B8E34` | Pinyin final |
| `iao` | `#1774A4` | Pinyin final |
| `ie` | `#C66F76` | Pinyin final |
| `in` | `#2E7E4C` | Pinyin final |
| `ing` | `#8C80CA` | Pinyin final |
| `iong` | `#955E11` | Pinyin final |
| `iu` | `#009FAC` | Pinyin final |
| `o` | `#97507C` | Pinyin final |
| `ong` | `#839644` | Pinyin final |
| `ou` | `#426CAB` | Pinyin final |
| `u` | `#C5725D` | Pinyin final |
| `ü` | `#007F7D` | Pinyin final |
| `ua` | `#008066` | Pinyin final |
| `uai` | `#A178BE` | Pinyin final |
| `uan` | `#866700` | Pinyin final |
| `uang` | `#2A99BF` | Pinyin final |
| `ue` | `#9F4E65` | Pinyin final |
| `ui` | `#669D5C` | Pinyin final |
| `un` | `#5E64AA` | Pinyin final |
| `uo` | `#BF7946` | Pinyin final |

## Citation tones (5)

Tone from the first listed citation pronunciation; no sandhi/contextual inference.

| Token | Color | Symbol |
| :--- | :--- | :--- |
| `0` | `#8794A7` | · · Neutral tone |
| `1` | `#1587BA` | — · First tone |
| `2` | `#21966F` | ↗ · Second tone |
| `3` | `#9B65D7` | ⌄ · Third tone |
| `4` | `#D57E38` | ↘ · Fourth tone |

## Example: 好, hǎo

The experimental channel assignments for the first listed reading are **h** (`#71700F`), **ao** (`#795BA0`), and **tone 3** (`#9B65D7`, ⌄). The components of 好 are **女** and **子**; their color assignments come from the separate v0.4 component palette.

## Versioning and validation

- Pronunciation/tonal colors belong to presentation version `0.1.0` and have independent color namespaces.
- Component colors belong to `mandarin-component-identity@0.4.0`; changing any assignment requires a new palette revision.
- Machine data is canonical. This Markdown page and the [website color key](../site/colors.html) must agree with `site/layers-v0.1.json` exactly; the Rust integrity test checks every defined token/color pair.
- The color encoding is experimental and has not been validated in a human learning study.
- Stroke order is not an educational channel of Chromalect. The outline arrays retain indices to match source stroke paths with their component owners, not to teach handwriting sequence.
