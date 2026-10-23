# Source-owner region adjudication intake (v0.1)

Chromalect publishes 49 machine-selected locator regions across 48 first-tranche Chinese glyphs from the five-fold color-warning research. The [source-owner adjudication intake](../site/component-owner-adjudication.html) makes each region independently inspectable alongside the original v0.6 glyph and fold-specific candidate rendering. The locator is derived from the **current source stroke ownership mapping**, not an independently established answer key.

This intake addresses a missing observation level between the broad 1,000-glyph worklist and the machine-scored identification rehearsal: **one source-linked region at a time**, retaining distinct original and locator SHA-256 hashes, candidate component IDs, source assignment, and preliminary judgment.

An observation uses one of three non-certifying judgments: provisional source-owner support, provisional conflict, or shape/decomposition ambiguity. Unresolved entries do not produce exportable judgments. Each included judgment requires a technical rationale of at least 40 characters and one independent HTTPS evidence location without query string or fragment. Evidence references are pointers, not proof of reviewer independence or language expertise. No private source excerpts, reviewer identifiers, sentence texts, or screenshots are transmitted or included in the public fixtures.

The read-only output is local-only JSON, validated against the complete source target set and five-fold warning provenance. The [offline validator](../tools/glyph-pipeline/component_owner_adjudication_validate.mjs) rejects changed source IDs, changed SHA-256 digests, duplicate or out-of-order entries, extra personal fields, malformed evidence references, and all certification or study-approval claims. The validator prints only how many provisional records are structurally sound.

These notes cannot establish a certified ground truth: independent specialist recruitment, protocol preregistration, blinded reconciliation of competing source interpretations, reviewer independence verification, dispute resolution, and visual acceptance criteria remain outside the instrument. For any future accepted source mapping, separately version the decision and audit the 1,000-glyph mapping. **No automatic promotion into Direct/Marker modes, no palette change, and no learning-study eligibility result.**

After regenerating the complete source-derived source targets in the existing Pages pipeline:

    node tools/glyph-pipeline/component_owner_adjudication_validate_smoke.mjs

To validate a locally copied provisional record:

    node tools/glyph-pipeline/component_owner_adjudication_validate.mjs --validate /path/to/local-notes.json

The generated locator set, production v0.6 identity colors, source SVG geometry, existing phonetics and provisional semantic candidates remain unchanged.