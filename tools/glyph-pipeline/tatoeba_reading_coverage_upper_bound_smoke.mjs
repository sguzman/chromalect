import assert from "node:assert/strict";
import fs from "node:fs";
const x=JSON.parse(fs.readFileSync("data/semantic/cedict-crossref/tatoeba-reading-coverage-upper-bound-v0.1.json","utf8"));
assert.equal(x.schema,"chromalect.semantic.tatoeba-reading-coverage-upper-bound.v0.1");
assert.equal(x.status,"count_only_upper_bound_neither_attestation_nor_pronunciation_validation");
assert.equal(x.summary.highAttentionCharacters,142);
assert.equal(x.summary.distinctCasefoldedReadingLabels,241);
assert.equal(x.summary.characterSentenceAssociations,423);
assert.equal(x.summary.charactersBelowHypotheticalOneIdPerReading,2);
assert.equal(x.summary.minimumExtraSourceIdAssociationsForHypotheticalCoverage,3);
assert.deepEqual(x.records.filter(r=>r.sourceIdCountBelowReadingLabelCount).map(r=>[r.rank,r.character,r.caseNormalizedReadingLabelCount,r.surfaceCandidateIdCount]),[[564,"那",4,3],[821,"刨",2,0]]);
for(const r of x.records){
 assert.equal(r.contextualReadingAssignment,"not_performed");
 assert.equal(r.independentlyVerifiedContextualReadings,0);
 assert.equal(r.approvedLexicalSenses,0);
 assert.equal(r.minimumAdditionalDistinctSourceIdsForHypotheticalOnePerLabel,Math.max(0,r.caseNormalizedReadingLabelCount-r.surfaceCandidateIdCount));
}
console.log("Reading coverage structural check: 142 chars, 241 labels, 423 unassigned candidate associations.");
