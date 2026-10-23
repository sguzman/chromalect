import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {newCollector,parseDetailedRow} from "./tatoeba_context_candidate_extract.mjs";
const targets=[{rank:127,character:"长"},{rank:339,character:"发"}];
const rows=[
 "100000001\tcmn\t这是一段含有长字的测试句子。\tcontributor-a\t2026-01-01 00:00:00\t2026-01-03 00:00:00",
 "100000002\tcmn\t这是一段含有发和长的测试句子。\tcontributor-b\t2026-01-02 00:00:00\t2026-01-03 00:00:00",
 "100000003\tcmn\t这是一段含有长字的另外一句测试。\tcontributor-c\t2026-01-03 00:00:00\t2026-01-04 00:00:00",
 "100000004\tcmn\t这是一段含有长字的第三个测试。\tcontributor-d\t2026-01-04 00:00:00\t2026-01-05 00:00:00"
];
const collect=newCollector(targets,2);
for(const row of rows)collect.add(parseDetailedRow(row));
const digest=createHash("sha256").update("test fixture").digest("hex");
const result=collect.finish(digest,"2026-01-05");
assert.equal(result.schema,"chromalect.semantic.tatoeba-surface-context-candidates.v0.1");
assert.equal(result.summary.sentencesScanned,4);
assert.equal(result.summary.matchingCandidateReferences,3);
assert.equal(result.summary.charactersWithCandidateReferences,2);
assert.equal(result.summary.contextualReadingsVerified,0);
assert.equal(result.summary.lexicalSensesApproved,0);
assert.equal(result.summary.emojiComprehensionApproved,0);
assert.deepEqual(result.records.map(x=>x.candidates.length),[2,1]);
const serialized=JSON.stringify(result);
for(const row of rows)assert.ok(!serialized.includes(row.split("\t")[2]),"Source sentence text must remain out of the output");
assert.ok(result.records[0].candidates[0].sourceUrl.endsWith("/100000001"));
assert.equal(result.records[0].candidates[0].corpusRecordLicense,"requires_individual_check");
assert.throws(()=>parseDetailedRow("123\teng\tEnglish text\tx\t2026-01-01\t2026-01-02"));
assert.throws(()=>parseDetailedRow("notanid\tcmn\t中文字句\tx\t2026-01-01\t2026-01-02"));
const dup=newCollector(targets,2);
dup.add(parseDetailedRow(rows[0]));
assert.throws(()=>dup.add(parseDetailedRow(rows[0])));
console.log("Tatoeba offline candidate importer: stable IDs, bounded UTF-8 surface matches, no text redistribution, no approvals.");
