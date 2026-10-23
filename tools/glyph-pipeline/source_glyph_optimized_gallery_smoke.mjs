import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import fs from "node:fs";
import {derivePilotGroupCounterfactual} from "./pilot_group_counterfactual.mjs";
import {deriveOptimizedGlyphGallery} from "./source_glyph_optimized_gallery.mjs";
const palette=JSON.parse(fs.readFileSync("palettes/mandarin-component-identity-v0.6.json","utf8"));
const first=derivePilotGroupCounterfactual(palette);
const chosen=first.groups[0].members[0],other=palette.components[40];
const proposal={
 schema:"chromalect.palette.source-cooccurrence-hue-optimizer.v0.2",
 status:"in_sample_40_component_optimization_research_only_no_semantic_or_visual_approval",
 provenance:{researchOnly:true,activeSourcePaletteMutated:false,
  heldOutGlyphsEvaluated:0,semanticMembershipsApproved:0},
 summary:{alteredHypotheticalIDs:40},
 groups:first.groups.map(group=>({members:group.members.map(m=>({
  componentId:m.componentId,form:m.form,sourceHex:m.sourceHex,
  firstTrialHex:m.candidateHex,
  optimizedTrialHex:m.componentId===chosen.componentId?"#000000":m.candidateHex,
  groupMembershipApproval:"unverified_historical_mnemonic_hint",
  visuallyDiscriminable:"unverified",semanticFamilyVerified:false
 }))}))
};
const wrap=(a,b)=>'<svg viewBox="0 0 1024 1024">'+
 '<path d="M 0 0 L 30 30 Z" fill="'+a+'" data-component="'+chosen.componentId+'"/>'+
 '<path d="M 10 10 L 70 70 Z" fill="'+b+'" data-component="'+other.id+'"/></svg>';
const sourceSVG=wrap(chosen.sourceHex,other.color);
const firstSVG=wrap(chosen.candidateHex,other.color);
const sha=s=>createHash("sha256").update(s,"utf8").digest("hex");
const index={
 schema:"chromalect.glyph.historical-hint-counterfactual-gallery.v0.1",
 status:"build_generated_isolated_research_svg_recolor_only_no_semantic_or_visual_approval",
 provenance:{activeGlyphFilesOverwritten:false,strokePathsChanged:false,
  ownerMappingsChanged:false,independentlyApprovedVisuals:0,semanticFamilyApprovals:0},
 summary:{catalogGlyphs:2,affectedGlyphs:1,hypotheticalComponentIds:40,
  alteredSourcePathFills:1,unchangedSourcePathFillsInAffectedGlyphs:1},
 glyphs:[{rank:1,character:"一",originalSVG:"glyphs/U+4E00.svg",
  hypotheticalSVG:"glyphs/research/hint-counterfactual-v0.1/U+4E00.svg",
  sourceGeometrySHA256:sha(sourceSVG),candidateGeometrySHA256:sha(firstSVG),
  modifiedSourcePathFills:1,unchangedSourcePathFills:1,
  sourcePathsIdentical:true,componentOwnerSequenceIdentical:true,
  activePaletteUntouched:true,independentGlyphValidation:"pending"}]
};
const run=(p=palette,f=index,o=proposal,a=sourceSVG,b=firstSVG)=>
 deriveOptimizedGlyphGallery(p,f,o,()=>a,()=>b,{expectedGlyphCount:2});
const {manifest,files}=run();
assert.deepEqual(run(),{manifest,files});
assert.equal(manifest.summary.firstTrialAffectedGlyphs,1);
assert.equal(manifest.summary.optimizedGalleryGlyphs,1);
assert.equal(manifest.summary.optimizedImagesDifferentFromFirst,1);
assert.equal(manifest.summary.unchangedImagesFromFirst,0);
assert.equal(manifest.summary.fillsChangedFromFirst,1);
assert.equal(manifest.summary.firstStageHypotheticalFillsRetained,0);
assert.equal(manifest.summary.sourceUnhintedFillsPreserved,1);
assert.equal(manifest.provenance.sourceSVGOverwritten,false);
assert.equal(manifest.provenance.firstTrialSVGOverwritten,false);
assert.equal(manifest.provenance.sourceGeometryModified,false);
assert.equal(manifest.provenance.sourceOwnershipModified,false);
assert.equal(manifest.provenance.palettePromoted,false);
assert.equal(manifest.provenance.independentVisualCertifications,0);
assert.equal(manifest.provenance.independentSemanticApprovals,0);
assert.equal(manifest.summary.semanticFamiliesApproved,0);
assert.equal(manifest.glyphs[0].visualReview,"pending");
assert.equal(manifest.glyphs[0].semanticReview,"unapproved");
const output=files.get("U+4E00.svg");
assert.ok(output.includes('fill="#000000" data-component="'+chosen.componentId+'"'));
assert.ok(output.includes('fill="'+other.color+'" data-component="'+other.id+'"'));
assert.equal(manifest.glyphs[0].optimizedSHA256,sha(output));
assert.equal(manifest.glyphs[0].changedComponentIdsFromFirst.length,1);
assert.equal(manifest.glyphs[0].sourcePaths,2);
for(const modify of [
 (p,f,o,a,b)=>{p.version="0.7.0";},
 (p,f,o,a,b)=>{p.components[0].color="#000000";},
 (p,f,o,a,b)=>{f.provenance.activeGlyphFilesOverwritten=true;},
 (p,f,o,a,b)=>{f.glyphs[0].sourceGeometrySHA256="0".repeat(64);},
 (p,f,o,a,b)=>{f.glyphs[0].independentGlyphValidation="approved";},
 (p,f,o,a,b)=>{f.glyphs[0].modifiedSourcePathFills=0;},
 (p,f,o,a,b)=>{o.provenance.semanticMembershipsApproved=1;},
 (p,f,o,a,b)=>{o.groups[0].members[0].visuallyDiscriminable="approved";},
 (p,f,o,a,b)=>{o.groups[0].members[0].sourceHex="#ffffff";},
 (p,f,o,a,b)=>{a=a.replace("M 0 0","M 1 0");return [a,b];},
 (p,f,o,a,b)=>{b=b.replace("M 0 0","M 1 0");return [a,b];}
]){
 const [p,f,o]=[palette,index,proposal].map(x=>structuredClone(x));
 const pair=modify(p,f,o,sourceSVG,firstSVG);
 assert.throws(()=>run(p,f,o,...(pair??[sourceSVG,firstSVG])));
}
console.log("Optimized source-identical SVG isolate with source+first checksums, preserved unhinted owner, 11 invalid source/approval states.");
