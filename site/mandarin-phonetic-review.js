// Local-only phonetic evidence notes. No upload, persistence or IPA approval.
(() => {
"use strict";
const $=id=>document.getElementById(id);
const ids=["pc-family","pc-candidate","pc-source","pc-assessment","pc-evidence",
 "pc-rationale","pc-variety","pc-convention","pc-transcription",
 "pc-save","pc-export","pc-import","pc-import-data","pc-output","pc-count","pc-status"];
if(ids.some(id=>!$(id)))return;
const status=s=>{$("pc-status").textContent=s;};
const formIds=["pc-assessment","pc-evidence","pc-rationale",
 "pc-variety","pc-convention","pc-transcription"];
const fields=["assessment","evidenceURL","evidenceRationale",
 "declaredVariety","transcriptionConvention","workingTranscription"];
const defaults=()=>({assessment:"undetermined",evidenceURL:"",evidenceRationale:"",
 declaredVariety:"",transcriptionConvention:"",workingTranscription:""});
const allowedAssessments=new Set(["undetermined","tentative_lead","needs_correction"]);
let candidates=[],selected=null,sourceSHA="",drafts=new Map(),scratch=new Map();
function stageCurrent(){
 if(!selected)return;
 const value=readForm();
 const comparison=drafts.get(selected.key)||defaults();
 if(fields.every(name=>value[name]===comparison[name]))scratch.delete(selected.key);
 else scratch.set(selected.key,value);
}
function count(){
 $("pc-count").textContent=drafts.size+" locally saved notes · "+scratch.size+
  " unsaved edits · 0 independently approved";
}
function readForm(){
 return Object.fromEntries(formIds.map((id,i)=>[fields[i],$(id).value.trim()]));
}
function filter(){
 stageCurrent();
 const family=$("pc-family").value;
 const found=candidates.filter(r=>family==="all"||r.cautionFamily===family);
 $("pc-candidate").replaceChildren();
 for(const r of found){
  const option=document.createElement("option");
  option.value=r.key;
  option.textContent="#"+r.rank+" "+r.character+" "+r.display+" · "+r.cautionFamily;
  $("pc-candidate").appendChild(option);
 }
 if(!found.length)throw Error("No pinned readings for selected caution family");
 if(!found.some(r=>r.key===selected?.key))selected=found[0];
 $("pc-candidate").value=selected.key;
 showSelection();
}
function showSelection(){
 if(!selected)return;
 const r=selected,values=scratch.get(r.key)||drafts.get(r.key)||defaults();
 formIds.forEach((id,i)=>{$(id).value=values[fields[i]];});
 $("pc-source").textContent="Pinned character #"+r.rank+" · "+r.character+" "+r.display+
  " · source written initial "+r.initial+" · final "+r.final+
  " · citation tone "+r.tone+" · caution: "+r.cautionFamily+
  " · no independent phonetic approval";
 count();
}
function save(){
 if(!selected)throw Error("Citation reading unavailable");
 const values=readForm();
 if(!allowedAssessments.has(values.assessment))
  throw Error("Unrecognized preliminary assessment");
 for(const [field,max] of [["evidenceURL",1000],["evidenceRationale",3000],
  ["declaredVariety",120],["transcriptionConvention",120],["workingTranscription",120]])
  if(values[field].length>max)throw Error("Research field exceeds permitted size");
 if(/[\r\n]/u.test(values.workingTranscription))
  throw Error("Working transcription must be a single line");
 const hasHypothesis=values.assessment!=="undetermined"||
  values.workingTranscription.length>0;
 if(hasHypothesis){
  if(!values.evidenceURL||values.evidenceRationale.length<30||
     !values.declaredVariety||!values.transcriptionConvention)
   throw Error("Preliminary hypotheses need evidence URL, 30-character rationale, variety and transcription convention");
 }
 if(values.evidenceURL){
  const url=new URL(values.evidenceURL);
  if(url.protocol!=="https:"||url.username||url.password||url.hash||!url.hostname)
   throw Error("Evidence must be an HTTPS URL without credentials or fragment");
 }
 if(fields.every(key=>values[key]===defaults()[key]))drafts.delete(selected.key);
 else drafts.set(selected.key,values);
 scratch.delete(selected.key);
 count();
}
function exportJSON(){
 save();
 if(scratch.size)throw Error("Other readings have unsaved edits; revisit and save them before export");
 if(!drafts.size)throw Error("Save at least one research note before export");
 const observations=candidates.filter(r=>drafts.has(r.key)).map(r=>({
  rank:r.rank,character:r.character,display:r.display,
  initial:r.initial,final:r.final,tone:r.tone,
  cautionFamily:r.cautionFamily,...drafts.get(r.key)
 }));
 return {schema:"chromalect.phonetics.local-caution-review-session.v0.1",
  status:"unverified_local_phonetic_research_notes_not_ipa_or_phoneme_approval",
  source:{citationBlobSHA:sourceSHA,
   cautionIndex:"mandarin-final-spelling-context-gates-v0.1.json",
   citationIndex:"pronunciation-citations-0001-1000.json"},
  session:{localOnly:true,exportedAt:new Date().toISOString(),recorded:observations.length},
  observations};
}
async function load(){
 try{
  const files=["phonetics/mandarin-final-spelling-context-gates-v0.1.json",
   "pronunciation-citations-0001-1000.json"];
  const responses=await Promise.all(files.map(file=>fetch(file)));
  if(responses.some(x=>!x.ok))throw Error("Pinned citation source unavailable");
  const [gates,citations]=await Promise.all(responses.map(x=>x.json()));
  if(gates.schema!=="chromalect.phonetics.mandarin-final-spelling-context-gates.v0.1"||
     gates.summary.flaggedSourceReadings!==213||gates.records.length!==9||
     citations.schema!=="chromalect.pronunciation-citations.v0"||
     citations.characters.length!==1000||
     citations.source.blob_sha!==gates.source.upstreamBlobSHA)
   throw Error("Citation source or caution ledger changed");
  const byTriple=new Map(),counts=new Map();
  $("pc-family").replaceChildren();
  const all=document.createElement("option");all.value="all";all.textContent="All nine warning families";
  $("pc-family").appendChild(all);
  for(const gate of gates.records){
   if(counts.has(gate.id)||gate.independentIPAAnalysisApproved!==false||
      gate.certifiedAcousticRealizations!==0)
    throw Error("Source warning approval or category collision");
   counts.set(gate.id,0);
   const option=document.createElement("option");
   option.value=gate.id;
   option.textContent=gate.id.replaceAll("_"," ")+" ("+gate.observedReadingCount+")";
   $("pc-family").appendChild(option);
   for(const r of gate.observedTokenTriples){
    const key=JSON.stringify([r.initial,r.final,r.tone]);
    if(byTriple.has(key))throw Error("Overlapping warning predicates");
    byTriple.set(key,gate.id);
   }
  }
  if(byTriple.size!==108)throw Error("Missing source warning triples");
  const matches=[],seen=new Set();
  for(let i=0;i<citations.characters.length;i++){
   const c=citations.characters[i];
   if(c.rank!==i+1)throw Error("Source rank changed");
   for(const r of c.readings){
    const family=byTriple.get(JSON.stringify([r.initial,r.final,r.tone]));
    if(!family)continue;
    const key=JSON.stringify([c.rank,r.display,r.initial,r.final,r.tone]);
    if(seen.has(key))throw Error("Duplicate citation identity");
    seen.add(key);
    counts.set(family,counts.get(family)+1);
    matches.push({key,rank:c.rank,character:c.character,display:r.display,
     initial:r.initial,final:r.final,tone:r.tone,cautionFamily:family});
   }
  }
  if(matches.length!==213||counts.size!==9||
     gates.records.some(r=>counts.get(r.id)!==r.observedReadingCount))
   throw Error("Incomplete source-aligned phonetic intake candidates");
  sourceSHA=citations.source.blob_sha;candidates=matches;selected=matches[0];
  $("pc-family").value="all";
  filter();
  status("213 pinned caution-reading identities available; this page does not independently validate exported research notes.");
 }catch(e){
  candidates=[];selected=null;status("Unable to load source-pinned phonetic review: "+e.message);
 }
}
$("pc-family").addEventListener("change",()=>{try{filter();}catch(e){status(e.message);}});
$("pc-candidate").addEventListener("change",()=>{
 stageCurrent();
 selected=candidates.find(r=>r.key===$("pc-candidate").value)||null;showSelection();
});
$("pc-save").addEventListener("click",()=>{
 try{save();$("pc-output").value="";status("Local draft recorded in page memory only; no review approval.");}
 catch(e){status("Draft not saved: "+e.message);}
});
$("pc-export").addEventListener("click",()=>{
 try{$("pc-output").value=JSON.stringify(exportJSON(),null,2);
  status("Local JSON prepared; validate separately using the repository CLI.");}
 catch(e){status("Export blocked: "+e.message);}
});
for(const id of formIds)$(id).addEventListener("input",()=>{
 $("pc-output").value="";
});
load();
})();
