// Provisional height/backness/rounding research controls for six simple written finals.
// Original spelling, palette and character geometry remain unchanged.
(() => {
"use strict";
const $=id=>document.getElementById(id);
const ids=["vowel-mode","vowel-color","vowel-grid","vowel-list","vowel-summary","vowel-status"];
if(ids.some(id=>!$(id)))return;
const heights=["close","mid","open"],places=["front","central","back"];
let records=[],palette=null;
function label(tag,value,klass){
 const node=document.createElement(tag);
 node.textContent=value;if(klass)node.className=klass;
 return node;
}
function render(){
 const mode=$("vowel-mode").value;
 if(!["features","pinyin"].includes(mode))throw Error("Unexpected vowel research display");
 const color=$("vowel-color").checked;
 $("vowel-grid").replaceChildren();$("vowel-list").replaceChildren();
 for(const height of heights)for(const backness of places){
  const cell=document.createElement("div");
  cell.className="vowel-cell";
  cell.appendChild(label("span",height+" · "+backness,"vowel-axis"));
  for(const r of records.filter(x=>x.workingHeight===height&&x.workingBackness===backness)){
   const p=document.createElement("div");p.className="vowel-tag";
   const mark=document.createElement("span");mark.className="vowel-symbol";
   mark.textContent=mode==="features"?(r.workingRounding==="rounded"?"◉":"○"):r.token;
   mark.setAttribute("aria-label",mode==="features"?
    r.token+" working "+r.workingRounding+" category":r.token+" written final");
   if(color)mark.style.color=palette.final.tokens[r.token];
   p.appendChild(mark);
   p.appendChild(label("span",r.token,"vowel-token"));
   cell.appendChild(p);
  }
  $("vowel-grid").appendChild(cell);
 }
 for(const r of records){
  const card=document.createElement("article");
  card.className="vowel-record";
  const name=label("h2",r.token+" · "+r.workingHeight+" "+r.workingBackness+" "+r.workingRounding);
  const uses=label("p",r.observedSourceCitationReadings+" source citation readings · "+
   r.sourceSpellingContextCautions+" spelling-context warnings","vowel-caution");
  const state=label("p","Provisional feature assignment, not a verified IPA or contextual phone.","vowel-caution");
  card.appendChild(name);card.appendChild(uses);card.appendChild(state);
  $("vowel-list").appendChild(card);
 }
}
async function load(){
 try{
  const urls=["phonetics/mandarin-simple-final-feature-candidates-v0.1.json",
   "pronunciation-citations-0001-1000.json","layers-v0.1.json",
   "phonetics/mandarin-final-spelling-context-gates-v0.1.json"];
  const responses=await Promise.all(urls.map(x=>fetch(x)));
  if(responses.some(r=>!r.ok))throw Error("Missing source vowel cohort or caution ledger");
  const [data,source,layers,warnings]=await Promise.all(responses.map(r=>r.json()));
  if(data.schema!=="chromalect.phonetics.mandarin-simple-final-feature-candidates.v0.1"||
     data.status!=="six_pedagogical_written_final_feature_hypotheses_not_ipa_or_context_approval"||
     data.source.upstreamBlobSHA!==source.source.blob_sha||
     data.source.paletteChanged!==false||
     data.source.sourceCharacterStrokesChanged!==false||
     source.schema!=="chromalect.pronunciation-citations.v0"||source.tranche!=="0001-1000"||
     source.characters.length!==1000||
     layers.schema!=="chromalect.presentation-layers.v0"||
     warnings.schema!=="chromalect.phonetics.mandarin-final-spelling-context-gates.v0.1"||
     warnings.summary.flaggedSourceReadings!==213||
     warnings.summary.independentlyAdjudicatedFinalPhonemes!==0||
     data.summary.distinctSimpleFinalLabels!==6||
     data.summary.allSourceFinalLabels!==33||
     data.summary.simpleFinalOccurrences!==432||
     data.summary.flaggedSimpleFinalOccurrences!==112||
     data.summary.unflaggedSimpleFinalOccurrences!==320||
     data.summary.uniqueWorkingFeatureTuples!==6||
     data.summary.independentIPAApprovalCount!==0||
     data.summary.humanVowelFeatureDecodingTrials!==0||
     data.summary.learningOutcomeEvidence!==0||
     !Array.isArray(data.records)||data.records.length!==6)
   throw Error("Source vowel features or nonapproval evidence changed");
  const risks=new Set();
  for(const row of warnings.records)for(const x of row.observedTokenTriples)
   risks.add(JSON.stringify([x.initial,x.final,x.tone]));
  const counts=new Map(),cautions=new Map();
  for(const c of source.characters)for(const r of c.readings){
   counts.set(r.final,1+(counts.get(r.final)??0));
   if(risks.has(JSON.stringify([r.initial,r.final,r.tone])))
    cautions.set(r.final,1+(cautions.get(r.final)??0));
  }
  const ids=new Set(),tuples=new Set();
  for(const r of data.records){
   const key=[r.workingHeight,r.workingBackness,r.workingRounding].join("|");
   if(ids.has(r.token)||tuples.has(key)||
      !heights.includes(r.workingHeight)||!places.includes(r.workingBackness)||
      !["rounded","unrounded"].includes(r.workingRounding)||
      r.observedSourceCitationReadings!==counts.get(r.token)||
      r.sourceSpellingContextCautions!==(cautions.get(r.token)??0)||
      r.acceptedAsIPAOrContextualPhone!==false||
      r.articulatoryFeatureStatus!=="provisional_pedagogical_candidate_not_independently_adjudicated"||
      !Object.hasOwn(layers.palette_domains.final.tokens,r.token))
    throw Error("Working single-final category not source-aligned or has unearned approval");
   ids.add(r.token);tuples.add(key);
  }
  if(ids.size!==6||[...ids].reduce((n,t)=>n+counts.get(t),0)!==432||
     [...ids].reduce((n,t)=>n+(cautions.get(t)??0),0)!==112)
   throw Error("Incomplete six-simple-final observations");
  palette=layers.palette_domains;records=data.records;
  $("vowel-summary").textContent="Six proposed vowel-category symbols · 432 source usages "+
   "(112 flagged for spelling-context review) · no phonetic or learning approvals.";
  $("vowel-status").textContent="Source spelling and warning observations validated; feature geometry is a research hypothesis.";
  render();
 }catch(e){records=[];$("vowel-grid").replaceChildren();$("vowel-list").replaceChildren();
  $("vowel-status").textContent="Unable to verify proposed vowel-feature reference: "+e.message;}
}
$("vowel-mode").addEventListener("change",render);
$("vowel-color").addEventListener("change",render);
load();
})();