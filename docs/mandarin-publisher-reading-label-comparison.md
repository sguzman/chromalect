# Source-pinned vs. publisher-displayed Pinyin labels

**Status: mechanical written-label comparison only.** This audit joins the [publisher page provenance v0.2](../data/semantic/cedict-crossref/publisher-page-provenance-v0.2.json) and [source-reading normalization v0.1](../data/semantic/cedict-crossref/pinyin-reading-label-normalization-v0.1.json), then transforms numbered Pinyin into tone-marked display strings. Capitalized CC-CEDICT proper-name labels are casefolded without erasing their original spellings.

| Compared high-attention characters | Count |
| --- | ---: |
| Checked characters | 23 |
| Checked publisher pages | 27 |
| Matching displayed reading-label sets | **21** |
| Publisher additionally displays other labels | **2** |
| Pinned labels absent from the checked publisher headings | **0** |
| Independently approved senses | **0** |

The two publisher-expanded inventories are **过** and **齐**. For 过, the checked source displays guō in addition to ordinary guò and neutral guo. The pinned CC-CEDICT surname label `Guo4` remains in conflict with the publisher's surname `guō`; this is not resolved by literal set comparison. For 齐, publisher labels include jì, zhāi and zī in addition to qí, while this pinned CC-CEDICT tranche uses only `Qi2` and `qi2` entries.

**No additional readings have been imported** into the active Mandarin profile. Publisher headings, orthographic capitalization, historical or regional registers and word-level contexts are distinct concepts; a matching label set cannot validate any sense or emoji mapping.

The [semantic coverage browser](../site/semantic-coverage.html) provides a dedicated provisional two-character filter and shows the pinned/external label differences without promoting them to the production profile.

The [reproducible JSON](../data/semantic/cedict-crossref/publisher-reading-label-comparison-v0.1.json), [generator](../tools/glyph-pipeline/publisher_reading_label_comparison.mjs), and [smoke tests](../tools/glyph-pipeline/publisher_reading_label_comparison_smoke.mjs) preserve source links, original numbered labels and separately recorded additions. No external site access is required during CI.
