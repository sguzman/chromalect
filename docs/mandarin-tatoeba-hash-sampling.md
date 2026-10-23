# Alternative whole-snapshot corpus candidate sampling

An [independent one-time workflow](../.github/workflows/tatoeba-hash-sample.yml) acquires up to five Mandarin sentence IDs per high-attention character using a deterministic SHA-256 ranking of **character rank + sentence ID**. Unlike the earlier first-three-matches sample, this method considers every qualifying sentence in the downloaded snapshot and chooses the smallest hashed IDs. It does not rely on sentence file order.

The [importer](../tools/glyph-pipeline/tatoeba_hash_sample.mjs) retains the original export SHA-256, source IDs, contributor names and sentence hashes without publishing full sentence text. Its [smoke test](../tools/glyph-pipeline/tatoeba_hash_sample_smoke.mjs) checks deterministic selection under reversed input order, bounded output, duplicate protection and explicit zero approvals.

The first chronological sample and its [stable source index](../data/semantic/cedict-crossref/tatoeba-sentence-id-index-v0.1.json) remain unchanged. This alternative cohort exists to make independent source research less sensitive to early sentence IDs; **it does not validate modern Mandarin usage, register, reading, lexical sense, copyright permission, or pictogram comprehension**. Any new sample must be reviewed and versioned separately before being linked to production-facing evidence counts.

## Preserved source-ID cohort

The completed 2026-10-23 hash-sampled acquisition evaluated **108,126** qualifying character/sentence matches across **89,190** corpus sentence rows and selected **701 associations** containing **690 distinct sentence IDs**. Candidates were found for **141 of 142** characters; **刨** remained unmatched. Three other targets received fewer than five candidates: 乙 (3), 杠 (4), and 钉 (4), reflecting actual available matches in the bounded snapshot rather than an error.

The [permanent source-ID index](../data/semantic/cedict-crossref/tatoeba-hash-sample-source-id-index-v0.1.json) retains all selected IDs without publishing sentence text. Only **37 character/sentence associations** overlap the older chronological sample; across both collections there are **1,015 distinct sentence IDs**. This demonstrates different source-selection behavior, not improved comprehension or independent lexical accuracy.
