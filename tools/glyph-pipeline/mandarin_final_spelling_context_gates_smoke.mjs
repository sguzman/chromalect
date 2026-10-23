import assert from "node:assert/strict";
import fs from "node:fs";
import {deriveContextGates} from "./mandarin_final_spelling_context_gates.mjs";
const get=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const source=get("site/pronunciation-citations-0001-1000.json");
const expected=get("data/phonetics/mandarin-final-spelling-context-gates-v0.1.json");
assert.deepEqual(deriveContextGates(source),expected);
assert.equal(expected.schema,"chromalect.phonetics.mandarin-final-spelling-context-gates.v0.1");
assert.equal(expected.status,"contextual_spelling_review_flags_not_verified_ipa_or_phonemic_finals");
assert.equal(expected.summary.sourceCitationReadings,1171);
assert.equal(expected.summary.flaggedSourceReadings,213);
assert.deepEqual(expected.source.referenceNotes.map(x=>new URL(x.url).hostname),
 ["www.polyu.edu.hk","www.open.edu","www.phonetik.uni-muenchen.de"]);

assert.equal(expected.summary.flaggedDistinctWrittenTriples,108);
assert.deepEqual(expected.records.map(x=>[x.id,x.observedReadingCount]),[
 ["post_sibilant_i",63],["palatal_written_u",33],["contracted_iu",24],
 ["contracted_ui",19],["contracted_un_nonpalatal",20],
 ["palatal_written_un",18],["palatal_written_ue",10],["palatal_written_uan",10],["labial_written_o",16]]);
assert.equal(expected.records.reduce((n,x)=>n+x.observedReadingCount,0),213);
assert.equal(expected.records.reduce((n,x)=>n+x.observedTokenTriples.length,0),108);
for(const r of expected.records){
 assert.equal(r.observedTokenTriples.length,r.uniqueCitationTriples);
 assert.equal(new Set(r.observedTokenTriples.map(x=>JSON.stringify([x.initial,x.final,x.tone]))).size,r.uniqueCitationTriples);
}

assert.equal(expected.summary.independentlyAdjudicatedFinalPhonemes,0);
assert.equal(expected.summary.approvedContextualPronunciations,0);
assert.equal(expected.summary.approvedAcousticTranscriptions,0);
assert.equal(expected.summary.learningStudyResults,0);
const tokens=new Set(source.characters.flatMap(x=>x.readings.map(r=>JSON.stringify([x.rank,x.character,r.display,r.initial,r.final,r.tone]))));
for(const r of expected.records){
 assert.equal(r.independentIPAAnalysisApproved,false);
 assert.equal(r.certifiedAcousticRealizations,0);
 assert.ok(r.firstSourceExamples.length<=5);
 for(const x of r.firstSourceExamples)
  assert.ok(tokens.has(JSON.stringify([x.rank,x.character,x.display,x.initial,x.final,x.tone])));
}
const mutated=structuredClone(source);mutated.characters[0].rank=555;
assert.throws(()=>deriveContextGates(mutated));
assert.ok(expected.source.noSourceSentenceText&&expected.source.noSourceDefinitionsCopied);
console.log("Eight independently deferred final-spelling research context flags; no assigned IPA or source-learning outcomes.");
