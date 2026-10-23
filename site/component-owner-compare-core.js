/* Local provisional source-owner comparison. No independence or approval inference. */
(() => {
"use strict";
const schema="chromalect.glyph.provisional-owner-note-comparison.v0.1";
function requireCondition(ok,message){if(!ok)throw Error(message);}
function compare(first,second,manifest,targets){
 const audit=globalThis.ChromalectOwnerAdjudication;
 requireCondition(audit&&typeof audit.validateExport==="function","Source owner validator unavailable");
 audit.validateExport(first,manifest,targets);
 audit.validateExport(second,manifest,targets);
 const a=new Map(first.observations.map(x=>[x.trialId,x]));
 const b=new Map(second.observations.map(x=>[x.trialId,x]));
 const counts={matching:0,disagreeing:0,onlyFirst:0,onlySecond:0,unobserved:0};
 let shapeAmbiguities=0,compared=0,matchingEvidenceReferences=0;
 const rows=targets.map(t=>{
  const x=a.get(t.id),y=b.get(t.id);
  let comparison="unobserved";
  const sameEvidenceReference=x&&y?new URL(x.evidenceURL).href===new URL(y.evidenceURL).href:null;
  if(x&&y){
   compared++;
   if(sameEvidenceReference)matchingEvidenceReferences++;
   comparison=x.judgment===y.judgment?"matching":"disagreeing";
   if(x.judgment==="shape_ambiguity"||y.judgment==="shape_ambiguity")
    shapeAmbiguities++;
  }else if(x)comparison="onlyFirst";
  else if(y)comparison="onlySecond";
  counts[comparison]++;
  return {
   trialId:t.id,rank:t.rank,character:t.character,reviewState:t.reviewState,
   sourceSHA256:t.sourceSHA256,
   firstJudgment:x?x.judgment:null,secondJudgment:y?y.judgment:null,
   comparison,sameEvidenceReference,independentlyReconciled:false,sourceOwnerCertified:false
  };
 });
 requireCondition(rows.length===49&&compared===counts.matching+counts.disagreeing&&
  counts.matching+counts.disagreeing+counts.onlyFirst+counts.onlySecond+
   counts.unobserved===49,"Source pair reconciliation count inconsistent");
 // The two exports have no verified reviewer identifiers or independence attestations.
 const identicalObservations=JSON.stringify(first.observations)===
  JSON.stringify(second.observations);
 return {
  schema,
  status:"unblinded_local_provisional_evidence_comparison_not_independent_adjudication",
  source:{
   targetManifest:"glyphs/research/heldout-identification-target-v0.1/index-v0.1.json",
   paletteVersion:"mandarin-component-identity@0.6.0",
   machineKeyIndependentlyVerified:false,
   independentReviewerIdentitiesVerified:false,
   blindedCollection:false
  },
  summary:{
   sourceWarningPairs:49,flaggedGlyphs:48,
   firstRecords:first.observations.length,secondRecords:second.observations.length,
   jointlyObserved:compared,
   matchingProvisionalJudgments:counts.matching,
   conflictingProvisionalJudgments:counts.disagreeing,
   firstOnly:counts.onlyFirst,secondOnly:counts.onlySecond,
   noObservation:counts.unobserved,
   jointShapeAmbiguityObservations:shapeAmbiguities,
   sharedEvidenceReferencePairs:matchingEvidenceReferences,
   differingEvidenceReferencePairs:compared-matchingEvidenceReferences,
   identicalObservationContent:identicalObservations,
   independentReviewerReportsVerified:0,
   sourceOwnerCertifications:0,independentlyReconciledPairs:0,
   approvedSemanticMappings:0,eligibleStudyItems:0
  },
  rows
 };
}
globalThis.ChromalectOwnerCompare={compare};
})();