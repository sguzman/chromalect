import assert from "node:assert/strict";
import fs from "node:fs";
import {verifyUnresolvedPhoneticLeads} from "./unresolved_phonetic_reference_leads.mjs";
const get=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const inputs=[
 get("data/phonetics/unresolved-phonetic-reference-leads-v0.1.json"),
 get("data/phonetics/external-orthographic-spelling-rule-crosswalk-v0.1.json"),
 get("data/phonetics/external-umlaut-spelling-rule-crosswalk-v0.1.json"),
 get("data/phonetics/mandarin-final-spelling-context-gates-v0.1.json"),
 get("data/phonetics/unadjudicated-compound-final-review-queue-v0.1.json")
];
assert.equal(verifyUnresolvedPhoneticLeads(...inputs),true);
function reject(mutate){
 const copy=structuredClone(inputs);mutate(...copy);
 assert.throws(()=>verifyUnresolvedPhoneticLeads(...copy));
}
reject(a=>{a.records[0].proposedIPAForm="[invented]";});
reject(a=>{a.records[0].phonemeInventoryApproval=true;});
reject(a=>{a.records[1].sourceSpecificAcousticVerification=true;});
reject(a=>{a.records[1].humanDecodingTrials=1;});
reject(a=>{a.records[0].observedSourceReadingUses=64;});
reject(a=>{a.records[0].sourceLead="wrong-source";});
reject(a=>{a.references[1].url="https://example.invalid";});
reject(a=>{a.summary.phonologicalRepresentationsApproved=1;});
reject(a=>{a.records.push(a.records[0]);});
reject(a=>{a.source.noCopiedSourcePassages=false;});
reject((a,b,c,d)=>{d.records.find(x=>x.id==="post_sibilant_i").observedReadingCount=62;});
reject((a,b,c)=>{c.records[1].ipaApproval=true;});
console.log("Nine distinct caution leads reconciled, with 12 negative phonetic-boundary regressions.");
