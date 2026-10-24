import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {spawnSync} from "node:child_process";
import {readReadiness,reviewReadiness,REQUIRED}
 from "./source_owner_review_readiness.mjs";

const json=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const protocol=json("data/research/source-owner-independent-adjudication-protocol-v0.1.json");
const targets=json("site/glyphs/research/heldout-identification-target-v0.1/index-v0.1.json");
const complements=json("site/glyphs/research/owner-complement-locators-v0.1/index-v0.1.json");
const result=readReadiness();
assert.deepEqual(result,reviewReadiness(protocol,targets,complements));
assert.equal(result.schema,"chromalect.glyph.source-owner-readiness.v0.1");
assert.equal(result.status,
 "machine_readiness_audit_not_independent_review_or_certification");
assert.equal(result.sourceWarningPairs,49);
assert.equal(result.flaggedCharacters,48);
assert.equal(result.minimumReviewReportsRequired,98);
assert.equal(result.independentReportsAccepted,0);
assert.equal(result.independentlyReconciledPairs,0);
assert.equal(result.independentlyCertifiedOwners,0);
assert.equal(result.visuallyCertifiedGlyphs,0);
assert.equal(result.studyEligibleItems,0);
assert.equal(result.prerequisitesTotal,7);
assert.equal(result.prerequisitesSatisfied,0);
assert.deepEqual(result.outstandingPrerequisites,REQUIRED);
assert.equal(result.independentlyReady,false);
assert.equal(result.canClaimCertification,false);
assert.equal(result.approvedStudyResults,0);
const script=path.resolve("tools/glyph-pipeline/source_owner_review_readiness.mjs");
const rendered=spawnSync(process.execPath,[script,"--json"],
 {encoding:"utf8",timeout:30000});
assert.equal(rendered.status,0,rendered.stderr);
assert.deepEqual(JSON.parse(rendered.stdout),result);
const summary=spawnSync(process.execPath,[script,"--status"],
 {encoding:"utf8",timeout:30000});
assert.equal(summary.status,0,summary.stderr);
assert.match(summary.stdout,/0\/7 documented prerequisites/);
assert.match(summary.stdout,/0\/98 independent reports accepted/);
assert.ok(!summary.stdout.includes("cmp-"));
const invalid=spawnSync(process.execPath,[script,"--approve"],
 {encoding:"utf8",timeout:30000});
assert.notEqual(invalid.status,0);
function poison(mutator,pattern=null){
 const p=structuredClone(protocol);
 mutator(p);
 if(pattern)assert.throws(()=>reviewReadiness(p,targets,complements),pattern);
 else assert.throws(()=>reviewReadiness(p,targets,complements));
}
poison(p=>{p.acceptanceGate.sourceOwnerCertifications=1;});
poison(p=>{p.acceptanceGate.certifiedGlyphs=1;});
poison(p=>{p.acceptanceGate.independentReviewerReports=98;});
poison(p=>{p.acceptanceGate.eligibleLearningStudyItems=1;});
poison(p=>{p.acceptanceGate.automaticPromotionPermitted=true;});
poison(p=>{p.decisions.push({status:"accepted_after_independent_reconciliation"});});
poison(p=>{p.status="independent_source_owner_review_complete";});
poison(p=>{p.prerequisites.minimumIndependentReviewsPerPair=1;});
poison(p=>{p.prerequisites.sourceGeometryChangeWithoutNewVersionAllowed=true;});
poison(p=>{p.prerequisites.thirdIndependentReviewOnDisagreementRequired=false;});
poison(p=>{delete p.prerequisites.protocolPreregistered;});
poison(p=>{p.prerequisites.acceptedStudySampleSelected="approved";});
const drift=structuredClone(targets);
drift.summary.warningObservations=50;
assert.throws(()=>reviewReadiness(protocol,drift,complements));
for(const key of REQUIRED)poison(p=>{
 p.prerequisites[key]=true;
},/requires a new evidence-backed protocol version/);
console.log("Evidence-gated source-owner readiness: 0/7 documented prerequisites, 0/98 minimum independently qualified reports, 0 certifications; promoted or inconsistent sources refused.");
