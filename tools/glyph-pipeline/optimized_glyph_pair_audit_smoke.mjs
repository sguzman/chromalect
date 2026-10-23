import assert from "node:assert/strict";
import fs from "node:fs";
import {deriveOptimizedPairAudit} from "./optimized_glyph_pair_audit.mjs";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const catalog=read("data/catalog/characters-0001-1000.json"),
 mappings=read("site/glyphs/mappings.json"),
 palette=read("palettes/mandarin-component-identity-v0.6.json"),
 risk=read("site/glyphs/research/hint-counterfactual-v0.1/pair-risk-v0.1.json"),
 optimized=read("site/mnemonic-group-risk-optimized-v0.2.json");
const census=deriveOptimizedPairAudit(catalog,mappings,palette,risk,optimized);
assert.deepEqual(deriveOptimizedPairAudit(catalog,mappings,palette,risk,optimized),census);
assert.equal(census.summary.catalogCharacters,1000);
assert.equal(census.summary.componentIdentities,520);
assert.equal(census.summary.optimizedComponentIds,40);
assert.equal(census.summary.pairs,1020);
assert.equal(census.summary.originalClose,26);
assert.equal(census.summary.firstClose,76);
assert.ok(census.summary.optimizedClose<=76);
assert.equal(census.summary.optimizedClose,
 census.summary.newVersusOriginal+census.summary.retainedVersusOriginal);
assert.equal(census.summary.originalClose,
 census.summary.resolvedVersusOriginal+census.summary.retainedVersusOriginal);
assert.equal(census.summary.affectedGlyphs,542);
assert.equal(census.summary.approvedSemanticFamilies,0);
assert.equal(census.summary.humanDiscriminationTrials,0);
assert.equal(census.provenance.glyphPathsRecolored,false);
assert.equal(census.provenance.heldOutTesting,false);
const seen=new Set();
for(const item of census.glyphs){
 assert.ok(item.rank>=1&&item.rank<=1000);
 assert.ok(!seen.has(item.rank));seen.add(item.rank);
 assert.equal(item.ownerPathsUnmodified,true);
 assert.equal(item.sourcePaletteUnchanged,true);
 assert.equal(item.independentVisualReview,"pending");
 assert.equal(item.semanticInterpretation,"unapproved");
 for(const pair of item.reviewPairs){
  assert.equal(pair.status,"machine_color_distance_not_human_discrimination");
  assert.ok(pair.optimized.deltaOk>=0);
  assert.ok(pair.firstTrial.deltaOk>=0);
  assert.ok(pair.original.deltaOk>=0);
 }
}
assert.equal(seen.size,542);
for(const mutate of [
 (a,b,c,d,e)=>{a.characters[0].rank=900;},
 (a,b,c,d,e)=>{b.glyphs[0].components[0].hex="#000000";},
 (a,b,c,d,e)=>{b.glyphs[0].independently_visually_certified=true;},
 (a,b,c,d,e)=>{c.version="0.7.0";},
 (a,b,c,d,e)=>{d.summary.proposedClosePairs=0;},
 (a,b,c,d,e)=>{e.provenance.heldOutGlyphsEvaluated=1;},
 (a,b,c,d,e)=>{e.groups[0].members[0].sourceHex="#000000";}
]){
 const [a,b,c,d,e]=[catalog,mappings,palette,risk,optimized].map(x=>structuredClone(x));
 mutate(a,b,c,d,e);
 assert.throws(()=>deriveOptimizedPairAudit(a,b,c,d,e));
}
console.log("Three-palette 1020-pair full source census; 542 glyphs; seven source/approval rejections.");
