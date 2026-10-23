import assert from "node:assert/strict";
import fs from "node:fs";
import {deriveGlyphPairRisk} from "./glyph_counterfactual_pair_risk.mjs";
const palette=JSON.parse(fs.readFileSync("palettes/mandarin-component-identity-v0.6.json","utf8"));
const changed=palette.components[0],unhinted=palette.components.find(c=>c.id==="cmp-0240");
assert.ok(changed.mnemonic_group_hint!==null);
assert.equal(unhinted.mnemonic_group_hint,null);
const part=c=>({component_id:c.id,form:c.shape,hex:c.color});
const catalog={schema:"chromalect.character-tranche.v1",tranche:"0001-1000",
 characters:[{rank:1,character:"一"},{rank:2,character:"二"}]};
const source={schema:"chromalect.component-stroke-mappings.v1",
 palette_ref:"mandarin-component-identity@0.6.0",
 glyph_count:3,glyphs:[
  {character:"一",independently_visually_certified:false,
   components:[part(changed),part(unhinted),part(changed)],
   source_path_owner_ids:[changed.id,unhinted.id,changed.id]},
  {character:"二",independently_visually_certified:false,
   components:[part(unhinted)],source_path_owner_ids:[unhinted.id]},
  {character:"三",independently_visually_certified:false,
   components:[part(unhinted)],source_path_owner_ids:[unhinted.id]}
 ]};
const experiment={
 schema:"chromalect.glyph.historical-hint-counterfactual-gallery.v0.1",
 status:"build_generated_isolated_research_svg_recolor_only_no_semantic_or_visual_approval",
 provenance:{activeGlyphFilesOverwritten:false,semanticFamilyApprovals:0},
 summary:{catalogGlyphs:2,hypotheticalComponentIds:40,affectedGlyphs:1},
 glyphs:[{rank:1,character:"一",changedComponentIds:[changed.id],
  sourcePathsIdentical:true,componentOwnerSequenceIdentical:true,
  activePaletteUntouched:true,originalSVG:"glyphs/U+4E00.svg",
  hypotheticalSVG:"glyphs/research/hint-counterfactual-v0.1/U+4E00.svg"}]
};
const review={
 schema:"chromalect.glyph-independent-review-worklist.v0.1",
 status:"build_derived_source_review_priority_not_independent_visual_certification",
 summary:{catalogCharacters:2,independentlyVisuallyCertified:0,colorContrastWarningPairs:0},
 records:[{rank:1,character:"一",closeColorPairs:0,colorContrastWarnings:[]},
  {rank:2,character:"二",closeColorPairs:0,colorContrastWarnings:[]}]
};
const params={expectedGlyphCount:2,expectedSourceClosePairs:0};
const run=(a=catalog,b=source,c=palette,d=experiment,e=review)=>
 deriveGlyphPairRisk(a,b,c,d,e,params);
const result=run();
assert.deepEqual(run(),result);
assert.equal(result.summary.catalogCharacters,2);
assert.equal(result.summary.affectedGlyphs,1);
assert.equal(result.summary.sourceUniqueComponentPairs,1);
assert.equal(result.summary.originalClosePairs,0);
assert.equal(result.summary.proposedClosePairs,1);
assert.equal(result.summary.newlyClosePairs,1);
assert.equal(result.summary.affectedGlyphsWithNewClosePairs,1);
assert.equal(result.summary.worsenedPairDistances,1);
assert.equal(result.summary.unchangedPairDistances,0);
assert.equal(result.glyphs.length,1);
assert.equal(result.glyphs[0].reviewPairs.length,1);
assert.equal(result.glyphs[0].reviewPairs[0].state,"introduced");
assert.ok(result.glyphs[0].reviewPairs[0].originalDeltaOk>0.2);
assert.ok(result.glyphs[0].reviewPairs[0].candidateDeltaOk<0.07);
assert.equal(result.glyphs[0].visualJudgment,"pending");
assert.equal(result.summary.humanLegibilityTrials,0);
assert.equal(result.summary.independentlyAcceptedSemanticFamilies,0);
for(const change of [
 (a,b,c,d,e)=>{b.glyphs[0].components[0].hex="#000000";},
 (a,b,c,d,e)=>{b.glyphs[0].components[2].hex="#000000";},
 (a,b,c,d,e)=>{b.glyphs[0].source_path_owner_ids[0]="cmp-0999";},
 (a,b,c,d,e)=>{b.glyphs[0].independently_visually_certified=true;},
 (a,b,c,d,e)=>{d.summary.affectedGlyphs=0;},
 (a,b,c,d,e)=>{d.glyphs[0].changedComponentIds=["cmp-0240"];},
 (a,b,c,d,e)=>{d.glyphs[0].sourcePathsIdentical=false;},
 (a,b,c,d,e)=>{e.records[0].closeColorPairs=1;},
 (a,b,c,d,e)=>{e.records[0].colorContrastWarnings.push({
    componentA:{id:"cmp-0001"},componentB:{id:"cmp-0240"}});},
 (a,b,c,d,e)=>{e.summary.independentlyVisuallyCertified=1;},
 (a,b,c,d,e)=>{a.characters[0].rank=2;},
 (a,b,c,d,e)=>{c.version="0.7.0";},
 (a,b,c,d,e)=>{b.glyphs[1].components.push(part(changed));},
 ]){
 const xs=[catalog,source,palette,experiment,review].map(structuredClone);
 change(...xs);assert.throws(()=>run(...xs));
}
console.log("Two source ranks, repeated owner identity, introduced same-glyph color collision and 13 rejections verified.");
