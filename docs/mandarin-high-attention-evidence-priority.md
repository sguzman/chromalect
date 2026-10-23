# High-attention Mandarin reading evidence-acquisition priority

**Status:** 142 / 142 high-complexity character records prepared for further independent usage research. All **319 reading entries** in this cohort still lack independent linguistic adjudication.

The source-only [priority ledger](../data/semantic/cedict-crossref/high-attention-evidence-priority-v0.1.json) reconciles the completed [polysemy triage](mandarin-polysemy-triage.md), [897-candidate source review](mandarin-lexical-review-protocol.md), and [explicit dictionary-internal cross-reference inventory](mandarin-dictionary-reference-cues.md). It does **not** infer contemporary meaning, frequency, distinct senses, or emoji comprehension.

## Current research bottlenecks

| Source signal | High-attention characters / entries |
| --- | ---: |
| High-attention characters | 142 |
| Pinned dictionary reading entries | 319 |
| Characters with written-form links in the source excerpt | 78 |
| Characters without written-form links in the source excerpt | **64** |
| Reading entries belonging to those 64 characters | **140** |
| Characters with a provisional English-gloss mismatch | 31 |
| Characters whose initial emoji was deferred | 22 |
| Characters with neither an initial emoji candidate nor an explicit dictionary reference | 5 |

These counts deliberately overlap. Source-internal references can be useful leads but are **not independent lexical usage attestations**. Missing links mean only that a specific markup pattern did not occur in the source excerpt.

## Prioritization logic

The machine-readable ledger orders high-attention entries by transparent evidence-acquisition heuristics:

1. Source has no proposed emoji and no internal reference token.
2. Source has no internal reference token and an English-gloss discrepancy.
3. Source has no internal reference token.
4. Source has internal reference tokens plus a provisional English-gloss discrepancy.
5. Remaining high-attention source packets.

This is an allocation plan, **not** a judgment that any source entry is incorrect. All 142 still require independent reading-specific usages, examples, registers and word-boundary evidence before lexical adjudication. The [reading-inventory worksheet](../site/reading-inventory.html) supports the 140 reading records of high-attention characters with no dictionary-internal links as a separate review cohort.

Reproduce with `node tools/glyph-pipeline/high_attention_evidence_priority.mjs --check`; [regression tests](../tools/glyph-pipeline/high_attention_evidence_priority_smoke.mjs) verify counts, source identities and zero-approval invariants. CC-CEDICT remains **CC BY-SA 4.0**, pinned to revision `63c2569948629323b515833930fdd10f285401b6`.

**Independently verified reading contexts: 0. Independent lexical approvals: 0. Independent pictogram comprehension approvals: 0. Production semantics: 0.**
