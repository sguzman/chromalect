import assert from "node:assert/strict";
import fs from "node:fs";
import zlib from "node:zlib";
import {scanHeadwords} from "./cedict_word_headword_scan.mjs";
const leads=JSON.parse(fs.readFileSync(
 "data/semantic/cedict-crossref/dictionary-word-surface-leads-v0.1.json","utf8"));
const sample="#! version=1\n# CC-CEDICT synthetic test\n"+
 "長度 长度 [chang2 du4] /synthetic gloss not exported/\n"+
 "長大 长大 [zhang3 da4] /synthetic gloss not exported/\n"+
 "長度 长度 [chang2 du4] /duplicate entry/\n"+
 "計劃 计划 [ji4 hua4] /synthetic gloss not exported/\n"+
 "看過 看过 [kan4 guo4] /synthetic combination/\n";
const r=scanHeadwords(zlib.gzipSync(sample),leads,{date:"2026-10-23"});
assert.equal(r.schema,"chromalect.semantic.cedict-word-headword-scan.v0.1");
assert.equal(r.status,"exact_cedict_headword_matches_not_contextual_usage_or_lexical_approval");
assert.equal(r.summary.sourceRowsParsed,5);
assert.equal(r.summary.requestedWordLeads,8);
assert.equal(r.summary.wordLeadsWithHeadwords,4);
assert.equal(r.summary.exactHeadwordRecords,4);
assert.equal(r.source.compressedInput,true);
assert.match(r.source.sourceBytesSHA256,/^[a-f0-9]{64}$/);
assert.equal(r.source.sourceDefinitionsCopiedToReport,false);
assert.equal(r.summary.independentlyVerifiedTatoebaReadings,0);
assert.equal(r.summary.independentWordBoundaries,0);
assert.equal(r.summary.approvedLexicalSenses,0);
assert.equal(r.summary.productionApprovals,0);
assert.equal(r.records.find(x=>x.leadId==="ch126-length").observedHeadwordRecords[0].pinyin,"chang2 du4");
assert.equal(r.records.find(x=>x.leadId==="hua-plan").observedHeadwordRecords[0].pinyin,"ji4 hua4");
assert.equal(r.records.find(x=>x.leadId==="guo-aspect").observedHeadwordRecords[0].pinyin,"kan4 guo4");
assert.ok(!JSON.stringify(r).includes("synthetic gloss"));
assert.ok(!JSON.stringify(r).includes("duplicate entry"));
const plain=scanHeadwords(sample,leads,{compressed:false,date:"2026-10-23"});
assert.deepEqual(r.records,plain.records);
assert.equal(plain.source.compressedInput,false);
console.log("CC-CEDICT dictionary word scanner: exact headwords, versioned source digest and zero approvals.");
