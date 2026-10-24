// Candidate visual notation for Zhao–Li's published 34-unit model.
// Structured feature decoding only; no source-attested utterances or human readability claims.
(() => {
"use strict";
const $=id=>document.getElementById(id);
const names=["model-onset","model-v1","model-v2","model-v3","model-coda",
 "model-tone","model-status","model-graphics","model-decoded","model-inventory"];
if(names.some(id=>!$(id)))return;
const NS="http://www.w3.org/2000/svg";
const make=(tag,text)=>{
 const node=document.createElement(tag);
 if(text!==undefined)node.textContent=String(text);
 return node;
};
const element=(tag,attributes)=>{
 const n=document.createElementNS(NS,tag);
 for(const [k,v] of Object.entries(attributes||{}))n.setAttribute(k,String(v));
 return n;
};
const path=(parent,d,fill="none",strokeWidth=3)=>{
 parent.appendChild(element("path",{d,stroke:"currentColor",
  fill,"stroke-width":strokeWidth,"stroke-linecap":"round","stroke-linejoin":"round"}));
};
const frames={
 bilabial:"M16 13 Q8 36 16 59 H54 Q62 36 54 13 Z",
 labiodental:"M19 13 H54 L60 59 H8 Z",
 alveolar:"M35 11 L62 58 H8 Z",
 velar:"M35 10 L63 36 L35 62 L7 36 Z",
 palatoalveolar:"M35 10 L62 24 L53 62 H17 L8 24 Z",
 retroflex:"M17 11 H53 L64 31 L53 62 H17 L6 31 Z"
};
const manner={
 stop:"M29 29 H41 V42 H29 Z",
 nasal:"M23 43 V28 Q29 21 35 37 Q41 53 47 28 V43",
 lateral:"M29 25 V45 H44",
 fricative:"M21 28 L28 43 L35 28 L42 43 L49 28",
 affricate:"M22 27 H31 V42 H22 Z M35 28 L41 42 L48 28"
};
const vowels={
 front:"M16 11 H54 V61 H16 Z",
 central:"M35 9 L62 35 L35 63 L8 35 Z",
 back:"M17 13 H53 Q67 35 53 59 H17 Q3 35 17 13 Z",
 "tip-front":"M14 11 H57 L64 60 H21 Z",
 "tip-back":"M20 11 H55 L49 60 H7 Z"
};
const heightY={"high":22,"mid-high":29,"mid":36,"mid-low":43,"low":50};
const toneShapes={
 "0":"M23 38 H29",
 "1":"M8 29 H62",
 "2":"M8 53 L62 17",
 "3":"M8 18 L35 55 L62 18",
 "4":"M8 17 L62 53"
};
const toneSymbols={"0":"·","1":"—","2":"↗","3":"⌄","4":"↘"};
const key=item=>item.segmentClass==="vowel"?
 JSON.stringify(["v",item.articulatoryPlace,item.articulatoryHeight,item.rounding]):
 JSON.stringify(["c",item.articulatoryPlace,item.manner,item.voicingAspiration]);
function features(item){
 return item.segmentClass==="vowel"?
  {segmentClass:"vowel",place:item.articulatoryPlace,
   height:item.articulatoryHeight,rounding:item.rounding}:
  {segmentClass:"consonant",place:item.articulatoryPlace,
   manner:item.manner,voicingAspiration:item.voicingAspiration};
}
function readKey(item){
 return item.segmentClass==="vowel"?
  JSON.stringify(["v",item.place,item.height,item.rounding]):
  JSON.stringify(["c",item.place,item.manner,item.voicingAspiration]);
}
let byToken=new Map(),byKey=new Map(),tones=null;
const seqRoles=["C","V1","V2","V3","C","T"];
function drawSegment(parent,item,slotIndex){
 const group=element("g",{transform:"translate("+(8+slotIndex*80)+" 15)"});
 parent.appendChild(group);
 const slotName=element("text",{x:35,y:84,"text-anchor":"middle",
  fill:"currentColor","font-size":11});
 slotName.textContent=seqRoles[slotIndex];group.appendChild(slotName);
 if(item===null){
  path(group,"M16 38 H54", "none",1.8);return;
 }
 if(slotIndex===5){
  path(group,toneShapes[item.tone],"none",4);
  return;
 }
 if(item.segmentClass==="vowel"){
  path(group,vowels[item.place]);
  path(group,"M22 "+heightY[item.height]+" H47", "none",4);
  if(item.rounding==="rounded"){
   group.appendChild(element("circle",{cx:59,cy:18,r:7,
    stroke:"currentColor",fill:"none","stroke-width":3}));
  }else{
   path(group,"M54 13 L64 23","none",2);
  }
 }else{
  path(group,frames[item.place]);
  path(group,manner[item.manner],
   ["stop","affricate"].includes(item.manner)?"currentColor":"none",2.7);
  if(item.voicingAspiration==="voiced")
   group.appendChild(element("circle",{cx:63,cy:10,r:3.5,fill:"currentColor"}));
  if(item.voicingAspiration==="voiceless_aspirated")
   path(group,"M63 17 L69 25 L63 33 M68 37 L73 44 L68 51","none",2.5);
  if(item.voicingAspiration==="voiceless")
   path(group,"M63 21 V41","none",2.5);
 }
}
function svg(encoded){
 const canvas=element("svg",{viewBox:"0 0 500 122",role:"img",
  "aria-label":"Six-slot constructed model feature shapes, independent tone last",
  class:"model-feature-svg"});
 const units=[encoded.onset,...encoded.vowels,
  ...Array(3-encoded.vowels.length).fill(null),encoded.coda,encoded.tone];
 units.forEach((u,i)=>drawSegment(canvas,u,i));
 return canvas;
}
function option(parent,value,label){
 const node=make("option",label);node.value=value;parent.appendChild(node);
}
function render(){
 if(!byToken.size||!tones)return;
 const onset=$("model-onset").value||null;
 const vowel1=$("model-v1").value,
  v2=$("model-v2").value,v3=$("model-v3").value;
 const coda=$("model-coda").value||null;
 const tone=$("model-tone").value;
 const candidate=[vowel1,v2,v3];
 $("model-graphics").replaceChildren();
 $("model-decoded").replaceChildren();
 if((!v2&&v3)||!vowel1){
  $("model-status").textContent="Invalid CVVVCT sequence: vowel slots must be contiguous.";
  return;
 }
 const original={onset,vowels:candidate.filter(Boolean),coda,tone:Number(tone)};
 const encoded={onset:onset?features(byToken.get(onset)):null,
  vowels:original.vowels.map(x=>features(byToken.get(x))),
  coda:coda?features(byToken.get(coda)):null,
  tone:{kind:"citation_category",tone}};
 const decode=item=>{
  if(item===null)return null;
  const k=readKey({segmentClass:item.segmentClass,
   place:item.place,height:item.height,rounding:item.rounding,
   manner:item.manner,voicingAspiration:item.voicingAspiration});
  return byKey.get(k);
 };
 const reconstructed={onset:decode(encoded.onset),
  vowels:encoded.vowels.map(decode),
  coda:decode(encoded.coda),tone:Number(encoded.tone.tone)};
 if(JSON.stringify(reconstructed)!==JSON.stringify(original)||
    !Object.hasOwn(tones,encoded.tone.tone)||
    tones[encoded.tone.tone]!==toneSymbols[encoded.tone.tone])
  throw Error("Constructed source feature code collided or lost a unit");
 $("model-graphics").appendChild(svg(encoded));
 $("model-decoded").appendChild(make("strong",
   (reconstructed.onset??"∅")+" · "+reconstructed.vowels.join(" · ")+
   " · "+(reconstructed.coda??"∅")+" · T"+reconstructed.tone));
 $("model-decoded").appendChild(make("p",
   "Decoded from feature categories only. Source-model units are case-sensitive; "+
   "this sequence is constructed and no Mandarin word, speaker or acoustic realization is asserted."));
 $("model-status").textContent="Model-feature round-trip succeeded. "+
  "34 inventory codes distinct; zero certified phonemes or human decoding results.";
}
function gallery(rows){
 const container=$("model-inventory");container.replaceChildren();
 for(const item of rows){
  const article=make("article");article.className="model-feature-card";
  const code=features(item),spec={
   onset:item.segmentClass==="consonant"?code:null,
   vowels:item.segmentClass==="vowel"?[code]:[features(byToken.get("a"))],
   coda:null,tone:{kind:"citation_category",tone:"1"}};
  article.appendChild(svg(spec));
  article.appendChild(make("strong",item.sourceToken+" · "+item.notation));
  article.appendChild(make("span",item.segmentClass==="vowel"?
   [item.articulatoryPlace,item.articulatoryHeight,item.rounding].join(" / "):
   [item.articulatoryPlace,item.manner,item.voicingAspiration].join(" / ")));
  container.appendChild(article);
 }
}
async function load(){
 try{
  const response=await Promise.all([
   fetch("phonetics/zhao-li-2009-34-unit-reference-model-v0.1.json"),
   fetch("layers-v0.1.json"),
   fetch("phonetics/zhao-li-visual-feature-grammar-audit-v0.1.json")]);
  if(response.some(r=>!r.ok))throw Error("Source model evidence unavailable");
  const [model,palette,audit]=await Promise.all(response.map(r=>r.json()));
  if(model.schema!=="chromalect.phonetics.zhao-li-2009-source-34-unit-model.v0.1"||
     model.status!=="transcribed_external_34_unit_feature_model_not_adopted_or_independently_phonetically_adjudicated"||
     model.representation.template!=="CVVVCT"||
     model.phonologicalUnits.length!==34||
     model.summary.acceptedProjectPhonemeContrasts!==0||
     palette.schema!=="chromalect.presentation-layers.v0"||
     JSON.stringify(palette.palette_domains.tone.symbols)!==JSON.stringify(toneSymbols)||
     audit.schema!=="chromalect.phonetics.zhao-li-model-visual-grammar-audit.v0.1"||
     audit.status!=="machine_reversible_external_phonological_model_features_not_verified_speech_or_human_reading"||
     audit.counts.totalModelUnits!==34||
     audit.counts.unitIsolationMachineRoundTrips!==34||
     audit.counts.featureCodeCollisions!==0||
     audit.counts.firstTrancheContextualIPARealizations!==0||
     audit.counts.humanVisualSymbolDecodingResults!==0||
     audit.counts.independentlyCertifiedPhonemeMappings!==0)
   throw Error("Unverified model source, feature counts or claims");
  const rows=model.phonologicalUnits,reverse=new Map(),tokens=new Map();
  for(const unit of rows){
   if(!unit.sourceInventoried||unit.independentlyAcousticallyVerifiedByChromalect||
      !["vowel","consonant"].includes(unit.segmentClass))throw Error("Unreviewed model unit");
   const k=key(unit);
   if(reverse.has(k)||tokens.has(unit.sourceToken))throw Error("Model feature collision");
   if(unit.segmentClass==="consonant"&&
      (!Object.hasOwn(frames,unit.articulatoryPlace)||
       !Object.hasOwn(manner,unit.manner)||
       !["voiced","voiceless","voiceless_aspirated"].includes(unit.voicingAspiration))||
      unit.segmentClass==="vowel"&&
      (!Object.hasOwn(vowels,unit.articulatoryPlace)||
       !Object.hasOwn(heightY,unit.articulatoryHeight)||
       !["rounded","unrounded"].includes(unit.rounding)))
    throw Error("Model feature lacks graphic primitive");
   tokens.set(unit.sourceToken,unit);reverse.set(k,unit.sourceToken);
  }
  if(tokens.size!==34||[...tokens.values()].filter(r=>r.segmentClass==="vowel").length!==12)
   throw Error("Source model inventory incomplete");
  byToken=tokens;byKey=reverse;tones=palette.palette_domains.tone.symbols;
  const consonants=rows.filter(x=>x.segmentClass==="consonant"&&x.sourceToken!=="N");
  const vowelUnits=rows.filter(x=>x.segmentClass==="vowel");
  if(consonants.length!==21)throw Error("Onset research model mismatch");
  option($("model-onset"),"","No onset");for(const x of consonants)
   option($("model-onset"),x.sourceToken,x.sourceToken+" · "+x.notation);
  for(const id of ["model-v1","model-v2","model-v3"]){
   if(id!=="model-v1")option($(id),"","No "+id.slice(-2).toUpperCase());
   for(const x of vowelUnits)option($(id),x.sourceToken,x.sourceToken+" · "+x.notation);
  }
  option($("model-coda"),"","No coda");
  for(const c of ["n","N"])option($("model-coda"),c,c+" · "+tokens.get(c).notation);
  for(const t of Object.keys(tones))option($("model-tone"),t,"T"+t+" "+tones[t]);
  $("model-onset").value="p";$("model-v1").value="a";
  $("model-v2").value="";$("model-v3").value="";
  $("model-coda").value="";$("model-tone").value="1";
  gallery(rows);render();
 }catch(error){
  byToken=new Map();byKey=new Map();tones=null;
  $("model-graphics").replaceChildren();$("model-inventory").replaceChildren();
  $("model-decoded").replaceChildren();
  $("model-status").textContent="Unable to validate constructed feature model: "+error.message;
 }
}
for(const id of ["model-onset","model-v1","model-v2","model-v3","model-coda","model-tone"])
 $(id).addEventListener("change",render);
load();
})();