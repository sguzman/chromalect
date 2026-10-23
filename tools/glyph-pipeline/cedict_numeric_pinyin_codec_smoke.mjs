import assert from "node:assert/strict";
import fs from "node:fs";
import {parseNumericCitation,buildNumericCitationIndex} from "./cedict_numeric_pinyin_codec.mjs";
const source=JSON.parse(fs.readFileSync(
 "data/semantic/cedict-crossref/pinyin-reading-label-normalization-v0.1.json","utf8"));
const layers=JSON.parse(fs.readFileSync("site/layers-v0.1.json","utf8"));
const report=JSON.parse(fs.readFileSync("data/phonetics/cedict-numeric-pinyin-orthography-v0.1.json","utf8"));
assert.deepEqual(buildNumericCitationIndex(source,layers),report);
assert.equal(report.summary.sourceReadingLabels,1393);
assert.equal(report.summary.exactOrthographicFullSyllableConversions,1392);
assert.equal(report.summary.sourceLabelsOutsideCodec,1);
assert.equal(report.summary.sourceCapitalizationDuplicates,202);
assert.equal(report.summary.independentlyVerifiedContextualReadings,0);
assert.equal(report.summary.phonemicContrastsApproved,0);
assert.equal(report.summary.productionApprovals,0);
assert.equal(report.exceptions[0].sourceReadingLabel,"r5");
const p=layers.palette_domains;
for(const [label,written] of [
 ["yi1","yī"],["zhang3","zhǎng"],["Ding1","dīng"],["lu:4","lǜ"],
 ["jiu3","jiǔ"],["dui4","duì"],["bo5","bo"],["er4","èr"]]){
 const parsed=parseNumericCitation(label,p);
 assert.equal(parsed?.display,written);
}
assert.equal(parseNumericCitation("r5",p),null);
const bad=structuredClone(source);bad.records[0].recordedReadingLabels[0]="ZZZ5";
assert.throws(()=>buildNumericCitationIndex(bad,layers));
assert.ok(report.records.every(x=>x.independentContextualReadingVerified===false&&
 x.independentPhonemicVerification===false&&x.lexicalSenseApproved===false));
console.log("Source-preserving 1,392/1,393 numeric Pinyin spelling crosswalk, explicit r5 exception.");
