/* Blind, local-only four-tone shape recognition assessment.
 * Explicitly NOT a validated human study or an acoustic Mandarin tone test.
 * No participant identifiers, persistence, external requests, or trial feedback.
 */
(() => {
"use strict";
const $=name=>document.getElementById(name);
const ids=["tone-blind-consent","tone-blind-start","tone-blind-prompt",
 "tone-blind-answers","tone-blind-status","tone-blind-summary",
 "tone-blind-export","tone-blind-export-select"];
if(ids.some(name=>!$(name)))return;
const NS="http://www.w3.org/2000/svg";
const EXPECTED_SCHEMAS={
 tones:"chromalect.phonetics.mandarin-citation-tone-contours.v0.1",
 audit:"chromalect.phonetics.citation-tone-isolation-audit.v0.1"
};
const create=(name,text)=>{
 const n=document.createElement(name);
 if(text!==undefined)n.textContent=String(text);
 return n;
};
const svgNode=(name,attrs)=>{
 const e=document.createElementNS(NS,name);
 for(const [k,v] of Object.entries(attrs))e.setAttribute(k,String(v));
 return e;
};
let reference=null,session=null,trialPosition=0,ready=false;
function status(text){$("tone-blind-status").textContent=text;}
function shuffle(values){
 const out=values.slice();
 for(let i=out.length-1;i>0;i--){
  const j=Math.floor(Math.random()*(i+1));
  [out[i],out[j]]=[out[j],out[i]];
 }
 return out;
}
// Exactly 16 presentations, four of each source category, with no adjacent repeat.
// Block balancing (four trials / block) is fixed; within-block order is randomized.
function trialOrder(){
 const blocks=[],all=[];
 for(let block=0;block<4;block++){
  let next=shuffle([1,2,3,4]),tries=0;
  while(all.length&&next[0]===all[all.length-1]&&tries<32){
   next=shuffle([1,2,3,4]);tries++;
  }
  if(all.length&&next[0]===all[all.length-1]){
   const candidate=next.findIndex(x=>x!==all[all.length-1]);
   [next[0],next[candidate]]=[next[candidate],next[0]];
  }
  blocks.push(next);all.push(...next);
 }
 if(all.length!==16||new Set(all).size!==4||
    [1,2,3,4].some(t=>all.filter(v=>v===t).length!==4)||
    all.some((v,i)=>i>0&&v===all[i-1]))
  throw Error("Trial balancing failed");
 return {blocks,all};
}
function curve(levels){
 const svg=svgNode("svg",{viewBox:"0 0 160 108",role:"img",
  "aria-label":"Unlabeled monochrome relative-pitch curve; answer withheld",
  class:"tone-svg"});
 const points=levels.map((level,i)=>{
  const x=12+i*136/(levels.length-1);
  const y=94-(level-1)*20;
  return x.toFixed(1)+","+y.toFixed(1);
 }).join(" ");
 const line=svgNode("polyline",{points,stroke:"currentColor",
  "stroke-width":5,fill:"none","stroke-linejoin":"round","stroke-linecap":"round"});
 svg.appendChild(line);return svg;
}
function clear(){
 $("tone-blind-prompt").replaceChildren();
 $("tone-blind-answers").replaceChildren();
}
function render(){
 clear();
 if(!session)return;
 if(trialPosition>=16){finish();return;}
 const trial=session.trials[trialPosition];
 const curveSource=reference[trial.tone-1];
 $("tone-blind-prompt").appendChild(curve(curveSource.levels));
 for(const index of shuffle([1,2,3,4])){
  const button=create("button","T"+index);button.type="button";
  button.setAttribute("data-tone-choice",String(index));
  button.addEventListener("click",()=>answer(index));
  $("tone-blind-answers").appendChild(button);
 }
 status("Assessment "+(trialPosition+1)+" of 16. Choose the tone category from the curve alone; no feedback is given until the end.");
}
function finish(){
 clear();
 if(!session||session.responses.length!==16)return;
 const perTone=[1,2,3,4].map(t=>{
  const group=session.responses.filter(row=>row.expectedTone===t);
  return {tone:t,presentations:group.length,
   correct:group.filter(row=>row.correct).length};
 });
 const total=session.responses.filter(row=>row.correct).length;
 const exportRecord={
  schema:"chromalect.phonetics.blind-citation-contour-session.v0.1",
  status:"unverified_voluntary_local_shape_recognition_response_not_published_human_study",
  source:{toneReference:"mandarin-citation-tone-contours-v0.1.json",
   isolationAudit:"citation-tone-isolation-audit-v0.1.json",
   sourceContours:"idealized Chao relative pitch, not acoustic audio",
   neutralToneExcluded:true,initialsShown:false,finalsShown:false,
   charactersShown:false,pinyinShown:false,semanticCuesShown:false,
   feedbackBeforeAssessmentCompleted:false,
   sourceTrialsEnteredByParticipant:true},
  protocol:{presentationCount:16,categoryCount:4,
   countPerCategory:4,blockSize:4,blockCount:4,
   adjacentToneRepetitions:0,randomizedBlockOrder:true,
   answerChoicesShuffledPerTrial:true,trialResponseTimeMeasured:false,
   prerecordedSpeakerAudioUsed:false},
  results:{correct:total,total:16,perTone,
   trialResponses:session.responses.map(({trialNumber,expectedTone,selectedTone,correct})=>({
    trialNumber,expectedTone,selectedTone,correct}))},
  validation:{externallyRecruitedParticipant:false,
   participantIdentityVerified:false,independentEthicsReview:false,
   sourcePhonemeOrAcousticApproval:false,
   measuredTransferBenefit:false,comparisonArmPresent:false},
  privacy:{networkSubmission:false,automaticStorage:false,
   personalIdentifiersCollected:false,automaticPersistence:false}
 };
 $("tone-blind-export").value=JSON.stringify(exportRecord,null,2);
 $("tone-blind-export-select").disabled=false;
 $("tone-blind-summary").textContent="Local contour recognition score: "+total+
  " / 16. This is one unverified opt-in response, not population evidence or validated Mandarin tone perception.";
 status("Assessment complete. No results were saved or transmitted. The JSON below may be copied locally.");
}
function answer(selected){
 if(!session||trialPosition>=16||!Number.isInteger(selected)||
  selected<1||selected>4)return;
 const correctTone=session.trials[trialPosition].tone;
 session.responses.push({trialNumber:trialPosition+1,expectedTone:correctTone,
  selectedTone:selected,correct:selected===correctTone});
 trialPosition++;
 render();
}
function start(){
 if(!ready||!$("tone-blind-consent").checked)return;
 const order=trialOrder();
 session={trials:order.all.map(tone=>({tone})),responses:[]};
 trialPosition=0;
 $("tone-blind-export").value="";
 $("tone-blind-export-select").disabled=true;
 $("tone-blind-summary").textContent="";
 render();
}
async function load(){
 try{
  const responses=await Promise.all([
   fetch("phonetics/mandarin-citation-tone-contours-v0.1.json"),
   fetch("phonetics/citation-tone-isolation-audit-v0.1.json")]);
  if(responses.some(x=>!x.ok))throw Error("Pinned source evidence unavailable");
  const [data,audit]=await Promise.all(responses.map(x=>x.json()));
  if(data.schema!==EXPECTED_SCHEMAS.tones||
     data.status!=="idealized_pedagogical_citation_pitch_contours_not_acoustic_or_contextual_measurements"||
     audit.schema!==EXPECTED_SCHEMAS.audit||
     audit.summary.humanToneDiscriminationTrials!==0||
     audit.summary.learningStudyEvidence!==0||
     audit.summary.independentPhoneticToneCertifications!==0||
     audit.separation.noInitialFeatureClassificationRequired!==true||
     audit.separation.noFinalFeatureClassificationRequired!==true||
     data.tones.length!==5||data.tones[0].levels!==null)
   throw Error("Source tone contour or scientific status changed");
  const rows=data.tones.slice(1);
  const labels=new Set();
  for(let i=0;i<4;i++){
   const row=rows[i],proof=audit.records[i+1];
   if(row.token!==String(i+1)||proof.token!==row.token||
      !Array.isArray(row.levels)||row.levels.length<2||
      row.levels.some(x=>!Number.isInteger(x)||x<1||x>5)||
      JSON.stringify(row.levels)!==JSON.stringify(proof.idealizedLevels)||
      proof.humanPerceptionAccuracy!==null||
      proof.independentlyAcousticallyCalibrated!==false)
    throw Error("Isolated tone contour not matched to source");
   labels.add(JSON.stringify(row.levels));
  }
  if(labels.size!==4)throw Error("Tone contours not visibly distinct in source model");
  reference=rows;ready=true;
  $("tone-blind-start").disabled=!$("tone-blind-consent").checked;
  status("Blind contour-only 16-trial assessment available; opt in to start. No participant data stored or uploaded.");
 }catch(e){
  ready=false;
  $("tone-blind-start").disabled=true;
  status("Unable to validate source-only assessment: "+e.message);
 }
}
$("tone-blind-consent").addEventListener("change",()=>{
 $("tone-blind-start").disabled=!ready||!$("tone-blind-consent").checked;
});
$("tone-blind-start").addEventListener("click",start);
$("tone-blind-export-select").addEventListener("click",()=>{
 if($("tone-blind-export").value)$("tone-blind-export").select();
});
$("tone-blind-start").disabled=true;
$("tone-blind-export-select").disabled=true;
load();
})();