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
let selectionRendered=false;
function stageCurrent(){
 if(!selected||!selectionRendered)return;
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
 selectionRendered=true;
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
  if(values[field].length>max||
     /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/u.test(values[field]))
   throw Error("Research field contains an invalid value");
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

function exactKeys(value,expected){
 return value&&typeof value==="object"&&!Array.isArray(value)&&
  Object.keys(value).sort().join("|")===expected.slice().sort().join("|");
}
function validateImport(raw){
 if(typeof raw!=="string"||raw.length>1500000)throw Error("Local JSON size is invalid");
 const parsed=JSON.parse(raw);
 if(!exactKeys(parsed,["schema","status","source","session","observations"])||
    parsed.schema!=="chromalect.phonetics.local-caution-review-session.v0.1"||
    parsed.status!=="unverified_local_phonetic_research_notes_not_ipa_or_phoneme_approval")
  throw Error("Local export schema or approval state is unsupported");
 if(!exactKeys(parsed.source,["citationBlobSHA","cautionIndex","citationIndex"])||
    parsed.source.citationBlobSHA!==sourceSHA||
    parsed.source.cautionIndex!=="mandarin-final-spelling-context-gates-v0.1.json"||
    parsed.source.citationIndex!=="pronunciation-citations-0001-1000.json")
  throw Error("Imported source identity differs from this research tranche");
 if(!exactKeys(parsed.session,["localOnly","exportedAt","recorded"])||
    parsed.session.localOnly!==true||
    typeof parsed.session.exportedAt!=="string"||
    Number.isNaN(Date.parse(parsed.session.exportedAt)))
  throw Error("Imported export metadata is invalid");
 if(!Array.isArray(parsed.observations)||parsed.observations.length<1||
    parsed.observations.length>213||
    parsed.session.recorded!==parsed.observations.length)
  throw Error("Imported observation count is invalid");
 const sourceMap=new Map(candidates.map(c=>[c.key,c]));
 const result=new Map();
 const expected=["rank","character","display","initial","final","tone",
  "cautionFamily",...fields];
 for(const entry of parsed.observations){
  if(!exactKeys(entry,expected))throw Error("Unexpected note field or approval claim");
  const key=JSON.stringify([entry.rank,entry.display,entry.initial,entry.final,entry.tone]);
  const original=sourceMap.get(key);
  if(!original||original.character!==entry.character||
     original.cautionFamily!==entry.cautionFamily||result.has(key))
   throw Error("Unknown, mismatched or duplicate source citation reading");
  if(!allowedAssessments.has(entry.assessment))
   throw Error("Invalid preliminary assessment");
  for(const [name,max] of [["evidenceURL",1000],["evidenceRationale",3000],
   ["declaredVariety",120],["transcriptionConvention",120],["workingTranscription",120]]){
   const value=entry[name];
   if(typeof value!=="string"||value.length>max||
      /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/u.test(value))
    throw Error("Invalid imported review text");
  }
  if(/[\r\n]/u.test(entry.workingTranscription))
   throw Error("Imported transcription is not a single line");
  const hypothesis=entry.assessment!=="undetermined"||
   entry.workingTranscription.length>0;
  if(hypothesis&&(!entry.evidenceURL||
     entry.evidenceRationale.trim().length<30||
     !entry.declaredVariety.trim()||!entry.transcriptionConvention.trim()))
   throw Error("Imported hypothesis is missing its evidence requirements");
  if(entry.evidenceURL){
   const url=new URL(entry.evidenceURL);
   if(url.protocol!=="https:"||url.username||url.password||
      url.hash||!url.hostname)
    throw Error("Imported evidence reference is not a safe HTTPS source");
  }
  result.set(key,Object.fromEntries(fields.map(name=>[name,entry[name]])));
 }
 return result;
}
function importJSON(){
 if(!candidates.length)throw Error("Pinned source data unavailable");
 // Transactional: preserve the previous drafts if any imported note fails.
 const replacement=validateImport($("pc-import-data").value);
 drafts=replacement;
 scratch.clear();
 $("pc-output").value="";
 showSelection();
 status(replacement.size+" locally saved notes restored from a source-checked export; no phonetic approvals.");
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
  selectionRendered=false;
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
$("pc-import").addEventListener("click",()=>{
 try{importJSON();}
 catch(e){status("Import blocked; existing drafts preserved: "+e.message);}
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
