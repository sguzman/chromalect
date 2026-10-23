import assert from "node:assert/strict";
import fs from "node:fs";
const file="data/semantic/cedict-crossref/pinyin-reading-label-normalization-v0.1.json";
const result=JSON.parse(fs.readFileSync(file,"utf8")),s=result.summary;
assert.equal(result.schema,"chromalect.semantic.pinyin-reading-label-normalization.v0.1");
assert.equal(result.status,"mechanical_casefolding_of_dictionary_pinyin_not_verified_pronunciations");
assert.deepEqual(Object.values(s).slice(0,11),[1000,1393,1191,202,339,166,173,201,142,55,87]);
assert.equal(s.independentLexicalApproved,0);
assert.equal(s.independentEmojiApproved,0);
assert.equal(s.productionVerified,0);
assert.equal(result.records.length,1000);
for(const [i,r] of result.records.entries()){
 assert.equal(r.rank,i+1);
 assert.deepEqual(r.normalizedReadingLabels,[...new Set(r.recordedReadingLabels.map(x=>x.toLowerCase()))]);
 assert.equal(r.casefoldedDuplicateCount,r.recordedEntryCount-r.distinctCasefoldedLabelCount);
 assert.equal(r.independentLexicalApproval,false);
 assert.equal(r.productionVerified,false);
}
assert.deepEqual(result.records.find(r=>r.character==="丁").recordedReadingLabels,["Ding1","ding1"]);
assert.deepEqual(result.records.find(r=>r.character==="丁").normalizedReadingLabels,["ding1"]);
assert.deepEqual(result.records.find(r=>r.character==="过").normalizedReadingLabels,["guo4","guo5"]);
console.log("Readings by source label: 339 multiple raw, 166 case-only multiple, 173 different lowercased labels; zero approvals.");
