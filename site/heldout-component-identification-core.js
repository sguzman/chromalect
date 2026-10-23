/* Machine-keyed component ownership identification rehearsal.
 * Source-grounded answers are NOT independently verified. This is an
 * instrument test, not a recognized component-discrimination study.
 */
(() => {
"use strict";
const schema="chromalect.glyph.heldout-component-identification-rehearsal.v0.1";
const expectedStatus="local_machine_keyed_component_rehearsal_not_independent_visual_validation";
const expectedInput="machine_assigned_source_owner_ground_truth_not_independent_visual_adjudication";
const sizes=new Set([24,32,48,64,96]);
const surfaces=new Set(["white","black"]);
const treatments=new Set(["color","grayscale"]);
const states=new Set(["introduced","resolved","retained"]);
const hex=/^[a-f0-9]{64}$/;
const allowedAnswers=new Set(["left","right","cannot_judge"]);
const required=(ok,reason)=>{if(!ok)throw Error(reason);};
const exactKeys=(obj,keys)=>obj&&
 Object.keys(obj).length===keys.length&&
 keys.every(k=>Object.prototype.hasOwnProperty.call(obj,k));
function validateSource(targetManifest,sourcePairs){
 required(targetManifest.schema==="chromalect.glyph.heldout-identification-targets.v0.1"&&
  targetManifest.status===expectedInput,
  "Unrecognized source-identification target set");
 const refs=targetManifest.source,summary=targetManifest.summary;
 required(refs.warningManifest==="glyphs/research/heldout-warning-v0.1/index-v0.1.json"&&
  refs.activePalette==="mandarin-component-identity@0.6.0"&&
  refs.sourceGeometryModified===false&&refs.foldExperimentalGlyphsModified===false&&
  refs.targetLocatorsSeparateFromColorConditions===true&&
  refs.ownerKeyIndependentlyVerified===false&&refs.participantStudyApproved===false&&
  refs.semanticMeaningApproved===false,"Source interpretation has been promoted");
 required(summary.catalogCharacters===1000&&summary.warningObservations===49&&
  summary.flaggedCharacters===48&&summary.introduced===23&&
  summary.resolved===21&&summary.retained===5&&
  summary.targetA===25&&summary.targetB===24&&summary.separateLocators===49&&
  summary.independentlyVisualCertified===0&&
  summary.independentlyVerifiedAnswerKeys===0&&
  summary.humanResponses===0&&summary.approvedSemanticMappings===0&&
  Array.isArray(targetManifest.targets)&&targetManifest.targets.length===49&&
  Array.isArray(sourcePairs)&&sourcePairs.length===49,
  "Source count or independent-review boundary mismatch");
 const originalPairs=new Map(sourcePairs.map(r=>[r.id.replaceAll("|","-"),r]));
 required(originalPairs.size===49,"Duplicate original source warning ID");
 const used=new Set(),counts={introduced:0,resolved:0,retained:0};
 let targetA=0;
 for(const t of targetManifest.targets){
  const original=originalPairs.get(t.id);
  const fname=t.id+".svg";
  required(original&&!used.has(t.id)&&t.id===t.rank+"-"+t.offeredComponents.map(x=>x.id).sort().join("-")&&
   original.rank===t.rank&&original.foldIndex===t.foldIndex&&
   original.reviewState===t.reviewState&&
   original.originalSVG===t.sourceSVG&&original.heldoutSVG===t.foldSVG&&
   original.sourceSHA256===t.sourceSHA256&&original.heldoutSHA256===t.foldSHA256&&
   t.locatorSVG==="glyphs/research/heldout-identification-target-v0.1/"+fname&&
   hex.test(t.locatorSHA256)&&
   states.has(t.reviewState)&&
   t.sourceGeometryUnmodified===true&&
   t.locatorUsesSameSourcePathGeometry===true&&
   t.sourceOwnershipIndependentlyCertified===false&&
   t.humanIdentificationResultRecorded===false&&
   t.semanticsApproved===false&&
   t.targetSelectionRule==="alternating_A_B_by_source_warning_order"&&
   Array.isArray(t.offeredComponents)&&t.offeredComponents.length===2&&
   Number.isInteger(t.targetRegionPaths)&&t.targetRegionPaths>0&&
   Number.isInteger(t.sourceStrokePaths)&&t.targetRegionPaths<=t.sourceStrokePaths,
   "Missing source-linked target or certified/altered stimulus");
  const offered=original.componentIds;
  required(offered.length===2&&
   t.offeredComponents[0].id===offered[0]&&
   t.offeredComponents[1].id===offered[1]&&
   t.offeredComponents.every(o=>/^cmp-\d{4}$/.test(o.id)&&
    typeof o.form==="string"&&o.form.length>0)&&
   [t.offeredComponents[0].id,t.offeredComponents[1].id].includes(t.machineAssignedOwner)&&
   t.otherOwner!==t.machineAssignedOwner&&
   [t.machineAssignedOwner,t.otherOwner].sort().join("|")===
    offered.slice().sort().join("|"),"Target key is not derived from the original source component pair");
  if(t.machineAssignedOwner===offered[0].id)targetA++;
  used.add(t.id);counts[t.reviewState]++;
 }
 required(used.size===49&&targetA===25&&counts.introduced===23&&
  counts.resolved===21&&counts.retained===5,
  "Source-owned task census or target side balance mismatch");
 return targetManifest.targets;
}
function randomizer(seed){
 required(Number.isInteger(seed)&&seed>=1&&seed<=4294967295,
  "Nonzero 32-bit replay seed required");
 let state=seed>>>0;
 return ()=>{
  state^=state<<13;state^=state>>>17;state^=state<<5;
  return(state>>>0)/4294967296;
 };
}
function shuffle(values,rand){
 const list=values.slice();
 for(let i=list.length-1;i>0;i--){
  const j=Math.floor(rand()*(i+1));
  [list[i],list[j]]=[list[j],list[i]];
 }
 return list;
}
function plan(targets,seed){
 required(Array.isArray(targets)&&targets.length===49&&
  new Set(targets.map(x=>x.id)).size===49,
  "The complete source-owned target set is required");
 const rng=randomizer(seed);
 const order=shuffle(targets,rng);
 const colors=shuffle(order.map((_,i)=>i<25?"original":"experimental"),rng);
 const firstAnswer=shuffle(order.map((_,i)=>i<25?"target":"other"),rng);
 return order.map((t,i)=>({
  id:t.id,rank:t.rank,character:t.character,foldIndex:t.foldIndex,
  reviewState:t.reviewState,position:i+1,
  presentation:colors[i],
  correctLeft:firstAnswer[i]==="target",
  leftChoice:firstAnswer[i]==="target"?t.machineAssignedOwner:t.otherOwner,
  rightChoice:firstAnswer[i]==="target"?t.otherOwner:t.machineAssignedOwner,
  locatorSVG:t.locatorSVG,
  sourceSVG:t.sourceSVG,foldSVG:t.foldSVG,
  offeredComponents:t.offeredComponents.map(x=>({id:x.id,form:x.form})),
  machineAssignedOwner:t.machineAssignedOwner
 }));
}
function displayCheck(display){
 required(exactKeys(display,["pixelSize","surface","appearance"])&&
  sizes.has(display.pixelSize)&&surfaces.has(display.surface)&&
  treatments.has(display.appearance),"Unsupported or uncontrolled display condition");
}
function exportSession(schedule,responses,display,seed,when){
 displayCheck(display);
 const replay=plan(schedule.map(t=>({id:t.id,rank:t.rank,
  character:t.character,foldIndex:t.foldIndex,
  reviewState:t.reviewState,locatorSVG:t.locatorSVG,
  sourceSVG:t.sourceSVG,foldSVG:t.foldSVG,
  offeredComponents:t.offeredComponents,
  machineAssignedOwner:t.machineAssignedOwner,
  otherOwner:t.machineAssignedOwner===t.offeredComponents[0].id?
   t.offeredComponents[1].id:t.offeredComponents[0].id})),seed);
 required(schedule.length===49&&schedule.every((t,i)=>
  t.position===replay[i].position&&t.id===replay[i].id&&
  t.presentation===replay[i].presentation&&
  t.leftChoice===replay[i].leftChoice&&
  t.rightChoice===replay[i].rightChoice),
  "Trial plan must match its source-derived random seed");
 required(responses instanceof Map&&
  [...responses.keys()].every(id=>schedule.some(t=>t.id===id))&&
  [...responses.values()].every(answer=>allowedAnswers.has(answer)),
  "Only predefined local trial responses are permitted");
 required(typeof when==="string"&&/^\d{4}-\d\d-\d\dT/.test(when)&&
  !Number.isNaN(Date.parse(when)),
  "An ISO session export timestamp is required");
 const observations=schedule.filter(t=>responses.has(t.id)).map(t=>{
  const answer=responses.get(t.id),choice=answer==="cannot_judge"?null:
   answer==="left"?t.leftChoice:t.rightChoice;
  return {trialId:t.id,rank:t.rank,presentationIndex:t.position,
   treatment:t.presentation,
   optionLeft:t.leftChoice,optionRight:t.rightChoice,
   answer,selectedOwner:choice,
   agreesWithUnverifiedSourceOwner:choice===null?null:
    choice===t.machineAssignedOwner,
   originalAnswerKeyIndependentlyCertified:false,
   visualDiscriminationVerified:false,
   semanticMeaningVerified:false};
 });
 const attempts=observations.filter(x=>x.selectedOwner!==null);
 return {schema,status:expectedStatus,
  source:{targets:"glyphs/research/heldout-identification-target-v0.1/index-v0.1.json",
   machineAnswerKeyOnly:true,originalPalette:"mandarin-component-identity@0.6.0",
   eligibleIndependentlyCertifiedGlyphs:0,independentlyApprovedTargetOwners:0},
  session:{localOnly:true,automaticallyUploaded:false,persistedInBrowser:false,
   anonymizedWithoutPersonalIdentifiers:true,exportedAtUTC:when,
   seed,randomizedOrder:true,balancedOriginalTreatments:25,
   balancedExperimentalTreatments:24,
   balancedCorrectLeft:25,balancedCorrectRight:24,
   planned:49,recorded:observations.length,
   display,ethicsApproved:false,participantEligibilityApproved:false,
   independentlyAdjudicated:false},
  summary:{answered:attempts.length,abstained:observations.length-attempts.length,
   matchesUnverifiedMachineOwner:attempts.filter(x=>x.agreesWithUnverifiedSourceOwner).length,
   validatedHumanRecognitionResults:0,certifiedVisualMappings:0,
   semanticApprovals:0},
  observations};
}
function validateSession(data,targets){
 required(exactKeys(data,["schema","status","source","session","summary","observations"])&&
  data.schema===schema&&data.status===expectedStatus,
  "Unknown or promoted source-key rehearsal schema");
 required(exactKeys(data.source,["targets","machineAnswerKeyOnly","originalPalette",
  "eligibleIndependentlyCertifiedGlyphs","independentlyApprovedTargetOwners"])&&
  data.source.targets==="glyphs/research/heldout-identification-target-v0.1/index-v0.1.json"&&
  data.source.machineAnswerKeyOnly===true&&
  data.source.originalPalette==="mandarin-component-identity@0.6.0"&&
  data.source.eligibleIndependentlyCertifiedGlyphs===0&&
  data.source.independentlyApprovedTargetOwners===0,
  "Machine-assigned owner key is not independently accepted");
 const s=data.session;
 required(exactKeys(s,["localOnly","automaticallyUploaded","persistedInBrowser",
  "anonymizedWithoutPersonalIdentifiers","exportedAtUTC","seed",
  "randomizedOrder","balancedOriginalTreatments","balancedExperimentalTreatments",
  "balancedCorrectLeft","balancedCorrectRight","planned","recorded",
  "display","ethicsApproved","participantEligibilityApproved","independentlyAdjudicated"])&&
  s.localOnly===true&&s.automaticallyUploaded===false&&
  s.persistedInBrowser===false&&s.anonymizedWithoutPersonalIdentifiers===true&&
  s.randomizedOrder===true&&s.balancedOriginalTreatments===25&&
  s.balancedExperimentalTreatments===24&&s.balancedCorrectLeft===25&&
  s.balancedCorrectRight===24&&s.planned===49&&
  s.ethicsApproved===false&&s.participantEligibilityApproved===false&&
  s.independentlyAdjudicated===false&&
  /^\d{4}-\d\d-\d\dT/.test(s.exportedAtUTC)&&
  !Number.isNaN(Date.parse(s.exportedAtUTC)),
  "Trial timing, privacy or research-eligibility boundary changed");
 displayCheck(s.display);
 const expected=plan(targets,s.seed);
 required(expected.length===49&&expected.filter(t=>t.presentation==="original").length===25&&
  expected.filter(t=>t.presentation==="experimental").length===24&&
  expected.filter(t=>t.correctLeft).length===25,
  "Color/answer position balance changed");
 required(Array.isArray(data.observations)&&
  data.observations.length===s.recorded&&s.recorded<=49,
  "Invalid recorded response count");
 const seen=new Set();
 let last=0,attempts=0,agreed=0,abstained=0;
 for(const row of data.observations){
  required(exactKeys(row,["trialId","rank","presentationIndex","treatment",
   "optionLeft","optionRight","answer","selectedOwner",
   "agreesWithUnverifiedSourceOwner","originalAnswerKeyIndependentlyCertified",
   "visualDiscriminationVerified","semanticMeaningVerified"]),
   "Unknown metadata or participant information in exported trial");
  const t=expected.find(x=>x.id===row.trialId);
  const chosen=row.answer==="left"?t?.leftChoice:
   row.answer==="right"?t?.rightChoice:null;
  required(t&&!seen.has(row.trialId)&&row.rank===t.rank&&
   row.presentationIndex===t.position&&row.presentationIndex>last&&
   row.treatment===t.presentation&&row.optionLeft===t.leftChoice&&
   row.optionRight===t.rightChoice&&
   allowedAnswers.has(row.answer)&&
   row.selectedOwner===chosen&&
   row.agreesWithUnverifiedSourceOwner===
    (chosen===null?null:chosen===t.machineAssignedOwner)&&
   row.originalAnswerKeyIndependentlyCertified===false&&
   row.visualDiscriminationVerified===false&&
   row.semanticMeaningVerified===false,
   "Response, source-keyed score or purported approval inconsistent");
  seen.add(row.trialId);last=row.presentationIndex;
  if(chosen===null)abstained++;else{
   attempts++;if(chosen===t.machineAssignedOwner)agreed++;
  }
 }
 const sm=data.summary;
 required(exactKeys(sm,["answered","abstained","matchesUnverifiedMachineOwner",
  "validatedHumanRecognitionResults","certifiedVisualMappings","semanticApprovals"])&&
  sm.answered===attempts&&sm.abstained===abstained&&
  sm.matchesUnverifiedMachineOwner===agreed&&
  sm.validatedHumanRecognitionResults===0&&
  sm.certifiedVisualMappings===0&&sm.semanticApprovals===0,
  "Unverified machine concordance was promoted into human validity");
 return {observations:seen.size,answered:attempts,abstained,
  machineKeyConcordance:agreed,independentlyValidated:0};
}
globalThis.ChromalectComponentIdentificationRehearsal=Object.freeze({
 schema,validateSource,plan,exportSession,validateSession
});
})();