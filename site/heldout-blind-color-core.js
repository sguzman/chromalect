/* Held-out color blind-comparison REHEARSAL: no independent visual certification.
 * Local-only observations, balanced order, no automatic upload or storage.
 * The original v0.6 identity palette and source geometry remain authoritative.
 */
(() => {
"use strict";
const schema="chromalect.glyph.heldout-blind-presentation-rehearsal.v0.1";
const states=new Set(["introduced","resolved","retained"]);
const answers=new Set(["left_clearer","right_clearer","similar","cannot_judge"]);
const sizes=new Set([24,32,48,64,96]);
const surfaces=new Set(["white","black","theme"]);
const hashRegex=/^[a-f0-9]{64}$/;
const idOf=(rank,a,b)=>rank+"|"+[a,b].sort().join("|");
function oklab(hex){
 assert(/^#[0-9a-f]{6}$/i.test(hex),"Source sRGB hex required for OKLab comparison");
 const [r,g,b]=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255)
  .map(c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4);
 const l=Math.cbrt(.4122214708*r+.5363325363*g+.0514459929*b);
 const m=Math.cbrt(.2119034982*r+.6806995451*g+.1073969566*b);
 const x=Math.cbrt(.0883024619*r+.2817188376*g+.6299787005*b);
 return [.2104542553*l+.7936177850*m-.0040720468*x,
  1.9779984951*l-2.4285922050*m+.4505937099*x,
  .0259040371*l+.7827717662*m-.8086757660*x];
}
function distance(hexA,hexB){
 const a=oklab(hexA),b=oklab(hexB);
 return Math.hypot(...a.map((v,i)=>v-b[i]));
}
function keysOnly(value,keys){
 return value&&Object.keys(value).every(key=>keys.includes(key));
}
function assert(test,reason){if(!test)throw Error(reason);}
function validateSource(manifest,folds,palette){
 assert(manifest.schema==="chromalect.glyph.heldout-color-warning-review.v0.1"&&
  manifest.status==="source_pinned_heldout_warning_review_not_visual_or_semantic_certification",
  "Unexpected source glyph review manifest");
 assert(manifest.provenance.sourcePalette==="mandarin-component-identity@0.6.0"&&
  manifest.provenance.excludedGlyphsUsedForTraining===false&&
  manifest.provenance.sourceGlyphsOverwritten===false&&
  manifest.provenance.componentOwnerGeometryChanged===false&&
  manifest.provenance.humanVisualAssessments===0&&
  manifest.provenance.semanticFamiliesApproved===0,
  "Source glyph geometry, trial partition, or review status changed");
 const ms=manifest.summary;
 assert(ms.catalogGlyphs===1000&&ms.folds===5&&
  ms.totalWithinGlyphPairs===1020&&ms.originalWarnings===26&&
  ms.firstGroupWarnings===76&&ms.foldOptimizedWarnings===28&&
  ms.introducedWarnings===23&&ms.resolvedWarnings===21&&
  ms.retainedWarnings===5&&ms.totalPairReviewObservations===49&&
  ms.newlyFlaggedGlyphs===23&&
  ms.visuallyCertifiedGlyphs===0&&ms.approvedSemanticFamilies===0&&
  Array.isArray(manifest.glyphs)&&manifest.glyphs.length===48,
  "Review cohort or status is not the pinned source census");
 assert(folds.schema==="chromalect.palette.historical-hue-five-fold-heldout.v0.1"&&
  folds.status==="deterministic_800_train_200_heldout_numerical_source_glyph_diagnostic_only"&&
  folds.provenance.originalPaletteRecolored===false&&
  folds.provenance.independentVisionTrialConducted===false&&
  folds.provenance.semanticFamilyAdjudicated===false&&
  folds.summary.crossFoldHeldOutTotals.activeClosePairs===26&&
  folds.summary.crossFoldHeldOutTotals.optimizedClosePairs===28&&
  folds.summary.crossFoldHeldOutTotals.introducedOptimizedClosePairs===23&&
  folds.summary.crossFoldHeldOutTotals.resolvedOriginalClosePairs===21&&
  folds.summary.crossFoldHeldOutTotals.retainedOriginalClosePairs===5&&
  Array.isArray(folds.folds)&&folds.folds.length===5,
  "Fold source or experimental status changed");
 assert(palette.schema==="chromalect.component-palette.v0"&&
  palette.id==="mandarin-component-identity"&&palette.version==="0.6.0"&&
  Array.isArray(palette.components)&&palette.components.length===520,
  "Production palette version or completeness changed");
 const originals=new Map(palette.components.map(x=>[x.id,x]));
 assert(originals.size===520,"Duplicate original component ID");
 const foldPalette=new Map();
 for(let i=0;i<5;i++){
  const f=folds.folds[i];
  assert(f.foldIndex===i&&f.heldOutRanks===200&&f.trainingRanks===800&&
   f.disjointBySourceRank===true&&f.independentlyReviewed===false&&
   f.humanDiscriminationTrial===false&&
   Array.isArray(f.excludedFromOptimizer)&&f.excludedFromOptimizer.length===200&&
   Array.isArray(f.sourcePinnedCandidateColors)&&f.sourcePinnedCandidateColors.length===40,
   "Fold training/testing or visual review status changed");
  const ranks=new Set(f.excludedFromOptimizer);
  assert(ranks.size===200&&[...ranks].every(rank=>
   Number.isInteger(rank)&&rank>0&&rank<=1000&&(rank-1)%5===i),
   "Held-out fold exclusions overlap the training partition");
  const colors=new Map();
  for(const c of f.sourcePinnedCandidateColors){
   const orig=originals.get(c.componentId);
   assert(orig&&orig.color===c.sourceHex&&
    c.semanticApproval===false&&c.sourceIdentityPreserved===true&&
    /^#[0-9A-F]{6}$/.test(c.optimizedHex)&&!colors.has(c.componentId),
    "Fold-trained candidate differs from original source identity");
   colors.set(c.componentId,c.optimizedHex);
  }
  assert(colors.size===40,"Incomplete fold candidate colors");
  foldPalette.set(i,{ranks,colors});
 }
 const trials=[],seen=new Set(),ranks=new Set(),counts={introduced:0,resolved:0,retained:0};
 let lastRank=0;
 for(const row of manifest.glyphs){
  const file="U+"+row.character.codePointAt(0).toString(16)
   .toUpperCase().padStart(4,"0")+".svg";
  const fold=foldPalette.get(row.foldIndex);
  assert(Number.isInteger(row.rank)&&row.rank>lastRank&&row.rank<=1000&&
   row.character.length>0&&[...row.character].length===1&&
   hashRegex.test(row.originalSHA256)&&hashRegex.test(row.heldoutSHA256)&&
   fold&&fold.ranks.has(row.rank)&&!ranks.has(row.rank)&&
   row.originalSVG==="glyphs/"+file&&
   row.heldoutSVG==="glyphs/research/heldout-warning-v0.1/"+file&&
   hashRegex.test(row.originalSHA256)&&hashRegex.test(row.heldoutSHA256)&&
   row.sourceGeometryIdentical===true&&row.sourceOwnersIdentical===true&&
   row.activePaletteUnchanged===true&&
   row.visualReview==="pending"&&row.semanticReview==="unapproved"&&
   Array.isArray(row.pairs)&&row.pairs.length>0,
   "Source rank, original SVG or review state inconsistent");
  ranks.add(row.rank);lastRank=row.rank;
  for(const pair of row.pairs){
   const a=pair.componentA,b=pair.componentB;
   assert(states.has(pair.reviewState)&&a&&b&&a.id!==b.id&&
    pair.visualReview==="pending"&&pair.semanticsApproved===false&&
    pair.sourceGeometryChanged===false&&
    Number.isFinite(pair.originalDeltaOk)&&
    Number.isFinite(pair.foldOptimizedDeltaOk),
    "Missing, identical or promoted review component pair");
   for(const c of [a,b]){
    const source=originals.get(c.id);
    assert(source&&source.color===c.sourceHex&&source.shape===c.form&&
     c.foldOptimizedHex===(fold.colors.get(c.id)??source.color),
     "Fold-trained pair is not source-matched");
   }
   const oldDistance=distance(a.sourceHex,b.sourceHex),
    foldDistance=distance(a.foldOptimizedHex,b.foldOptimizedHex);
   assert(Math.abs(oldDistance-pair.originalDeltaOk)<=.000001&&
    Math.abs(foldDistance-pair.foldOptimizedDeltaOk)<=.000001,
    "Measured source/fold pair distances differ from colors");
   const expected=oldDistance>=.07&&foldDistance<.07?
    "introduced":oldDistance<.07&&foldDistance>=.07?
    "resolved":oldDistance<.07&&foldDistance<.07?"retained":"invalid";
   assert(pair.reviewState===expected,"Numerical state does not match distance");
   const id=idOf(row.rank,a.id,b.id);
   assert(!seen.has(id),"Repeated pair within source glyph");seen.add(id);
   counts[pair.reviewState]++;
   trials.push({id,rank:row.rank,character:row.character,
    foldIndex:row.foldIndex,reviewState:pair.reviewState,
    originalSVG:row.originalSVG,heldoutSVG:row.heldoutSVG,
    sourceSHA256:row.originalSHA256,heldoutSHA256:row.heldoutSHA256,
    componentIds:[a.id,b.id].sort()});
  }
 }
 assert(trials.length===49&&seen.size===49&&ranks.size===48&&
  counts.introduced===23&&counts.resolved===21&&counts.retained===5,
  "Review trial list does not match source-derived 49-pair census");
 return trials;
}
function permutation(trials,seed){
 assert(Number.isInteger(seed)&&seed>0&&seed<=4294967295,
  "A 32-bit nonzero session seed is required");
 let rng=seed>>>0;
 const rand=()=>{
  rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;
  return(rng>>>0)/4294967296;
 };
 const shuffled=trials.map((row,i)=>({...row,sourceIndex:i}));
 for(let i=shuffled.length-1;i>0;i--){
  const j=Math.floor(rand()*(i+1));
  [shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];
 }
 // Exactly 25 left-original and 24 left-experimental presentations.
 const orientations=shuffled.map((_,i)=>i<25?"original":"experimental");
 for(let i=orientations.length-1;i>0;i--){
  const j=Math.floor(rand()*(i+1));
  [orientations[i],orientations[j]]=[orientations[j],orientations[i]];
 }
 return shuffled.map((t,i)=>({
  id:t.id,rank:t.rank,foldIndex:t.foldIndex,
  reviewState:t.reviewState,position:i+1,
  sourceIndex:t.sourceIndex,originalSVG:t.originalSVG,
  heldoutSVG:t.heldoutSVG,sourceSHA256:t.sourceSHA256,
  heldoutSHA256:t.heldoutSHA256,componentIds:t.componentIds,
  leftCondition:orientations[i]
 }));
}
function createSession(plan,answersById,settings,seed,exportedAt){
 assert(sizes.has(settings.pixelSize)&&surfaces.has(settings.surface)&&
  ["color","grayscale"].includes(settings.appearance),
  "A supported, session-constant display condition is required");
 assert(Number.isInteger(seed)&&seed>0&&seed<=4294967295,
  "Invalid session seed");
 assert(typeof exportedAt==="string"&&!Number.isNaN(Date.parse(exportedAt))&&
  /^\d{4}-\d\d-\d\dT/.test(exportedAt),
  "ISO UTC export time required");
 const responses=plan.filter(t=>answersById.has(t.id)).map(t=>{
  const response=answersById.get(t.id);
  assert(answers.has(response),"Invalid provisional comparison response");
  return {trialId:t.id,rank:t.rank,foldIndex:t.foldIndex,
   presentationIndex:t.position,leftCondition:t.leftCondition,
   response,sourceConditionRevealedBeforeResponse:false,
   sourceGlyphGeometryIdentical:true,visualCertificationGranted:false,
   semanticFamilyApproved:false};
 });
 return {schema,status:"local_visual_preference_rehearsal_not_independent_visual_certification",
  source:{manifest:"glyphs/research/heldout-warning-v0.1/index-v0.1.json",
   palette:"mandarin-component-identity@0.6.0",folds:5,
   machineFlaggedPairObservations:49,independentlyCertifiedGlyphs:0},
  session:{localOnly:true,automaticallyUploaded:false,persistedInBrowser:false,
   exportedAtUTC:exportedAt,randomSeed:seed,
   randomizedPresentation:true,balancedOriginalLeft:25,
   balancedExperimentalLeft:24,planned:49,recorded:responses.length,
   conditionRevealAfterSessionOnly:true,display:settings,
   participantEligibilityVerified:false,ethicsProtocolApproved:false,
   independentlyAdjudicated:false},
  observations:responses};
}
function validateSession(session,trials){
 assert(keysOnly(session,["schema","status","source","session","observations"])&&
  keysOnly(session.source,["manifest","palette","folds","machineFlaggedPairObservations","independentlyCertifiedGlyphs"])&&
  keysOnly(session.session,["localOnly","automaticallyUploaded","persistedInBrowser",
   "exportedAtUTC","randomSeed","randomizedPresentation","balancedOriginalLeft",
   "balancedExperimentalLeft","planned","recorded","conditionRevealAfterSessionOnly",
   "display","participantEligibilityVerified","ethicsProtocolApproved",
   "independentlyAdjudicated"])&&
  session.observations.every(x=>keysOnly(x,["trialId","rank","foldIndex",
   "presentationIndex","leftCondition","response",
   "sourceConditionRevealedBeforeResponse","sourceGlyphGeometryIdentical",
   "visualCertificationGranted","semanticFamilyApproved"])),
  "Unrecognized or private participant/session metadata in a local observation export");
 assert(session.schema===schema&&
  session.status==="local_visual_preference_rehearsal_not_independent_visual_certification"&&
  session.source.manifest==="glyphs/research/heldout-warning-v0.1/index-v0.1.json"&&
  session.source.palette==="mandarin-component-identity@0.6.0"&&
  session.source.folds===5&&session.source.machineFlaggedPairObservations===49&&
  session.source.independentlyCertifiedGlyphs===0,
  "Export source or certification boundary differs");
 const s=session.session;
 assert(s.localOnly===true&&s.automaticallyUploaded===false&&
  s.persistedInBrowser===false&&s.randomizedPresentation===true&&
  s.balancedOriginalLeft===25&&s.balancedExperimentalLeft===24&&
  s.planned===49&&s.conditionRevealAfterSessionOnly===true&&
  s.participantEligibilityVerified===false&&
  s.ethicsProtocolApproved===false&&s.independentlyAdjudicated===false,
  "An experimental observation is not a certified participant study");
 const plan=permutation(trials,s.randomSeed);
 assert(sizes.has(s.display.pixelSize)&&surfaces.has(s.display.surface)&&
  ["color","grayscale"].includes(s.display.appearance),
  "Unsupported display condition");
 assert(Array.isArray(session.observations)&&
  session.observations.length===s.recorded&&s.recorded<=49,
  "Observation count mismatch");
 let last=0;const used=new Set();
 for(const row of session.observations){
  const trial=plan.find(t=>t.id===row.trialId);
  assert(trial&&!used.has(row.trialId)&&
   row.rank===trial.rank&&row.foldIndex===trial.foldIndex&&
   row.presentationIndex===trial.position&&
   row.presentationIndex>last&&row.leftCondition===trial.leftCondition&&
   answers.has(row.response)&&
   row.sourceConditionRevealedBeforeResponse===false&&
   row.sourceGlyphGeometryIdentical===true&&
   row.visualCertificationGranted===false&&
   row.semanticFamilyApproved===false,
   "Trial answer, randomization or independent approval inconsistent");
  used.add(row.trialId);last=row.presentationIndex;
 }
 return {localResponses:s.recorded,productionVisualCertifications:0,
  independentPerceptualResults:0,semanticApprovals:0};
}
globalThis.ChromalectBlindColorRehearsal=Object.freeze({
 schema,validateSource,permutation,createSession,validateSession
});
})();
