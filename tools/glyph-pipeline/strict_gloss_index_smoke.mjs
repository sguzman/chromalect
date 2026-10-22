// Strict whole-term audit is a reproducible triage index, not lexical verification.
import assert from "node:assert/strict";
import fs from "node:fs";
const dir="data/semantic/cedict-crossref/";
const index=JSON.parse(fs.readFileSync(dir+"strict-gloss-index-v0.1.json","utf8"));
const audit=JSON.parse(fs.readFileSync(dir+"boundary-audit-manifest-v0.1.json","utf8"));
const dictionary=JSON.parse(fs.readFileSync(dir+"manifest-v0.1.json","utf8"));
const ledger=JSON.parse(fs.readFileSync("data/semantic/mandarin-1000-v0.1.json","utf8"));
assert.equal(index.schema,"chromalect.semantic.strict-gloss-index.v0.1");
assert.equal(index.status,"automated_boundary_check_only_no_linguistic_approval");
assert.equal(index.source,"boundary-audit-manifest-v0.1.json");
assert.equal(index.sourceLicense,"CC BY-SA 4.0 (derived CC-CEDICT text alignment metadata)");
assert.equal(index.scope.charactersAudited,1000);
assert.equal(index.scope.proposedExpressionCount,897);
assert.equal(index.scope.independentHumanApproved,0);
assert.equal(index.scope.emojiComprehensionApproved,0);
assert.equal(dictionary.metrics.crossReferenced,1000);
assert.equal(dictionary.metrics.headwordsFound,1000);
assert.equal(ledger.summary.productionVerifiedCharacters,0);
const gathered=[];
for(const file of audit.files){
 const batch=JSON.parse(fs.readFileSync(dir+file.path,"utf8"));
 assert.equal(batch.schema,"chromalect.semantic.gloss-boundary-audit-batch.v0.1");
 assert.equal(batch.range.start,file.start);
 assert.equal(batch.range.end,file.end);
 assert.equal(batch.summary.count,file.count);
 assert.equal(batch.summary.expressionCount,file.expressionCount);
 gathered.push(...batch.records);
}
assert.equal(gathered.length,index.records.length);
assert.equal(gathered.length,897);
let whole=0,unmatched=0,substringOnly=0;
const unmatchedRanks=new Set(),matchRanks=new Set(),unique=new Set();
for(let i=0;i<gathered.length;i++){
 const x=gathered[i],y=index.records[i];
 assert.equal(y.rank,x.rank);
 assert.equal(y.character,x.character);
 assert.equal(y.selectedMeaning,x.selectedMeaning);
 assert.equal(y.wholeTermMatch,x.strictWholeTerm);
 assert.equal(y.legacySubstringMatch,x.legacyLiteral);
 assert.deepEqual(y.matchingReadings,x.strictReadingMatches);
 assert.equal(y.character,ledger.characters[y.rank-1].character);
 assert.ok(dictionary.records[y.rank-1].selectedSenseChecks.some(c=>c.selectedMeaning===y.selectedMeaning));
 const id=y.rank+"|"+y.selectedMeaning;
 assert.ok(!unique.has(id),"Duplicate strict audit expression "+id);
 unique.add(id);
 if(y.wholeTermMatch){whole++;matchRanks.add(y.rank);}
 else{unmatched++;unmatchedRanks.add(y.rank);}
 if(y.legacySubstringMatch&&!y.wholeTermMatch)substringOnly++;
}
assert.deepEqual(index.summary,{
 wholeTermMatched:whole,
 requiresSenseReview:unmatched,
 substringOnlyFalsePositives:substringOnly,
 charactersNeedingSenseReview:unmatchedRanks.size
});
assert.equal(whole,649);
assert.equal(unmatched,248);
assert.equal(substringOnly,7);
assert.equal(unmatchedRanks.size,248);
assert.equal(matchRanks.size,638);
assert.equal(audit.summary.humanLexicalApproved,0);
assert.equal(audit.summary.emojiComprehensionApproved,0);
assert.equal(audit.summary.productionVerified,0);
console.log("Strict lexical boundary audit: 1000/1000 characters, 897 expressions; 649 whole-term matches, 248 sense-review candidates and 7 substring-only false positives. Production approved: 0.");
