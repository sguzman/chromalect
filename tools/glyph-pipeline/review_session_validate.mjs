// Validate local study exports against pinned Chromalect source identities.
// Validation is NOT production semantic approval or human review.
import assert from "node:assert/strict";
import fs from "node:fs";
import {pathToFileURL} from "node:url";

const confidence=new Set(["unsure","low","medium","high"]);
const clarity=new Set(["clear","partial","misleading","uncertain"]);
const kinds=new Set(["unsure","action","entity","property","relation","other"]);
const lexical=new Set(["supported","unsupported","uncertain"]);

export function validateReviewSession(session,audit,queue,fullQueue=null){
 assert.ok(session&&typeof session==="object"&&!Array.isArray(session));
 assert.equal(session.session?.localOnly,true,"Only explicitly local-only exports are supported");
 assert.ok(typeof session.session?.exportedAt==="string"&&!Number.isNaN(Date.parse(session.session.exportedAt)));
 if(session.schema==="chromalect.emoji-comprehension-session.v0.2"){
  assert.equal(session.status,"unverified_exploratory_observations_not_production_review");
  assert.equal(session.source?.audit,"emoji-visibility-audit-v0.1.json");
  assert.equal(audit.schema,"chromalect.semantic.emoji-visibility-audit.v0.1");
  assert.equal(audit.summary.proposedExpressions,897);
  assert.equal(audit.summary.humanLexicalApproved,0);
  assert.equal(audit.summary.humanEmojiComprehensionApproved,0);
  assert.equal(audit.summary.productionVerified,0);
  assert.ok(Array.isArray(session.answers)&&session.answers.length>=1);
  assert.equal(session.session.rated,session.answers.length);
  assert.ok(["all","flagged","events","compositions","mixedRoles"].includes(session.session.scope));
  assert.ok(["distinct","allow"].includes(session.session.repeatPolicy));
  const roleMap=new Map();
  for(const rec of audit.records){
   const state=roleMap.get(rec.emojiDisplay)||{event:false,nonEvent:false};
   if(rec.operators.includes("event"))state.event=true;
   else state.nonEvent=true;
   roleMap.set(rec.emojiDisplay,state);
  }
  const mixed=new Set([...roleMap].filter(([_,r])=>r.event&&r.nonEvent).map(([emoji])=>emoji));
  const pool=audit.records.filter(rec=>
   session.session.scope==="all"||
   (session.session.scope==="flagged"&&rec.riskFlags.length>0)||
   (session.session.scope==="events"&&rec.operators.includes("event"))||
   (session.session.scope==="mixedRoles"&&mixed.has(rec.emojiDisplay))||
   (session.session.scope==="compositions"&&rec.emojiCount>1));
  const maximum=session.session.repeatPolicy==="distinct"
   ?new Set(pool.map(rec=>rec.emojiDisplay)).size:pool.length;
  assert.ok(session.session.planned>=session.answers.length&&
    session.session.planned<=maximum&&maximum<=897);
  const refs=new Map(pool.map(r=>[r.id,r]));
  const seen=new Set(),visuals=new Set();
  for(const x of session.answers){
   const actual=refs.get(x.trialId);
   assert.ok(actual,"Unknown emoji trial for declared scope");
   assert.ok(!seen.has(x.trialId),"Duplicate emoji trial");
   seen.add(x.trialId);
   if(session.session.repeatPolicy==="distinct"){
    assert.ok(!visuals.has(actual.emojiDisplay),
     "Distinct visual form policy violated by repeated emoji");
    visuals.add(actual.emojiDisplay);
   }
   assert.equal(x.rank,actual.rank);
   assert.equal(x.character,actual.character);
   assert.equal(x.displayedEmoji,actual.emojiDisplay);
   assert.equal(x.proposedMeaning,actual.selectedMeaning);
   assert.deepEqual(x.automaticRiskFlags,actual.riskFlags);
   assert.ok(typeof x.blindResponse==="string"&&x.blindResponse.length<=15000);
   assert.ok(confidence.has(x.confidence));
   assert.ok(kinds.has(x.predictedKind));
   assert.equal(x.targetTypedAsEvent,actual.operators.includes("event"));
   assert.ok(clarity.has(x.clarityRatingAfterReveal));
   assert.equal(actual.independentLexicalReview,"pending");
   assert.equal(actual.independentEmojiComprehensionReview,"pending");
   assert.equal(actual.productionVerified,false);
   assert.ok(!("productionVerified" in x)&&!("lexicalApproval" in x),
    "Local exploratory answers must not assert production approval");
  }
  return {type:"emoji_comprehension",localObservations:session.answers.length,productionVerified:0};
 }
 if(session.schema==="chromalect.emoji-comprehension-session.v0.1"){
  assert.equal(session.status,"unverified_exploratory_observations_not_production_review");
  assert.equal(session.source?.audit,"emoji-visibility-audit-v0.1.json");
  assert.equal(audit.schema,"chromalect.semantic.emoji-visibility-audit.v0.1");
  assert.equal(audit.summary.proposedExpressions,897);
  assert.ok(Array.isArray(session.answers)&&session.answers.length>=1);
  assert.equal(session.session.rated,session.answers.length);
  assert.ok(session.session.planned>=session.answers.length&&session.session.planned<=897);
  assert.ok(["all","flagged","events","compositions"].includes(session.session.scope));
  const refs=new Map(audit.records.map(r=>[r.id,r]));
  const seen=new Set();
  for(const x of session.answers){
   const actual=refs.get(x.trialId);
   assert.ok(actual,"Unknown emoji trial");
   assert.ok(!seen.has(x.trialId),"Duplicate emoji trial");
   seen.add(x.trialId);
   assert.equal(x.rank,actual.rank);
   assert.equal(x.character,actual.character);
   assert.equal(x.displayedEmoji,actual.emojiDisplay);
   assert.equal(x.proposedMeaning,actual.selectedMeaning);
   assert.deepEqual(x.automaticRiskFlags,actual.riskFlags);
   assert.ok(typeof x.blindResponse==="string"&&x.blindResponse.length<=15000);
   assert.ok(confidence.has(x.confidence));
   assert.ok(kinds.has(x.predictedKind));
   assert.equal(x.targetTypedAsEvent,actual.operators.includes("event"));
   assert.ok(clarity.has(x.clarityRatingAfterReveal));
   assert.equal(actual.independentLexicalReview,"pending");
   assert.equal(actual.independentEmojiComprehensionReview,"pending");
   assert.equal(actual.productionVerified,false);
   assert.ok(!("productionVerified" in x) && !("lexicalApproval" in x),
    "Comprehension exports cannot assert canonical approval fields");
  }
  return {type:"emoji_comprehension",localObservations:session.answers.length,productionVerified:0};
 }
 if(["chromalect.lexical-review-observation-session.v0.2",
     "chromalect.lexical-review-observation-session.v0.3"].includes(session.schema)){
  const v3=session.schema.endsWith(".v0.3");
  assert.ok(fullQueue&&fullQueue.schema==="chromalect.semantic.full-lexical-review-queue.v0.1",
   "A pinned all-senses queue is required for v0.2 observations");
  assert.equal(fullQueue.status,"unreviewed_source_first_all_candidate_senses");
  assert.equal(fullQueue.counts.total,897);
  assert.equal(fullQueue.counts.independentLexicalApproved,0);
  assert.equal(fullQueue.counts.independentEmojiApproved,0);
  assert.equal(fullQueue.counts.productionVerified,0);
  assert.equal(session.status,"local_preliminary_observations_not_independent_lexical_approval");
  assert.equal(session.source?.queue,"full-lexical-review-queue-v0.1.json");
  assert.equal(session.source?.ccCedictLicense,"CC BY-SA 4.0");
  assert.ok(Array.isArray(session.observations)&&session.observations.length>=1);
  assert.equal(session.session.recorded,session.observations.length);
  assert.ok(session.session.planned>=session.observations.length&&session.session.planned<=897);
  assert.ok(["all","flagged","matched","high","medium","unclassified",
    ...(v3?["multiple_readings","polysemy_high","reading_subset"]:[])].includes(session.session.scope));
  const refs=new Map(fullQueue.records.map(r=>[r.rank+"|"+r.selectedMeaning,r]));
  const seen=new Set();
  for(const x of session.observations){
   const key=x.rank+"|"+x.selectedMeaning,actual=refs.get(key);
   assert.ok(actual,"Unknown source-first lexical candidate");
   assert.ok(!seen.has(key),"Repeated lexical candidate");
   seen.add(key);
   assert.equal(x.character,actual.character);
   assert.equal(x.originalSourceSegment,actual.referenceDefinition);
   assert.equal(x.dictionarySource,actual.dictionarySource);
   assert.equal(x.priorityAtIntake,actual.priority);
   assert.equal(x.strictWholeTermMatchAtIntake,actual.strictWholeTermMatch);
   if(v3){
    assert.ok(Array.isArray(actual.dictionaryReadings)&&actual.dictionaryReadings.length>0);
    assert.ok(actual.dictionaryReadings.includes(x.readingSelection)||
     x.readingSelection==="undetermined"||
     (x.readingSelection==="multiple"&&actual.dictionaryReadings.length>1),
     "Reading must come from pinned dictionary or be explicitly unresolved");
    if(session.session.scope==="reading_subset")
     assert.ok(actual.matchingDictionaryReadings.length>0&&
      actual.matchingDictionaryReadings.length<actual.dictionaryReadings.length);
    if(session.session.scope==="multiple_readings")
     assert.ok(actual.dictionaryReadings.length>1);
    if(session.session.scope==="polysemy_high")
     assert.ok(actual.dictionaryReadings.length>1&&
      actual.dictionaryExcerpt.split(";").filter(s=>s.trim()).length>=8);
   }
   assert.ok(lexical.has(x.preliminaryJudgment));
   assert.ok(typeof x.evidenceRationale==="string"&&
    x.evidenceRationale.trim().length>=12&&x.evidenceRationale.length<=15000);
   assert.equal(x.lexicalApproval,"not_granted");
   assert.equal(x.emojiComprehensionApproval,"not_granted");
   assert.equal(x.productionVerified,false);
   assert.ok(!("emojiExpression" in x)&&!("emoji" in x),
    "Blind lexical observations must not embed the pictogram");
   assert.equal(actual.lexicalDecision,"pending");
   assert.equal(actual.visualComprehensionDecision,"pending");
   assert.equal(actual.productionVerified,false);
   if(session.session.scope==="flagged")assert.equal(actual.strictWholeTermMatch,false);
   if(session.session.scope==="matched")assert.equal(actual.strictWholeTermMatch,true);
   if(["high","medium","unclassified"].includes(session.session.scope))
    assert.equal(actual.priority,session.session.scope);
  }
  return {type:"lexical_source_observation",localObservations:session.observations.length,productionVerified:0};
 }
 if(session.schema==="chromalect.lexical-review-observation-session.v0.1"){
  assert.equal(session.status,"local_preliminary_observations_not_independent_lexical_approval");
  assert.equal(session.source?.queue,"sense-review-queue-v0.1.json");
  assert.equal(session.source?.ccCedictLicense,"CC BY-SA 4.0");
  assert.equal(queue.schema,"chromalect.semantic.lexical-sense-review-queue.v0.1");
  assert.equal(queue.counts.pendingSenseAlignment,248);
  assert.ok(Array.isArray(session.observations)&&session.observations.length>=1);
  assert.equal(session.session.recorded,session.observations.length);
  assert.ok(session.session.planned>=session.observations.length&&session.session.planned<=248);
  assert.ok(["all","high","medium","unclassified"].includes(session.session.scope));
  const refs=new Map(queue.records.map(r=>[r.rank+"|"+r.selectedMeaning,r]));
  const seen=new Set();
  for(const x of session.observations){
   const key=x.rank+"|"+x.selectedMeaning,actual=refs.get(key);
   assert.ok(actual,"Unknown lexical review candidate");
   assert.ok(!seen.has(key),"Repeated lexical review candidate");
   seen.add(key);
   assert.equal(x.character,actual.character);
   assert.equal(x.originalSourceSegment,actual.referenceDefinition);
   assert.equal(x.dictionarySource,actual.dictionarySource);
   assert.equal(x.priorityAtIntake,actual.priority);
   assert.ok(lexical.has(x.preliminaryJudgment));
   assert.ok(typeof x.evidenceRationale==="string"&&
    x.evidenceRationale.trim().length>=12&&x.evidenceRationale.length<=15000);
   assert.equal(x.lexicalApproval,"not_granted");
   assert.equal(x.emojiComprehensionApproval,"not_granted");
   assert.equal(x.productionVerified,false);
   assert.equal(actual.lexicalDecision,"pending");
   assert.equal(actual.productionVerified,false);
  }
  return {type:"lexical_source_observation",localObservations:session.observations.length,productionVerified:0};
 }
 throw new TypeError("Unknown, unversioned or non-local review export");
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const file=process.argv[2];
 if(!file)throw new Error("Supply path to a local Chromalect review JSON export");
 const session=JSON.parse(fs.readFileSync(file,"utf8"));
 const audit=JSON.parse(fs.readFileSync("data/semantic/cedict-crossref/emoji-visibility-audit-v0.1.json","utf8"));
 const queue=JSON.parse(fs.readFileSync("data/semantic/cedict-crossref/sense-review-queue-v0.1.json","utf8"));
 const fullQueue=JSON.parse(fs.readFileSync(
  "data/semantic/cedict-crossref/full-lexical-review-queue-v0.1.json","utf8"));
 const result=validateReviewSession(session,audit,queue,fullQueue);
 console.log("Valid local observation export ("+result.type+"): "+
  result.localObservations+" records. Production approvals: 0.");
}
