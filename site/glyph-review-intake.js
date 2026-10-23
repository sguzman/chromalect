// Local-only independent glyph review notes. Source-linked hypotheses, not certifications.
(() => {
"use strict";
const $=id=>document.getElementById(id);
const ids=["inspection-target","inspection-native","inspection-svg","inspection-source",
 "inspection-tier","inspection-flags","inspection-geometry","inspection-ownership",
 "inspection-contrast","inspection-evidence","inspection-rationale",
 "inspection-save","inspection-export","inspection-output","inspection-status","inspection-count"];
if(ids.some(id=>!$(id)))return;
const requiredStatus="build_derived_source_review_priority_not_independent_visual_certification";
const tiers=["automatic_geometry_flag","documented_source_alternative",
 "secondary_chinese_source","subglyph_geometry_reconciliation",
 "standard_multicomponent","atomic_or_single_component"];
const assessments=["undetermined","preliminary_support","preliminary_concern"];
const fields=["geometry","ownership","contrast","referenceURL","technicalRationale"];
const controlIds=["inspection-geometry","inspection-ownership","inspection-contrast",
 "inspection-evidence","inspection-rationale"];
const defaults=()=>({geometry:"undetermined",ownership:"undetermined",
 contrast:"undetermined",referenceURL:"",technicalRationale:""});
let records=[],selected=null,palette="",drafts=new Map();
function status(message){$("inspection-status").textContent=message;}
function form(){return Object.fromEntries(controlIds.map((name,i)=>[fields[i],$(name).value.trim()]));}
function save(){
 if(!selected)throw Error("No source glyph is selected");
 const data=form();
 if(![data.geometry,data.ownership,data.contrast].every(x=>assessments.includes(x)))
  throw Error("Unrecognized provisional assessment state");
 const changed=fields.some(name=>data[name]!==defaults()[name]);
 if(!changed){drafts.delete(selected.rank);return;}
 const evaluated=[data.geometry,data.ownership,data.contrast].some(x=>x!=="undetermined");
 if(evaluated&&data.technicalRationale.length<30)
  throw Error("A provisional assessment needs at least 30 characters of rationale");
 if(evaluated&&!data.referenceURL)
  throw Error("A provisional assessment needs a separate HTTPS evidence reference");
 if(data.referenceURL){
  const url=new URL(data.referenceURL);
  if(url.protocol!=="https:"||url.username||url.password||url.hash)
   throw Error("Evidence reference must be a plain HTTPS URL without a fragment or credentials");
 }
 if(data.technicalRationale.length>3000)throw Error("Rationale exceeds 3,000 characters");
 drafts.set(selected.rank,data);
 $("inspection-count").textContent=drafts.size+" local drafts · 0 certified";
}
function select(index){
 selected=records.find(r=>r.rank===Number(index))??null;
 if(!selected)throw Error("Requested source glyph not available");
 const values=drafts.get(selected.rank)||defaults();
 controlIds.forEach((id,i)=>{$(id).value=values[fields[i]];});
 $("inspection-native").textContent=selected.character;
 $("inspection-svg").src="glyphs/"+selected.svg;
 $("inspection-svg").alt="Source-aligned component-colored SVG for "+selected.character;
 $("inspection-source").textContent="Rank "+selected.rank+" · "+selected.character+
  " · "+selected.decomposition+" · "+selected.strokeCount+" source path owners · "+
  selected.componentIds.join(", ");
 $("inspection-tier").textContent="Review tier: "+selected.reviewTier+
  " · source assignment: "+selected.sourceAlignmentMethod+
  " · no independently certified geometry";
 $("inspection-flags").textContent=selected.automaticGeometryFlags.length?
  "Machine review hints: "+selected.automaticGeometryFlags.join(", ")+
  " · "+selected.closeColorPairs+" close color pairs":
  "No automatic geometry warning; independent inspection still required";
 $("inspection-count").textContent=drafts.size+" local drafts · 0 certified";
}
function exportData(){
 save();
 if(!drafts.size)throw Error("Record a source-linked observation before exporting");
 return {schema:"chromalect.glyph.review-local-observations.v0.1",
  status:"provisional_visual_and_source_ownership_observations_not_certification",
  source:{worklist:"glyphs/review/independent-review-worklist-v0.1.json",
   worklistSchema:"chromalect.glyph-independent-review-worklist.v0.1",
   paletteVersion:palette,sourceSVGTextCopied:false,
   sourceGeometryCopied:false,sourceIndependentCertificates:0},
  session:{locallyGenerated:true,exportedAtUTC:new Date().toISOString(),
   recorded:drafts.size,independentCertificationsAwarded:0},
  observations:records.filter(r=>drafts.has(r.rank)).map(r=>({
   rank:r.rank,character:r.character,svg:r.svg,
   decomposition:r.decomposition,componentIds:r.componentIds,
   sourceAlignmentMethod:r.sourceAlignmentMethod,strokeCount:r.strokeCount,
   sourceReviewTier:r.reviewTier,visualReviewCertified:false,
   linguisticReviewCertified:false,studyEligibilityApproved:false,...drafts.get(r.rank)}))};
}
async function load(){
 try{
  const response=await fetch("glyphs/review/independent-review-worklist-v0.1.json");
  if(!response.ok)throw Error("Final source mapping review worklist unavailable");
  const d=await response.json();
  if(d.schema!=="chromalect.glyph-independent-review-worklist.v0.1"||
     d.status!==requiredStatus||
     d.summary.catalogCharacters!==1000||d.summary.mappedSourceGlyphs!==1000||
     d.summary.independentlyVisuallyCertified!==0||
     d.summary.independentlyLinguisticallyCertified!==0||
     d.summary.eligibleLearningStudyItems!==0||
     d.provenance.paletteVersion!=="mandarin-component-identity@0.6.0"||
     !Array.isArray(d.records)||d.records.length!==1000||
     tiers.some(x=>!Number.isInteger(d.summary.reviewTiers[x]))||
     tiers.reduce((n,x)=>n+d.summary.reviewTiers[x],0)!==1000)
   throw Error("Glyph inspection source provenance or approval status mismatch");
  palette=d.provenance.paletteVersion;
  const seen=new Set(),counts=Object.fromEntries(tiers.map(x=>[x,0]));
  for(const r of d.records){
   if(seen.has(r.rank)||!Number.isInteger(r.rank)||r.rank<1||r.rank>1000||
      typeof r.character!=="string"||[...r.character].length!==1||
      !/^[^/\\]+\.svg$/u.test(r.svg)||
      !Array.isArray(r.componentIds)||!r.componentIds.length||
      !tiers.includes(r.reviewTier)||r.reviewPriority!==tiers.indexOf(r.reviewTier)||
      r.independentVisualReview!=="pending"||
      r.independentLinguisticReview!=="pending"||
      r.eligibleForLearningStudy!==false)
    throw Error("Unrecognized or approved source glyph review record");
   seen.add(r.rank);counts[r.reviewTier]++;
  }
  if(seen.size!==1000||tiers.some(x=>counts[x]!==d.summary.reviewTiers[x]))
   throw Error("Incomplete priority cohort");
  records=d.records;
  $("inspection-target").replaceChildren();
  for(const r of records){
   const o=document.createElement("option");o.value=String(r.rank);
   o.textContent="#"+r.rank+" · "+r.character+" · "+r.reviewTier.replace(/_/g," ");
   $("inspection-target").appendChild(o);
  }
  $("inspection-target").value=String(records[0].rank);
  select(records[0].rank);
  status("Source-pinned review intake loaded. Notes stay in this page until exported.");
 }catch(e){records=[];selected=null;status("Unable to validate independent review worklist: "+e.message);}
}
$("inspection-target").addEventListener("change",()=>{
 try{if(selected)save();select($("inspection-target").value);status("Local-only preliminary review.");}
 catch(e){$("inspection-target").value=selected?String(selected.rank):"";
  status("Draft not saved: "+e.message);}
});
$("inspection-save").addEventListener("click",()=>{
 try{save();status("Local draft recorded. No published source or approval changed.");}
 catch(e){status("Draft not saved: "+e.message);}
});
$("inspection-export").addEventListener("click",()=>{
 try{$("inspection-output").value=JSON.stringify(exportData(),null,2)+"\n";
  status("Provisional JSON prepared locally. Validate separately before any research record review.");}
 catch(e){$("inspection-output").value="";status("Cannot export: "+e.message);}
});
load();
})();