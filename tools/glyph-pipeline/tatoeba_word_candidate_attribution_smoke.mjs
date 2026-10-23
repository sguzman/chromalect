import assert from "node:assert/strict";
import fs from "node:fs";
const d="data/semantic/cedict-crossref/";
const a=JSON.parse(fs.readFileSync(d+"tatoeba-word-candidate-attribution-v0.1.json","utf8"));
const ids=JSON.parse(fs.readFileSync(d+"tatoeba-word-surface-id-index-v0.1.json","utf8"));
assert.equal(a.schema,"chromalect.semantic.tatoeba-word-candidate-attribution.v0.1");
assert.equal(a.status,"retrieved_corpus_contributor_metadata_not_individual_license_or_linguistic_approval");
assert.deepEqual(a.summary,{selectedCorpusSentenceIDs:27,distinctPublicCorpusContributors:20,
 sourceWordLeadsRepresented:6,individuallyCheckedSentenceLicenses:0,
 independentContextualPronunciationsVerified:0,independentlyAdjudicatedLexicalSenses:0,approvedPictograms:0});
assert.equal(a.source.snapshotSHA256,ids.source.uncompressedTSVSha256);
assert.equal(a.source.checkedAgainstLiveSentencePages,false);
assert.equal(a.records.length,27);
const grouped=new Map(),authors=new Set(),unique=new Set();
for(const r of a.records){
 assert.ok(!unique.has(r.sentenceId)&&/^\d+$/.test(r.sentenceId));unique.add(r.sentenceId);
 assert.ok(r.contributor&&typeof r.contributor==="string");authors.add(r.contributor);
 assert.equal(r.sourceURL,"https://tatoeba.org/en/sentences/show/"+r.sentenceId);
 assert.equal(r.sourceTextCopied,false);
 assert.equal(r.individualLicenseStatus,"pending_live_record_check");
 assert.equal(r.wordBoundaryVerified,false);
 assert.equal(r.readingVerified,false);assert.equal(r.lexicalSenseApproved,false);
 if(!grouped.has(r.leadId))grouped.set(r.leadId,[]);
 grouped.get(r.leadId).push(r.sentenceId);
}
assert.equal(unique.size,27);assert.equal(authors.size,20);
for(const row of ids.records)assert.deepEqual(grouped.get(row.leadId)||[],row.sentenceIds);
console.log("Tatoeba word-form attribution: 27 source IDs, 20 public contributor names, no copied text or lexical approvals.");