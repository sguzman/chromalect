# Reading-sensitive Mandarin gloss-alignment audit

**Status:** automated analysis for **1,000/1,000** first-tranche characters and **897/897** provisional emoji-associated English sense labels. **Zero** independent lexical or emoji comprehension approvals.

This audit is a mechanically derived view of the already pinned [all-sense lexical queue](../data/semantic/cedict-crossref/full-lexical-review-queue-v0.1.json) and [polysemy triage](../data/semantic/cedict-crossref/polysemy-triage-v0.1.json). It does not create new Mandarin meanings, claim modern usage, or certify a pronunciation-to-sense alignment.

## Literal string distribution

| Automated category | Provisional expressions |
| --- | ---: |
| No strict whole-term English gloss match | **248** |
| Literal gloss appears under all indexed dictionary readings | **437** |
| Literal gloss appears under a subset of indexed readings | **212** |
| **Total** | **897** |

The 212 subset matches occur across **208 distinct characters**. For example, the proposed *factory* sense of 厂 has a literal match associated with the pinned `chang3` entry, but not the `han3` radical entry. This is a cue to inspect sense, register, reading, and character-versus-word context, **not** independent confirmation or proof that either pronunciation is inapplicable.

The 1,000-character baseline still contains **339** characters with multiple dictionary readings, **142** high-attention multi-reading/high-fragment records, and **119** characters with no initial emoji candidate. English matching is intentionally shallow: one word may correspond to several readings, a valid sense may use a different English gloss, and surname, register, or historical readings need separate interpretation.

## Artifacts and validity

- Machine-readable audit: [reading-sensitive-gloss-audit-v0.1.json](../data/semantic/cedict-crossref/reading-sensitive-gloss-audit-v0.1.json).
- Generator: [reading_sensitive_gloss_audit.mjs](../tools/glyph-pipeline/reading_sensitive_gloss_audit.mjs), reproducible with `node tools/glyph-pipeline/reading_sensitive_gloss_audit.mjs --check`.
- Independent structural invariants: [reading_sensitive_gloss_audit_smoke.mjs](../tools/glyph-pipeline/reading_sensitive_gloss_audit_smoke.mjs).
- The [semantic coverage browser](../site/semantic-coverage.html) filters the 208 characters whose current candidate gloss appears under only a subset of recorded readings.

All source CC-CEDICT excerpts retain **CC BY-SA 4.0** attribution and the pinned revision `63c2569948629323b515833930fdd10f285401b6`. Automatic grouping and matching cannot grant independent lexical review, human pictogram recognition, or production semantic approval.
