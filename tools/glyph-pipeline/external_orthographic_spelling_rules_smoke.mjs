import assert from "node:assert/strict";
import fs from "node:fs";
import {verifyOrthographicCrosswalk} from "./external_orthographic_spelling_rules.mjs";
const get=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const input=[
 get("data/phonetics/external-orthographic-spelling-rule-crosswalk-v0.1.json"),
 get("data/phonetics/mandarin-final-spelling-context-gates-v0.1.json"),
 get("data/phonetics/unadjudicated-compound-final-review-queue-v0.1.json")
];
assert.equal(verifyOrthographicCrosswalk(...input),true);
function reject(modify){
 const copy=structuredClone(input);
 modify(...copy);
 assert.throws(()=>verifyOrthographicCrosswalk(...copy));
}
reject(ledger=>{ledger.records[0].ipaApproval=true;});
reject(ledger=>{ledger.records[0].phonologicalRepresentation="invented";});
reject(ledger=>{ledger.records[0].contextualReadingApproval=true;});
reject(ledger=>{ledger.records[2].observedSourceReadingUses=38;});
reject(ledger=>{ledger.records[2].expandedOrthographicComparison="uen/ün";});
reject(ledger=>{ledger.records[1].sourceRule="unreviewed-source";});
reject(ledger=>{ledger.references[0].url="https://example.invalid";});
reject(ledger=>{ledger.source.citationBlobSHA="unknown";});
reject(ledger=>{ledger.summary.independentPhonologicalApprovals=1;});
reject(ledger=>{ledger.records.push(ledger.records[0]);});
reject((ledger,gates)=>{gates.records.find(r=>r.id==="palatal_written_un").observedReadingCount=0;});
reject(ledger=>{ledger.records[0].excerpt="not licensed";});
console.log("External orthographic links, 63 source instances and 12 negative evidence-boundary cases passed.");
