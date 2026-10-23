import assert from "node:assert/strict";
import fs from "node:fs";
import {deriveHueHoldoutEvaluation} from "./semantic_group_hue_heldout.mjs";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const catalog=read("data/catalog/characters-0001-1000.json"),
 mapping=read("site/glyphs/mappings.json"),
 palette=read("palettes/mandarin-component-identity-v0.6.json"),
 risk=read("site/glyphs/research/hint-counterfactual-v0.1/pair-risk-v0.1.json");
const report=read("site/semantic-group-hue-fivefold-heldout-v0.1.json");
assert.equal(report.schema,"chromalect.palette.historical-hue-five-fold-heldout.v0.1");
assert.equal(report.status,
 "deterministic_800_train_200_heldout_numerical_source_glyph_diagnostic_only");
assert.equal(report.provenance.originalPaletteRecolored,false);
assert.equal(report.provenance.sourceGlyphGeometryChanged,false);
assert.equal(report.provenance.independentVisionTrialConducted,false);
assert.equal(report.provenance.semanticFamilyAdjudicated,false);
assert.equal(report.provenance.componentIdentitiesCanOccurInBothSets,true);
assert.equal(report.summary.totalSourceGlyphs,1000);
assert.equal(report.summary.folds,5);
assert.equal(report.summary.trainPerFold,800);
assert.equal(report.summary.heldOutPerFold,200);
assert.equal(report.summary.sourceComponentColors,520);
assert.equal(report.summary.historicalCandidateComponents,40);
assert.equal(report.summary.independentHumanPerceptualResults,0);
assert.equal(report.summary.verifiedSemanticFamilies,0);
assert.equal(report.summary.validatedLearningOutcomes,0);
assert.equal(report.summary.crossFoldHeldOutTotals.characters,1000);
assert.equal(report.summary.crossFoldHeldOutTotals.distinctWithinGlyphPairs,1020);
assert.equal(report.summary.crossFoldHeldOutTotals.activeClosePairs,26);
assert.equal(report.summary.crossFoldHeldOutTotals.firstTrialClosePairs,76);
assert.equal(report.summary.crossFoldHeldOutTotals.optimizedClosePairs,
 report.summary.crossFoldHeldOutTotals.introducedOptimizedClosePairs+
 report.summary.crossFoldHeldOutTotals.retainedOriginalClosePairs);
assert.equal(report.summary.crossFoldHeldOutTotals.activeClosePairs,
 report.summary.crossFoldHeldOutTotals.resolvedOriginalClosePairs+
 report.summary.crossFoldHeldOutTotals.retainedOriginalClosePairs);
assert.equal(report.summary.crossFoldTrainingTotals.characters,4000);
assert.equal(report.summary.crossFoldTrainingTotals.distinctWithinGlyphPairs,4080);
assert.equal(report.summary.crossFoldTrainingTotals.activeClosePairs,104);
assert.equal(report.summary.crossFoldTrainingTotals.firstTrialClosePairs,304);
assert.equal(report.folds.length,5);
const heldOut=new Set();
for(let i=0;i<5;i++){
 const fold=report.folds[i];
 assert.equal(fold.foldIndex,i);
 assert.equal(fold.trainingRanks,800);
 assert.equal(fold.heldOutRanks,200);
 assert.equal(fold.excludedFromOptimizer.length,200);
 assert.equal(fold.paletteCandidateColors,40);
 assert.equal(fold.disjointBySourceRank,true);
 assert.equal(fold.independentlyReviewed,false);
 assert.equal(fold.humanDiscriminationTrial,false);
 assert.equal(fold.train.characters,800);
 assert.equal(fold.test.characters,200);
 for(const rank of fold.excludedFromOptimizer){
  assert.ok(rank>=1&&rank<=1000);
  assert.equal((rank-1)%5,i);
  assert.ok(!heldOut.has(rank));heldOut.add(rank);
 }
 for(const sample of [fold.train,fold.test]){
  assert.ok(sample.distinctWithinGlyphPairs>=sample.activeClosePairs);
  assert.ok(sample.distinctWithinGlyphPairs>=sample.firstTrialClosePairs);
  assert.ok(sample.distinctWithinGlyphPairs>=sample.optimizedClosePairs);
  assert.equal(sample.optimizedClosePairs,
   sample.introducedOptimizedClosePairs+sample.retainedOriginalClosePairs);
  assert.equal(sample.activeClosePairs,
   sample.resolvedOriginalClosePairs+sample.retainedOriginalClosePairs);
 }
}
assert.equal(heldOut.size,1000);
for(const mutate of [
 (a,b,c,d)=>{a.schema="wrong";},
 (a,b,c,d)=>{a.characters[0].rank=0;},
 (a,b,c,d)=>{b.palette_ref="mandarin-component-identity@0.7.0";},
 (a,b,c,d)=>{b.glyphs[0].independently_visually_certified=true;},
 (a,b,c,d)=>{c.version="0.7.0";},
 (a,b,c,d)=>{d.summary.originalClosePairs=25;},
 (a,b,c,d)=>{d.provenance.originalPaletteMutated=true;}
]){
 const args=[catalog,mapping,palette,risk].map(x=>structuredClone(x));
 mutate(...args);
 assert.throws(()=>deriveHueHoldoutEvaluation(...args));
}
console.log("Five disjoint 800/200 source-rank partitions, full 1020 held-out pair census, and seven approval/provenance rejections.");
