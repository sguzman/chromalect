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
const full=JSON.parse(fs.readFileSync(
 "data/semantic/cedict-crossref/full-lexical-review-queue-v0.1.json","utf8"));
assert.equal(full.records.length,897);
const matched=full.records.find(x=>x.strictWholeTermMatch);
const mismatch=full.records.find(x=>!x.strictWholeTermMatch);
const v2record=(x)=>({
 rank:x.rank,character:x.character,selectedMeaning:x.selectedMeaning,
 originalSourceSegment:x.referenceDefinition,dictionarySource:x.dictionarySource,
 preliminaryJudgment:"uncertain",evidenceRationale:"Needs a Chinese source context and independent lexical review.",
 priorityAtIntake:x.priority,strictWholeTermMatchAtIntake:x.strictWholeTermMatch,
 lexicalApproval:"not_granted",emojiComprehensionApproval:"not_granted",productionVerified:false
});
const v2=(scope,record)=>({
 schema:"chromalect.lexical-review-observation-session.v0.2",
 status:"local_preliminary_observations_not_independent_lexical_approval",
 source:{queue:"full-lexical-review-queue-v0.1.json",ccCedictLicense:"CC BY-SA 4.0"},
 session:{scope,requestedCount:"20",recorded:1,planned:20,localOnly:true,exportedAt:exp},
 observations:[v2record(record)]
});
for(const [scope,record] of [["matched",matched],["flagged",mismatch],["all",matched]]){
 assert.deepEqual(validateReviewSession(v2(scope,record),audit,queue,full),
  {type:"lexical_source_observation",localObservations:1,productionVerified:0});
}
assert.throws(()=>validateReviewSession(v2("matched",mismatch),audit,queue,full));
assert.throws(()=>validateReviewSession(v2("flagged",matched),audit,queue,full));
assert.throws(()=>validateReviewSession(v2("matched",matched),audit,queue));
const falseApproval=clone(v2("all",matched));
falseApproval.observations[0].lexicalApproval="approved";
assert.throws(()=>validateReviewSession(falseApproval,audit,queue,full));
const distorted=clone(v2("all",matched));
distorted.observations[0].strictWholeTermMatchAtIntake=false;
assert.throws(()=>validateReviewSession(distorted,audit,queue,full));
const duplicated=clone(v2("all",matched));
duplicated.observations.push(clone(duplicated.observations[0]));
duplicated.session.recorded=2;
assert.throws(()=>validateReviewSession(duplicated,audit,queue,full));
const leaked=clone(v2("all",matched));
leaked.observations[0].emoji="🍎";
assert.throws(()=>validateReviewSession(leaked,audit,queue,full));
console.log("Review export integrity: all 897 v0.2 lexical candidates, legacy v0.1 sessions, independent emoji studies, tampering and false promotion checked.");

