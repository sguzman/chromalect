/* Source-owner review is an evidence intake, not a certification procedure. */
(() => {
"use strict";
const pairing=globalThis.ChromalectBlindColorRehearsal;
const identification=globalThis.ChromalectComponentIdentificationRehearsal;
const audit=globalThis.ChromalectOwnerAdjudication;
const $=id=>document.getElementById(id);
const names=["oa-status","oa-filter","oa-cohort-count","oa-target","oa-meta","oa-size","oa-grid","oa-source","oa-locator","oa-fold",
 "oa-owner","oa-complement","oa-complement-meta","oa-judgment","oa-evidence","oa-rationale","oa-save","oa-count","oa-export","oa-output","oa-import","oa-restore"];
if(names.some(id=>!$(id)))return;
const status=x=>{$("oa-status").textContent=x;};
const pixelSizes=new Set([16,24,32,48,64,96,128,160]);
function updateSize(){
 const n=Number($("oa-size").value);
 if(!pixelSizes.has(n))throw Error("Unrecognized source comparison pixel size");
 $("oa-grid").style.setProperty("--oa-glyph-size",n+"px");
}
const validCohorts=new Set(["all","introduced","resolved","retained"]);
let activeCohort="all",manifest=null,targets=[],selected=null,
 notes=new Map(),complements=new Map();
function showCohort(cohort){
 if(!validCohorts.has(cohort))throw Error("Unrecognized source warning cohort");
 const rows=targets.filter(t=>cohort==="all"||t.reviewState===cohort);
 if(!rows.length)throw Error("Empty source-owned warning cohort");
 $("oa-target").replaceChildren();
 for(const t of rows){
  const option=document.createElement("option");
  option.value=t.id;
  option.textContent="#"+t.rank+" · "+t.character+
   " · "+t.offeredComponents.map(x=>x.form).join(" / ");
  $("oa-target").appendChild(option);
 }
 $("oa-cohort-count").textContent=rows.length+" of 49 source-pair observations · 0 certifications";
 selection(rows[0].id);
 activeCohort=cohort;
}
function selection(id){
 selected=targets.find(t=>t.id===id);
 if(!selected)throw Error("Unknown source-region pair");
 $("oa-target").value=id;
 $("oa-source").src=selected.sourceSVG;
 $("oa-locator").src=selected.locatorSVG;
 const complement=complements.get(selected.id);
 if(!complement)throw Error("Missing opposite source-owner locator");
 $("oa-complement").src=complement.complementarySVG;
 $("oa-complement-meta").textContent="Complementary source owner: "+selected.otherOwner+
  " · "+complement.complementaryTargetPaths+" highlighted source paths · unverified";
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
   "palettes/mandarin-component-identity-v0.6.json",
   "glyphs/research/owner-complement-locators-v0.1/index-v0.1.json"];
  const fetched=await Promise.all(paths.map(x=>fetch(x)));
  if(fetched.some(x=>!x.ok))throw Error("A generated source manifest is missing");
  const [m,w,f,p,other]=await Promise.all(fetched.map(x=>x.json()));
  const pairs=pairing.validateSource(w,f,p);
  targets=audit.validateTargets(m,identification.validateSource(m,pairs));
  complements=audit.validateComplementaryLocators(other,targets);
  manifest=m;
  $("oa-target").disabled=false;$("oa-filter").disabled=false;
  $("oa-save").disabled=false;$("oa-restore").disabled=false;
  updateSize();showCohort("all");
  status("49 source-pinned regions loaded; independent acceptance remains zero.");
 }catch(e){status("Cannot load or validate original source regions: "+e.message);}
}
$("oa-filter").addEventListener("change",()=>{
 try{
  const next=$("oa-filter").value;
  if(!validCohorts.has(next))throw Error("Unknown source warning cohort");
  if(selected)save();
  showCohort(next);
  status("Source warning cohort filtered; local notes retained and uncertified.");
 }catch(e){
  $("oa-filter").value=activeCohort;
  status("Could not change source cohort: "+e.message);
 }
});
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
$("oa-size").addEventListener("change",()=>{
 try{updateSize();status("Matched source glyph size changed; no perceptual or owner approval.");}
 catch(e){status("Source inspection size rejected: "+e.message);}
});
$("oa-save").addEventListener("click",()=>{
 try{save();status("Provisional source observation held in page memory only.");}
 catch(e){status("Note rejected: "+e.message);}
});
$("oa-restore").addEventListener("click",()=>{
 try{
  if(!manifest||!targets.length||!selected)
   throw Error("Validated source target set unavailable");
  const raw=$("oa-import").value;
  if(typeof raw!=="string"||raw.length<2||raw.length>250000)
   throw Error("A reasonably sized JSON export is required");
  const parsed=JSON.parse(raw);
  const replacement=audit.restoreNotes(parsed,manifest,targets);
  notes=replacement;
  selection(selected.id);
  $("oa-export").disabled=false;
  $("oa-output").value="";
  status("Restored "+notes.size+" provisional source notes locally; replaced prior drafts. "+
   "No upload, independent certification, or browser persistence.");
 }catch(e){
  status("Local note restoration rejected; existing drafts retained: "+e.message);
 }
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