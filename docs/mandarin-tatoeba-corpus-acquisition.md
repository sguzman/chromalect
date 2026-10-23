# One-time external Mandarin corpus intake

The independent [Tatoeba context acquisition workflow](../.github/workflows/tatoeba-context-intake.yml) is triggered once when this workflow file is first added to the default branch, and can also be dispatched explicitly. It is **not scheduled**.

The job downloads one official Mandarin `cmn_sentences_detailed.tsv.bz2` export from Tatoeba's designated download host, runs the [offline source-ID extractor](../tools/glyph-pipeline/tatoeba_context_candidate_extract.mjs), checks the first-tranche character scope and all zero-approval invariants, and uploads the bounded JSON as a **30-day GitHub Actions artifact**. It neither adds a live service dependency to the static site nor commits bulk Chinese sentence data into the public repository.

The 142-character selection caps output at three sentence-ID candidates per character (at most 426 character/sentence associations). The source SHA-256 covers the decompressed UTF-8 TSV; the declared date is the date the archive is retrieved, not a claim about the creation date of each sentence or the upstream release. The artifact contains contributor identifiers, source record URLs and sentence hashes, not the complete sentence texts.

An official Tatoeba sentence merely matching a character's written form cannot establish its Pinyin, word boundary, sense, register or learning effectiveness. Actual quotation rights, attribution, linguistic use and independent review remain separate checks. Tatoeba's text reuse terms are documented in the [context acquisition methodology](mandarin-tatoeba-offline-candidate-intake.md).

The workflow has `contents: read` permission. It cannot rewrite `main` or change production glyph, pronunciation or meaning data. This is a controlled research intake, not an automated lexical adjudicator.
