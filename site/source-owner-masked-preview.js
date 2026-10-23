/* Presentation-masked, non-collecting source-region rehearsal.
 * Public manifests include the machine answer key; no true blinding is claimed.
 */
(() => {
"use strict";
const pairing=globalThis.ChromalectBlindColorRehearsal;
const identification=globalThis.ChromalectComponentIdentificationRehearsal;
const audit=globalThis.ChromalectOwnerAdjudication;
const $=id=>document.getElementById(id);
const ids=["om-status","om-cohort","om-pair","om-size","om-count","om-meta",
 "om-grid","om-native","om-a","om-b","om-a-form","om-b-form"];
if(ids.some(id=>!$(id)))return;
const statuses=new Set(["all","introduced","resolved","retained"]);
const sizes=new Set([16,24,32,48,64,96,128,160]);
let targets=[],complements=new Map(),activeCohort="all",selected=null;
const message=s=>{$("om-status").textContent=s;};
function applySize(){
 const s=Number($("om-size").value);
 if(!sizes.has(s))throw Error("Invalid reading-size control");
 $("om-grid").style.setProperty("--om-glyph-size",s+"px");
}
function selectPair(id){
 const target=targets.find(x=>x.id===id);
 if(!target||!complements.has(id))throw Error("Source-region pair unavailable");
 const alternate=complements.get(id);
 // Fixed trial-id checksum distributes primary/partner images across display sides.
 // This is a deterministic engineering convention; it is NOT a blinded allocation.
 const checksum=[...id].reduce((sum,ch)=>sum+ch.charCodeAt(0),0);
 const primaryFirst=checksum%2===0;
 const original=target.offeredComponents.find(x=>x.id===target.machineAssignedOwner);
 const partner=target.offeredComponents.find(x=>x.id===target.otherOwner);
 if(!original||!partner)throw Error("Incomplete candidate component source mapping");
 const a=primaryFirst?{url:target.locatorSVG,form:original.form}:
  {url:alternate.complementarySVG,form:partner.form};
 const b=primaryFirst?{url:alternate.complementarySVG,form:partner.form}:
  {url:target.locatorSVG,form:original.form};
 selected=id;
 $("om-pair").value=id;
 $("om-native").textContent=target.character;
 $("om-a").src=a.url;$("om-b").src=b.url;
 $("om-a-form").textContent="Source component form: "+a.form;
 $("om-b-form").textContent="Source component form: "+b.form;
 $("om-meta").textContent="Source pair "+target.rank+" · "+target.character+
  " · warning cohort "+target.reviewState+" · two provisional source regions · "+
  "0 independently adjudicated owners.";
}
function showCohort(cohort,preferredId=null){
 if(!statuses.has(cohort))throw Error("Unrecognized warning cohort");
 const rows=targets.filter(x=>cohort==="all"||x.reviewState===cohort);
 if(!rows.length)throw Error("No source-owned warning pairs");
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
  if(!pairing||!identification||!audit)throw Error("Source validators missing");
  const sources=[
   "glyphs/research/heldout-identification-target-v0.1/index-v0.1.json",
   "glyphs/research/heldout-warning-v0.1/index-v0.1.json",
   "semantic-group-hue-fivefold-heldout-v0.1.json",
   "palettes/mandarin-component-identity-v0.6.json",
   "glyphs/research/owner-complement-locators-v0.1/index-v0.1.json"];
  const responses=await Promise.all(sources.map(x=>fetch(x)));
  if(responses.some(x=>!x.ok))throw Error("Pinned research files unavailable");
  const [m,w,f,p,c]=await Promise.all(responses.map(x=>x.json()));
  const pairSource=pairing.validateSource(w,f,p);
  targets=audit.validateTargets(m,identification.validateSource(m,pairSource));
  complements=audit.validateComplementaryLocators(c,targets);
  applySize();
  showCohort("all");
  $("om-cohort").disabled=false;$("om-pair").disabled=false;
  const fragment=globalThis.location?.hash?.slice(1)||"";
  if(fragment&&targets.some(t=>t.id===fragment))selectPair(fragment);
  message("49 source-pinned region presentations ready. No review collected or certified.");
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
$("om-size").addEventListener("change",()=>{
 try{applySize();message("Matched glyph size changed; no human visual result.");}
 catch(e){message("Size rejected: "+e.message);}
});
load();
})();