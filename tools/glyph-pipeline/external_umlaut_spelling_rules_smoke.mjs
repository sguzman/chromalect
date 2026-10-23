import assert from "node:assert/strict";
import fs from "node:fs";
import {verifyUmlautCrosswalk} from "./external_umlaut_spelling_rules.mjs";
const get=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const fixtures=[
 get("data/phonetics/external-umlaut-spelling-rule-crosswalk-v0.1.json"),
 get("data/phonetics/external-orthographic-spelling-rule-crosswalk-v0.1.json"),
 get("data/phonetics/mandarin-final-spelling-context-gates-v0.1.json"),
 get("data/phonetics/unadjudicated-compound-final-review-queue-v0.1.json")
];
assert.equal(verifyUmlautCrosswalk(...fixtures),true);
function reject(mutate){
 const data=structuredClone(fixtures);mutate(...data);
 assert.throws(()=>verifyUmlautCrosswalk(...data));
}
reject(a=>{a.records[0].ipaApproval=true;});
reject(a=>{a.records[1].expandedOrthographicComparison="uen";});
reject(a=>{a.records[1].observedSourceReadingUses=38;});
reject(a=>{a.records[2].ruleClass="invented";});
reject(a=>{a.records[3].phonologicalRepresentation="invented";});
reject(a=>{a.references[0].url="https://example.invalid";});
reject(a=>{a.source.citationBlobSHA="unknown";});
reject(a=>{a.summary.combinedSourceReadingUses=135;});
reject(a=>{a.records.push(a.records[0]);});
reject((a,b,c)=>{c.records.find(x=>x.id==="palatal_written_uan").observedTokenTriples[0].initial="t";});
reject((a,b)=>{b.records[2].observedSourceReadingUses=38;});
reject(a=>{a.records[0].excerpt="unlicensed source paragraph";});
console.log("Four orthographic umlaut cohorts, combined 134 source uses, and 12 negative cases passed.");
