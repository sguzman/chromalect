import assert from "node:assert/strict";
import fs from "node:fs";
import {buildContrastIndex} from "./citation_orthographic_contrast_controls.mjs";
const src=JSON.parse(fs.readFileSync("site/pronunciation-citations-0001-1000.json","utf8"));
const expected=JSON.parse(fs.readFileSync("data/phonetics/citation-orthographic-contrast-controls-v0.1.json","utf8"));
assert.deepEqual(buildContrastIndex(src),expected);
assert.equal(expected.summary.candidatePairs,710);
assert.deepEqual(expected.summary.byType,{tone_label:533,working_aspiration_pair:89,one_letter_written_final:88});
assert.deepEqual(expected.summary.aspirationPairCoverage,{"b/p":11,"d/t":18,"g/k":15,"j/q":19,"zh/ch":24,"z/c":2});
assert.equal(expected.summary.independentlyVerifiedPhoneticPairs,0);
assert.equal(expected.summary.approvedContextualPronunciationComparisons,0);
assert.equal(expected.summary.humanListeningOrDecodingTrials,0);
assert.equal(expected.interpretation.candidatePairsAreValidatedSpokenMinimalPairs,false);
assert.equal(expected.records.length,710);
const observed=new Map();
for(const c of src.characters)for(const r of c.readings){
 const k=JSON.stringify([r.initial,r.final,r.tone]);
 if(!observed.has(k))observed.set(k,{...r,character:c.character,rank:c.rank});
}
for(const p of expected.records){
 assert.equal(p.independentPhonemicContrastVerified,false);
 assert.equal(p.contextualPronunciationVerified,false);
 assert.equal(p.contrastLearningEffectMeasured,false);
 for(const r of [p.left,p.right]){
  const source=observed.get(JSON.stringify([r.initial,r.final,r.tone]));
  assert.ok(source);
  assert.equal(r.rank,source.rank);
  assert.equal(r.character,source.character);
  assert.equal(r.display,source.display);
 }
 if(p.type==="tone_label"){
  assert.equal(p.left.initial,p.right.initial);assert.equal(p.left.final,p.right.final);
  assert.notEqual(p.left.tone,p.right.tone);
 }else if(p.type==="working_aspiration_pair"){
  assert.equal(p.left.final,p.right.final);assert.equal(p.left.tone,p.right.tone);
  assert.ok(Object.hasOwn(expected.summary.aspirationPairCoverage,p.left.initial+"/"+p.right.initial));
 }else if(p.type==="one_letter_written_final"){
  assert.equal(p.left.initial,p.right.initial);assert.equal(p.left.tone,p.right.tone);
  assert.equal([...p.left.final].length,[...p.right.final].length);
  assert.equal([...p.left.final].filter((c,i)=>c!==[...p.right.final][i]).length,1);
 }else assert.fail("Unsupported experimental contrast type");
}
const modified=structuredClone(src);modified.characters[0].rank=88;
assert.throws(()=>buildContrastIndex(modified));
assert.ok(!JSON.stringify(expected).includes("independentlyVerified:true"));
console.log("710 exact source-orthographic experiment candidates, no independently verified spoken pair.");
