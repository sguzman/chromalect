// Five-fold character-held-out diagnostic for the historical group-hue
// optimization procedure. Each optimized variant is learned from 800 ranks
// and evaluated on the other 200 ranks that were never in its color graph.
// This measures only machine OKLab pair warnings; it does not test humans.
import assert from "node:assert/strict";
import fs from "node:fs";
import {pathToFileURL} from "node:url";
import {derivePilotGroupCounterfactual} from "./pilot_group_counterfactual.mjs";
import {deriveCollisionConstrainedPilot} from "./pilot_group_collision_optimization.mjs";
const THRESHOLD=0.07;
const FIRST_TRANCHE=1000,FOLDS=5;
function lab(hex){
 assert.match(hex,/^#[0-9a-f]{6}$/i);
 const [r,g,b]=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255)
  .map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);
 const l=Math.cbrt(.4122214708*r+.5363325363*g+.0514459929*b),
  m=Math.cbrt(.2119034982*r+.6806995451*g+.1073969566*b),
  s=Math.cbrt(.0883024619*r+.2817188376*g+.6299787005*b);
 return [.2104542553*l+.793617785*m-.0040720468*s,
  1.9779984951*l-2.428592205*m+.4505937099*s,
  .0259040371*l+.7827717662*m-.808675766*s];
}
const distance=(a,b)=>{
 const x=lab(a),y=lab(b);
 return Math.hypot(...x.map((n,i)=>n-y[i]));
};
const summaryOf=rows=>Object.fromEntries(
 ["characters","distinctWithinGlyphPairs","activeClosePairs","firstTrialClosePairs",
  "optimizedClosePairs","introducedOptimizedClosePairs","resolvedOriginalClosePairs",
  "retainedOriginalClosePairs","charactersWithFirstClosePairs",
  "charactersWithOptimizedClosePairs","charactersWithIntroducedClosePairs"].map(key=>
   [key,rows.reduce((sum,row)=>sum+row[key],0)]));
