// Reproduce a reading-sensitive English gloss audit from pinned sources.
// Literal matches are triage hints; no verified Mandarin senses are inferred.
import assert from "node:assert/strict";
import fs from "node:fs";
const dir="data/semantic/cedict-crossref/";
const full=JSON.parse(fs.readFileSync(dir+"full-lexical-review-queue-v0.1.json","utf8"));
const poly=JSON.parse(fs.readFileSync(dir+"polysemy-triage-v0.1.json","utf8"));
const build=function build(poly,full){
 if(poly.records.length!==1000||full.records.length!==897||
    poly.summary.independentLexicalApproved!==0||full.counts.productionVerified!==0)
  throw new Error("Input source counts or approval status changed");
 const byRank=new Map();
 for(const sense of full.records){
  if(!byRank.has(sense.rank))byRank.set(sense.rank,[]);
  byRank.get(sense.rank).push(sense);
 }
 let no=0,all=0,subset=0;
 const records=poly.records.map((record,i)=>{
  if(record.rank!==i+1||record.independentLexicalApproval!==false)
   throw new Error("Unaligned polysemy record");
  const candidates=(byRank.get(record.rank)||[]).map(s=>{
   if(s.character!==record.character||
     JSON.stringify(s.dictionaryReadings)!==JSON.stringify(record.dictionaryReadings))
    throw new Error("Source reading identities disagree");
   const matched=s.matchingDictionaryReadings;
   if(new Set(matched).size!==matched.length||
      matched.some(r=>!record.dictionaryReadings.includes(r))||
      Boolean(matched.length)!==s.strictWholeTermMatch)
    throw new Error("Literal matching index disagrees with source");
   const alignment=matched.length===0?"no_whole_term_match":
     matched.length===record.dictionaryReadings.length?"all_recorded_readings":
     "subset_of_recorded_readings";
   if(alignment==="no_whole_term_match")no++;
   else if(alignment==="all_recorded_readings")all++;
   else subset++;
   if(s.lexicalDecision!=="pending"||s.productionVerified!==false)
    throw new Error("Unexpected approval");
   return {selectedMeaning:s.selectedMeaning,alignment,
    literalMatchingReadings:matched,strictWholeTermMatch:s.strictWholeTermMatch};
  });
  return {rank:record.rank,character:record.character,
   dictionaryReadings:record.dictionaryReadings,triageTier:record.triageTier,
   candidateCount:candidates.length,candidates,
   hasReadingSubsetLiteralMatch:candidates.some(c=>c.alignment==="subset_of_recorded_readings"),
   lexicalReview:"pending",productionVerified:false};
 });
 const summary={
  charactersAudited:1000,proposedExpressions:full.records.length,
  charactersWithMultipleReadings:poly.summary.charsWithMultipleDictionaryReadings,
  higherAttentionCharacters:poly.summary.higherPriority,
  noEmojiCandidateCharacters:poly.summary.charsWithNoEmojiCandidate,
  noWholeTermMatchExpressions:no,allReadingLiteralMatchExpressions:all,
  subsetReadingLiteralMatchExpressions:subset,
  subsetReadingLiteralMatchCharacters:records.filter(r=>r.hasReadingSubsetLiteralMatch).length,
  independentLexicalApproved:0,independentEmojiApproved:0,productionVerified:0};
 if(no!==248||all!==437||subset!==212||
    summary.subsetReadingLiteralMatchCharacters!==208||
    summary.noEmojiCandidateCharacters!==119||
    summary.charactersWithMultipleReadings!==339||
    summary.higherAttentionCharacters!==142)
  throw new Error("Unexpected baseline audit metrics");
 return {
  schema:"chromalect.semantic.reading-sensitive-literal-gloss-audit.v0.1",
  status:"automated_english_gloss_reading_distribution_not_lexical_verification",
  source:{
   fullLexicalReviewQueue:"full-lexical-review-queue-v0.1.json",
   polysemyTriage:"polysemy-triage-v0.1.json",
   dictionaryRevision:"63c2569948629323b515833930fdd10f285401b6",
   dictionaryLicense:"CC BY-SA 4.0"
  },
  interpretation:[
   "A matching English string under one dictionary reading does not prove that the character sense is verified for that pronunciation.",
   "Different dictionary readings include surnames, historical and grammatical uses; a subset match is a review signal, not an error.",
   "Gloss fragments and reading counts are not independently adjudicated Mandarin senses.",
   "No automatic machine comparison changes lexical approval, emoji comprehension, or production status."
  ],
  summary,records
 };
};
const report=build(poly,full);
const target=dir+"reading-sensitive-gloss-audit-v0.1.json";
if(process.argv.includes("--check")){
 assert.deepEqual(JSON.parse(fs.readFileSync(target,"utf8")),report);
 console.log("Reading-sensitive literal gloss audit: "+report.summary.charactersAudited+
  " characters, "+report.summary.subsetReadingLiteralMatchExpressions+
  " partial-reading literal matches, zero approvals.");
}else{
 fs.writeFileSync(target,JSON.stringify(report,null,2)+"\n");
 console.log("Wrote "+target);
}
