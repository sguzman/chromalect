import assert from "node:assert/strict";
import fs from "node:fs";
import {derive} from "./word_context_review_priority.mjs";
const base="data/semantic/cedict-crossref/";
const names=["tatoeba-word-surface-id-index","tatoeba-icu-word-segmentation-index",
 "word-entry-reading-agreement","tatoeba-live-word-record-audit-summary",
 "tatoeba-word-candidate-attribution","tatoeba-word-sentence-text-fingerprints"];
const sources=names.map(n=>JSON.parse(fs.readFileSync(base+n+"-v0.1.json","utf8")));
const original=JSON.parse(fs.readFileSync(base+"word-context-review-priority-v0.1.json","utf8"));
assert.deepEqual(derive(...sources),original);
assert.equal(original.records.length,27);
assert.equal(original.summary.boundary_crosses_token,6);
assert.equal(original.summary.multi_token_match,4);
assert.equal(original.summary.single_token_suggestion,17);
assert.equal(original.summary.pairedPublishedWordReadingsWithinCohort,original.records.filter(x=>x.publishedWordReadingPair).length);
assert.ok(original.records.every(x=>!x.wordBoundaryVerified&&!x.contextualReadingVerified&&!x.lexicalSenseApproved&&!x.quotationRightsAdjudicated));
assert.equal(original.interpretation.wordReadingPairsAreSentenceEvidence,false);
assert.equal(original.interpretation.sourceObservedLicenseIsReuseClearance,false);
assert.ok(!JSON.stringify(original).includes("sentenceText"));
const mutate=(index,operation)=>{const v=structuredClone(sources);operation(v[index]);assert.throws(()=>derive(...v));};
mutate(1,v=>v.records[0].contextualReadingVerified=true);
mutate(3,v=>v.records[0].reuseRightsAdjudicated=true);
mutate(4,v=>v.records[0].contributor="");
mutate(0,v=>v.records[0].sentenceIds[0]="1");
console.log("27 research triage associations checked against 6 independent source ledgers.");
