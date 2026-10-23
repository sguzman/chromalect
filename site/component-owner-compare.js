/* Local-only comparison of two provisional, unblinded source-owner exports. */
(() => {
"use strict";
const pairing=globalThis.ChromalectBlindColorRehearsal;
const identification=globalThis.ChromalectComponentIdentificationRehearsal;
const audit=globalThis.ChromalectOwnerAdjudication;
const comparator=globalThis.ChromalectOwnerCompare;
const $=id=>document.getElementById(id);
const ids=["oc-status","oc-first","oc-second","oc-compare","oc-summary","oc-table",
 "oc-json","oc-filter","oc-order","oc-visible"];
if(ids.some(id=>!$(id)))return;
let manifest=null,targets=null,report=null,activeFilter="all",activeOrder="source";
const filters=new Set(["all","disagreeing","matching","onlyFirst","onlySecond",
 "unobserved","shared-reference","shape-ambiguity"]);
const orders=new Set(["source","conflict-first","shared-first"]);
const conflictPriority={disagreeing:0,onlyFirst:1,onlySecond:1,unobserved:2,matching:3};
function showRows(){
 if(!report)return;
 const filter=$("oc-filter").value,order=$("oc-order").value;
 if(!filters.has(filter)||!orders.has(order))throw Error("Unrecognized comparison view");
 const visible=report.rows.filter(row=>filter==="all"||row.comparison===filter||
  (filter==="shared-reference"&&row.sameEvidenceReference===true)||
  (filter==="shape-ambiguity"&&(row.firstJudgment==="shape_ambiguity"||
   row.secondJudgment==="shape_ambiguity")));
 const bySource=(a,b)=>a.rank-b.rank||report.rows.indexOf(a)-report.rows.indexOf(b);
 if(order==="conflict-first"){
  visible.sort((a,b)=>conflictPriority[a.comparison]-conflictPriority[b.comparison]||
   bySource(a,b));
 }else if(order==="shared-first"){
  visible.sort((a,b)=>Number(b.sameEvidenceReference===true)-
   Number(a.sameEvidenceReference===true)||bySource(a,b));
 }
 $("oc-table").replaceChildren();
 for(const row of visible){
  const tr=document.createElement("tr");
  const cells=[
   "#"+row.rank+" · "+row.character+" · "+row.trialId,
   row.firstJudgment||"No note",row.secondJudgment||"No note",
   row.comparison,row.sameEvidenceReference===null?"Not comparable":
   row.sameEvidenceReference?"Same reference":"Different references"];
  for(const value of cells){
   const td=document.createElement("td");td.textContent=value;tr.appendChild(td);
  }
  $("oc-table").appendChild(tr);
 }
 $("oc-visible").textContent=visible.length+" of 49 source pairs visible · "+
  "0 independently reconciled.";
}
const status=x=>{$("oc-status").textContent=x;};
const clear=()=>{
 report=null;
 $("oc-json").value="";
 $("oc-summary").textContent="";
 $("oc-table").replaceChildren();
 $("oc-visible").textContent="No compared source pairs yet.";
 $("oc-filter").disabled=true;$("oc-order").disabled=true;
 activeFilter="all";activeOrder="source";
};
const parse=id=>{
 const raw=$(id).value;
 if(typeof raw!=="string"||raw.length<2||raw.length>250000)
  throw Error("Both local note exports must contain appropriately sized JSON");
 return JSON.parse(raw);
};
async function load(){
 try{
  if(!pairing||!identification||!audit||!comparator)
   throw Error("Pinned source validators unavailable");
  const names=[
   "glyphs/research/heldout-identification-target-v0.1/index-v0.1.json",
   "glyphs/research/heldout-warning-v0.1/index-v0.1.json",
   "semantic-group-hue-fivefold-heldout-v0.1.json",
   "palettes/mandarin-component-identity-v0.6.json",
   "glyphs/research/owner-complement-locators-v0.1/index-v0.1.json"];
  const responses=await Promise.all(names.map(p=>fetch(p)));
  if(responses.some(x=>!x.ok))throw Error("Source research manifest unavailable");
  const [m,w,f,p,c]=await Promise.all(responses.map(x=>x.json()));
  const warnings=pairing.validateSource(w,f,p);
  targets=audit.validateTargets(m,identification.validateSource(m,warnings));
  audit.validateComplementaryLocators(c,targets);
  manifest=m;
  $("oc-compare").disabled=false;
  status("49 pinned source pairs loaded; no independent decisions or certifications.");
 }catch(e){
  $("oc-compare").disabled=true;
  clear();
  status("Cannot validate source manifests: "+e.message);
 }
}
$("oc-compare").addEventListener("click",()=>{
 clear();
 try{
  if(!manifest||!targets)throw Error("Pinned source manifests unavailable");
  const first=parse("oc-first"),second=parse("oc-second");
  report=comparator.compare(first,second,manifest,targets);
  const s=report.summary;
  $("oc-summary").textContent=
   s.jointlyObserved+" pairs in both exports · "+
   s.matchingProvisionalJudgments+" matching provisional judgments · "+
   s.conflictingProvisionalJudgments+" disagreements · "+
   s.firstOnly+" first-only · "+s.secondOnly+" second-only · "+
   s.noObservation+" without either note · "+
   s.sharedEvidenceReferencePairs+" pairs with the same evidence URL · 0 certifications.";
  $("oc-filter").value="all";$("oc-order").value="source";
  $("oc-filter").disabled=false;$("oc-order").disabled=false;
  showRows();
  activeFilter="all";activeOrder="source";
  $("oc-json").value=JSON.stringify(report,null,2)+"\n";
  status("Sanitized provisional comparison prepared locally; no reviewer independence verified.");
 }catch(e){
  clear();
  status("Comparison rejected; no report retained: "+e.message);
 }
});
for(const id of ["oc-first","oc-second"]){
 $(id).addEventListener("input",()=>{
  clear();
  status("Local input changed; run validation again before using comparison results.");
 });
}
for(const id of ["oc-filter","oc-order"]){
 $(id).addEventListener("change",()=>{
  try{
   if(!report)throw Error("Validated comparison unavailable");
   showRows();
   activeFilter=$("oc-filter").value;activeOrder=$("oc-order").value;
   status("Displayed subset updated; sanitized exported report remains complete.");
  }catch(e){
   $("oc-filter").value=activeFilter;$("oc-order").value=activeOrder;
   status("Comparison view rejected: "+e.message);
  }
 });
}
load();
})();