# External dictionary publisher page provenance

**Checked 2026-10-23 UTC.** Fourteen actual dictionary page views have been checked for headword and prominently displayed Mandarin reading labels, covering the first **10 of 142 high-attention characters** in the independently maintained source-reconnaissance dossiers.

The machine-readable [publisher-page-provenance-v0.1.json](../data/semantic/cedict-crossref/publisher-page-provenance-v0.1.json) includes the exact inspected URL, publisher, character, reading labels, and date. Checked source pages include 汉典 for 长, 从 (simplified and 從 traditional), 扒, 发, 尾, 火, 业, 过, 成 and 划, plus the Taiwan Ministry of Education's separate 扒 bā/pá and 尾 entries. Links in other reconnaissance packets do not inherit a checked status automatically.

**Unresolved source disagreement:** pinned CC-CEDICT records the surname 过 as `Guo4` while [汉典](https://zdic.net/hans/%E8%BF%87) records surname `guō`. Both source spellings are preserved. The independent dictionary also distinguishes ordinary guò and neutral guo; these are not a three-way synonym set. The traditional 從 and simplified 从 source pages likewise present differing prominence of zòng.

The page checks establish provenance, not a qualified linguistic review. Dictionaries can include supplementary historical pronunciations outside the basic reading header; Taiwan and Mainland norms may diverge. Independent corpus or expert adjudication remains pending. No external dictionary article has been reproduced in bulk.

**Counts:** 14 pages checked, 10/142 characters represented, **0 independently verified lexical senses, 0 approved emoji-comprehension mappings, and 0 production semantic approvals**. The associated [source-identity smoke test](../tools/glyph-pipeline/publisher_page_provenance_smoke.mjs) does not recontact publisher websites during CI.


## Expanded source access — v0.2

The [v0.2 registry](../data/semantic/cedict-crossref/publisher-page-provenance-v0.2.json) preserves the original 14 checked URLs and adds thirteen directly visited 汉典 pages for **当, 伏, 冲, 齐, 安, 尽, 约, 纪, 别, 作, 系, 闷 and 抹**, dated 2026-10-23 UTC.

The cumulative verified *page-access* count is **27/27 pages across 23/142 high-attention characters (16.2%)**. The additional thirteen characters have source-page checks only: separate lexical desk comparisons, corpus attestations, and human adjudication remain outstanding.

For **齐**, the independently hosted basic source records qí, jì, zī and zhāi, whereas the pinned CC-CEDICT excerpt in this tranche has only the case-distinguished `Qi2` and `qi2`. This difference in source-reading coverage is explicitly flagged, not silently imported as new canonical pronunciations. Regional and historical use require adjudication.

The earlier v0.1 file is retained unchanged for reproducibility. Independent lexical, pictogram and production semantic approvals remain zero.
