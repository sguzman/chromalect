/* Balanced local-only static-versus-one-shot motion research instrument.
 * Not a validated semantic, articulatory, or human learning result. */
(() => {
"use strict";
const $=id=>document.getElementById(id);
const fields=["motion-trial-consent","motion-trial-start","motion-trial-show",
 "motion-trial-hide","motion-trial-stimulus","motion-trial-choices",
 "motion-trial-status","motion-trial-score","motion-trial-json",
 "motion-trial-copy"];
if(fields.some(id=>!$(id)))return;
const grammar=globalThis.ChromalectSemanticGrammar;
if(!grammar||typeof grammar.emojiParts!=="function"){
 $("motion-trial-status").textContent="Required candidate semantic grammar unavailable";return;
}
const make=(tag,text)=>{
 const n=document.createElement(tag);
 if(text!==undefined)n.textContent=String(text);
 return n;
};
const choose=(list)=>{
 const result=list.slice();
 for(let i=result.length-1;i>0;i--){
  const j=Math.floor(Math.random()*(i+1));
  [result[i],result[j]]=[result[j],result[i]];
 }
 return result;
};
const reduced=()=>Boolean(globalThis.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches);
let targets=null,session=null,index=0,activeTrial=null;
function status(s){$("motion-trial-status").textContent=s;}
function hideAll(){
 $("motion-trial-stimulus").replaceChildren();
 $("motion-trial-choices").replaceChildren();
 $("motion-trial-show").disabled=true;
 $("motion-trial-hide").disabled=true;
}
function contentFor(target){
 if(target.domain==="articulation"){
  return [
   {text:"Place: "+target.place,type:"label"},
   {text:"Manner: "+target.manner,type:"label"},
   {text:"Aspiration: "+target.aspiration,type:"label"}
  ];
 }
 return grammar.emojiParts(target.expression).map(piece=>({
  text:piece.text,type:piece.kind==="emoji"?"pictogram":"operator"
 }));
}
function renderTokens(trial){
 const target=targets[trial.domain].find(x=>x.key===trial.key);
 if(!target)throw Error("Source-defined trial missing");
 const moving=trial.condition==="one-shot"&&!reduced();
 const container=$("motion-trial-stimulus");
 container.replaceChildren();
 const tokens=contentFor(target);
 if(tokens.length===0)throw Error("No visible source candidate features");
 tokens.forEach((item,i)=>{
  const node=make("span",item.text);
  node.className="motion-token "+(item.type==="pictogram"?"motion-symbol":"motion-word");
  if(moving){
   node.className+=" motion-token-animated";
   node.style.animationDelay=Math.min(i*.13,.9).toFixed(2)+"s";
  }
  container.appendChild(node);
 });
 trial.effectivePresentation=moving?"one-shot":"static";
 trial.tokenCount=tokens.length;
}
function prepare(){
 hideAll();activeTrial=null;
 if(!session)return;
 if(index===session.trials.length){complete();return;}
 const trial=session.trials[index];
 const label=trial.domain==="semantic"?"candidate pictogram meaning":"working articulatory place";
 status("Trial "+(index+1)+" / 16 · "+label+
  ". Reveal the cue, then hide it before answering. Conditions are randomized; no intermediate feedback.");
 $("motion-trial-show").disabled=false;
}
function show(){
 if(!session||activeTrial!==null||index>=session.trials.length)return;
 activeTrial={trial:session.trials[index],stage:"shown"};
 renderTokens(activeTrial.trial);
 $("motion-trial-show").disabled=true;
 $("motion-trial-hide").disabled=false;
}
function conceal(){
 if(!activeTrial||activeTrial.stage!=="shown")return;
 const trial=activeTrial.trial;
 $("motion-trial-stimulus").replaceChildren();
 $("motion-trial-hide").disabled=true;
 const target=targets[trial.domain].find(x=>x.key===trial.key);
 const list=targets[trial.domain].map(x=>({key:x.key,label:x.label}));
 if(!target||list.length!==4)throw Error("Invalid 4-choice domain inventory");
 for(const answer of choose(list)){
  const button=make("button",answer.label);
  button.type="button";
  button.setAttribute("data-choice-key",answer.key);
  button.addEventListener("click",()=>record(answer.key));
  $("motion-trial-choices").appendChild(button);
 }
 activeTrial.stage="answering";
}
function record(key){
 if(!activeTrial||activeTrial.stage!=="answering"||index>=16)return;
 const trial=activeTrial.trial;
 if(!targets[trial.domain].some(x=>x.key===key))return;
 if(!["static","one-shot"].includes(trial.effectivePresentation))
  throw Error("Unrecorded presentation condition");
 session.responses.push({
  trialNumber:index+1,domain:trial.domain,sourceKey:trial.key,
  assignedCondition:trial.condition,effectivePresentation:trial.effectivePresentation,
  sourceFeatureTokensPresented:trial.tokenCount,selectedKey:key,
  correct:key===trial.key
 });
 activeTrial=null;index++;prepare();
}
function complete(){
 hideAll();
 const responses=session.responses;
 if(responses.length!==16)return;
 const count=(filter)=>responses.filter(filter).length;
 const correct=count(x=>x.correct);
 const summary=["semantic","articulation"].flatMap(domain=>
  ["static","one-shot"].map(condition=>({
   domain,assignedCondition:condition,
   presentations:count(x=>x.domain===domain&&x.assignedCondition===condition),
   correct:count(x=>x.domain===domain&&x.assignedCondition===condition&&x.correct),
   effectiveMotionExposures:count(x=>x.domain===domain&&x.assignedCondition===condition&&
    x.effectivePresentation==="one-shot")
  })));
 if(summary.some(x=>x.presentations!==4))throw Error("Unbalanced final study report");
 const record={
  schema:"chromalect.experiment.local-static-motion-recall.v0.1",
  status:"unverified_local_self_assessment_not_a_peer_reviewed_or_controlled_human_trial",
  source:{semanticScreening:"mandarin-1000-v0.1.json",
   articulatoryCandidates:"mandarin-initial-feature-candidates-v0.1.json",
   semanticSensesApproved:0,phonologicalContrastsApproved:0,
   spokenArticulationMeasured:false,sourceClaimsApproved:false},
  protocol:{trialCount:16,semanticTargets:4,articulatoryTargets:4,
   trialsPerTarget:2,staticAndOneShotPerTarget:true,
   responseChoices:4,immediateFeedback:false,exposureSelfPaced:true,
   conditionsRandomized:true,motionNeverAutoplays:true,
   reducedMotionOverrideSupported:true},
  results:{correct,total:16,byDomainAndAssignedCondition:summary,
   responses:responses.map(x=>({...x}))},
  constraints:{independentParticipantsVerified:false,
   comparisonControlValidated:false,independentEthicsApproval:false,
   retentionOrTransferMeasured:false,participantIdentityRecorded:false,
   participantTimingCaptured:false,networkSubmission:false,
   automaticStorage:false},
  notes:"Participant-entered recall of draft cues under assigned static versus one-shot sequential presentation; no independently validated learning benefit."
 };
 $("motion-trial-json").value=JSON.stringify(record,null,2);
 $("motion-trial-copy").disabled=false;
 $("motion-trial-score").textContent="Local self-assessment: "+correct+" / 16 correct."+
  (reduced()?" Reduced-motion preference forced every cue static; motion cannot be compared in this session.":"");
 status("16 trials complete; the optional JSON stays in this page only. No study result was submitted.");
}
function begin(){
 if(!targets||!$("motion-trial-consent").checked)return;
 const trials=[];
 for(const domain of ["semantic","articulation"])
  for(const target of targets[domain])
   for(const condition of ["static","one-shot"])
    trials.push({domain,key:target.key,condition});
 const ordered=choose(trials);
 if(ordered.length!==16||
  ["semantic","articulation"].some(domain=>
   ["static","one-shot"].some(cond=>
    ordered.filter(r=>r.domain===domain&&r.condition===cond).length!==4)))
  throw Error("Balanced motion design was lost");
 session={trials:ordered,responses:[]};index=0;activeTrial=null;
 $("motion-trial-json").value="";
 $("motion-trial-score").textContent="";
 $("motion-trial-copy").disabled=true;
 prepare();
}
async function load(){
 try{
  const responses=await Promise.all([
   fetch("semantic/mandarin-1000-v0.1.json"),
   fetch("phonetics/mandarin-initial-feature-candidates-v0.1.json")]);
  if(responses.some(r=>!r.ok))throw Error("Source research inventory not published");
  const [semantic,initials]=await Promise.all(responses.map(r=>r.json()));
  if(semantic.schema!=="chromalect.mandarin.character-semantic-tranche.v0.1"||
     semantic.status!=="initial_screening_complete_candidates_not_production_verified"||
     semantic.summary.screenedCharacters!==1000||
     semantic.summary.productionVerifiedCharacters!==0||
     semantic.characters.length!==1000||
     initials.schema!=="chromalect.phonetics.mandarin-initial-feature-candidates.v0.1"||
     initials.statistics.conventionalInitialTokens!==21||
     initials.statistics.independentlyVerifiedPhonemicContrasts!==0||
     initials.statistics.validatedArticulatoryProduction!==0||
     initials.statistics.educationalStudies!==0)
   throw Error("Source acceptance or approval boundary changed");
  const eventCandidates=[];
  const seenMeanings=new Set(),seenSymbols=new Set();
  for(let i=0;i<semantic.characters.length;i++){
   const row=semantic.characters[i];
   if(row.rank!==i+1||!Array.isArray(row.screening.candidates))
    throw Error("Source rank or proposed sense inventory changed");
   for(const candidate of row.screening.candidates){
    if(candidate.expression?.kind!=="event")continue;
    if(candidate.state!=="experimental_pictogram_candidate"||
       candidate.review!=="human_linguistic_and_comprehension_review_pending")
     throw Error("Candidate semantic sense became unverified or promoted");
    grammar.validate(candidate.expression);
    const display=grammar.emojiParts(candidate.expression).map(x=>x.text).join("");
    if(!display||!candidate.selectedMeaning||
       seenMeanings.has(candidate.selectedMeaning)||seenSymbols.has(display))continue;
    seenMeanings.add(candidate.selectedMeaning);seenSymbols.add(display);
    eventCandidates.push({domain:"semantic",key:"c"+row.rank+"-"+eventCandidates.length,
     label:candidate.selectedMeaning,expression:candidate.expression});
    if(eventCandidates.length===4)break;
   }
   if(eventCandidates.length===4)break;
  }
  const selected=[],seenPlaces=new Set();
  for(const row of initials.tokens){
   if(row.category!=="conventional_pinyin_initial"||seenPlaces.has(row.place))continue;
   if(!row.manner||!["none","aspirated","unaspirated"].includes(row.aspiration))
    throw Error("Working articulatory feature unavailable");
   seenPlaces.add(row.place);
   selected.push({domain:"articulation",key:row.token,label:row.place,
    place:row.place,manner:row.manner,aspiration:row.aspiration});
   if(selected.length===4)break;
  }
  if(eventCandidates.length!==4||selected.length!==4||
     new Set(eventCandidates.map(x=>x.key)).size!==4||
     new Set(selected.map(x=>x.label)).size!==4)
   throw Error("Insufficient distinguishable source stimuli");
  targets={semantic:eventCandidates,articulation:selected};
  status("Sixteen balanced static/one-shot source-cue recall trials are ready; opt in to begin.");
  $("motion-trial-start").disabled=!$("motion-trial-consent").checked;
 }catch(e){
  targets=null;hideAll();
  $("motion-trial-start").disabled=true;
  status("Unable to validate motion trial candidates: "+e.message);
 }
}
$("motion-trial-consent").addEventListener("change",()=>{
 $("motion-trial-start").disabled=!targets||!$("motion-trial-consent").checked;
});
$("motion-trial-start").addEventListener("click",begin);
$("motion-trial-show").addEventListener("click",show);
$("motion-trial-hide").addEventListener("click",conceal);
$("motion-trial-copy").addEventListener("click",()=>{
 if($("motion-trial-json").value)$("motion-trial-json").select();
});
$("motion-trial-start").disabled=true;
$("motion-trial-copy").disabled=true;
hideAll();load();
})();