import assert from "node:assert/strict";
import fs from "node:fs";
const d="data/semantic/cedict-crossref/";
const groups=JSON.parse(fs.readFileSync(d+"contextual-pronunciation-search-groups-v0.1.json","utf8"));
const early=JSON.parse(fs.readFileSync(d+"tatoeba-sentence-id-index-v0.1.json","utf8"));
const hashed=JSON.parse(fs.readFileSync(d+"tatoeba-hash-sample-source-id-index-v0.1.json","utf8"));
const prior=JSON.parse(fs.readFileSync(d+"tatoeba-reading-coverage-upper-bound-v0.1.json","utf8"));
const build=function build(groups,early,hashed,prior){
 if(groups.summary.caseNormalizedPronunciationLabelGroups!==241||early.summary.characterSentenceAssociations!==423||
  hashed.summary.characterSentenceAssociations!==701||prior.summary.highAttentionCharacters!==142)throw Error("Input research ledger changed");
 const keys=new Map();
 for(const row of groups.records){
  if(!keys.has(row.rank))keys.set(row.rank,[]);
  keys.get(row.rank).push(row.casefoldedPinyinLabel);
 }
 const hashedBy=new Map(hashed.records.map(r=>[r.rank,r]));
 const records=early.records.map(r=>{
  const h=hashedBy.get(r.rank),pronunciations=keys.get(r.rank);
  if(!h||r.character!==h.character||!pronunciations?.length)throw Error("Source reading identity drift");
  const both=[...new Set([...r.sentenceIds,...h.sentenceIds])];
  const shortage=Math.max(0,pronunciations.length-both.length);
  return {rank:r.rank,character:r.character,pinnedCasefoldedReadingLabels:pronunciations,
   recordedPronunciationSearchGroups:pronunciations.length,
   firstSampleIds:r.sentenceIds.length,
   hashSampleIds:h.sentenceIds.length,
   combinedDistinctCharacterSentenceIds:both.length,
   sharedCharacterSentenceAssociations:r.sentenceIds.filter(id=>h.sentenceIds.includes(id)).length,
   minimumAdditionalIdsForHypotheticalOnePerPronunciation:shortage,
   boundClassification:shortage?"insufficient_raw_candidate_ids":"enough_ids_but_all_unassigned",
   contextToPronunciationAssignments:0,independentlyVerifiedReadings:0,approvedLexicalSenses:0};
 });
 const allIds=new Set([...early.records,...hashed.records].flatMap(r=>r.sentenceIds));
 const summary={characters:records.length,
  recordedPronunciationSearchGroups:groups.summary.caseNormalizedPronunciationLabelGroups,
  firstSampleCharacterSentenceAssociations:early.summary.characterSentenceAssociations,
  hashSampleCharacterSentenceAssociations:hashed.summary.characterSentenceAssociations,
  sharedCharacterSentenceAssociations:records.reduce((n,r)=>n+r.sharedCharacterSentenceAssociations,0),
  combinedDistinctCharacterSentenceAssociations:records.reduce((n,r)=>n+r.combinedDistinctCharacterSentenceIds,0),
  distinctCorpusSentenceIdsAcrossBoth:allIds.size,
  charactersWithInsufficientCandidateCount:records.filter(x=>x.boundClassification==="insufficient_raw_candidate_ids").length,
  minimumAdditionalCharacterSentenceIdsToReachNumericalPerPronunciationParity:records.reduce((n,r)=>n+r.minimumAdditionalIdsForHypotheticalOnePerPronunciation,0),
  independentlyVerifiedContextualReadings:0,independentlyApprovedLexicalSenses:0,approvedEmojiMappings:0};
 if(JSON.stringify([summary.characters,summary.recordedPronunciationSearchGroups,summary.sharedCharacterSentenceAssociations,summary.combinedDistinctCharacterSentenceAssociations,summary.distinctCorpusSentenceIdsAcrossBoth,summary.charactersWithInsufficientCandidateCount,summary.minimumAdditionalCharacterSentenceIdsToReachNumericalPerPronunciationParity])!==JSON.stringify([142,241,37,1087,1015,1,2]))throw Error("Combined summary expected values changed");
 return {schema:"chromalect.semantic.combined-corpus-phonetic-count-upper-bound.v0.1",
  status:"numerical_source_id_parity_only_no_context_reading_assignments",
  source:{firstThree:"tatoeba-sentence-id-index-v0.1.json",hashSample:"tatoeba-hash-sample-source-id-index-v0.1.json",readingGroups:"contextual-pronunciation-search-groups-v0.1.json"},
  interpretation:["Only compares the NUMBER of unique source IDs per character to the number of recorded case-normalized Pinyin labels.",
   "Even for 141 characters with enough IDs numerically, there may be no source example for one or more readings.",
   "An independently checked contextual word boundary, pronunciation, and licensed sentence quotation remain future evidence gates.",
   "Capitalization-only source entries remain separate lexical records and none has been adjudicated."],
  summary,records};
};
const report=build(groups,early,hashed,prior);
const path=d+"combined-corpus-phonetic-count-upper-bound-v0.1.json";
if(process.argv.includes("--check")){
 assert.deepEqual(JSON.parse(fs.readFileSync(path,"utf8")),report);
 console.log("Combined corpus count ceiling: 1 missing character, 2 minimum source-ID associations, 0 independent reading assignments.");
}else{
 fs.writeFileSync(path,JSON.stringify(report,null,2)+"\n");
 console.log("Wrote "+path);
}
