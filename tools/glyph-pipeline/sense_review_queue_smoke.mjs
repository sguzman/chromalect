// The review queue is engineering triage, never completed linguistic review.
import assert from "node:assert/strict";
import fs from "node:fs";
const root="data/semantic/cedict-crossref/";
const queue=JSON.parse(fs.readFileSync(root+"sense-review-queue-v0.1.json","utf8"));
const strict=JSON.parse(fs.readFileSync(root+"strict-gloss-index-v0.1.json","utf8"));
const ledger=JSON.parse(fs.readFileSync("data/semantic/mandarin-1000-v0.1.json","utf8"));
const manifest=JSON.parse(fs.readFileSync(root+"manifest-v0.1.json","utf8"));
const prev=JSON.parse(fs.readFileSync(root+"triage-0101-0200.json","utf8"));
assert.equal(queue.schema,"chromalect.semantic.lexical-sense-review-queue.v0.1");
assert.equal(queue.status,"unreviewed_prioritization_only");
assert.equal(queue.source.dataLicense,"CC BY-SA 4.0");
assert.equal(queue.source.pinnedRevision,manifest.source.snapshotCommit);
const needs=strict.records.filter(x=>!x.wholeTermMatch);
assert.equal(queue.records.length,needs.length);
assert.equal(queue.records.length,248);
const expected=new Set(needs.map(x=>x.rank+"|"+x.selectedMeaning));
const triaged=new Map(prev.entries.map(x=>[x.rank,x]));
const seen=new Set();
const counter={pendingSenseAlignment:0,high:0,medium:0,unclassified:0,
 substringOnly:0,previouslyTriaged:0};
const priorityOrder={high:0,medium:1,unclassified:2};
let lastPriority=-1;
for(const entry of queue.records){
 const key=entry.rank+"|"+entry.selectedMeaning;
 assert.ok(expected.has(key),"Only strict mismatch entries belong to review queue");
 assert.ok(!seen.has(key),"Do not duplicate sense");
 seen.add(key);
 const orig=ledger.characters[entry.rank-1];
 const canonical=orig.screening.candidates.find(x=>x.selectedMeaning===entry.selectedMeaning);
 assert.equal(entry.character,orig.character);
 assert.equal(entry.referenceDefinition,orig.source.groupCandidates[canonical.sourceGroupIndex]);
 assert.deepEqual(entry.emojiExpression,canonical.expression);
 assert.deepEqual(entry.independentReadings,manifest.records[entry.rank-1].readings);
 assert.equal(entry.productionVerified,false);
 assert.equal(entry.lexicalDecision,"pending");
 assert.equal(entry.visualComprehensionDecision,"pending");
 assert.equal(entry.dictionarySource,"v2/"+entry.character+".json");
 assert.ok(["high","medium","unclassified"].includes(entry.priority));
 assert.ok(priorityOrder[entry.priority]>=lastPriority,"Queue priority order must be stable");
 lastPriority=priorityOrder[entry.priority];
 counter.pendingSenseAlignment++;
 counter[entry.priority]++;
 if(entry.reviewReason==="substring_only_false_match"){
  counter.substringOnly++;
  assert.ok(needs.find(x=>x.rank===entry.rank&&x.selectedMeaning===entry.selectedMeaning).legacySubstringMatch);
 }else assert.equal(entry.reviewReason,"no_whole_term_match");
 const old=triaged.get(entry.rank);
 if(old){
  counter.previouslyTriaged++;
  assert.equal(entry.earlierResearchNote,old.note);
 }else assert.equal(entry.earlierResearchNote,null);
}
assert.deepEqual(counter,{
 pendingSenseAlignment:queue.counts.pendingSenseAlignment,
 high:queue.counts.high,medium:queue.counts.medium,
 unclassified:queue.counts.unclassified,
 substringOnly:queue.counts.substringOnly,
 previouslyTriaged:queue.counts.previouslyTriaged
});
assert.equal(queue.counts.deskAnalyzedHighPriority,15);
assert.equal(queue.counts.independentlyLexicallyApproved,0);
assert.equal(queue.counts.emojiComprehensionApproved,0);
let deskAnalyzed=0;
const analyzedByPriority={high:0,medium:0,unclassified:0};
const allowedActions=new Set([
  "reassess_or_defer","redesign_pictogram","redesign_verb_cue",
  "inspect_existing_alternative","inspect_context"
]);
for(const record of queue.records){
 const analysis=record.deskAnalysis;
 assert.ok(analysis,"All 248 flagged senses must have a preliminary desk assessment");
 assert.equal(analysis.status,
   "assistant_preliminary_analysis_not_independent_lexical_review");
 assert.ok(allowedActions.has(analysis.provisionalNextAction),
   "Every assessment must specify a recognizable next step");
 assert.ok(typeof analysis.observation==="string"&&analysis.observation.length>40);
 assert.equal(analysis.reviewerIndependent,false,
   "All desk notes are assistant preliminary work, not independent review");
 assert.equal(analysis.sourceBasis,"pinned_CC-CEDICT_headword_plus_Unihan_candidate");
 assert.ok(analysis.sourceExcerpt?.length>5,
   "Every note must preserve independent dictionary evidence");
 assert.equal(record.lexicalDecision,"pending",
   "Preliminary assistant analysis must not produce lexical approval");
 assert.equal(record.visualComprehensionDecision,"pending",
   "Preliminary assistant analysis must not produce emoji approval");
 assert.equal(record.productionVerified,false);
 analyzedByPriority[record.priority]++;
 deskAnalyzed++;
}
assert.equal(analyzedByPriority.high,queue.counts.deskAnalyzedHighPriority);
assert.equal(analyzedByPriority.medium,queue.counts.deskAnalyzedMediumPriority);
assert.equal(analyzedByPriority.unclassified,queue.counts.deskAnalyzedUnclassified);
assert.equal(deskAnalyzed,queue.counts.deskAnalyzedTotal);
assert.equal(queue.counts.deskAnalysisPending,queue.records.length-deskAnalyzed);
assert.equal(deskAnalyzed,248);
assert.equal(queue.counts.independentlyLexicallyApproved,0);
assert.equal(queue.counts.emojiComprehensionApproved,0);
assert.equal(seen.size,needs.length);
assert.equal(counter.substringOnly,7);
assert.equal(counter.high,15);
assert.equal(counter.medium,11);
assert.equal(counter.unclassified,222);
assert.equal(counter.previouslyTriaged,19);
assert.equal(strict.scope.independentHumanApproved,0);
assert.equal(strict.scope.emojiComprehensionApproved,0);
assert.equal(manifest.metrics.productionVerified,0);
console.log("Sense-review queue: 248 flagged, 248 preliminary desk assessments (100%), 0 pending desk notes, 0 independently approved.");
