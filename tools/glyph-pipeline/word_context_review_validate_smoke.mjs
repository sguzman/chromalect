import assert from "node:assert/strict";
import fs from "node:fs";
import {validateWordContextReview} from "./word_context_review_validate.mjs";
const base="data/semantic/cedict-crossref/";
const read=name=>JSON.parse(fs.readFileSync(base+name+"-v0.1.json","utf8"));
const leads=read("dictionary-word-surface-leads"),matches=read("tatoeba-word-surface-id-index");
const credits=read("tatoeba-word-candidate-attribution"),live=read("tatoeba-live-word-record-audit-summary");
const hashes=read("tatoeba-word-sentence-text-fingerprints");
const c=credits.records[0],lead=leads.leads.find(r=>r.id===c.leadId),hash=hashes.records.find(r=>r.sentenceId===c.sentenceId);
const valid={
 schema:"chromalect.word-context-review-session.v0.1",
 status:"local_preliminary_sentence_context_observations_not_approval",
 source:{corpusSnapshotSHA256:matches.source.uncompressedTSVSha256,
  wordLeadIndex:"dictionary-word-surface-leads-v0.1.json",
  sentenceIndex:"tatoeba-word-surface-id-index-v0.1.json",
  contributorIndex:"tatoeba-word-candidate-attribution-v0.1.json",
  liveAudit:"tatoeba-live-word-record-audit-summary-v0.1.json",
  sentenceFingerprints:"tatoeba-word-sentence-text-fingerprints-v0.1.json"},
 session:{localOnly:true,exportedAt:"2026-10-23T12:30:00Z",recorded:1},
 observations:[{leadId:lead.id,sentenceId:c.sentenceId,writtenWordLead:lead.surfaceWord,
  dictionaryHeadingReading:lead.dictionaryHeadingReading,sourceURL:c.sourceURL,
  contributor:c.contributor,textSha256:hash.textSha256,
  wordBoundaryAssessment:"undetermined",readingAssessment:"undetermined",
  senseAssessment:"undetermined",independentEvidenceURL:"",evidenceRationale:""}]
};
const test=x=>validateWordContextReview(x,leads,matches,credits,live,hashes);
assert.deepEqual(test(valid),{recorded:1,preliminaryAssessments:0,approvedReadings:0,
 approvedSenses:0,quotationRightsCleared:0});
const clone=()=>structuredClone(valid);
const withMutation=fn=>{const copy=clone();fn(copy);assert.throws(()=>test(copy));};
withMutation(x=>x.observations[0].sentenceId="999999999");
withMutation(x=>x.observations[0].contributor="uncredited");
withMutation(x=>x.observations[0].textSha256="f".repeat(64));
withMutation(x=>x.observations[0].sourceURL="https://example.com/other");
withMutation(x=>x.observations[0].readingAssessment="verified");
withMutation(x=>x.observations[0].readingAssessment="supports");
withMutation(x=>x.observations[0].productionVerified=true);
withMutation(x=>x.observations[0].sentenceText="Unlicensed source quotation");
withMutation(x=>x.session.localOnly=false);
withMutation(x=>x.source.corpusSnapshotSHA256="0".repeat(64));
withMutation(x=>x.observations[0].independentEvidenceURL="http://example.org");
withMutation(x=>x.observations[0].independentEvidenceURL=c.sourceURL);
withMutation(x=>x.observations[0].independentEvidenceURL=lead.publisherSourceURL);
withMutation(x=>x.observations.push(structuredClone(x.observations[0])));
const hypothesis=clone();
hypothesis.observations[0].wordBoundaryAssessment="supports";
hypothesis.observations[0].evidenceRationale="A preliminary contextual hypothesis requires independent checking and does not approve a reading.";
hypothesis.observations[0].independentEvidenceURL="https://example.org/reference";
assert.equal(test(hypothesis).preliminaryAssessments,1);
assert.equal(test(hypothesis).approvedReadings,0);
console.log("Word-context local review: 27 pinned candidates, strict identities, zero promotions.");
