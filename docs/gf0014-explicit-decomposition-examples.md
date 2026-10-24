# Direct GF 0014 normative decomposition examples in the first thousand

The issuing Ministry of Education's [announcement for GF 0014-2009](https://www.moe.gov.cn/jyb_xwfb/gzdt_gzdt/moe_1485/tnull_45766.html) explains the standard's decomposition rules with concrete examples. The original [standard reproduction hosted by Unicode's IRG](https://www.unicode.org/irg/docs/n2739-GF0014-2009.pdf) provides the formal normative source.

Four explicit examples occur in Chromalect's first ranked thousand:

| Published rule | Source rank | Recorded active component cut | Outcome |
| --- | ---: | --- | --- |
| 分 splits as 八 + 刀 | 146 | 八, 刀 | Exact selected membership agrees |
| 执 splits as 扌 + 丸 | 363 | 扌, 丸 | Exact selected membership agrees |
| 东 must not split into 七 + 小 | 225 | 东 (root) | Active cut preserves atomic recognizer |
| 串 must not split into 中 + 中 | 736 | 串 (root) | Active cut preserves atomic recognizer |

The [source-constrained audit](../data/research/gf0014-explicit-decomposition-examples-v0.1.json) records the selected component IDs and paths, and the [regression test](../tools/glyph-pipeline/gf0014_explicit_decomposition_examples_smoke.mjs) rejects structural or certification changes.

These are **four confirmed chosen structural cuts**, not four independently visually certified glyphs. In particular, preventing the prohibited *specific split* is not the same as independently validating an SVG stroke-owner decomposition or all possible alternative analyses. None of the four characters has independently certified stroke geometry in this report. This adds focused authority evidence toward the outstanding Phase 0 selected-decomposition requirement without closing the 1,000-glyph gate.
