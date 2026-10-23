import assert from "node:assert/strict";
import fs from "node:fs";
const base="data/semantic/cedict-crossref/";
const packet=JSON.parse(fs.readFileSync(base+"unmatched-corpus-character-source-escalation-v0.1.json","utf8"));
const initial=JSON.parse(fs.readFileSync(base+"tatoeba-sentence-id-index-v0.1.json","utf8"));
const hash=JSON.parse(fs.readFileSync(base+"tatoeba-hash-sample-source-id-index-v0.1.json","utf8"));
const prioritized=JSON.parse(fs.readFileSync(base+"high-attention-evidence-priority-v0.1.json","utf8"));
assert.equal(packet.schema,"chromalect.semantic.unmatched-corpus-character-source-escalation.v0.1");
assert.equal(packet.status,"publisher_dictionary_source_leads_only_no_corpus_attestation");
assert.deepEqual(packet.summary,{unmatchedHighAttentionCharacters:1,originalCorpusCandidateIds:0,
 hashSampleCandidateIds:0,externalPublisherPagesInspected:4,pinnedPronunciationLabels:2,
 independentlyVerifiedContextualPronunciations:0,independentlyApprovedLexicalSenses:0,
 independentlyApprovedPictograms:0,productionSemanticApprovals:0});
assert.equal(packet.records.length,1);
const row=packet.records[0],rank=821;
assert.equal(row.rank,rank);
assert.equal(row.character,"刨");
assert.deepEqual(row.pinnedReadingLabels,prioritized.records.find(x=>x.rank===rank).recordedReadings);
assert.deepEqual(row.originalCorpusCandidateIds,initial.records.find(x=>x.rank===rank).sentenceIds);
assert.deepEqual(row.hashSampleCandidateIds,hash.records.find(x=>x.rank===rank).sentenceIds);
assert.equal(row.corpusSentenceAttestation,"not_observed_in_selected_Tatoeba_snapshot");
assert.equal(row.sourcePages.length,4);
const urls=new Set(),readingLabels=new Set();
for(const s of row.sourcePages){
 assert.ok(s.publisher&&s.region&&s.sourceScope);
 assert.ok(s.url.startsWith("https://")&&!urls.has(s.url));
 urls.add(s.url);
 s.displayedPinyinLabels.forEach(x=>readingLabels.add(x));
}
assert.deepEqual([...readingLabels].sort(),["bào","páo"]);
assert.equal(urls.size,4);
assert.deepEqual(row.preliminarySenseContextLeads.map(x=>x.pinnedReading).sort(),["bao4","pao2"]);
assert.ok(row.preliminarySenseContextLeads.every(x=>x.status==="dictionary_leads_only"&&x.researchWords.length>=2));
assert.equal(row.independentLexicalApproval,false);
assert.equal(row.approvedEmojiMapping,false);
assert.equal(row.productionVerified,false);
console.log("Unmatched 刨: four independently hosted dictionary source pages, two pronunciation research leads, zero corpus-attested approvals.");
