import assert from "node:assert/strict";
import fs from "node:fs";
import {buildEncodingCohorts} from "./mandarin_encoding_comparison_cohorts.mjs";
const get=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const data=[
 get("site/pronunciation-citations-0001-1000.json"),
 get("data/phonetics/mandarin-simple-final-feature-candidates-v0.1.json"),
 get("data/phonetics/mandarin-final-spelling-context-gates-v0.1.json"),
 get("data/phonetics/written-final-symbol-control-v0.1.json")];
const expected=get("data/phonetics/mandarin-encoding-comparison-cohorts-v0.1.json");
assert.deepEqual(buildEncodingCohorts(...data),expected);
assert.deepEqual(expected.states.map(s=>s.sourceReadingCount),[320,112,739]);
assert.equal(expected.writtenFinalTally.length,33);
assert.equal(expected.writtenFinalTally.reduce((n,x)=>n+x.total,0),1171);
assert.equal(expected.summary.independentlyVerifiedSpokenDecodings,0);
assert.equal(expected.summary.humanSymbolDecodingTrials,0);
assert.equal(expected.summary.measuredLearningBenefits,0);
assert.equal(expected.sources.componentPaletteChanged,false);
const forged=structuredClone(data);
forged[2].records[0].observedTokenTriples.push(forged[2].records[0].observedTokenTriples[0]);
assert.throws(()=>buildEncodingCohorts(...forged));
const wrong=structuredClone(data);wrong[3].summary.machineSourceSpellingRoundtrips=1170;
assert.throws(()=>buildEncodingCohorts(...wrong));
console.log("All 1,171 citation sources assigned to exactly one of three unapproved visual-comparison groups.");
