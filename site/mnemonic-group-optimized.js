// In-sample research comparison of the immutable v0.6 identity palette,
// original group-hue counterfactual, and a deterministic collision-reduced
// counterfactual. No scheme has semantic or perceptual approval.
(() => {
"use strict";
const $=id=>document.getElementById(id);
const needed=["opt-status","opt-count","opt-summary","opt-group","opt-swatches"];
if(needed.some(id=>!$(id)))return;
const node=(tag,cls,value)=>{const e=document.createElement(tag);
 if(cls)e.className=cls;if(value!==undefined)e.textContent=value;return e;};
let groups=[];
function show(){
 const selected=$("opt-group").value;
 if(selected!=="all"&&!groups.some(g=>g.historicalHint===selected))
  throw Error("Unsupported source mnemonic group");
 const visible=groups.filter(g=>selected==="all"||g.historicalHint===selected);
 $("opt-swatches").replaceChildren();
 for(const group of visible){
  const card=node("section","opt-card");
  card.appendChild(node("h2",null,group.historicalHint.replaceAll("-"," ")));
  card.appendChild(node("p","opt-meta",group.memberCount+
   " original hinted components · group hue anchor "+
   group.anchorHueDegrees+"° · independent semantic review pending"));
  const members=node("div","opt-members");
  for(const row of group.members){
   const article=node("article","opt-member");
   article.appendChild(node("strong",null,row.componentId+" · "+row.form));
   const samples=node("div","opt-color-cards");
   for(const [title,hex] of [
    ["Active v0.6",row.sourceHex],
    ["First grouping",row.firstTrialHex],
    ["Co-occurrence revision",row.optimizedTrialHex]
   ]){
    const sample=node("div","opt-color-card");
    const swatch=node("span","opt-swatch");
    swatch.style.setProperty("--opt-color",hex);
    swatch.setAttribute("aria-label",title+" "+hex);
    sample.appendChild(swatch);
    sample.appendChild(node("span",null,title+" · "+hex));
    samples.appendChild(sample);
   }
   article.appendChild(samples);members.appendChild(article);
  }
  card.appendChild(members);$("opt-swatches").appendChild(card);
 }
 $("opt-count").textContent=visible.length+" of eight historical hint groups · "+
  visible.reduce((n,g)=>n+g.members.length,0)+" experimental component identities";
}
async function load(){
 try{
  const paths=["mnemonic-group-risk-optimized-v0.2.json",
   "mnemonic-group-counterfactual-v0.1.json",
   "palettes/mandarin-component-identity-v0.6.json"];
  const responses=await Promise.all(paths.map(path=>fetch(path)));
  if(responses.some(r=>!r.ok))throw Error("Source-matched optimization or palette not published");
  const [study,first,palette]=await Promise.all(responses.map(r=>r.json()));
  if(study.schema!=="chromalect.palette.source-cooccurrence-hue-optimizer.v0.2"||
     study.status!=="in_sample_40_component_optimization_research_only_no_semantic_or_visual_approval"||
     study.provenance.sourcePalette!=="mandarin-component-identity@0.6.0"||
     study.provenance.baseVariant!=="chromalect.palette.historical-hint-counterfactual.v0.1"||
     study.provenance.researchOnly!==true||
     study.provenance.activeSourcePaletteMutated!==false||
     study.provenance.heldOutGlyphsEvaluated!==0||
     study.provenance.humanPerceptualTests!==0||
     study.provenance.semanticMembershipsApproved!==0||
     study.summary.catalogCharacters!==1000||
     study.summary.originalPaletteComponents!==520||
     study.summary.alteredHypotheticalIDs!==40||
     study.summary.unhintedExcluded!==480||
     study.summary.firstTrialAllGlyphWarningPairs!==76||
     study.summary.sourceOriginalWarningPairs!==26||
     study.summary.optimizedWarningsInAffectedEdges>
      study.summary.firstTrialWarningsInAffectedEdges||
     study.summary.humanLearningStudies!==0||
     study.summary.approvedLexicalOrSemanticFamilies!==0||
     first.status!=="isolated_40_component_hue_grouping_hypothesis_not_a_palette_or_semantic_approval"||
     first.summary.hypotheticalColorAssignments!==40||
     first.provenance.originalPaletteModified!==false||
     palette.version!=="0.6.0"||
     !Array.isArray(palette.components)||palette.components.length!==520||
     !Array.isArray(study.groups)||study.groups.length!==8)
   throw Error("Version, source or research acceptance boundary changed");
  const source=new Map(palette.components.map(c=>[c.id,c]));
  const firstMap=new Map(first.groups.flatMap(g=>g.members.map(c=>[c.componentId,c])));
  const ids=new Set(),candidateColors=new Set();
  for(let i=0;i<8;i++){
   const group=study.groups[i],g0=first.groups[i];
   if(group.historicalHint!==g0.historicalHint||
      group.historicalHintVerified!==false||
      group.anchorHueDegrees!==g0.proposedHueDegrees||
      group.memberCount!==g0.members.length||
      group.members.length!==group.memberCount)
    throw Error("Optimized variant changed source historical grouping");
   for(let j=0;j<group.members.length;j++){
    const row=group.members[j],prior=firstMap.get(row.componentId),
     old=source.get(row.componentId);
    if(!prior||!old||ids.has(row.componentId)||candidateColors.has(row.optimizedTrialHex)||
       row.componentId!==g0.members[j].componentId||
       row.form!==old.shape||row.sourceHex!==old.color||
       row.firstTrialHex!==prior.candidateHex||
       row.historicalHint!==group.historicalHint||
       row.groupMembershipApproval!=="unverified_historical_mnemonic_hint"||
       row.visuallyDiscriminable!=="unverified"||
       row.semanticFamilyVerified!==false||
       Object.keys(row).sort().join("|")!==
        ["componentId","firstTrialHex","form","groupMembershipApproval",
         "historicalHint","optimizedTrialHex","semanticFamilyVerified",
         "sourceHex","visuallyDiscriminable"].join("|")||
       !/^#[0-9A-F]{6}$/.test(row.optimizedTrialHex))
     throw Error("Original component source identity or candidate changed unexpectedly");
    ids.add(row.componentId);candidateColors.add(row.optimizedTrialHex);
   }
  }
  if(ids.size!==40||candidateColors.size!==40)
   throw Error("Candidate swatch identities are incomplete");
  groups=study.groups;
  $("opt-group").replaceChildren();
  for(const [id,label] of [["all","All eight groups"],
   ...groups.map(g=>[g.historicalHint,
    g.historicalHint.replaceAll("-"," ")+" ("+g.memberCount+")"])]){
   const option=node("option",null,label);option.value=id;
   $("opt-group").appendChild(option);
  }
  $("opt-group").value="all";
  $("opt-summary").textContent=
   "In-sample, source-cooccurrence-linked candidate edges below ΔOK 0.07: "+
   study.summary.firstTrialWarningsInAffectedEdges+" in the first grouping and "+
   study.summary.optimizedWarningsInAffectedEdges+" after deterministic optimization. "+
   "Across all original glyph pairs, v0.6 has 26; the first grouping has 76. "+
   "No held-out, visual, semantic or educational trials have been performed.";
  $("opt-status").textContent="Original v0.6 colors and forty source identities verified. Alternative swatches are research-only.";
  show();
 }catch(error){
  groups=[];$("opt-swatches").replaceChildren();
  $("opt-count").textContent="No source-verified research swatches";
  $("opt-status").textContent="Unable to validate this research candidate: "+error.message;
 }
}
$("opt-group").addEventListener("change",show);
load();
})();