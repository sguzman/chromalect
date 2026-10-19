# EXP-0001: stable component identity colors

**Status:** computational comparison complete; not human-tested  
**Current specification:** v0.5.0 (unfrozen 513-color identity reassignment, 2026-10-19)  
**Language:** Mainland Standard Mandarin, simplified Chinese  
**Implementation:** no code or renderer

## Question

Do *unique, stable* colors for recurring components improve Chinese character recognition compared with monochrome text, random stroke coloring, or arbitrary character coloring? Are loose semantic neighborhoods a useful additional memory cue?

## Primary design decision

**Component identity comes first.** The color is keyed to an individual normalized visual component, not to a dictionary index, lexical meaning, or historical semantic role.

- [Complete policy](../docs/component-color-policy.md)
- [40-component palette v0.1.0](../palettes/mandarin-component-identity-v0.1.json)
- [Exact-color swatch sheet](../palettes/mandarin-component-identity-v0.1.svg)
- [Candidate compound specimens](../specimens/mandarin-component-pilot-v0.1.json)

Colors are **unique across the current 40 IDs** and immutable within that version. Recurring components always repeat exactly the same hex value. Related *visible variants* have distinct but linked IDs (e.g. 水 and 氵). Their exact colors are independent of the separate phonetic and tone schemes.

## Hypotheses

H1: Stable component-identity colors improve re-identification and delayed recognition versus plain or per-stroke-randomized text.

H2: Exact component consistency improves transfer to unfamiliar characters composed of previously learned parts.

H3: Identity-first palettes optimized for simultaneous visual discrimination can outperform palettes constrained by semantic grouping; a meaningful-family scheme might instead improve recall. Competing claims require competing experimental arms.

## Proposed comparisons

- A: monochrome Chinese text.
- B: random colors on each appearance or stroke (deliberate negative control).
- C: stable, individually distinct component colors from this identity-first pilot.
- D: stable component colors with a stricter semantic-neighborhood constraint (separate *future* palette, not yet built).

Keep text, decomposition, glyph geometry, reading time, font and presentation environment fixed. Alternate scheme assignment across readers to avoid color-memory order effects.

## Pilot stimuli

The candidate IDS topology files contain examples such as 清, 情, 请, 晴, 妈, 好, 林, 河, 男, 孩, and other recurring units. These decompositions are **illustrative and require independent verification** before experimental use.

Within one palette version, a character such as 清 must display 氵 with its exact color and 青 with its exact color; both retain those colors in other characters. The shape rendering itself is **not complete**.

## Measurement plan

- Test whether an inspector can reconstruct component IDs/color assignments without collisions.
- Compute pairwise differences in a perceptual color space, giving extra scrutiny to components that **co-occur in the same glyph**.
- Record identification errors, recognition time, delayed recall, new-character transfer, small-scale legibility and color-vision/accessibility failures.
- Reject or revise assignments that repeatedly cause confusions; changing a color creates a new palette revision.

## v0.4 correction: none of the prototype colors are sacred

[Version v0.4](../palettes/mandarin-component-identity-v0.4.json) unlocks all 513 component IDs for recoloring, fixing the unjustified freeze of the first 40 from v0.3. The palette intentionally retains the same full set of color values as v0.3 because an attempted new 513-color set worsened global minimum separation; all values are reassigned where useful. See [computational metrics](../palettes/perceptual-comparison-v0.4.json) and [methodology](../docs/perceptual-palette-v0.4.md).

## Perceptual color experiment

The new [v0.3 palette](../palettes/mandarin-component-identity-v0.3.json) and [model comparison report](../palettes/perceptual-comparison-v0.3.json) use both OKLab and CIEDE2000, prioritizing co-occurring components and likely visual confusions. [Read methodology](../docs/perceptual-palette-v0.3.md). Every v0.1 color stays exact; v0.2 remains a separate immutable comparison.

There is still no human reading or learning evaluation.

## Catalog extension

The [GF 0014 full reference mapping](../palettes/gf0014-2009-records-v0.2.json) and [v0.2 complete color registry](../palettes/mandarin-component-identity-v0.2.json) are documented in [the expansion report](../docs/complete-component-palette.md). Assignment coverage is now complete **for that reference list**, not for all possible historical Chinese characters.

## What has and has not happened

**Completed:** 40 frozen pilot IDs and colors; 513 distinct colored component identities (510 GF transcription shapes plus 3 pilot-only macro units); a complete mapping of all 514 source records to those identities; 30 explicitly flagged non-renderable descriptions; SVG swatch inventories; and 31 candidate decomposition specimens.

**Not completed:** independent authority-level verification of each transcribed inventory item; verified decomposition/stroke geometry; compound-glyph color renderer; end-user study; measured performance, semantic-family control, or published learning result.

The outcome remains unknown. A pretty set of swatches is not an experiment result.
