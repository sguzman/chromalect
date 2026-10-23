import assert from "node:assert/strict";
import fs from "node:fs";
const d="data/semantic/cedict-crossref/";
const ps=["tatoeba-sentence-id-index-v0.1.json","tatoeba-hash-sample-source-id-index-v0.1.json","tatoeba-word-surface-id-index-v0.1.json"];
const [early,hash,word]=ps.map(p=>JSON.parse(fs.readFileSync(d+p,"utf8")));
const audit=function audit(early,hash,word){
 if(early.summary.characterSentenceAssociations!==423||hash.summary.characterSentenceAssociations!==701||
  word.summary.selectedWordSentenceAssociations!==27)throw Error("Corpus snapshot count or provenance drift");
 const existingByRank=new Map();
 for(const r of early.records)existingByRank.set(r.rank,new Set(r.sentenceIds));
 for(const r of hash.records){
  if(!existingByRank.has(r.rank))throw Error("Missing source character");
  for(const id of r.sentenceIds)existingByRank.get(r.rank).add(id);
 }
 const existing=new Set([...existingByRank.values()].flatMap(x=>[...x]));
 const all=new Set(existing);
 const perLead=word.records.map(r=>{
  const ids=r.sentenceIds;
  const previouslySeenInAnyCharacter=ids.filter(id=>existing.has(id)).length;
  const previouslySeenWithSameCharacter=ids.filter(id=>existingByRank.get(r.rank)?.has(id)).length;
  ids.forEach(id=>all.add(id));
  return {leadId:r.leadId,character:r.writtenWordLead,rank:r.rank,
   wordSelectedCandidateIds:ids.length,
   previouslySeenInAnyCharacter,
   previouslySeenWithSameCharacter,
   newGloballyDistinctCorpusSentenceIds:ids.length-previouslySeenInAnyCharacter,
   independentReadingVerification:false,lexicalSenseApproval:false};
 });
 const summary={originalCharacterOnlyDistinctSentenceIds:existing.size,wordSelectedDistinctSentenceIds:word.summary.uniqueSentenceIds,
  wordIdsAlreadyInCharacterResearch:perLead.reduce((n,r)=>n+r.previouslySeenInAnyCharacter,0),
  wordIdsPreviouslyAssignedToSameCharacter:perLead.reduce((n,r)=>n+r.previouslySeenWithSameCharacter,0),
  newDistinctSentenceIdsFromWordSurfaceStage:perLead.reduce((n,r)=>n+r.newGloballyDistinctCorpusSentenceIds,0),
  distinctSentenceIdsAcrossThreeCohorts:all.size,independentlyVerifiedContextualReadings:0,lexicalSenseApprovals:0};
 if(JSON.stringify(summary)!==JSON.stringify({originalCharacterOnlyDistinctSentenceIds:1015,wordSelectedDistinctSentenceIds:27,
  wordIdsAlreadyInCharacterResearch:3,wordIdsPreviouslyAssignedToSameCharacter:0,
  newDistinctSentenceIdsFromWordSurfaceStage:24,
  distinctSentenceIdsAcrossThreeCohorts:1039,independentlyVerifiedContextualReadings:0,lexicalSenseApprovals:0}))
  throw Error("Expected research union cardinality changed");
 return {schema:"chromalect.semantic.word-surface-corpus-overlap-audit.v0.1",
  status:"source_id_collection_cardinality_only_not_linguistic_validation",
  source:{firstThree:ps[0],hashSample:ps[1],wordSurface:ps[2]},
  summary,records:perLead,
  caution:"Source ID uniqueness does not imply separate phonetic readings or independent validated lexical senses."};
};
const report=audit(early,hash,word);
const path=d+"word-surface-corpus-overlap-audit-v0.1.json";
if(process.argv.includes("--check")){
 assert.deepEqual(JSON.parse(fs.readFileSync(path,"utf8")),report);
 console.log("Word-form source search added 24 globally distinct IDs; no verified readings.");
}else{fs.writeFileSync(path,JSON.stringify(report,null,2)+"\n");console.log("Wrote "+path);}
