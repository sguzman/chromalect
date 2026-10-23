# Alternative publisher sources for the corpus-unmatched character 刨

**Date: 2026-10-23 UTC.** Neither the first-three-match Tatoeba sample nor the deterministic whole-snapshot hash sample contains a Mandarin sentence ID for **刨** (rank 821), even though its pinned CC-CEDICT readings are `bao4` and `pao2`. This is a limitation of that particular corpus snapshot, not a rejection of the character or its pronunciations.

The [machine-readable escalation record](../data/semantic/cedict-crossref/unmatched-corpus-character-source-escalation-v0.1.json) preserves **four independently hosted publisher pages** explicitly checked for the character and its two basic pronunciation categories.

| Source | Displayed readings | Research value |
| --- | --- | --- |
| [汉典](https://zdic.net/hans/%E5%88%A8) | páo, bào | Mainland-facing character dictionary with two lexical categories and references |
| [Taiwan MOE, concise bào entry](https://dict.concised.moe.edu.tw/dictView.jsp?ID=770&la=0&powerMode=0) | bào | Planing/scraping word leads |
| [Taiwan MOE, concise páo entry](https://dict.concised.moe.edu.tw/dictView.jsp?ID=2686&la=0&powerMode=0) | páo | Digging and removal word leads |
| [Taiwan MOE, mini dictionary](https://dict.mini.moe.edu.tw/SearchIndex/word_detail?breadcrumbs=Search_%E5%88%A8_one&dictSearchField=%E5%88%A8&wordID=D0000832) | bào, páo | Additional pronunciation and word leads |

The dictionaries support preliminary **research distinctions**: `páo` in excavating and exclusion/removal functions, versus `bào` in planing or scraping. These are paraphrased, not copied as source dictionary articles. A word such as 刨坑 or 刨木头 is only a **dictionary word lead**: it is not a retrieved independently licensed sentence with an independently verified pronunciation and lexeme sense.

This research fills a **source discovery gap** for 刨. It does not change the earlier Tatoeba coverage statistics, source-reading assignments, the project's emphasis on Mainland Standard Mandarin, or its **zero independent approval** states. Taiwan dictionary usage must be independently checked for Mainland compatibility. A new corpus or a licensed publisher example with a record ID, contributor, source rights, and contextual reading verification is still needed before considering any attested use.

The [escalation smoke test](../tools/glyph-pipeline/unmatched_corpus_source_escalation_smoke.mjs) guards these separate statuses.
