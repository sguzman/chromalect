import assert from "node:assert/strict";
import fs from "node:fs";
const d="data/semantic/cedict-crossref/";
const packet=JSON.parse(fs.readFileSync(d+"external-dictionary-reconnaissance-v0.1.json","utf8"));
const matrix=JSON.parse(fs.readFileSync(d+"high-attention-evidence-priority-v0.1.json","utf8"));
assert.equal(packet.schema,"chromalect.semantic.external-dictionary-reconnaissance.v0.1");
assert.equal(packet.status,"preliminary_external_dictionary_comparison_not_independent_approval");
assert.equal(packet.source.ccCedictRevision,matrix.source.dictionaryRevision);
assert.equal(packet.summary.firstPriorityCharacters,5);
assert.equal(packet.summary.highAttentionCharacters,142);
assert.equal(packet.summary.readingEntriesConsidered,11);
assert.equal(packet.summary.externalSourceUrls,12);
assert.equal(packet.summary.sourcePacketsPrepared,5);
assert.equal(packet.summary.independentlyAdjudicatedContexts,0);
assert.equal(packet.summary.independentLexicalApproved,0);
assert.equal(packet.summary.independentEmojiApproved,0);
assert.equal(packet.summary.productionVerified,0);
const expected=new Set([127,142,201,339,905]);
for(const r of packet.records){
 assert.ok(expected.delete(r.rank));
 const canonical=matrix.records.find(m=>m.rank===r.rank);
 assert.ok(canonical&&canonical.evidenceAcquisitionClass===0);
 assert.equal(r.character,canonical.character);
 assert.deepEqual(r.dictionaryReadings,canonical.recordedReadings);
 assert.equal(r.lexicalReview,"pending");
 assert.equal(r.independentAdjudication,"pending");
 assert.equal(r.emojiComprehensionReview,"pending");
 assert.equal(r.productionVerified,false);
 const ids=new Set(r.sources.map(s=>s.id));
 assert.equal(ids.size,r.sources.length);
 assert.ok(r.sources.every(s=>s.url.startsWith("https://")&&s.sourceReadings.every(x=>r.dictionaryReadings.includes(x))));
 assert.equal(r.preliminaryReadingNotes.length,r.dictionaryReadings.length);
 for(const note of r.preliminaryReadingNotes){
  assert.ok(r.dictionaryReadings.includes(note.reading));
  assert.ok(note.sourceIds.every(id=>ids.has(id)));
  assert.ok(note.sourceBasedParaphrase&&note.unresolvedQuestion);
 }
}
assert.equal(expected.size,0);
console.log("Independent dictionary source reconnaissance: 5 priority characters, 11 readings, no approvals.");
