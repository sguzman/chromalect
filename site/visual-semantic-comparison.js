/* Three-arm, source-geometry-matched component/semantic visual comparison.
   Trial conditions are research controls, not verified comprehension outcomes. */
(() => {
"use strict";
const $=id=>document.getElementById(id);
const required=["vsc-pick","vsc-back","vsc-forward","vsc-sense","vsc-reveal",
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
let semantic=[],profiles=[],selected=0;
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
 $("vsc-back").disabled=selected===0;
 $("vsc-forward").disabled=selected===999;
 $("vsc-size-label").textContent=$("vsc-size").value+" px";
 const shown=$("vsc-reveal").checked;
 const definition=record.source.definition;
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
    " · original character and component identities are unchanged. No phonetic layers appear.")
 );
 $("vsc-count").textContent=(selected+1)+" / 1,000 · "+
  (candidate?"experimental pictogram":"pictogram deferred")+
  " · 0 approved lexical senses · 0 human comprehension trials";
 $("vsc-status").textContent="Three conditions rendered with the same source geometry. "+
  "Monochrome uses that geometry as an alpha mask; semantic cue is experimental.";
}
async function load(){
 try{
  const urls=["profiles/mandarin-1000-v1.json","semantic/mandarin-1000-v0.1.json"];
  const responses=await Promise.all(urls.map(u=>fetch(u)));
  if(responses.some(x=>!x.ok))throw Error("Pinned glyph or semantic record unavailable");
  const [profile,meaning]=await Promise.all(responses.map(r=>r.json()));
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
  let candidateChars=0,deferredChars=0,expressions=0;
  for(let i=0;i<1000;i++){
   const p=profile.characters[i],r=meaning.characters[i];
   if(p.rank!==i+1||r.rank!==p.rank||p.character!==r.character||
      !Array.isArray(p.component_instances)||p.component_instances.length<1||
      p.component_instances.some(c=>!/^#[0-9a-f]{6}$/i.test(c.color))||
      p.geometry?.status!=="source_aligned_visual_review_pending"||
      !exactSvg.test(p.geometry.svg)||
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
  profiles=profile.characters;semantic=meaning.characters;
  const picker=$("vsc-pick");picker.replaceChildren();
  for(const p of profiles){
   const opt=make("option",null,"#"+p.rank+" · "+p.character);
   opt.value=String(p.rank);picker.appendChild(opt);
  }
  selected=0;render();
 }catch(e){
  profiles=[];semantic=[];$("vsc-panels").replaceChildren();
  $("vsc-status").textContent="Cannot verify the visual comparison source: "+e.message;
 }
}
$("vsc-pick").addEventListener("change",()=>{
 const rank=Number($("vsc-pick").value);
 if(Number.isInteger(rank)&&rank>=1&&rank<=1000){selected=rank-1;$("vsc-sense").value="0";render();}
});
$("vsc-back").addEventListener("click",()=>{if(selected>0){selected--;render();}});
$("vsc-forward").addEventListener("click",()=>{if(selected<999){selected++;render();}});
$("vsc-sense").addEventListener("change",render);
$("vsc-reveal").addEventListener("change",render);
$("vsc-size").addEventListener("input",render);
load();
})();