# Contextual Mandarin reading evidence-acquisition queue

The [versioned 319-reading task ledger](../data/semantic/cedict-crossref/contextual-reading-evidence-workqueue-v0.1.json) expands the 142-character [high-attention evidence-priority queue](mandarin-high-attention-evidence-priority.md) into the actual pinned per-character reading entries. It is a **work queue, not a linguistic sense dataset**.

| Work stage | Records |
| --- | ---: |
| High-attention characters | 142 |
| Source reading entries requiring contextual usage evidence | **319** |
| Reading tasks with an external dictionary publisher link checked | **50** |
| Reading tasks without a checked external publisher link | **269** |
| Sentence IDs with retrieved usage contexts | **0** |
| Contextual readings independently verified | **0** |
| Independently approved lexical senses | **0** |

Each task retains the exact original CC-CEDICT reading spelling, character rank, acquisition priority and publisher provenance. Empty source-ID, sentence, license, author-attribution, and contextual-reading fields are deliberately `null`. A publisher dictionary URL is a **research lead**, not an example sentence or usage attestation.

## Candidate contextual evidence source

[Tatoeba](https://tatoeba.org) publishes user-contributed Chinese sentences with sentence identifiers and an API. Its [reuse guidance](https://en.wiki.tatoeba.org/articles/show/using-the-tatoeba-corpus) describes attribution obligations for text under **CC BY 2.0 FR**. Sentence-specific source, contributor and applicable license must be checked before redistributing any example. Other suitably licensed corpora may be used if they retain equivalent provenance.

A sentence containing a Chinese character does **not** by itself prove which Pinyin reading, word boundary, grammatical function, historical register, or lexical sense applies. Sentence discovery, quotation rights, contextual reading verification and independent lexical adjudication are separate work stages. In particular, `Guo4` versus `guō` for the surname 过 must not be resolved from mere written occurrence.

## Reproduction and validation

Run `node tools/glyph-pipeline/contextual_reading_evidence_workqueue.mjs --check` to regenerate and compare the pinned input ledgers. The [smoke test](../tools/glyph-pipeline/contextual_reading_evidence_workqueue_smoke.mjs) checks exact source keys, work stages, source-link counts and zero-approval invariants. All records remain local project research metadata; none contains example sentences or private reviewer communications.

**Entry acceptance gates** for future research are a stable actual corpus record identifier, validated reuse rights and attribution, identifiable Chinese sentence context, independently checked reading in its word context, and a separate qualified sense review. Only then may a later version represent attested evidence. Pictogram comprehension is a different blinded review gate.


## Pronunciation-search deduplication (casefold only)

The [case-normalized search groups](../data/semantic/cedict-crossref/contextual-pronunciation-search-groups-v0.1.json) deduplicate case-equivalent spelling variants **only for gathering phonetic evidence**. The first 142 high-attention characters have **319 CC-CEDICT source reading entries**, which collapse to **241 distinct lowercased Pinyin labels**; **78** extra entries differ from an existing label only in capitalization. All 319 original source identities remain linked to their groups.

This optimization does **not** merge semantic usages. For example, surname and ordinary-word entries sharing the same phonetic label must retain their distinct contexts, registers and word-sense adjudication. Source acquisition and independent approvals remain pending for every group.

## Preserved first acquisition (2026-10-23)

The first completed Tatoeba import scanned **89,190** Mandarin sentence records and found **423 source-only character/sentence associations** containing **363 distinct sentence IDs**. There are candidates for **141/142** high-attention characters, with no selected sentence ID for **刨** (rank 821). [Candidate IDs](../data/semantic/cedict-crossref/tatoeba-sentence-id-index-v0.1.json) are now stored without sentence text; the source checksum and original acquisition run are recorded for reproducibility.

[Readiness summary v0.2](../data/semantic/cedict-crossref/contextual-evidence-readiness-summary-v0.2.json) distinguishes ID acquisition from contextual pronunciation verification. Version 0.1 remains the historical pre-acquisition baseline. No contextual reading or lexical sense has been independently adjudicated.
