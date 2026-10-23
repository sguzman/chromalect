import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {createWordLeadCollector} from "./tatoeba_word_surface_intake.mjs";
import {parseDetailedRow} from "./tatoeba_context_candidate_extract.mjs";
const leads=[
 {id:"a",rank:127,character:"长",surfaceWord:"长度",publisherSourceURL:"https://zdic.net/hans/%E9%95%BF",dictionaryHeadingReading:"cháng",sentenceReadingAssignment:null,independentlyAdjudicated:false},
 {id:"b",rank:407,character:"划",surfaceWord:"划船",publisherSourceURL:"https://zdic.net/hans/%E5%88%92",dictionaryHeadingReading:"huá",sentenceReadingAssignment:null,independentlyAdjudicated:false}
];
const lines=[
 "10001\tcmn\t我想知道这里的长度是多少。\tfixture-a\t\\N\t2026-01-01",
 "10002\tcmn\t今天在河里划船很有趣。\tfixture-b\t\\N\t2026-01-02",
 "10003\tcmn\t桥的长度足以通过。\tfixture-c\t\\N\t2026-01-03",
 "10004\tcmn\t长度可能有变化，划船也有不同方法。\tfixture-d\t\\N\t2026-01-04",
 "10005\tcmn\t划船真有趣。\tfixture-e\t\\N\t2026-01-05"
];
const build=input=>{
 const collector=createWordLeadCollector(leads,2);
 for(const l of input)collector.add(parseDetailedRow(l));
 return collector.finish(createHash("sha256").update("synthetic fixture").digest("hex"),"2026-01-05");
};
const result=build(lines);
assert.deepEqual(result,build([...lines].reverse()));
assert.equal(result.schema,"chromalect.semantic.tatoeba-word-surface-intake.v0.1");
assert.equal(result.summary.sourceSentencesScanned,5);
assert.equal(result.summary.rawWordSubstringMatches,6);
assert.equal(result.summary.selectedWordSentenceAssociations,4);
assert.equal(result.summary.wordLeadsWithSelectedCandidates,2);
assert.equal(result.summary.contextualReadingVerifications,0);
assert.equal(result.summary.lexicalSenseApprovals,0);
assert.equal(result.summary.pictogramApprovals,0);
assert.ok(result.records.every(r=>r.candidates.length===2));
for(const r of result.records)for(const c of r.candidates){
 assert.equal(c.exactWrittenSurfaceSequenceObserved,true);
 assert.equal(c.independentlyVerifiedWordBoundary,false);
 assert.equal(c.independentlyVerifiedReading,false);
 assert.equal(c.independentlyVerifiedLexicalSense,false);
 assert.equal(c.redistributionPermission,"requires_individual_check");
}
assert.ok(!JSON.stringify(result).includes("我想知道"));
assert.throws(()=>createWordLeadCollector([...leads,leads[0]]));
console.log("Word surface corpus research: reproducible multi-character matches; no independent reading or lexical approval.");