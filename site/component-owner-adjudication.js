/* Source-owner review is an evidence intake, not a certification procedure. */
(() => {
"use strict";
const pairing=globalThis.ChromalectBlindColorRehearsal;
const identification=globalThis.ChromalectComponentIdentificationRehearsal;
const audit=globalThis.ChromalectOwnerAdjudication;
const $=id=>document.getElementById(id);
const names=["oa-status","oa-target","oa-meta","oa-source","oa-locator","oa-fold",
 "oa-owner","oa-judgment","oa-evidence","oa-rationale","oa-save","oa-count","oa-export","oa-output"];
if(names.some(id=>!$(id)))return;
const status=x=>{$("oa-status").textContent=x;};
let manifest=null,targets=[],selected=null,notes=new Map();
function selection(id){
 selected=targets.find(t=>t.id===id);
 if(!selected)throw Error("Unknown source-region pair");
 $("oa-target").value=id;
 $("oa-source").src=selected.sourceSVG;
 $("oa-locator").src=selected.locatorSVG;
 $("oa-fold").src=selected.foldSVG;
 $("oa-meta").textContent="Rank "+selected.rank+" · "+selected.character+
  " · warning "+selected.reviewState+" · fold "+selected.foldIndex+
  " · "+selected.targetRegionPaths+" highlighted of "+selected.sourceStrokePaths+" source paths";
 $("oa-owner").textContent="Machine source key: "+selected.machineAssignedOwner+
  " · candidates: "+selected.offeredComponents.map(c=>c.form+" ("+c.id+")").join(" / ")+
  ". Source mapping is not independently verified.";
 const note=notes.get(id)||{judgment:"unresolved",evidenceURL:"",technicalRationale:""};
 $("oa-judgment").value=note.judgment;
 $("oa-evidence").value=note.evidenceURL;
 $("oa-rationale").value=note.technicalRationale;
 $("oa-count").textContent=notes.size+" provisional notes · 0 certifications";
}
function save(){
 if(!selected)throw Error("Source targets unavailable");
 const note={judgment:$("oa-judgment").value,
  evidenceURL:$("oa-evidence").value.trim(),
  technicalRationale:$("oa-rationale").value.trim()};
 if(note.judgment==="unresolved"){
  if(note.evidenceURL||note.technicalRationale)
   throw Error("Select a provisional judgment for referenced notes");
  notes.delete(selected.id);
 }else{
  const next=new Map(notes);next.set(selected.id,note);
  audit.exportNotes(targets,next,new Date().toISOString());
  notes=next;
 }
 $("oa-count").textContent=notes.size+" provisional notes · 0 certifications";
 $("oa-export").disabled=!notes.size;
}
async function load(){
 try{
  if(!pairing||!identification||!audit)throw Error("Source validators unavailable");
  const paths=[
   "glyphs/research/heldout-identification-target-v0.1/index-v0.1.json",
   "glyphs/research/heldout-warning-v0.1/index-v0.1.json",
   "semantic-group-hue-fivefold-heldout-v0.1.json",
   "palettes/mandarin-component-identity-v0.6.json"];
  const fetched=await Promise.all(paths.map(x=>fetch(x)));
  if(fetched.some(x=>!x.ok))throw Error("A generated source manifest is missing");
  const [m,w,f,p]=await Promise.all(fetched.map(x=>x.json()));
  const pairs=pairing.validateSource(w,f,p);
  targets=audit.validateTargets(m,identification.validateSource(m,pairs));
  manifest=m;
  for(const t of targets){
   const option=document.createElement("option");
   option.value=t.id;
   option.textContent="#"+t.rank+" · "+t.character+" · "+t.offeredComponents.map(x=>x.form).join(" / ");
   $("oa-target").appendChild(option);
  }
  $("oa-target").disabled=false;$("oa-save").disabled=false;
  selection(targets[0].id);
  status("49 source-pinned regions loaded; independent acceptance remains zero.");
 }catch(e){status("Cannot load or validate original source regions: "+e.message);}
}
$("oa-target").addEventListener("change",()=>{
 try{
  const next=$("oa-target").value;
  if(selected)save();
  selection(next);status("Preliminary source review; no certifications.");
 }catch(e){
  if(selected)$("oa-target").value=selected.id;
  status("Could not retain current draft: "+e.message);
 }
});
$("oa-save").addEventListener("click",()=>{
 try{save();status("Provisional source observation held in page memory only.");}
 catch(e){status("Note rejected: "+e.message);}
});
$("oa-export").addEventListener("click",()=>{
 try{
  save();
  const report=audit.exportNotes(targets,notes,new Date().toISOString());
  audit.validateExport(report,manifest,targets);
  $("oa-output").value=JSON.stringify(report,null,2)+"\n";
  status("Unapproved source review notes prepared locally. Nothing uploaded.");
 }catch(e){$("oa-output").value="";status("Export rejected: "+e.message);}
});
load();
})();