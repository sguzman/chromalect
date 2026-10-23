// Independent regression for automated reading distribution and zero-approval invariant.
import assert from "node:assert/strict";
import fs from "node:fs";
const dir="data/semantic/cedict-crossref/";
const report=JSON.parse(fs.readFileSync(dir+"reading-sensitive-gloss-audit-v0.1.json","utf8"));
const summary=report.summary;
assert.equal(report.status,"automated_english_gloss_reading_distribution_not_lexical_verification");
assert.equal(report.source.dictionaryLicense,"CC BY-SA 4.0");
assert.equal(report.records.length,1000);
assert.equal(summary.charactersAudited,1000);
assert.equal(summary.proposedExpressions,897);
assert.equal(summary.noWholeTermMatchExpressions,248);
assert.equal(summary.allReadingLiteralMatchExpressions,437);
assert.equal(summary.subsetReadingLiteralMatchExpressions,212);
assert.equal(summary.subsetReadingLiteralMatchCharacters,208);
assert.equal(summary.charactersWithMultipleReadings,339);
assert.equal(summary.higherAttentionCharacters,142);
assert.equal(summary.noEmojiCandidateCharacters,119);
assert.equal(summary.independentLexicalApproved,0);
assert.equal(summary.independentEmojiApproved,0);
assert.equal(summary.productionVerified,0);
let subset=0,zero=0;
for(const [i,row] of report.records.entries()){
 assert.equal(row.rank,i+1);
 assert.ok(row.character);
 assert.equal(row.candidateCount,row.candidates.length);
 assert.equal(row.productionVerified,false);
 assert.equal(row.lexicalReview,"pending");
 if(!row.candidateCount)zero++;
 assert.equal(row.hasReadingSubsetLiteralMatch,row.candidates.some(c=>
  c.alignment==="subset_of_recorded_readings"));
 if(row.hasReadingSubsetLiteralMatch)subset++;
 for(const candidate of row.candidates){
  assert.ok(candidate.literalMatchingReadings.every(reading=>
   row.dictionaryReadings.includes(reading)));
  assert.equal(candidate.strictWholeTermMatch,candidate.alignment!=="no_whole_term_match");
 }
}
assert.equal(subset,208);
assert.equal(zero,119);
const factory=report.records.find(x=>x.character==="厂");
assert.ok(factory.candidates.some(c=>
 c.selectedMeaning==="factory" &&
 c.alignment==="subset_of_recorded_readings" &&
 c.literalMatchingReadings.includes("chang3")));
console.log("Reading-sensitive gloss audit: 1000 source-aligned records, 208 partial-reading-match characters and 0 approvals.");
