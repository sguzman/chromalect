import assert from "node:assert/strict";
import fs from "node:fs";
import {deriveReferenceContrastAudit} from "./component_palette_background_contrast.mjs";
const original=JSON.parse(fs.readFileSync(
 "palettes/mandarin-component-identity-v0.6.json","utf8"));
const report=deriveReferenceContrastAudit(original);
assert.equal(report.records.length,520);
assert.equal(report.summary.componentColors,520);
assert.equal(report.summary.whiteBelow3,49);
assert.equal(report.summary.blackBelow3,69);
assert.equal(report.summary.whiteBelow4_5,264);
assert.equal(report.summary.blackBelow4_5,241);
assert.equal(report.summary.independentlyVisuallyVerified,0);
assert.equal(report.summary.accessibilityCertifications,0);
assert.equal(report.summary.humanColorDiscriminationTrials,0);
const sourceById=new Map(original.components.map(c=>[c.id,c]));
for(const row of report.records){
 const item=sourceById.get(row.componentId);
 assert.equal(row.sourceColor,item.color);
 assert.equal(row.form,item.shape);
 assert.equal(row.paletteColorChanged,false);
 assert.equal(row.accessibleGlyphCertified,false);
 assert.equal(row.visualReview,"pending");
 assert.ok(row.whiteRatio>=1&&row.whiteRatio<=21);
 assert.ok(row.blackRatio>=1&&row.blackRatio<=21);
 assert.ok(Math.abs(row.whiteRatio*row.blackRatio-21)<0.0001);
}
const negative=[
 p=>{p.version="0.7.0";},
 p=>{p.status="certified";},
 p=>{p.coverage.total_component_identities=519;},
 p=>{p.components[0].id="cmp-0519";},
 p=>{p.components[0].color="red";},
 p=>{p.components[1].color=p.components[0].color;},
 p=>{p.components.pop();},
 p=>{p.palette_space="Display-P3";}
];
for(const mutation of negative){
 const tampered=structuredClone(original);mutation(tampered);
 assert.throws(()=>deriveReferenceContrastAudit(tampered));
}
console.log("520 source-identical colors; white <3:1 49, black <3:1 69; 8 source/approval rejection checks.");
