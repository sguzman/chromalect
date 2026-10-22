import assert from "node:assert/strict";
import fs from "node:fs";
import {validateReviewSession} from "./review_session_validate.mjs";
const audit=JSON.parse(fs.readFileSync("data/semantic/cedict-crossref/emoji-visibility-audit-v0.1.json","utf8"));
const queue=JSON.parse(fs.readFileSync("data/semantic/cedict-crossref/sense-review-queue-v0.1.json","utf8"));
const exp=new Date("2026-10-22T00:00:00.000Z").toISOString();
const first=audit.records[0];
const response={
 trialId:first.id,rank:first.rank,character:first.character,
 displayedEmoji:first.emojiDisplay,proposedMeaning:first.selectedMeaning,
 blindResponse:"one",confidence:"medium",predictedKind:"entity",
 targetTypedAsEvent:first.operators.includes("event"),automaticRiskFlags:first.riskFlags,
 clarityRatingAfterReveal:"clear"
};
const trial={
 schema:"chromalect.emoji-comprehension-session.v0.1",
 status:"unverified_exploratory_observations_not_production_review",
 source:{audit:"emoji-visibility-audit-v0.1.json"},
 session:{scope:"all",requestedCount:"20",rated:1,planned:20,localOnly:true,exportedAt:exp},
 answers:[response]
};
assert.deepEqual(validateReviewSession(trial,audit,queue),
 {type:"emoji_comprehension",localObservations:1,productionVerified:0});
const clone=x=>JSON.parse(JSON.stringify(x));
const wrongEmoji=clone(trial);wrongEmoji.answers[0].displayedEmoji="💀";
assert.throws(()=>validateReviewSession(wrongEmoji,audit,queue));
const falseVerb=clone(trial);falseVerb.answers[0].targetTypedAsEvent=!first.operators.includes("event");
assert.throws(()=>validateReviewSession(falseVerb,audit,queue));
const invalidKind=clone(trial);invalidKind.answers[0].predictedKind="verified_action";
assert.throws(()=>validateReviewSession(invalidKind,audit,queue));
const promoted=clone(trial);promoted.answers[0].productionVerified=true;
assert.throws(()=>validateReviewSession(promoted,audit,queue));
const duplicate=clone(trial);duplicate.answers.push(clone(response));
duplicate.session.rated=2;
assert.throws(()=>validateReviewSession(duplicate,audit,queue));
const r=queue.records[0];
const lex={
 schema:"chromalect.lexical-review-observation-session.v0.1",
 status:"local_preliminary_observations_not_independent_lexical_approval",
 source:{queue:"sense-review-queue-v0.1.json",ccCedictLicense:"CC BY-SA 4.0"},
 session:{scope:"all",requestedCount:"20",recorded:1,planned:20,localOnly:true,exportedAt:exp},
 observations:[{
  rank:r.rank,character:r.character,selectedMeaning:r.selectedMeaning,
  originalSourceSegment:r.referenceDefinition,dictionarySource:r.dictionarySource,
  preliminaryJudgment:"uncertain",evidenceRationale:"The independent usage still needs further context.",
  priorityAtIntake:r.priority,lexicalApproval:"not_granted",
  emojiComprehensionApproval:"not_granted",productionVerified:false
 }]
};
assert.deepEqual(validateReviewSession(lex,audit,queue),
 {type:"lexical_source_observation",localObservations:1,productionVerified:0});
const wrongGloss=clone(lex);wrongGloss.observations[0].selectedMeaning="imaginary meaning";
assert.throws(()=>validateReviewSession(wrongGloss,audit,queue));
const claimedApproval=clone(lex);claimedApproval.observations[0].lexicalApproval="verified";
assert.throws(()=>validateReviewSession(claimedApproval,audit,queue));
const noExplanation=clone(lex);noExplanation.observations[0].evidenceRationale="uncertain";
assert.throws(()=>validateReviewSession(noExplanation,audit,queue));
console.log("Review export integrity: both local formats accepted; tampering, duplication and false approval rejected.");
