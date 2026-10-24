// Frozen *observed* fivefold benchmark from Pages run 40126043451.
// A held-out negative result is evidence: refuse inadvertent promotion or drift.
// Machine color proximity is not independent human color discrimination.
import assert from "node:assert/strict";
import fs from "node:fs";
const path="site/palettes/mandarin-component-identity-v0.7-fivefold-heldout-v0.1.json";
const report=JSON.parse(fs.readFileSync(path,"utf8"));
assert.equal(report.schema,"chromalect.palette.v07-fivefold-source-heldout.v0.1");
assert.equal(report.status,
 "fivefold_character_heldout_numerical_proximity_check_not_perceptual_validation");
assert.equal(report.sources.activePaletteModified,false);
assert.equal(report.sources.geometryOrOwnershipModified,false);
assert.equal(report.sources.independentlyCertifiedGlyphs,0);
assert.equal(report.method.folds,5);
assert.equal(report.method.sourceTrainingGlyphsPerFold,800);
assert.equal(report.method.heldoutGlyphsPerFold,200);
assert.equal(report.method.closePairThreshold,0.07);
assert.equal(report.method.fitUsesOnlyFourNonheldoutRankResidueClasses,true);
assert.equal(report.method.onlyTrainingPairsSubjectToZeroNewWarningConstraint,true);
assert.equal(report.method.eachFoldRetainsExactGlobal520ColorMultiset,true);
assert.equal(report.method.notTheSingleFullSampleV07Candidate,true);
const s=report.summary;
assert.deepEqual({
 baseline:s.baselineHeldoutClosePairs,
 experimental:s.trainedHeldoutClosePairs,
 introduced:s.newHeldoutClosePairs,
 resolved:s.resolvedHeldoutClosePairs,
 retained:s.retainedHeldoutClosePairs,
 observations:s.sourceIntraGlyphPairObservations,
 glyphs:s.independentSourceRankHoldoutPredictions,
 totalSwaps:s.totalSwapsAcrossFiveIndependentFits
},{baseline:26,experimental:29,introduced:13,resolved:10,
 retained:16,observations:1020,glyphs:1000,totalSwaps:43});
assert.equal(s.perceptualContrastOrLegibilityValidated,false);
assert.equal(s.independentlyAdjudicatedOwnerRegions,0);
assert.equal(s.humanDiscriminationResults,0);
assert.equal(s.learnerTransferStudies,0);
assert.ok(s.trainedHeldoutClosePairs>s.baselineHeldoutClosePairs,
 "A previously negative held-out result cannot silently become a success");
const expected=[
 {trainingBefore:21,trainingAfter:0,observations:195,base:5,candidate:4,
  introduced:1,resolved:2,retained:3,swaps:9},
 {trainingBefore:22,trainingAfter:0,observations:223,base:4,candidate:5,
  introduced:3,resolved:2,retained:2,swaps:9},
 {trainingBefore:16,trainingAfter:0,observations:199,base:10,candidate:9,
  introduced:4,resolved:5,retained:5,swaps:8},
 {trainingBefore:20,trainingAfter:0,observations:203,base:6,candidate:6,
  introduced:0,resolved:0,retained:6,swaps:8},
 {trainingBefore:25,trainingAfter:0,observations:200,base:1,candidate:5,
  introduced:5,resolved:1,retained:0,swaps:9}
];
assert.equal(report.folds.length,5);
const seen=new Set();
let observations=0,baseline=0,candidate=0,added=0,resolved=0,retained=0,swaps=0;
for(let i=0;i<5;i++){
 const row=report.folds[i],ex=expected[i];
 assert.equal(row.fold,i+1);
 assert.equal(row.heldoutModulo,i);
 assert.equal(row.trainGlyphs,800);
 assert.equal(row.heldoutGlyphs,200);
 assert.equal(row.heldoutSourceRanks.length,200);
 assert.equal(row.heldoutGlyphMembershipExcludedFromFitting,true);
 assert.equal(row.noNewWarningRestrictionAppliesOnlyToTrainingPairs,true);
 assert.equal(row.global520ColorMultisetPreserved,true);
 assert.deepEqual({
  trainingBefore:row.trainingClosePairsOriginal,
  trainingAfter:row.trainingClosePairsCandidate,
  observations:row.holdoutPairObservations,
  base:row.heldoutClosePairsOriginal,candidate:row.heldoutClosePairsCandidate,
  introduced:row.heldoutWarningsIntroduced,
  resolved:row.heldoutWarningsResolved,
  retained:row.heldoutWarningsRetained,
  swaps:row.swapCount
 },ex);
 for(const rank of row.heldoutSourceRanks){
  assert.ok(Number.isInteger(rank)&&rank>=1&&rank<=1000);
  assert.equal((rank-1)%5,i);
  assert.ok(!seen.has(rank),"A source character was both sampled and held out twice");
  seen.add(rank);
 }
 assert.equal(row.heldoutClosePairsCandidate,
  row.heldoutWarningsIntroduced+row.heldoutWarningsRetained);
 assert.equal(row.heldoutClosePairsOriginal,
  row.heldoutWarningsResolved+row.heldoutWarningsRetained);
 observations+=row.holdoutPairObservations;
 baseline+=row.heldoutClosePairsOriginal;
 candidate+=row.heldoutClosePairsCandidate;
 added+=row.heldoutWarningsIntroduced;
 resolved+=row.heldoutWarningsResolved;
 retained+=row.heldoutWarningsRetained;
 swaps+=row.swapCount;
}
assert.equal(seen.size,1000);
assert.deepEqual({observations,baseline,candidate,added,resolved,retained,swaps},
 {observations:1020,baseline:26,candidate:29,added:13,resolved:10,
 retained:16,swaps:43});
console.log("v0.7 fivefold source-held-out: 26 -> 29 warnings; 13 new, 10 resolved, 16 retained. Candidate not validated for palette adoption.");
