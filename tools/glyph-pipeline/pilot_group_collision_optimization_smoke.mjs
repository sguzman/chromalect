import assert from "node:assert/strict";
import fs from "node:fs";
import {deriveCollisionConstrainedPilot} from "./pilot_group_collision_optimization.mjs";
const palette=JSON.parse(fs.readFileSync(
 "palettes/mandarin-component-identity-v0.6.json","utf8"));
const catalog=JSON.parse(fs.readFileSync(
 "data/catalog/characters-0001-1000.json","utf8"));
const first=palette.components[0],neighbor=palette.components.find(c=>c.id==="cmp-0240");
const stable=palette.components[40];
const component=c=>({component_id:c.id,form:c.shape,hex:c.color});
const mapping={
 schema:"chromalect.component-stroke-mappings.v1",
 palette_ref:"mandarin-component-identity@0.6.0",
 glyph_count:1000,
 glyphs:catalog.characters.map((row,i)=>({
  character:row.character,independently_visually_certified:false,
  components:i===0?[component(first),component(neighbor)]:[component(stable)]
 }))
};
const risk={
 schema:"chromalect.glyph.hint-hue-source-pair-risk.v0.1",
 provenance:{originalPaletteMutated:false},
 summary:{catalogCharacters:1000,originalClosePairs:26,proposedClosePairs:76,
  newlyClosePairs:70,affectedGlyphs:542}
};
const data=JSON.stringify(palette),mappings=JSON.stringify(mapping);
const call=(a=catalog,b=mapping,c=palette,d=risk)=>
 deriveCollisionConstrainedPilot(a,b,c,d);
const result=call();
assert.deepEqual(call(),result);
assert.equal(JSON.stringify(palette),data);
assert.equal(JSON.stringify(mapping),mappings);
assert.equal(result.schema,"chromalect.palette.source-cooccurrence-hue-optimizer.v0.2");
assert.equal(result.provenance.researchOnly,true);
assert.equal(result.provenance.activeSourcePaletteMutated,false);
assert.equal(result.provenance.heldOutGlyphsEvaluated,0);
assert.equal(result.provenance.semanticMembershipsApproved,0);
assert.equal(result.summary.catalogCharacters,1000);
assert.equal(result.summary.originalPaletteComponents,520);
assert.equal(result.summary.alteredHypotheticalIDs,40);
assert.equal(result.summary.unhintedExcluded,480);
assert.equal(result.summary.firstTrialAllGlyphWarningPairs,76);
assert.equal(result.summary.sourceOriginalWarningPairs,26);
assert.equal(result.summary.distinctSourceCooccurrenceEdges,1);
assert.equal(result.summary.firstTrialWarningsInAffectedEdges,1);
assert.ok(result.summary.optimizedWarningsInAffectedEdges<=1);
assert.equal(result.summary.approvedLexicalOrSemanticFamilies,0);
assert.equal(result.summary.humanLearningStudies,0);
assert.equal(result.groups.length,8);
const rows=result.groups.flatMap(g=>g.members);
assert.equal(rows.length,40);
assert.equal(new Set(rows.map(c=>c.optimizedTrialHex)).size,40);
for(const c of rows){
 const source=palette.components.find(x=>x.id===c.componentId);
 assert.equal(source.color,c.sourceHex);
 assert.equal(source.shape,c.form);
 assert.equal(source.mnemonic_group_hint,c.historicalHint);
 assert.equal(c.groupMembershipApproval,"unverified_historical_mnemonic_hint");
 assert.equal(c.visuallyDiscriminable,"unverified");
 assert.equal(c.semanticFamilyVerified,false);
 assert.match(c.optimizedTrialHex,/^#[0-9A-F]{6}$/);
}
assert.ok(result.summary.groupDistanceOptimized.within>0);
assert.ok(result.summary.groupDistanceOptimized.between>0);
assert.ok(result.summary.coordinateDescentUpdates>=0);
for(const mutate of [
 (a,b,c,d)=>{a.characters.pop();},
 (a,b,c,d)=>{b.palette_ref="mandarin-component-identity@0.7.0";},
 (a,b,c,d)=>{b.glyphs[0].components[0].hex="#000000";},
 (a,b,c,d)=>{b.glyphs[0].independently_visually_certified=true;},
 (a,b,c,d)=>{b.glyphs[500].components[0].component_id="cmp-9999";},
 (a,b,c,d)=>{c.components[0].color=c.components[1].color;},
 (a,b,c,d)=>{d.summary.newlyClosePairs=1;},
 (a,b,c,d)=>{d.provenance.originalPaletteMutated=true;}
]){
 const inputs=[catalog,mapping,palette,risk].map(x=>structuredClone(x));
 mutate(...inputs);assert.throws(()=>call(...inputs));
}
console.log("Seeded in-sample collision reduction on source-aligned synthetic graph, 40 unique candidates and eight invalid-provenance refusals.");
