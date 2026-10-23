// Side-by-side source written citation, arbitrary letter code, and unapproved feature proposal.
// Every lane preserves the original source spelling and Unicode glyph.
(() => {
"use strict";
const $=id=>document.getElementById(id);
const ns="http://www.w3.org/2000/svg";
const required=["comparison-rank","comparison-reading","comparison-prev","comparison-next",
 "comparison-color","comparison-status","comparison-count","comparison-source",
 "comparison-plain","comparison-letters","comparison-working"];
if(required.some(id=>!$(id)))return;
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
let citation=[],initials=new Map(),finals=new Map(),symbols=new Map(),primitive=[],risk=new Map(),
 simple=new Map(),toneSymbols={},palette={},cohort=null,selected=0;
const get=(tag,text,klass)=>{
 const e=document.createElement(tag);e.textContent=text;
 if(klass)e.className=klass;return e;
};
const svgElement=(tag,attrs={})=>{
 const x=document.createElementNS(ns,tag);
 for(const [k,v] of Object.entries(attrs))x.setAttribute(k,v);
 return x;
};
function letterFigure(record){
 const s=svgElement("svg",{viewBox:"0 0 "+record.iconRegistryIndices.length*48+" 52",
 role:"img","aria-label":"Arbitrary geometric written-letter code; no sound claims"});
 s.classList.add("comparison-letters-svg");
 for(let i=0;i<record.iconRegistryIndices.length;i++){
  const g=svgElement("g",{transform:"translate("+(48*i)+",0)"});
  const p=svgElement("path",{d:primitive[record.iconRegistryIndices[i]].path,
   fill:"none",stroke:"currentColor","stroke-width":3.2,"stroke-linejoin":"round"});
  g.appendChild(p);s.appendChild(g);
 }
 return s;
}
function initialFigure(f){
 if(f.category!=="conventional_pinyin_initial")return null;
 const svg=svgElement("svg",{viewBox:"0 0 126 54",role:"img",
  "aria-label":"Unapproved "+f.token+" working initial category shape"});
 svg.classList.add("comparison-initial-svg");
 svg.appendChild(svgElement("path",{d:placePaths[f.place],fill:"none",
  stroke:"currentColor","stroke-width":3.2,"stroke-linejoin":"round"}));
 svg.appendChild(svgElement("path",{d:mannerPaths[f.manner],
  fill:["stop","affricate"].includes(f.manner)?"currentColor":"none",
  stroke:"currentColor","stroke-width":3.5,"stroke-linecap":"round","stroke-linejoin":"round"}));
 if(f.aspiration!=="none")svg.appendChild(svgElement("path",{
  d:breathPaths[f.aspiration],fill:"none",stroke:"currentColor",
  "stroke-width":2.8,"stroke-linecap":"round"}));
 return svg;
}
function simpleFigure(row){
 const x={front:18,central:64,back:110}[row.workingBackness];
 const y={close:18,mid:44,open:70}[row.workingHeight];
 const svg=svgElement("svg",{viewBox:"0 0 130 86",role:"img",
  "aria-label":"Provisional unapproved simple-vowel placement: "+
   row.workingHeight+" "+row.workingBackness+" "+row.workingRounding});
 svg.classList.add("comparison-vowel-svg");
 svg.appendChild(svgElement("circle",{cx:x,cy:y,r:11,fill:"none",
   stroke:"currentColor","stroke-width":4}));
 if(row.workingRounding==="rounded")
  svg.appendChild(svgElement("circle",{cx:x,cy:y,r:4,fill:"currentColor"}));
 return svg;
}
function classification(r){
 if(!simple.has(r.final))return "no_simple_final_feature_candidate";
 if(risk.has(JSON.stringify([r.initial,r.final,r.tone])))
  return "working_candidate_withheld_context_warning";
 return "working_candidate_without_listed_context_flag";
}
function render(){
 const c=citation[selected],choice=Number($("comparison-reading").value);
 const r=c?.readings[choice];
 if(!r)throw Error("Invalid source reading selection");
 const color=$("comparison-color").checked;
 const status=classification(r),feature=initials.get(r.initial);
 $("comparison-rank").value=String(c.rank);
 $("comparison-source").textContent="Rank "+c.rank+" · "+c.character+
  " · "+r.display+" · source citation only · T"+r.tone;
 const cards=["comparison-plain","comparison-letters","comparison-working"].map(id=>$(id));
 cards.forEach((panel)=>{
  panel.replaceChildren();
  panel.appendChild(get("div",c.character,"comparison-native"));
  panel.appendChild(get("strong",r.display,"comparison-spelling"));
 });
 cards[0].appendChild(get("p","Original Pinyin citation spelling · T"+r.tone+
  " · no contextual pronunciation established","comparison-note"));
 const letterIntro=get("div","Written initial: "+r.initial+" · final: "+r.final,"comparison-note");
 cards[1].appendChild(letterIntro);
 const arbitr=letterFigure(symbols.get(r.final));
 if(color)arbitr.style.color=palette.final.tokens[r.final];
 cards[1].appendChild(arbitr);
 cards[1].appendChild(get("p","Literal nine-primitive letter alphabet · source tone T"+r.tone+
  " · never a phonetic representation","comparison-note"));
 const init=initialFigure(feature);
 if(init){
  if(color)init.style.color=palette.initial.tokens[r.initial];
  cards[2].appendChild(init);
  cards[2].appendChild(get("p","Working initial: "+feature.place+" / "+
   feature.manner+" / "+feature.aspiration,"comparison-note"));
 }else cards[2].appendChild(get("p","Orthographic onset "+r.initial+
  " only; no consonantal figure","comparison-note"));
 if(status==="working_candidate_without_listed_context_flag"){
  const v=simple.get(r.final),fig=simpleFigure(v);
  if(color)fig.style.color=palette.final.tokens[r.final];
  cards[2].appendChild(fig);
  cards[2].appendChild(get("p","Unapproved "+v.workingHeight+" / "+
   v.workingBackness+" / "+v.workingRounding+
   " proposal for written "+r.final,"comparison-note"));
 }else if(status==="working_candidate_withheld_context_warning"){
  cards[2].appendChild(get("p","Vowel-feature drawing withheld for this flagged spelling context.","comparison-withheld"));
  cards[2].appendChild(get("p",risk.get(JSON.stringify([r.initial,r.final,r.tone])).description,
   "comparison-note"));
 }else cards[2].appendChild(get("p","No working phonetic-final figure exists for written "+r.final+
  " (among 27 deferred final spellings).","comparison-withheld"));
 cards[2].appendChild(get("p","Citation-tone label T"+r.tone+" · "+
  toneSymbols[String(r.tone)]+" · no contextual pitch claim","comparison-note"));
 const state=cohort.states.find(s=>s.key===status);
 $("comparison-count").textContent=state.sourceReadingCount+" / 1,171 source readings in this "+
  "visual-eligibility state. Zero independently verified speech decodings.";
}
function choose(rank){
 if(!Number.isInteger(rank)||rank<1||rank>citation.length)
  throw Error("Unknown first-tranche character rank");
 selected=rank-1;
 $("comparison-reading").replaceChildren();
 for(let i=0;i<citation[selected].readings.length;i++){
  const opt=document.createElement("option");
  opt.value=String(i);
  opt.textContent=citation[selected].readings[i].display+" · citation "+(i+1);
  $("comparison-reading").appendChild(opt);
 }
 $("comparison-reading").value="0";render();
}
async function load(){
 try{
  const urls=["pronunciation-citations-0001-1000.json",
   "phonetics/mandarin-encoding-comparison-cohorts-v0.1.json",
   "phonetics/mandarin-initial-feature-candidates-v0.1.json",
   "phonetics/mandarin-simple-final-feature-candidates-v0.1.json",
   "phonetics/mandarin-final-spelling-context-gates-v0.1.json",
   "phonetics/written-final-symbol-control-v0.1.json","layers-v0.1.json"];
  const res=await Promise.all(urls.map(u=>fetch(u)));
  if(res.some(r=>!r.ok))throw Error("Published citation or experimental source missing");
  const [cit,groups,onset,six,flags,letters,layers]=await Promise.all(res.map(r=>r.json()));
  if(cit.schema!=="chromalect.pronunciation-citations.v0"||
     cit.tranche!=="0001-1000"||cit.characters.length!==1000||
     groups.schema!=="chromalect.phonetics.mandarin-encoding-comparison-cohorts.v0.1"||
     groups.status!=="source_attested_visual_research_cohorts_not_approved_sound_encoding_or_learning"||
     groups.sources.sourceBlobSHA!==cit.source.blob_sha||
     groups.summary.citationReadings!==1171||
     groups.summary.letterCodeBaselineReadings!==1171||
     groups.summary.unflaggedWorkingFeatureCandidates!==320||
     groups.summary.withheldWorkingFeatureCandidates!==112||
     groups.summary.noWorkingVowelFeatureCandidate!==739||
     groups.summary.totalCautionFlaggedReadings!==213||
     groups.summary.independentlyVerifiedSpokenDecodings!==0||
     groups.summary.humanSymbolDecodingTrials!==0||
     groups.summary.measuredLearningBenefits!==0||
     six.schema!=="chromalect.phonetics.mandarin-simple-final-feature-candidates.v0.1"||
     six.summary.independentIPAApprovalCount!==0||
     onset.schema!=="chromalect.phonetics.mandarin-initial-feature-candidates.v0.1"||
     onset.statistics.independentlyVerifiedPhonemicContrasts!==0||
     flags.schema!=="chromalect.phonetics.mandarin-final-spelling-context-gates.v0.1"||
     flags.summary.independentlyAdjudicatedFinalPhonemes!==0||
     letters.schema!=="chromalect.phonetics.written-final-symbol-control.v0.1"||
     letters.summary.humanSymbolDecodingTrials!==0||
     layers.schema!=="chromalect.presentation-layers.v0")
    throw Error("Source comparison evidence differs or incorrectly claims approval");
  initials=new Map(onset.tokens.map(x=>[x.token,x]));
  simple=new Map(six.records.map(x=>[x.token,x]));
  risk=new Map();
  for(const row of flags.records){
   if(row.independentIPAAnalysisApproved!==false)throw Error("Context source unreviewed status falsified");
   for(const t of row.observedTokenTriples){
    const k=JSON.stringify([t.initial,t.final,t.tone]);
    if(risk.has(k))throw Error("Duplicate context warning");
    risk.set(k,row);
   }
  }
  symbols=new Map(letters.records.map(x=>[x.token,x]));
  primitive=letters.primitives;
  if(initials.size!==24||simple.size!==6||risk.size!==108||symbols.size!==33||primitive.length!==9||
    !onset.tokens.every(x=>x.category!=="conventional_pinyin_initial"||
     Object.hasOwn(placePaths,x.place)&&Object.hasOwn(mannerPaths,x.manner)&&
     (x.aspiration==="none"||Object.hasOwn(breathPaths,x.aspiration)))||
    !letters.records.every(x=>x.symbolLetters.join("")===x.token&&
     x.independentPhonologicalInterpretationApproved===false))
   throw Error("Incomplete or nonreversible comparison codebooks");
  palette=layers.palette_domains;
  toneSymbols=palette.tone.symbols;
  if(Object.keys(palette.initial.tokens).length!==24||
     Object.keys(palette.final.tokens).length!==33||
     Object.keys(palette.tone.tokens).length!==5)
   throw Error("Published palette domains changed");
  const counts=new Map(groups.states.map(x=>[x.key,0]));
  let total=0;
  for(let i=0;i<cit.characters.length;i++){
   const c=cit.characters[i];
   if(c.rank!==i+1)throw Error("Source rank changed");
   for(const r of c.readings){
    if(!initials.has(r.initial)||!symbols.has(r.final)||!Object.hasOwn(toneSymbols,String(r.tone)))
     throw Error("An existing written citation has no source-backed representation");
    const code=classification(r);
    counts.set(code,counts.get(code)+1);total++;
   }
  }
  if(total!==1171||groups.states.length!==3||
     groups.states.some(x=>counts.get(x.key)!==x.sourceReadingCount)||
     risk.size!==108)throw Error("Visual comparison cohort source count mismatch");
  citation=cit.characters;cohort=groups;
  $("comparison-status").textContent=
   "1,171/1,171 source citation spellings retained. Visual studies: 0; sound approvals: 0.";
  choose(1);
 }catch(e){
  citation=[];for(const id of ["comparison-plain","comparison-letters","comparison-working"])
   $(id).replaceChildren();
  $("comparison-status").textContent="Unable to verify source comparison: "+e.message;
  $("comparison-count").textContent="No source-verified comparison readings";
 }
}
$("comparison-rank").addEventListener("change",()=>{
 const v=$("comparison-rank").value.trim();
 const rank=/^\d+$/.test(v)?Number(v):citation.findIndex(c=>c.character===v)+1;
 if(rank<1||rank>citation.length){$("comparison-status").textContent="Not in the first 1,000 source characters.";return;}
 choose(rank);
});
$("comparison-prev").addEventListener("click",()=>{if(citation.length)choose(Math.max(1,selected));});
$("comparison-next").addEventListener("click",()=>{if(citation.length)choose(Math.min(citation.length,selected+2));});
$("comparison-reading").addEventListener("change",render);
$("comparison-color").addEventListener("change",render);
load();
})();