# One-time external Mandarin corpus intake

The independent [Tatoeba context acquisition workflow](../.github/workflows/tatoeba-context-intake.yml) is triggered once when this workflow file is first added to the default branch, and can also be dispatched explicitly. It is **not scheduled**.

The job downloads one official Mandarin `cmn_sentences_detailed.tsv.bz2` export from Tatoeba's designated download host, runs the [offline source-ID extractor](../tools/glyph-pipeline/tatoeba_context_candidate_extract.mjs), checks the first-tranche character scope and all zero-approval invariants, and uploads the bounded JSON as a **30-day GitHub Actions artifact**. It neither adds a live service dependency to the static site nor commits bulk Chinese sentence data into the public repository.

The 142-character selection caps output at three sentence-ID candidates per character (at most 426 character/sentence associations). The source SHA-256 covers the decompressed UTF-8 TSV; the declared date is the date the archive is retrieved, not a claim about the creation date of each sentence or the upstream release. The artifact contains contributor identifiers, source record URLs and sentence hashes, not the complete sentence texts.

An official Tatoeba sentence merely matching a character's written form cannot establish its Pinyin, word boundary, sense, register or learning effectiveness. Actual quotation rights, attribution, linguistic use and independent review remain separate checks. Tatoeba's text reuse terms are documented in the [context acquisition methodology](mandarin-tatoeba-offline-candidate-intake.md).

The workflow has `contents: read` permission. It cannot rewrite `main` or change production glyph, pronunciation or meaning data. This is a controlled research intake, not an automated lexical adjudicator.

## Preserved source-ID snapshot

The independently retrieved 2026-10-23 corpus sample is preserved as a [compact candidate ID index](../data/semantic/cedict-crossref/tatoeba-sentence-id-index-v0.1.json). It records **423 character/sentence associations across 141 of 142 high-attention characters**, or **363 unique Tatoeba sentence IDs**, from 89,190 source sentences. The unmatched character is **刨** (rank 821). The snapshot can be checked without depending on the expiration of the larger initial GitHub Actions artifact.

Only IDs and character ranks are public in this index. Full sentence text and contributor identifiers are not reprinted; the initial Actions archive contains contributor metadata and a text SHA-256 for each candidate. Source-specific contributor attribution and license must be freshly checked before quoting or interpreting an individual sentence. Neither the source existence nor this index certifies a Pinyin reading, word boundary, sense, or pictogram.
