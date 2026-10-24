/* Reversible source-model feature geometry; no phonemic or corpus pronunciation claim. */
(() => {
"use strict";
const $=id=>document.getElementById(id);
const ids=["mfg-onset","mfg-v1","mfg-v2","mfg-v3","mfg-coda","mfg-tone",
 "mfg-status","mfg-glyphs","mfg-decoded","mfg-evidence"];
if(ids.some(id=>!$(id)))return;
const NS="http://www.w3.org/2000/svg";
const placePaths={
 alveolar:"M12 20 L76 20 L76 68 L12 68 Z",
 bilabial:"M44 11 A33 33 0 1 0 44 77 A33 33 0 1 0 44 11",
 velar:"M44 10 L80 44 L44 78 L8 44 Z",
 labiodental:"M13 65 L44 8 L75 65 Z",
 palatoalveolar:"M44 7 L80 30 L68 74 L20 74 L8 30 Z",
 retroflex:"M8 22 Q44 0 80 22 L72 70 Q44 84 16 70 Z"
};
const mannerMarks={
 stop:"M37 35 H51 V51 H37 Z",
 nasal:"M29 54 V33 Q37 19 44 44 Q51 68 59 33 V54",
 lateral:"M34 28 V57 H58",
 fricative:"M25 35 L35 54 L45 35 L55 54 L65 35",
 affricate:"M25 31 H35 V54 H25 Z M43 33 L52 54 L62 33"
};
const x={front:16,central:32,back:48,"tip-front":64,"tip-back":78};
const y={high:19,"mid-high":32,mid:45,"mid-low":58,low:72};
const make=(tag,words)=>{
 const n=document.createElement(tag);
 if(words!==undefined)n.textContent=String(words);
 return n;
};
const svg=(tag,attrs)=>{
 const node=document.createElementNS(NS,tag);
 for(const [k,v] of Object.entries(attrs))node.setAttribute(k,String(v));
 return node;
};
const mark=(parent,d,width=3,fill="none")=>{
 parent.appendChild(svg("path",{d,stroke:"currentColor","stroke-width":width,
  fill,"stroke-linecap":"round","stroke-linejoin":"round"}));
};
let units=[],byToken=new Map(),reverse=new Map(),tones=null,audit=null;
const featureKey=(v)=>v.segmentClass==="vowel"?
 JSON.stringify(["v",v.articulatoryPlace,v.articulatoryHeight,v.rounding]):
 JSON.stringify(["c",v.articulatoryPlace,v.manner,v.voicingAspiration]);
function options(select,items){
 select.replaceChildren();
 for(const [value,label] of items){
  const node=make("option",label);node.value=value;select.appendChild(node);
 }
}
function shape(unit){
 const root=svg("svg",{viewBox:"0 0 90 90",role:"img",
  "aria-label":unit.segmentClass==="vowel"?
    ["model vowel features",unit.articulatoryPlace,unit.articulatoryHeight,unit.rounding].join(", "):
    ["model consonant features",unit.articulatoryPlace,unit.manner,unit.voicingAspiration].join(", ")});
 if(unit.segmentClass==="vowel"){
  const px=x[unit.articulatoryPlace],py=y[unit.articulatoryHeight];
  if(px===undefined||py===undefined)throw Error("Unsupported vowel grid geometry");
  mark(root,"M8 10 V80 H82",1.3);
  if(unit.rounding==="rounded"){
   root.appendChild(svg("circle",{cx:px,cy:py,r:8,
    stroke:"currentColor","stroke-width":3,fill:"none"}));
  }else if(unit.rounding==="unrounded"){
   root.appendChild(svg("rect",{x:px-6,y:py-6,width:12,height:12,
    stroke:"currentColor","stroke-width":3,fill:"currentColor"}));
  }else throw Error("Unknown vowel rounding feature");
 }else{
  if(!Object.hasOwn(placePaths,unit.articulatoryPlace)||
     !Object.hasOwn(mannerMarks,unit.manner))throw Error("Missing source consonant shape");
  mark(root,placePaths[unit.articulatoryPlace],2.5);
  mark(root,mannerMarks[unit.manner],3,unit.manner==="stop"?"currentColor":"none");
  if(unit.voicingAspiration==="voiced"){
   root.appendChild(svg("circle",{cx:78,cy:8,r:5,fill:"currentColor"}));
  }else if(unit.voicingAspiration==="voiceless"){
   mark(root,"M74 8 H84",2.5);
  }else if(unit.voicingAspiration==="voiceless_aspirated"){
   mark(root,"M74 4 L84 10 M74 10 L84 16",2.5);
  }else throw Error("Missing voicing/aspiration category");
 }
 return root;
}
function render(){
 if(!units.length)return;
 const name=id=>$(id).value;
 const onset=name("mfg-onset"),v1=name("mfg-v1"),
  v2=name("mfg-v2"),v3=name("mfg-v3"),coda=name("mfg-coda");
 const tone=name("mfg-tone");
 $("mfg-glyphs").replaceChildren();$("mfg-decoded").textContent="";
 if(v2===""&&v3!==""){
  $("mfg-status").textContent="Invalid CVVVCT order: V₃ requires V₂.";
  return;
 }
 const tokens=[onset||null,v1,v2||null,v3||null,coda||null];
 if(!tokens[1]||!Object.hasOwn(tones,tone)){
  $("mfg-status").textContent="A first vowel and a source tone category are required.";
  return;
 }
 const rebuilt=[],slots=["C","V₁","V₂","V₃","C","T"];
 for(let i=0;i<5;i++){
  const token=tokens[i];
  const container=make("div");container.className="mfg-slot";
  container.appendChild(make("small",slots[i]));
  if(token){
   const item=byToken.get(token);
   if(!item)throw Error("Unknown source phonological model unit");
   const feature={
    segmentClass:item.segmentClass,articulatoryPlace:item.articulatoryPlace,
    ...(item.segmentClass==="vowel"?
      {articulatoryHeight:item.articulatoryHeight,rounding:item.rounding}:
      {manner:item.manner,voicingAspiration:item.voicingAspiration})
   };
   const decoded=reverse.get(featureKey(feature));
   if(decoded!==token)throw Error("Visual features did not reconstruct original model token");
   rebuilt.push(decoded);
   container.appendChild(shape(feature));
  }else container.appendChild(make("strong","—"));
  $("mfg-glyphs").appendChild(container);
 }
 const tSlot=make("div");tSlot.className="mfg-slot";
 tSlot.appendChild(make("small","T"));
 tSlot.appendChild(make("strong",tones[tone]));
 $("mfg-glyphs").appendChild(tSlot);
 const expected=tokens.filter(Boolean).join(" ")+"/T"+tone;
 $("mfg-decoded").textContent="Source model: "+expected+
  " · Reconstructed by features: "+rebuilt.join(" ")+"/T"+tone;
 $("mfg-status").textContent="Strict feature round-trip succeeded for selected source-model sequence.";
 $("mfg-evidence").textContent="Reference model 34 units (12 vowels, 22 consonants); "+
  "21 candidate onsets, 2 nasal codas, 5 independent citation-tone tokens. "+
  "No first-tranche phonemic analysis, acoustic measurement, human decoding or learning result.";
}
async function load(){
 try{
  const responses=await Promise.all([
   fetch("phonetics/zhao-li-2009-34-unit-reference-model-v0.1.json"),
   fetch("layers-v0.1.json"),
   fetch("phonetics/zhao-li-visual-feature-grammar-audit-v0.1.json")
  ]);
  if(responses.some(x=>!x.ok))throw Error("Published research model inputs unavailable");
  const [source,palette,proof]=await Promise.all(responses.map(x=>x.json()));
  if(source.schema!=="chromalect.phonetics.zhao-li-2009-source-34-unit-model.v0.1"||
     source.status!=="transcribed_external_34_unit_feature_model_not_adopted_or_independently_phonetically_adjudicated"||
     source.representation.template!=="CVVVCT"||
     source.representation.inventoryStatus!=="external_proposal_not_project_frozen"||
     source.phonologicalUnits.length!==34||
     source.summary.acceptedProjectPhonemeContrasts!==0||
     source.summary.independentlyVerifiedRealizations!==0||
     palette.schema!=="chromalect.presentation-layers.v0"||
     proof.schema!=="chromalect.phonetics.zhao-li-model-visual-grammar-audit.v0.1"||
     proof.status!=="machine_reversible_external_phonological_model_features_not_verified_speech_or_human_reading"||
     proof.counts.unitIsolationMachineRoundTrips!==34||
     proof.counts.featureCodeCollisions!==0||
     proof.counts.firstTrancheContextualIPARealizations!==0||
     proof.counts.independentlyCertifiedPhonemeMappings!==0||
     proof.counts.humanVisualSymbolDecodingResults!==0||
     proof.counts.learningOutcomeMeasurements!==0)
   throw Error("Source feature grammar or scientific approvals changed");
  const tonePalette=palette.palette_domains.tone.symbols;
  if(JSON.stringify(tonePalette)!==JSON.stringify({"0":"·","1":"—","2":"↗","3":"⌄","4":"↘"}))
   throw Error("Source citation tone registry changed");
  const registered=new Map(),byFeatures=new Map();
  for(const unit of source.phonologicalUnits){
   if(registered.has(unit.sourceToken)||unit.sourceInventoried!==true||
      unit.independentlyAcousticallyVerifiedByChromalect!==false)
    throw Error("Duplicate or unapproved model source unit");
   const k=featureKey(unit);
   if(byFeatures.has(k))throw Error("Source feature collision");
   byFeatures.set(k,unit.sourceToken);registered.set(unit.sourceToken,unit);
   shape(unit);
  }
  const vowelRows=[...registered.values()].filter(x=>x.segmentClass==="vowel");
  const onsetRows=[...registered.values()].filter(x=>
   x.segmentClass==="consonant"&&x.sourceToken!=="N");
  if(vowelRows.length!==12||onsetRows.length!==21||
     !registered.has("n")||!registered.has("N"))throw Error("Source CVVVCT register incomplete");
  const candidates=vowelRows.map(x=>[x.sourceToken,
   x.notation+" · "+[x.articulatoryPlace,x.articulatoryHeight,x.rounding].join("/")]);
  options($("mfg-onset"),[["","No consonant"],...onsetRows.map(x=>[
   x.sourceToken,x.notation+" · "+x.articulatoryPlace+"/"+x.manner])]);
  options($("mfg-v1"),candidates);
  options($("mfg-v2"),[["","No second vowel"],...candidates]);
  options($("mfg-v3"),[["","No third vowel"],...candidates]);
  options($("mfg-coda"),[["","No nasal coda"],["n","n"],["N","ŋ"]]);
  options($("mfg-tone"),Object.entries(tonePalette).map(([k,v])=>[k,"T"+k+" · "+v]));
  units=source.phonologicalUnits;byToken=registered;reverse=byFeatures;
  tones=tonePalette;audit=proof;
  $("mfg-onset").value="m";$("mfg-v1").value="a";$("mfg-tone").value="1";
  render();
 }catch(e){
  units=[];$("mfg-glyphs").replaceChildren();
  $("mfg-decoded").textContent="";
  $("mfg-status").textContent="Unable to validate source-model features: "+e.message;
 }
}
for(const id of ["mfg-onset","mfg-v1","mfg-v2","mfg-v3","mfg-coda","mfg-tone"])
 $(id).addEventListener("change",render);
load();
})();