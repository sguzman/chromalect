/* First-tranche source-grounded fusion: independent display channels, no approvals. */
(() => {
"use strict";
const $=id=>document.getElementById(id);
const required=["fusion-query","fusion-character","fusion-reading","fusion-sense",
 "fusion-component","fusion-initial","fusion-final","fusion-tone","fusion-semantic",
 "fusion-status","fusion-glyph","fusion-initial-output","fusion-final-output",
 "fusion-tone-output","fusion-meaning-output","fusion-citation",
 "fusion-meaning-note","fusion-component-note"];
if(required.some(id=>!$(id)))return;
const grammar=globalThis.ChromalectSemanticGrammar;
if(!grammar){$("fusion-status").textContent="Semantic grammar unavailable";return;}
const sourceSVG=/^glyphs\/U\+[0-9A-F]{4,6}\.svg$/;
const NS="http://www.w3.org/2000/svg";
const make=(tag,cls,text)=>{
 const node=document.createElement(tag);
 if(cls)node.className=cls;
 if(text!==undefined)node.textContent=String(text);
 return node;
};
const svgNode=(tag,attrs)=>{
 const node=document.createElementNS(NS,tag);
 for(const [key,val] of Object.entries(attrs))node.setAttribute(key,String(val));
 return node;
};
let glyphs=[],meanings=[],citations=[],tones=new Map(),colors=null,current=0;
const semanticCandidates=row=>row.screening.candidates.filter(c=>c.expression!==null);
function fillChoice(select,items){
 select.replaceChildren();
 for(const [value,label] of items){
  const option=make("option",null,label);
  option.value=String(value);select.appendChild(option);
 }
}
function selectCharacter(index){
 if(!Number.isInteger(index)||index<0||index>=glyphs.length)
  throw Error("Character rank outside first tranche");
 current=index;
 const c=citations[index],s=meanings[index];
 fillChoice($("fusion-reading"),c.readings.map((r,i)=>
  [i,r.display+" · source citation "+(i+1)]));
 const candidates=semanticCandidates(s);
 fillChoice($("fusion-sense"),candidates.map((x,i)=>
  [i,x.selectedMeaning+" · unverified"]));
 $("fusion-sense").disabled=candidates.length===0;
 $("fusion-character").value=String(index);
 $("fusion-reading").value="0";
 if(candidates.length)$("fusion-sense").value="0";
 render();
}
function toneFigure(tone){
 const token=tones.get(String(tone));
 if(!token)throw Error("Missing citation tone");
 const box=make("div");
 if(!token.levels){
  box.appendChild(make("small",null,"T0 · no fixed neutral-tone contour"));
  return box;
 }
 const svg=svgNode("svg",{viewBox:"0 0 150 70",role:"img",
  "aria-label":"Idealized citation contour for tone "+tone});
 svg.classList.add("fusion-contour");
 const points=token.levels.map((level,i)=>{
  const x=12+(126*i)/(token.levels.length-1);
  return x.toFixed(1)+","+(60-12*(level-1)).toFixed(1);
 }).join(" ");
 svg.appendChild(svgNode("polyline",{points,fill:"none",
  stroke:colors.tone.tokens[String(tone)],"stroke-width":5,
  "stroke-linecap":"round","stroke-linejoin":"round"}));
 box.appendChild(svg);
 box.appendChild(make("small",null,"T"+tone+" · "+token.name+" · idealized"));
 return box;
}
function render(){
 if(!glyphs.length)return;
 const g=glyphs[current],s=meanings[current],c=citations[current];
 const readingIndex=Number($("fusion-reading").value);
 const reading=c.readings[readingIndex];
 if(!reading)throw Error("Invalid source citation selection");
 const glyph=$("fusion-glyph");
 glyph.replaceChildren();
 const original=make("span","fusion-native",g.character);
 original.setAttribute("aria-label","Original Unicode character "+g.character);
 glyph.appendChild(original);
 if($("fusion-component").checked){
  const image=make("img");
  const script=document.querySelector('script[src$="mandarin-fusion.js"]');
  if(!script||!script.src)throw Error("Fusion script base unavailable");
  image.src=new URL(g.geometry.svg,new URL("./",script.src)).href;
  image.alt="Provisional source-aligned component-colored strokes for "+g.character;
  image.addEventListener("load",()=>{original.hidden=true;});
  image.addEventListener("error",()=>{
   image.hidden=true;original.hidden=false;
   $("fusion-component-note").textContent=
    "Source SVG unavailable; original Unicode fallback displayed. No geometry approval.";
  });
  glyph.appendChild(image);
 }
 const initial=$("fusion-initial-output"),final=$("fusion-final-output");
 const tone=$("fusion-tone-output"),meaning=$("fusion-meaning-output");
 for(const node of [initial,final,tone,meaning])node.replaceChildren();
 initial.hidden=!$("fusion-initial").checked;
 final.hidden=!$("fusion-final").checked;
 tone.hidden=!$("fusion-tone").checked;
 meaning.hidden=!$("fusion-semantic").checked;
 if(!initial.hidden){
  initial.appendChild(make("strong",null,reading.initial==="∅"?"No written initial":reading.initial));
  initial.appendChild(make("small",null,"Written initial, not a verified phoneme"));
  initial.style.borderColor=colors.initial.tokens[reading.initial];
 }
 if(!final.hidden){
  final.appendChild(make("strong",null,reading.final));
  final.appendChild(make("small",null,"Written final, not IPA"));
  final.style.borderColor=colors.final.tokens[reading.final];
 }
 if(!tone.hidden){
  tone.appendChild(toneFigure(reading.tone));
  tone.style.borderColor=colors.tone.tokens[String(reading.tone)];
 }
 const proposals=semanticCandidates(s);
 if(!meaning.hidden){
  const candidate=proposals[Number($("fusion-sense").value)];
  if(candidate){
   const title=make("strong",null,"Provisional character-meaning cue");
   const symbols=make("div","fusion-semantic-symbol");
   symbols.setAttribute("role","img");
   symbols.setAttribute("aria-label","Unverified pictogram proposal: "+
    grammar.emojiDisplay(candidate.expression));
   for(const part of grammar.emojiParts(candidate.expression)){
    const atom=make("span",null,part.text);
    symbols.appendChild(atom);
   }
   meaning.appendChild(title);meaning.appendChild(symbols);
   meaning.appendChild(make("small",null,"Meaning candidate: "+candidate.selectedMeaning));
  }else meaning.appendChild(make("small",null,"Pictogram deferred; no semantic symbol assigned"));
 }
 $("fusion-citation").textContent="Rank "+g.rank+" · "+g.character+
  " · source citation "+reading.display+" ("+(readingIndex+1)+
  " of "+c.readings.length+"). Selection does not establish contextual pronunciation.";
 $("fusion-meaning-note").textContent=proposals.length?
  proposals.length+" experimental pictogram candidate(s) from provisional Unihan definitions; "+
   "not verified word senses or linked to the selected citation reading.":
  "No accepted pictogram proposal for this character; semantic abstention preserved.";
 $("fusion-component-note").textContent=$("fusion-component").checked?
  g.component_instances.length+" source-aligned component occurrence(s), identity palette v0.6; "+
  "independent visual ownership review pending.":
  "Original Unicode character shown with component colors disabled.";
 $("fusion-status").textContent="First-tranche character "+g.rank+"/1000 · "+
  "channels independently switchable · 0 semantic approvals or learner results.";
}
async function load(){
 try{
  const urls=["profiles/mandarin-1000-v1.json",
   "semantic/mandarin-1000-v0.1.json",
   "pronunciation-citations-0001-1000.json",
   "phonetics/mandarin-citation-tone-contours-v0.1.json",
   "layers-v0.1.json"];
  const responses=await Promise.all(urls.map(url=>fetch(url)));
  if(responses.some(r=>!r.ok))throw Error("Source-aligned fusion data unavailable");
  const [profile,semantic,pinyin,contours,layers]=await Promise.all(
   responses.map(r=>r.json()));
  if(profile.schema!=="chromalect.mandarin-character-profile.v1"||
     profile.catalog_count!==1000||profile.characters.length!==1000||
     semantic.schema!=="chromalect.mandarin.character-semantic-tranche.v0.1"||
     semantic.status!=="initial_screening_complete_candidates_not_production_verified"||
     semantic.summary.screenedCharacters!==1000||
     semantic.summary.productionVerifiedCharacters!==0||
     semantic.characters.length!==1000||
     pinyin.schema!=="chromalect.pronunciation-citations.v0"||
     pinyin.tranche!=="0001-1000"||pinyin.characters.length!==1000||
     contours.schema!=="chromalect.phonetics.mandarin-citation-tone-contours.v0.1"||
     contours.status!=="idealized_pedagogical_citation_pitch_contours_not_acoustic_or_contextual_measurements"||
     contours.evidence.contextualContourApprovals!==0||
     contours.evidence.learningEffectivenessFindings!==0||
     layers.schema!=="chromalect.presentation-layers.v0")
   throw Error("Mismatched source tranches or unsupported research approvals");
  const toneMap=new Map(contours.tones.map(r=>[r.token,r]));
  const domain=layers.palette_domains;
  if(toneMap.size!==5||!domain?.initial?.tokens||!domain?.final?.tokens||
     !domain?.tone?.tokens||toneMap.get("0")?.levels!==null)
   throw Error("Incomplete source tone or orthographic palette");
  let readings=0,proposed=0,deferred=0;
  for(let i=0;i<1000;i++){
   const g=profile.characters[i],s=semantic.characters[i],p=pinyin.characters[i];
   const svg="glyphs/U+"+g?.character?.codePointAt(0).toString(16).toUpperCase().padStart(4,"0")+".svg";
   if(g?.rank!==i+1||s?.rank!==i+1||p?.rank!==i+1||
      s.character!==g.character||p.character!==g.character||
      !Array.isArray(g.component_instances)||g.component_instances.length===0||
      g.component_instances.some(x=>!/^#[0-9a-f]{6}$/i.test(x.color))||
      g.geometry?.status!=="source_aligned_visual_review_pending"||
      !sourceSVG.test(g.geometry.svg)||g.geometry.svg!==svg||
      s.screening.status!=="screened"||!Array.isArray(s.screening.candidates)||
      !Array.isArray(p.readings)||p.readings.length===0)
    throw Error("Character, geometry, or screening rank misalignment at "+(i+1));
   const options=semanticCandidates(s);
   if(options.length)proposed++;else deferred++;
   for(const candidate of options){
    if(candidate.state!=="experimental_pictogram_candidate"||
       candidate.review!=="human_linguistic_and_comprehension_review_pending"||
       !candidate.selectedMeaning)
     throw Error("Unapproved semantic source status changed");
    grammar.validate(candidate.expression);
   }
   for(const r of p.readings){
    readings++;
    if(!Object.hasOwn(domain.initial.tokens,r.initial)||
       !Object.hasOwn(domain.final.tokens,r.final)||
       !Object.hasOwn(domain.tone.tokens,String(r.tone))||
       !toneMap.has(String(r.tone)))
     throw Error("Unrecognized citation token at "+(i+1));
   }
  }
  if(readings!==1171||proposed!==881||deferred!==119)
   throw Error("Incomplete or changed first-tranche source coverage");
  glyphs=profile.characters;meanings=semantic.characters;
  citations=pinyin.characters;tones=toneMap;colors=domain;
  fillChoice($("fusion-character"),glyphs.map((g,i)=>[
   i,"#"+g.rank+" · "+g.character]));
  selectCharacter(0);
 }catch(e){
  glyphs=[];$("fusion-glyph").replaceChildren();
  for(const id of ["fusion-initial-output","fusion-final-output",
    "fusion-tone-output","fusion-meaning-output"])$(id).replaceChildren();
  $("fusion-status").textContent="Unable to validate integrated research source: "+e.message;
 }
}
$("fusion-character").addEventListener("change",()=>{
 selectCharacter(Number($("fusion-character").value));
});
$("fusion-query").addEventListener("change",()=>{
 const term=$("fusion-query").value.trim();
 const index=/^\d+$/.test(term)?Number(term)-1:
  glyphs.findIndex(x=>x.character===term);
 if(index<0||index>=glyphs.length){
  $("fusion-status").textContent="No first-tranche source character matches that query.";
  return;
 }
 selectCharacter(index);
});
$("fusion-reading").addEventListener("change",render);
$("fusion-sense").addEventListener("change",render);
for(const id of ["fusion-component","fusion-initial","fusion-final","fusion-tone","fusion-semantic"])
 $(id).addEventListener("change",render);
load();
})();
