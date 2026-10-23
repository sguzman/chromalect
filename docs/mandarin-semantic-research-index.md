# Mandarin semantic research: methods and evidence

This technical index documents the experimental Mandarin semantic research pipeline, provisional encoding grammar, independent-source intake, review instruments, and reproducible tests. It records the research as originally described in the public project overview, without promoting automated checks to independent linguistic or comprehension approvals.

## Emoji composition visibility audit

A [reproducible automated visibility audit](../docs/mandarin-emoji-visibility-audit.md) now covers all **897 experimental semantic expressions**. The current first-pass set has 875 one-emoji expressions and 22 multi-emoji expressions; **266** action/process expressions use only one visible emoji, and 火 uses identical 🔥 for its separate fire and burn cues. This does not make those cues automatically incorrect or restrict emoji reuse. The [semantic browser](../site/semantic-coverage.html) exposes filters for these structural review signals, without claiming independent lexical or comprehension approval.

## Semantic symbol composition experiment

The [experimental semantic lab](../site/semantic-lab.html) is a research scratchpad separated into mapped character examples, whole-word hypotheses, out-of-tranche glyphs, and grammar-only specimens. It uses a [versioned semantic grammar](../docs/semantic-expression-grammar-v0.1.md), a [typed recursive schema](../ontology/semantic-expression-v0.1.schema.json), and [illustrative machine-readable expressions](../site/semantic-grammar-v0.1.json) to explore an **emoji-first, variable-length expression layer**, with machine-readable operators underneath and optional technical notation for selected senses: single and multiple reusable pictograms coexist, with no arbitrary maximum or uniqueness requirement. Written meanings remain independently available, and unclear pictograms can be omitted. The [experiment design](../docs/semantic-pictogram-pilot.md) keeps character uses and word senses distinct. All examples in the lab are illustrative rather than sourced dictionary annotations. **Production semantics remain disabled** until sense provenance and independent symbol review exist; this experiment does not change the completed Mandarin glyphs, component identity colors, or sound layers.

### High-priority Mandarin semantic remediation

The [high-priority remediation proposals](../data/semantic/cedict-crossref/high-priority-remediation-v0.1.json) preserve **15 reversible, unapproved responses** to serious lexical or emoji mismatches, with nine alternative expression hypotheses and five suggested deferrals. These research options do **not** overwrite the existing first-1,000 semantic inventory, count as independent human review, or raise production coverage. See the [case-by-case report](../docs/mandarin-high-priority-remediation.md).

### Machine-readable review observations

Both experimental worksheets export versioned JSON that can be checked by a [no-dependency session validator](../tools/glyph-pipeline/review_session_validate.mjs). Review exports are deliberately classified as **unapproved local observations**, not canonical dictionary decisions or accepted semantic mappings. CI validates synthetic exports and rejects tampered identities, repeated trial IDs, and false production-approval claims. No participant data is committed by these tests.

### Reading-label capitalization research

A [CC-CEDICT label-normalization audit](../docs/mandarin-pinyin-label-casefold.md) shows that of 339 characters with multiple dictionary reading entries, **166 have only capitalization variants** (such as `Ding1/ding1`) and **173 have multiple distinct lowercased Pinyin labels**. Within the 142 high-attention characters, 55 have case-only differences. Original reading records and research priorities remain unchanged; normalized source labels are not independently approved pronunciations.

### Polysemy and reusable emoji-role research

The [dictionary-complexity triage](../docs/mandarin-polysemy-triage.md) now screens all **1,000 characters (100%)** for multi-reading and multi-gloss evidence without equating English gloss fragments with distinct Chinese senses. **339 characters** have multiple recorded dictionary readings, **142** have both multiple readings and many gloss fragments, and **367** have only one proposed emoji cue despite at least one lexical-complexity indicator. The [semantic browser](../site/semantic-coverage.html) filters these research priorities; **0 lexical sense inventories are independently approved**.

The [emoji event/non-event contrast audit](../docs/mandarin-event-role-contrast.md) covers **73 reused visible emoji forms** spanning **341 candidate sense assignments**; 16 high-attention groups are selected for independent comprehension testing. Reuse of a pictogram across characters is entirely legitimate. An [optional blind-study scope](../site/emoji-comprehension.html) tests the action-versus-entity distinction without special symbols in the visible emoji language, with no automatic approval.

### Reading-sensitive literal gloss research

A [reproducible source-string audit](../docs/mandarin-reading-alignment.md) now partitions the 897 provisional sense labels by their distribution across pinned dictionary readings: **248** have no strict English whole-term match, **437** match every recorded reading, and **212** match only some readings across **208 characters**. This distinction is searchable in the semantic browser and is an automated research priority only. No reading-to-sense assignment is independently approved.

### Dictionary reading-inventory review

The [reading-inventory worksheet](../site/reading-inventory.html) covers **1,393 pinned CC-CEDICT reading records across 1,000 characters**, including **173 reading records from 119 characters** with deferred pictograms. Its high-attention cohort includes 319 reading records from 142 polysemy-priority characters. The [protocol](../docs/mandarin-reading-inventory-protocol.md) documents independently sourced reading/usage notes, local-only preliminary exports and source-identity checks. This is not a dictionary sense approval or an emoji study.

### Source-internal dictionary cross-references

