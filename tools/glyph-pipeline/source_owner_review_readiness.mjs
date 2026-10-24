// Machine-readable, evidence-gated source-owner research readiness inventory.
// This is not a reviewer-accreditation or scientific-certification service.
import assert from "node:assert/strict";
import fs from "node:fs";
import {pathToFileURL} from "node:url";
import {readPinnedSiteFile,REPOSITORY_ROOT} from "./source_owner_local_paths.mjs";
import path from "node:path";

const TARGET="glyphs/research/heldout-identification-target-v0.1/index-v0.1.json";
const COMPLEMENT="glyphs/research/owner-complement-locators-v0.1/index-v0.1.json";
export const REQUIRED=[
 "protocolPreregistered",
 "independentSourceCorpusPinnedForOwnerVerification",
 "qualifiedIndependentReviewersRecruited",
 "independentBlindedReviewInterfaceAvailable",
 "reviewerIndependenceAttestationsCollected",
 "sourceUseAndAttributionReviewComplete",
 "acceptedStudySampleSelected"
];
const COUNTS=["independentReviewerReports","independentlyReconciledPairs",
 "sourceOwnerCertifications","certifiedGlyphs",
 "validatedColorDiscriminationResults","approvedSemanticMappings",
 "eligibleLearningStudyItems","conflictDecisions"];
export function reviewReadiness(protocol,targets,complements){
 assert.equal(protocol.schema,
  "chromalect.glyph.source-owner-independent-adjudication-protocol.v0.1");
 assert.equal(protocol.status,"planned_not_preregistered_not_executed");
 const scope=protocol.reviewScope,pre=protocol.prerequisites,gate=protocol.acceptanceGate;
 assert.equal(scope.targetManifest,TARGET);
 assert.equal(scope.complementManifest,COMPLEMENT);
 assert.equal(scope.palette,"mandarin-component-identity@0.6.0");
 assert.equal(scope.warningPairObservations,49);
 assert.equal(scope.flaggedCharacters,48);
 assert.equal(scope.introducedWarnings+scope.resolvedWarnings+
  scope.retainedWarnings,49);
 assert.equal(targets.summary.warningObservations,49);
 assert.equal(targets.summary.flaggedCharacters,48);
 assert.equal(complements.summary.complementaryMasks,49);
 assert.equal(targets.summary.independentlyVerifiedAnswerKeys,0);
 assert.equal(complements.summary.independentlyApprovedOwners,0);
 assert.ok(Array.isArray(targets.targets)&&targets.targets.length===49);
 assert.equal(pre.minimumIndependentReviewsPerPair,2);
 assert.equal(pre.thirdIndependentReviewOnDisagreementRequired,true);
 assert.equal(pre.sourceGeometryChangeWithoutNewVersionAllowed,false);
 assert.equal(pre.existingLocalIntakeHidesMachineAssignedKey,false);
 // The v0.1 protocol explicitly has no accepted source evidence or reviewer
 // attestations. A true flag without new versioned evidence must fail closed,
 // not generate a misleading partial completion percentage.
 const statuses=REQUIRED.map(key=>{
  assert.equal(pre[key],false,
   key+" requires a new evidence-backed protocol version before promotion");
  return {prerequisite:key,satisfied:false};
 });
 const missing=statuses.filter(s=>!s.satisfied).map(s=>s.prerequisite);
 assert.equal(gate.automaticPromotionPermitted,false);
 const accepted=Object.fromEntries(COUNTS.map(key=>{
  assert.ok(Number.isSafeInteger(gate[key])&&gate[key]>=0,key);
  return [key,gate[key]];
 }));
 assert.ok(!Object.values(accepted).some(Boolean),
  "No human approval, expert report or study result may be inferred or promoted");
 assert.deepEqual(protocol.decisions,[]);
 return {
  schema:"chromalect.glyph.source-owner-readiness.v0.1",
  status:"machine_readiness_audit_not_independent_review_or_certification",
  profile:protocol.profile,
  sourceWarningPairs:49,
  flaggedCharacters:48,
  minimumReviewReportsRequired:49*pre.minimumIndependentReviewsPerPair,
  independentReportsAccepted:accepted.independentReviewerReports,
  independentlyReconciledPairs:accepted.independentlyReconciledPairs,
  independentlyCertifiedOwners:accepted.sourceOwnerCertifications,
  visuallyCertifiedGlyphs:accepted.certifiedGlyphs,
  studyEligibleItems:accepted.eligibleLearningStudyItems,
  prerequisitesTotal:statuses.length,
  prerequisitesSatisfied:statuses.length-missing.length,
  outstandingPrerequisites:missing,
  independentlyReady:missing.length===0,
  canClaimCertification:false,
  approvedStudyResults:0
 };
}
export function readReadiness(){
 return reviewReadiness(
  JSON.parse(fs.readFileSync(path.join(REPOSITORY_ROOT,
   "data/research/source-owner-independent-adjudication-protocol-v0.1.json"),"utf8")),
  JSON.parse(readPinnedSiteFile(TARGET)),
  JSON.parse(readPinnedSiteFile(COMPLEMENT))
 );
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const args=process.argv.slice(2);
 assert.ok(args.length===1&&(args[0]==="--json"||args[0]==="--status"),
  "Usage: source_owner_review_readiness.mjs --json | --status");
 const result=readReadiness();
 if(args[0]==="--json")process.stdout.write(JSON.stringify(result,null,2)+"\n");
 else console.log("Source-owner review readiness: "+
  result.prerequisitesSatisfied+"/"+result.prerequisitesTotal+
  " documented prerequisites met; "+result.outstandingPrerequisites.length+
  " still outstanding; "+result.independentReportsAccepted+
  "/"+result.minimumReviewReportsRequired+
  " independent reports accepted; 0 certifications.");
}
