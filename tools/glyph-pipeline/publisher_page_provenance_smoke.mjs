import assert from "node:assert/strict";
import fs from "node:fs";
const d="data/semantic/cedict-crossref/";
const v=JSON.parse(fs.readFileSync(d+"publisher-page-provenance-v0.1.json","utf8"));
const p=JSON.parse(fs.readFileSync(d+"high-attention-evidence-priority-v0.1.json","utf8"));
const a=JSON.parse(fs.readFileSync(d+"external-dictionary-reconnaissance-v0.1.json","utf8"));
const b=JSON.parse(fs.readFileSync(d+"external-dictionary-discrepancy-v0.1.json","utf8"));
assert.equal(v.schema,"chromalect.semantic.publisher-page-provenance.v0.1");
assert.equal(v.status,"source_headword_reading_labels_checked_not_lexical_approval");
assert.deepEqual(v.summary,{publisherPagesChecked:14,highAttentionCharactersRepresented:10,highAttentionUniverse:142,independentlyAdjudicatedSenses:0,emojiApprovals:0,productionApprovals:0});
const ranks=new Set([...a.records,...b.records].map(x=>x.rank));
assert.equal(ranks.size,10);
const urls=new Set(),seen=new Set();
for(const entry of v.entries){
 assert.ok(ranks.has(entry.rank));
 assert.equal(p.records.find(x=>x.rank===entry.rank).character,entry.character);
 assert.ok(entry.url.startsWith("https://")&&!urls.has(entry.url));
 assert.equal(entry.verification,"page_text_opened_and_headword_checked");
 assert.ok(entry.prominentReadings.length>0);
 urls.add(entry.url);seen.add(entry.rank);
}
assert.equal(urls.size,14);assert.equal(seen.size,10);
assert.equal(v.conflicts.length,1);
const c=v.conflicts[0];
assert.equal(c.rank,379);assert.equal(c.pinnedCedict,"Guo4");
assert.equal(c.externalZdic,"guō");assert.equal(c.status,"unresolved");
console.log("Publisher provenance: 14 source pages / 10 characters checked, surname conflict retained, zero approvals.");
