# Blind contour-only recognition assessment — protocol and limits

**Purpose.** This instrument operationalizes the unfinished Phase 2 requirement to test
idealized Mandarin citation-tone contours *without* an initial, final, Pinyin syllable,
original Chinese glyph, sound recording, lexical meaning, or color cue. The separate
eight-prompt feedback-based practice widget remains available, but **is not treated as an
assessment**.

## Trial procedure

The assessment uses the four source-backed idealized pitch-level targets from
[the frozen citation-tone reference](../data/phonetics/mandarin-citation-tone-contours-v0.1.json):
T1 (5–5), T2 (3–5), T3 (2–1–4), T4 (5–1). Neutral tone has no fixed
context-independent contour and is excluded rather than represented fictitiously.

The browser requires affirmative participant opt-in before starting. The program generates
**16 trials**: four balanced blocks with each of four tone categories exactly once per
block, independently shuffled answer-button order, and no immediate repetition across
blocks. The presentation is a black/white or theme-neutral stroke drawn only from the
published relative-pitch levels. Participants select T1–T4. The correct category is never
displayed between presentations. No timestamp, response latency, login, name, email,
demographic information or fingerprint is recorded. At the end, the current session
calculates a confusion record, count correct out of sixteen and per-tone counts. A
JSON report is rendered in a local readonly field for optional participant copying.
It is **not uploaded, automatically stored, or retained across reloads**.

[Browser implementation](../site/mandarin-tone-blind-assessment.js) and
[adversarial acceptance test](../tools/glyph-pipeline/mandarin_tone_blind_assessment_smoke.mjs)
check trial balancing, absence of segmental cues, opt-in gating, no intermediate score leaks,
strict source contour matching, session-only export, and refusal of fabricated scientific
approval. The test **simulates user responses**; it is not a human observation.

## Scientific interpretation

This is an **unvalidated volunteer self-assessment instrument**, not a completed controlled
perceptual experiment, phoneme test, musical-pitch calibration, learning trial or evidence
that Chromalect improves decoding. Without preregistered eligibility, independent
participant recruitment, environment control, consent/ethics review where required,
a baseline/comparator arm, and actual data collected from people, the results must not
be interpreted as a population statistic. A 16-trial curve-to-label score cannot establish
acoustic Mandarin tone recognition; the shape itself is a schematic transcription.

The project has **0 independently verified human tone-discrimination results**, **0
independently verified auditory tone realizations**, and **0 educational transfer
outcomes**. Future research may use this source-separated presentation as a candidate
stimulus, but its current existence does not fulfill the scientific acceptance gate.
No existing tone color, source reading, original Chinese glyph, component identity or
sound-segment inventory is modified.
