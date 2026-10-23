import assert from "node:assert/strict";
import fs from "node:fs";
const dir="data/semantic/cedict-crossref/";
const report=JSON.parse(fs.readFileSync(dir+"contextual-pronunciation-search-groups-v0.1.json","utf8"));
const raw=JSON.parse(fs.readFileSync(dir+"contextual-reading-evidence-workqueue-v0.1.json","utf8"));
const byKey=new Map(raw.records.map(x=>[x.readingKey,x]));
assert.equal(report.schema,"chromalect.semantic.contextual-pronunciation-search-groups.v0.1");
assert.equal(report.status,"casefolded_pinyin_evidence_search_deduplication_not_sense_merger");
assert.equal(report.summary.characters,142);
assert.equal(report.summary.rawDictionaryReadingEntries,319);
assert.equal(report.summary.caseNormalizedPronunciationLabelGroups,241);
assert.equal(report.summary.sourceEntriesSharingCaseNormalizedLabels,78);
for(const field of ["sourceGroupContextsRetrieved","independentlyAdjudicatedContextualPronunciations",
 "independentlyAdjudicatedLexicalSenses","approvedEmojiComprehension","productionVerified"])
 assert.equal(report.summary[field],0);
const unique=new Set(),sourceSeen=new Set();
for(const row of report.records){
 assert.ok(!unique.has(row.evidenceGroupKey));
 unique.add(row.evidenceGroupKey);
 assert.equal(row.sourceReadingKeys.length,row.sourceEntryCount);
 assert.equal(row.contextualPronunciationVerification,"pending");
 assert.equal(row.lexemeSenseDistinction,"pending");
 assert.equal(row.independentlyAdjudicated,false);
 assert.equal(row.productionVerified,false);
 for(const key of row.sourceReadingKeys){
  assert.ok(!sourceSeen.has(key),"Original source entry assigned twice");
  sourceSeen.add(key);
  const record=byKey.get(key);assert.ok(record);
  assert.equal(record.rank,row.rank);
  assert.equal(record.character,row.character);
  assert.equal(record.recordedReading.toLowerCase(),row.casefoldedPinyinLabel);
 }
}
assert.equal(unique.size,241);
assert.equal(sourceSeen.size,319);
console.log("241 casefolded pronunciation search groups preserve all 319 pinned source reading identities.");
