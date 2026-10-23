# Machine-keyed held-out component-identification rehearsal (v0.1)

Chromalect now has a second, explicitly **non-certifying** color-research instrument that asks a source-mapping-keyed identification question rather than a subjective color preference. The [browser rehearsal](../site/heldout-component-identification.html) uses **49 original within-character component-pair warning observations** across 48 source glyphs, with 23 introduced, 21 resolved and five retained numerical OKLab warnings.

## Answer-key provenance and limitation

The [target generator](../tools/glyph-pipeline/heldout_component_identification_targets.mjs) regenerates the complete [held-out source review](../site/glyphs/research/heldout-warning-v0.1/index-v0.1.json) and refuses a different manifest, source-owner path sequence, palette assignment, fold exclusions, geometry, SVG checksum or source acceptance state. It generates a **separate monochrome locator SVG** for each of 49 source pairs.

Every locator retains the exact original path `d` data, path order, `data-component` IDs and parent transform. It shades **all paths assigned to the selected source component** charcoal and all remaining source strokes pale gray; the colored original v0.6 and fold-trained experiment SVGs are unchanged. The two choices correspond to the recorded source component forms and stable IDs. A deterministic alternating rule chooses the first or second component in the source-pair record, exactly 25 versus 24 times. Generated locators are versioned and include SHA-256 hashes, source owner IDs, and proof that no independent answer-key certification has been granted.

**The “right answer” is a source-assigned component owner, not a human- or expert-verified truth label.** Some mappings and compositional analyses could be wrong. An artificial or self-administered answer can only be described as *agreement with the current source-owner mapping*. It cannot certify the underlying component or semantic meaning. This task is not a test of semantic comprehension.

## Rehearsal procedure

The [source validation and planner](../site/heldout-component-identification-core.js) creates a deterministic 32-bit-seeded shuffle of 49 one-condition tasks. Exactly **25** show original v0.6 and **24** show the fold-trained experimental condition. In a separate seeded permutation, the machine-assigned owner appears among the two component-form choices in the first position **25** times and in the second position **24** times. The displayed glyph and the locator use the same fixed CSS pixel size: 24, 32, 48, 64 or 96 px. The color glyph uses a chosen white or black background and can be shown as color or grayscale; the locator always uses white to keep its meaning constant.

The condition name, source mapping's target ID and per-trial concordance are not disclosed by the normal UI until the local 49-trial sequence has ended. **This is only display-label masking, not study-grade blinding**; the generated source manifest, SVG metadata and component forms are publicly inspectable. The same glyph can appear in more than one task, which can encourage familiarity or learning carryover. A neutral locator and explicit component-form answer choices could support recognition by shape alone, even if the component palette conveys no useful information. Source geometry is not varied with treatment, but locator and task cues still prevent causal claims about color learning.

The choices are first-form owner, second-form owner or abstention. The local summary reports the number of chosen source owners matching the *unverified* source assignment and the number of abstentions, **not a certified identification-accuracy score**. This is a technical rehearsal; no actual independent participant observations or validated learning results have been collected.

## Private export and safety gates

The browser holds only ephemeral local responses and never submits, stores or uploads them. Once the sequence ends, the operator may prepare JSON in a local read-only field and copy it manually. The exported format is `chromalect.glyph.heldout-component-identification-rehearsal.v0.1`, with:

- A replayable random seed, exact left/right component-form options, condition, order and invariant display parameters.
- Responses and flags that distinguish the selected source ID from *machine-source concordance*. Abstentions have `null` concordance.
- An explicit zero for independent human recognition, certified visual mappings and semantic approvals.
- Explicit `false` values for participant eligibility, ethics approval, independent adjudication, automatic uploading, and browser persistence.

The validator refuses source-ID drift, changed masked condition or answer position, fabricated agreement counts, duplicate answers, unexpected private identifiers, unsupported display settings, and claimed independent approvals. No personal identifiers or literal private observations are included in public tests or fixtures.

## Offline replay of local exports

The [offline source-keyed export validator](../tools/glyph-pipeline/heldout_component_identification_export_validate.mjs) runs only after the normal glyph-source and held-out manifest generation. It uses the same source-pinned owner identities and 49-observation trial scheduler as the browser and accepts a locally copied JSON file using:

    node tools/glyph-pipeline/heldout_component_identification_export_validate.mjs --validate /path/to/local-record.json

The validator rederives every machine-keyed response from the session seed, its presented original/experimental condition, the source component-choice order and the chosen answer. It validates nonabstention, abstention and machine concordance counts while refusing participant-identifying fields, altered answer positions or new independent approvals.

On successful validation it prints only a count of local observations and unscored nonabstentions; **it does not print the selected component IDs, machine-concordance counts or actual responses**. This protects local rehearsal notes from becoming public build logs. The companion [offline validator smoke test](../tools/glyph-pipeline/heldout_component_identification_export_validate_smoke.mjs) uses disposable local JSON fixtures and checks ten deliberately invalid records.

## Outstanding research gates

Before human recognition or color-discrimination claims can be made, the project still requires independent examination of the 1,000 original stroke-owner mappings, reviewed source-form and shape ambiguities, accessibility/perceptual protocol, independent source-key adjudication, consent and ethics review as applicable, controlled calibrated displays and distances, balanced between/within-subject design, prospectively established measures and statistical analysis, and external replication. This technical artifact satisfies **none** of those research gates by itself.

The production `mandarin-component-identity@0.6.0` palette, source glyphs and all proposed semantic candidates remain unchanged.

## Reproduce

After the existing Pages pipeline regenerates source SVGs and the five-fold held-out report:

    node tools/glyph-pipeline/heldout_component_identification_targets.mjs --write
    node tools/glyph-pipeline/heldout_component_identification_targets.mjs --check
    node tools/glyph-pipeline/heldout_component_identification_targets_smoke.mjs
    node tools/glyph-pipeline/heldout_component_identification_core_smoke.mjs
    node tools/glyph-pipeline/heldout_component_identification_viewer_smoke.mjs
    node tools/glyph-pipeline/heldout_component_identification_export_validate_smoke.mjs

The test suite enforces all 49 source-owned target-region SVGs, exact geometry and owner sequences, 25/24 target selection, 25/24 treatment and answer-position balance, unchanged production provenance, 49 local abstention responses, JSON replay, and explicit refusal of certification.
