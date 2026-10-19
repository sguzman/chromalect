# EXP-0001: stable component identity colors

**Status:** in design, untested  
**Current specification:** v0.2.0 (pilot assignments added 2026-10-19)  
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

## What has and has not happened

**Completed:** frozen pilot component IDs, 40 distinct colors, optional mnemonic family tags, explicit variant relations, standalone SVG swatch inventory, and 31 candidate decomposition specimens.

**Not completed:** authority-backed exhaustive component inventory; verified decomposition/stroke geometry; compound-glyph color renderer; end-user study; measured performance, semantic-family control, or published learning result.

The outcome remains unknown. A pretty set of swatches is not an experiment result.
