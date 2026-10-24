// Candidate source lineage screening only; zero external ownership approvals.
import assert from "node:assert/strict";
import fs from "node:fs";
const get=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const leads=get("data/research/source-owner-external-leads-v0.1.json");
const gate=get("data/research/source-owner-independent-adjudication-protocol-v0.1.json");
assert.equal(leads.schema,"chromalect.glyph.source-owner-external-leads.v0.1");
assert.equal(leads.status,"candidate_source_screening_only_not_qualified_owner_evidence");
assert.deepEqual(leads.scope,{warningPairs:49,flaggedCharacters:48,
 palette:"mandarin-component-identity@0.6.0"});
assert.deepEqual(leads.counts,{candidateSourceFiles:4,sourceRecordsCopied:0,
 ownerClaimsIndependentlyCorroborated:0,eligibleReviewItems:0});
assert.equal(leads.screeningDate,"2026-10-24");
assert.equal(leads.sourceFiles.length,4);
const seen=new Set(),byId=new Map();
for(const row of leads.sourceFiles){
 assert.match(row.id,/^[a-z0-9-]+$/);
 assert.ok(!seen.has(row.id));seen.add(row.id);byId.set(row.id,row);
 assert.match(row.repository,/^[a-z0-9-]+\/[a-z0-9-]+$/i);
 assert.match(row.commit,/^[a-f0-9]{40}$/);
 assert.equal(row.upstreamReadme,"https://github.com/"+row.repository+
  "/blob/"+row.commit+"/README.md");
 assert.match(row.candidatePath,/^[A-Za-z0-9-]+\.txt$/);
 assert.match(row.provenanceFamily,/^[a-z0-9-]+$/);
 assert.ok(typeof row.licenseDeclaration==="string"&&row.licenseDeclaration.length>40);
 assert.ok(typeof row.dataRole==="string"&&row.dataRole.length>30);
 assert.ok(Array.isArray(row.dependsOn)&&row.dependsOn.length>=1);
 for(const k of ["licenseClearanceComplete","independentOfPinnedSourceEstablished",
  "anyOwnerPairVerified","redistributionAuthorizedForThisProject"])
  assert.equal(row[k],false,row.id+"."+k+" cannot silently promote");
}
assert.deepEqual([...seen].sort(),[
 "chise-ids-basic","cjkvi-ids","makemeahanzi-dictionary","makemeahanzi-graphics"
].sort());
assert.equal(byId.get("chise-ids-basic").provenanceFamily,
 byId.get("cjkvi-ids").provenanceFamily,
 "CHISE-derived CJKVI is not an independent source");
assert.ok(byId.get("cjkvi-ids").dependsOn.includes("CHISE"));
assert.ok(byId.get("chise-ids-basic").licenseDeclaration.includes("GPL"));
assert.ok(byId.get("cjkvi-ids").licenseDeclaration.includes("CHISE"));
assert.ok(byId.get("makemeahanzi-dictionary").licenseDeclaration.includes("LGPL"));
assert.ok(byId.get("makemeahanzi-graphics").licenseDeclaration.includes("Arphic"));
assert.notEqual(byId.get("makemeahanzi-dictionary").provenanceFamily,
 byId.get("makemeahanzi-graphics").provenanceFamily);
assert.deepEqual(leads.researchConstraints,{
 neverTreatCHISEAndCJKVIAsIndependentVotes:true,
 neverCombineDictionaryAndGraphicsLicenses:true,
 sourceLinksDoNotProveQualifiedOwnership:true,
 doNotImportThirdPartyDataWithoutApproval:true,
 noAutomaticCertification:true,
 prospectiveReviewRequiresIndependentQualifiedHumans:true
});
assert.equal(gate.status,"planned_not_preregistered_not_executed");
assert.equal(gate.prerequisites.independentSourceCorpusPinnedForOwnerVerification,false);
assert.equal(gate.prerequisites.sourceUseAndAttributionReviewComplete,false);
assert.equal(gate.acceptanceGate.independentReviewerReports,0);
assert.equal(gate.acceptanceGate.sourceOwnerCertifications,0);
assert.equal(gate.acceptanceGate.eligibleLearningStudyItems,0);
const doc=fs.readFileSync("docs/source-owner-external-evidence-screening.md","utf8");
for(const word of ["CHISE","CJKVI","LGPL","Arphic","zero records",
 "independentSourceCorpusPinnedForOwnerVerification"])
 assert.ok(doc.includes(word));
const proto=fs.readFileSync("docs/source-owner-independent-adjudication-protocol.md","utf8");
assert.ok(proto.includes("source-owner-external-evidence-screening.md"));
const site=fs.readFileSync("site/source-owner-independent-protocol.html","utf8");
assert.ok(site.includes("research/source-owner-external-leads-v0.1.json"));
console.log("Four pinned source-file leads screened: CHISE/CJKVI shared ancestry, dictionary versus graphics licenses distinct; no third-party data imported and no independent ownership approvals.");
