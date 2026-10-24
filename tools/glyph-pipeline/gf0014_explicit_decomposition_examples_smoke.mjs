import assert from "node:assert/strict";
import fs from "node:fs";
const catalog=JSON.parse(fs.readFileSync("data/catalog/characters-0001-1000.json","utf8"));
const report=JSON.parse(fs.readFileSync("data/research/gf0014-explicit-decomposition-examples-v0.1.json","utf8"));
assert.equal(catalog.schema,"chromalect.character-tranche.v1");
assert.equal(catalog.characters.length,1000);
assert.equal(report.schema,"chromalect.gf0014.select-tranche-explicit-normative-decomposition-examples.v0.1");
assert.equal(report.status,"four_explicit_standard_illustrations_crosschecked_no_stroke_ownership_approval");
assert.equal(report.counts.officialRuleExamplesPresentInSourceTranche,4);
assert.equal(report.counts.matchedSourceDecompositionCuts,4);
assert.equal(report.counts.explicitPositiveSplitExamples,2);
assert.equal(report.counts.explicitNoSplitExamples,2);
assert.equal(report.counts.independentlyCertifiedSourceStrokeOwnerships,0);
assert.equal(report.counts.independentlyCertifiedGeometryAssets,0);
const expected=[
 ["分",146,"explicit_authority_split",[["八","0"],["刀","1"]]],
 ["执",363,"explicit_authority_split",[["扌","0"],["丸","1"]]],
 ["东",225,"explicit_authority_no_split",[["东","root"]]],
 ["串",736,"explicit_authority_no_split",[["串","root"]]]
];
assert.equal(report.records.length,4);
for(let i=0;i<expected.length;i++){
 const [ch,rank,kind,parts]=expected[i],r=report.records[i];
 const src=catalog.characters[rank-1];
 assert.equal(src.character,ch);
 assert.equal(r.rank,rank);
 assert.equal(r.character,ch);
 assert.equal(r.rule,kind);
 assert.equal(r.selectedCutCorrespondsToPublishedRule,true);
 assert.equal(r.sourceIDSIsNotStrokeGeometry,true);
 assert.equal(r.independentVisualStrokeOwnershipApproved,false);
 assert.equal(r.independentGeometryCertification,false);
 assert.deepEqual(r.sourceComponents.map(x=>[x.form,x.path]),parts);
 assert.deepEqual(src.component_instances.map(x=>[x.id,x.form,x.path]),
  r.sourceComponents.map(x=>[x.componentId,x.form,x.path]));
 if(kind==="explicit_authority_no_split")assert.equal(src.structural_status,"atomic_recognizer");
 else assert.equal(src.structural_status,"resolved_structural_membership");
}
console.log("GF0014 explicit decomposition rules: four source-ranked selected cuts match official examples; zero independently certified geometry.");
