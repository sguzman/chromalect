// Experimental initial-category visualization. Source feature tuples, not certified phones.
(() => {
"use strict";
const $=id=>document.getElementById(id);
const ids=["initial-mode","initial-filter","initial-count","initial-status","initial-list"];
if(ids.some(id=>!$(id)))return;
const NS="http://www.w3.org/2000/svg";
const placePaths={
 bilabial:"M10 26 C10 8 90 8 90 26 C90 44 10 44 10 26 Z",
 labiodental:"M13 11 H87 V41 H13 Z",
 alveolar:"M50 5 L92 44 H8 Z",
 velar:"M50 4 L92 26 L50 48 L8 26 Z",
 alveolopalatal:"M50 5 L90 20 L74 46 L26 46 L10 20 Z",
 postalveolar:"M25 7 H75 L94 26 L75 45 H25 L6 26 Z"
};
const mannerPaths={
 stop:"M44 18 H56 V33 H44 Z",
 nasal:"M38 33 V20 Q44 10 50 27 Q56 43 62 20 V33",
 fricative:"M34 19 L42 32 L50 19 L58 32 L66 19",
 lateral:"M40 17 V34 H63",
 affricate:"M38 18 H47 V33 H38 Z M53 19 L60 32 L67 19",
 approximant:"M34 31 Q50 8 66 31"
};
const breathPaths={unaspirated:"M102 19 V33",aspirated:"M100 16 L108 24 L100 32 M110 16 L118 24 L110 32"};
const featureKey=r=>[r.place,r.manner,r.aspiration].join("|");
function makeSvg(r){
 const el=(name,attrs={})=>{
  const node=document.createElementNS(NS,name);
  for(const [k,v] of Object.entries(attrs))node.setAttribute(k,v);
  return node;
 };
 const svg=el("svg",{viewBox:"0 0 126 54",role:"img",
  "aria-label":r.token+" experimental features: "+r.place+", "+r.manner+", "+r.aspiration});
 svg.classList.add("initial-figure");
 const place=el("path",{d:placePaths[r.place],fill:"none",stroke:"currentColor","stroke-width":3.2,
  "stroke-linejoin":"round"});svg.appendChild(place);
 const manner=el("path",{d:mannerPaths[r.manner],
  fill:["stop","affricate"].includes(r.manner)?"currentColor":"none",
  stroke:"currentColor","stroke-width":3.5,"stroke-linecap":"round","stroke-linejoin":"round"});
 svg.appendChild(manner);
 if(r.aspiration!=="none")svg.appendChild(el("path",{d:breathPaths[r.aspiration],fill:"none",
  stroke:"currentColor","stroke-width":2.8,"stroke-linecap":"round"}));
 return svg;
}
let records=[],other=[],mode="featural";
function render(){
 mode=$("initial-mode").value;
 if(!["featural","pinyin","ipa"].includes(mode))throw Error("Unsupported visual comparison");
 const q=$("initial-filter").value.trim().toLowerCase();
 const filtered=records.filter(r=>!q||r.token.includes(q)||r.place.includes(q)||
  r.manner.includes(q)||r.workingIPACandidate.includes(q));
 $("initial-list").replaceChildren();
 for(const r of filtered){
  const card=document.createElement("article"),title=document.createElement("h2"),
   visual=document.createElement("div"),info=document.createElement("p"),disclaimer=document.createElement("p");
  card.className="initial-card";visual.className="initial-visual";
  title.textContent=r.token+" · "+r.citationReadingOccurrences+" source citation readings";
  if(mode==="featural")visual.appendChild(makeSvg(r));
  else{
   const symbol=document.createElement("span");symbol.className="initial-symbol";
   symbol.textContent=mode==="pinyin"?r.token:r.workingIPACandidate;
   visual.appendChild(symbol);
  }
  info.className="initial-note";
  info.textContent=r.place+" · "+r.manner+" · "+r.aspiration+" · feature key "+featureKey(r);
  disclaimer.className="initial-note";
  disclaimer.textContent=r.ipaStatus==="one_convention_variants_documented"?
   "Other cited IPA conventions: "+r.alternatives.join(", ")+"; none independently approved":
   "Provisional broad IPA / feature mapping; independent approval pending";
  card.appendChild(title);card.appendChild(visual);card.appendChild(info);card.appendChild(disclaimer);
  $("initial-list").appendChild(card);
 }
 $("initial-count").textContent=filtered.length+" / 21 consonantal source categories shown";
 $("initial-status").textContent="21 candidate contrasts; 3 written onset conventions excluded from the consonant set ("+
   other.map(r=>r.token).join(", ")+"). No acoustic or learner validation.";
}
async function load(){
 try{
  const response=await fetch("phonetics/mandarin-initial-feature-candidates-v0.1.json");
  if(!response.ok)throw Error("Missing pinned initial inventory");
  const data=await response.json();
  if(data.schema!=="chromalect.phonetics.mandarin-initial-feature-candidates.v0.1"||
     data.status!=="working_articulatory_candidate_codebook_not_independently_certified_phoneme_inventory"||
     data.statistics.conventionalInitialTokens!==21||
     data.statistics.orthographicConventions!==3||
     data.statistics.sourceTokenTotal!==1171||
     data.statistics.independentlyVerifiedPhonemicContrasts!==0||
     data.statistics.validatedArticulatoryProduction!==0||
     data.statistics.educationalStudies!==0)
   throw Error("Unexpected inventory or approval status");
  records=data.tokens.filter(r=>r.category==="conventional_pinyin_initial");
  other=data.tokens.filter(r=>r.category==="orthographic_onset_convention_not_independent_consonant");
  if(records.length!==21||other.length!==3||new Set(records.map(r=>r.token)).size!==21||
     new Set(records.map(featureKey)).size!==21||
     !records.every(r=>Object.hasOwn(placePaths,r.place)&&Object.hasOwn(mannerPaths,r.manner)&&
      ["none","unaspirated","aspirated"].includes(r.aspiration)&&
      (r.aspiration==="none"||Object.hasOwn(breathPaths,r.aspiration))&&
      typeof r.workingIPACandidate==="string"&&r.workingIPACandidate.length>0)||
     !other.every(r=>r.workingIPACandidate===null&&["y","w","∅"].includes(r.token)))
   throw Error("Feature encoding collisions or unsupported source records");
  render();
 }catch(e){records=[];other=[];$("initial-list").replaceChildren();
  $("initial-count").textContent="0 validated records";
  $("initial-status").textContent="Unable to validate working initial inventory: "+e.message;}
}
$("initial-mode").addEventListener("change",render);
$("initial-filter").addEventListener("input",render);
load();
})();