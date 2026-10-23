/* Three-arm, source-geometry-matched component/semantic visual comparison.
   Trial conditions are research controls, not verified comprehension outcomes. */
(() => {
"use strict";
const $=id=>document.getElementById(id);
const required=["vsc-pick","vsc-focus","vsc-warning","vsc-back","vsc-forward","vsc-sense","vsc-reveal",
 "vsc-size","vsc-size-label","vsc-panels","vsc-source","vsc-status","vsc-count"];
if(required.some(id=>!$(id)))return;
const grammar=globalThis.ChromalectSemanticGrammar;
if(!grammar){$("vsc-status").textContent="Semantic grammar unavailable";return;}
const exactSvg=/^glyphs\/U\+[0-9A-F]{4,6}\.svg$/;
const make=(tag,cls,content)=>{
 const e=document.createElement(tag);
 if(cls)e.className=cls;
 if(content!==undefined)e.textContent=content;
 return e;
};
let semantic=[],profiles=[],selected=0,reviewRows=new Map(),focusRanks=[];
const reviewStatus="build_derived_source_review_priority_not_independent_visual_certification";
const profileComponentKey=c=>c.component_id;
function availableRanks(){
 const focus=$("vsc-focus").value;
 return profiles.filter((p,i)=>{
  const review=reviewRows.get(p.rank),entry=semantic[i],n=candidates(entry).length;
  if(focus==="all")return true;
  if(focus==="close")return review.closeColorPairs>0;
  if(focus==="deferred")return n===0;
  if(focus==="polysemy")return n>1;
  throw Error("Unsupported visual research focus");
 }).map(x=>x.rank);
}
function rebuildPicker(){
 focusRanks=availableRanks();
 if(!focusRanks.length)throw Error("No source readings in selected comparison focus");
 if(!focusRanks.includes(selected+1))selected=focusRanks[0]-1;
 const picker=$("vsc-pick");picker.replaceChildren();
 for(const rank of focusRanks){
  const p=profiles[rank-1],w=reviewRows.get(rank);
  const option=make("option",null,"#"+p.rank+" · "+p.character+
   (w.closeColorPairs?" · "+w.closeColorPairs+" color warning"+(w.closeColorPairs>1?"s":""):""));
  option.value=String(rank);picker.appendChild(option);
 }
}
function candidates(row){return row.screening.candidates.filter(c=>c.expression!==null);}
function buildArm(title,description,profile,candidate,style){
 const article=make("article","vsc-arm");
 article.dataset.condition=style;
 article.appendChild(make("h2",null,title));
 article.appendChild(make("p","vsc-note",description));
 const stage=make("div","vsc-stage");
 const shape=make("div","vsc-shape");
 shape.style.setProperty("--study-size",String($("vsc-size").value)+"px");
 shape.setAttribute("role","img");
 shape.setAttribute("aria-label",profile.character+" — source-aligned glyph, "+
  (style==="plain"?"single neutral ink color":"stable component identity colors"));
 const url=new URL(profile.geometry.svg,new URL("./",document.currentScript?.src||
  document.querySelector('script[src$="visual-semantic-comparison.js"]').src)).href;
 if(style==="plain"){
  const mask=make("span","vsc-ink");
  mask.style.setProperty("--source-mask",'url("'+url+'")');
  shape.appendChild(mask);
 }else{
  const img=make("img","vsc-source-svg");
  img.src=url;img.alt="";img.setAttribute("aria-hidden","true");
  shape.appendChild(img);
 }
 stage.appendChild(shape);
 if(style==="semantic"){
  const expression=make("div","vsc-meaning-cue");
  if(candidate){
   for(const item of grammar.emojiParts(candidate.expression)){
    const atom=make("span","vsc-emoji",item.text);
    atom.setAttribute("aria-hidden","true");expression.appendChild(atom);
   }
   expression.setAttribute("role","img");
   expression.setAttribute("aria-label","Unverified pictogram proposal for "+
    candidate.selectedMeaning+": "+grammar.emojiDisplay(candidate.expression));
  }else expression.textContent="No candidate pictogram: semantic layer abstains";
  stage.appendChild(expression);
 }
 article.appendChild(stage);
 const caption=make("p","vsc-caption",
  style==="plain"?"Source geometry, neutral monochrome":
  style==="identity"?"Original v0.6 component identity fills, unchanged":
  "Identical v0.6 fills; proposed semantic cue added independently");
 article.appendChild(caption);
 return article;
}
function render(){
 if(!profiles.length)return;
 const profile=profiles[selected],record=semantic[selected];
 const options=candidates(record);
 const sense=$("vsc-sense");
 const prior=Number(sense.value);
 sense.replaceChildren();
 for(let i=0;i<options.length;i++){
  const option=make("option",null,"Candidate "+(i+1)+" · "+options[i].selectedMeaning);
  option.value=String(i);sense.appendChild(option);
 }
 sense.disabled=!options.length;
 sense.value=String(prior>=0&&prior<options.length?prior:0);
 const candidate=options[Number(sense.value)]||null;
 const arms=[
  ["Plain","Source-aligned monochrome strokes, without any sound or semantic cue","plain"],
  ["Identity color","The same source strokes, filled with the published component identity palette","identity"],
  ["Color + proposed meaning","The same identity fills plus one unverified pictogram expression","semantic"]
 ];
 const fragment=document.createDocumentFragment();
 for(const [title,description,mode] of arms)
  fragment.appendChild(buildArm(title,description,profile,candidate,mode));
 $("vsc-panels").replaceChildren(fragment);
 $("vsc-pick").value=String(selected+1);
 const pos=focusRanks.indexOf(selected+1);
 $("vsc-back").disabled=pos<=0;
 $("vsc-forward").disabled=pos===focusRanks.length-1;
 $("vsc-size-label").textContent=$("vsc-size").value+" px";
 const shown=$("vsc-reveal").checked;
 const definition=record.source.definition;
 const legend=make("div","vsc-component-legend");
 const components=new Map();
 for(const part of profile.component_instances){
  const before=components.get(part.component_id);
  if(before&&before.color.toLowerCase()!==part.color.toLowerCase())
   throw Error("Component identity has inconsistent colors");
  if(!before)components.set(part.component_id,part);
 }
 for(const part of components.values()){
  const label=make("span","vsc-component");
  const swatch=make("span","vsc-swatch");
  swatch.style.setProperty("--swatch",part.color);
  swatch.setAttribute("aria-hidden","true");
  label.appendChild(swatch);
  label.appendChild(make("span",null,part.component_id+" · "+part.form+
   " · "+part.color.toUpperCase()));
  legend.appendChild(label);
 }
 const review=reviewRows.get(profile.rank);
 const caution=make("section","vsc-color-warnings");
 const cautionHead=make("h3",null,"Perceptual proximity checks (machine-generated)");
 caution.appendChild(cautionHead);
 if(review.closeColorPairs===0){
  caution.appendChild(make("p",null,"No same-glyph component-color pairs below the current ΔOK 0.07 review cutoff. This is not a legibility certification."));
 }else{
  for(const pair of review.colorContrastWarnings){
   const row=make("div","vsc-warning-row");
   for(const component of [pair.componentA,pair.componentB]){
    const token=make("span","vsc-component");
    const patch=make("span","vsc-swatch");
    patch.style.setProperty("--swatch",component.hex);
    patch.setAttribute("aria-hidden","true");
    token.appendChild(patch);
    token.appendChild(make("span",null,component.id+" · "+component.form+
     " · "+component.hex.toUpperCase()));
    row.appendChild(token);
   }
   row.appendChild(make("span","vsc-warning-distance",
    "ΔOK "+pair.oklabDistance.toFixed(4)+" · machine flag, not discrimination evidence"));
   caution.appendChild(row);
  }
 }
 $("vsc-source").replaceChildren(
  make("strong",null,"Source rank "+profile.rank+" · "+profile.character),
  make("p",null,shown?"Draft Unihan definition: "+definition:
    "Source definition hidden. Reveal it after comparing the visual conditions."),
  make("p",null,candidate?
    "Selected provisional meaning: "+(shown?candidate.selectedMeaning:"hidden until reveal"):
    "No semantic pictogram candidate in the current screening; abstention is preserved."),
  make("p",null,profile.component_instances.length+
    " source component instances · identity colors are invariant across all three conditions."),
  make("p",null,"Source geometry: "+profile.geometry.svg+
    " · original character and component identities are unchanged. No phonetic layers appear."),
  make("h3",null,"Original component identities and exact colors"),
  legend,
  caution
 );
 $("vsc-warning").textContent=review.closeColorPairs?
  "Flagged source colors: "+review.closeColorPairs+" component pair"+
   (review.closeColorPairs===1?"":"s")+" below ΔOK 0.07 · pending independent visual review":
  "No close-color source warning at ΔOK 0.07 · independent review still pending";
 $("vsc-count").textContent=(pos+1)+" / "+focusRanks.length+
  " in current focus · source rank "+profile.rank+" / 1,000 · "+
  (candidate?"experimental pictogram":"pictogram deferred")+
  " · 0 approved lexical senses · 0 human comprehension trials";
 $("vsc-status").textContent="Three conditions rendered with the same source geometry. "+
  "Monochrome uses that geometry as an alpha mask; semantic cue is experimental.";
}
async function load(){
 try{
  const urls=["profiles/mandarin-1000-v1.json","semantic/mandarin-1000-v0.1.json",
   "glyphs/review/independent-review-worklist-v0.1.json"];
  const responses=await Promise.all(urls.map(u=>fetch(u)));
  if(responses.some(x=>!x.ok))throw Error("Pinned glyph or semantic record unavailable");
  const [profile,meaning,review]=await Promise.all(responses.map(r=>r.json()));
  if(profile.schema!=="chromalect.mandarin-character-profile.v1"||
     profile.catalog_count!==1000||profile.characters.length!==1000||
     meaning.schema!=="chromalect.mandarin.character-semantic-tranche.v0.1"||
     meaning.status!=="initial_screening_complete_candidates_not_production_verified"||
     meaning.summary.screenedCharacters!==1000||
     meaning.summary.productionVerifiedCharacters!==0||
     meaning.summary.pictogramCandidateCharacters!==881||
     meaning.summary.deferredCharacters!==119||
     meaning.source.provisional!==true||
     meaning.characters.length!==1000)
   throw Error("Unreviewed glyph/semantic source status changed");
  if(review.schema!=="chromalect.glyph-independent-review-worklist.v0.1"||
     review.status!==reviewStatus||review.provenance.paletteVersion!=="mandarin-component-identity@0.6.0"||
     review.summary.catalogCharacters!==1000||review.summary.mappedSourceGlyphs!==1000||
     review.summary.independentlyVisuallyCertified!==0||
     review.summary.independentlyLinguisticallyCertified!==0||
     review.summary.eligibleLearningStudyItems!==0||
     !Array.isArray(review.records)||review.records.length!==1000)
   throw Error("Source-matched machine color-review ledger unavailable");
  const reviewed=new Map();
  let warningPairs=0,warningGlyphs=0;
  for(const r of review.records){
   const source=profile.characters[r.rank-1];
   if(!source||reviewed.has(r.rank)||r.character!==source.character||
      r.svg!==source.geometry.svg.split("/").at(-1)||
      r.independentVisualReview!=="pending"||
      r.independentLinguisticReview!=="pending"||
      r.eligibleForLearningStudy!==false||
      !Array.isArray(r.colorContrastWarnings)||
      r.colorContrastWarnings.length!==r.closeColorPairs||
      (r.closestOklabDistance===null)!==(r.closeColorPairs===0))
    throw Error("Build-generated glyph review and source geometry disagree");
   const components=new Map(source.component_instances.map(c=>[profileComponentKey(c),c]));
   for(const pair of r.colorContrastWarnings){
    if(!Number.isFinite(pair.oklabDistance)||pair.oklabDistance<0||
       pair.oklabDistance>=0.07||
       pair.componentA.id===pair.componentB.id)
     throw Error("Unsupported OKLab warning measurement");
    for(const c of [pair.componentA,pair.componentB]){
     const match=components.get(c.id);
     if(!match||match.color.toLowerCase()!==c.hex.toLowerCase()||match.form!==c.form)
      throw Error("Warning references the wrong component or identity color");
    }
   }
   warningPairs+=r.closeColorPairs;
   if(r.closeColorPairs)warningGlyphs++;
   reviewed.set(r.rank,r);
  }
  if(warningPairs!==review.summary.colorContrastWarningPairs||warningPairs!==26||
     warningGlyphs!==25)
   throw Error("Expected source-derived close-color cohort changed");
  let candidateChars=0,deferredChars=0,expressions=0;
  for(let i=0;i<1000;i++){
   const p=profile.characters[i],r=meaning.characters[i];
   if(p.rank!==i+1||r.rank!==p.rank||p.character!==r.character||
      !Array.isArray(p.component_instances)||p.component_instances.length<1||
      p.component_instances.some(c=>!/^#[0-9a-f]{6}$/i.test(c.color))||
      p.geometry?.status!=="source_aligned_visual_review_pending"||
      !exactSvg.test(p.geometry.svg)||
      p.geometry.svg!=="glyphs/U+"+p.character.codePointAt(0).toString(16).toUpperCase().padStart(4,"0")+".svg"||
      r.screening.status!=="screened"||!Array.isArray(r.screening.candidates))
    throw Error("Source glyph geometry or semantic rank alignment changed");
   const opts=candidates(r);
   if(opts.length){candidateChars++;expressions+=opts.length;}
   else deferredChars++;
   for(const c of opts){
    if(c.state!=="experimental_pictogram_candidate"||
       c.review!=="human_linguistic_and_comprehension_review_pending"||
       !c.selectedMeaning||!Number.isInteger(c.sourceGroupIndex)||
       c.sourceGroupIndex<0||c.sourceGroupIndex>=r.source.groupCandidates.length)
     throw Error("Source meaning claim improperly promoted");
    grammar.validate(c.expression);
   }
  }
  if(candidateChars!==881||deferredChars!==119||
     expressions!==897||meaning.initialScreeningReview.productionVerifiedSenses!==0)
   throw Error("Proposed expression inventory changed");
  profiles=profile.characters;semantic=meaning.characters;reviewRows=reviewed;
  selected=0;$("vsc-focus").value="all";rebuildPicker();render();
 }catch(e){
  profiles=[];semantic=[];reviewRows=new Map();focusRanks=[];
  $("vsc-panels").replaceChildren();
  $("vsc-status").textContent="Cannot verify the visual comparison source: "+e.message;
 }
}
$("vsc-pick").addEventListener("change",()=>{
 const rank=Number($("vsc-pick").value);
 if(Number.isInteger(rank)&&rank>=1&&rank<=1000){selected=rank-1;$("vsc-sense").value="0";render();}
});
$("vsc-focus").addEventListener("change",()=>{
 try{rebuildPicker();$("vsc-sense").value="0";render();}
 catch(error){$("vsc-status").textContent="Unable to apply visual research focus: "+error.message;}
});
$("vsc-back").addEventListener("click",()=>{
 const i=focusRanks.indexOf(selected+1);if(i>0){selected=focusRanks[i-1]-1;render();}
});
$("vsc-forward").addEventListener("click",()=>{
 const i=focusRanks.indexOf(selected+1);
 if(i>=0&&i<focusRanks.length-1){selected=focusRanks[i+1]-1;render();}
});
$("vsc-sense").addEventListener("change",render);
$("vsc-reveal").addEventListener("change",render);
$("vsc-size").addEventListener("input",render);
load();
})();