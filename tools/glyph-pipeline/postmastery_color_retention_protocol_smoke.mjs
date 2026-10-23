import assert from "node:assert/strict";
import fs from "node:fs";
const d=JSON.parse(fs.readFileSync("data/research/postmastery-color-retention-protocol-v0.1.json","utf8"));
assert.equal(d.schema,"chromalect.research.postmastery-visual-retention-protocol.v0.1");
assert.equal(d.status,"planned_research_protocol_not_approved_for_participant_testing");
assert.deepEqual(d.treatments.map(t=>t.id),["plain","early_stable","postmastery_stable"]);
assert.equal(new Set(d.treatments.map(t=>t.id)).size,3);
assert.equal(d.treatments.find(t=>t.id==="plain").componentColorsEnabled,false);
assert.equal(d.treatments.find(t=>t.id==="postmastery_stable").initialStudy,"plain");
assert.equal(d.treatments.find(t=>t.id==="postmastery_stable").consolidation,"stable_identity_palette");
assert.equal(d.invariants.sameComponentIdentitySource,"palettes/mandarin-component-identity-v0.6.json");
for(const k of ["sameCharacterOutlinesAcrossArms","sameExplicitInstructionAcrossArms","sameConsolidationExposureTimeAcrossArms",
 "equivalentLegibilityConditionsRequired","eachTargetAppearsInOneArmPerParticipant","assignmentsCounterbalancedAcrossParticipants",
 "noAutomaticLinguisticOrVisualApproval"])assert.equal(d.invariants[k],true);
assert.equal(d.invariants.colorVisibilityDuringPrimaryDelayedTest,false);
assert.deepEqual(d.endpoints.primary.timepoints,["24h","7d"]);
assert.equal(d.endpoints.primary.powerAnalysisPending,true);
assert.equal(d.prerequisites.independentlyVisuallyApprovedGlyphOwnership,false);
assert.equal(d.prerequisites.validatedComponentIdentityTargetLabels,false);
assert.equal(d.prerequisites.recruitmentAndConsentProtocol,false);
assert.equal(d.prerequisites.preregisteredSamplingAndAnalysisPlan,false);
assert.equal(d.prerequisites.eligibleTrialItemsSelected,0);
assert.ok(Object.values(d.completedEvidence).every(x=>x===0));
assert.equal(d.privacy.publicRawParticipantResponsesAllowed,false);
assert.equal(d.privacy.localOnlyCollectionByDefault,true);
assert.ok(d.hypotheses.every(x=>x.accepted===false));
console.log("Post-mastery color study protocol structurally pinned; participant and efficacy evidence: zero.");
