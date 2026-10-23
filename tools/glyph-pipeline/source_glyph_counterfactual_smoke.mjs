import assert from "node:assert/strict";
import fs from "node:fs";
import {deriveSourceGlyphCounterfactual} from "./source_glyph_counterfactual.mjs";
const palette=JSON.parse(fs.readFileSync(
 "palettes/mandarin-component-identity-v0.6.json","utf8"));
const first=palette.components[0],unhinted=palette.components[40];
assert.equal(first.id,"cmp-0001");
assert.equal(unhinted.mnemonic_group_hint,null);
const catalog={schema:"chromalect.character-tranche.v1",characters:[
 {rank:1,character:"一"},{rank:2,character:"二"}
]};
const component=c=>({form:c.shape,component_id:c.id,hex:c.color});
const manifest={
 schema:"chromalect.component-stroke-mappings.v1",
 palette_ref:"mandarin-component-identity@0.6.0",
 glyph_count:3,
 glyphs:[
  {character:"一",svg:"U+4E00.svg",unicode_codepoint:"U+4E00",
   independently_visually_certified:false,
   components:[component(first),component(unhinted)],
   source_path_owner_ids:[first.id,unhinted.id]},
  {character:"二",svg:"U+4E8C.svg",unicode_codepoint:"U+4E8C",
   independently_visually_certified:false,
   components:[component(unhinted)],
   source_path_owner_ids:[unhinted.id]},
  {character:"三",svg:"U+4E09.svg",unicode_codepoint:"U+4E09",
   independently_visually_certified:false,
   components:[component(unhinted)],
   source_path_owner_ids:[unhinted.id]}
 ]};
const shape=(data)=>'<svg viewBox="0 0 1024 1024"><g transform="translate(0,0)">'+
 data.map((c,i)=>'<path d="M '+(i*2)+' 0 L 10 20 Z" fill="'+c.color+
 '" data-component="'+c.id+'"/>').join("")+'</g></svg>';
const assets={
 "U+4E00.svg":shape([first,unhinted]),
 "U+4E8C.svg":shape([unhinted]),
 "U+4E09.svg":shape([unhinted])
};
function run(a=catalog,b=manifest,c=palette,d=assets){
 return deriveSourceGlyphCounterfactual(a,b,c,name=>{
  if(!(name in d))throw Error("Missing fixture");
  return d[name];
 },{expectedGlyphCount:2});
}
const original=JSON.stringify(assets),colors=JSON.stringify(palette);
const {manifest:out,outputFiles}=run();
assert.equal(out.summary.catalogGlyphs,2);
assert.equal(out.summary.generatedSourceManifestGlyphs,3);
assert.equal(out.summary.excludedOutsideActiveTranche,1);
assert.equal(out.summary.affectedGlyphs,1);
assert.equal(out.summary.untouchedGlyphs,1);
assert.equal(out.summary.alteredSourcePathFills,1);
assert.equal(out.summary.unchangedSourcePathFills,2);
assert.equal(out.provenance.activeGlyphFilesOverwritten,false);
assert.equal(out.provenance.strokePathsChanged,false);
assert.equal(out.provenance.ownerMappingsChanged,false);
assert.equal(out.provenance.other480ComponentsRecolored,false);
assert.equal(out.provenance.independentlyApprovedVisuals,0);
assert.equal(out.provenance.semanticFamilyApprovals,0);
assert.equal(out.summary.humanComprehensionTrials,0);
assert.equal(outputFiles.size,1);
assert.ok(outputFiles.has("U+4E00.svg"));
assert.ok(!outputFiles.has("U+4E8C.svg"));
assert.ok(!outputFiles.has("U+4E09.svg"));
const research=outputFiles.get("U+4E00.svg");
assert.ok(research.includes('data-component="cmp-0001"'));
assert.ok(research.includes('fill="'+unhinted.color+'"'));
assert.ok(!research.includes('fill="'+first.color+'"'));
assert.equal(out.glyphs[0].sourcePathsIdentical,true);
assert.equal(out.glyphs[0].componentOwnerSequenceIdentical,true);
assert.equal(out.glyphs[0].activePaletteUntouched,true);
assert.equal(out.glyphs[0].independentGlyphValidation,"pending");
assert.equal(JSON.stringify(assets),original);
assert.equal(JSON.stringify(palette),colors);
assert.deepEqual(run(),{manifest:out,outputFiles});
for(const mutate of [
 (a,b,c,d)=>{b.palette_ref="mandarin-component-identity@0.7.0";},
 (a,b,c,d)=>{b.glyphs[0].independently_visually_certified=true;},
 (a,b,c,d)=>{b.glyphs[0].source_path_owner_ids[0]=unhinted.id;},
 (a,b,c,d)=>{b.glyphs[0].components[0].hex="#000000";},
 (a,b,c,d)=>{a.characters[1].rank=1;},
 (a,b,c,d)=>{d["U+4E00.svg"]=d["U+4E00.svg"].replace('fill="'+first.color+'"','fill="#000000"');},
 (a,b,c,d)=>{d["U+4E00.svg"]=d["U+4E00.svg"].replace(/<path[^>]+\/>/,"");},
 (a,b,c,d)=>{c.components[0].mnemonic_group_hint=null;}
]){
 const a=structuredClone(catalog),b=structuredClone(manifest),c=structuredClone(palette),d=structuredClone(assets);
 mutate(a,b,c,d);
 assert.throws(()=>run(a,b,c,d));
}
console.log("Source-identical glyph geometry; isolated one-path recoloring; unhinted strokes unchanged; eight source-drift failures.");
