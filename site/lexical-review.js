/* Source-first, local-only lexical evidence worksheet.
   Does not approve Mandarin meanings, revise emojis or promote production data. */
(() => {
"use strict";
const $=id=>document.getElementById(id);
const presenter=globalThis.ChromalectLayers;
const readingParser=globalThis.ChromalectDictionaryReadings;
const required=[
 "lexical-study-scope","lexical-study-count","lexical-study-start","lexical-study-export",
 "lexical-study-status","lexical-study-session","lexical-study-count-label",
 "lexical-study-progress","lexical-study-fill","lexical-study-character",
 "lexical-study-meaning","lexical-study-unihan","lexical-study-dictionary",
 "lexical-study-readings","lexical-study-complexity","lexical-study-reading",
 "lexical-study-reading-evidence",
 "lexical-study-form","lexical-study-decisions","lexical-study-rationale",
 "lexical-study-commit","lexical-study-after","lexical-study-prior","lexical-study-next"
];
if(!presenter||!readingParser||required.some(id=>!$(id)))return;
const controls=Array.from(document.querySelectorAll("[data-lexical-judgment]"));
const labels=new Set(["supported","unsupported","uncertain"]);
let queue=null,trials=[],recorded=[],position=0,judgment=null,awaitingNext=false;
let activeScope=null,activeRequestedCount=null;
let profileByRank=new Map();
function put(id,value){$(id).textContent=value;}
function status(msg){put("lexical-study-status",msg);}
function shuffled(items){
 const list=items.slice();
 for(let i=list.length-1;i>0;i--){
  const j=Math.floor(Math.random()*(i+1));
  [list[i],list[j]]=[list[j],list[i]];
 }
 return list;
}
function candidates(){
 const scope=$("lexical-study-scope").value;
 return queue.records.filter(r=>scope==="all"||
   (scope==="flagged"&&!r.strictWholeTermMatch)||
   (scope==="matched"&&r.strictWholeTermMatch)||
   r.priority===scope||
   (scope==="multiple_readings"&&r.dictionaryReadings.length>1)||
   (scope==="reading_subset"&&r.matchingDictionaryReadings.length>0&&
     r.matchingDictionaryReadings.length<r.dictionaryReadings.length)||
   (scope==="polysemy_high"&&r.dictionaryReadings.length>1&&
     r.dictionaryExcerpt.split(";").filter(x=>x.trim()).length>=8));
}
function resetForm(){
 judgment=null;awaitingNext=false;
 $("lexical-study-rationale").value="";
 $("lexical-study-reading").value="";
 $("lexical-study-commit").disabled=true;
 for(const c of controls)c.setAttribute("aria-pressed","false");
 $("lexical-study-form").hidden=false;
 $("lexical-study-after").hidden=true;
}
function show(){
 const total=trials.length,done=recorded.length;
 put("lexical-study-count-label",done+" of "+total+" provisional observations recorded"+
    (position<total?" · case "+(position+1):" · finished"));
 $("lexical-study-progress").setAttribute("aria-valuemax",String(total));
 $("lexical-study-progress").setAttribute("aria-valuenow",String(done));
 $("lexical-study-fill").style.width=(total?(done*100/total).toFixed(1):"0.0")+"%";
 $("lexical-study-export").disabled=done===0;
 if(position>=total){
  $("lexical-study-form").hidden=true;
  $("lexical-study-after").hidden=true;
  status("Session complete: "+done+"/"+total+" preliminary observations saved locally. Export JSON if needed.");
  return;
 }
 const r=trials[position];
 const profile=profileByRank.get(r.rank);
 if(!profile||profile.character!==r.character)throw new Error("Unaligned character profile");
 $("lexical-study-character").replaceChildren(presenter.createGlyph(profile));
 put("lexical-study-meaning",r.selectedMeaning);
 put("lexical-study-unihan",r.referenceDefinition);
 put("lexical-study-dictionary",r.dictionaryExcerpt);
 const evidence=$("lexical-study-reading-evidence");
 evidence.replaceChildren();
 const segments=readingParser.split(r);
 for(const section of segments){
  const wrapper=document.createElement("section");
  wrapper.className="lexical-study-source";
  const heading=document.createElement("strong");
  heading.textContent=section.reading;
  const gloss=document.createElement("p");
  gloss.textContent=section.gloss;
  wrapper.appendChild(heading);
  wrapper.appendChild(gloss);
  evidence.appendChild(wrapper);
 }
 put("lexical-study-readings",r.dictionaryReadings.join(" · "));
 const fragments=r.dictionaryExcerpt.split(";").filter(x=>x.trim()).length;
 put("lexical-study-complexity",r.dictionaryReadings.length+
   " pinned dictionary reading(s); "+fragments+
   " English definition fragments. Neither count establishes distinct lexical senses.");
 const selector=$("lexical-study-reading");
 selector.replaceChildren();
 for(const [value,label] of [
   ["","Select reading or unresolved status"],
   ...r.dictionaryReadings.map(reading=>[reading,reading+" (dictionary spelling)"]),
   ...(r.dictionaryReadings.length>1?[["multiple","Multiple readings (not yet separated)"]]:[]),
   ["undetermined","Undetermined / needs usage evidence"]
 ]){
   const option=document.createElement("option");
   option.value=value;option.textContent=label;selector.appendChild(option);
 }
 selector.value="";
 // The previous assistant's interpretation is deliberately hidden initially.
 put("lexical-study-prior","");
 resetForm();
 status("Case "+(position+1)+" of "+total+". Compare the lexical sources before reviewing any prior desk analysis.");
}
function start(){
 if(!queue)return;
 const eligible=candidates();
 if(!eligible.length){status("No candidates in the selected priority class.");return;}
 activeScope=$("lexical-study-scope").value;
 activeRequestedCount=$("lexical-study-count").value;
 const count=activeRequestedCount;
 trials=shuffled(eligible).slice(0,count==="all"?eligible.length:Math.min(eligible.length,Number(count)));
 recorded=[];position=0;
 $("lexical-study-session").hidden=false;
 show();
}
function setJudgment(value){
 if(awaitingNext||!labels.has(value))return;
 judgment=value;
 for(const c of controls)c.setAttribute("aria-pressed",String(c.dataset.lexicalJudgment===value));
 validate();
}
function validate(){
 if(awaitingNext)return;
 const r=trials[position];
 const selected=$("lexical-study-reading").value;
 const valid=selected==="undetermined"||
   (selected==="multiple"&&r?.dictionaryReadings.length>1)||
   Boolean(r?.dictionaryReadings.includes(selected));
 $("lexical-study-commit").disabled=!(judgment&&valid&&$("lexical-study-rationale").value.trim().length>=12);
}
function commit(){
 if(awaitingNext||!judgment)return;
 const note=$("lexical-study-rationale").value.trim();
 if(note.length<12)return;
 const r=trials[position];
 const selected=$("lexical-study-reading").value;
 if(!(selected==="undetermined"||
   (selected==="multiple"&&r.dictionaryReadings.length>1)||
   r.dictionaryReadings.includes(selected)))return;
 recorded.push({
  rank:r.rank,character:r.character,selectedMeaning:r.selectedMeaning,
  originalSourceSegment:r.referenceDefinition,
  dictionarySource:r.dictionarySource,
  preliminaryJudgment:judgment,
  evidenceRationale:note,
  priorityAtIntake:r.priority,strictWholeTermMatchAtIntake:r.strictWholeTermMatch,
  readingSelection:selected,
  lexicalApproval:"not_granted",
  emojiComprehensionApproval:"not_granted",
  productionVerified:false
 });
 awaitingNext=true;
 put("lexical-study-prior",r.previousDeskObservation || "No earlier assistant desk analysis: an English wording match is not independent lexical verification.");
 $("lexical-study-form").hidden=true;
 $("lexical-study-after").hidden=false;
 $("lexical-study-export").disabled=false;
 const total=trials.length,done=recorded.length;
 $("lexical-study-progress").setAttribute("aria-valuenow",String(done));
 $("lexical-study-fill").style.width=(done*100/total).toFixed(1)+"%";
 put("lexical-study-count-label",done+" of "+total+" provisional observations recorded");
 status("Observation locked. Earlier assistant commentary is now visible; it was not part of the initial source presentation.");
}
function next(){
 if(!awaitingNext)return;
 position++;
 show();
}
function exportJSON(){
 if(!recorded.length)return;
 const payload={
  schema:"chromalect.lexical-review-observation-session.v0.3",
  status:"local_preliminary_observations_not_independent_lexical_approval",
  source:{queue:"full-lexical-review-queue-v0.1.json",
   ccCedictLicense:"CC BY-SA 4.0",unihanSource:"Unicode Unihan kDefinition",
   note:"Reviewers must preserve attribution when redistributing extracted dictionary evidence."},
  session:{scope:activeScope,requestedCount:activeRequestedCount,
   recorded:recorded.length,planned:trials.length,localOnly:true,exportedAt:new Date().toISOString()},
  observations:recorded.map(r=>({...r}))
 };
 const blob=new Blob([JSON.stringify(payload,null,2)+"\n"],{type:"application/json"});
 const uri=URL.createObjectURL(blob);
 const a=document.createElement("a");
 a.href=uri;
 a.download="chromalect-lexical-source-review.json";
 document.body.appendChild(a);
 a.click();a.remove();
 URL.revokeObjectURL(uri);
}
async function load(){
 try{
  const [response,profileResponse]=await Promise.all([
   fetch("semantic/full-lexical-review-queue-v0.1.json"),
   fetch("profiles/mandarin-1000-v1.json")
  ]);
  if(!response.ok||!profileResponse.ok)throw new Error("Queue or character profiles unavailable");
  const [data,profile]=await Promise.all([response.json(),profileResponse.json()]);
  if(profile.schema!=="chromalect.mandarin-character-profile.v1"||
     profile.catalog_count!==1000||!Array.isArray(profile.characters)||
     profile.characters.length!==1000)
    throw new Error("Invalid shared character profile");
  profileByRank=new Map(profile.characters.map(r=>[r.rank,r]));
  if(data.records.some(r=>profileByRank.get(r.rank)?.character!==r.character))
    throw new Error("Unaligned Mandarin lexical and glyph records");
  if(data.schema!=="chromalect.semantic.full-lexical-review-queue.v0.1"||
    data.status!=="unreviewed_source_first_all_candidate_senses"||
    data.counts?.total!==897||
    data.counts?.strictWholeTermMatches!==649||
    data.counts?.noWholeTermMatch!==248||
    data.counts?.independentLexicalApproved!==0||
    data.counts?.independentEmojiApproved!==0||
    !Array.isArray(data.records)||data.records.length!==897)
    throw new Error("Unexpected source or non-pending approval state");
  for(const r of data.records){
   readingParser.split(r);
   if(!r.rank||!r.character||!r.selectedMeaning||!r.referenceDefinition||
     !r.dictionaryExcerpt||!Array.isArray(r.dictionaryReadings)||!r.dictionaryReadings.length||
    r.dictionaryReadings.some(x=>typeof x!=="string"||!x)||
    !Array.isArray(r.matchingDictionaryReadings)||
    r.matchingDictionaryReadings.some(x=>!r.dictionaryReadings.includes(x))||
    r.strictWholeTermMatch!==true&&r.strictWholeTermMatch!==false||
     r.lexicalDecision!=="pending"||
     r.productionVerified!==false)
    throw new Error("Malformed or already accepted lexical source entry");
  }
  queue=data;
  $("lexical-study-start").disabled=false;
  status("Loaded 897 unapproved sense candidates, including 248 discrepancies and 649 literal wording matches. No judgments will be uploaded.");
 }catch(err){
  status("Unable to load verified-format lexical review source. No study can begin.");
 }
}
$("lexical-study-start").addEventListener("click",start);
for(const c of controls)c.addEventListener("click",()=>setJudgment(c.dataset.lexicalJudgment));
$("lexical-study-rationale").addEventListener("input",validate);
$("lexical-study-reading").addEventListener("change",validate);
$("lexical-study-commit").addEventListener("click",commit);
$("lexical-study-next").addEventListener("click",next);
$("lexical-study-export").addEventListener("click",exportJSON);
load();
})();
