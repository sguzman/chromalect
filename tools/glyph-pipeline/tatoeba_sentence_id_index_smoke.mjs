// Source-ID snapshot assertions; source text and semantic approvals are excluded.
import assert from "node:assert/strict";
import fs from "node:fs";
import {createHash} from "node:crypto";
const root="data/semantic/cedict-crossref/";
const report=JSON.parse(fs.readFileSync(root+"tatoeba-sentence-id-index-v0.1.json","utf8"));
const priority=JSON.parse(fs.readFileSync(root+"high-attention-evidence-priority-v0.1.json","utf8"));
assert.equal(report.schema,"chromalect.semantic.tatoeba-sentence-id-index.v0.1");
assert.equal(report.status,"real_corpus_surface_character_candidates_unadjudicated");
assert.equal(report.summary.characters,142);
assert.equal(report.summary.charactersWithCandidates,141);
assert.equal(report.summary.charactersWithoutCandidates,1);
assert.equal(report.summary.sourceSentencesScanned,89190);
assert.equal(report.summary.characterSentenceAssociations,423);
assert.equal(report.summary.uniqueSentenceIds,363);
for(const prop of ["contextualReadingsVerified","independentlyApprovedLexicalSenses","approvedEmojiMappings","productionVerified"])
 assert.equal(report.summary[prop],0);
assert.equal(report.source.uncompressedTSVSha256,"7685bc14cf769a63acf7643a5bcd2b19fc3dba6aaf6c12acabd7417752f12338");
const map=new Map(priority.records.map(p=>[p.rank,p]));
const ids=[],seen=new Set();
const canonical=[];
for(const r of report.records){
 assert.ok(!seen.has(r.rank));
 seen.add(r.rank);
 assert.equal(r.character,map.get(r.rank)?.character);
 assert.ok(r.sentenceIds.length<=3&&r.sentenceIds.every(x=>/^\\d+$/.test(x)));
 assert.equal(new Set(r.sentenceIds).size,r.sentenceIds.length);
 assert.equal(r.readingInContext,"unverified");
 assert.equal(r.lexicalStatus,"not_approved");
 assert.equal(r.sourceIdStatus,"sentence_identifier_only");
 assert.ok(!("sentenceText" in r)&&!("pronunciation" in r)&&!("approved" in r));
 canonical.push(r.rank+":"+r.sentenceIds.join(","));
 ids.push(...r.sentenceIds);
}
assert.equal(ids.length,423);
assert.equal(new Set(ids).size,363);
assert.equal(seen.size,142);
assert.deepEqual(report.records.filter(x=>x.sentenceIds.length===0).map(x=>[x.rank,x.character]),[[821,"刨"]]);
const digest=createHash("sha256").update(canonical.join(";")).digest("hex");
assert.equal(digest,"feaeca5d8ed596bcbf660b137713b688f74b6cce314ab6dda1932dfc73ad4d7b");
console.log("Tatoeba ID snapshot: 423 associations / 363 unique sentence IDs / 141 characters, no approved readings.");
