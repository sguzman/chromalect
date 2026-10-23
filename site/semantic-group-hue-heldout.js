// Descriptive five-fold source-glyph color generalization only. No split
// includes held-out characters in its respective color-optimization graph.
(() => {
"use strict";
const $=id=>document.getElementById(id);
const ids=["ho-status","ho-summary","ho-table","ho-folds"];
if(ids.some(id=>!$(id)))return;
const elem=(name,label)=>{
 const e=document.createElement(name);
 if(label!==undefined)e.textContent=label;
 return e;
};
function section(text){
 const p=elem("p",text);
 $("ho-folds").appendChild(p);
}
async function load(){
 try{
  const response=await fetch("semantic-group-hue-fivefold-heldout-v0.1.json");
  if(!response.ok)throw Error("Published held-out source measurements unavailable");
  const study=await response.json();
  if(study.schema!=="chromalect.palette.historical-hue-five-fold-heldout.v0.1"||
     study.status!=="deterministic_800_train_200_heldout_numerical_source_glyph_diagnostic_only"||
     study.provenance.sourcePalette!=="mandarin-component-identity@0.6.0"||
     study.provenance.foldRule!=="(rank - 1) modulo 5"||
     study.provenance.originalPaletteRecolored!==false||
     study.provenance.sourceGlyphGeometryChanged!==false||
     study.provenance.independentVisionTrialConducted!==false||
     study.provenance.semanticFamilyAdjudicated!==false||
     study.provenance.componentIdentitiesCanOccurInBothSets!==true||
     study.summary.totalSourceGlyphs!==1000||
     study.summary.folds!==5||
     study.summary.trainPerFold!==800||
     study.summary.heldOutPerFold!==200||
     study.summary.sourceComponentColors!==520||
     study.summary.historicalCandidateComponents!==40||
     study.summary.independentHumanPerceptualResults!==0||
     study.summary.verifiedSemanticFamilies!==0||
     study.summary.validatedLearningOutcomes!==0||
     study.summary.crossFoldHeldOutTotals.characters!==1000||
     study.summary.crossFoldHeldOutTotals.distinctWithinGlyphPairs!==1020||
     study.summary.crossFoldHeldOutTotals.activeClosePairs!==26||
     study.summary.crossFoldHeldOutTotals.firstTrialClosePairs!==76||
     study.summary.crossFoldTrainingTotals.characters!==4000||
     study.summary.crossFoldTrainingTotals.distinctWithinGlyphPairs!==4080||
     !Array.isArray(study.folds)||study.folds.length!==5)
   throw Error("Held-out research source or approval boundary mismatch");
  const witnessed=new Set(),totals={
   source:0,first:0,optimized:0,pairs:0,
   trainingSource:0,trainingFirst:0,trainingOptimized:0,
   introduced:0,resolved:0,retained:0};
  for(let index=0;index<5;index++){
   const fold=study.folds[index];
   if(fold.foldIndex!==index||fold.trainingRanks!==800||
      fold.heldOutRanks!==200||
      fold.disjointBySourceRank!==true||
      fold.independentlyReviewed!==false||
      fold.humanDiscriminationTrial!==false||
      fold.paletteCandidateColors!==40||
      !Array.isArray(fold.excludedFromOptimizer)||
      fold.excludedFromOptimizer.length!==200||
      fold.train.characters!==800||fold.test.characters!==200)
    throw Error("Disjoint fold or review status is inconsistent");
   for(const rank of fold.excludedFromOptimizer){
    if(!Number.isInteger(rank)||rank<1||rank>1000||
       (rank-1)%5!==index||witnessed.has(rank))
     throw Error("A held-out source rank is repeated, out of range or leaked");
    witnessed.add(rank);
   }
   for(const sample of [fold.test,fold.train]){
    if(!Number.isInteger(sample.distinctWithinGlyphPairs)||
       !Number.isInteger(sample.activeClosePairs)||
       !Number.isInteger(sample.firstTrialClosePairs)||
       !Number.isInteger(sample.optimizedClosePairs)||
       sample.activeClosePairs<0||sample.firstTrialClosePairs<0||
       sample.optimizedClosePairs<0||
       sample.activeClosePairs>sample.distinctWithinGlyphPairs||
       sample.firstTrialClosePairs>sample.distinctWithinGlyphPairs||
       sample.optimizedClosePairs>sample.distinctWithinGlyphPairs||
       !Number.isInteger(sample.introducedOptimizedClosePairs)||
       !Number.isInteger(sample.resolvedOriginalClosePairs)||
       !Number.isInteger(sample.retainedOriginalClosePairs)||
       sample.introducedOptimizedClosePairs<0||
       sample.resolvedOriginalClosePairs<0||
       sample.retainedOriginalClosePairs<0||
       sample.activeClosePairs!==sample.resolvedOriginalClosePairs+
        sample.retainedOriginalClosePairs||
       sample.optimizedClosePairs!==sample.introducedOptimizedClosePairs+
        sample.retainedOriginalClosePairs)
     throw Error("Invalid source-owned component pair numbers");
   }
   totals.source+=fold.test.activeClosePairs;
   totals.first+=fold.test.firstTrialClosePairs;
   totals.optimized+=fold.test.optimizedClosePairs;
   totals.introduced+=fold.test.introducedOptimizedClosePairs;
   totals.resolved+=fold.test.resolvedOriginalClosePairs;
   totals.retained+=fold.test.retainedOriginalClosePairs;
   totals.pairs+=fold.test.distinctWithinGlyphPairs;
   totals.trainingSource+=fold.train.activeClosePairs;
   totals.trainingFirst+=fold.train.firstTrialClosePairs;
   totals.trainingOptimized+=fold.train.optimizedClosePairs;
  }
  const t=study.summary.crossFoldHeldOutTotals,
   train=study.summary.crossFoldTrainingTotals;
  if(witnessed.size!==1000||totals.source!==t.activeClosePairs||
     totals.first!==t.firstTrialClosePairs||
     totals.optimized!==t.optimizedClosePairs||
     totals.introduced!==t.introducedOptimizedClosePairs||
     totals.resolved!==t.resolvedOriginalClosePairs||
     totals.retained!==t.retainedOriginalClosePairs||
     totals.pairs!==t.distinctWithinGlyphPairs||
     totals.trainingSource!==train.activeClosePairs||
     totals.trainingFirst!==train.firstTrialClosePairs||
     totals.trainingOptimized!==train.optimizedClosePairs)
   throw Error("Fold results do not reconcile with the original full source catalog");
  $("ho-table").replaceChildren();
  for(const fold of study.folds){
   const tr=elem("tr");
   for(const text of [
    String(fold.foldIndex+1),
    String(fold.test.characters),
    String(fold.test.distinctWithinGlyphPairs),
    String(fold.test.activeClosePairs),
    String(fold.test.firstTrialClosePairs),
    String(fold.test.optimizedClosePairs),
    String(fold.learnedCandidateSwatchesChanged)
   ])tr.appendChild(elem("td",text));
   $("ho-table").appendChild(tr);
  }
  const finalRow=elem("tr");finalRow.className="ho-total";
  for(const text of ["Total","1000",String(totals.pairs),
   String(totals.source),String(totals.first),String(totals.optimized),"—"])
   finalRow.appendChild(elem("td",text));
  $("ho-table").appendChild(finalRow);
  $("ho-summary").textContent=
   "Held-out pair warnings across five disjoint 200-character cohorts: "+
   totals.source+" in original v0.6, "+totals.first+" in initial grouped hues, "+
   totals.optimized+" after fitting each fold using only the other 800 characters. "+
   "Relative to the unchanged palette: "+totals.introduced+" introduced, "+
   totals.resolved+" resolved, and "+totals.retained+
   " retained close pairs. Total source-owned held-out component pairs: "+
   totals.pairs+".";
  $("ho-folds").replaceChildren();
  section("Each row represents a DIFFERENT fold-trained experimental palette; "+
   "the optimized warning total is not the production result of one single 1,000-glyph-fitted palette.");
  section("The same component identities can recur in training and test glyphs. "+
   "Only character ranks are disjoint; this is not a study of unseen component identities, "+
   "natural human color discrimination, or Mandarin semantic correctness.");
  $("ho-status").textContent="All five disjoint held-out cohorts and source-pair totals verified.";
 }catch(error){
  $("ho-table").replaceChildren();
  $("ho-folds").replaceChildren();
  $("ho-status").textContent="Unable to validate held-out research audit: "+error.message;
 }
}
load();
})();