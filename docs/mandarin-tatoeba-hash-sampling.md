# Alternative whole-snapshot corpus candidate sampling

An [independent one-time workflow](../.github/workflows/tatoeba-hash-sample.yml) acquires up to five Mandarin sentence IDs per high-attention character using a deterministic SHA-256 ranking of **character rank + sentence ID**. Unlike the earlier first-three-matches sample, this method considers every qualifying sentence in the downloaded snapshot and chooses the smallest hashed IDs. It does not rely on sentence file order.

The [importer](../tools/glyph-pipeline/tatoeba_hash_sample.mjs) retains the original export SHA-256, source IDs, contributor names and sentence hashes without publishing full sentence text. Its [smoke test](../tools/glyph-pipeline/tatoeba_hash_sample_smoke.mjs) checks deterministic selection under reversed input order, bounded output, duplicate protection and explicit zero approvals.

The first chronological sample and its [stable source index](../data/semantic/cedict-crossref/tatoeba-sentence-id-index-v0.1.json) remain unchanged. This alternative cohort exists to make independent source research less sensitive to early sentence IDs; **it does not validate modern Mandarin usage, register, reading, lexical sense, copyright permission, or pictogram comprehension**. Any new sample must be reviewed and versioned separately before being linked to production-facing evidence counts.
