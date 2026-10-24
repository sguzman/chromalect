/* Browser demonstration of the pinned visual citation symbol decoder.
   All decisions are source-triple membership; no sound-level inference. */
(() => {
"use strict";
const $=id=>document.getElementById(id);
const required=["vd-initial","vd-tone","vd-back","vd-clear","vd-pad",
 "vd-sequence","vd-status","vd-result","vd-evidence"];
if(required.some(id=>!$(id)))return;
const NS="http://www.w3.org/2000/svg";
const make=(tag,klass,text)=>{
 const el=document.createElement(tag);if(klass)el.className=klass;
 if(text!==undefined)el.textContent=String(text);return el;
};
let symbols=[],bySignature=new Map(),lookup=new Map(),chosen=[],palette=null;
function figure(i){
 const primitive=symbols[i];
 const svg=document.createElementNS(NS,"svg");
 svg.setAttribute("viewBox","0 0 50 52");
 svg.setAttribute("role","img");
 svg.setAttribute("aria-label","Geometric written-letter source primitive "+primitive.letter);
 const path=document.createElementNS(NS,"path");
 path.setAttribute("d",primitive.path);path.setAttribute("fill","none");
 path.setAttribute("stroke","currentColor");path.setAttribute("stroke-width","3");
 path.setAttribute("stroke-linecap","round");
 svg.appendChild(path);return svg;
}
const options=(target,rows)=>{
 target.replaceChildren();
 for(const [value,label] of rows){
  const node=make("option",null,label);node.value=String(value);
  target.appendChild(node);
 }
};
function render(){
 if(!symbols.length)return;
 $("vd-sequence").replaceChildren();
 for(const index of chosen)$("vd-sequence").appendChild(figure(index));
 if(!chosen.length)$("vd-sequence").appendChild(make("span",null,
  "No final symbols selected; choose from the visual letter alphabet."));
 const final=bySignature.get(JSON.stringify(chosen));
 const initial=$("vd-initial").value,tone=$("vd-tone").value;
 const source=final?lookup.get(JSON.stringify([initial,final,tone])):null;
 $("vd-result").replaceChildren();
 if(source){
  $("vd-result").appendChild(make("strong","vd-reading",source.reading));
  $("vd-result").appendChild(make("p",null,
   "Original source written final: "+final+" · "+source.characters.length+
   " source-ranked character(s) share this exact citation triple."));
  const list=make("p",null,"Source examples: "+source.characters.slice(0,12).join(" · "));
  list.lang="zh-Hans";$("vd-result").appendChild(list);
  $("vd-status").textContent="Exact source-attested spelling reconstructed.";
 }else{
  $("vd-result").appendChild(make("span",null,final?
   "That initial/final/tone combination is not attested in the pinned 1,171 readings.":
   "This symbol sequence does not match one of the 33 source written-final codes."));
  $("vd-status").textContent="No source-attested full-code decode for current selection.";
 }
 $("vd-evidence").textContent="Selected visual code: initial "+initial+
  " · "+chosen.length+" ordered geometric letter primitive(s) · citation tone "+tone+
  ". No contextual or phonemic claim.";
}
async function load(){
 try{
  const urls=["pronunciation-citations-0001-1000.json",
   "phonetics/written-final-symbol-control-v0.1.json",
   "phonetics/mandarin-initial-feature-candidates-v0.1.json",
   "layers-v0.1.json",
   "phonetics/mandarin-visual-citation-codec-audit-v0.1.json"];
  const responses=await Promise.all(urls.map(url=>fetch(url)));
  if(responses.some(x=>!x.ok))throw Error("Missing source visual-code data");
  const [source,finals,initials,layers,audit]=await Promise.all(responses.map(r=>r.json()));
  if(source.schema!=="chromalect.pronunciation-citations.v0"||
     source.tranche!=="0001-1000"||source.characters.length!==1000||
     finals.schema!=="chromalect.phonetics.written-final-symbol-control.v0.1"||
     finals.source.upstreamBlobSHA!==source.source.blob_sha||
     finals.status!=="arbitrary_geometric_written_letter_control_not_articulatory_or_ipa"||
     finals.summary.independentlyApprovedIPARealizations!==0||
     finals.summary.humanSymbolDecodingTrials!==0||
     initials.schema!=="chromalect.phonetics.mandarin-initial-feature-candidates.v0.1"||
     initials.statistics.independentlyVerifiedPhonemicContrasts!==0||
     layers.schema!=="chromalect.presentation-layers.v0"||
     audit.schema!=="chromalect.phonetics.mandarin-visual-citation-codec-audit.v0.1"||
     audit.status!=="exact_machine_visual_token_decoding_not_phonemic_or_human_verified"||
     audit.sources.pinnedCitationBlobSHA!==source.source.blob_sha||
     audit.counts.sourceReadings!==1171||
     audit.counts.attestedCitationTriples!==673||
     audit.counts.independentHumanVisualDecodings!==0||
     audit.counts.independentlyVerifiedPhonemicMappings!==0||
     audit.counts.educationalEffectMeasurements!==0)
   throw Error("Citation visual code or scientific evidence diverged");
  if(!Array.isArray(finals.primitives)||finals.primitives.length!==9||
     !Array.isArray(finals.records)||finals.records.length!==33||
     !Array.isArray(initials.tokens)||initials.tokens.length!==24)
   throw Error("Visual primitive or initial categories missing");
  const byFinal=new Map(),signatures=new Map();
  for(const r of finals.records){
   if(byFinal.has(r.token)||r.machineSpellingRoundtrip!==true||
      r.independentPhonologicalInterpretationApproved!==false||
      !Array.isArray(r.iconRegistryIndices)||
      !r.iconRegistryIndices.every((n,i)=>Number.isInteger(n)&&
       finals.primitives[n]?.letter===r.symbolLetters[i]))
    throw Error("Unsupported geometric source record");
   const signature=JSON.stringify(r.iconRegistryIndices);
   if(signatures.has(signature))throw Error("Two written finals share geometric code");
   signatures.set(signature,r.token);
   byFinal.set(r.token,r);
  }
  const toneSymbols=layers.palette_domains.tone.symbols;
  const toneEntries=Object.entries(toneSymbols);
  if(JSON.stringify(toneEntries.map(x=>x[0]))!==JSON.stringify(["0","1","2","3","4"]))
   throw Error("Tone reference changed");
  const initialTokens=new Set(initials.tokens.map(x=>x.token));
  if(initialTokens.size!==24)throw Error("Initial reference ambiguous");
  const triples=new Map();let count=0;
  for(let i=0;i<source.characters.length;i++){
   const c=source.characters[i];
   if(c.rank!==i+1||![...c.character].length||!Array.isArray(c.readings))
    throw Error("Citation rank mismatch");
   for(const r of c.readings){
    if(!initialTokens.has(r.initial)||!byFinal.has(r.final)||
       !Object.hasOwn(toneSymbols,String(r.tone)))throw Error("Unmapped original citation");
    const key=JSON.stringify([r.initial,r.final,String(r.tone)]);
    const found=triples.get(key);
    if(found){
     if(found.reading!==r.display)throw Error("One code yields contradictory source spellings");
     found.characters.push(c.character);
    }else triples.set(key,{reading:r.display,characters:[c.character]});
    count++;
   }
  }
  if(count!==1171||triples.size!==673)throw Error("First-tranche coverage changed");
  symbols=finals.primitives;bySignature=signatures;lookup=triples;palette=layers.palette_domains;
  options($("vd-initial"),initials.tokens.map(x=>[x.token,x.token+
   (x.category==="conventional_pinyin_initial"?
    " · "+x.place+" / "+x.manner+" / "+x.aspiration:" · spelling convention")]));
  options($("vd-tone"),toneEntries.map(([k,v])=>[k,"T"+k+" · "+v]));
  $("vd-pad").replaceChildren();
  symbols.forEach((primitive,index)=>{
   const button=make("button","vd-letter");button.type="button";
   button.setAttribute("aria-label","Append source geometric primitive "+primitive.letter);
   button.appendChild(figure(index));
   button.appendChild(make("small",null,primitive.letter));
   button.addEventListener("click",()=>{if(chosen.length<4)chosen.push(index);render();});
   $("vd-pad").appendChild(button);
  });
  $("vd-initial").value="y";$("vd-tone").value="1";
  chosen=[symbols.findIndex(x=>x.letter==="i")];render();
 }catch(e){
  symbols=[];chosen=[];$("vd-pad").replaceChildren();$("vd-sequence").replaceChildren();
  $("vd-result").replaceChildren();
  $("vd-status").textContent="Unable to validate visual citation source: "+e.message;
 }
}
$("vd-initial").addEventListener("change",render);
$("vd-tone").addEventListener("change",render);
$("vd-back").addEventListener("click",()=>{chosen.pop();render();});
$("vd-clear").addEventListener("click",()=>{chosen=[];render();});
load();
})();