export function deriveHueHoldoutEvaluation(catalog,mappings,palette,sourceRisk){
 assert.equal(catalog.schema,"chromalect.character-tranche.v1");
 assert.equal(catalog.tranche,"0001-1000");
 assert.equal(catalog.characters.length,FIRST_TRANCHE);
 assert.equal(mappings.schema,"chromalect.component-stroke-mappings.v1");
 assert.equal(mappings.palette_ref,"mandarin-component-identity@0.6.0");
 assert.equal(mappings.glyph_count,mappings.glyphs.length);
 assert.ok(mappings.glyph_count>=FIRST_TRANCHE&&
  mappings.glyph_count<=FIRST_TRANCHE+32);
 assert.equal(sourceRisk.schema,"chromalect.glyph.hint-hue-source-pair-risk.v0.1");
 assert.equal(sourceRisk.summary.catalogCharacters,FIRST_TRANCHE);
 assert.equal(sourceRisk.summary.originalClosePairs,26);
 assert.equal(sourceRisk.summary.proposedClosePairs,76);
 assert.equal(sourceRisk.summary.sourceUniqueComponentPairs,1020);
 assert.equal(sourceRisk.summary.affectedGlyphs,542);
 assert.equal(sourceRisk.provenance.originalPaletteMutated,false);
 const first=derivePilotGroupCounterfactual(palette);
 const sourceById=new Map(palette.components.map(x=>[x.id,x]));
 const glyphByHanzi=new Map(mappings.glyphs.map(x=>[x.character,x]));
 assert.equal(sourceById.size,520);
 assert.equal(glyphByHanzi.size,mappings.glyph_count);
 const firstHex=new Map(first.groups.flatMap(g=>
  g.members.map(m=>[m.componentId,m.candidateHex])));
 assert.equal(firstHex.size,40);
 const glyphs=[];
 for(let i=0;i<FIRST_TRANCHE;i++){
  const ch=catalog.characters[i],mapped=glyphByHanzi.get(ch.character);
  if(ch.rank!==i+1||!mapped||
     mapped.independently_visually_certified!==false||
     !mapped.source_path_owner_ids?.length)
   throw Error("Unavailable or promoted original glyph ownership");
  const partById=new Map();
  for(const part of mapped.components){
   const owner=sourceById.get(part.component_id),
    prior=partById.get(part.component_id);
   if(!owner||part.hex.toUpperCase()!==owner.color.toUpperCase()||
      part.form!==owner.shape||
      (prior&&(prior.hex!==part.hex||prior.form!==part.form)))
    throw Error("Original glyph has conflicting component colors or shapes");
   partById.set(part.component_id,part);
  }
  assert.ok(partById.size>0);
  assert.ok(mapped.source_path_owner_ids.every(id=>partById.has(id)));
  glyphs.push({rank:ch.rank,character:ch.character,
   components:[...partById.keys()].sort()});
 }
 const allResults=[],seenHeldout=new Set();
 for(let fold=0;fold<FOLDS;fold++){
  const heldOut=glyphs.filter(row=>(row.rank-1)%FOLDS===fold);
  const training=glyphs.filter(row=>(row.rank-1)%FOLDS!==fold);
  assert.equal(training.length,800);assert.equal(heldOut.length,200);
  const trainingRanks=new Set(training.map(row=>row.rank));
  const model=deriveCollisionConstrainedPilot(catalog,mappings,palette,sourceRisk,
   {trainingRanks});
  const optimized=new Map(model.groups.flatMap(g=>
   g.members.map(m=>[m.componentId,m.optimizedTrialHex])));
  assert.equal(optimized.size,40);
  function evaluate(rows,{captureReview=false}={}){
   let distinctWithinGlyphPairs=0,activeClosePairs=0,
    firstTrialClosePairs=0,optimizedClosePairs=0,
    introducedOptimizedClosePairs=0,resolvedOriginalClosePairs=0,
    retainedOriginalClosePairs=0,
    charactersWithFirstClosePairs=0,charactersWithOptimizedClosePairs=0,
    charactersWithIntroducedClosePairs=0;
   const reviewPairs=[];
   for(const row of rows){
    let firstWarnings=0,lastWarnings=0,introducedInGlyph=0;
    for(let i=0;i<row.components.length;i++)
     for(let j=i+1;j<row.components.length;j++){
      const idA=row.components[i],idB=row.components[j];
      const origA=sourceById.get(idA).color,origB=sourceById.get(idB).color;
      const firstA=firstHex.get(idA)??origA,
       firstB=firstHex.get(idB)??origB;
      const optA=optimized.get(idA)??origA,
       optB=optimized.get(idB)??origB;
      const originalDistance=distance(origA,origB),
       firstDistance=distance(firstA,firstB),
       optimizedDistance=distance(optA,optB);
      const oldFlag=originalDistance<THRESHOLD,
       optimizedFlag=optimizedDistance<THRESHOLD;
      if(captureReview&&(oldFlag||optimizedFlag)){
       reviewPairs.push({rank:row.rank,character:row.character,
        componentA:{id:idA,form:sourceById.get(idA).shape,
         sourceHex:origA,firstHex:firstA,foldOptimizedHex:optA},
        componentB:{id:idB,form:sourceById.get(idB).shape,
         sourceHex:origB,firstHex:firstB,foldOptimizedHex:optB},
        originalDeltaOk:Number(originalDistance.toFixed(6)),
        firstDeltaOk:Number(firstDistance.toFixed(6)),
        foldOptimizedDeltaOk:Number(optimizedDistance.toFixed(6)),
        reviewState:!oldFlag&&optimizedFlag?"introduced":
         oldFlag&&!optimizedFlag?"resolved":"retained",
        sourceGeometryChanged:false,visualReview:"pending",
        semanticsApproved:false});
      }
      if(oldFlag)activeClosePairs++;
      if(optimizedFlag&&!oldFlag){introducedOptimizedClosePairs++;introducedInGlyph++;}
      if(oldFlag&&!optimizedFlag)resolvedOriginalClosePairs++;
      if(oldFlag&&optimizedFlag)retainedOriginalClosePairs++;
      if(firstDistance<THRESHOLD){
       firstTrialClosePairs++;firstWarnings++;
      }
      if(optimizedFlag){
       optimizedClosePairs++;lastWarnings++;
      }
      distinctWithinGlyphPairs++;
     }
    if(firstWarnings)charactersWithFirstClosePairs++;
    if(lastWarnings)charactersWithOptimizedClosePairs++;
    if(introducedInGlyph)charactersWithIntroducedClosePairs++;
   }
   assert.equal(activeClosePairs,resolvedOriginalClosePairs+retainedOriginalClosePairs);
   assert.equal(optimizedClosePairs,introducedOptimizedClosePairs+retainedOriginalClosePairs);
   return {characters:rows.length,distinctWithinGlyphPairs,
    activeClosePairs,firstTrialClosePairs,optimizedClosePairs,
    introducedOptimizedClosePairs,resolvedOriginalClosePairs,
    retainedOriginalClosePairs,
    charactersWithFirstClosePairs,charactersWithOptimizedClosePairs,
    charactersWithIntroducedClosePairs,...(captureReview?{reviewPairs}:{})};
  }
  const train=evaluate(training),test=evaluate(heldOut,{captureReview:true});
  assert.equal(test.reviewPairs.length,
   test.introducedOptimizedClosePairs+test.resolvedOriginalClosePairs+
   test.retainedOriginalClosePairs);
  assert.equal(model.groups.flatMap(g=>g.members).length,40);
  // Ensure the optimizer changed no source-only co-occurrences in training.
  assert.equal(train.firstTrialClosePairs-train.optimizedClosePairs,
   model.summary.firstTrialWarningsInAffectedEdges-
    model.summary.optimizedWarningsInAffectedEdges);
  assert.equal(train.characters,800);assert.equal(test.characters,200);
  for(const row of heldOut){
   if(seenHeldout.has(row.rank))throw Error("A glyph appears in multiple held-out folds");
   seenHeldout.add(row.rank);
  }
  allResults.push({foldIndex:fold,
   label:"held-out ranks congruent to "+(fold+1)+" modulo 5",
   trainingRanks:800,heldOutRanks:200,
   excludedFromOptimizer:heldOut.map(row=>row.rank),
   paletteCandidateColors:40,
   learnedCandidateSwatchesChanged:model.summary.changedCandidateSwatches,
   sourcePinnedCandidateColors:model.groups.flatMap(g=>g.members.map(m=>({
    componentId:m.componentId,sourceHex:m.sourceHex,
    optimizedHex:m.optimizedTrialHex,
    originalHistoricalHint:g.historicalHint,
    sourceIdentityPreserved:true,semanticApproval:false
   }))),
   train,test,
   disjointBySourceRank:true,
   independentlyReviewed:false,humanDiscriminationTrial:false});
 }
 assert.equal(seenHeldout.size,FIRST_TRANCHE);
 const trainSum=summaryOf(allResults.map(x=>x.train)),
  testSum=summaryOf(allResults.map(x=>x.test));
 assert.equal(testSum.characters,1000);
 assert.equal(testSum.distinctWithinGlyphPairs,1020);
 assert.equal(testSum.activeClosePairs,26);
 assert.equal(testSum.firstTrialClosePairs,76);
 assert.equal(trainSum.characters,4000);
 assert.equal(trainSum.distinctWithinGlyphPairs,4080);
 assert.equal(trainSum.activeClosePairs,104);
 assert.equal(trainSum.firstTrialClosePairs,304);
 return {schema:"chromalect.palette.historical-hue-five-fold-heldout.v0.1",
  status:"deterministic_800_train_200_heldout_numerical_source_glyph_diagnostic_only",
  provenance:{sourcePalette:"mandarin-component-identity@0.6.0",
   experimentalFamilySource:"unverified_original_40_historical_mnemonic_hints",
   sourceGlyphs:"site/glyphs/mappings.json",
   previousFullSampleRisk:"site/glyphs/research/hint-counterfactual-v0.1/pair-risk-v0.1.json",
   optimizer:"source-cooccurrence coordinate descent trained independently in each fold",
   foldRule:"(rank - 1) modulo 5",
   leakagePolicy:"A held-out glyph is not included in that fold's color co-occurrence optimization graph",
   originalPaletteRecolored:false,
   sourceGlyphGeometryChanged:false,
   independentVisionTrialConducted:false,
   semanticFamilyAdjudicated:false,
   componentIdentitiesCanOccurInBothSets:true},
  summary:{totalSourceGlyphs:1000,folds:5,trainPerFold:800,
   heldOutPerFold:200,sourceComponentColors:520,
   historicalCandidateComponents:40,
   crossFoldTrainingTotals:trainSum,crossFoldHeldOutTotals:testSum,
   independentHumanPerceptualResults:0,
   verifiedSemanticFamilies:0,
   validatedLearningOutcomes:0},
  folds:allResults};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const load=p=>JSON.parse(fs.readFileSync(p,"utf8"));
 const result=deriveHueHoldoutEvaluation(
  load("data/catalog/characters-0001-1000.json"),
  load("site/glyphs/mappings.json"),
  load("palettes/mandarin-component-identity-v0.6.json"),
  load("site/glyphs/research/hint-counterfactual-v0.1/pair-risk-v0.1.json"));
 const target="site/semantic-group-hue-fivefold-heldout-v0.1.json",
  encoded=JSON.stringify(result,null,2)+"\n";
 if(process.argv.includes("--write"))fs.writeFileSync(target,encoded);
 else if(process.argv.includes("--check"))assert.equal(fs.readFileSync(target,"utf8"),encoded);
 else throw Error("Use --write or --check");
 console.log("Five disjoint source glyph held-out cohorts; numerical color warnings, no human results:",JSON.stringify(result.summary.crossFoldHeldOutTotals));
}
