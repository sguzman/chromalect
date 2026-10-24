# Tatoeba text reuse assessment for 27 selected Mandarin sentence IDs

**Scope and date:** This assessment correlates the 27 [previously observed individual live API licenses](../data/semantic/cedict-crossref/tatoeba-live-word-record-audit-summary-v0.1.json), checked on **2026-10-23**, with independent publisher and Creative Commons policies reviewed on **2026-10-24**. It is **not** a new live query and does not cover the remaining, unselected sentence IDs in the corpus acquisition cohorts.

## Independently checked policies

- Tatoeba's [text corpus reuse instructions](https://en.wiki.tatoeba.org/articles/show/using-the-tatoeba-corpus) describe CC BY 2.0 France as the default license for textual sentences and require attribution; audio has separate licensing.
- Tatoeba's [attribution FAQ](https://en.wiki.tatoeba.org/articles/show/faq) asks reusers to identify Tatoeba, link the source and identify the CC BY 2.0 FR terms.
- Creative Commons' [CC BY 2.0 France license deed](https://creativecommons.org/licenses/by/2.0/fr/deed.en) permits redistribution and adaptation with attribution, the license link and any applicable modification notice, without implying creator endorsement. The terms are subject to the licensor having appropriate rights; additional privacy or other rights may apply.

## Verified per-record attributes

The [source-linked matrix](../data/semantic/cedict-crossref/tatoeba-text-reuse-conditions-v0.1.json) covers **27/27** selected sentence IDs and **20** attributed public contributor usernames. Each item has its original sentence URL, pinned text fingerprint, observed CC BY 2.0 FR license label, author credit, direct license URI, and requirements for changes and nonendorsement. A previous [source integrity workflow](https://github.com/sguzman/chromalect/actions/runs/39953177354) matched the 27 owners and text hashes against the pinned source. The reproducible [cross-source generator](../tools/glyph-pipeline/tatoeba_text_reuse_conditions.mjs) refuses missing IDs, inconsistent authors and links, nonmatching observed licenses, or silently promoted linguistic/rights claims.

For any authorized *future* display of unchanged text, an attribution should identify the individual contributor, link to the exact Tatoeba sentence, identify Tatoeba as the source, and link to CC BY 2.0 FR. Adaptations require an additional modification notice. Attribution metadata alone is not evidence of a correct translation, verified pronunciation or original third-party copyright title.

**No sentence text is reproduced by this audit.**

## Explicitly unresolved

- These are **conditional license assessments**, not unconditional publication clearances. Licensing labels observed on October 23 could change, and no independent investigation established that every contributor originated the content rather than importing protected third-party material. Recheck the specific sentence, its current licensing state, and attribution before any quotation.
- The assessments cover only 27 selected examples, not the other source-acquired sentence candidates.
- No phrase segmentation, reading, lexical sense, historical/decomposition ownership, or pictogram was promoted.
- The roadmap's independent reuse-permission / no quotation before clearance gate remains pending for broader publication and remaining sentences; conditional identification does not close it.

**Machine evidence:** 27 observed compatible text labels, 27 matching original URLs, 20 contributors, zero unconditional quotation clearances, zero independently verified contextual readings, zero lexical-sense approvals.
