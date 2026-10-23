/* Local source-owner adjudication observations. No approval authority. */
(() => {
"use strict";
const schema="chromalect.glyph.source-owner-adjudication-notes.v0.1";
const sourcePath="glyphs/research/heldout-identification-target-v0.1/index-v0.1.json";
const status="provisional_source_ownership_notes_not_independent_certification";
const values=new Set(["unresolved","provisional_support","provisional_conflict","shape_ambiguity"]);
const hash=/^[a-f0-9]{64}$/;
const exact=(obj,names)=>!!obj&&typeof obj==="object"&&!Array.isArray(obj)&&
 Object.keys(obj).length===names.length&&names.every(k=>Object.prototype.hasOwnProperty.call(obj,k));
function demand(ok,msg){if(!ok)throw Error(msg);}
function validateTargets(manifest,targets){
 demand(manifest&&manifest.schema==="chromalect.glyph.heldout-identification-targets.v0.1"&&
  manifest.status==="machine_assigned_source_owner_ground_truth_not_independent_visual_adjudication"&&
  manifest.source&&manifest.source.activePalette==="mandarin-component-identity@0.6.0"&&
  manifest.source.ownerKeyIndependentlyVerified===false&&
  manifest.summary&&manifest.summary.independentlyVerifiedAnswerKeys===0&&
  manifest.summary.warningObservations===49&&Array.isArray(targets)&&targets.length===49,
  "Unverified original source target set required");
 const seen=new Set(),counts={introduced:0,resolved:0,retained:0};
 for(let i=0;i<49;i++){
  const a=manifest.targets[i],t=targets[i];
  demand(a===t&&t&&!seen.has(t.id)&&t.id===t.rank+"-"+t.offeredComponents.map(c=>c.id).sort().join("-")&&
   /^\d{1,4}-cmp-\d{4}-cmp-\d{4}$/.test(t.id)&&
   t.sourceOwnershipIndependentlyCertified===false&&t.humanIdentificationResultRecorded===false&&
   t.sourceGeometryUnmodified===true&&t.locatorUsesSameSourcePathGeometry===true&&
   t.semanticsApproved===false&&hash.test(t.sourceSHA256)&&hash.test(t.locatorSHA256)&&
   t.offeredComponents.length===2&&
   t.offeredComponents.some(x=>x.id===t.machineAssignedOwner)&&
   t.offeredComponents.some(x=>x.id===t.otherOwner)&&
   t.locatorSVG===
    "glyphs/research/heldout-identification-target-v0.1/"+t.id+".svg"&&
   Object.prototype.hasOwnProperty.call(counts,t.reviewState),
   "Source owner evidence or sequence drift");
  counts[t.reviewState]++;seen.add(t.id);
 }
 demand(seen.size===49&&counts.introduced===23&&counts.resolved===21&&counts.retained===5,
  "Expected complete independent-review candidate set");
 return targets;
}
function validateComplementaryLocators(data,targets){
 demand(exact(data,["schema","status","source","summary","records"])&&
  data.schema==="chromalect.glyph.owner-complement-locators.v0.1"&&
  data.status==="source_owned_complementary_region_masks_not_independent_adjudication",
  "Unrecognized complementary locator research source");
 const src=data.source,summary=data.summary;
 demand(exact(src,["identificationTargets","paletteVersion","sourceSVGsChanged",
  "originalLocatorSVGsChanged","independentKeyApproval"])&&
  src.identificationTargets===sourcePath&&
  src.paletteVersion==="mandarin-component-identity@0.6.0"&&
  src.sourceSVGsChanged===false&&src.originalLocatorSVGsChanged===false&&
  src.independentKeyApproval===false&&
  exact(summary,["warningPairs","sourceGlyphs","complementaryMasks",
   "independentlyApprovedOwners","humanVisualCertifications","eligibleStudyItems"])&&
  summary.warningPairs===49&&summary.sourceGlyphs===48&&
  summary.complementaryMasks===49&&summary.independentlyApprovedOwners===0&&
  summary.humanVisualCertifications===0&&summary.eligibleStudyItems===0&&
  Array.isArray(data.records)&&data.records.length===49,
  "Complementary source geometry or approval status mismatch");
 const fields=["trialId","rank","character","reviewState","sourceSVG","sourceSHA256",
  "locatorSVG","locatorSHA256","machineAssignedOwner","otherOwner",
  "complementarySVG","complementarySHA256","originalTargetPaths",
  "complementaryTargetPaths","totalSourcePaths","unchangedPathGeometry",
  "independentOwnershipCertified","participantStudyEligible","semanticApproval"];
 const result=new Map();
 for(let i=0;i<49;i++){
  const row=data.records[i],t=targets[i];
  demand(exact(row,fields)&&row.trialId===t.id&&row.rank===t.rank&&
   row.character===t.character&&row.reviewState===t.reviewState&&
   row.sourceSVG===t.sourceSVG&&row.sourceSHA256===t.sourceSHA256&&
   row.locatorSVG===t.locatorSVG&&row.locatorSHA256===t.locatorSHA256&&
   row.machineAssignedOwner===t.machineAssignedOwner&&row.otherOwner===t.otherOwner&&
   row.complementarySVG==="glyphs/research/owner-complement-locators-v0.1/"+
    t.id+".svg"&&hash.test(row.complementarySHA256)&&
   row.complementarySHA256!==t.locatorSHA256&&
   row.originalTargetPaths===t.targetRegionPaths&&
   Number.isInteger(row.complementaryTargetPaths)&&
   row.complementaryTargetPaths>0&&
   row.complementaryTargetPaths<t.sourceStrokePaths&&
   row.totalSourcePaths===t.sourceStrokePaths&&
   row.unchangedPathGeometry===true&&row.independentOwnershipCertified===false&&
   row.participantStudyEligible===false&&row.semanticApproval===false,
   "Unrecognized or independently approved complementary source owner");
  result.set(t.id,row);
 }
 demand(result.size===49,"Duplicate complementary source owner record");
 return result;
}
function validEvidence(url){
 if(typeof url!=="string"||url.length>1000)return false;
 try{
  const u=new URL(url);
  return u.protocol==="https:"&&!!u.hostname&&!u.username&&!u.password&&!u.hash&&!u.search;
 }catch{return false;}
}
function validateEntry(entry,target){
 const names=["trialId","rank","character","sourceSVG","locatorSVG","sourceSHA256",
  "locatorSHA256","componentIds","machineAssignedOwner","judgment","evidenceURL",
  "technicalRationale","sourceOwnerCertified","glyphVisualCertified",
  "studyEligibilityApproved","semanticApproval"];
 demand(exact(entry,names)&&entry.trialId===target.id&&entry.rank===target.rank&&
  entry.character===target.character&&entry.sourceSVG===target.sourceSVG&&
  entry.locatorSVG===target.locatorSVG&&entry.sourceSHA256===target.sourceSHA256&&
  entry.locatorSHA256===target.locatorSHA256&&Array.isArray(entry.componentIds)&&
  entry.componentIds.length===2&&
  entry.componentIds.every((id,i)=>id===target.offeredComponents[i].id)&&
  entry.machineAssignedOwner===target.machineAssignedOwner&&
  values.has(entry.judgment)&&entry.judgment!=="unresolved"&&
  validEvidence(entry.evidenceURL)&&
  typeof entry.technicalRationale==="string"&&
  entry.technicalRationale.trim().length>=40&&entry.technicalRationale.length<=3000&&
  entry.sourceOwnerCertified===false&&entry.glyphVisualCertified===false&&
  entry.studyEligibilityApproved===false&&entry.semanticApproval===false,
  "Unrecognized source-grounded note, inadequate independent evidence, or certification claim");
}
function exportNotes(targets,notes,when){
 demand(Array.isArray(targets)&&targets.length===49&&notes instanceof Map&&
  [...notes.keys()].every(k=>targets.some(t=>t.id===k)),"Unknown source target");
 demand(typeof when==="string"&&/^\d{4}-\d\d-\d\dT/.test(when)&&
  !Number.isNaN(Date.parse(when)),"UTC timestamp required");
 const entries=[];
 for(const t of targets){
  if(!notes.has(t.id))continue;
  const n=notes.get(t.id);
  const row={trialId:t.id,rank:t.rank,character:t.character,sourceSVG:t.sourceSVG,
   locatorSVG:t.locatorSVG,sourceSHA256:t.sourceSHA256,
   locatorSHA256:t.locatorSHA256,componentIds:t.offeredComponents.map(c=>c.id),
   machineAssignedOwner:t.machineAssignedOwner,judgment:n.judgment,
   evidenceURL:n.evidenceURL,technicalRationale:n.technicalRationale,
   sourceOwnerCertified:false,glyphVisualCertified:false,
   studyEligibilityApproved:false,semanticApproval:false};
  validateEntry(row,t);entries.push(row);
 }
 demand(entries.length>0,"At least one documented, unapproved observation required");
 return {schema,status,
  source:{targets:sourcePath,paletteVersion:"mandarin-component-identity@0.6.0",
   machineKeyIndependentlyVerified:false,sourceGeometryReassigned:false},
  session:{localOnly:true,uploaded:false,browserPersisted:false,
   includesPersonalIdentifiers:false,exportedAtUTC:when,
   recorded:entries.length,sourceOwnerCertifications:0,
   glyphVisualCertifications:0,participantStudyApprovals:0},
  observations:entries};
}
function validateExport(data,manifest,targets){
 validateTargets(manifest,targets);
 demand(exact(data,["schema","status","source","session","observations"])&&
  data.schema===schema&&data.status===status,"Unrecognized or approved export");
 demand(exact(data.source,["targets","paletteVersion","machineKeyIndependentlyVerified",
  "sourceGeometryReassigned"])&&data.source.targets===sourcePath&&
  data.source.paletteVersion==="mandarin-component-identity@0.6.0"&&
  data.source.machineKeyIndependentlyVerified===false&&
  data.source.sourceGeometryReassigned===false,"Source provenance cannot be promoted");
 const s=data.session;
 demand(exact(s,["localOnly","uploaded","browserPersisted","includesPersonalIdentifiers",
  "exportedAtUTC","recorded","sourceOwnerCertifications",
  "glyphVisualCertifications","participantStudyApprovals"])&&
  s.localOnly===true&&s.uploaded===false&&s.browserPersisted===false&&
  s.includesPersonalIdentifiers===false&&
  typeof s.exportedAtUTC==="string"&&!Number.isNaN(Date.parse(s.exportedAtUTC))&&
  s.sourceOwnerCertifications===0&&s.glyphVisualCertifications===0&&
  s.participantStudyApprovals===0,"Unapproved session claims or personal fields");
 demand(Array.isArray(data.observations)&&data.observations.length>=1&&
  data.observations.length<=49&&s.recorded===data.observations.length,
  "Incomplete or contradictory local observation count");
 const byId=new Map(targets.map(t=>[t.id,t])),seen=new Set();
 let previous=-1;
 for(const row of data.observations){
  const target=byId.get(row.trialId),index=targets.indexOf(target);
  demand(target&&!seen.has(row.trialId)&&index>previous,
   "Unknown, duplicate, or out-of-order source observation");
  validateEntry(row,target);seen.add(row.trialId);previous=index;
 }
 return {recorded:data.observations.length,certified:0};
}
globalThis.ChromalectOwnerAdjudication={validateTargets,validateComplementaryLocators,exportNotes,validateExport};
})();