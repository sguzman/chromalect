# Local blind-color presentation rehearsal (not a participant study)

Chromalect's first-1,000-character Mandarin experiment produces 48 source-aligned flagged glyphs containing 49 within-glyph component-color warning observations. Those 49 observations comprise **23 introduced**, **21 resolved**, and **five retained** original-versus-fivefold experimental warning pairs.

The [local-only comparison rehearsal](../site/heldout-blind-color-rehearsal.html) exercises the technical presentation mechanics without turning the existing unreviewed source mappings into study stimuli eligible for recruitment. **No real-world trial, expert visual certification, component-identification result, color-vision test, learning study, semantic verification or ethics approval has been completed.** The active 520-color palette remains `mandarin-component-identity@0.6.0`.

## Instrument boundary and provenance

The [source validator and trial planner](../site/heldout-blind-color-core.js) require the build-generated [48-glyph held-out review manifest](../site/glyphs/research/heldout-warning-v0.1/index-v0.1.json), complete fivefold held-out color assignments and the unchanged 520-component palette. The source checks retain all original component IDs, owner forms, source hex colors, fold-specific candidate hex codes, source glyph SVG paths and SHA-256 identifiers, and numerical warning classifications.

Only one immutable source SVG geometry can be shown per observation, in two versions: the original v0.6 component colors and the variant trained on **800 other glyphs**, excluding that observation's character from its training co-occurrence graph. Source geometry and component ownership are not changed by the rehearsal. The browser never inserts a semantic pictogram or phonetic cue.

The instrument deliberately exposes **49 source-owned pair observations**, not 49 independently different glyph images. One character occurs in two pair observations, and neither an automatic warning nor a repeat is an independent visual assessment.

## Presentation controls

The [browser instrument](../site/heldout-blind-color-rehearsal.js) creates a 32-bit random seed using the browser's random source and runs a deterministic seed-replayable shuffle of the 49 observations. It separately balances original on the left **25 times** and experimental on the left **24 times**. Condition labels, owner IDs, source rank, and mapping are hidden from the ordinary presentation until the local sequence ends. It is **label masking only**, not a credible double-blind study: experienced users, URL inspection, colors, repeated stimuli and other cues can reveal the condition.

The operator fixes a single display configuration for the entire rehearsal: one of 24/32/48/64/96 CSS pixels, neutral black/white/theme background, and original color or grayscale diagnostic. Pixel sizes are CSS sizes, **not measured physical visual angles or controlled viewing distances**; the device, browser, screen calibration, anti-aliasing, lighting, observer, and vision differences are uncontrolled.

For each observation the operator can record a preliminary, **non-scored preference**: left clearer, right clearer, similar, or cannot judge. The original owner pair is intentionally not cued or outlined because modifying source geometry would confound the colors. This also means the response cannot demonstrate accurate identification of the flagged component pair, even when a human prefers a glyph presentation.

## Local observations and restrictions

The rehearsal uses only ephemeral page state. It makes the original three source fetches and **does not submit responses, set local storage or cookies, identify a participant, or automatically persist observations**. After all observations are answered, the operator can generate JSON in a local read-only text field and copy it manually.

The exported `chromalect.glyph.heldout-blind-presentation-rehearsal.v0.1` JSON includes the reproducible seed, presentation positions and side assignments, invariant viewing settings, responses and source-pair identifiers, together with explicit flags for:

- `ethicsProtocolApproved: false`
- `participantEligibilityVerified: false`
- `independentlyAdjudicated: false`
- `visualCertificationGranted: false`
- `semanticFamilyApproved: false`
- `automaticallyUploaded: false`

It intentionally has **no personally identifying field**. Exported data remains provisional. The schema validator refuses fabricated certification or participant approval, unexpected fields, changed seed/condition order, duplicate trial IDs, nonstandard choices, or unexplained source modifications.

## Independent offline export verification

The source-linked [offline validator](../tools/glyph-pipeline/heldout_blind_color_export_validate.mjs) checks a manually copied rehearsal JSON against the generated authoritative palette, original 48-glyph warning manifest and fold-training evidence, without sending an observation to a service or printing individual responses.

Its command is:

    node tools/glyph-pipeline/heldout_blind_color_export_validate.mjs --validate /path/to/local-session.json

It requires the source-glyph pipeline's generated site artifacts to exist locally; the checked-in source-only repository by itself does not contain those generated manifests. The validator checks a reproducible permutation from the recorded 32-bit random seed, original-left versus experiment-left assignment for each trial, allowed response categories, position ordering, constant display conditions, exact source trial IDs, and all zero-certification flags. It explicitly refuses arbitrary extra session/participant/observation fields that could accidentally leak private information into a public research package. Successful output is **only a response count and a statement of nonapproval**, not the response text.

It does not establish a study participant's existence, protocol approval, display calibration, reviewer qualification, independence, or truthfulness of visual preferences. It is a deterministic format-and-provenance validator. The [offline-validator smoke test](../tools/glyph-pipeline/heldout_blind_color_export_validate_smoke.mjs) exercises valid and rejected sessions using temporary, automatically deleted local fixtures.

## Independent acceptance gates

Before interpreting responses as actual evidence of component discrimination, the project would need independent geometry review of all eligible source glyphs, an accessible and ethics-reviewed participant protocol, genuine identification/recognition tasks with independently established ground truth, counterbalanced and appropriately concealed conditions, controlled display/viewing characteristics, prospectively defined exclusions and metrics, and independent replication with appropriately consented participants.

Until then **the rehearsal's task/checkpoint status can be technically complete while the scientific evidence status remains 0%**.

## Reproduction

The existing Pages workflow runs these tests after the source glyph and fivefold reports have been built:

    node --check site/heldout-blind-color-core.js
    node --check site/heldout-blind-color-rehearsal.js
    node tools/glyph-pipeline/heldout_blind_color_core_smoke.mjs
    node tools/glyph-pipeline/heldout_blind_color_rehearsal_viewer_smoke.mjs
    node tools/glyph-pipeline/heldout_blind_color_export_validate_smoke.mjs

The smoke fixtures verify the full original 49-warning source census, 25/24 presentation balance, seed reproducibility, fixed session viewing configuration, all 49 responses, local-only export, and refusals of unsupported provenance or independent approvals.
