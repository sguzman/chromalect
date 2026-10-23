// Reproduce evidence acquisition tasks; do not fabricate Mandarin usage examples.
import assert from "node:assert/strict";
import fs from "node:fs";
const dir="data/semantic/cedict-crossref/";
const priority=JSON.parse(fs.readFileSync(dir+"high-attention-evidence-priority-v0.1.json","utf8"));
const publisher=JSON.parse(fs.readFileSync(dir+"publisher-page-provenance-v0.2.json","utf8"));
const build=function build(prior,pages){
 if(prior.schema!=="chromalect.semantic.high-attention-reading-evidence-priority.v0.1"||prior.summary.highAttentionCharacters!==142||pages.summary.highAttentionCharactersRepresented!==23)
  throw Error("Pinned source research input changed");
 const checked=new Map();
 for(const e of pages.entries){
  if(!checked.has(e.rank))checked.set(e.rank,new Set());
  checked.get(e.rank).add(e.url);
 }
 const entries=[];
 for(const item of prior.records){
  const urls=[...(checked.get(item.rank)||[])].sort();
  for(const [i,reading] of item.recordedReadings.entries()){
   entries.push({rank:item.rank,character:item.character,recordedReading:reading,
    readingKey:`${item.rank}|${reading}`,readingOrder:i+1,
    candidateEvidencePriority:item.evidenceAcquisitionClass,
    researchReasons:item.priorityReasons,
    publisherSourceLinks:urls,
    publisherPageAccess:urls.length?"source_page_checked":"not_checked",
    contextualSentenceCollection:"pending",
    sentenceId:null,attestedSentence:null,sourceLicense:null,contributorAttribution:null,
    sourceURL:null,readerAssignedContextualReading:null,
    independentlyVerifiedContext:false,
    independentlyAdjudicatedLexicalSense:false,
    approvedEmojiComprehension:false,productionVerified:false});
  }
 }
 const summaries={
   highAttentionCharacters:prior.records.length,
   readingEntryTasks:entries.length,
   readingTasksWithPublisherPageLinks:entries.filter(e=>e.publisherSourceLinks.length).length,
   tasksWithoutPublisherPageLinks:entries.filter(e=>!e.publisherSourceLinks.length).length,
   tasksWithRetrievedSentences:0,
   independentContextualReadingVerifications:0,
   independentLexicalSenseApprovals:0,emojiComprehensionApprovals:0,productionSemanticApprovals:0
 };
 if(JSON.stringify([summaries.readingEntryTasks,summaries.readingTasksWithPublisherPageLinks,summaries.tasksWithoutPublisherPageLinks])!==JSON.stringify([319,50,269]))
   throw Error("High attention reading source counts drift "+JSON.stringify(summaries));
 const keys=new Set(entries.map(e=>e.readingKey));
 if(keys.size!==319)throw Error("Duplicate reading entry identities");
 return {schema:"chromalect.semantic.contextual-reading-evidence-workqueue.v0.1",
  status:"reading_specific_source_acquisition_only_no_attested_examples_or_lexical_approvals",
  source:{priorityLedger:"high-attention-evidence-priority-v0.1.json",
   publisherPageRegistry:"publisher-page-provenance-v0.2.json",
   pinnedDictionaryRevision:"63c2569948629323b515833930fdd10f285401b6"},
  candidateCorpusSources:[
   {name:"Tatoeba",url:"https://tatoeba.org",type:"candidate_sentence_corpus",
    conditions:"Use an actual numbered Chinese sentence record, provide the contributor or sentence-specific attribution, and check the sentence's license. Do not infer its character's target pronunciation solely from string occurrence.",
    licenseReference:"https://en.wiki.tatoeba.org/articles/show/using-the-tatoeba-corpus"},
   {name:"Other independently maintained corpus",url:null,type:"source_to_be_selected_and_verified",
    conditions:"Retain stable record IDs, source permissions, language variety and independent pronunciation/context adjudication."}
  ],
  stages:[
   "locate_primary_or_independent_source",
   "retrieve_identifiable_chinese_context_and_license",
   "verify_orthographic_word_boundary_and_language_variety",
   "independently_check_target_reading_in_context",
   "independently_adjudicate_usage_specific_sense",
   "separate_blind_pictogram_recognition_test"
  ],
  limitations:["A source page with a character's dictionary definition is not an independently attested contextual sentence.",
   "A Tatoeba sentence containing the character is not sufficient to assign its pronunciation or the relevant word sense.",
   "Tatoeba data may require sentence-level contributor attribution under CC BY 2.0 FR or an applicable individual license.",
   "No example sentences were retrieved or invented for this queue, and all independent adjudications remain pending."],
  summary:summaries,records:entries};
};
const report=build(priority,publisher);
const file=dir+"contextual-reading-evidence-workqueue-v0.1.json";
if(process.argv.includes("--check")){
 assert.deepEqual(JSON.parse(fs.readFileSync(file,"utf8")),report);
 console.log("Source acquisition: 319 reading tasks, zero retrieved sentences and approvals.");
}else{
 fs.writeFileSync(file,JSON.stringify(report,null,2)+"\n");
 console.log("Wrote "+file);
}
