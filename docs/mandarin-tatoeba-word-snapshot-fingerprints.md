# Immutable snapshot fingerprints for 27 Mandarin word-surface sentence IDs

The [fingerprint ledger](../data/semantic/cedict-crossref/tatoeba-word-sentence-text-fingerprints-v0.1.json) preserves the **SHA-256 of each selected sentence's original UTF-8 text** from the official Tatoeba `cmn_sentences_detailed.tsv` export retrieved on 2026-10-23. These records correspond exactly to the 27 IDs and 20 public contributors in the [attribution ledger](mandarin-tatoeba-word-contributor-attribution.md). It allows a future source check to detect whether the sentence text has changed without committing the text itself.

**No original sentence text is published**; individual live sentence pages have **not** yet been checked, so zero source records are certified current or legally reusable. The hashes establish integrity with respect to the pinned export snapshot only, not linguistic quality, individual license, segmentation, pronunciation, or meaning. All independent lexical and pictogram approvals remain zero.

The [smoke test](../tools/glyph-pipeline/tatoeba_word_fingerprints_smoke.mjs) checks exact sentence-ID correspondence and a fixed aggregate SHA-256 commitment to the 27 fingerprints.
