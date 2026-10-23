import assert from "node:assert/strict";
import fs from "node:fs";
const d="data/semantic/cedict-crossref/";
const audit=JSON.parse(fs.readFileSync(d+"tatoeba-live-word-record-audit-summary-v0.1.json","utf8"));
const credits=JSON.parse(fs.readFileSync(d+"tatoeba-word-candidate-attribution-v0.1.json","utf8"));
const hashes=JSON.parse(fs.readFileSync(d+"tatoeba-word-sentence-text-fingerprints-v0.1.json","utf8"));
assert.equal(audit.schema,"chromalect.semantic.tatoeba-live-word-record-audit-summary.v0.1");
assert.equal(audit.status,"observed_live_api_source_integrity_not_rights_or_lexical_adjudication");
assert.equal(audit.provenance.corpusSnapshotSHA256,credits.source.snapshotSHA256);
assert.equal(audit.summary.requested,27);
assert.equal(audit.summary.liveRecordsRead,27);
assert.equal(audit.summary.missingOrUnreachable,0);
assert.equal(audit.summary.CC_BY_2_0_FR_LicenseLabels,27);
for(const k of ["reuseRightsAdjudicated","independentlyVerifiedReadings","approvedLexicalSenses","productionApprovals"])
 assert.equal(audit.summary[k],0);
assert.equal(audit.records.length,27);
const known=new Map(credits.records.map(r=>[r.sentenceId,r]));
const knownHashes=new Map(hashes.records.map(r=>[r.sentenceId,r]));
const ids=new Set();
for(const r of audit.records){
 assert.ok(!ids.has(r.sentenceId));ids.add(r.sentenceId);
 assert.equal(r.leadId,known.get(r.sentenceId)?.leadId);
 assert.ok(knownHashes.has(r.sentenceId));
 assert.equal(r.observedLiveLicense,"CC BY 2.0 FR");
 assert.equal(r.matchedPinnedContributor,true);
 assert.equal(r.matchedPinnedSentenceTextSHA256,true);
 assert.equal(r.preservedDictionaryWordSurface,true);
 assert.equal(r.liveLanguageWasMandarin,true);
 assert.equal(r.sourceMarkedUnapproved,false);
 assert.equal(r.individualLicenseLabelObserved,true);
 assert.equal(r.reuseRightsAdjudicated,false);
 assert.equal(r.independentReadingVerification,false);
 assert.equal(r.independentLexicalSenseApproval,false);
 assert.ok(!("sentenceText" in r));
}
assert.equal(ids.size,27);
console.log("Frozen live source verification: 27 current sentence sources and license labels checked; 0 approvals.");
