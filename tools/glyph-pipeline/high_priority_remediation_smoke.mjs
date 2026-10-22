import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const p="data/semantic/cedict-crossref/";
const overlay=JSON.parse(fs.readFileSync(p+"high-priority-remediation-v0.1.json","utf8"));
const queue=JSON.parse(fs.readFileSync(p+"sense-review-queue-v0.1.json","utf8"));
const semantic=JSON.parse(fs.readFileSync("data/semantic/mandarin-1000-v0.1.json","utf8"));
const source=fs.readFileSync("site/semantic-grammar.js","utf8");
const context={};context.globalThis=context;
vm.runInNewContext(source,context);
const grammar=context.ChromalectSemanticGrammar;
assert.equal(overlay.schema,"chromalect.semantic.high-priority-remediation.v0.1");
assert.equal(overlay.status,"provisional_hypotheses_no_canonical_replacements");
assert.equal(overlay.source.license,"CC BY-SA 4.0");
assert.equal(overlay.records.length,15);
const highs=queue.records.filter(r=>r.priority==="high");
assert.equal(highs.length,15);
assert.deepEqual(overlay.records.map(x=>x.rank),highs.map(x=>x.rank));
let trials=0,abstentions=0,typedVerbs=0;
for(let i=0;i<highs.length;i++){
 const entry=overlay.records[i],sourceRow=highs[i];
 assert.equal(entry.rank,sourceRow.rank);
 assert.equal(entry.character,sourceRow.character);
 assert.equal(entry.originalSelectedMeaning,sourceRow.selectedMeaning);
 assert.deepEqual(entry.originalExpression,sourceRow.emojiExpression);
 assert.equal(entry.sourceStatus,"preliminary_assistant_hypothesis");
 assert.equal(entry.independentLexicalApproval,"pending");
 assert.equal(entry.independentEmojiComprehensionApproval,"pending");
 assert.equal(entry.productionVerified,false);
 assert.ok(entry.caution.length>=65);
 assert.equal(semantic.characters[entry.rank-1].character,entry.character);
 assert.ok(semantic.characters[entry.rank-1].screening.candidates.some(c=>
   c.selectedMeaning===entry.originalSelectedMeaning),
   "Original canonical candidate must remain intact");
 if(entry.alternativeExpression){
   assert.equal(grammar.validate(entry.alternativeExpression),true);
   assert.ok(grammar.emojiDisplay(entry.alternativeExpression).length>0);
   assert.ok(entry.alternativeSelectedMeaning);
   trials++;
 }else assert.equal(entry.alternativeSelectedMeaning,null);
 if(entry.researchDisposition==="defer_current_pictogram")abstentions++;
 if(entry.researchDisposition==="trial_typed_verb"){
   assert.equal(entry.alternativeExpression.kind,"event");
   typedVerbs++;
 }
 if(entry.researchDisposition==="inspect_existing_alternative"){
   const actual=semantic.characters[entry.rank-1].screening.candidates;
   assert.ok(actual.some(c=>c.selectedMeaning===entry.alternativeSelectedMeaning),
     "Claimed existing sense must actually exist");
 }
}
assert.equal(trials,9);
assert.equal(abstentions,5);
assert.equal(typedVerbs,1);
assert.deepEqual(overlay.summary,{
 total:15,alternativeExpressionProposals:9,provisionalDeferrals:5,
 explicitTypedVerbTrials:1,independentLexicalApproved:0,
 independentEmojiApproved:0,productionVerified:0
});
console.log("High-priority remediation: 15 source-linked hypotheses, 9 alternative expressions, 5 deferrals, zero canonical or human approvals.");
