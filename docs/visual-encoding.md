# Visual encoding research

## Non-negotiable identity rule

**One normalized component identity -> one stable color per palette version.** A glyph can have multiple colors only because it contains multiple independently identified components. **The strokes of one component cannot be randomly recolored.**

Even when all layers are on, colors remain semantically organized but individually discriminative. No "one family = one flat color" collapse.

## Distinct channels

| Information | Initial candidate | Must NOT be confused with |
| --- | --- | --- |
| Component identity | Exact fill color keyed by canonical component ID | Role, character meaning |
| Semantic family | Nearby hue/lightness/chroma neighborhood | Unique identity |
| Component boundary | Precise edge or gap | Decorative stroke breaks |
| Phonetic role in a character | Local outline or subtle component frame | Actual sound |
| Actual speech sound | Separate constructed visual phonetic code | Historical phonetic clue |
| Tone | Small contour at fixed anchor | Arbitrary decoration |
| Reading and meaning | Toggleable transcription/gloss | Implied by color alone |
| Mnemonic motion | Deliberate semantic/articulatory animation | Constant ambient motion |

## What a palette must declare

- Palette identifier and version.
- Component normalization policy: which shape variants share an identity (and which do not).
- Every component ID and its exact color value, e.g. sRGB hex plus optional perceptual coordinate.
- Each component's semantic family and evidence; unknown/contested are supported values.
- Background assumptions, contrast/legibility measurements, and color-vision accessibility fallback.
- Migration/compatibility notes when any assignment changes.

**Unique** means unique assignment, not a claim that human vision can distinguish unlimited colors at any font size. Practical performance is an empirical question to measure. A user-adjustable palette is compatible with the invariant: within one active palette, a component does not arbitrarily change color.

## UI priorities

- Serious, information-forward typography, layout, and annotation.
- Character geometry remains faithful: outlines and strokes must not be reinterpreted by a generative image.
- Adjustable detail: plain / identity / semantic structure / phonetic / full fusion.
- Comparison: render identical words or sentences under versioned schemes side by side.
- Tooltip or inspector can always expose component ID, palette value, analysis provenance, actual reading, and role.
- Motion off by default in a reading view; available on deliberate activation, and respect reduced-motion preferences.

## Animation research tracks

**Semantic:** e.g. a brief flame, drip, branching motion, or wind cue tied to a known concept, not to random strokes.

**Phonetic:** show articulation, airflow, aspiration, tongue/vowel movement, or pitch contour timing using visual movement.

**Structural:** stroke order and component assembly.

All animated effects should be separable from their informational interpretation, precisely specified, and compared with a static control. Avoid treating playful effects as evidence of pedagogy.

## Known failure patterns

1. Recoloring strokes inside one radical or component.
2. Coloring unrelated components alike because the image looks balanced.
3. Outlining a phonetic component and claiming to have encoded the actual sound.
4. Treating a character's component color as the word's contextual meaning.
5. Marking the wrong lexical tone or applying an arbitrary pitch contour.
6. Making an attractive mockup with fabricated or incorrect decomposition.

Any published specimen must pass source-text, decomposition, color-consistency, and pronunciation checks before being presented as linguistically validated.
