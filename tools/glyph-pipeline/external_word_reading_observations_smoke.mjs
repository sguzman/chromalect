import assert from "node:assert/strict";
import fs from "node:fs";
const prefix="data/semantic/cedict-crossref/";
const read=n=>JSON.parse(fs.readFileSync(prefix+n+"-v0.1.json","utf8"));
const sources=read("external-word-reading-observations");
const leads=read("dictionary-word-surface-leads");
const candidates=read("tatoeba-word-surface-id-index");
assert.equal(sources.schema,"chromalect.semantic.external-word-reading-observations.v0.1");
assert.equal(sources.status,"separate_word_entry_pronunciation_sources_not_sentence_context_adjudication");
assert.equal(sources.source.sourceSentenceTextCopied,false);
assert.equal(sources.source.sourceDefinitionsCopied,false);
assert.equal(sources.source.upstreamDictionaryDependenceNotEstablished,true);
assert.equal(sources.summary.dictionaryWordLeads,8);
assert.equal(sources.summary.externallyLocatedPublishedWordReadings,5);
assert.equal(sources.summary.leadsWithoutObservedExternalWordEntry,3);
assert.equal(sources.summary.independentlyVerifiedSentenceReadings,0);
assert.equal(sources.summary.independentlyAdjudicatedSentenceWordBoundaries,0);
assert.equal(sources.summary.independentLexicalSenseApprovals,0);
assert.equal(sources.summary.productionApprovals,0);
assert.equal(sources.records.length,8);
const leadById=new Map(leads.leads.map(x=>[x.id,x]));
const seen=new Set();let verifiedWordReadings=0;
for(const x of sources.records){
 const lead=leadById.get(x.leadId);
 assert.ok(lead&&!seen.has(x.leadId));seen.add(x.leadId);
 assert.equal(x.writtenWordLead,lead.surfaceWord);
 assert.equal(x.character,lead.character);
 assert.equal(x.publisherHeadingReading,lead.dictionaryHeadingReading);
 assert.equal(x.independentSentenceReadingVerification,false);
 assert.equal(x.independentWordBoundaryVerification,false);
 assert.equal(x.independentLexicalSenseApproval,false);
 if(x.status==="word_entry_reading_observed"){
  verifiedWordReadings++;
  assert.equal(x.targetReadingMatchesPublisherHeading,true);
  assert.ok(x.externalPublishedWordPinyin.length>0);
  assert.equal(x.observedTargetCharacterPinyin,lead.dictionaryHeadingReading);
  assert.ok(Number.isInteger(x.targetCharacterIndex)&&x.targetCharacterIndex>=0);
  assert.equal([...x.writtenWordLead][x.targetCharacterIndex],x.character);
  const url=new URL(x.externalSourceURL);
  assert.equal(url.hostname,"en.wiktionary.org");
  assert.equal(url.protocol,"https:");
  assert.ok(url.pathname.startsWith("/wiki/"));
 }else{
  assert.equal(x.status,"word_entry_not_yet_confirmed");
  assert.equal(x.externalSourceURL,null);
  assert.equal(x.externalPublishedWordPinyin,null);
  assert.equal(x.observedTargetCharacterPinyin,null);
  assert.equal(x.targetCharacterIndex,null);
  assert.equal(x.targetReadingMatchesPublisherHeading,null);
 }
}
assert.equal(verifiedWordReadings,5);
assert.deepEqual([...seen].sort(),candidates.records.map(x=>x.leadId).sort());
assert.deepEqual(sources.records.filter(x=>x.status==="word_entry_not_yet_confirmed").map(x=>x.leadId),
 ["guo-aspect","pao-dig","bao-plane"]);
console.log("Five externally published word pronunciations; zero sentence reading assignments.");
