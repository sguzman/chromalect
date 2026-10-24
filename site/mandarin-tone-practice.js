/* Session-only tone-contour decoding practice, not an approved research study.
   Prompt contains only a monochrome idealized Chao-level curve, never a syllable. */
(() => {
"use strict";
const $=id=>document.getElementById(id);
const required=["tone-practice-start","tone-practice-next","tone-practice-prompt",
 "tone-practice-answers","tone-practice-feedback","tone-practice-status"];
if(required.some(id=>!$(id)))return;
const NS="http://www.w3.org/2000/svg";
const make=(tag,value)=>{
 const n=document.createElement(tag);
 if(value!==undefined)n.textContent=value;
 return n;
};
let tones=[],rounds=[],position=0,score=0,answered=false;
function status(text){$("tone-practice-status").textContent=text;}
function contour(levels){
 const svg=document.createElementNS(NS,"svg");
 svg.setAttribute("viewBox","0 0 160 108");
 svg.setAttribute("role","img");
 svg.setAttribute("aria-label","Unlabeled idealized relative-pitch contour");
 svg.setAttribute("class","tone-svg");
 const path=document.createElementNS(NS,"polyline");
 path.setAttribute("points",levels.map((p,i)=>{
  const x=12+i*136/(levels.length-1),y=94-(p-1)*20;
  return x.toFixed(1)+","+y.toFixed(1);
 }).join(" "));
 path.setAttribute("stroke","currentColor");
 path.setAttribute("stroke-width","5");
 path.setAttribute("fill","none");
 svg.appendChild(path);
 return svg;
}
function render(){
 $("tone-practice-prompt").replaceChildren();
 $("tone-practice-answers").replaceChildren();
 $("tone-practice-feedback").textContent="";
 $("tone-practice-next").disabled=true;
 if(position>=rounds.length){
  status("Local-only practice complete: "+score+" / "+rounds.length+
   " correct. Not a human research result; no data were saved or sent.");
  return;
 }
 answered=false;
 const tone=tones[rounds[position]-1];
 $("tone-practice-prompt").appendChild(contour(tone.levels));
 for(const r of tones){
  const button=make("button","T"+r.token);
  button.type="button";
  button.setAttribute("data-tone-choice",r.token);
  button.addEventListener("click",()=>choose(Number(r.token)));
  $("tone-practice-answers").appendChild(button);
 }
 status("Prompt "+(position+1)+" / "+rounds.length+
  ": identify the relative contour from its shape alone.");
}
function choose(guess){
 if(answered||position>=rounds.length)return;
 answered=true;
 const expected=rounds[position];
 if(guess===expected)score++;
 $("tone-practice-feedback").textContent=(guess===expected?"Matched":"Different from")+
  " the source idealized T"+expected+" shape. The prompt contains no syllable or phonetic segments.";
 for(const button of $("tone-practice-answers").children)button.disabled=true;
 $("tone-practice-next").disabled=false;
}
function start(){
 if(tones.length!==4)return;
 rounds=[1,2,3,4,1,2,3,4];
 for(let i=rounds.length-1;i>0;i--){
  const j=Math.floor(Math.random()*(i+1));
  [rounds[i],rounds[j]]=[rounds[j],rounds[i]];
 }
 position=0;score=0;answered=false;
 render();
}
async function load(){
 try{
  const responses=await Promise.all([
   fetch("phonetics/mandarin-citation-tone-contours-v0.1.json"),
   fetch("phonetics/citation-tone-isolation-audit-v0.1.json")]);
  if(responses.some(x=>!x.ok))throw Error("Missing source citation contours");
  const [data,audit]=await Promise.all(responses.map(r=>r.json()));
  if(data.schema!=="chromalect.phonetics.mandarin-citation-tone-contours.v0.1"||
     data.status!=="idealized_pedagogical_citation_pitch_contours_not_acoustic_or_contextual_measurements"||
     audit.schema!=="chromalect.phonetics.citation-tone-isolation-audit.v0.1"||
     audit.summary.humanToneDiscriminationTrials!==0||
     audit.summary.learningStudyEvidence!==0||
     audit.summary.independentPhoneticToneCertifications!==0||
     audit.separation.noInitialFeatureClassificationRequired!==true||
     audit.separation.noFinalFeatureClassificationRequired!==true||
     data.tones.length!==5||data.tones[0].levels!==null)
   throw Error("Tone source validation or research status changed");
  tones=data.tones.slice(1);
  const distinct=new Set();
  for(let i=0;i<4;i++){
   const t=tones[i],record=audit.records[i+1];
   if(t.token!==String(i+1)||record.token!==t.token||
      !Array.isArray(t.levels)||t.levels.length<2||
      !t.levels.every(n=>Number.isInteger(n)&&n>=1&&n<=5)||
      JSON.stringify(t.levels)!==JSON.stringify(record.idealizedLevels)||
      record.independentlyAcousticallyCalibrated!==false||
      record.humanPerceptionAccuracy!==null)
    throw Error("Unapproved or mismatched isolated-tone source");
   distinct.add(JSON.stringify(t.levels));
  }
  if(distinct.size!==4)throw Error("Contours cannot be isolated by shape");
  status("Eight balanced monochrome shape prompts available. No audio, segments or research participation.");
 }catch(e){
  tones=[];status("Unable to validate tone-only practice: "+e.message);
 }
}
$("tone-practice-start").addEventListener("click",start);
$("tone-practice-next").addEventListener("click",()=>{
 if(!answered)return;
 position++;render();
});
load();
})();