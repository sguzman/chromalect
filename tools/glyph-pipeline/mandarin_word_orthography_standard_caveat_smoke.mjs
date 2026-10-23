import assert from "node:assert/strict";
import fs from "node:fs";
const p="data/semantic/cedict-crossref/";
const caveat=JSON.parse(fs.readFileSync(p+"mandarin-word-orthography-standard-caveat-v0.1.json","utf8"));
const priority=JSON.parse(fs.readFileSync(p+"word-context-review-priority-v0.1.json","utf8"));
assert.equal(caveat.schema,"chromalect.semantic.mandarin-word-orthography-standard-caveat.v0.1");
assert.equal(caveat.status,"normative_pinyin_word_spelling_rule_not_attested_sentence_segmentation");
assert.equal(caveat.source.standard,"GB/T 16159-2012");
assert.equal(caveat.source.sourceSection,"1.2.1");
assert.equal(caveat.source.fullStandardTextCopied,false);
assert.equal(caveat.source.currentStatusAsOf,"2026-10-23");
for(const key of ["officialRegistryURL","ministryNoticeURL","educationalPublicationURL"]){
 const u=new URL(caveat.source[key]);assert.equal(u.protocol,"https:");
}
assert.equal(caveat.application.leadId,"guo-aspect");
assert.equal(caveat.application.writtenLead,"看过");
assert.equal(caveat.application.icuMachineHintNotDispositive,true);
const cohort=priority.records.filter(x=>x.leadId===caveat.application.leadId);
assert.equal(cohort.length,5);
assert.deepEqual(new Set(caveat.application.linkedCorpusSentenceIDs),new Set(cohort.map(x=>x.sentenceId)));
assert.equal(cohort.filter(x=>x.machineSegmentationHint==="multiple_icu_segments").length,4);
assert.equal(cohort.filter(x=>x.machineSegmentationHint==="cuts_icu_segment").length,1);
assert.equal(caveat.application.wordBoundariesIndependentlyVerified,0);
assert.equal(caveat.application.readingsIndependentlyVerified,0);
assert.equal(caveat.application.sentenceReusePermissionsCleared,0);
assert.equal(caveat.application.lexicalSenseApprovals,0);
console.log("Current Pinyin orthography standard caveat: conditional 看过 grammar, five unadjudicated occurrences.");
