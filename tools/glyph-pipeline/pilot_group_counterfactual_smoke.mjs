import assert from "node:assert/strict";
import fs from "node:fs";
import {derivePilotGroupCounterfactual} from "./pilot_group_counterfactual.mjs";
const palette=JSON.parse(fs.readFileSync(
 "palettes/mandarin-component-identity-v0.6.json","utf8"));
const before=JSON.stringify(palette);
const result=derivePilotGroupCounterfactual(palette);
assert.equal(JSON.stringify(palette),before,"Source palette must never be mutated");
assert.deepEqual(derivePilotGroupCounterfactual(palette),result);
assert.equal(result.status,
 "isolated_40_component_hue_grouping_hypothesis_not_a_palette_or_semantic_approval");
assert.equal(result.provenance.originalPaletteModified,false);
assert.equal(result.provenance.activeGlyphsRecolored,false);
assert.equal(result.provenance.independentLexicalClassification,false);
assert.equal(result.provenance.participantEvaluations,0);
assert.equal(result.summary.sourceIdentityColors,520);
assert.equal(result.summary.hypotheticalColorAssignments,40);
assert.equal(result.summary.unclassifiedComponentsExcluded,480);
assert.equal(result.summary.historicalHints,8);
assert.equal(result.summary.proposedUniqueColors,40);
assert.equal(result.summary.withinHintPairs,88);
assert.equal(result.summary.betweenHintPairs,692);
assert.equal(result.summary.approvedSemanticFamilies,0);
assert.equal(result.summary.validatedIdentityDiscriminability,0);
assert.equal(result.summary.actualHumanLearningOutcomes,0);
assert.equal(result.summary.baselineMeanWithinDeltaOk,0.216695);
assert.equal(result.summary.baselineMeanBetweenDeltaOk,0.220038);
assert.ok(result.summary.counterfactualMeanWithinDeltaOk<0.05);
assert.ok(result.summary.counterfactualMeanBetweenDeltaOk>0.13);
assert.ok(result.summary.counterfactualMeanBetweenDeltaOk>
 result.summary.counterfactualMeanWithinDeltaOk);
assert.ok(result.summary.smallestWithinDeltaOk<0.02,
 "Counterfactual weakens same-group color differentiation; do not certify identity decoding");
const sources=new Map(palette.components.map(c=>[c.id,c]));
const all=result.groups.flatMap(g=>g.members.map(m=>({group:g,...m})));
assert.equal(all.length,40);
const ids=new Set(),colors=new Set();
for(const member of all){
 const source=sources.get(member.componentId);
 assert.ok(source);
 assert.equal(member.sourceHex,source.color);
 assert.equal(member.form,source.shape);
 assert.equal(member.group.historicalHint,source.mnemonic_group_hint);
 assert.equal(member.originalIdentityPreservedInActivePalette,true);
 assert.equal(member.visuallyVerified,false);
 assert.equal(member.semanticallyVerified,false);
 assert.match(member.candidateHex,/^#[0-9A-F]{6}$/);
 assert.equal(member.candidateStatus,"hypothetical_group_color_not_production");
 assert.ok(!ids.has(member.componentId));
 assert.ok(!colors.has(member.candidateHex));
 ids.add(member.componentId);colors.add(member.candidateHex);
}
assert.equal(ids.size,40);assert.equal(colors.size,40);
for(const mutate of [
 p=>{p.version="0.7.0";},
 p=>{p.components[0].mnemonic_group_hint=null;},
 p=>{p.components[41].mnemonic_group_hint="water-fluid";},
 p=>{p.components[0].id="cmp-7777";},
 p=>{p.components[0].color=p.components[1].color;},
 p=>{p.components.pop();}
]){
 const tampered=structuredClone(palette);mutate(tampered);
 assert.throws(()=>derivePilotGroupCounterfactual(tampered));
}
console.log("40 independent hypothetical swatches, 8 historical hints, 88/692 pair comparisons and six rejected source changes.");
