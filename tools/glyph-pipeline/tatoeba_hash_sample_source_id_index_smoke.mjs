import assert from "node:assert/strict";
import fs from "node:fs";
import {createHash} from "node:crypto";
const d="data/semantic/cedict-crossref/";
const x=JSON.parse(fs.readFileSync(d+"tatoeba-hash-sample-source-id-index-v0.1.json","utf8"));
const earliest=JSON.parse(fs.readFileSync(d+"tatoeba-sentence-id-index-v0.1.json","utf8"));
const high=JSON.parse(fs.readFileSync(d+"high-attention-evidence-priority-v0.1.json","utf8"));
assert.equal(x.schema,"chromalect.semantic.tatoeba-hash-sample-source-id-index.v0.1");
assert.equal(x.status,"hash_sampled_corpus_surface_form_candidates_unadjudicated");
assert.equal(x.summary.targetCharacters,142);
assert.equal(x.summary.characterSentenceAssociations,701);
assert.equal(x.summary.uniqueSentenceIds,690);
assert.equal(x.summary.associationsSharedWithChronologicalIndex,37);
assert.equal(x.summary.uniqueSentenceIdsAcrossBothIndexes,1015);
assert.equal(x.source.uncompressedTSVSha256,earliest.source.uncompressedTSVSha256);
for(const field of ["contextualReadingsVerified","lexicalSenseApprovals","pictogramApprovals","productionVerified"])
 assert.equal(x.summary[field],0);
const lookup=new Map(high.records.map(r=>[r.rank,r.character]));
const older=new Map(earliest.records.map(r=>[r.rank,new Set(r.sentenceIds)]));
const unique=new Set(),both=new Set(),ranks=new Set(),canonical=[];
let total=0,overlap=0;
for(const row of x.records){
 assert.equal(row.character,lookup.get(row.rank));
 assert.ok(!ranks.has(row.rank));ranks.add(row.rank);
 assert.ok(row.sentenceIds.length<=5&&row.sentenceIds.every(id=>/^\d+$/.test(id)));
 assert.equal(new Set(row.sentenceIds).size,row.sentenceIds.length);
 assert.equal(row.sourceIdStatus,"unverified_surface_match");
 assert.equal(row.independentReadingApproval,false);
 assert.equal(row.lexicalSenseApproval,false);
 assert.ok(!("sentenceText" in row));
 canonical.push(row.rank+":"+row.sentenceIds.join(","));
 total+=row.sentenceIds.length;
 for(const id of row.sentenceIds){
  unique.add(id);both.add(id);
  if(older.get(row.rank).has(id))overlap++;
 }
}
for(const r of earliest.records)for(const id of r.sentenceIds)both.add(id);
assert.equal(ranks.size,142);
assert.equal(total,701);
assert.equal(unique.size,690);
assert.equal(overlap,37);
assert.equal(both.size,1015);
assert.deepEqual(x.records.filter(r=>r.sentenceIds.length<5).map(r=>[r.rank,r.character,r.sentenceIds.length]),
 [[2,"乙",3],[679,"杠",4],[758,"钉",4],[821,"刨",0]]);
const digest=createHash("sha256").update(canonical.join(";")).digest("hex");
assert.equal(digest,"0cce717169a861b1af8f717ea169f1c1aa359ec3fce628585d219f7ac27ee696");
console.log("Hashed corpus source index: 701 associations / 690 IDs / 1015 union IDs, no approved senses.");
