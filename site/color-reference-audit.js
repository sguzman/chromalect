// Uncertified reference luminance data only. Source v0.6 colors remain unchanged.
(() => {
"use strict";
const $=id=>document.getElementById(id);
const needed=["rc-filter","rc-sort","rc-query","rc-count","rc-summary","rc-status",
 "rc-list","rc-prev","rc-next"];
if(needed.some(id=>!$(id)))return;
const arithmetic=globalThis.ChromalectReferenceContrast;
if(!arithmetic||arithmetic.version!=="wcag22-srgb-reference-v0.1"){
 $("rc-status").textContent="Reference contrast arithmetic unavailable";return;
}
const node=(tag,cls,text)=>{
 const element=document.createElement(tag);
 if(cls)element.className=cls;
 if(text!==undefined)element.textContent=text;
 return element;
};
let rows=[],page=0;
const pageSize=60;
function show(){
 const query=$("rc-query").value.trim().toLowerCase();
 const filter=$("rc-filter").value,sort=$("rc-sort").value;
 if(!["all","white3","black3","white45","black45"].includes(filter)||
    !["id","white","black"].includes(sort))
  throw Error("Unsupported contrast audit filter");
 const found=rows.filter(r=>
  (filter==="all"||
   (filter==="white3"&&r.whiteBelow3)||
   (filter==="black3"&&r.blackBelow3)||
   (filter==="white45"&&r.whiteBelow4_5)||
   (filter==="black45"&&r.blackBelow4_5))&&
  (!query||r.componentId.toLowerCase().includes(query)||
   r.form.toLowerCase().includes(query)||r.sourceColor.toLowerCase().includes(query)||
   (r.groupHint||"").toLowerCase().includes(query)));
 const ordered=found.slice().sort((a,b)=>
  sort==="white"?a.whiteRatio-b.whiteRatio||a.componentId.localeCompare(b.componentId):
  sort==="black"?a.blackRatio-b.blackRatio||a.componentId.localeCompare(b.componentId):
  a.componentId.localeCompare(b.componentId));
 page=Math.min(page,Math.max(0,Math.ceil(ordered.length/pageSize)-1));
 const selection=ordered.slice(page*pageSize,(page+1)*pageSize);
 $("rc-list").replaceChildren();
 for(const r of selection){
  const card=node("article","rc-card"),heading=node("h2",null,r.componentId+" · "+r.form);
  card.appendChild(heading);
  const palette=node("div","rc-samples");
  for(const [name,ratio] of [["white",r.whiteRatio],["black",r.blackRatio]]){
   const background=node("div","rc-sample "+(name==="white"?"rc-on-white":"rc-on-black"));
   background.setAttribute("aria-label",
    "Original component color "+r.sourceColor+" on "+name+" reference background");
   const mark=node("span","rc-mark");
   mark.style.setProperty("--rc-color",r.sourceColor);
   mark.setAttribute("aria-hidden","true");
   background.appendChild(mark);
   palette.appendChild(background);
  }
  card.appendChild(palette);
  card.appendChild(node("p","rc-ratio","White "+r.whiteRatio.toFixed(2)+
   ":1 · Black "+r.blackRatio.toFixed(2)+":1 · "+r.sourceColor.toUpperCase()));
  card.appendChild(node("p","rc-meta",
   "Source "+r.sourceScope+
   (r.groupHint?" · mnemonic hint "+r.groupHint+" (not an approved semantic family)":"")+
   " · independent glyph review pending"));
  $("rc-list").appendChild(card);
 }
 $("rc-prev").disabled=page===0;
 $("rc-next").disabled=(page+1)*pageSize>=ordered.length;
 $("rc-count").textContent=found.length+" matching component identities · showing "+
  (selection.length?1+page*pageSize:0)+"–"+Math.min(ordered.length,(page+1)*pageSize)+
  " · zero certified visual results";
}
async function load(){
 try{
  const paths=["color-reference-contrast-v0.1.json",
   "palettes/mandarin-component-identity-v0.6.json"];
  const responses=await Promise.all(paths.map(p=>fetch(p)));
  if(responses.some(r=>!r.ok))throw Error("Original source palette or generated audit unavailable");
  const [report,source]=await Promise.all(responses.map(r=>r.json()));
  if(report.schema!=="chromalect.palette.reference-background-contrast.v0.1"||
     report.status!=="machine_srgb_reference_arithmetic_only_no_glyph_legibility_or_accessibility_approval"||
     report.source.palette!=="mandarin-component-identity@0.6.0"||
     report.source.sourcePaletteMutated!==false||
     report.summary.componentColors!==520||
     report.summary.whiteBelow3!==49||report.summary.blackBelow3!==69||
     report.summary.whiteBelow4_5!==264||report.summary.blackBelow4_5!==241||
     report.summary.independentlyVisuallyVerified!==0||
     report.summary.accessibilityCertifications!==0||
     report.summary.humanColorDiscriminationTrials!==0||
     source.id!=="mandarin-component-identity"||source.version!=="0.6.0"||
     source.coverage.total_component_identities!==520||
     !Array.isArray(source.components)||source.components.length!==520||
     !Array.isArray(report.records)||report.records.length!==520)
   throw Error("Unverified or source-inconsistent color-audit status");
  const seen=new Set();
  for(let i=0;i<520;i++){
   const r=report.records[i],c=source.components[i];
   if(!r||!c||seen.has(r.componentId)||r.componentId!==c.id||
      r.form!==c.shape||r.sourceColor!==c.color||
      r.sourceScope!==c.source_scope||
      r.groupHint!==(c.mnemonic_group_hint??null)||
      r.visualReview!=="pending"||r.accessibleGlyphCertified!==false||
      r.paletteColorChanged!==false)
    throw Error("Color identity, source record or approval state changed");
   seen.add(r.componentId);
   const exact=arithmetic.neutralRatios(r.sourceColor);
   if(Math.abs(r.whiteRatio-exact.white)>0.000001||
      Math.abs(r.blackRatio-exact.black)>0.000001||
      r.whiteBelow3!==(exact.white<3)||r.blackBelow3!==(exact.black<3)||
      r.whiteBelow4_5!==(exact.white<4.5)||
      r.blackBelow4_5!==(exact.black<4.5))
    throw Error("Reported color contrast does not match original sRGB");
  }
  rows=report.records;
  $("rc-summary").textContent="520 immutable v0.6 component identities · "+
   "49 below 3:1 on white · 69 below 3:1 on black · "+
   "264 below 4.5:1 on white · 241 below 4.5:1 on black. "+
   "These are reference-color cohorts, not conformance decisions.";
  $("rc-status").textContent="All 520 original source colors and ratios cross-checked.";
  show();
 }catch(error){
  rows=[];$("rc-list").replaceChildren();
  $("rc-count").textContent="No validated color reference results";
  $("rc-status").textContent="Unable to verify palette reference data: "+error.message;
 }
}
for(const id of ["rc-filter","rc-sort","rc-query"])
 $(id).addEventListener(id==="rc-query"?"input":"change",()=>{page=0;show();});
$("rc-prev").addEventListener("click",()=>{if(page>0){page--;show();}});
$("rc-next").addEventListener("click",()=>{page++;show();});
load();
})();