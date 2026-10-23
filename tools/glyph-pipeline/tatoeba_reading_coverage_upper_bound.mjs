import assert from "node:assert/strict";
import fs from "node:fs";
const d="data/semantic/cedict-crossref/";
const groups=JSON.parse(fs.readFileSync(d+"contextual-pronunciation-search-groups-v0.1.json","utf8"));
const ids=JSON.parse(fs.readFileSync(d+"tatoeba-sentence-id-index-v0.1.json","utf8"));
const build=function build(source,ids){
 if(source.summary.caseNormalizedPronunciationLabelGroups!==241||ids.summary.characterSentenceAssociations!==423)throw Error("Source changed");
 const labels=new Map();
 for(const row of source.records){
  if(!labels.has(row.rank))labels.set(row.rank,[]);
  labels.get(row.rank).push(row.casefoldedPinyinLabel);
 }
 const records=ids.records.map(r=>{
  const phonetic=labels.get(r.rank)||[];
  if(!phonetic.length||new Set(phonetic).size!==phonetic.length)throw Error("Missing grouped reading");
  const deficit=Math.max(0,phonetic.length-r.sentenceIds.length);
  return {rank:r.rank,character:r.character,caseNormalizedReadingLabels:phonetic,
   caseNormalizedReadingLabelCount:phonetic.length,
   surfaceCandidateIdCount:r.sentenceIds.length,
   minimumAdditionalDistinctSourceIdsForHypotheticalOnePerLabel:deficit,
   sourceIdCountBelowReadingLabelCount:deficit>0,
   contextualReadingAssignment:"not_performed",
   independentlyVerifiedContextualReadings:0,approvedLexicalSenses:0};
 });
 const summary={
  highAttentionCharacters:records.length,
  distinctCasefoldedReadingLabels:source.summary.caseNormalizedPronunciationLabelGroups,
  characterSentenceAssociations:ids.summary.characterSentenceAssociations,
  charactersBelowHypotheticalOneIdPerReading:records.filter(r=>r.sourceIdCountBelowReadingLabelCount).length,
  minimumExtraSourceIdAssociationsForHypotheticalCoverage:records.reduce((n,r)=>n+r.minimumAdditionalDistinctSourceIdsForHypotheticalOnePerLabel,0),
  independentlyVerifiedContextualReadings:0,lexicalSenseApprovals:0,
  distribution:records.reduce((a,r)=>{const k=`${r.caseNormalizedReadingLabelCount}-reading-labels_${r.surfaceCandidateIdCount}-source-ids`;a[k]=(a[k]||0)+1;return a},{})
 };
 if(summary.charactersBelowHypotheticalOneIdPerReading!==2||summary.minimumExtraSourceIdAssociationsForHypotheticalCoverage!==3)throw Error("Expected structural shortfall does not hold");
 return {schema:"chromalect.semantic.tatoeba-reading-coverage-upper-bound.v0.1",
  status:"count_only_upper_bound_neither_attestation_nor_pronunciation_validation",
  sources:{caseNormalizedSearchGroups:"contextual-pronunciation-search-groups-v0.1.json",corpusSentenceIds:"tatoeba-sentence-id-index-v0.1.json"},
  caution:["Source IDs were selected by character string occurrence, not independently confirmed contextual pronunciation.",
   "Even where candidate IDs are at least as numerous as reading labels, all candidates may express one pronunciation.",
   "Capitalization-only lexical source entries remain separate from their shared phonetic search groups.",
   "The structural shortfall is a lower bound on additional research, not a measurement of verified reading coverage."],
  summary,records};
};
const report=build(groups,ids);
const path=d+"tatoeba-reading-coverage-upper-bound-v0.1.json";
if(process.argv.includes("--check")){
 assert.deepEqual(JSON.parse(fs.readFileSync(path,"utf8")),report);
 console.log("Surface-only coverage structural gap: 2 characters; 3 minimally missing IDs; 0 verified readings.");
}else{fs.writeFileSync(path,JSON.stringify(report,null,2)+"\n");console.log("Wrote "+path);}
