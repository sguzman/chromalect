// Unambiguous written-final symbol baseline. Primitive shapes are arbitrary spelling codes.
(() => {
"use strict";
const $=id=>document.getElementById(id);
const ids=["final-filter","final-labels","final-status","final-count","final-gallery","final-legend"];
if(ids.some(id=>!$(id)))return;
const NS="http://www.w3.org/2000/svg";
let records=[],primitives=[];
function symbolSvg(indices,description){
 const svg=document.createElementNS(NS,"svg"),width=indices.length*48;
 svg.setAttribute("viewBox","0 0 "+width+" 52");
 svg.setAttribute("role","img");
 svg.setAttribute("aria-label",description);
 svg.classList.add("final-code");
 for(let i=0;i<indices.length;i++){
  const group=document.createElementNS(NS,"g"),path=document.createElementNS(NS,"path");
  group.setAttribute("transform","translate("+(i*48)+",0)");
  path.setAttribute("d",primitives[indices[i]].path);
  path.setAttribute("fill","none");
  path.setAttribute("stroke","currentColor");
  path.setAttribute("stroke-width","3.2");
  path.setAttribute("stroke-linecap","round");
  path.setAttribute("stroke-linejoin","round");
  group.appendChild(path);svg.appendChild(group);
 }
 return svg;
}
function render(){
 const q=$("final-filter").value.trim().toLowerCase(),show=$("final-labels").checked;
 const shown=records.filter(r=>r.token.toLowerCase().includes(q));
 $("final-gallery").replaceChildren();
 for(let i=0;i<shown.length;i++){
  const r=shown[i],card=document.createElement("article"),h=document.createElement("h2"),
   name=document.createElement("span"),count=document.createElement("p");
  card.className="final-card";
  h.textContent="Written-final control";
  name.className="final-spelling";
  name.textContent=show?r.token:"Spelling label hidden";
  count.className="final-note";
  count.textContent=r.sourceOccurrences+" pinned citation readings · arbitrary geometric spelling code";
  card.appendChild(h);
  card.appendChild(symbolSvg(r.iconRegistryIndices,"Geometric source-letter sequence"));
  card.appendChild(name);card.appendChild(count);
  $("final-gallery").appendChild(card);
 }
 $("final-count").textContent=shown.length+" / 33 distinct source final spellings";
}
async function load(){
 try{
  const urls=["phonetics/written-final-symbol-control-v0.1.json",
   "pronunciation-citations-0001-1000.json"];
  const responses=await Promise.all(urls.map(url=>fetch(url)));
  if(responses.some(r=>!r.ok))throw Error("Missing published letter-control source");
  const [data,source]=await Promise.all(responses.map(r=>r.json()));
  if(data.schema!=="chromalect.phonetics.written-final-symbol-control.v0.1"||
     data.status!=="arbitrary_geometric_written_letter_control_not_articulatory_or_ipa"||
     source.schema!=="chromalect.pronunciation-citations.v0"||source.tranche!=="0001-1000"||
     source.characters.length!==1000||
     data.source.upstreamBlobSHA!==source.source.blob_sha||
     data.source.sourceGlyphStrokesChanged!==false||
     data.source.spellingPaletteChanged!==false||
     data.summary.sourceCitationReadings!==1171||
     data.summary.writtenFinalsEncoded!==33||
     data.summary.primitiveLetters!==9||
     data.summary.distinctEncodingSignatures!==33||
     data.summary.machineSourceSpellingRoundtrips!==1171||
     data.summary.independentlyApprovedIPARealizations!==0||
     data.summary.humanSymbolDecodingTrials!==0||data.summary.learningResults!==0||
     !Array.isArray(data.primitives)||data.primitives.length!==9||
     !Array.isArray(data.records)||data.records.length!==33)
   throw Error("Published orthographic symbol reference not validated");
  primitives=data.primitives;
  const seenLetters=new Set(primitives.map(x=>x.letter));
  if(seenLetters.size!==9||new Set(primitives.map(x=>x.path)).size!==9||
     !primitives.every(x=>typeof x.path==="string"&&x.path.length>5))
   throw Error("Geometric letter primitives are not unique");
  const tokenCounts=new Map(),signatures=new Set();
  for(const item of source.characters)for(const r of item.readings)
   tokenCounts.set(r.final,1+(tokenCounts.get(r.final)??0));
  for(const r of data.records){
   if(!Array.isArray(r.symbolLetters)||!Array.isArray(r.iconRegistryIndices)||
     r.iconRegistryIndices.length!==r.symbolLetters.length||
     r.iconRegistryIndices.some((index,i)=>!Number.isInteger(index)||
        index<0||index>=9||primitives[index].letter!==r.symbolLetters[i])||
     r.symbolLetters.join("")!==r.token||
     r.sourceOccurrences!==tokenCounts.get(r.token)||
     r.independentPhonologicalInterpretationApproved!==false||
     r.humanDecodingAccuracyKnown!==false||
     r.machineSpellingRoundtrip!==true)
    throw Error("Geometric written-final code is not source-aligned or unapproved");
   const sig=JSON.stringify(r.iconRegistryIndices);
   if(signatures.has(sig))throw Error("Symbol sequence collision");
   signatures.add(sig);
  }
  if(signatures.size!==33||tokenCounts.size!==33)
   throw Error("Source written finals are not fully represented");
  records=data.records;
  $("final-legend").replaceChildren();
  for(let i=0;i<primitives.length;i++){
   const item=document.createElement("div"),letter=document.createElement("span");
   item.className="final-legend-item";letter.textContent=primitives[i].letter;
   item.appendChild(symbolSvg([i],"Arbitrary source-letter symbol"));
   item.appendChild(letter);$("final-legend").appendChild(item);
  }
  $("final-status").textContent="33 distinct written finals, nine arbitrary primitives, "+
   "1,171 source spelling roundtrips; 0 verified phonological or human outcomes.";
  render();
 }catch(e){records=[];$("final-gallery").replaceChildren();
  $("final-legend").replaceChildren();
  $("final-status").textContent="Unable to validate written-final source control: "+e.message;
  $("final-count").textContent="No source-verified written-final codes";}
}
$("final-filter").addEventListener("input",render);
$("final-labels").addEventListener("change",render);
load();
})();