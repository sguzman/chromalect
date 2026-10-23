// Published build-derived glyph review triage. No independent approvals or silent promotions.
(() => {
"use strict";
const $=id=>document.getElementById(id);
const ids=["audit-tier","audit-query","audit-results","audit-count","audit-status","audit-summary"];
if(ids.some(id=>!$(id)))return;
const allowed=["automatic_geometry_flag","documented_source_alternative",
 "secondary_chinese_source","subglyph_geometry_reconciliation",
 "standard_multicomponent","atomic_or_single_component"];
const titles={
 automatic_geometry_flag:"Automatic geometry or color warning",
 documented_source_alternative:"Documented source alternative",
 secondary_chinese_source:"Secondary Chinese-source reconciliation",
 subglyph_geometry_reconciliation:"Subglyph geometry correspondence",
 standard_multicomponent:"Direct multicomponent source",
 atomic_or_single_component:"Atomic or one-component source"
};
let records=[];
function draw(){
 const tier=$("audit-tier").value;
 const q=$("audit-query").value.trim().toLowerCase();
 if(tier!=="all"&&!allowed.includes(tier))throw Error("Unknown review tier");
 const shown=records.filter(r=>(tier==="all"||r.reviewTier===tier)&&
  (!q||r.character.includes(q)||String(r.rank)===q||r.decomposition.includes(q)||
   r.componentIds.some(id=>id.includes(q))||r.sourceAlignmentMethod.includes(q)||
   r.automaticGeometryFlags.some(x=>x.includes(q))));
 const limit=48;
 $("audit-results").replaceChildren();
 for(const r of shown.slice(0,limit)){
  const card=document.createElement("article"),head=document.createElement("h2"),
   comparison=document.createElement("div"),native=document.createElement("div"),
   source=document.createElement("div"),glyph=document.createElement("span"),
   image=document.createElement("img"),left=document.createElement("span"),
   right=document.createElement("span"),meta=document.createElement("p"),
   flags=document.createElement("p"),link=document.createElement("a");
  card.className="audit-card";comparison.className="audit-compare";
  head.textContent="#"+r.rank+" · "+r.character+" · "+titles[r.reviewTier];
  glyph.className="audit-native";glyph.textContent=r.character;glyph.lang="zh-Hans";
  image.src="glyphs/"+r.svg;image.alt="Source-aligned SVG for "+r.character;
  image.loading="lazy";image.width=105;image.height=105;
  native.appendChild(glyph);left.textContent="Native glyph";native.appendChild(left);
  source.appendChild(image);right.textContent="Colored source SVG";source.appendChild(right);
  comparison.appendChild(native);comparison.appendChild(source);
  meta.className="audit-meta";
  meta.textContent="Source: "+r.sourceAlignmentMethod+" · "+r.strokeCount+
   " path owners · "+r.componentIds.length+" component identities";
  flags.className="audit-meta";
  flags.textContent=r.automaticGeometryFlags.length?
   "Machine warnings: "+r.automaticGeometryFlags.join(", "):
   "No machine geometry warning; still awaiting independent review";
  link.href="glyphs/"+r.svg;link.textContent="Inspect source SVG";
  card.appendChild(head);card.appendChild(comparison);card.appendChild(meta);
  card.appendChild(flags);card.appendChild(link);
  $("audit-results").appendChild(card);
 }
 $("audit-count").textContent=shown.length+" matching of 1,000 pending reviews · showing "+
  Math.min(shown.length,limit)+" · zero certified";
}
async function load(){
 try{
  const response=await fetch("glyphs/review/independent-review-worklist-v0.1.json");
  if(!response.ok)throw Error("No final source-backed review index");
  const d=await response.json();
  if(d.schema!=="chromalect.glyph-independent-review-worklist.v0.1"||
     d.status!=="build_derived_source_review_priority_not_independent_visual_certification"||
     d.provenance.paletteVersion!=="mandarin-component-identity@0.6.0"||
     d.summary.catalogCharacters!==1000||d.summary.mappedSourceGlyphs!==1000||
     d.summary.independentlyVisuallyCertified!==0||
     d.summary.independentlyLinguisticallyCertified!==0||
     d.summary.eligibleLearningStudyItems!==0||
     !Array.isArray(d.records)||d.records.length!==1000||
     allowed.reduce((n,k)=>n+d.summary.reviewTiers[k],0)!==1000)
   throw Error("Unrecognized research data or certification status");
  const seen=new Set(),ranks=new Set(),counts=Object.fromEntries(allowed.map(k=>[k,0]));
  for(const r of d.records){
   if(seen.has(r.character)||ranks.has(r.rank)||!Number.isInteger(r.rank)||
     r.rank<1||r.rank>1000||!allowed.includes(r.reviewTier)||
     !Number.isInteger(r.reviewPriority)||r.reviewPriority!==allowed.indexOf(r.reviewTier)||
     r.independentVisualReview!=="pending"||
     r.independentLinguisticReview!=="pending"||
     r.eligibleForLearningStudy!==false||
     !/^[^/\\]+\.svg$/u.test(r.svg)||
     !Array.isArray(r.componentIds)||!r.componentIds.length||
     !Array.isArray(r.automaticGeometryFlags))
    throw Error("Unverified glyph review record or duplicate source identity");
   seen.add(r.character);ranks.add(r.rank);counts[r.reviewTier]++;
  }
  if(allowed.some(k=>counts[k]!==d.summary.reviewTiers[k]))
   throw Error("Review priority counts do not match individual source rows");
  records=d.records;
  $("audit-summary").textContent="Source-aligned glyphs: 1,000/1,000. Machine-flagged: "+
   d.summary.reviewTiers.automatic_geometry_flag+". Independent visual approvals: zero.";
  $("audit-tier").replaceChildren();
  const options=[["all","All review priorities"],...allowed.map(k=>[k,titles[k]])];
  for(const [value,label] of options){const o=document.createElement("option");
   o.value=value;o.textContent=label+" ("+(value==="all"?1000:counts[value])+")";
   $("audit-tier").appendChild(o);}
  $("audit-tier").value="all";
  $("audit-status").textContent="Final build source identity and pending-review evidence verified.";
  draw();
 }catch(e){records=[];$("audit-results").replaceChildren();
  $("audit-count").textContent="No source-verified review records";
  $("audit-status").textContent="Unable to validate worklist: "+e.message;}
}
$("audit-tier").addEventListener("change",draw);
$("audit-query").addEventListener("input",draw);
load();
})();