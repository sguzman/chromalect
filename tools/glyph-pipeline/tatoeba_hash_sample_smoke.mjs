import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {createSampler} from "./tatoeba_hash_sample.mjs";
import {parseDetailedRow} from "./tatoeba_context_candidate_extract.mjs";
const targets=[{rank:127,character:"长"},{rank:339,character:"发"}];
const lines=[
 "1001\tcmn\t这是一段含有长字的例句。\tfixture-a\t\\N\t2026-01-03",
 "1002\tcmn\t这是一段含有发和长的例句。\tfixture-b\t\\N\t2026-01-03",
 "1003\tcmn\t这是一段含有长字的第三个例句。\tfixture-c\t\\N\t2026-01-03",
 "1004\tcmn\t这是一段含有长字的第四个例句。\tfixture-d\t\\N\t2026-01-03",
 "1005\tcmn\t这是一段包含发字的例句。\tfixture-e\t\\N\t2026-01-03"
];
const make=ordered=>{
 const sampler=createSampler(targets,2);
 for(const x of ordered)sampler.add(parseDetailedRow(x));
 return sampler.finish(createHash("sha256").update("synthetic").digest("hex"),"2026-01-03");
};
const ordered=make(lines),reversed=make([...lines].reverse());
assert.deepEqual(ordered,reversed,"Selection must be independent of corpus record ordering");
assert.equal(ordered.schema,"chromalect.semantic.tatoeba-hash-sampled-candidate-ids.v0.1");
assert.equal(ordered.summary.targetCharacters,2);
assert.equal(ordered.summary.sourceSentenceRowsScanned,5);
assert.equal(ordered.summary.selectedCharacterSentenceAssociations,4);
assert.equal(ordered.summary.contextualReadingsVerified,0);
assert.equal(ordered.summary.lexicalSenseApprovals,0);
assert.equal(ordered.summary.pictogramApprovals,0);
assert.ok(ordered.records.every(r=>r.candidates.length===2));
for(const r of ordered.records){
 const scores=r.candidates.map(x=>x.score);
 assert.deepEqual(scores,[...scores].sort());
 for(const c of r.candidates){
  assert.match(c.sentenceId,/^\d+$/);
  assert.equal(c.readingInContext,"not_checked");
  assert.equal(c.license,"requires_individual_check");
  assert.ok(c.sourceUrl.startsWith("https://tatoeba.org/en/sentences/show/"));
 }
}
assert.ok(!JSON.stringify(ordered).includes("这是一段"));
const dup=createSampler(targets,2);
dup.add(parseDetailedRow(lines[0]));
assert.throws(()=>dup.add(parseDetailedRow(lines[0])));
console.log("Hash-sampled Tatoeba candidates: order-independent top-k source IDs, zero lexical approvals.");
