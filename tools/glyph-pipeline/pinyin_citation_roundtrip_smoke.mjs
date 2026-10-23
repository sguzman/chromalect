import assert from "node:assert/strict";
import fs from "node:fs";
import {decodePinyinSpelling,encodePinyinSpelling,auditCitationTranche} from "./pinyin_citation_roundtrip.mjs";
const source=JSON.parse(fs.readFileSync("site/pronunciation-citations-0001-1000.json","utf8"));
const layers=JSON.parse(fs.readFileSync("site/layers-v0.1.json","utf8"));
const palette=layers.palette_domains;
const report=JSON.parse(fs.readFileSync("data/phonetics/pinyin-citation-orthography-audit-v0.1.json","utf8"));
assert.deepEqual(auditCitationTranche(source,layers),report);
assert.equal(report.counts.characters,1000);
assert.equal(report.counts.citationReadings,1171);
assert.equal(report.counts.roundTripMatches,1171);
assert.equal(report.counts.roundTripFailures,0);
assert.equal(report.counts.contextualPronunciationApprovals,0);
assert.equal(report.counts.verifiedPhonemicContrasts,0);
for(const [display,initial,final,tone] of [
 ["yī","y","i",1],["yǔ","y","u",3],["èr","∅","er",4],
 ["shí","sh","i",2],["lǜ","l","ü",4],["duì","d","ui",4],
 ["jiǔ","j","iu",3],["huā","h","ua",1],["bo","b","o",0],
 ["liǎo","l","iao",3]]){
 const back=decodePinyinSpelling(display,palette);
 assert.equal(back.initial,initial);assert.equal(back.final,final);assert.equal(back.tone,tone);
 assert.equal(encodePinyinSpelling(initial,final,tone,palette),display);
}
for(const wrong of ["duì","shǔi","yí́","x1","Yī","shì!","xiì"])
 assert.throws(()=>decodePinyinSpelling(wrong,palette));
assert.throws(()=>encodePinyinSpelling("sh","zzz",2,palette));
assert.throws(()=>encodePinyinSpelling("sh","i",5,palette));
const altered=structuredClone(source);
altered.characters[0].readings[0].tone=4;
assert.throws(()=>auditCitationTranche(altered,layers));
console.log("1,171/1,171 citation Pinyin exact round trips; no contextual or phonemic certification.");
