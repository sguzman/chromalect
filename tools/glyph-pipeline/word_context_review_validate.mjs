// Source-aligned intake for locally recorded word-context hypotheses.
// Passing validation never establishes word segmentation, pronunciation, lexical sense or reuse rights.
import assert from "node:assert/strict";
import fs from "node:fs";
import {pathToFileURL} from "node:url";

const schema="chromalect.word-context-review-session.v0.1";
const stageValues=new Set(["undetermined","supports","contradicts"]);
const fields=["leadId","sentenceId","writtenWordLead","dictionaryHeadingReading",
 "sourceURL","contributor","textSha256","wordBoundaryAssessment",
 "readingAssessment","senseAssessment","independentEvidenceURL","evidenceRationale"];
const own=(obj,keys)=>assert.deepEqual(Object.keys(obj).sort(),[...keys].sort(),
 "Only versioned review fields are permitted");
const load=name=>JSON.parse(fs.readFileSync(
 "data/semantic/cedict-crossref/"+name+"-v0.1.json","utf8"));

export function validateWordContextReview(session,leads,matches,credits,live,hashes){
 assert.ok(session&&typeof session==="object"&&!Array.isArray(session));
 own(session,["schema","status","source","session","observations"]);
 assert.equal(session.schema,schema);
 assert.equal(session.status,"local_preliminary_sentence_context_observations_not_approval");
 own(session.source,["corpusSnapshotSHA256","wordLeadIndex","sentenceIndex",
  "contributorIndex","liveAudit","sentenceFingerprints"]);
 assert.equal(session.source.wordLeadIndex,"dictionary-word-surface-leads-v0.1.json");
 assert.equal(session.source.sentenceIndex,"tatoeba-word-surface-id-index-v0.1.json");
 assert.equal(session.source.contributorIndex,"tatoeba-word-candidate-attribution-v0.1.json");
 assert.equal(session.source.liveAudit,"tatoeba-live-word-record-audit-summary-v0.1.json");
 assert.equal(session.source.sentenceFingerprints,"tatoeba-word-sentence-text-fingerprints-v0.1.json");
 assert.equal(leads.schema,"chromalect.semantic.dictionary-word-surface-leads.v0.1");
 assert.equal(matches.schema,"chromalect.semantic.tatoeba-word-surface-id-index.v0.1");
 assert.equal(credits.schema,"chromalect.semantic.tatoeba-word-candidate-attribution.v0.1");
 assert.equal(live.schema,"chromalect.semantic.tatoeba-live-word-record-audit-summary.v0.1");
 assert.equal(hashes.schema,"chromalect.semantic.tatoeba-word-sentence-text-fingerprints.v0.1");
 const digest=matches.source.uncompressedTSVSha256;
 assert.match(digest,/^[a-f0-9]{64}$/);
 assert.equal(session.source.corpusSnapshotSHA256,digest);
 assert.equal(credits.source.snapshotSHA256,digest);
 assert.equal(hashes.source.corpusSnapshotSha256,digest);
 assert.equal(live.provenance.corpusSnapshotSHA256,digest);
 assert.equal(matches.summary.selectedWordSentenceAssociations,27);
 assert.equal(matches.summary.contextualPronunciationVerifications,0);
 assert.equal(matches.summary.independentLexicalApprovals,0);
 assert.equal(live.summary.liveRecordsRead,27);
 assert.equal(live.summary.independentlyVerifiedReadings,0);
 assert.equal(live.summary.approvedLexicalSenses,0);
 assert.equal(live.summary.reuseRightsAdjudicated,0);
 const leadsById=new Map(leads.leads.map(r=>[r.id,r]));
 const creditById=new Map(credits.records.map(r=>[r.sentenceId,r]));
 const liveById=new Map(live.records.map(r=>[r.sentenceId,r]));
 const hashById=new Map(hashes.records.map(r=>[r.sentenceId,r]));
 const candidates=new Map();
 for(const record of matches.records){
  const lead=leadsById.get(record.leadId);
  assert.ok(lead&&lead.surfaceWord===record.writtenWordLead);
  assert.equal(record.independentWordBoundaryVerified,false);
  assert.equal(record.independentContextualReadingVerified,false);
  assert.equal(record.independentLexicalSenseVerified,false);
  for(const id of record.sentenceIds){
   const credit=creditById.get(id),observation=liveById.get(id),hash=hashById.get(id);
   assert.ok(credit&&observation&&hash);
   assert.equal(credit.leadId,record.leadId);
   assert.equal(observation.leadId,record.leadId);
   assert.equal(observation.matchedPinnedSentenceTextSHA256,true);
   assert.equal(observation.matchedPinnedContributor,true);
   assert.equal(observation.preservedDictionaryWordSurface,true);
   assert.equal(observation.reuseRightsAdjudicated,false);
   assert.equal(observation.independentReadingVerification,false);
   assert.equal(observation.independentLexicalSenseApproval,false);
   assert.equal(hash.liveContentCompared,false); // The historical snapshot ledger is immutable.
   assert.match(hash.textSha256,/^[a-f0-9]{64}$/);
   const key=record.leadId+"|"+id;
   assert.ok(!candidates.has(key));
   candidates.set(key,{lead,credit,hash});
  }
 }
 assert.equal(candidates.size,27);
 own(session.session,["localOnly","exportedAt","recorded"]);
 assert.equal(session.session.localOnly,true);
 assert.ok(typeof session.session.exportedAt==="string"&&!Number.isNaN(Date.parse(session.session.exportedAt)));
 assert.ok(Array.isArray(session.observations)&&session.observations.length>0&&session.observations.length<=27);
 assert.equal(session.session.recorded,session.observations.length);
 const seen=new Set();let preliminary=0;
 for(const r of session.observations){
  assert.ok(r&&typeof r==="object"&&!Array.isArray(r));
  own(r,fields);
  const key=r.leadId+"|"+r.sentenceId;
  assert.ok(!seen.has(key),"Duplicate sentence/word lead observation");
  seen.add(key);
  const expected=candidates.get(key);
  assert.ok(expected,"Unknown or mismatched pinned sentence and word lead");
  const {lead,credit,hash}=expected;
  assert.equal(r.writtenWordLead,lead.surfaceWord);
  assert.equal(r.dictionaryHeadingReading,lead.dictionaryHeadingReading);
  assert.equal(r.sourceURL,credit.sourceURL);
  assert.equal(r.contributor,credit.contributor);
  assert.equal(r.textSha256,hash.textSha256);
  for(const stage of ["wordBoundaryAssessment","readingAssessment","senseAssessment"])
   assert.ok(stageValues.has(r[stage]),"Unrecognized preliminary assessment");
  assert.ok(typeof r.independentEvidenceURL==="string"&&r.independentEvidenceURL.length<=1000);
  assert.ok(typeof r.evidenceRationale==="string"&&r.evidenceRationale.length<=3000);
  const hasJudgment=["wordBoundaryAssessment","readingAssessment","senseAssessment"]
   .some(stage=>r[stage]!=="undetermined");
  if(hasJudgment){
   preliminary++;
   assert.ok(r.evidenceRationale.trim().length>=30,"Assessments require a substantive rationale");
   assert.ok(r.independentEvidenceURL,"Assessments require a distinct independent source URL");
  }
  if(r.independentEvidenceURL){
   const url=new URL(r.independentEvidenceURL);
   assert.equal(url.protocol,"https:");
   assert.equal(url.username,"");assert.equal(url.password,"");
   assert.equal(url.hash,"");
   assert.ok(url.hostname);
   assert.notEqual(url.href,r.sourceURL,"Source sentence is not independent corroboration");
   assert.notEqual(url.href,lead.publisherSourceURL,"Dictionary lead is not independent contextual corroboration");
  }
 }
 return {recorded:seen.size,preliminaryAssessments:preliminary,approvedReadings:0,
  approvedSenses:0,quotationRightsCleared:0};
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const path=process.argv[2];
 if(!path)throw Error("Provide an explicitly exported local word-context review JSON file");
 const report=validateWordContextReview(JSON.parse(fs.readFileSync(path,"utf8")),
  load("dictionary-word-surface-leads"),load("tatoeba-word-surface-id-index"),
  load("tatoeba-word-candidate-attribution"),load("tatoeba-live-word-record-audit-summary"),
  load("tatoeba-word-sentence-text-fingerprints"));
 console.log(JSON.stringify(report));
}