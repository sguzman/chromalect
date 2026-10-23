# External Mandarin dictionary reconnaissance: initial five-character pilot

**Status:** independent dictionary **source locations** checked for the five highest-priority characters in the existing [evidence-acquisition queue](mandarin-high-attention-evidence-priority.md). Their 11 pinned CC-CEDICT reading entries have provisional cross-source annotations. This is **not** independently adjudicated linguistic validation.

| Character | Pinned readings | Preliminary source-based distinction |
| --- | --- | --- |
| 长 | chang2, zhang3 | Length/duration versus growth and elder/leadership uses |
| 从 | Cong2, cong2, zong4 | Surname notation, ordinary follow/from functions and nonprimary traditional-form readings |
| 扒 | ba1, pa2 | Peeling/clinging versus raking/scratching/theft senses |
| 发 | fa1, fa4 | Simplification merges separate traditional forms 發 and 髮 |
| 尾 | wei3, yi3 | Tail/end senses versus regionally or lexically restricted alternate readings |

The [machine-readable dossier](../data/semantic/cedict-crossref/external-dictionary-reconnaissance-v0.1.json) identifies **12 distinct external source URLs** across 汉典, Wiktionary and Taiwan Ministry of Education dictionary pages. Source links were consulted **2026-10-23 UTC**; pages may change. Each pinned reading has a narrowly phrased preliminary observation and an outstanding question. Source text is not copied wholesale; individual publishers retain their respective rights. The CC-CEDICT source remains CC BY-SA 4.0.

The Mandarin profile prioritizes Mainland Standard Mandarin, so Taiwan dictionary readings and lexical categories must not silently be treated as identical to Mainland defaults. In particular, 从 and 尾 require attention to source disagreement or register; 发 requires preserving the traditional grapheme distinction. Dictionary word leads are **not** independent corpus sentence attestations.

The [reading-inventory worksheet](../site/reading-inventory.html) presents these source URLs, not the preliminary interpretations, before a source-first observation. Qualified independent lexical review is still required.

**Measured reconnaissance:** 5/142 high-attention characters (3.5%), 11 recorded readings, 12 external URL locations. Independent usage adjudications **0**, lexical approvals **0**, emoji comprehension approvals **0**, production semantics **0**.

[Regression smoke test](../tools/glyph-pipeline/external_dictionary_reconnaissance_smoke.mjs) verifies source identifiers, reading coverage and nonapproval status without claiming that external websites remain immutable.
