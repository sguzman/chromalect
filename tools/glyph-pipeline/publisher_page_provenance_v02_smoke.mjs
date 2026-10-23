import assert from "node:assert/strict";
import fs from "node:fs";
const d="data/semantic/cedict-crossref/";
const old=JSON.parse(fs.readFileSync(d+"publisher-page-provenance-v0.1.json","utf8"));
const now=JSON.parse(fs.readFileSync(d+"publisher-page-provenance-v0.2.json","utf8"));
const priority=JSON.parse(fs.readFileSync(d+"high-attention-evidence-priority-v0.1.json","utf8"));
assert.equal(now.schema,"chromalect.semantic.publisher-page-provenance.v0.2");
assert.equal(now.supersedes,"publisher-page-provenance-v0.1.json");
assert.equal(now.status,old.status);
assert.equal(now.summary.publisherPagesChecked,27);
assert.equal(now.summary.highAttentionCharactersRepresented,23);
assert.equal(now.summary.sourceOnlyCharactersNotDeskReviewed,13);
assert.equal(now.summary.independentlyAdjudicatedSenses,0);
assert.equal(now.summary.emojiApprovals,0);
assert.equal(now.summary.productionApprovals,0);
const urls=new Set(),chars=new Set();
for(const row of now.entries){
 assert.ok(row.url.startsWith("https://")&&!urls.has(row.url));
 assert.ok(row.prominentReadings.length>0);
 assert.equal(row.verification,"page_text_opened_and_headword_checked");
 assert.equal(priority.records.find(r=>r.rank===row.rank)?.character,row.character);
 urls.add(row.url);chars.add(row.rank);
}
assert.equal(urls.size,27);assert.equal(chars.size,23);
for(const prior of old.entries)assert.ok(now.entries.some(x=>x.url===prior.url&&
 JSON.stringify(x.prominentReadings)===JSON.stringify(prior.prominentReadings)));
const added=now.entries.filter(x=>!old.entries.some(y=>y.url===x.url));
assert.equal(added.length,13);
assert.ok(added.every(x=>priority.records.find(r=>r.rank===x.rank)?.evidenceAcquisitionClass===1));
assert.equal(now.conflicts[0].pinnedCedict,"Guo4");
assert.equal(now.conflicts[0].externalZdic,"guō");
assert.equal(now.conflicts[0].status,"unresolved");
assert.equal(now.sourceInventoryDifferences.length,1);
assert.equal(now.sourceInventoryDifferences[0].character,"齐");
assert.equal(now.sourceInventoryDifferences[0].status,"research_only_not_imported");
console.log("Publisher page provenance v0.2: 27 checked pages, 23 characters, 13 newly added; 0 approvals.");
