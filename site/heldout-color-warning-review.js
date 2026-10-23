// Visual review of source-exact held-out experimental glyphs.
// Source colors are authoritative. Candidate SVGs come from fold models
// that excluded their character ranks during optimization.
(() => {
"use strict";
const $=id=>document.getElementById(id);
const ids=["hv-status","hv-summary","hv-filter","hv-order","hv-search",
 "hv-size","hv-size-label","hv-gray","hv-surface","hv-select",
 "hv-prev","hv-next","hv-gallery","hv-pairs","hv-count",
 "hv-show-meaning","hv-sense","hv-reveal","hv-semantic"];
if(ids.some(id=>!$(id)))return;
const grammar=globalThis.ChromalectSemanticGrammar;
const contrast=globalThis.ChromalectReferenceContrast;
if(!grammar||!grammar.validate||!contrast||
   contrast.version!=="wcag22-srgb-reference-v0.1"){
 $("hv-status").textContent="Reference semantic grammar or luminance calculator unavailable";
 return;
}
const make=(tag,cls,label)=>{
 const e=document.createElement(tag);
 if(cls)e.className=cls;
 if(label!==undefined)e.textContent=label;
 return e;
};
let entries=[],current=0,meaning=[],lastRendered=0;
const allowed=new Set(["all","introduced","resolved","retained"]);
const orders=new Set(["severity","distance","rank"]);
function filtered(){
 const focus=$("hv-filter").value,sort=$("hv-order").value;
 if(!allowed.has(focus)||!orders.has(sort))
  throw Error("Unsupported held-out review filter");
 const query=$("hv-search").value.trim().toLowerCase();
 const rows=entries.filter(e=>
  (focus==="all"||e.pairs.some(p=>p.reviewState===focus))&&
  (!query||String(e.rank)===query||
   e.character.toLowerCase().includes(query)||
   e.pairs.some(p=>p.componentA.id.toLowerCase().includes(query)||
    p.componentB.id.toLowerCase().includes(query))));
 const priority=r=>r.severity==="introduced"?0:r.severity==="retained"?1:2;
 const minDistance=r=>Math.min(...r.pairs.map(p=>p.foldOptimizedDeltaOk));
 rows.sort((a,b)=>sort==="rank"?a.rank-b.rank:
  sort==="distance"?minDistance(a)-minDistance(b)||a.rank-b.rank:
  priority(a)-priority(b)||minDistance(a)-minDistance(b)||a.rank-b.rank);
 return rows;
}
function render(){
 const rows=filtered();
 if(!rows.length){
  $("hv-select").replaceChildren();$("hv-gallery").replaceChildren();
  $("hv-pairs").replaceChildren();$("hv-semantic").replaceChildren();
  $("hv-sense").replaceChildren();
  $("hv-prev").disabled=true;$("hv-next").disabled=true;
  $("hv-count").textContent="0 source-review glyphs match";
  return;
 }
 if(!rows.some(r=>r.rank===current))current=rows[0].rank;
 const i=rows.findIndex(r=>r.rank===current),r=rows[i];
 const sel=$("hv-select");sel.replaceChildren();
 for(const choice of rows){
  const option=make("option",null,
   "#"+choice.rank+" · "+choice.character+" · fold "+(choice.foldIndex+1)+
   " · "+choice.severity);
  option.value=String(choice.rank);sel.appendChild(option);
 }
 sel.value=String(r.rank);
 $("hv-prev").disabled=i===0;
 $("hv-next").disabled=i===rows.length-1;
 const sourceMeaning=meaning[r.rank-1];
 const candidates=sourceMeaning.screening.candidates.filter(c=>c.expression!==null);
 const sense=$("hv-sense"),previous=lastRendered===r.rank?Number(sense.value):0;
 sense.replaceChildren();
 for(let j=0;j<candidates.length;j++){
  const opt=make("option",null,"Provisional candidate "+(j+1)+" · "+
   candidates[j].selectedMeaning);
  opt.value=String(j);sense.appendChild(opt);
 }
 sense.disabled=candidates.length===0;
 sense.value=String(previous>=0&&previous<candidates.length?previous:0);
 lastRendered=r.rank;
 const candidate=candidates[Number(sense.value)]??null;
 const bg=$("hv-surface").value;
 if(!["theme","white","black"].includes(bg))
  throw Error("Unknown control background");
 const size=Number($("hv-size").value);
 if(!Number.isFinite(size)||size<40||size>160)
  throw Error("Unknown source glyph display size");
 $("hv-size-label").textContent=size+" px";
 $("hv-gallery").replaceChildren();
 for(const [label,url,variant] of [
  ["Active identity colors v0.6",r.originalSVG,"original"],
  ["Fold-trained experimental colors",r.heldoutSVG,"fold"]]){
  const figure=make("figure","hv-panel"),
   title=make("figcaption",null,label),
   canvas=make("div","hv-canvas"),
   img=make("img","hv-glyph");
  img.src=url;img.width=size;img.height=size;img.loading="lazy";
  img.alt=(variant==="original"?"Active":"Held-out experimental")+
   " source-aligned Chinese glyph for "+r.character;
  if($("hv-gray").checked)
   img.style.setProperty("filter","grayscale(1)");
  canvas.style.setProperty("--hv-surface",bg==="white"?"#fff":bg==="black"?"#000":"transparent");
  canvas.appendChild(img);
  if($("hv-show-meaning").checked){
   const cue=make("div","hv-cue");
   if(candidate){
    for(const part of grammar.emojiParts(candidate.expression)){
     const atom=make("span","hv-cue-atom",part.text);
     atom.setAttribute("aria-hidden","true");cue.appendChild(atom);
    }
    cue.setAttribute("role","img");
    cue.setAttribute("aria-label","Unverified meaning pictogram for "+
     candidate.selectedMeaning+": "+grammar.emojiDisplay(candidate.expression));
   }else cue.textContent="No proposed semantic pictogram (deferred)";
   canvas.appendChild(cue);
  }
  figure.appendChild(title);figure.appendChild(canvas);
  $("hv-gallery").appendChild(figure);
 }
 const panel=$("hv-pairs");panel.replaceChildren();
 panel.appendChild(make("h2",null,"Source-owned component-pair evidence"));
 panel.appendChild(make("p","hv-metadata","Source rank "+r.rank+
  " · "+r.character+" · held-out fold "+(r.foldIndex+1)+
  " · "+r.sourceOwnedPaths+" original source stroke paths · "+
  r.sourceFillChanges+" hypothetical fill changes · "+
  "source geometry and ownership unchanged"));
 for(const pair of r.pairs){
  const section=make("section","hv-pair");
  section.appendChild(make("strong",null,pair.reviewState+
   " · original ΔOK "+pair.originalDeltaOk.toFixed(4)+
   " · fold-trained ΔOK "+pair.foldOptimizedDeltaOk.toFixed(4)+
   " · source luminance "+contrast.ratio(
    pair.componentA.sourceHex,pair.componentB.sourceHex).toFixed(2)+":1"+
   " · fold luminance "+contrast.ratio(
    pair.componentA.foldOptimizedHex,pair.componentB.foldOptimizedHex).toFixed(2)+":1"));
  for(const c of [pair.componentA,pair.componentB]){
   const owner=make("div","hv-owner");
   owner.appendChild(make("span",null,c.id+" · "+c.form));
   for(const [label,hex] of [
    ["Original",c.sourceHex],["Fold candidate",c.foldOptimizedHex]
   ]){
    const swatch=make("span","hv-swatch");
    swatch.style.setProperty("--hv-color",hex);
    swatch.setAttribute("aria-label",label+" "+hex);
    owner.appendChild(swatch);
    owner.appendChild(make("span","hv-code",label+" "+hex));
   }
   section.appendChild(owner);
  }
  panel.appendChild(section);
 }
 panel.appendChild(make("p","hv-metadata",
  "Numerical OKLab proximity and luminance-only ratios; neither measure certifies visible component distinction or semantic learning."));
 $("hv-semantic").replaceChildren(
  make("strong",null,"Provisional meaning is held constant across both glyph-color conditions"),
  make("p",null,candidate?
   "Candidate "+($("hv-reveal").checked?candidate.selectedMeaning:
    "meaning label hidden until revealed")+
   " · source definition "+($("hv-reveal").checked?
    sourceMeaning.source.definition:"hidden"):
   "No independently approved meaning or pictogram has been assigned for this character."),
  make("p",null,"Semantic pictogram comprehension and lexical verification: 0 approved."));
 $("hv-count").textContent=(i+1)+" / "+rows.length+
  " source-ranked held-out warning glyphs · "+r.pairs.length+
  " pair observation(s) in selected glyph · 0 visual certifications";
}
async function init(){
 try{
  const paths=["glyphs/research/heldout-warning-v0.1/index-v0.1.json",
   "palettes/mandarin-component-identity-v0.6.json",
   "semantic-group-hue-fivefold-heldout-v0.1.json",
   "semantic/mandarin-1000-v0.1.json"];
  const responses=await Promise.all(paths.map(path=>fetch(path)));
  if(responses.some(r=>!r.ok))throw Error("Source-exact held-out research sources unavailable");
  const [data,palette,study,semantics]=await Promise.all(responses.map(r=>r.json()));
  if(palette.schema!=="chromalect.component-palette.v0"||
     palette.id!=="mandarin-component-identity"||
     palette.version!=="0.6.0"||
     !Array.isArray(palette.components)||palette.components.length!==520||
     study.schema!=="chromalect.palette.historical-hue-five-fold-heldout.v0.1"||
     study.status!=="deterministic_800_train_200_heldout_numerical_source_glyph_diagnostic_only"||
     study.provenance.originalPaletteRecolored!==false||
     study.provenance.independentVisionTrialConducted!==false||
     study.summary.crossFoldHeldOutTotals.introducedOptimizedClosePairs!==23||
     study.summary.crossFoldHeldOutTotals.resolvedOriginalClosePairs!==21||
     study.summary.crossFoldHeldOutTotals.retainedOriginalClosePairs!==5||
     !Array.isArray(study.folds)||study.folds.length!==5)
   throw Error("The original color source or held-out fold reference changed");
  if(semantics.schema!=="chromalect.mandarin.character-semantic-tranche.v0.1"||
     semantics.status!=="initial_screening_complete_candidates_not_production_verified"||
     semantics.summary.screenedCharacters!==1000||
     semantics.summary.pictogramCandidateCharacters!==881||
     semantics.summary.deferredCharacters!==119||
     semantics.summary.productionVerifiedCharacters!==0||
     semantics.initialScreeningReview.productionVerifiedSenses!==0||
     semantics.source.provisional!==true||
     !Array.isArray(semantics.characters)||semantics.characters.length!==1000)
   throw Error("Provisional source semantics have changed approval state");
  let emojiCount=0,pictogramCount=0;
  for(let i=0;i<semantics.characters.length;i++){
   const c=semantics.characters[i];
   if(c.rank!==i+1||!Array.isArray(c.screening?.candidates)||
      c.screening.status!=="screened")
    throw Error("Semantic screening source-rank mismatch");
   const candidates=c.screening.candidates.filter(x=>x.expression!==null);
   if(candidates.length)pictogramCount++;
   for(const proposal of candidates){
    if(proposal.state!=="experimental_pictogram_candidate"||
       proposal.review!=="human_linguistic_and_comprehension_review_pending"||
       !proposal.selectedMeaning)
     throw Error("Provisional semantic research claim promoted without evidence");
    grammar.validate(proposal.expression);emojiCount++;
   }
  }
  if(pictogramCount!==881||emojiCount!==897)
   throw Error("Provisional semantic candidate coverage mismatch");
  const sourceColors=new Map(palette.components.map(c=>[c.id,c]));
  if(sourceColors.size!==520)throw Error("Source identity registry is incomplete");
  const foldColors=study.folds.map((fold,i)=>{
   if(fold.foldIndex!==i||fold.excludedFromOptimizer.length!==200||
      fold.sourcePinnedCandidateColors.length!==40||
      fold.independentlyReviewed!==false)throw Error("Fold reference misaligned");
   const map=new Map();
   for(const c of fold.sourcePinnedCandidateColors){
    const origin=sourceColors.get(c.componentId);
    if(!origin||origin.color!==c.sourceHex||
       c.semanticApproval!==false||c.sourceIdentityPreserved!==true||
       map.has(c.componentId))throw Error("Unexpected source or fold color identity");
    map.set(c.componentId,c.optimizedHex);
   }
   if(map.size!==40)return null;
   return map;
  });
  if(foldColors.some(x=>x===null))throw Error("Incomplete fold palette");
  if(data.schema!=="chromalect.glyph.heldout-color-warning-review.v0.1"||
     data.status!=="source_pinned_heldout_warning_review_not_visual_or_semantic_certification"||
     data.provenance.sourcePalette!=="mandarin-component-identity@0.6.0"||
     data.provenance.excludedGlyphsUsedForTraining!==false||
     data.provenance.sourceGlyphsOverwritten!==false||
     data.provenance.componentOwnerGeometryChanged!==false||
     data.provenance.semanticFamiliesApproved!==0||
     data.provenance.humanVisualAssessments!==0||
     data.summary.catalogGlyphs!==1000||
     data.summary.folds!==5||
     data.summary.totalWithinGlyphPairs!==1020||
     data.summary.originalWarnings!==26||
     data.summary.firstGroupWarnings!==76||
     data.summary.foldOptimizedWarnings!==28||
     data.summary.introducedWarnings!==23||
     data.summary.resolvedWarnings!==21||
     data.summary.retainedWarnings!==5||
     data.summary.totalPairReviewObservations!==49||
     data.summary.newlyFlaggedGlyphs!==23||
     data.summary.visuallyCertifiedGlyphs!==0||
     data.summary.approvedSemanticFamilies!==0||
     !Array.isArray(data.glyphs)||
     data.glyphs.length!==data.summary.flaggedGlyphs||
     data.glyphs.length!==data.summary.generatedIsolatedSVGs)
   throw Error("Held-out audit source or review status mismatch");
  const seen=new Set(),counts={introduced:0,resolved:0,retained:0};
  let lastRank=0,newCount=0,pairTotal=0;
  for(const r of data.glyphs){
   const filename="U+"+r.character.codePointAt(0).toString(16)
    .toUpperCase().padStart(4,"0")+".svg";
   if(!Number.isInteger(r.rank)||r.rank<=lastRank||r.rank>1000||
      seen.has(r.character)||(r.rank-1)%5!==r.foldIndex||
      r.originalSVG!=="glyphs/"+filename||
      r.heldoutSVG!=="glyphs/research/heldout-warning-v0.1/"+filename||
      !/^[a-f0-9]{64}$/.test(r.originalSHA256)||
      !/^[a-f0-9]{64}$/.test(r.heldoutSHA256)||
      r.sourceGeometryIdentical!==true||
      r.sourceOwnersIdentical!==true||r.activePaletteUnchanged!==true||
      r.visualReview!=="pending"||r.semanticReview!=="unapproved"||
      !["introduced","resolved","retained"].includes(r.severity)||
      !Number.isInteger(r.sourceOwnedPaths)||r.sourceOwnedPaths<1||
      !Number.isInteger(r.sourceFillChanges)||r.sourceFillChanges<0||
      !Array.isArray(r.pairs)||!r.pairs.length)
    throw Error("Invalid glyph source rank, geometry or acceptance");
   lastRank=r.rank;seen.add(r.character);
   if(r.severity==="introduced")newCount++;
   if(!study.folds[r.foldIndex].excludedFromOptimizer.includes(r.rank))
    throw Error("Review glyph belongs to its training rather than held-out fold");
   for(const p of r.pairs){
    if(!["introduced","resolved","retained"].includes(p.reviewState)||
       p.visualReview!=="pending"||p.semanticsApproved!==false||
       p.sourceGeometryChanged!==false||
       !Number.isFinite(p.originalDeltaOk)||
       !Number.isFinite(p.foldOptimizedDeltaOk)||
       p.componentA.id===p.componentB.id)
     throw Error("Unreviewed fold pair record was promoted or malformed");
    for(const c of [p.componentA,p.componentB]){
     const owner=sourceColors.get(c.id);
     if(!owner||owner.shape!==c.form||owner.color!==c.sourceHex||
        c.foldOptimizedHex!==(foldColors[r.foldIndex].get(c.id)??owner.color)||
        !/^#[0-9A-F]{6}$/i.test(c.foldOptimizedHex))
      throw Error("Source component identity or fold-trained color does not match original data");
    }
    counts[p.reviewState]++;pairTotal++;
   }
  }
  if(newCount!==23||counts.introduced!==23||
     counts.resolved!==21||counts.retained!==5||pairTotal!==49)
   throw Error("Published held-out pair observations do not reconcile");
  if(data.glyphs.some(r=>semantics.characters[r.rank-1].character!==r.character))
   throw Error("Held-out glyph is not aligned to the semantic character source");
  entries=data.glyphs;meaning=semantics.characters;
  $("hv-summary").textContent=entries.length+
   " source-matched glyphs contain the original or fold-trained warning "+
   "pairs. 23 new warnings · 21 resolved · 5 retained; "+
   "28 close pairs in fold-trained treatments versus 26 original. "+
   "All visual and lexical review states pending.";
  $("hv-status").textContent="Source SVG geometry, owner IDs and fold exclusions checked by the publishing pipeline.";
  current=entries.find(r=>r.severity==="introduced")?.rank??entries[0].rank;
  render();
 }catch(err){
  entries=[];meaning=[];lastRendered=0;
  $("hv-gallery").replaceChildren();$("hv-pairs").replaceChildren();
  $("hv-semantic").replaceChildren();
  $("hv-count").textContent="No source-verified visual review data";
  $("hv-status").textContent="Unable to verify held-out glyph review: "+err.message;
 }
}
for(const id of ["hv-filter","hv-order"])
 $(id).addEventListener("change",()=>{current=0;render();});
$("hv-search").addEventListener("input",()=>{current=0;render();});
$("hv-select").addEventListener("change",()=>{
 const rank=Number($("hv-select").value);
 if(filtered().some(row=>row.rank===rank)){current=rank;render();}
});
for(const [id,step] of [["hv-prev",-1],["hv-next",1]]){
 $(id).addEventListener("click",()=>{
  const rows=filtered(),index=rows.findIndex(row=>row.rank===current);
  if(index+step>=0&&index+step<rows.length){
   current=rows[index+step].rank;render();
  }
 });
}
for(const id of ["hv-size","hv-gray","hv-surface"])
 $(id).addEventListener(id==="hv-size"?"input":"change",render);
for(const id of ["hv-show-meaning","hv-reveal","hv-sense"])
 $(id).addEventListener("change",render);
init();
})();