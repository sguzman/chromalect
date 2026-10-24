# Static versus one-shot semantic / articulatory recall — experimental instrument

This instrument advances the unfinished Phase 3 requirement to test **reduced-motion
semantic/articulatory animation against an otherwise identical static treatment**. It
is added to the existing [one-shot motion comparison page](../site/mandarin-motion-pretrial.html)
without changing the original noncollecting demonstration.

## Pinned source units and paired design

- Four distinct **provisional** Mandarin semantic-event pictogram expressions are selected
  from the same 1,000-character Unihan screening data used by the original motion pretrial.
  Four distinct provisional Pinyin initial articulatory *places* come from the existing
  21-consonantal-initial working feature codebook. The selected units are all marked
  unadjudicated; no word meaning or speech sound is promoted.
- Every one of these **eight** source candidates is presented **twice**, once under an
  assigned static condition and once with a **manually initiated one-shot** sequential
  visual reveal. The session randomizes presentation order, yielding exactly
  **4 semantic × 2 + 4 articulatory × 2 = 16** source observations.
- For semantics, the source's pictogram/operator expression is the cue; the participant
  chooses among four source-derived candidate meaning labels *after concealing* the
  stimulus. For articulatory prompts, the cue presents the original feature-place,
  manner and aspiration terms; participants recall the *place* from four distinct
  source feature-place labels. **There is no original Chinese character or Pinyin
  spelling shown as an answer cue in the semantic condition.**
- The dynamic and static conditions expose identical textual/pictographic source
  tokens in the same order, but one uses the existing CSS finite one-shot animation.
  No animation ever autoplays. With `prefers-reduced-motion: reduce`, the browser
  makes every exposure static and records that distinction from the assigned condition.

The respondent explicitly opts in and chooses when to show and hide each cue.
Intermediate correct answers and scores are withheld until the final trial.
A local-only JSON response record includes source keys, assigned versus effective
presentation, four strata counts, and per-trial choices. There is **no automatic
storage, submission, participant identity, timing capture or device fingerprinting**.

## Scientific limitations and unresolved approval

The test is currently an **unvalidated opt-in self-assessment instrument**, not
a recruited human trial, preregistered design or clinical/educational finding.
Voluntary self-paced exposure is not equivalent to calibrated presentation time.
The four candidate pictograms are neither independently approved lexical senses
nor externally accepted visual symbols. Revealed articulatory labels are mnemonic
cues and do **not** represent measured lip/tongue movements. Articulation recall
is not the same as phonemic production or sound recognition. A reduced-motion
session has no actually animated observations and cannot estimate a motion effect.
The task does not measure long-term retention, transfer or generalizable learning.

The [interactive code](../site/mandarin-motion-recall-trial.js) and
[acceptance test](../tools/glyph-pipeline/mandarin_motion_recall_trial_smoke.mjs)
cover balanced condition assignment, conceal-before-answer flow, source-only
alternatives, 16 responses, original source-bound approval flags, reduced-motion
override, local export and zero automatic network collection. The regression
test generates **synthetic** answers solely to verify software behavior.

**Evidence at publication:** 16/16 instrument trial paths machine-tested;
**0** independently recruited respondents, **0** independently validated
semantic/phonetic effects, **0** accessibility preference evaluation outcomes,
**0** calibrated movement trajectories and **0** retention/transfer findings.
The full Phase 3 experimental checkpoint remains open.
