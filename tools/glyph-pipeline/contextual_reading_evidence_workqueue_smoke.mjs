import assert from "node:assert/strict";
import fs from "node:fs";
const dir="data/semantic/cedict-crossref/";
const report=JSON.parse(fs.readFileSync(dir+"contextual-reading-evidence-workqueue-v0.1.json","utf8"));
const prior=JSON.parse(fs.readFileSync(dir+"high-attention-evidence-priority-v0.1.json","utf8"));
const s=report.summary;
assert.equal(report.schema,"chromalect.semantic.contextual-reading-evidence-workqueue.v0.1");
assert.equal(report.status,"reading_specific_source_acquisition_only_no_attested_examples_or_lexical_approvals");
assert.equal(s.highAttentionCharacters,142);
assert.equal(s.readingEntryTasks,319);
assert.equal(s.readingTasksWithPublisherPageLinks,50);
assert.equal(s.tasksWithoutPublisherPageLinks,269);
for(const field of ["tasksWithRetrievedSentences","independentContextualReadingVerifications",
 "independentLexicalSenseApprovals","emojiComprehensionApprovals","productionSemanticApprovals"])
 assert.equal(s[field],0);
const seen=new Set(),byRank=new Map(prior.records.map(x=>[x.rank,x]));
for(const e of report.records){
 const p=byRank.get(e.rank);assert.ok(p);
 assert.equal(e.character,p.character);
 assert.ok(p.recordedReadings.includes(e.recordedReading));
 assert.ok(!seen.has(e.readingKey));
 assert.equal(e.readingKey,e.rank+"|"+e.recordedReading);
 assert.equal(e.candidateEvidencePriority,p.evidenceAcquisitionClass);
 assert.equal(e.publisherPageAccess,e.publisherSourceLinks.length?"source_page_checked":"not_checked");
 assert.equal(e.contextualSentenceCollection,"pending");
 assert.equal(e.sentenceId,null);
 assert.equal(e.attestedSentence,null);
 assert.equal(e.readerAssignedContextualReading,null);
 assert.equal(e.independentlyVerifiedContext,false);
 assert.equal(e.independentlyAdjudicatedLexicalSense,false);
 assert.equal(e.approvedEmojiComprehension,false);
 assert.equal(e.productionVerified,false);
 seen.add(e.readingKey);
}
assert.equal(seen.size,319);
assert.equal(report.records.filter(x=>x.character==="过").length,3);
console.log("319 source acquisition tasks: exact pinned reading identities, license-aware context slots, zero fabricated attestations.");
