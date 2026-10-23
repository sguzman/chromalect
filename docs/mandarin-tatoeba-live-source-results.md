# Live Tatoeba word-sentence source verification — 2026-10-23

The [live API run](https://github.com/sguzman/chromalect/actions/runs/39953177354) checked all **27** word-surface sentence IDs on the official Tatoeba v1 API. The [versioned source-integrity report](../data/semantic/cedict-crossref/tatoeba-live-word-record-audit-summary-v0.1.json) preserves the observed results and the SHA-256 of the original GitHub Actions artifact.

| Source observation | Result |
| --- | ---: |
| Live Tatoeba sentence records retrieved | 27 / 27 |
| Live record owner equals pinned corpus contributor | 27 / 27 |
| Live sentence text SHA-256 equals the original export's text hash | 27 / 27 |
| Live sentence still contains its target written word sequence | 27 / 27 |
| Live sentence license label **CC BY 2.0 FR** | 27 / 27 |
| Source records marked unapproved | 0 |
| Legal reuse-rights decisions, contextual readings and approved senses | **0** |

This is an **observation of current source metadata**, not a license for indiscriminate republication. The [Tatoeba corpus terms](https://en.wiki.tatoeba.org/articles/show/using-the-tatoeba-corpus) describe author attribution and CC BY 2.0 FR usage. Each user-facing quotation would still require appropriate source attribution and checking the intended form of reuse.

The live check deliberately omitted Chinese sentence text and only compared hashes with the independent [source text-fingerprint ledger](../data/semantic/cedict-crossref/tatoeba-word-sentence-text-fingerprints-v0.1.json). It did not check word boundaries, native-speaker appropriateness, contextual pronunciation, semantic sense or pictogram comprehension. All those claims remain pending. The earlier failed probes resulted from an incorrect assumption about Tatoeba v1's `data` wrapper; the final run used the corrected parser.

The frozen report provides continuity beyond the 30-day raw artifact retention. The upstream sentence records may subsequently be edited or deleted; this check is explicitly dated.
