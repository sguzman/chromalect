// 40-component counterfactual research viewer. The active 520-color palette
// and all generated glyph SVGs are untouched.
(() => {
"use strict";
const $=id=>document.getElementById(id);
const ids=["cf-group","cf-summary","cf-status","cf-count","cf-grid"];
if(ids.some(id=>!$(id)))return;
const el=(tag,cls,label)=>{
 const x=document.createElement(tag);
 if(cls)x.className=cls;
 if(label!==undefined)x.textContent=label;
 return x;
};
const groupsExpected=["human-body","movement-space","speech-senses",
 "earth-material","structural-series","water-fluid","heat-light","plant-growth"];
let groups=[];
function display(){
 const selected=$("cf-group").value;
 if(selected!=="all"&&!groupsExpected.includes(selected))
  throw Error("Unknown unverified source hint");
 const visible=groups.filter(g=>selected==="all"||g.historicalHint===selected);
 $("cf-grid").replaceChildren();
 for(const group of visible){
  const card=el("section","cf-card");
  card.appendChild(el("h2",null,group.historicalHint.replaceAll("-"," ")));
  card.appendChild(el("p","cf-meta",group.members.length+
   " unchanged source identities · hypothetical hue "+group.proposedHueDegrees+
   "° · historical mnemonic group not independently verified"));
  const content=el("div","cf-items");
  for(const member of group.members){
   const row=el("div","cf-item");
   row.appendChild(el("strong",null,member.componentId+" · "+member.form));
   const samples=el("div","cf-samples");
   for(const [label,color] of [["Active v0.6",member.sourceHex],
    ["Counterfactual only",member.candidateHex]]){
    const panel=el("div","cf-sample");
    const swatch=el("span","cf-color");
    swatch.style.setProperty("--cf-swatch",color);
    swatch.setAttribute("aria-hidden","true");
    panel.appendChild(swatch);
    panel.appendChild(el("span",null,label+" · "+color));
    samples.appendChild(panel);
   }
   row.appendChild(samples);
   content.appendChild(row);
  }
  card.appendChild(content);
  $("cf-grid").appendChild(card);
 }
 $("cf-count").textContent=visible.length+
  " / 8 unverified historical groups · "+
  visible.reduce((n,g)=>n+g.members.length,0)+
  " source component identities compared";
}
async function load(){
 try{
  const paths=["mnemonic-group-counterfactual-v0.1.json",
   "palettes/mandarin-component-identity-v0.6.json",
   "semantic-group-color-pilot-v0.1.json"];
  const responses=await Promise.all(paths.map(x=>fetch(x)));
  if(responses.some(x=>!x.ok))throw Error("Source-pinned counterfactual resources unavailable");
  const [research,source,pilot]=await Promise.all(responses.map(x=>x.json()));
  if(research.schema!=="chromalect.palette.historical-hint-counterfactual.v0.1"||
     research.status!=="isolated_40_component_hue_grouping_hypothesis_not_a_palette_or_semantic_approval"||
     research.provenance.sourcePalette!=="mandarin-component-identity@0.6.0"||
     research.provenance.originalPaletteModified!==false||
     research.provenance.activeGlyphsRecolored!==false||
     research.provenance.independentLexicalClassification!==false||
     research.provenance.participantEvaluations!==0||
     research.summary.sourceIdentityColors!==520||
     research.summary.hypotheticalColorAssignments!==40||
     research.summary.proposedUniqueColors!==40||
     research.summary.unclassifiedComponentsExcluded!==480||
     research.summary.withinHintPairs!==88||
     research.summary.betweenHintPairs!==692||
     research.summary.approvedSemanticFamilies!==0||
     research.summary.validatedIdentityDiscriminability!==0||
     research.summary.actualHumanLearningOutcomes!==0||
     research.summary.smallestWithinDeltaOk>=0.02||
     research.summary.counterfactualMeanWithinDeltaOk>=0.05||
     research.summary.counterfactualMeanBetweenDeltaOk<=0.13||
     source.version!=="0.6.0"||source.components.length!==520||
     pilot.schema!=="chromalect.palette.mnemonic-hint-color-pilot.v0.1"||
     pilot.summary.pilotHintedComponents!==40||
     pilot.summary.unhintedComponents!==480||
     !Array.isArray(research.groups)||research.groups.length!==8)
   throw Error("Counterfactual source, scope or review status mismatch");
  const members=new Map(source.components.map(x=>[x.id,x]));
  const keys=new Set(),candidateColors=new Set();
  for(let i=0;i<8;i++){
   const g=research.groups[i],historical=pilot.groups[i];
   if(g.historicalHint!==groupsExpected[i]||
      g.groupMembershipStatus!=="unverified_historical_mnemonic_hint"||
      g.historicalHint!==historical.mnemonicHint||
      g.proposedHueDegrees!==20+45*i||
      g.sourceMemberCount!==historical.summary.members||
      g.members.length!==g.sourceMemberCount)
    throw Error("Counterfactual group membership altered");
   for(let j=0;j<g.members.length;j++){
    const m=g.members[j],p=members.get(m.componentId);
    if(!p||keys.has(m.componentId)||candidateColors.has(m.candidateHex)||
       m.componentId!==historical.sourceComponentIds[j]||
       m.sourceHex!==p.color||m.form!==p.shape||
       m.candidateStatus!=="hypothetical_group_color_not_production"||
       m.originalIdentityPreservedInActivePalette!==true||
       m.visuallyVerified!==false||m.semanticallyVerified!==false||
       p.mnemonic_group_hint!==g.historicalHint||
       !/^#[0-9A-F]{6}$/.test(m.candidateHex))
     throw Error("Candidate source color, identity or approval is invalid");
    keys.add(m.componentId);candidateColors.add(m.candidateHex);
   }
  }
  if(keys.size!==40||candidateColors.size!==40)
   throw Error("Group counterfactual is incomplete");
  groups=research.groups;
  $("cf-group").replaceChildren();
  for(const [value,label] of [["all","All 8 historical hints"],
   ...groupsExpected.map((x,i)=>[x,x.replaceAll("-"," ")+" ("+groups[i].members.length+")"])]){
   const opt=el("option",null,label);opt.value=value;$("cf-group").appendChild(opt);
  }
  $("cf-group").value="all";
  $("cf-summary").textContent=
   "Original palette mean within-group ΔOK "+
   research.summary.baselineMeanWithinDeltaOk.toFixed(4)+
   " / across-group "+research.summary.baselineMeanBetweenDeltaOk.toFixed(4)+
   " · hypothetical palette within-group "+research.summary.counterfactualMeanWithinDeltaOk.toFixed(4)+
   " / across-group "+research.summary.counterfactualMeanBetweenDeltaOk.toFixed(4)+
   ". Minimum within-group ΔOK "+research.summary.smallestWithinDeltaOk.toFixed(4)+
   " exposes a candidate identity-discrimination risk; zero validations.";
  $("cf-status").textContent="Original source hex assignments unchanged; all alternative samples confined to this experimental display.";
  display();
 }catch(error){
  groups=[];$("cf-grid").replaceChildren();
  $("cf-count").textContent="No valid controlled counterfactual";
  $("cf-status").textContent="Unable to validate isolated counterfactual: "+error.message;
 }
}
$("cf-group").addEventListener("change",display);
load();
})();