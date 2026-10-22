# First-1,000 Mandarin semantic screening: completion and review gates

**Screening status:** complete across all 1,000 fixed character ranks. **Production-verified semantics:** none.

The semantic screening ledger is [machine-readable JSON](../data/semantic/mandarin-1000-v0.1.json) and uses the source definitions and provisional licensing detailed in [the screening method](mandarin-semantic-screening.md). Semantic records do **not** alter the completed component identities, glyph ownership, Pinyin initials/finals, tones, or navigation.

| Measure | Initial-pass result |
| --- | ---: |
| Ranked characters with pinned Unihan definition source | 1,000 / 1,000 (100%) |
| Ranked characters with a screening decision | 1,000 / 1,000 (100%) |
| Characters with at least one emoji-expression candidate | 881 / 1,000 (88.1%) |
| Characters with explicit pictogram deferral | 119 / 1,000 (11.9%) |
| Candidate sense-expression assignments | 897 |
| Characters with more than one selected sense expression | 16 |
| Characters with independently verified production senses | 0 / 1,000 (0%) |
| Word-level senses with completed source review | 0 |

**Coverage means an initial decision on whether an illustrative semantic cue is plausible for a selected definition group, not complete sense-level or lexical coverage.** A single source definition can hide many usages, some misleading or archaic. The selected pictograms are not confirmed modern Mandarin glosses, tested learner cues, or necessarily intuitive cross-cultural signs. The Unihan source snapshot is draft-review data rather than a sufficient Mandarin dictionary or usage corpus.

## Initial candidate-quality review

The first pass was checked for internal traceability to an actual Unihan definition group, valid emoji grammar structure, rank/character alignment, source licensing, and consistency of candidate, abstention, and pending counts. An additional pictogram-fidelity audit withdrew 13 candidates that depicted an inaccurate object (for example, liver depicted by a heart emoji or a carpenter's plane depicted by a saw), and avoided assigning unhelpful symbols to other difficult concepts. Two dam-related senses use the associative water/barrier cue 🌊🧱, retaining its experimental status. The horn candidate for 角 was withdrawn while preserving its separate angle expression.

These checks are **engineering and preliminary curation**, not independent language expertise or human comprehension evaluation. No semantic entry was promoted to production.

## Next acceptance queue

1. Confirm current Mandarin character senses and usage frequency against independently licensed language dictionaries and corpora. Review polysemy rather than accepting one-sense coverage.
2. Review each expression for semantic correctness, pictographic clarity, interpretive ambiguity, culture/locale variance, and accessibility. Replace misleading icons or keep the deferral.
3. Retain character-level metaphor and word-level lexical meaning as independent future semantic layers. Whole-word meanings are not part of the first-1,000-character screening.
4. Promote a semantic mapping to production only after both lexical evidence and visual interpretation pass appropriate independent reviews; increment production coverage only then.

The [interactive character coverage viewer](../site/semantic-coverage.html) reports these distinctions, and the repository's semantic inventory and browser smoke checks protect the completed rank range and zero-production-verification boundary.
