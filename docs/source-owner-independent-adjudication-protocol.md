# Independent source-component ownership adjudication protocol (draft)

This document specifies a prospective, non-executed review procedure for Chromalect's **49 machine-selected source-owner warning pairs across 48 simplified-Chinese characters**. Its [machine-readable acceptance gate](../data/research/source-owner-independent-adjudication-protocol-v0.1.json) records the current non-certifying state. This protocol is **not preregistered**, no independent reviewers have been recruited, and no decisions have been accepted.

## Sources and separate claims

- Original source-rendered glyphs and SHA-256 digests establish *reproducibility of the source geometry*, not expert correctness of each ownership assignment.
- Two disjoint region locators show the machine-selected owner and other mapped candidate. Their correspondence is checked against the same source, not against an independently verified decomposition.
- Five-fold color-warning categories (23 introduced, 21 resolved, 5 retained) are numerical palette diagnostics, not language or visual performance judgments.
- The native-font character comparison varies with installed fonts and can be used only as shape context.
- The existing local observation intake explicitly reveals the machine-assigned key. It **must not be described as blinded expert review**.

## Required independent review stage

1. Before collecting external assessments, freeze the 49-target source set, provenance, analysis rules, candidate component forms, and qualifications for reviewers; record protocol revisions and source licenses.
2. Recruit at least two qualified, independent reviewers per target. Reviewers must inspect individually pinned source geometry and external independently attributable evidence. They must not be shown the machine answer key, the other reviewer's decision, or experimental color treatment as an ownership cue.
3. Record source-backed observations separately: exact target identifiers and hashes, candidate identity and decomposition claims, substantive evidence locations, conflicts, and limitations. Evidence URLs alone do not prove review quality or independent authorship.
4. Reconcile decisions under precommitted criteria. Reviewer concordance is not sufficient when both reviewers rely on the same unexamined source claim.
5. If two independent reviews materially disagree, retain an unresolved state and require separately qualified adjudication of competing evidence. Never break ties by machine-key concordance, guessed commonness, color difference, or a target's numeric priority.
6. Preserve the original mapping and palette until a separately versioned, provenance-reviewed update is approved and regression-tested across Direct/Marker representations and all affected source glyphs.

The [presentation-masked rehearsal](source-owner-masked-presentation.md) prepares neutral side-by-side candidate comparisons with no collected responses. The [local-only opaque reviewer packet generator](source-owner-offline-packet-preparation.md) additionally separates the machine source-key mapping into an uncommitted private coordinator file and removes component IDs from packet filenames. Neither mechanism constitutes an approved or independent review collection instrument. The public source manifests remain machine-key-visible and the rehearsal is neither an independently blinded review nor a participant assessment.

A future external review collection interface must be separated from the existing unblinded local source-key worksheet and must pass privacy and reproducibility review before use.

The [local provisional note comparison](source-owner-note-comparison.md) can flag agreement and conflict in two *unblinded, unauthenticated* exports; it must not supply accepted independent reviewer reports or certified decisions.

## Hard acceptance boundaries

The machine-readable protocol records **0 reviewer reports, 0 independently reconciled pairs, 0 certified component owners, 0 visually certified glyphs, and 0 study-eligible items**. A component decision does not automatically validate semantics, color readability, lexical interpretation, or learning effects. A distinct controlled study would be needed for causal visual-discrimination or educational claims.

The [source-owner intake](../site/component-owner-adjudication.html) remains a preparation tool for provisional evidence notes, not an acceptance authority. Its export validator deliberately refuses purported certification claims. Data published by the current pipeline, including original vector geometry and production v0.6 color identities, remain unchanged.

## Current prerequisite and evidence summary

The [machine-readable readiness summary](../site/research/source-owner-readiness-v0.1.json) is generated from this source protocol and the pinned 49-pair and complementary-locator manifests. It records seven explicitly unresolved research prerequisites, a minimum of **98 independent per-pair reports** (two for each of 49 pairs), zero accepted reports, zero independently reconciled pairs, zero owner certifications and zero study-eligible glyphs. The summary is a *source-status inventory*, not a live recruitment record or evidence that participation is approved. No machine output may satisfy an independent-review prerequisite on its own.

To inspect the same information locally:

    node tools/glyph-pipeline/source_owner_review_readiness.mjs --status
    node tools/glyph-pipeline/source_owner_review_readiness.mjs --json

Until independently attributable source materials, reviewer qualifications, consent and any required ethics or publication approvals have actually been established, these gates remain blocked.

## Integrity verification

The static research pipeline checks the protocol file against the generated source-owner and complementary-locator manifests:

    node tools/glyph-pipeline/source_owner_independent_protocol_smoke.mjs

A successful machine check confirms that the protocol remains unexecuted, source-linked and non-promoting; it does not satisfy the future human-review gates.
