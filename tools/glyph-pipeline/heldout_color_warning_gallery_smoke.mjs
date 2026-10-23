import assert from "node:assert/strict";
import fs from "node:fs";
import {createHash} from "node:crypto";
import {deriveHeldoutWarningGallery} from "./heldout_color_warning_gallery.mjs";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const catalog=read("data/catalog/characters-0001-1000.json"),
 mapping=read("site/glyphs/mappings.json"),
 palette=read("palettes/mandarin-component-identity-v0.6.json"),
 heldout=read("site/semantic-group-hue-fivefold-heldout-v0.1.json");
const files=new Map();
const source=name=>{
 if(!files.has(name))files.set(name,fs.readFileSync("site/glyphs/"+name,"utf8"));
 return files.get(name);
};
const {manifest,files:alternatives}=deriveHeldoutWarningGallery(
 catalog,mapping,palette,heldout,source);
assert.equal(manifest.summary.catalogGlyphs,1000);
assert.equal(manifest.summary.folds,5);
assert.equal(manifest.summary.totalWithinGlyphPairs,1020);
assert.equal(manifest.summary.originalWarnings,26);
assert.equal(manifest.summary.firstGroupWarnings,76);
assert.equal(manifest.summary.foldOptimizedWarnings,28);
assert.equal(manifest.summary.introducedWarnings,23);
assert.equal(manifest.summary.resolvedWarnings,21);
assert.equal(manifest.summary.retainedWarnings,5);
assert.equal(manifest.summary.totalPairReviewObservations,49);
assert.equal(manifest.summary.newlyFlaggedGlyphs,23);
assert.equal(manifest.summary.generatedIsolatedSVGs,alternatives.size);
assert.equal(manifest.summary.flaggedGlyphs,alternatives.size);
assert.equal(manifest.summary.visuallyCertifiedGlyphs,0);
assert.equal(manifest.summary.approvedSemanticFamilies,0);
assert.equal(manifest.provenance.excludedGlyphsUsedForTraining,false);
assert.equal(manifest.provenance.sourceGlyphsOverwritten,false);
assert.equal(manifest.provenance.componentOwnerGeometryChanged,false);
const sha=x=>createHash("sha256").update(x,"utf8").digest("hex");
const owned=/<path d="([^"]+)" fill="(#[0-9a-fA-F]{6})" data-component="(cmp-\d{4})"\/>/g;
const norm=s=>s.replace(owned,(x,d,color)=>x.replace('fill="'+color+'"','fill="#000000"'));
let introducedGlyphs=0,introduced=0,resolved=0,retained=0;
for(const row of manifest.glyphs){
 const name=row.originalSVG.slice("glyphs/".length);
 assert.equal(row.heldoutSVG,"glyphs/research/heldout-warning-v0.1/"+name);
 const a=source(name),b=alternatives.get(name);
 assert.equal(sha(a),row.originalSHA256);
 assert.equal(sha(b),row.heldoutSHA256);
 assert.equal(norm(a),norm(b));
 assert.equal([...a.matchAll(owned)].length,row.sourceOwnedPaths);
 assert.equal(row.sourceGeometryIdentical,true);
 assert.equal(row.sourceOwnersIdentical,true);
 assert.equal(row.activePaletteUnchanged,true);
 assert.equal(row.visualReview,"pending");
 assert.equal(row.semanticReview,"unapproved");
 assert.equal((row.rank-1)%5,row.foldIndex);
 if(row.severity==="introduced")introducedGlyphs++;
 for(const pair of row.pairs){
  assert.equal(pair.visualReview,"pending");
  assert.equal(pair.semanticsApproved,false);
  assert.equal(pair.sourceGeometryChanged,false);
  if(pair.reviewState==="introduced")introduced++;
  else if(pair.reviewState==="resolved")resolved++;
  else if(pair.reviewState==="retained")retained++;
  else throw Error("Unknown source warning category");
 }
}
assert.equal(introducedGlyphs,23);
assert.deepEqual({introduced,resolved,retained},
 {introduced:23,resolved:21,retained:5});
const mutations=[
 (a,b,c,d)=>{a.characters[0].character="X";},
 (a,b,c,d)=>{b.palette_ref="mandarin-component-identity@0.7.0";},
 (a,b,c,d)=>{c.version="0.7.0";},
 (a,b,c,d)=>{d.provenance.independentVisionTrialConducted=true;},
 (a,b,c,d)=>{d.folds[0].excludedFromOptimizer[0]=9999;},
 (a,b,c,d)=>{d.folds[0].sourcePinnedCandidateColors[0].semanticApproval=true;},
 (a,b,c,d)=>{d.folds[0].test.reviewPairs[0].visualReview="certified";},
 (a,b,c,d)=>{d.folds[0].test.reviewPairs[0].componentA.sourceHex="#000000";}
];
for(const f of mutations){
 const inputs=[catalog,mapping,palette,heldout].map(x=>structuredClone(x));
 f(...inputs);
 assert.throws(()=>deriveHeldoutWarningGallery(...inputs,source));
}
assert.throws(()=>deriveHeldoutWarningGallery(catalog,mapping,palette,
 heldout,name=>source(name).replace('data-component="','data-component="bad-')));
console.log("49 pair warnings, isolated source-exact Chinese SVGs and nine source/review refusal cases verified.");
