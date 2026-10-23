# Isolated Mandarin citation-tone channel machine audit

This research audit tests **source label correspondence and formal visual contour separability**, not actual Mandarin speech or human tone recognition. It remains independent of the initial-feature and written-final experimental representations.

Across the pinned 1,171 first-tranche citation readings, the original written tone labels occur as: **T0 10; T1 304; T2 252; T3 223; T4 382**. The four *non-neutral* reference shapes remain distinct idealized Chao contour sequences (55, 35, 214, 51); **T0 has no context-free contour assignment**. Numbers are relative pitch-level conventions, not Hz measurements or recordings.

The [machine audit](../data/phonetics/citation-tone-isolation-audit-v0.1.json) checks all five source label counts, each published tone exemplar's source identity, exact palette symbol correspondence, four unique encoded relative contour sequences, and zero evidence approvals. Its [builder](../tools/glyph-pipeline/citation_tone_isolation_audit.mjs) is deterministic and must pass `--check` in the Pages workflow. It does **not** consult or infer vowel or consonantal feature assignments.

A pair of unequal encoded lines is not automatically perceptually distinguishable. Full or partial third-tone realization, neutral-tone placement and connected-speech sandhi are **not** validated by citation-form line drawings. Independent acoustic and human-perception tests remain mandatory before closing the phonetic tone research checkpoint.
