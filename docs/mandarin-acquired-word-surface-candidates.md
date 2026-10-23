# Acquired literal word-surface candidates: 2026-10-23

The [2026-10-23 official corpus acquisition](https://github.com/sguzman/chromalect/actions/runs/39950088781) ran the [eight source-documented word leads](mandarin-dictionary-word-surface-leads.md) against **89,190** Tatoeba Mandarin sentence records. It found **213** literal occurrences and selected **27 source-only candidate sentence IDs**, corresponding to **six of eight** word leads.

| Lead | Raw matching sentences | Selected IDs |
| --- | ---: | ---: |
| 长度 | 4 | 4 |
| 长大 | 25 | 5 |
| 划船 | 3 | 3 |
| 计划 | 120 | 5 |
| 经过 | 30 | 5 |
| 看过 | 31 | 5 |
| 刨坑 | 0 | 0 |
| 刨木头 | 0 | 0 |

The [compact permanent result index](../data/semantic/cedict-crossref/tatoeba-word-surface-id-index-v0.1.json) retains the exact 27 sentence IDs per word lead and the checked source snapshot SHA-256. The initial GitHub Actions artifact included contributor and text-hash metadata; this smaller public index contains **no sentence text or contributor names**, preserving traceability without bulk republication.

Neither 刨 lead appears in this Tatoeba snapshot. Alternative publisher dictionary source links remain available in the [unmatched-character escalation](mandarin-unmatched-corpus-character-sources.md), but they are not corpus sentence attestations.

A multi-character literal sequence is not necessarily a correctly segmented word in Chinese. Even when a context is likely, actual reading, lexeme sense, register and source quotation permissions require separate independent review. Accordingly, contextual pronunciation, lexical, and pictogram approvals all remain **0**.

## Cross-cohort source-ID overlap

The [reproducible overlap audit](../data/semantic/cedict-crossref/word-surface-corpus-overlap-audit-v0.1.json) compares this word-surface sample with the previous chronological and hash-selected character-only cohorts. The character cohorts contained **1,015 distinct sentence IDs**. Of the **27** word-stage IDs, **three** appeared earlier under some character, but **none** was previously selected for the same target character. Therefore **24 additional distinct sentence IDs** extend the project-wide source ID union to **1,039**.

These are only research source identifiers. A different sentence ID is not a verified alternative pronunciation, independently accepted sense or validated emoji.
