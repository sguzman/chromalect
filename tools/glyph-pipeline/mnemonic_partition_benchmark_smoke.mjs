import assert from "node:assert/strict";
import fs from "node:fs";
import {deriveMnemonicPartitionBenchmark} from "./mnemonic_partition_benchmark.mjs";
const original=JSON.parse(fs.readFileSync(
 "palettes/mandarin-component-identity-v0.6.json","utf8"));
const r=deriveMnemonicPartitionBenchmark(original);
assert.deepEqual(deriveMnemonicPartitionBenchmark(original),r);
assert.equal(r.scope.pilotComponents,40);
assert.equal(r.scope.unhintedComponentsExcluded,480);
assert.equal(r.scope.sourceHintGroups,8);
assert.equal(r.scope.withinPairs,88);
assert.equal(r.scope.betweenPairs,692);
assert.deepEqual(r.scope.groupSizes,[8,6,5,5,5,4,4,3]);
assert.equal(r.provenance.iterations,10000);
assert.equal(r.provenance.randomSeedUnsigned,0xC01A2631);
assert.equal(r.provenance.paletteRecolored,false);
assert.equal(r.provenance.semanticMembershipAdjudicated,false);
assert.equal(r.provenance.participantStudyConducted,false);
assert.equal(r.result.observedWithinHintMeanDeltaOk,0.216695);
assert.equal(r.result.permutationsAtOrBelowObserved+
 r.result.permutationsAboveObserved,10000);
assert.ok(r.result.permutationsAtOrBelowObserved>1000);
assert.ok(r.result.permutationsAtOrBelowObserved<5000);
const q=r.result.quantiles;
assert.ok(q.p025<q.p05&&q.p05<q.median&&
 q.median<q.p95&&q.p95<q.p975);
assert.ok(r.result.observedWithinHintMeanDeltaOk>q.p025);
assert.ok(r.result.observedWithinHintMeanDeltaOk<q.p975);
assert.equal(r.result.statisticallyValidatedSemanticClustering,false);
assert.equal(r.result.perceptualDiscriminationApproved,false);
assert.equal(r.result.lexicalSemanticFamiliesApproved,0);
for(const f of [
 p=>{p.version="0.7.0";},
 p=>{p.components[0].mnemonic_group_hint=null;},
 p=>{p.components[42].mnemonic_group_hint="water-fluid";},
 p=>{p.components[0].color="not-a-color";},
 p=>{p.components[39].id="cmp-1020";},
 p=>{p.components.splice(0,1);}
]){
 const bad=structuredClone(original);f(bad);
 assert.throws(()=>deriveMnemonicPartitionBenchmark(bad));
}
console.log("Deterministic 10,000-partition reference distribution and six fail-closed provenance cases verified.");
