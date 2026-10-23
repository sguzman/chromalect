import assert from "node:assert/strict";
import fs from "node:fs";
const d="data/semantic/cedict-crossref/";
const old=JSON.parse(fs.readFileSync(d+"contextual-evidence-readiness-summary-v0.1.json","utf8"));
const source=JSON.parse(fs.readFileSync(d+"tatoeba-sentence-id-index-v0.1.json","utf8"));
const next={...old,schema:"chromalect.semantic.contextual-evidence-readiness-summary.v0.2",
 status:"source_sentence_ids_acquired_not_contextual_reading_verification",
 source:{...old.source,tatoebaSentenceIds:"tatoeba-sentence-id-index-v0.1.json"},
 candidateSentenceIdsCollected:source.summary.uniqueSentenceIds,
 candidateCharacterAssociations:source.summary.characterSentenceAssociations,
 charactersWithCandidateSentenceIds:source.summary.charactersWithCandidates,
 charactersWithoutCandidateSentenceIds:source.summary.charactersWithoutCandidates,
 sourceSentencesScanned:source.summary.sourceSentencesScanned};
assert.deepEqual([next.highAttentionCharacters,next.originalDictionaryReadingEntries,next.caseNormalizedSearchGroups,next.candidateSentenceIdsCollected,next.candidateCharacterAssociations,next.charactersWithCandidateSentenceIds,next.charactersWithoutCandidateSentenceIds],[142,319,241,363,423,141,1]);
for(const key of ["independentlyVerifiedReadings","independentlyApprovedLexicalSenses","independentlyApprovedPictograms","productionVerified"])assert.equal(next[key],0);
const path=d+"contextual-evidence-readiness-summary-v0.2.json";
if(process.argv.includes("--check")){assert.deepEqual(JSON.parse(fs.readFileSync(path,"utf8")),next);console.log("Candidate ID snapshot: 423 surface matches / 363 distinct IDs / 0 verified readings.");}
else{fs.writeFileSync(path,JSON.stringify(next,null,2)+"\n");console.log("Wrote "+path);}
