import assert from "node:assert/strict";
import fs from "node:fs";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const proto=read("data/research/source-owner-independent-adjudication-protocol-v0.1.json");
const targets=read("site/glyphs/research/heldout-identification-target-v0.1/index-v0.1.json");
const complements=read("site/glyphs/research/owner-complement-locators-v0.1/index-v0.1.json");
assert.equal(proto.schema,"chromalect.glyph.source-owner-independent-adjudication-protocol.v0.1");
assert.equal(proto.status,"planned_not_preregistered_not_executed");
assert.deepEqual(proto.reviewScope,{
 targetManifest:"glyphs/research/heldout-identification-target-v0.1/index-v0.1.json",
 complementManifest:"glyphs/research/owner-complement-locators-v0.1/index-v0.1.json",
 palette:"mandarin-component-identity@0.6.0",
 warningPairObservations:49,flaggedCharacters:48,
 introducedWarnings:23,resolvedWarnings:21,retainedWarnings:5
});
assert.equal(targets.summary.warningObservations,proto.reviewScope.warningPairObservations);
assert.equal(targets.summary.flaggedCharacters,proto.reviewScope.flaggedCharacters);
assert.equal(complements.summary.complementaryMasks,proto.reviewScope.warningPairObservations);
assert.equal(targets.summary.independentlyVerifiedAnswerKeys,0);
assert.equal(complements.summary.independentlyApprovedOwners,0);
assert.ok(Array.isArray(proto.decisionProcedure)&&proto.decisionProcedure.length>=7);
assert.deepEqual(proto.candidateDecisionStates,[
 "unreviewed","independent_support_pending_reconciliation",
 "documented_owner_conflict","alternative_decomposition_requires_source_review",
 "disagreement_unresolved","accepted_after_independent_reconciliation"]);
const g=proto.prerequisites;
assert.equal(g.protocolPreregistered,false);
assert.equal(g.independentSourceCorpusPinnedForOwnerVerification,false);
assert.equal(g.qualifiedIndependentReviewersRecruited,false);
assert.equal(g.minimumIndependentReviewsPerPair,2);
assert.equal(g.thirdIndependentReviewOnDisagreementRequired,true);
assert.equal(g.sourceGeometryChangeWithoutNewVersionAllowed,false);
assert.equal(g.existingLocalIntakeHidesMachineAssignedKey,false);
assert.equal(g.independentBlindedReviewInterfaceAvailable,false);
assert.equal(g.reviewerIndependenceAttestationsCollected,false);
assert.equal(g.sourceUseAndAttributionReviewComplete,false);
assert.equal(g.acceptedStudySampleSelected,false);
assert.equal(proto.acceptanceGate.automaticPromotionPermitted,false);
for(const [key,value] of Object.entries(proto.acceptanceGate))
 if(key!=="automaticPromotionPermitted")assert.equal(value,0,key);
assert.deepEqual(proto.decisions,[]);
assert.ok(proto.nonclaims.some(x=>x.includes("not a reviewer-blind protocol")));
const page=fs.readFileSync("site/source-owner-independent-protocol.html","utf8");
assert.match(page,/theme.js/);
assert.match(page,/0 of 49/);
assert.match(page,/not<\/strong> a blinded review instrument/);
assert.ok(page.includes('research/source-owner-independent-adjudication-protocol-v0.1.json'));
const entry=fs.readFileSync("site/component-owner-adjudication.html","utf8");
assert.ok(entry.includes('source-owner-independent-protocol.html'));
const doc=fs.readFileSync("docs/source-owner-independent-adjudication-protocol.md","utf8");
assert.match(doc,/not preregistered/i);
assert.match(doc,/0 reviewer reports/);
console.log("Independent owner-review gate: 49 candidates, no blinded reviewer interface, no reviewer decisions, no certified source owners or study approvals.");
