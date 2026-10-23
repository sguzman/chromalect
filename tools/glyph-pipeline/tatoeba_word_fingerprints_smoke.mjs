import assert from "node:assert/strict";
import fs from "node:fs";
import {createHash} from "node:crypto";
const d="data/semantic/cedict-crossref/";
const a=JSON.parse(fs.readFileSync(d+"tatoeba-word-sentence-text-fingerprints-v0.1.json","utf8"));
const c=JSON.parse(fs.readFileSync(d+"tatoeba-word-candidate-attribution-v0.1.json","utf8"));
assert.equal(a.schema,"chromalect.semantic.tatoeba-word-sentence-text-fingerprints.v0.1");
assert.equal(a.status,"pinned_snapshot_hashes_only_not_live_sentence_verification");
assert.equal(a.source.corpusSnapshotSha256,c.source.snapshotSHA256);
assert.deepEqual(a.summary,{individualSentenceFingerprints:27,sourceSentenceTextPublished:0,
 liveSentenceContentComparisons:0,liveIndividualLicensesChecked:0,
 independentlyVerifiedReadings:0,independentlyApprovedLexicalSenses:0});
assert.equal(a.records.length,27);
const all=new Map(c.records.map(x=>[x.sentenceId,x]));
const seen=new Set(),canonical=[];
for(const x of a.records){
 assert.ok(!seen.has(x.sentenceId)&&all.has(x.sentenceId));
 seen.add(x.sentenceId);
 assert.match(x.textSha256,/^[0-9a-f]{64}$/);
 assert.equal(x.liveContentCompared,false);
 assert.equal(x.hashEncoding,"SHA-256 UTF-8 text bytes");
 assert.ok(!("sentenceText" in x));
 canonical.push(x.sentenceId+":"+x.textSha256);
}
assert.equal(seen.size,27);
assert.equal(createHash("sha256").update(canonical.sort().join(";")).digest("hex"),
 "22f6b354ec5ee8908d9528c302220583ed4c9e773af962494bdfafae3ec83c37");
console.log("27 pinned Mandarin sentence SHA-256 fingerprints; no text, live licensing, or reading approval.");