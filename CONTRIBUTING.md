# Contributing to Chromalect

The project is presently a **documented design laboratory**. Research and corrections are welcome; there is no implementation milestone that requires code.

## Proposed change workflow

1. Describe the problem, concrete example, hypothesis, and expected learning advantage.
2. Record the relevant linguistic sources, licensing constraints, and assumptions.
3. Create or revise a numbered experiment under [experiments](experiments/README.md), or write a decision record under [decisions](decisions/README.md).
4. Preserve baseline examples and describe how success/failure would be determined.
5. Do not rewrite a previous measured result as though it never happened. Add a new revision and a comparison.

## Minimal Git safeguards

- Inspect the repository and target branch before writing. Never assume a branch name.
- Keep unrelated branches/files intact; do not force-push or rewrite history.
- No surprise application scaffolding. Rust only when implementation is explicitly warranted.
- Prefer coherent, reviewable commits. A pull request is not mandatory for a local research branch.
- Do not put secrets, private conversations, proprietary data, commercial typefaces, or unlicensed corpora into this public repository.

## Research quality

Separate **attested linguistic facts** from **proposed visual mappings** and **observed outcomes**. Record the reading and meaning of a character *in context*; avoid assigning universal semantic/phonetic roles when a component changes function between characters.

For visuals, record exact color values, normalized component IDs, palette version, target text, font/rendering assumptions, and which layers are visible.

For phonetics, give the input pronunciation notation and show whether the graphical code decodes back to exactly the same pronunciation. A shape that only tells the reader "there is a phonetic component" does not encode sound.

## Future development policy

If implementation becomes necessary, prefer Rust for parsing, data modeling, experiments, and rendering. Pick any UI, WASM, graphics, or packaging framework **only after a focused experiment motivates that choice**. Until then, documentation and specimens are the primary deliverables.