A [reproducible cross-reference inventory](../docs/mandarin-dictionary-reference-cues.md) extracts **469 explicit written-form/Pinyin tokens** from pinned CC-CEDICT glosses, appearing in **349 reading entries across 314 characters** (342 distinct written-form/pronunciation pairs). These reference tokens are now shown in the reading-inventory worksheet with their exact source spellings; they are **not** independent word attestations, proven senses, or whole-word semantic mappings.

### High-attention reading evidence priority

A [142-character source-evidence priority queue](../docs/mandarin-high-attention-evidence-priority.md) identifies **64 high-attention characters (140 recorded readings)** lacking explicit dictionary-internal cross-reference tokens, **31** high-attention characters with candidate gloss discrepancies and **22** with deferred pictograms. These signals prioritize independent context collection; they do not imply absence of usage or validate any sense.

### External dictionary source reconnaissance

The first [external lexical source pilot](../docs/mandarin-external-dictionary-reconnaissance.md) includes **5/142 high-attention characters (3.5%)**, their **11 recorded readings**, and **12 independently maintained dictionary URLs**. Provisional cross-source notes capture pronunciation, graph, sense and regional differences; source links are exposed in the local reading worksheet without preemptively showing assistant notes. This is research intake, not linguistic approval.

### Additional dictionary discrepancy evidence

A [second five-character external dictionary comparison](../docs/mandarin-external-dictionary-discrepancy.md) documents **火, 业, 过, 成 and 划** (11 reading entries). The pinned `Guo4` surname reading for 过 conflicts with 汉典's `guō` first-tone surname entry. No source reading is rewritten before independent adjudication. Together with the earlier pilot, **10/142 (7.0%)** high-attention characters have third-source desk research; all semantic approvals remain **0**.

### Source-first lexical review research

A [local-only Mandarin sense review worksheet](../site/lexical-review.html) uses the complete 897-expression source-first queue, with the [248-entry discrepancy queue](../data/semantic/cedict-crossref/sense-review-queue-v0.1.json) available as a prioritized subset. It presents the candidate character meaning and pinned Unihan / CC-CEDICT evidence, **without showing the emoji or the assistant's preliminary analysis before the reviewer commits an explanation**. Pinned dictionary excerpts are now visually separated by source reading headings, with the original unsegmented source still available and no inferred senses. Versioned v0.3 exports record the exact pinned Mandarin dictionary reading (or an explicit unresolved disposition) and preserve the starting cohort when filters change. The reviewer can export exploratory observations as JSON; the repository's independently approved lexical and emoji counts remain at **0**, since local single-reviewer observations are not certified results. The [protocol](../docs/mandarin-lexical-review-protocol.md) defines the evidence and independence limitations.

### Blind emoji comprehension research

The [local-only blind emoji comprehension worksheet](../site/emoji-comprehension.html) samples Chromalect's 897 experimental expressions. It **hides the Chinese character and proposed English meaning** until a free-response interpretation and confidence rating are committed; a separate post-reveal clarity rating can then be recorded. Results are exported to JSON only on explicit user action and are **not sent to a server or counted as independent human approval**. The [research protocol](../docs/mandarin-emoji-comprehension-protocol.md) explains sampling, blind/reveal phases, methodological limitations, and evidence required for eventual production acceptance. This is evaluation infrastructure, **not a claim of completed comprehension studies**.

### First-1,000 Mandarin meaning screening

The **primary [Mandarin semantic browser](../site/semantic-coverage.html)** and [machine-readable character ledger](../data/semantic/mandarin-1000-v0.1.json) now separate **source intake**, **initial emoji screening**, and **independently verified production**. As of the October 22, 2026 initial screening, all 1,000 ranked characters have a pinned provisional Unihan definition, all 1,000 have completed initial screening (100%), with 881 characters having experimental pictogram candidates and 119 deferred. There are 897 candidate expressions across 881 characters, including separate alternatives for 16 polysemous characters. The next verification phase has now **cross-referenced ranks 1–1,000 (100%)** against a pinned, separately licensed CC-CEDICT dictionary mirror: all 1,000 independent headwords were found; a stricter whole-term audit matched English wording for 649 of 897 experimental sense expressions, leaving 248 for sense alignment, including seven substring-only false positives. **These automated matches are not independently verified translations or emoji approvals.** Human lexical approval, emoji comprehension review, and production verification each remain at 0%. The new [complete 897-sense blind lexical-review queue](../data/semantic/cedict-crossref/full-lexical-review-queue-v0.1.json) makes **every selected meaning** available for source-first checking, including the 649 whole-term matches that still lack independent review; the [lexical worksheet](../site/lexical-review.html) supports all, matched, discrepancy, and priority cohorts without displaying the emoji before judgment. The [prioritized 248-item discrepancy subset](../data/semantic/cedict-crossref/sense-review-queue-v0.1.json) retains preliminary source-grounded desk analysis for all 248 entries (100% of flagged mismatches), with none awaiting initial desk notes; no desk analysis is counted as human approval. It, [review methods and discrepancies](../docs/mandarin-lexical-review.md) and [visible stage-by-stage percentage bars](../site/semantic-coverage.html) distinguish these separate measures. The [methodology](../docs/mandarin-semantic-screening.md) preserves each character's potential senses and explicitly reserves an independent, currently unpopulated whole-word semantic layer, for which toggles can eventually be separate.

