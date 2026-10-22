/* Client-only, blind, experimental emoji comprehension test.
   Neither trial completion nor rating modifies semantic production coverage. */
(() => {
"use strict";
const $=id=>document.getElementById(id);
const required=[
 "emoji-study-scope","emoji-study-count","emoji-study-start","emoji-study-export",
 "emoji-study-status","emoji-study-session","emoji-study-counter","emoji-study-progress",
 "emoji-study-fill","emoji-study-symbol","emoji-study-blind","emoji-study-interpretation",
 "emoji-study-confidence","emoji-study-reveal","emoji-study-post","emoji-study-target",
 "emoji-study-source","emoji-study-next"
];
if(required.some(id=>!$(id)))return;
let audit=null, trials=[], answers=[], current=0, locked=null, chosenRating=null;
const allowed=new Set(["clear","partial","misleading","uncertain"]);
const ratings=Array.from(document.querySelectorAll("[data-clarity]"));
function put(id,value){$(id).textContent=value;}
function status(value){put("emoji-study-status",value);}
function randomize(items){
 const result=items.slice();
 for(let i=result.length-1;i>0;i--){
   const j=Math.floor(Math.random()*(i+1));
   [result[i],result[j]]=[result[j],result[i]];
 }
 return result;
}
function selectable(){
 const scope=$("emoji-study-scope").value;
 return audit.records.filter(rec=>
   scope==="all" ||
   (scope==="flagged"&&rec.riskFlags.length>0) ||
   (scope==="events"&&rec.operators.includes("event")) ||
   (scope==="compositions"&&rec.emojiCount>1));
}
function resetRating(){
 chosenRating=null;
 for(const button of ratings)button.setAttribute("aria-pressed","false");
 $("emoji-study-next").disabled=true;
}
function render(){
 const done=answers.length;
 const total=trials.length;
 put("emoji-study-counter",total?("Rated "+done+" of "+total+" · "+(done===total?"session complete":"trial "+(current+1))):"");
 $("emoji-study-progress").setAttribute("aria-valuemax",String(total));
 $("emoji-study-progress").setAttribute("aria-valuenow",String(done));
 $("emoji-study-fill").style.width=(total?((done*100/total).toFixed(1)):"0.0")+"%";
 $("emoji-study-export").disabled=done===0;
 if(current>=total){
   $("emoji-study-symbol").textContent="";
   $("emoji-study-blind").hidden=true;
   $("emoji-study-post").hidden=true;
   status("Session complete: "+done+" / "+total+" ratings recorded locally. Export JSON to preserve them.");
   return;
 }
 const trial=trials[current];
 // No character, meaning, notes, or source status before the blind answer.
 put("emoji-study-symbol",trial.emojiDisplay);
 $("emoji-study-symbol").setAttribute("aria-label","Experimental emoji expression, trial "+(current+1));
 $("emoji-study-interpretation").value="";
 $("emoji-study-confidence").value="unsure";
 $("emoji-study-blind").hidden=false;
 $("emoji-study-post").hidden=true;
 locked=null;
 resetRating();
 status("Blind trial "+(current+1)+" of "+total+". Interpret the emoji before seeing the proposed answer.");
}
function start(){
 if(!audit)return;
 const pool=selectable();
 if(!pool.length){status("No eligible examples in this group.");return;}
 const wanted=$("emoji-study-count").value;
 const count=wanted==="all"?pool.length:Math.min(pool.length,Number(wanted));
 trials=randomize(pool).slice(0,count);
 answers=[];current=0;locked=null;
 $("emoji-study-session").hidden=false;
 render();
}
function reveal(){
 if(!trials.length||current>=trials.length||locked)return;
 const trial=trials[current];
 locked={
  trialId:trial.id,
  rank:trial.rank,
  character:trial.character,
  displayedEmoji:trial.emojiDisplay,
  proposedMeaning:trial.selectedMeaning,
  blindResponse:$("emoji-study-interpretation").value.trim(),
  confidence:$("emoji-study-confidence").value,
  automaticRiskFlags:trial.riskFlags.slice()
 };
 put("emoji-study-target",trial.character+" — "+trial.selectedMeaning);
 put("emoji-study-source",
  "Unverified character-sense hypothesis · rank "+trial.rank+
  (trial.wholeTermDictionaryMatch?" · English whole-term source match":" · English whole-term match absent")+
  " · no independent approval");
 $("emoji-study-blind").hidden=true;
 $("emoji-study-post").hidden=false;
 resetRating();
}
function rate(value){
 if(!locked||!allowed.has(value))return;
 chosenRating=value;
 for(const button of ratings)button.setAttribute("aria-pressed",String(button.dataset.clarity===value));
 $("emoji-study-next").disabled=false;
}
function next(){
 if(!locked||!chosenRating)return;
 answers.push({...locked,clarityRatingAfterReveal:chosenRating});
 current++;
 render();
}
function exportJSON(){
 if(!answers.length)return;
 const payload={
  schema:"chromalect.emoji-comprehension-session.v0.1",
  status:"unverified_exploratory_observations_not_production_review",
  source:{repository:"sguzman/chromalect",audit:"emoji-visibility-audit-v0.1.json",
    sourceLicenseNote:"Pictogram selections are experimental; lexical corroboration in the audit derives from independently licensed CC-CEDICT evidence."},
  session:{scope:$("emoji-study-scope").value,requestedCount:$("emoji-study-count").value,
    rated:answers.length,planned:trials.length,localOnly:true,
    exportedAt:new Date().toISOString()},
  answers:answers.map(x=>({...x}))
 };
 const blob=new Blob([JSON.stringify(payload,null,2)+"\n"],{type:"application/json"});
 const url=URL.createObjectURL(blob);
 const a=document.createElement("a");
 a.href=url;
 a.download="chromalect-emoji-blind-study.json";
 document.body.appendChild(a);
 a.click();
 a.remove();
 URL.revokeObjectURL(url);
}
async function load(){
 try{
  const response=await fetch("semantic/emoji-visibility-audit-v0.1.json");
  if(!response.ok)throw new Error("Audit unavailable");
  const data=await response.json();
  if(data.schema!=="chromalect.semantic.emoji-visibility-audit.v0.1"||
    data.summary?.proposedExpressions!==897||
    data.summary?.humanLexicalApproved!==0||
    data.summary?.humanEmojiComprehensionApproved!==0||
    data.summary?.productionVerified!==0||
    !Array.isArray(data.records)||data.records.length!==897)
    throw new Error("Unexpected source audit or verification state");
  const seen=new Set();
  for(const rec of data.records){
   if(!rec.id||seen.has(rec.id)||!rec.emojiDisplay||!rec.character||
     !rec.selectedMeaning||!Array.isArray(rec.riskFlags)||!Array.isArray(rec.operators)||
     rec.productionVerified!==false)throw new Error("Malformed or non-experimental trial");
   seen.add(rec.id);
  }
  audit=data;
  $("emoji-study-start").disabled=false;
  status("Loaded 897 experimental expressions. No interpretation or rating will be sent anywhere.");
 }catch(e){
  status("Unable to load the versioned emoji audit. This worksheet cannot start.");
 }
}
$("emoji-study-start").addEventListener("click",start);
$("emoji-study-reveal").addEventListener("click",reveal);
$("emoji-study-next").addEventListener("click",next);
$("emoji-study-export").addEventListener("click",exportJSON);
for(const btn of ratings)btn.addEventListener("click",()=>rate(btn.dataset.clarity));
load();
})();
