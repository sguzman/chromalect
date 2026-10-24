import assert from "node:assert/strict";
import fs from "node:fs";
import {validate34} from "./zhao_li_34_unit_reference.mjs";
const get=x=>JSON.parse(fs.readFileSync(x,"utf8"));
const source=get("data/phonetics/zhao-li-2009-34-unit-reference-model-v0.1.json");
const external=get("data/phonetics/zhao-li-2009-independent-pinyin-ipa-control-v0.1.json");
const working=get("data/phonetics/mandarin-initial-feature-candidates-v0.1.json");
assert.deepEqual(validate34(source,external,working),{units:34,vowels:12,consonants:22});
assert.equal(source.phonologicalUnits.filter(r=>r.segmentClass==="vowel").length,12);
assert.equal(source.phonologicalUnits.filter(r=>r.segmentClass==="consonant").length,22);
assert.deepEqual(source.phonologicalUnits.filter(r=>r.standardIPA===false)
 .map(r=>r.sourceToken),["~","^"]);
assert.equal(source.phonologicalUnits.find(r=>r.sourceToken==="r").notation,"ʐ");
assert.equal(source.representation.template,"CVVVCT");
const tamper=(fn)=>{const d=structuredClone(source);fn(d);return d};
assert.throws(()=>validate34(tamper(d=>{
 d.phonologicalUnits.find(r=>r.sourceToken==="r").notation="ɻ";
}),external,working));
assert.throws(()=>validate34(tamper(d=>{
 d.phonologicalUnits.find(r=>r.sourceToken==="~").standardIPA=true;
}),external,working));
assert.throws(()=>validate34(tamper(d=>{
 d.phonologicalUnits.push(d.phonologicalUnits[0]);
}),external,working));
assert.throws(()=>validate34(tamper(d=>{
 d.summary.acceptedProjectPhonemeContrasts=34;
}),external,working));
assert.throws(()=>validate34(tamper(d=>{
 d.representation.inventoryStatus="project_frozen";
}),external,working));
assert.throws(()=>validate34(tamper(d=>{
 d.phonologicalUnits.find(r=>r.sourceToken==="a").articulatoryHeight="high";
}),external,working));
console.log("Zhao–Li 34-unit source model: 12 vowels, 22 consonants, 2 nonstandard apical units, and 0 project phonemic approvals.");
