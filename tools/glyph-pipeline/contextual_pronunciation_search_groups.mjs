// Group case-equivalent Pinyin labels for evidence search, preserving original entries.
import assert from "node:assert/strict";
import fs from "node:fs";
const dir="data/semantic/cedict-crossref/";
const raw=JSON.parse(fs.readFileSync(dir+"contextual-reading-evidence-workqueue-v0.1.json","utf8"));
const normalized=JSON.parse(fs.readFileSync(dir+"pinyin-reading-label-normalization-v0.1.json","utf8"));
const build=function build(raw,normalized){
 if(raw.summary.readingEntryTasks!==319||normalized.summary.higherPriorityCharacters!==142||
    raw.summary.independentLexicalSenseApprovals!==0||normalized.summary.independentLexicalApproved!==0)
  throw Error("Input scope or independent approval status changed");
 const tasks=new Map();
 for(const x of raw.records)tasks.set(x.readingKey,x);
 const groups=[];
 for(const r of normalized.records.filter(x=>x.originalTriageTier==="higher")){
  for(const phonetic of r.normalizedReadingLabels){
   const sources=r.recordedReadingLabels.filter(label=>label.toLowerCase()===phonetic);
   if(!sources.length)throw Error("Missing source labels");
   const linked=sources.map(label=>tasks.get(r.rank+"|"+label));
   if(linked.some(x=>!x||x.character!==r.character))throw Error("Missing original source task");
   groups.push({
    rank:r.rank,character:r.character,casefoldedPinyinLabel:phonetic,
    evidenceGroupKey:r.rank+"|"+phonetic,
    sourceReadingKeys:linked.map(x=>x.readingKey),
    originalSourceReadingLabels:sources,
    sourceEntryCount:sources.length,
    includesNameCapitalization:sources.some(x=>x[0]!==x[0].toLowerCase()),
    evidenceAcquisitionPriority:linked[0].candidateEvidencePriority,
    checkedPublisherLinks:linked[0].publisherSourceLinks,
    sourceAcquisitionStatus:"pending",
    contextualPronunciationVerification:"pending",
    lexemeSenseDistinction:"pending",
    independentlyAdjudicated:false,productionVerified:false
   });
  }
 }
 groups.sort((a,b)=>a.evidenceAcquisitionPriority-b.evidenceAcquisitionPriority||a.rank-b.rank||(a.casefoldedPinyinLabel<b.casefoldedPinyinLabel?-1:a.casefoldedPinyinLabel>b.casefoldedPinyinLabel?1:0));
 const summary={
  characters:142,rawDictionaryReadingEntries:319,
  caseNormalizedPronunciationLabelGroups:groups.length,
  sourceEntriesSharingCaseNormalizedLabels:groups.reduce((n,g)=>n+g.sourceEntryCount-1,0),
  groupsContainingCapitalizedSourceLabels:groups.filter(x=>x.includesNameCapitalization).length,
  sourceGroupContextsRetrieved:0,
  independentlyAdjudicatedContextualPronunciations:0,
  independentlyAdjudicatedLexicalSenses:0,approvedEmojiComprehension:0,productionVerified:0
 };
 if(summary.caseNormalizedPronunciationLabelGroups!==241||
    summary.sourceEntriesSharingCaseNormalizedLabels!==78||
    summary.rawDictionaryReadingEntries!==groups.reduce((n,g)=>n+g.sourceEntryCount,0))
   throw Error("Unexpected phonetic grouping baseline");
 return {
  schema:"chromalect.semantic.contextual-pronunciation-search-groups.v0.1",
  status:"casefolded_pinyin_evidence_search_deduplication_not_sense_merger",
  input:{
   contextWorkqueue:"contextual-reading-evidence-workqueue-v0.1.json",
   canonicalNormalization:"pinyin-reading-label-normalization-v0.1.json"
  },
  interpretation:[
   "Group Pinyin labels only for pronunciation-evidence search; each original CC-CEDICT reading entry remains independently traceable.",
   "A capitalized surname entry and its lowercase pronunciation may share a phonetic search group but have different usage and sense evidence requirements.",
   "Neither casefolding nor apparent phonetic agreement independently verifies a contemporary Mandarin reading, usage, lexeme or approved emoji.",
   "No grouped record contains an attested example or independently approved sense."
  ],summary,records:groups
 };
};
const report=build(raw,normalized);
const path=dir+"contextual-pronunciation-search-groups-v0.1.json";
if(process.argv.includes("--check")){
 assert.deepEqual(JSON.parse(fs.readFileSync(path,"utf8")),report);
 console.log("Pronunciation search grouping: 241 groups from 319 source entries; 78 case duplicates; no approvals.");
}else{
 fs.writeFileSync(path,JSON.stringify(report,null,2)+"\n");
 console.log("Wrote "+path);
}
