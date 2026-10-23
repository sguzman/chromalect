import assert from "node:assert/strict";
import fs from "node:fs";
const x=JSON.parse(fs.readFileSync("data/semantic/cedict-crossref/combined-corpus-phonetic-count-upper-bound-v0.1.json","utf8"));
assert.equal(x.schema,"chromalect.semantic.combined-corpus-phonetic-count-upper-bound.v0.1");
assert.equal(x.status,"numerical_source_id_parity_only_no_context_reading_assignments");
assert.equal(x.summary.characters,142);
assert.equal(x.summary.recordedPronunciationSearchGroups,241);
assert.equal(x.summary.firstSampleCharacterSentenceAssociations,423);
assert.equal(x.summary.hashSampleCharacterSentenceAssociations,701);
assert.equal(x.summary.sharedCharacterSentenceAssociations,37);
assert.equal(x.summary.combinedDistinctCharacterSentenceAssociations,1087);
assert.equal(x.summary.distinctCorpusSentenceIdsAcrossBoth,1015);
assert.equal(x.summary.charactersWithInsufficientCandidateCount,1);
assert.equal(x.summary.minimumAdditionalCharacterSentenceIdsToReachNumericalPerPronunciationParity,2);
for(const key of ["independentlyVerifiedContextualReadings","independentlyApprovedLexicalSenses","approvedEmojiMappings"])
 assert.equal(x.summary[key],0);
assert.deepEqual(x.records.filter(r=>r.boundClassification==="insufficient_raw_candidate_ids")
 .map(r=>[r.rank,r.character,r.recordedPronunciationSearchGroups,r.combinedDistinctCharacterSentenceIds]),[[821,"刨",2,0]]);
assert.equal(x.records.length,142);
assert.ok(x.records.every(r=>r.contextToPronunciationAssignments===0&&r.independentlyVerifiedReadings===0&&
 r.approvedLexicalSenses===0&&r.recordedPronunciationSearchGroups===r.pinnedCasefoldedReadingLabels.length));
console.log("Combined-corpus phonetic ID upper bound: 142 characters, only 刨 short of numerical parity; no verified readings.");
