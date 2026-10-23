/* Presentation-masked, non-collecting source-region rehearsal.
 * Public manifests include the machine answer key; no true blinding is claimed.
 */
(() => {
"use strict";
const preview=globalThis.ChromalectMaskedSourcePreview;
const $=id=>document.getElementById(id);
const ids=["om-status","om-cohort","om-pair","om-size","om-count","om-meta",
 "om-grid","om-native","om-a","om-b","om-a-form","om-b-form",
 "om-prev","om-next","om-position"];
if(ids.some(id=>!$(id)))return;
const statuses=new Set(["all","introduced","resolved","retained"]);
const sizes=new Set([16,24,32,48,64,96,128,160]);
let targets=[],activeCohort="all",selected=null,visibleIds=[];
const message=s=>{$("om-status").textContent=s;};
function applySize(){
 const s=Number($("om-size").value);
 if(!sizes.has(s))throw Error("Invalid reading-size control");
 $("om-grid").style.setProperty("--om-glyph-size",s+"px");
}
function updateNavigation(){
 const index=visibleIds.indexOf(selected);
 $("om-prev").disabled=index<=0;
 $("om-next").disabled=index<0||index>=visibleIds.length-1;
 $("om-position").textContent=index<0?"No pair selected.":
  (index+1)+" of "+visibleIds.length+" in selected warning cohort";
}
function selectPair(id){
 const target=targets.find(x=>x.id===id);
 if(!target)throw Error("Masked source-region pair unavailable");
 const [a,b]=target.candidates;
 selected=id;
 $("om-pair").value=id;
 $("om-native").textContent=target.character;
 $("om-a").src=a.svg;$("om-b").src=b.svg;
 $("om-a-form").textContent="Source component form: "+a.form;
 $("om-b-form").textContent="Source component form: "+b.form;
 $("om-meta").textContent="Source pair "+target.rank+" · "+target.character+
  " · warning cohort "+target.reviewState+" · two provisional source regions · "+
  "0 independently adjudicated owners.";
 updateNavigation();
}
function showCohort(cohort,preferredId=null){
 if(!statuses.has(cohort))throw Error("Unrecognized warning cohort");
 const rows=targets.filter(x=>cohort==="all"||x.reviewState===cohort);
 if(!rows.length)throw Error("No source-owned warning pairs");
 visibleIds=rows.map(x=>x.id);
 $("om-pair").replaceChildren();
 for(const x of rows){
  const option=document.createElement("option");
  option.value=x.id;
  option.textContent="#"+x.rank+" · "+x.character+" · "+x.id;
  $("om-pair").appendChild(option);
 }
 $("om-count").textContent=rows.length+" of 49 source-pair presentations · "+
  "0 certified components";
 selectPair(rows.find(x=>x.id===preferredId)?.id||rows[0].id);
 activeCohort=cohort;
}
async function load(){
 try{
  if(!preview)throw Error("Neutral mask validator missing");
  const source="glyphs/research/owner-masked-stimuli-v0.1/index-v0.1.json";
  const response=await fetch(source);
  if(!response.ok)throw Error("Key-separated source stimuli unavailable");
  targets=preview.validate(await response.json());
  applySize();
  showCohort("all");
  $("om-cohort").disabled=false;$("om-pair").disabled=false;
  const fragment=globalThis.location?.hash?.slice(1)||"";
  if(fragment&&targets.some(t=>t.id===fragment))selectPair(fragment);
  message("49 key-separated source-region displays ready. No review collected or certified.");
 }catch(e){
  $("om-cohort").disabled=true;$("om-pair").disabled=true;
  message("Source-region presentation unavailable: "+e.message);
 }
}
$("om-cohort").addEventListener("change",()=>{
 try{
  showCohort($("om-cohort").value,selected);
  message("Warning cohort changed; no independent source-owner judgment.");
 }catch(e){
  $("om-cohort").value=activeCohort;
  message("Cohort rejected: "+e.message);
 }
});
$("om-pair").addEventListener("change",()=>{
 try{
  selectPair($("om-pair").value);
  message("Provisional source-region presentation changed.");
 }catch(e){
  if(selected)$("om-pair").value=selected;
  message("Source pair rejected: "+e.message);
 }
});
function move(offset){
 const index=visibleIds.indexOf(selected),next=visibleIds[index+offset];
 if(index<0||!next)return;
 selectPair(next);
 message("Source-region sequence advanced without recording a response.");
}
$("om-prev").addEventListener("click",()=>move(-1));
$("om-next").addEventListener("click",()=>move(1));
$("om-size").addEventListener("change",()=>{
 try{applySize();message("Matched glyph size changed; no human visual result.");}
 catch(e){message("Size rejected: "+e.message);}
});
load();
})();