import assert from "node:assert/strict";
import fs from "node:fs";
import {createHash} from "node:crypto";
const d="data/semantic/cedict-crossref/";
const index=JSON.parse(fs.readFileSync(d+"tatoeba-word-surface-id-index-v0.1.json","utf8"));
const lead=JSON.parse(fs.readFileSync(d+"dictionary-word-surface-leads-v0.1.json","utf8"));
assert.equal(index.schema,"chromalect.semantic.tatoeba-word-surface-id-index.v0.1");
assert.equal(index.status,"literal_multi_character_substrings_not_verified_word_or_reading_attestations");
assert.deepEqual(index.summary,{
 wordLeads:8,sourceSentenceRowsScanned:89190,rawWordSubstringMatches:213,
 selectedWordSentenceAssociations:27,uniqueSentenceIds:27,
 wordLeadsWithCandidateIds:6,wordLeadsWithoutCandidateIds:2,
 contextualPronunciationVerifications:0,independentLexicalApprovals:0,
 independentPictogramApprovals:0,productionVerified:0});
assert.equal(index.records.length,8);
assert.equal(index.source.uncompressedTSVSha256,"7685bc14cf769a63acf7643a5bcd2b19fc3dba6aaf6c12acabd7417752f12338");
const keys=new Set(),selected=[],canonical=[];
for(const row of index.records){
 assert.ok(!keys.has(row.leadId));keys.add(row.leadId);
 const original=lead.leads.find(r=>r.id===row.leadId);
 assert.ok(original);
 assert.equal(row.writtenWordLead,original.surfaceWord);
 assert.equal(row.rank,original.rank);
 assert.ok(row.sentenceIds.length<=5);
 assert.ok(row.sentenceIds.every(id=>/^\d+$/.test(id)));
 assert.ok(row.rawMatchingSentenceCount>=row.sentenceIds.length);
 assert.equal(row.observedStatus,"literal_substring_candidate_only");
 assert.equal(row.independentWordBoundaryVerified,false);
 assert.equal(row.independentContextualReadingVerified,false);
 assert.equal(row.independentLexicalSenseVerified,false);
 assert.equal(row.approvedPictogram,false);
 assert.ok(!("sentenceText" in row));
 selected.push(...row.sentenceIds);
 canonical.push(row.leadId+":"+row.rawMatchingSentenceCount+":"+row.sentenceIds.join(","));
}
assert.equal(keys.size,8);
assert.equal(selected.length,27);
assert.equal(new Set(selected).size,27);
assert.deepEqual(index.records.filter(x=>!x.sentenceIds.length).map(x=>x.writtenWordLead),["刨坑","刨木头"]);
assert.equal(createHash("sha256").update(canonical.join(";")).digest("hex"),"b719af1cb40b2280c218d96a39b4e9fedc9814de7476c8214a16a9cae0ed2940");
console.log("Literal word-surface results: 213 matches, 27 source-only candidate IDs, 6/8 leads represented; 0 approvals.");