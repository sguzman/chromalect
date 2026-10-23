/* Strict schema validation of neutral, key-separated display manifests. */
(() => {
"use strict";
const ROOT="glyphs/research/owner-masked-stimuli-v0.1";
const exact=(x,keys)=>!!x&&typeof x==="object"&&!Array.isArray(x)&&
 Object.keys(x).length===keys.length&&keys.every(k=>Object.hasOwn(x,k));
function demand(ok,msg){if(!ok)throw Error(msg);}
function validate(data){
 demand(exact(data,["schema","status","source","summary","records"])&&
  data.schema==="chromalect.glyph.owner-masked-stimuli.v0.1"&&
  data.status==="neutral_key_separated_preview_not_independently_blinded_or_reviewed",
  "Unrecognized neutral source presentation manifest");
 const s=data.source,m=data.summary;
 demand(exact(s,["originalTargetManifest","paletteVersion",
  "ownerKeysInPublishedStimuli","ownerKeysRemainPublicInOriginalManifests",
  "sourcePathGeometryModified","independentKeyAcceptance"])&&
  s.originalTargetManifest==="glyphs/research/heldout-identification-target-v0.1/index-v0.1.json"&&
  s.paletteVersion==="mandarin-component-identity@0.6.0"&&
  s.ownerKeysInPublishedStimuli===false&&
  s.ownerKeysRemainPublicInOriginalManifests===true&&
  s.sourcePathGeometryModified===false&&s.independentKeyAcceptance===false,
  "Neutral mask provenance or independence claim changed");
 demand(exact(m,["pairs","characters","maskFiles","introduced","resolved","retained",
  "independentlyAcceptedOwners","participantResponsesCollected","eligibleStudyItems"])&&
  m.pairs===49&&m.characters===48&&m.maskFiles===98&&
  m.introduced===23&&m.resolved===21&&m.retained===5&&
  m.independentlyAcceptedOwners===0&&m.participantResponsesCollected===0&&
  m.eligibleStudyItems===0&&
  Array.isArray(data.records)&&data.records.length===49,
  "Missing source pair or unearned independent approval");
 const counts={introduced:0,resolved:0,retained:0};
 const seen=new Set(),characters=new Set();
 let lastRank=0;
 for(const row of data.records){
  demand(exact(row,["id","rank","character","reviewState","sourceSHA256",
   "sourceStrokePaths","candidates","independentlyVerifiedOwner",
   "evidenceCollectionEnabled","learningStudyEligible"])&&
   /^\d{1,4}-cmp-\d{4}-cmp-\d{4}$/.test(row.id)&&
   Number.isInteger(row.rank)&&row.rank>0&&row.rank<=1000&&
   row.rank>=lastRank&&typeof row.character==="string"&&
   [...row.character].length===1&&
   /^[a-f0-9]{64}$/.test(row.sourceSHA256)&&
   Number.isInteger(row.sourceStrokePaths)&&row.sourceStrokePaths>1&&
   Object.hasOwn(counts,row.reviewState)&&!seen.has(row.id)&&
   row.independentlyVerifiedOwner===false&&
   row.evidenceCollectionEnabled===false&&
   row.learningStudyEligible===false&&
   Array.isArray(row.candidates)&&row.candidates.length===2,
   "Invalid masked source pair or independent owner claim");
  lastRank=row.rank;seen.add(row.id);characters.add(row.character);
  counts[row.reviewState]++;
  let dark=0;
  for(const [i,c] of row.candidates.entries()){
   const slot=i===0?"A":"B";
   demand(exact(c,["slot","form","svg","sha256","highlightedPaths"])&&
    c.slot===slot&&typeof c.form==="string"&&c.form.length>0&&c.form.length<=24&&
    c.svg===ROOT+"/"+row.id+"--"+slot+".svg"&&
    /^[a-f0-9]{64}$/.test(c.sha256)&&
    Number.isInteger(c.highlightedPaths)&&
    c.highlightedPaths>0&&c.highlightedPaths<row.sourceStrokePaths,
    "Mask geometry, source identity, or presentation order mismatch");
   dark+=c.highlightedPaths;
  }
  demand(row.candidates[0].sha256!==row.candidates[1].sha256&&
   dark<=row.sourceStrokePaths,"Masked candidate geometry overlaps unexpectedly");
 }
 demand(seen.size===49&&characters.size===48&&
  counts.introduced===23&&counts.resolved===21&&counts.retained===5,
  "Neutral cohort counts or unique characters changed");
 return data.records;
}
globalThis.ChromalectMaskedSourcePreview={validate};
})();