import assert from "node:assert/strict";
import fs from "node:fs";
import {createHash} from "node:crypto";
import {deriveIdentificationTargets} from "./heldout_component_identification_targets.mjs";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const inputs=[
 read("data/catalog/characters-0001-1000.json"),
 read("site/glyphs/mappings.json"),
 read("palettes/mandarin-component-identity-v0.6.json"),
 read("site/semantic-group-hue-fivefold-heldout-v0.1.json"),
 read("site/glyphs/research/heldout-warning-v0.1/index-v0.1.json")
];
const source=name=>fs.readFileSync("site/glyphs/"+name,"utf8");
const {manifest,files}=deriveIdentificationTargets(...inputs,source);
assert.equal(manifest.summary.warningObservations,49);
assert.equal(manifest.summary.flaggedCharacters,48);
assert.equal(manifest.summary.separateLocators,49);
assert.equal(manifest.summary.targetA,25);
assert.equal(manifest.summary.targetB,24);
assert.equal(manifest.summary.independentlyVerifiedAnswerKeys,0);
assert.equal(manifest.summary.humanResponses,0);
assert.equal(manifest.source.sourceGeometryModified,false);
assert.equal(files.size,49);
const pathPattern=/<path d="([^"]+)" fill="(#[0-9A-Fa-f]{6})" data-component="(cmp-\d{4})"\/>/g;
const digest=x=>createHash("sha256").update(x,"utf8").digest("hex");
for(const row of manifest.targets){
 const name=row.locatorSVG.split("/").at(-1),locator=files.get(name);
 assert.equal(digest(locator),row.locatorSHA256);
 assert.equal(digest(source(row.sourceSVG.slice("glyphs/".length))),row.sourceSHA256);
 assert.equal(row.sourceGeometryUnmodified,true);
 assert.equal(row.locatorUsesSameSourcePathGeometry,true);
 assert.equal(row.sourceOwnershipIndependentlyCertified,false);
 const originalPaths=[...source(row.sourceSVG.slice("glyphs/".length)).matchAll(pathPattern)];
 const targetPaths=[...locator.matchAll(pathPattern)];
 assert.deepEqual(targetPaths.map(p=>[p[1],p[3]]),
  originalPaths.map(p=>[p[1],p[3]]));
 assert.equal(targetPaths.filter(p=>p[2]==="#252525").length,row.targetRegionPaths);
 assert.ok(targetPaths.filter(p=>p[2]==="#dedede").length>0);
 assert.ok(targetPaths.every(p=>["#252525","#dedede"].includes(p[2])));
 assert.ok(targetPaths.filter(p=>p[2]==="#252525").every(p=>
  p[3]===row.machineAssignedOwner));
}
for(const change of [
 d=>{d[4].provenance.sourceGlyphsOverwritten=true;},
 d=>{d[4].glyphs[0].pairs[0].visualReview="certified";},
 d=>{d[4].glyphs[0].originalSHA256="0".repeat(64);},
 d=>{d[3].folds[0].sourcePinnedCandidateColors[0].semanticApproval=true;},
 d=>{const owner=d[4].glyphs[0].pairs[0].componentA.id;
  d[2].components.find(c=>c.id===owner).color="#ff00ff";},
 d=>{const rank=d[4].glyphs[0].rank;
  d[0].characters[rank-1].character="?";}
]){
 const copied=inputs.map(x=>structuredClone(x));change(copied);
 assert.throws(()=>deriveIdentificationTargets(...copied,source));
}
assert.throws(()=>deriveIdentificationTargets(...inputs,
 f=>source(f).replace('data-component="','data-component="corrupt-')));
console.log("49 distinct component locator SVGs, 25/24 source target choices, six mutated-source and one geometry-provenance refusal.");
