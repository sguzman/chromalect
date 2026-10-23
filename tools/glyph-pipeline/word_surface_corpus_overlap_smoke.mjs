import assert from "node:assert/strict";
import fs from "node:fs";
const d=JSON.parse(fs.readFileSync("data/semantic/cedict-crossref/word-surface-corpus-overlap-audit-v0.1.json","utf8"));
assert.equal(d.schema,"chromalect.semantic.word-surface-corpus-overlap-audit.v0.1");
assert.equal(d.status,"source_id_collection_cardinality_only_not_linguistic_validation");
assert.deepEqual(d.summary,{
 originalCharacterOnlyDistinctSentenceIds:1015,wordSelectedDistinctSentenceIds:27,
 wordIdsAlreadyInCharacterResearch:3,wordIdsPreviouslyAssignedToSameCharacter:0,
 newDistinctSentenceIdsFromWordSurfaceStage:24,
 distinctSentenceIdsAcrossThreeCohorts:1039,independentlyVerifiedContextualReadings:0,lexicalSenseApprovals:0});
assert.equal(d.records.length,8);
assert.equal(d.records.reduce((n,r)=>n+r.wordSelectedCandidateIds,0),27);
assert.equal(d.records.reduce((n,r)=>n+r.newGloballyDistinctCorpusSentenceIds,0),24);
assert.ok(d.records.every(r=>r.independentReadingVerification===false&&r.lexicalSenseApproval===false));
console.log("Cross-cohort corpus IDs: 1015 existing + 24 new = 1039; zero reading or lexical approval.");