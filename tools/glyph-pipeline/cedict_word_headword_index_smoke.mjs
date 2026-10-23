import assert from "node:assert/strict";
import fs from "node:fs";
const d="data/semantic/cedict-crossref/";
const read=n=>JSON.parse(fs.readFileSync(d+n+"-v0.1.json","utf8"));
const audit=read("cedict-word-headword-index");
const hints=read("external-word-reading-observations");
const leads=read("dictionary-word-surface-leads");
assert.equal(audit.schema,"chromalect.semantic.cedict-word-headword-index.v0.1");
assert.equal(audit.status,"exact_snapshot_dictionary_headwords_not_sentence_readings_or_word_boundaries");
assert.equal(audit.source.license,"CC BY-SA 4.0");
assert.equal(audit.source.sourceDefinitionsCopied,false);
assert.equal(audit.source.sourceSentenceTextCopied,false);
for(const x of ["acquisitionArtifactZipSHA256","acquisitionReportSHA256","sourceCompressedSHA256","sourceUncompressedSHA256"])
 assert.match(audit.source[x],/^[0-9a-f]{64}$/);
assert.equal(audit.summary.sourceRowsParsed,125310);
assert.equal(audit.summary.requestedWordLeads,8);
assert.equal(audit.summary.wordLeadsWithHeadwords,5);
assert.equal(audit.summary.wordLeadsWithoutHeadwords,3);
assert.equal(audit.summary.exactHeadwordRecords,5);
assert.equal(audit.summary.independentlyVerifiedTatoebaReadings,0);
assert.equal(audit.summary.independentWordBoundaries,0);
assert.equal(audit.summary.approvedLexicalSenses,0);
assert.equal(audit.summary.productionApprovals,0);
assert.equal(audit.records.length,8);
const byId=new Map(leads.leads.map(x=>[x.id,x]));
let checked=0;
for(const r of audit.records){
 const lead=byId.get(r.leadId);
 assert.ok(lead);
 assert.equal(r.simplifiedWord,lead.surfaceWord);
 assert.equal(r.independentSentenceReadingVerified,false);
 assert.equal(r.independentWordBoundaryVerified,false);
 assert.equal(r.independentLexicalSenseApproved,false);
 assert.ok(r.headwords.length<=1);
 if(r.headwords.length){
  checked++;
  assert.equal(r.headwords[0].simplified,lead.surfaceWord);
  assert.match(r.headwords[0].pinyin,/^[a-z:]+[1-5] [a-z:]+[1-5]$/);
  assert.equal(hints.records.find(x=>x.leadId===r.leadId)?.status,"word_entry_reading_observed");
 }else assert.equal(hints.records.find(x=>x.leadId===r.leadId)?.status,"word_entry_not_yet_confirmed");
}
assert.equal(checked,5);
assert.equal(audit.records.find(x=>x.leadId==="guo-aspect").headwords.length,0);
assert.equal(audit.records.find(x=>x.leadId==="pao-dig").headwords.length,0);
assert.equal(audit.records.find(x=>x.leadId==="bao-plane").headwords.length,0);
console.log("Pinned current CC-CEDICT headword matches: five of eight, zero sentence approvals.");
