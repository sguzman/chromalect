// The experimental gallery is an exact-source SVG clone corpus. It cannot
// modify the main atlas or confer lexical, visual or learning certification.
(() => {
"use strict";
const $=id=>document.getElementById(id);
const ids=["hg-query","hg-size","hg-size-label","hg-gray","hg-surface",
 "hg-select","hg-prev","hg-next","hg-show-meaning","hg-sense","hg-reveal",
 "hg-compare","hg-count","hg-status","hg-owner","hg-semantic",
 "hg-risk-filter","hg-risk-summary","hg-risk-pairs"];
if(ids.some(id=>!$(id)))return;
const grammar=globalThis.ChromalectSemanticGrammar;
if(!grammar||!grammar.validate){
 $("hg-status").textContent="Source-backed semantic grammar unavailable";
 return;
}
const make=(tag,cls,label)=>{
 const node=document.createElement(tag);
 if(cls)node.className=cls;
 if(label!==undefined)node.textContent=label;
 return node;
};
let records=[],current=0,candidates=new Map(),originalPalette=new Map(),semantic=[],
 riskRows=new Map(),riskTotals=null;
const baseName=r=>"U+"+r.character.codePointAt(0).toString(16).toUpperCase().padStart(4,"0")+".svg";
const allowedSurface=new Set(["theme","white","black"]);
function cohort(){
 const query=$("hg-query").value.trim().toLowerCase();
 const focus=$("hg-risk-filter").value;
 if(!["all","introduced","new_close","original_close","resolved"].includes(focus))
  throw Error("Unsupported color proximity research filter");
 return records.filter(r=>{
  const risk=riskRows.get(r.rank);
  const selected=focus==="all"||
   (focus==="introduced"&&risk.introducedClosePairs>0)||
   (focus==="new_close"&&risk.candidateClosePairs>0)||
   (focus==="original_close"&&risk.originalClosePairs>0)||
   (focus==="resolved"&&risk.resolvedClosePairs>0);
  return selected&&(!query||String(r.rank)===query||
   r.character.toLowerCase().includes(query)||
   r.changedComponentIds.some(id=>id.toLowerCase().includes(query)));
 });
}
function choose(){
 const filtered=cohort();
 if(!filtered.length){
  $("hg-select").replaceChildren();
  $("hg-compare").replaceChildren();
  $("hg-owner").replaceChildren();$("hg-semantic").replaceChildren();
  $("hg-risk-pairs").replaceChildren();$("hg-sense").replaceChildren();
  $("hg-count").textContent="0 matching research glyphs";
  return;
 }
 if(!filtered.some(x=>x.rank===current))current=filtered[0].rank;
 const index=filtered.findIndex(x=>x.rank===current),r=filtered[index];
 const select=$("hg-select");select.replaceChildren();
 for(const row of filtered){
  const opt=make("option",null,"#"+row.rank+" · "+row.character+
   " · "+row.changedComponentIds.length+" proposed color owner(s)");
  opt.value=String(row.rank);select.appendChild(opt);
 }
 select.value=String(r.rank);
 $("hg-prev").disabled=index===0;
 $("hg-next").disabled=index===filtered.length-1;
 const sourceSemantic=semantic[r.rank-1];
 const options=sourceSemantic.screening.candidates.filter(c=>c.expression!==null);
 const sense=$("hg-sense"),old=Number(sense.value);
 sense.replaceChildren();
 for(let i=0;i<options.length;i++){
  const option=make("option",null,"Candidate "+(i+1)+" · "+options[i].selectedMeaning);
  option.value=String(i);sense.appendChild(option);
 }
 sense.disabled=!options.length;
 sense.value=String(old>=0&&old<options.length?old:0);
 const proposal=options[Number(sense.value)]||null;
 const surface=$("hg-surface").value;
 if(!allowedSurface.has(surface))throw Error("Unknown research surface");
 const fragment=document.createDocumentFragment();
 for(const [label,url,kind] of [
  ["Active original v0.6",r.originalSVG,"original"],
  ["Isolated hue-group counterfactual",r.hypotheticalSVG,"proposed"]]){
  const item=make("figure","hg-panel"),title=make("figcaption",null,label),
   stage=make("div","hg-stage"),svg=make("img","hg-svg");
  svg.src=url;
  svg.alt=(kind==="original"?"Original":"Experimental alternative")+
   " source-aligned component-colored strokes for "+r.character;
  svg.loading="lazy";
  svg.width=Number($("hg-size").value);
  svg.height=Number($("hg-size").value);
  if($("hg-gray").checked)svg.style.setProperty("filter","grayscale(1)");
  stage.style.setProperty("--hg-background",
   surface==="white"?"#ffffff":surface==="black"?"#000000":"transparent");
  stage.appendChild(svg);
  if($("hg-show-meaning").checked){
   const cue=make("div","hg-semantic-cue");
   if(proposal){
    for(const part of grammar.emojiParts(proposal.expression)){
     const atom=make("span","hg-semantic-atom",part.text);
     atom.setAttribute("aria-hidden","true");cue.appendChild(atom);
    }
    cue.setAttribute("role","img");
    cue.setAttribute("aria-label","Unverified pictogram for "+
     proposal.selectedMeaning+": "+grammar.emojiDisplay(proposal.expression));
   }else cue.textContent="Semantic candidate deferred; no pictogram inserted";
   stage.appendChild(cue);
  }
  item.appendChild(title);item.appendChild(stage);
  fragment.appendChild(item);
 }
 $("hg-compare").replaceChildren(fragment);
 const owners=make("div","hg-owners");
 for(const id of r.changedComponentIds){
  const c=candidates.get(id),original=originalPalette.get(id);
  const row=make("div","hg-identity");
  row.appendChild(make("strong",null,id+" · "+original.shape));
  for(const [label,hex] of [["Original",c.sourceHex],
   ["Hypothetical",c.candidateHex]]){
   const mark=make("span","hg-swatch");
   mark.style.setProperty("--hg-swatch",hex);
   mark.setAttribute("aria-label",label+" "+hex);
   row.appendChild(mark);
   row.appendChild(make("span",null,label+" "+hex));
  }
  owners.appendChild(row);
 }
 const risk=riskRows.get(r.rank),pairPanel=document.createDocumentFragment();
 pairPanel.appendChild(make("strong",null,"Source-owned component color proximity"));
 pairPanel.appendChild(make("p",null,risk.sourceUniqueComponentPairs+
  " distinct within-glyph component pairs · "+
  risk.originalClosePairs+" original below ΔOK 0.07 · "+
  risk.candidateClosePairs+" hypothetical below ΔOK 0.07 · "+
  risk.introducedClosePairs+" newly close · "+
  risk.resolvedClosePairs+" resolved. All values are machine diagnostics."));
 if(risk.reviewPairs.length===0)
  pairPanel.appendChild(make("p",null,"No source pair falls within either below-0.07 group or the recorded near-threshold deterioration cohort."));
 for(const pair of risk.reviewPairs){
  const line=make("div","hg-risk-row");
  const state=make("strong",null,pair.state.replaceAll("_"," ")+" · original ΔOK "+
   pair.originalDeltaOk.toFixed(4)+" · hypothetical ΔOK "+
   pair.candidateDeltaOk.toFixed(4));
  line.appendChild(state);
  for(const c of [pair.componentA,pair.componentB]){
   const component=make("div","hg-risk-component");
   component.appendChild(make("span",null,c.id+" · "+c.form));
   for(const [label,color] of [["Source",c.sourceHex],["Alternative",c.candidateHex]]){
    const chip=make("span","hg-swatch");
    chip.style.setProperty("--hg-swatch",color);
    chip.setAttribute("aria-label",label+" "+color);
    component.appendChild(chip);
   }
   line.appendChild(component);
  }
  pairPanel.appendChild(line);
 }
 $("hg-risk-pairs").replaceChildren(pairPanel);
 $("hg-semantic").replaceChildren(
  make("strong",null,"Same experimental meaning cue on both conditions"),
  make("p",null,proposal?
   "Source-screened candidate "+($("hg-reveal").checked?
    proposal.selectedMeaning:"label hidden until revealed")+
   " · original source definition "+($("hg-reveal").checked?
    sourceSemantic.source.definition:"hidden"):
   "No provisional pictogram selected for this character; abstention remains."),
  make("p",null,"Lexical senses, pictograms, visual decoding and learning outcomes independently approved: zero.")
 );
 $("hg-owner").replaceChildren(
  make("p",null,"Source rank "+r.rank+" · "+r.character+
   " · "+r.modifiedSourcePathFills+" recolored source path fill(s); "+
   r.unchangedSourcePathFills+" unchanged source paths in this glyph"),
  make("p",null,"All d-path geometry, transforms, and source path owners are identical. "+
   "The source atlas remains unchanged. Independent visual review is pending."),
  owners
 );
 $("hg-count").textContent=(index+1)+" / "+filtered.length+
  " research-eligible glyphs · 0 verified semantic families · 0 decoding trials";
 $("hg-size-label").textContent=$("hg-size").value+" px";
}
async function load(){
 try{
  const paths=["glyphs/research/hint-counterfactual-v0.1/index-v0.1.json",
   "mnemonic-group-counterfactual-v0.1.json",
   "palettes/mandarin-component-identity-v0.6.json",
   "semantic/mandarin-1000-v0.1.json",
   "glyphs/research/hint-counterfactual-v0.1/pair-risk-v0.1.json"];
  const responses=await Promise.all(paths.map(x=>fetch(x)));
  if(responses.some(x=>!x.ok))throw Error("Required pinned research index unavailable");
  const [index,alternative,palette,meaning,riskAudit]=await Promise.all(responses.map(x=>x.json()));
  if(index.schema!=="chromalect.glyph.historical-hint-counterfactual-gallery.v0.1"||
     index.status!=="build_generated_isolated_research_svg_recolor_only_no_semantic_or_visual_approval"||
     index.provenance.palette!=="mandarin-component-identity@0.6.0"||
     index.provenance.activeGlyphFilesOverwritten!==false||
     index.provenance.strokePathsChanged!==false||
     index.provenance.ownerMappingsChanged!==false||
     index.provenance.other480ComponentsRecolored!==false||
     index.provenance.independentlyApprovedVisuals!==0||
     index.provenance.semanticFamilyApprovals!==0||
     index.summary.catalogGlyphs!==1000||
     !Number.isInteger(index.summary.generatedSourceManifestGlyphs)||
     index.summary.generatedSourceManifestGlyphs<1000||
     index.summary.generatedSourceManifestGlyphs>1032||
     index.summary.excludedOutsideActiveTranche!==
      index.summary.generatedSourceManifestGlyphs-1000||
     index.summary.hypotheticalComponentIds!==40||
     index.summary.humanComprehensionTrials!==0||
     index.summary.independentVisualAudits!==0||
     index.summary.affectedGlyphs<=0||
     index.summary.affectedGlyphs+index.summary.untouchedGlyphs!==1000||
     !Array.isArray(index.glyphs)||
     index.glyphs.length!==index.summary.affectedGlyphs||
     alternative.status!=="isolated_40_component_hue_grouping_hypothesis_not_a_palette_or_semantic_approval"||
     alternative.provenance.originalPaletteModified!==false||
     alternative.provenance.activeGlyphsRecolored!==false||
     alternative.summary.hypotheticalColorAssignments!==40||
     alternative.summary.approvedSemanticFamilies!==0||
     palette.version!=="0.6.0"||
     palette.components.length!==520||
     meaning.schema!=="chromalect.mandarin.character-semantic-tranche.v0.1"||
     meaning.status!=="initial_screening_complete_candidates_not_production_verified"||
     meaning.summary.screenedCharacters!==1000||
     meaning.summary.pictogramCandidateCharacters!==881||
     meaning.summary.deferredCharacters!==119||
     meaning.summary.productionVerifiedCharacters!==0||
     meaning.initialScreeningReview.productionVerifiedSenses!==0||
     meaning.source.provisional!==true||
     !Array.isArray(meaning.characters)||meaning.characters.length!==1000)
   throw Error("Original glyph or hypothetical research boundaries failed");
  const proposed=new Map(alternative.groups.flatMap(g=>
   g.members.map(c=>[c.componentId,c])));
  const active=new Map(palette.components.map(c=>[c.id,c]));
  if(proposed.size!==40)throw Error("Incomplete candidate color ownership");
  for(const [id,c] of proposed){
   const source=active.get(id);
   if(!source||source.color!==c.sourceHex||source.shape!==c.form)
    throw Error("Hypothetical swatches do not match source palette");
  }
  const seen=new Set();let fills=0,untouched=0,lastRank=0;
  for(const r of index.glyphs){
   const filename=baseName(r);
   if(!Number.isInteger(r.rank)||r.rank<=lastRank||r.rank>1000||
      seen.has(r.character)||r.originalSVG!=="glyphs/"+filename||
      r.hypotheticalSVG!=="glyphs/research/hint-counterfactual-v0.1/"+filename||
      !Number.isInteger(r.modifiedSourcePathFills)||r.modifiedSourcePathFills<1||
      !Number.isInteger(r.unchangedSourcePathFills)||r.unchangedSourcePathFills<0||
      !Array.isArray(r.changedComponentIds)||!r.changedComponentIds.length||
      r.changedComponentIds.some(id=>!proposed.has(id))||
      !/^[0-9a-f]{64}$/.test(r.sourceGeometrySHA256)||
      !/^[0-9a-f]{64}$/.test(r.candidateGeometrySHA256)||
      r.sourceGeometrySHA256===r.candidateGeometrySHA256||
      r.sourcePathsIdentical!==true||
      r.componentOwnerSequenceIdentical!==true||
      r.activePaletteUntouched!==true||
      r.independentGlyphValidation!=="pending")
    throw Error("Corrupted or prematurely approved generated source glyph index");
   lastRank=r.rank;seen.add(r.character);
   fills+=r.modifiedSourcePathFills;untouched+=r.unchangedSourcePathFills;
  }
  if(fills!==index.summary.alteredSourcePathFills||
     untouched!==index.summary.unchangedSourcePathFillsInAffectedGlyphs||
     !Number.isInteger(index.summary.unchangedSourcePathFillsInUnchangedGlyphs)||
     index.summary.unchangedSourcePathFillsInUnchangedGlyphs<0||
     index.summary.unchangedSourcePathFills!==
      index.summary.unchangedSourcePathFillsInAffectedGlyphs+
       index.summary.unchangedSourcePathFillsInUnchangedGlyphs)
   throw Error("Research gallery source-path totals differ from the pinned active catalog");
  let candidateCount=0,candidateCharacters=0;
  for(let i=0;i<meaning.characters.length;i++){
   const entry=meaning.characters[i],options=entry.screening?.candidates;
   if(entry.rank!==i+1||!Array.isArray(options)||
      entry.screening.status!=="screened")
    throw Error("Source semantic rank or screening status changed");
   const proposed=options.filter(c=>c.expression!==null);
   if(proposed.length)candidateCharacters++;
   candidateCount+=proposed.length;
   for(const c of proposed){
    if(c.state!=="experimental_pictogram_candidate"||
       c.review!=="human_linguistic_and_comprehension_review_pending"||
       !c.selectedMeaning)
     throw Error("Candidate meaning improperly verified");
    grammar.validate(c.expression);
   }
  }
  if(candidateCharacters!==881||candidateCount!==897||
     index.glyphs.some(r=>meaning.characters[r.rank-1].character!==r.character))
   throw Error("Source-aligned semantics do not match the candidate glyphs");
  if(riskAudit.schema!=="chromalect.glyph.hint-hue-source-pair-risk.v0.1"||
     riskAudit.status!=="machine_computed_per_glyph_identity_proximity_not_human_discrimination"||
     riskAudit.provenance.palette!=="mandarin-component-identity@0.6.0"||
     riskAudit.provenance.cutoffDeltaOk!==0.07||
     riskAudit.provenance.originalPaletteMutated!==false||
     riskAudit.provenance.humanReviewPerformed!==false||
     riskAudit.provenance.semanticFamilyApproval!==false||
     riskAudit.summary.catalogCharacters!==1000||
     riskAudit.summary.paletteIdentities!==520||
     riskAudit.summary.hypotheticalComponentIds!==40||
     riskAudit.summary.affectedGlyphs!==index.summary.affectedGlyphs||
     riskAudit.summary.originalClosePairs!==26||
     riskAudit.summary.independentlyAcceptedSemanticFamilies!==0||
     riskAudit.summary.humanLegibilityTrials!==0||
     riskAudit.summary.proposedClosePairs!==
      riskAudit.summary.newlyClosePairs+riskAudit.summary.retainedClosePairs||
     riskAudit.summary.originalClosePairs!==
      riskAudit.summary.resolvedClosePairs+riskAudit.summary.retainedClosePairs||
     !Array.isArray(riskAudit.glyphs)||
     riskAudit.glyphs.length!==index.glyphs.length)
   throw Error("Unverified or inconsistent source-pair risk assessment");
  const checked=new Map();
  let closeBefore=0,closeAfter=0,newClose=0,resolved=0;
  for(let i=0;i<riskAudit.glyphs.length;i++){
   const row=riskAudit.glyphs[i],candidate=index.glyphs[i];
   if(row.rank!==candidate.rank||row.character!==candidate.character||
      row.svg!==candidate.hypotheticalSVG||
      row.sourceSVG!==candidate.originalSVG||
      row.sourceGeometryUnchanged!==true||
      row.productionPaletteUnchanged!==true||
      row.visualJudgment!=="pending"||
      row.lexicalInterpretation!=="unapproved"||
      row.changedComponentIds.join("|")!==candidate.changedComponentIds.join("|")||
      row.originalClosePairs!==row.resolvedClosePairs+row.retainedClosePairs||
      row.candidateClosePairs!==row.introducedClosePairs+row.retainedClosePairs||
      !Array.isArray(row.reviewPairs))
    throw Error("Changed-glyph pair evidence does not match source manifests");
   for(const pair of row.reviewPairs){
    const first=pair.componentA,second=pair.componentB;
    if(!first||!second||first.id===second.id||
       !active.has(first.id)||!active.has(second.id)||
       pair.perceptuallyVerified!==false||
       pair.experimentalMeasurementOnly!==true||
       first.sourceHex.toUpperCase()!==active.get(first.id).color.toUpperCase()||
       second.sourceHex.toUpperCase()!==active.get(second.id).color.toUpperCase()||
       first.candidateHex.toUpperCase()!==(proposed.get(first.id)?.candidateHex??
        active.get(first.id).color).toUpperCase()||
       second.candidateHex.toUpperCase()!==(proposed.get(second.id)?.candidateHex??
        active.get(second.id).color).toUpperCase()||
       !Number.isFinite(pair.originalDeltaOk)||!Number.isFinite(pair.candidateDeltaOk)||
       !["introduced","resolved","retained","not_close"].includes(pair.state))
     throw Error("Unmatched source component pair or fabricated visual review");
   }
   checked.set(row.rank,row);
   closeBefore+=row.originalClosePairs;closeAfter+=row.candidateClosePairs;
   newClose+=row.introducedClosePairs;resolved+=row.resolvedClosePairs;
  }
  if(closeBefore>riskAudit.summary.originalClosePairs||
     closeAfter>riskAudit.summary.proposedClosePairs||
     newClose!==riskAudit.summary.newlyClosePairs||
     resolved!==riskAudit.summary.resolvedClosePairs||
     checked.size!==index.summary.affectedGlyphs)
   throw Error("Research color pair totals are inconsistent with source cohort");
  riskRows=checked;riskTotals=riskAudit.summary;
  $("hg-risk-summary").textContent="Same-glyph component pairs below ΔOK 0.07: "+
   riskTotals.originalClosePairs+" in the original palette versus "+
   riskTotals.proposedClosePairs+" in the hypothetical palette · "+
   riskTotals.newlyClosePairs+" newly close · "+
   riskTotals.resolvedClosePairs+" resolved · "+
   riskTotals.affectedGlyphsWithNewClosePairs+
   " affected glyphs with at least one newly close pair. "+
   "No human distinguishability or comprehension approvals.";
  records=index.glyphs;candidates=proposed;originalPalette=active;
  semantic=meaning.characters;
  const hash=typeof location!=="undefined"?/^#c(0[0-9]{3}|1000)$/.exec(location.hash):null;
  current=hash?Number(hash[1]):records[0].rank;
  $("hg-status").textContent=index.summary.affectedGlyphs+
   " active-tranche glyphs contain at least one of the 40 proposed component hues; "+
   index.summary.excludedOutsideActiveTranche+
   " additional source-manifest records are excluded from this study. "+
   "Original SVGs and geometries verified by the publishing build; browser imagery has not been independently reviewed.";
  choose();
 }catch(error){
  records=[];semantic=[];riskRows=new Map();riskTotals=null;
  $("hg-risk-summary").textContent="Unverified color pair comparison.";
  $("hg-risk-pairs").replaceChildren();
  $("hg-compare").replaceChildren();$("hg-owner").replaceChildren();
  $("hg-semantic").replaceChildren();
  $("hg-status").textContent="Unable to validate research SVG gallery: "+error.message;
 }
}
$("hg-query").addEventListener("input",choose);
$("hg-risk-filter").addEventListener("change",choose);
$("hg-select").addEventListener("change",()=>{
 const rank=Number($("hg-select").value);
 if(cohort().some(r=>r.rank===rank)){current=rank;choose();}
});
$("hg-prev").addEventListener("click",()=>{
 const options=cohort(),idx=options.findIndex(x=>x.rank===current);
 if(idx>0){current=options[idx-1].rank;choose();}
});
$("hg-next").addEventListener("click",()=>{
 const options=cohort(),idx=options.findIndex(x=>x.rank===current);
 if(idx>=0&&idx<options.length-1){current=options[idx+1].rank;choose();}
});
for(const id of ["hg-size","hg-gray","hg-surface"])
 $(id).addEventListener(id==="hg-size"?"input":"change",choose);
$("hg-sense").addEventListener("change",choose);
$("hg-show-meaning").addEventListener("change",choose);
$("hg-reveal").addEventListener("change",choose);
load();
})();