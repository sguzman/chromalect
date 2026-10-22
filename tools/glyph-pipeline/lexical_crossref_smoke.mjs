import assert from "node:assert/strict";
import fs from "node:fs";
const base="data/semantic/cedict-crossref/";
const manifest=JSON.parse(fs.readFileSync(base+"manifest-v0.1.json","utf8"));
const glyphs=JSON.parse(fs.readFileSync("data/semantic/mandarin-1000-v0.1.json","utf8"));
assert.equal(manifest.schema,"chromalect.semantic.lexical-crossref-summary.v0.1");
assert.equal(manifest.status,"independent_dictionary_ingestion_only_not_validated");
assert.equal(manifest.source.snapshotCommit,"63c2569948629323b515833930fdd10f285401b6");
assert.equal(manifest.source.dataLicense,"CC BY-SA 4.0");
assert.equal(manifest.records.length,manifest.metrics.crossReferenced);
assert.ok(manifest.batches.length>=35,"Dictionary batches must not regress below rank 500");
assert.equal(manifest.metrics.manualSenseReviewed,0);
assert.equal(manifest.metrics.emojiComprehensionReviewed,0);
assert.equal(manifest.metrics.productionVerified,0);
const combined=[];
for(const group of manifest.batches){
 assert.match(group.path,/^[0-9]{4}-[0-9]{4}\.json$/);
 const data=JSON.parse(fs.readFileSync(base+group.path,"utf8"));
 assert.equal(data.schema,"chromalect.mandarin.lexical-crossref-batch.v0.1");
 assert.equal(data.source.commit,manifest.source.snapshotCommit);
 assert.equal(data.source.dataLicense,manifest.source.dataLicense);
 assert.equal(data.rankStart,group.start);
 assert.equal(data.rankEnd,group.end);
 assert.equal(data.records.length,data.rankEnd-data.rankStart+1);
 assert.equal(data.summary.total,data.records.length);
 combined.push(...data.records);
}
assert.equal(combined.length,manifest.metrics.crossReferenced);
let found=0,withCandidate=0,expr=0,literal=0,needsReview=0,charactersWithLiteral=0;
for(const [i,row] of combined.entries()){
 const rank=i+1;
 assert.equal(row.rank,rank);
 assert.equal(row.character,glyphs.characters[i].character);
 assert.equal(row.character,manifest.records[i].character);
 assert.ok(/^v2\/.+\.json$/.test(row.sourcePath));
 assert.match(row.sourceBlobSha,/^[0-9a-f]{40}$/);
 assert.equal(row.sourceStatus,"headword_found");
 assert.ok(Object.keys(row.dictionaryDefinitions).length>0);
 assert.deepEqual(row.dictionaryReadings,Object.keys(row.dictionaryDefinitions));
 assert.equal(row.manualCharacterReview,"pending");
 assert.equal(row.productionVerified,false);
 found++;
 if(row.selectedSenseChecks.length)withCandidate++;
 let hasLiteral=false;
 for(const c of row.selectedSenseChecks){
  assert.ok(glyphs.characters[i].screening.candidates.some(x=>x.selectedMeaning===c.selectedMeaning));
  assert.equal(c.manualSenseReview,"pending");
  assert.equal(c.emojiComprehensionReview,"pending");
  const hits=Object.entries(row.dictionaryDefinitions).filter(([k,v])=>
   v.toLowerCase().includes(c.selectedMeaning.toLowerCase())).map(([k])=>k);
  assert.deepEqual(c.matchingDictionaryReadings,hits);
  assert.equal(c.lexicalEvidence,hits.length?"literal_gloss_match":"requires_sense_review");
  expr++;
  if(hits.length){literal++;hasLiteral=true}else needsReview++;
 }
 if(hasLiteral)charactersWithLiteral++;
 const condensed=manifest.records[i];
 assert.equal(condensed.sourceStatus,row.sourceStatus);
 assert.equal(condensed.selectedSenseChecks.length,row.selectedSenseChecks.length);
}
assert.deepEqual(manifest.metrics,{
 totalCharacters:1000,initiallyScreened:1000,crossReferenced:combined.length,headwordsFound:found,
 charactersWithCandidate:withCandidate,candidateExpressions:expr,
 charactersWithLiteralCandidateMatch:charactersWithLiteral,
 expressionLiteralMatches:literal,expressionGlossMismatchOrSynonym:needsReview,
 manualSenseReviewed:0,emojiComprehensionReviewed:0,productionVerified:0
});
assert.ok(found>=700,"Independent dictionary intake must not regress below 700 characters");
assert.equal(withCandidate,manifest.metrics.charactersWithCandidate);
assert.equal(expr,manifest.metrics.candidateExpressions);
assert.equal(literal,manifest.metrics.expressionLiteralMatches);
assert.equal(needsReview,manifest.metrics.expressionGlossMismatchOrSynonym);
assert.equal(manifest.metrics.crossReferenced,700);
assert.equal(manifest.metrics.headwordsFound,700);
assert.equal(expr,611);
assert.equal(literal,457);
assert.equal(needsReview,154);
const triage=JSON.parse(fs.readFileSync(base+"triage-0101-0200.json","utf8"));
assert.equal(triage.schema,"chromalect.semantic.manual-triage.v0.1");
assert.equal(triage.lexicalApprovalCount,0);
assert.equal(triage.emojiApprovalCount,0);
assert.equal(triage.entries.length,19);
assert.equal(triage.entries.filter(x=>x.priority==="high").length,8);
const triageRanks=triage.entries.map(x=>x.rank).sort((a,b)=>a-b);
const expectedTriageRanks=combined.slice(100,200)
 .filter(x=>x.selectedSenseChecks.some(c=>c.lexicalEvidence==="requires_sense_review"))
 .map(x=>x.rank).sort((a,b)=>a-b);
assert.deepEqual(triageRanks,expectedTriageRanks);
for(const item of triage.entries){
 assert.equal(item.character,combined[item.rank-1].character);
 assert.equal(item.status,"research_triage_not_lexically_approved");
 assert.equal(item.requiresHumanReview,true);
 assert.equal(item.emojiComprehensionReviewed,false);
 assert.equal(item.productionVerified,false);
 assert.ok(item.note.length>20);
}

console.log("Lexical cross-reference: "+found+"/1000 dictionary headwords; "+expr+" experimental expressions, "+literal+" literal matches, "+needsReview+" flagged. Human approval: 0.");
