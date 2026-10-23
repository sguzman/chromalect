import assert from "node:assert/strict";
import fs from "node:fs";
import {pinyinEquivalent,buildAgreement} from "./word_entry_reading_agreement.mjs";
const read=n=>JSON.parse(fs.readFileSync("data/semantic/cedict-crossref/"+n+"-v0.1.json","utf8"));
const source=read("external-word-reading-observations"),cedict=read("cedict-word-headword-index");
const audit=read("word-entry-reading-agreement");
assert.deepEqual(buildAgreement(source,cedict),audit);
assert.equal(audit.summary.wordLeadsCompared,8);
assert.equal(audit.summary.pairedPublishedWordReadings,5);
assert.equal(audit.summary.withoutPairedReadings,3);
for(const k of ["independentlyVerifiedSentenceReadings","independentWordBoundaries","approvedLexicalSenses","productionApprovals"])
 assert.equal(audit.summary[k],0);
assert.equal(audit.sources.sourceEditorialIndependenceCertified,false);
assert.equal(audit.sources.sourceDefinitionsCopied,false);
for(const [a,b] of [["chángdù","chang2 du4"],["zhǎngdà","zhang3 da4"],
 ["huáchuán","hua2 chuan2"],["jìhuà","ji4 hua4"],["jīngguò","jing1 guo4"]])
 assert.equal(pinyinEquivalent(a,b),true);
assert.equal(pinyinEquivalent("jìhuà","ji4 hua2"),false);
assert.equal(pinyinEquivalent("zhǎngdà","chang2 da4"),false);
assert.equal(pinyinEquivalent("jīngguò","jing1 guo4 lu4"),false);
assert.equal(pinyinEquivalent("jìhuà","ji hua4"),false);
const alternate=structuredClone(cedict);alternate.records[0].headwords[0].pinyin="chang3 du4";
assert.throws(()=>buildAgreement(source,alternate));
assert.deepEqual(audit.records.slice(-3).map(x=>x.status),
 ["insufficient_published_word_entry_sources","insufficient_published_word_entry_sources","insufficient_published_word_entry_sources"]);
console.log("Five marked/numeric published Pinyin agreements; no corpus reading approval.");
