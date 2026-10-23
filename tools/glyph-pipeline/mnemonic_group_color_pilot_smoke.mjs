import assert from "node:assert/strict";
import fs from "node:fs";
import {deriveMnemonicGroupPilot} from "./mnemonic_group_color_pilot.mjs";
const palette=JSON.parse(fs.readFileSync(
 "palettes/mandarin-component-identity-v0.6.json","utf8"));
const result=deriveMnemonicGroupPilot(palette);
assert.equal(result.summary.sourceComponentColors,520);
assert.equal(result.summary.pilotHintedComponents,40);
assert.equal(result.summary.unhintedComponents,480);
assert.equal(result.summary.provisionalMnemonicHintGroups,8);
assert.equal(result.summary.withinHintPairs,88);
assert.equal(result.summary.betweenHintPairs,692);
assert.equal(result.summary.independentlyApprovedSemanticFamilies,0);
assert.equal(result.summary.humanColorOrSemanticComprehensionTrials,0);
assert.ok(result.summary.meanWithinHintDeltaOk>0);
assert.ok(result.summary.meanBetweenHintDeltaOk>0);
assert.equal(result.groups.length,8);
const source=new Map(palette.components.map(c=>[c.id,c]));
const memberIds=new Set();
let pairs=0;
for(const group of result.groups){
 assert.equal(group.semanticEvidenceApproved,false);
 assert.equal(group.semanticFamilyColorSchemeApproved,false);
 assert.equal(group.componentColors.length,group.sourceComponentIds.length);
 assert.equal(group.withinPairs.length,
  group.summary.members*(group.summary.members-1)/2);
 pairs+=group.withinPairs.length;
 for(const item of group.componentColors){
  assert.equal(source.get(item.id).color,item.hex);
  assert.equal(source.get(item.id).shape,item.form);
  assert.equal(source.get(item.id).mnemonic_group_hint,group.mnemonicHint);
  assert.ok(!memberIds.has(item.id));memberIds.add(item.id);
 }
 for(const pair of group.withinPairs){
  assert.ok(pair.deltaOk>=0&&pair.deltaOk<=1);
  assert.ok(group.sourceComponentIds.includes(pair.a));
  assert.ok(group.sourceComponentIds.includes(pair.b));
  assert.notEqual(pair.a,pair.b);
 }
}
assert.equal(pairs,88);assert.equal(memberIds.size,40);
for(const corrupt of [
 p=>{p.version="0.7.0";},
 p=>{p.components[0].color="#FFFFFF";p.components[1].color="#FFFFFF";},
 p=>{p.components[0].mnemonic_group_hint="unsupported-new-family";},
 p=>{p.components[0].mnemonic_group_hint=null;},
 p=>{p.components[40].mnemonic_group_hint="water-fluid";},
 p=>{p.components[0].source_scope="unreviewed";},
 p=>{p.coverage.total_component_identities=519;},
 p=>{p.components[0].id="cmp-0555";}
]){
 const tampered=structuredClone(palette);corrupt(tampered);
 assert.throws(()=>deriveMnemonicGroupPilot(tampered));
}
console.log("Eight unapproved pilot mnemonic hints, 40 stable colors, 88 within-hint and 692 between-hint pairs; eight negative cases.");
