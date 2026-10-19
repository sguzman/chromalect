# EXP-0001: stable component identity colors

**Status:** proposed  
**Current specification:** v0.1.0 (draft, 2026-10-19)  
**Language:** Mainland Standard Mandarin, simplified Chinese  
**Implementation:** none

## Question

Do *unique, stable* colors for reusable components, organized into semantic-family neighborhoods, improve the ability to distinguish and remember Chinese characters?

## Hypothesis

Stable component-identity colors will outperform random per-character or per-stroke coloration on recognition and delayed identification. Semantic neighborhoods may add a second, learnable grouping signal.

## Invariant

A normalized component ID is assigned **one exact color** in the current palette. The same ID preserves that color across all character appearances. A component can have different character-specific roles, but that does not recolor it. If several distinguishable components occur inside one character, each may have its own stable color.

The project must explicitly decide whether variant forms such as 水/氵 share a normalized ID or use linked but distinct IDs. **Unresolved**, not silently equated.

## Experimental arms

- A: ordinary monochrome rendering.
- B: arbitrary random per-stroke colors (negative control for misleading visuals).
- C: stable unique component colors with no semantic clustering.
- D: stable unique colors arranged in semantically motivated neighborhoods.

Control the source characters, font, size, presentation duration, and training schedule.

## Starter specimens

清 / 情 / 请 / 晴 for a repeated 青 component, plus 妈, 孩 and independently attested examples of recurring component shapes. Verify exact decomposition before making stroke-level graphics.

## Metrics

Component re-identification, character discrimination, retention after delay, accuracy for unfamiliar compounds, time-to-recognition, confusion matrix among similar hues, self-reported readability.

## Open design questions

- Choice of decomposition granularity, canonicalization policy, source dataset.
- Color-space and exact color-distance constraints by display mode.
- Whether hue regions accurately describe semantic *origin*, modern gloss, or a manually chosen mnemonic.
- How unique colors scale and which non-color cues are needed.

## Output expectations

A palette manifest with all IDs/HEX assignments, component and character tests with independently checked geometry, a representative specimen, and recorded comparisons. None exist yet.
