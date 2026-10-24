# GF 0014-2009: original-standard source location for 30 nonfont forms

The original [GF 0014-2009 component standard](https://www.unicode.org/irg/docs/n2739-GF0014-2009.pdf) is available as a 41-page reproduction in Unicode's Ideographic Research Group document archive (IRG N2739). The [issuing authority's announcement](https://www.moe.gov.cn/jyb_xwfb/gzdt_gzdt/moe_1485/tnull_45766.html) confirms 514 source components, 441 groups, and the issuance and implementation dates.

## Direct primary-source cross-check

The published component table spans **PDF pages 10–23** (printed standard pages 7–20), numbered continuously from **1 to 514**. The [source-location ledger](../data/research/gf0014-official-descriptive-row-locations-v0.1.json) identifies all **30** non-Unicode descriptive forms from Chromalect's GF catalog by their printed ordinal and group. The numeric ordinal and group pairs were compared directly with the scanned original table; **30/30 pairs match**.

The cross-reference includes the PDF page and printed-page index for each row and a separate assertion of the expected official group number. The [acceptance check](../tools/glyph-pipeline/gf0014_primary_source_locator_smoke.mjs) refuses changes in the source's recorded values, missing row identities, inconsistent page intervals, or false geometry/certification claims.

## What this does not establish

The printed standard uses actual drawn component forms. Chromalect's 30 brace-delimited IDS-style descriptions are a *third-party transcription's interpretation*. Matching table ordinals and group identifiers does **not** prove that any expression exactly reproduces the printed outline. It also does not prove independent glyph geometry availability or validate the 484 other transcribed drawn forms.

No part of the PDF, its table images, its component illustrations, or any third-party geometry was copied into Chromalect. All color assignments and glyph ownership remain unchanged.

**Research readiness:** 30/30 authoritative *numeric row/group locations* corroborated; **0/30 descriptive graphic interpretations independently approved**; **0/30 geometry assets recovered**; full 514-row source certification **pending**. The Phase 0 acceptance item requires *all* of these later checks and therefore remains unchecked.
