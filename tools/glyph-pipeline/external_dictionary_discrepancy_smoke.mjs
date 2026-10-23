import assert from "node:assert/strict";
import fs from "node:fs";
const d="data/semantic/cedict-crossref/";
const note=JSON.parse(fs.readFileSync(d+"external-dictionary-discrepancy-v0.1.json","utf8"));
const priority=JSON.parse(fs.readFileSync(d+"high-attention-evidence-priority-v0.1.json","utf8"));
assert.equal(note.schema,"chromalect.semantic.external-dictionary-discrepancy.v0.1");
assert.equal(note.status,"external_dictionary_desk_comparison_not_independent_lexical_approval");
assert.equal(note.source.pinnedDictionaryRevision,priority.source.dictionaryRevision);
assert.deepEqual(note.summary,{recordsPrepared:5,readingSlots:11,priorityClass:1,
 unresolvedPronunciationConflicts:1,independentLexicalApproval:0,
 independentEmojiApproval:0,productionVerified:0});
const expected=new Set([164,231,379,401,407]);
let conflicts=0,reads=0;
for(const r of note.records){
 assert.ok(expected.delete(r.rank));
 const p=priority.records.find(x=>x.rank===r.rank);
 assert.equal(p.evidenceAcquisitionClass,1);
 assert.equal(r.character,p.character);
 assert.deepEqual(r.pinnedDictionaryReadings,p.recordedReadings);
 assert.equal(r.preliminaryReadingComparisons.length,r.pinnedDictionaryReadings.length);
 assert.ok(r.externalSource.url.startsWith("https://zdic.net/hans/"));
 assert.ok(r.externalSource.publisher);
 assert.equal(r.independentLexicalApproval,false);
 assert.equal(r.independentEmojiApproval,false);
 assert.equal(r.productionVerified,false);
 const seen=new Set();
 for(const n of r.preliminaryReadingComparisons){
  assert.ok(r.pinnedDictionaryReadings.includes(n.reading));
  assert.ok(!seen.has(n.reading));
  seen.add(n.reading);
  assert.ok(n.sourceComparison.length>=40);
  if(n.unresolvedCategory==="unresolved_source_pronunciation_conflict"){
   assert.equal(r.rank,379);assert.equal(n.reading,"Guo4");
   assert.ok(r.externalSource.reportedReadingLabels.includes("guo1"));
   conflicts++;
  }
 }
 reads+=r.pinnedDictionaryReadings.length;
}
assert.equal(expected.size,0);
assert.equal(reads,11);
assert.equal(conflicts,1);
console.log("Five external-dictionary desk comparisons: 11 readings, one unresolved conflicting surname tone, no approvals.");
