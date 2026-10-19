# Experiments and revisions

This directory is the **versioned research notebook**. The unit of work is an experimentally specified visual/phonetic scheme, not a screenshot.

## Naming

- Persistent identifiers: EXP-0001, EXP-0002, etc. Never reuse an ID.
- Each experiment records its current status: proposed, in-design, ready-to-test, testing, evaluated, superseded.
- Revisions use explicit versions such as v0.1.0, v0.2.0. A changed encoding rule requires a new revision, not an undocumented mutation.
- When executable artifacts later exist, keep tagged config/scheme versions separate from app versions.
- Git commits provide historical traceability, but **a numbered experiment revision must be understandable without inspecting diffs**.

## Required fields

1. Question and why the baseline is insufficient.
2. Hypothesis and specific falsification criteria.
3. Source language/script/phonology profile.
4. Precise encoding algorithm or mapping rules.
5. Input specimens and audited linguistic data.
6. Controlled conditions and competing alternatives.
7. Measurable criteria: correctness, decoding, time, retention, confusion, subjective burden.
8. Source/rights and the rendering setup.
9. Outcomes, limitations, and next revision.

## Valid controls

Plain unannotated text; arbitrarily colored text; stable component-identity colors; semantic-family colors; literal Pinyin/IPA; pure featural phonetic glyphs; static versus animated overlay. Change one key variable at a time.

A screenshot alone never constitutes an experiment result. Generated illustrations may be archived as inspiration but must be labeled **concept art**, not accurate reference renders.

## Current experiments

- [EXP-0001 — component identity and semantic neighborhoods](EXP-0001-component-identity.md)
- [EXP-0002 — compositional phonetic glyphs](EXP-0002-featural-pronunciation.md)

No experiments have been run or evaluated as of this bootstrap.
