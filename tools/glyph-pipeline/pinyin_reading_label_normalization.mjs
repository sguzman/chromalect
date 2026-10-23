import assert from "node:assert/strict";
import fs from "node:fs";
const base="data/semantic/cedict-crossref/";
const source=JSON.parse(fs.readFileSync(base+"polysemy-triage-v0.1.json","utf8"));
const build=function build(source){
 const records=source.records.map(r=>{
  const normalized=[...new Set(r.dictionaryReadings.map(x=>x.toLowerCase()))];
  return {rank:r.rank,character:r.character,recordedReadingLabels:r.dictionaryReadings,
   normalizedReadingLabels:normalized,sourcePath:r.sourcePath,sourceBlobSha:r.sourceBlobSha,
   originalTriageTier:r.triageTier,recordedEntryCount:r.dictionaryReadings.length,
   distinctCasefoldedLabelCount:normalized.length,
   casefoldedDuplicateCount:r.dictionaryReadings.length-normalized.length,
   caseOnlyMultiple:r.dictionaryReadings.length>1&&normalized.length===1,
   multipleNormalizedLabels:normalized.length>1,
   independentLexicalApproval:false,productionVerified:false};
 });
 const summary={
  charactersAudited:records.length,
  recordedSourceReadingEntries:records.reduce((n,r)=>n+r.recordedEntryCount,0),
  distinctCasefoldedLabelsByCharacter:records.reduce((n,r)=>n+r.distinctCasefoldedLabelCount,0),
  duplicateCasefoldedEntries:records.reduce((n,r)=>n+r.casefoldedDuplicateCount,0),
  multipleSourceEntryCharacters:records.filter(r=>r.recordedEntryCount>1).length,
  caseOnlyMultipleCharacters:records.filter(r=>r.caseOnlyMultiple).length,
  multipleNormalizedLabelCharacters:records.filter(r=>r.multipleNormalizedLabels).length,
  charactersWithSomeCapitalizationDuplicate:records.filter(r=>r.casefoldedDuplicateCount>0).length,
  higherPriorityCharacters:records.filter(r=>r.originalTriageTier==="higher").length,
  higherPriorityCaseOnlyCharacters:records.filter(r=>r.originalTriageTier==="higher"&&r.caseOnlyMultiple).length,
  higherPriorityMultipleNormalizedCharacters:records.filter(r=>r.originalTriageTier==="higher"&&r.multipleNormalizedLabels).length,
  independentLexicalApproved:0,independentEmojiApproved:0,productionVerified:0
 };
 const vals=Object.values(summary).slice(0,11);
 if(JSON.stringify(vals)!==JSON.stringify([1000,1393,1191,202,339,166,173,201,142,55,87]))
  throw new Error("Unexpected normalization counts: "+vals);
 return {schema:"chromalect.semantic.pinyin-reading-label-normalization.v0.1",
  status:"mechanical_casefolding_of_dictionary_pinyin_not_verified_pronunciations",
  source:{triage:"polysemy-triage-v0.1.json",
   dictionaryRevision:"63c2569948629323b515833930fdd10f285401b6",license:"CC BY-SA 4.0"},
  caveats:[
   "Capitalized source reading labels frequently reflect proper names and may duplicate lowercase pronunciations.",
   "Distinct lowercased Pinyin labels need further verification for actual contemporary Mainland Mandarin uses.",
   "The original 339 multi-entry characters and 142 high-attention queue members remain unchanged.",
   "No source reading, selected emoji, independent approval or whole-word meaning is modified."
  ],summary,records};
};
const result=build(source),target=base+"pinyin-reading-label-normalization-v0.1.json";
if(process.argv.includes("--check")){
 assert.deepEqual(JSON.parse(fs.readFileSync(target,"utf8")),result);
 console.log("Dictionary reading labels checked: 1000 characters, 166 case-only multiples, zero approvals.");
}else{
 fs.writeFileSync(target,JSON.stringify(result,null,2)+"\n");
 console.log("Wrote "+target);
}
