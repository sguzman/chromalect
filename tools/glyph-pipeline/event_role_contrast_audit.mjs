// Deterministic role-contrast audit: emoji reuse is permitted and expected.
// Automated visual-structure findings are NOT independent comprehension review.
import assert from "node:assert/strict";
import fs from "node:fs";
const path="data/semantic/cedict-crossref/";
const reuse=JSON.parse(fs.readFileSync(path+"visual-form-reuse-v0.1.json","utf8"));
const audit=JSON.parse(fs.readFileSync(path+"emoji-visibility-audit-v0.1.json","utf8"));
assert.equal(reuse.summary.candidateSenseExpressions,897);
assert.equal(audit.summary.auditedExpressions,897);
const byId=new Map(audit.records.map(x=>[x.id,x]));
assert.equal(byId.size,audit.records.length);
const forms=reuse.repeatedForms.filter(x=>x.mixesTypedEventAndNonEvent).map(group=>{
 const records=group.records.map(r=>{
  const a=byId.get(r.id);
  assert.ok(a && a.emojiDisplay===group.emoji,"Audit mismatch "+r.id);
  assert.equal(a.operators.includes("event"),r.typedEvent);
  return {id:r.id,rank:r.rank,character:r.character,selectedMeaning:r.meaning,
    typedEvent:r.typedEvent,wholeTermDictionaryMatch:a.wholeTermDictionaryMatch};
 });
 const count=records.filter(r=>r.typedEvent).length;
 assert.equal(group.assignmentCount,records.length);
 assert.ok(count>0 && count<records.length);
 return {emoji:group.emoji,assignmentCount:group.assignmentCount,distinctMeaningCount:group.distinctMeaningCount,
  eventAssignments:count,nonEventAssignments:records.length-count,
  studyPriority:records.length>=5&&Math.min(count,records.length-count)>=2?"contrast_focus":"standard",
  records};
});
const summary={
 sourceCandidateExpressions:audit.records.length,
 distinctVisualForms:reuse.summary.distinctVisibleEmojiForms,
 mixedEventNonEventForms:forms.length,
 assignmentsInMixedForms:forms.reduce((n,f)=>n+f.assignmentCount,0),
 eventAssignmentsInMixedForms:forms.reduce((n,f)=>n+f.eventAssignments,0),
 nonEventAssignmentsInMixedForms:forms.reduce((n,f)=>n+f.nonEventAssignments,0),
 contrastFocusForms:forms.filter(f=>f.studyPriority==="contrast_focus").length,
 humanLexicalApproved:0,humanEmojiComprehensionApproved:0,productionVerified:0
};
const result={
 schema:"chromalect.semantic.event-non-event-contrast-audit.v0.1",
 status:"automated_cross_role_visibility_inventory_not_evidence_of_incorrectness",
 source:{reuse:"visual-form-reuse-v0.1.json",visibility:"emoji-visibility-audit-v0.1.json",
  sourceLicense:"Derived metadata; dictionary data retain CC BY-SA 4.0 provenance"},
 interpretation:[
  "Reused emoji across different Mandarin characters are normal and not a semantic uniqueness failure.",
  "An expression may be an appropriate cue even when it is used for both an action and an entity elsewhere.",
  "A typed event is not automatically distinguishable from a non-event in the emoji-only view.",
  "This inventory flags a contrast that requires controlled interpretation testing, not an incorrect translation.",
  "Contrast-focus priority is based solely on group size and presence of multiple samples on both sides."
 ],summary,forms
};
assert.equal(summary.sourceCandidateExpressions,897);
assert.equal(summary.mixedEventNonEventForms,73);
assert.equal(summary.assignmentsInMixedForms,341);
assert.equal(summary.contrastFocusForms,16);
assert.equal(summary.humanLexicalApproved,0);
assert.equal(summary.humanEmojiComprehensionApproved,0);
assert.equal(summary.productionVerified,0);
const target=path+"event-role-contrast-audit-v0.1.json";
if(process.argv.includes("--check")){
 assert.deepEqual(JSON.parse(fs.readFileSync(target,"utf8")),result,
  "Committed role-contrast audit differs from generated data");
 console.log("Event/non-event visual contrast audit verified: "+
  summary.mixedEventNonEventForms+" forms, "+
  summary.assignmentsInMixedForms+" assignments, "+
  summary.contrastFocusForms+" contrast-focus forms.");
}else{
 fs.writeFileSync(target,JSON.stringify(result,null,2)+"\n");
 console.log("Updated "+target);
}