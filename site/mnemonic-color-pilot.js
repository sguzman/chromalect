// Original 40 mnemonic-hint colors; category labels and distances are research only.
(() => {
"use strict";
const $=id=>document.getElementById(id);
const needed=["mg-filter","mg-status","mg-summary","mg-count","mg-list"];
if(needed.some(id=>!$(id)))return;
const el=(tag,cls,value)=>{
 const e=document.createElement(tag);
 if(cls)e.className=cls;
 if(value!==undefined)e.textContent=value;
 return e;
};
const expectedHints=[
 ["human-body",8],["movement-space",6],["speech-senses",5],
 ["earth-material",5],["structural-series",5],["water-fluid",4],
 ["heat-light",4],["plant-growth",3]
];
let groups=[];
function pairLabel(pair,members){
 const a=members.get(pair.a),b=members.get(pair.b);
 const outer=el("div","mg-pair");
 for(const c of [a,b]){
  const part=el("span","mg-member");
  const swatch=el("span","mg-swatch");
  swatch.style.setProperty("--group-color",c.hex);
  swatch.setAttribute("aria-hidden","true");
  part.appendChild(swatch);
  part.appendChild(el("span",null,c.id+" "+c.form));
  outer.appendChild(part);
 }
 outer.appendChild(el("span","mg-distance","ΔOK "+pair.deltaOk.toFixed(4)));
 return outer;
}
function show(){
 const filter=$("mg-filter").value;
 if(filter!=="all"&&!expectedHints.some(([name])=>name===filter))
  throw Error("Unknown unapproved hint group");
 const chosen=groups.filter(x=>filter==="all"||x.mnemonicHint===filter);
 $("mg-list").replaceChildren();
 for(const group of chosen){
  const card=el("article","mg-card");
  card.appendChild(el("h2",null,group.mnemonicHint.replaceAll("-"," ")));
  card.appendChild(el("p","mg-meta",group.summary.members+
   " source components · "+group.summary.pairs+" within-hint pair distances · "+
   "mean ΔOK "+group.summary.meanDeltaOk.toFixed(4)+
   " · min "+group.summary.minimumDeltaOk.toFixed(4)+
   " · max "+group.summary.maximumDeltaOk.toFixed(4)));
  const colors=el("div","mg-members");
  const map=new Map();
  for(const part of group.componentColors){
   map.set(part.id,part);
   const item=el("span","mg-member");
   const swatch=el("span","mg-swatch");
   swatch.style.setProperty("--group-color",part.hex);
   swatch.setAttribute("aria-hidden","true");
   item.appendChild(swatch);
   item.appendChild(el("span",null,part.id+" · "+part.form+" · "+part.hex.toUpperCase()));
   colors.appendChild(item);
  }
  card.appendChild(colors);
  const details=el("details","mg-details");
  details.appendChild(el("summary",null,"Inspect all "+group.withinPairs.length+" within-hint pairs"));
  const sorted=group.withinPairs.slice().sort((a,b)=>a.deltaOk-b.deltaOk||a.a.localeCompare(b.a));
  for(const pair of sorted)details.appendChild(pairLabel(pair,map));
  card.appendChild(details);
  card.appendChild(el("p","mg-meta",
   "Mnemonic hints are provisional; no semantic-family or color-comprehension approval."));
  $("mg-list").appendChild(card);
 }
 $("mg-count").textContent=chosen.length+" / 8 unapproved original mnemonic hint groups · "+
  chosen.reduce((n,g)=>n+g.summary.members,0)+" component identities displayed";
}
async function load(){
 try{
  const urls=["semantic-group-color-pilot-v0.1.json",
   "palettes/mandarin-component-identity-v0.6.json"];
  const responses=await Promise.all(urls.map(u=>fetch(u)));
  if(responses.some(x=>!x.ok))throw Error("Published pilot or palette unavailable");
  const [study,palette]=await Promise.all(responses.map(r=>r.json()));
  if(study.schema!=="chromalect.palette.mnemonic-hint-color-pilot.v0.1"||
     study.status!=="pilot_hint_color_distance_measurement_not_verified_semantic_families"||
     study.provenance.palette!=="mandarin-component-identity@0.6.0"||
     study.provenance.paletteRecolored!==false||
     study.provenance.componentIdentityReassigned!==false||
     study.summary.sourceComponentColors!==520||
     study.summary.pilotHintedComponents!==40||
     study.summary.unhintedComponents!==480||
     study.summary.provisionalMnemonicHintGroups!==8||
     study.summary.withinHintPairs!==88||
     study.summary.betweenHintPairs!==692||
     study.summary.independentlyApprovedSemanticFamilies!==0||
     study.summary.humanColorOrSemanticComprehensionTrials!==0||
     !Array.isArray(study.groups)||study.groups.length!==8||
     palette.id!=="mandarin-component-identity"||
     palette.version!=="0.6.0"||
     palette.components.length!==520)
   throw Error("Source-group evidence or research approval status changed");
  const paletteIDs=new Map(palette.components.map(c=>[c.id,c]));
  let expectedTotal=0,pairs=0;
  const seen=new Set();
  for(let i=0;i<8;i++){
   const g=study.groups[i],hint=expectedHints[i][0],n=expectedHints[i][1];
   if(g.mnemonicHint!==hint||g.summary.members!==n||
      g.status!=="unverified_pilot_mnemonic_hint_not_lexical_or_semantic_family"||
      g.semanticEvidenceApproved!==false||
      g.semanticFamilyColorSchemeApproved!==false||
      g.sourceComponentIds.length!==n||g.componentColors.length!==n||
      g.withinPairs.length!==n*(n-1)/2||
      g.summary.pairs!==g.withinPairs.length||
      g.summary.minimumDeltaOk>g.summary.maximumDeltaOk)
    throw Error("Mnemonic hint group is not the same unverified source cohort");
   for(let j=0;j<n;j++){
    const c=g.componentColors[j],source=paletteIDs.get(c.id);
    if(!source||seen.has(c.id)||g.sourceComponentIds[j]!==c.id||
       source.color!==c.hex||source.shape!==c.form||
       source.mnemonic_group_hint!==hint)
     throw Error("Palette identity or mnemonic membership was replaced");
    seen.add(c.id);
   }
   for(const pair of g.withinPairs){
    if(!Number.isFinite(pair.deltaOk)||pair.deltaOk<0||pair.deltaOk>1||
       pair.a===pair.b||!g.sourceComponentIds.includes(pair.a)||
       !g.sourceComponentIds.includes(pair.b))
     throw Error("Invalid unreviewed OKLab sample");
   }
   expectedTotal+=n;pairs+=g.withinPairs.length;
  }
  if(expectedTotal!==40||pairs!==88||
     palette.components.filter(x=>x.mnemonic_group_hint!==null).length!==40)
   throw Error("Pilot cohort is not source complete");
  groups=study.groups;
  $("mg-filter").replaceChildren();
  for(const [value,label] of [["all","All eight hints"],...expectedHints.map(([id,n])=>[id,id.replaceAll("-"," ")+" ("+n+")"])]){
   const option=el("option",null,label);option.value=value;
   $("mg-filter").appendChild(option);
  }
  $("mg-filter").value="all";
  $("mg-summary").textContent="40 source-pinned, unapproved mnemonic hints · "+
   "480 identities have no hint · 88 same-hint pairs · 692 different-hint pairs · "+
   "mean same-hint ΔOK "+study.summary.meanWithinHintDeltaOk.toFixed(4)+
   " · mean different-hint ΔOK "+study.summary.meanBetweenHintDeltaOk.toFixed(4)+
   ". No proposed semantic grouping is verified.";
  $("mg-status").textContent="Eight historical pilot hints and original palette colors verified.";
  show();
 }catch(error){
  groups=[];$("mg-list").replaceChildren();
  $("mg-count").textContent="No verified source hint samples";
  $("mg-status").textContent="Unable to validate pilot-group measurements: "+error.message;
 }
}
$("mg-filter").addEventListener("change",show);
load();
})();