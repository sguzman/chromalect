// Derive review priority from six pinned source ledgers, without linguistic promotions.
import assert from "node:assert/strict";
import fs from "node:fs";
const dir="data/semantic/cedict-crossref/";
const get=name=>JSON.parse(fs.readFileSync(dir+name+"-v0.1.json","utf8"));
const priority={cuts_icu_segment:0,multiple_icu_segments:1,single_icu_segment:2};
const tier={cuts_icu_segment:"boundary_crosses_token",multiple_icu_segments:"multi_token_match",
 single_icu_segment:"single_token_suggestion"};
export function derive(surface,seg,reading,live,credit,hash){
 assert.equal(surface.schema,"chromalect.semantic.tatoeba-word-surface-id-index.v0.1");
 assert.equal(seg.schema,"chromalect.semantic.tatoeba-icu-word-segmentation-index.v0.1");
 assert.equal(reading.schema,"chromalect.semantic.word-entry-reading-agreement.v0.1");
 assert.equal(live.schema,"chromalect.semantic.tatoeba-live-word-record-audit-summary.v0.1");
 assert.equal(credit.schema,"chromalect.semantic.tatoeba-word-candidate-attribution.v0.1");
 assert.equal(hash.schema,"chromalect.semantic.tatoeba-word-sentence-text-fingerprints.v0.1");
 const snapshot=surface.source.uncompressedTSVSha256;
 assert.match(snapshot,/^[a-f0-9]{64}$/);
 assert.equal(snapshot,seg.source.corpusSnapshotSHA256);
 assert.equal(snapshot,credit.source.snapshotSHA256);
 assert.equal(snapshot,hash.source.corpusSnapshotSha256);
 assert.equal(seg.summary.sourceIntegrityMatches,27);
 assert.equal(live.summary.liveRecordsRead,27);
 assert.equal(reading.summary.pairedPublishedWordReadings,5);
 for(const [name,val] of Object.entries({segments:seg.records,contributors:credit.records,
  fingerprints:hash.records,live:live.records}))assert.equal(val.length,27,name);
 const segs=new Map(seg.records.map(r=>[r.sentenceId,r]));
 const creds=new Map(credit.records.map(r=>[r.sentenceId,r]));
 const checks=new Map(live.records.map(r=>[r.sentenceId,r]));
 const hashes=new Map(hash.records.map(r=>[r.sentenceId,r]));
 const words=new Map(reading.records.map(r=>[r.leadId,r]));
 assert.equal(segs.size,27);assert.equal(creds.size,27);
 assert.equal(checks.size,27);assert.equal(hashes.size,27);
 const records=[];
 for(const lead of surface.records)for(const id of lead.sentenceIds){
  const s=segs.get(id),c=creds.get(id),l=checks.get(id),h=hashes.get(id),r=words.get(lead.leadId);
  assert.ok(s&&c&&l&&h&&r,"Missing pinned source");
  for(const x of [s,c,l])assert.equal(x.leadId,lead.leadId);
  assert.equal(c.sourceURL,"https://tatoeba.org/en/sentences/show/"+id);
  assert.equal(l.matchedPinnedContributor,true);
  assert.equal(l.matchedPinnedSentenceTextSHA256,true);
  assert.equal(l.preservedDictionaryWordSurface,true);
  assert.equal(l.liveLanguageWasMandarin,true);
  assert.equal(l.observedLiveLicense,"CC BY 2.0 FR");
  assert.equal(l.independentReadingVerification,false);
  assert.equal(l.independentLexicalSenseApproval,false);
  assert.equal(l.reuseRightsAdjudicated,false);
  assert.equal(s.independentWordBoundaryVerified,false);
  assert.equal(s.contextualReadingVerified,false);
  assert.equal(s.lexicalSenseApproved,false);
  assert.equal(r.independentContextualReadingVerified,false);
  assert.equal(r.independentWordBoundaryVerified,false);
  assert.equal(r.independentSenseApproved,false);
  assert.equal(c.sourceTextCopied,false);
  assert.match(h.textSha256,/^[a-f0-9]{64}$/);
  assert.ok(Object.hasOwn(priority,s.segmentationHint));
  records.push({leadId:lead.leadId,word:lead.writtenWordLead,sentenceId:id,
   sourceURL:c.sourceURL,contributor:c.contributor,textSHA256:h.textSha256,
   machineSegmentationHint:s.segmentationHint,machineSourceVersion:seg.engine.icu,
   reviewTier:tier[s.segmentationHint],
   publishedWordReadingPair:r.wordEntryPronunciationAgreement===true,
   wordBoundaryVerified:false,contextualReadingVerified:false,
   lexicalSenseApproved:false,quotationRightsAdjudicated:false});
 }
 assert.equal(records.length,27);
 const seen=new Set(records.map(r=>r.sentenceId));assert.equal(seen.size,27);
 records.sort((a,b)=>priority[a.machineSegmentationHint]-priority[b.machineSegmentationHint]||
  a.leadId.localeCompare(b.leadId,"en")||Number(a.sentenceId)-Number(b.sentenceId));
 const counts=Object.fromEntries(Object.values(tier).map(t=>[t,records.filter(r=>r.reviewTier===t).length]));
 assert.deepEqual(counts,{boundary_crosses_token:6,multi_token_match:4,single_token_suggestion:17});
 return {schema:"chromalect.semantic.word-context-review-priority.v0.1",
  status:"source_aligned_research_triage_not_sentence_or_lexical_approval",
  source:{candidateIndex:"tatoeba-word-surface-id-index-v0.1.json",
   machineHints:"tatoeba-icu-word-segmentation-index-v0.1.json",
   publishedWordReadings:"word-entry-reading-agreement-v0.1.json",
   liveSourceObservations:"tatoeba-live-word-record-audit-summary-v0.1.json",
   publicContributors:"tatoeba-word-candidate-attribution-v0.1.json",
   textFingerprints:"tatoeba-word-sentence-text-fingerprints-v0.1.json",
   corpusSnapshotSHA256:snapshot,sourceSentencesCopied:false,sourceDefinitionsCopied:false},
  interpretation:{priorityOrder:["boundary_crosses_token","multi_token_match","single_token_suggestion"],
   rationale:"Triage machine-segmentation anomalies first. No boundary class independently proves or disproves Mandarin wordhood.",
   wordReadingPairsAreSentenceEvidence:false,sourceObservedLicenseIsReuseClearance:false},
  summary:{sourceVerifiedAssociations:27,...counts,
   pairedPublishedWordReadingsWithinCohort:records.filter(r=>r.publishedWordReadingPair).length,
   independentlyVerifiedWordBoundaries:0,independentlyVerifiedContextualReadings:0,
   independentlyApprovedLexicalSenses:0,quotationClearanceGranted:0},records};
}
const all=()=>derive(get("tatoeba-word-surface-id-index"),get("tatoeba-icu-word-segmentation-index"),
 get("word-entry-reading-agreement"),get("tatoeba-live-word-record-audit-summary"),
 get("tatoeba-word-candidate-attribution"),get("tatoeba-word-sentence-text-fingerprints"));
if(process.argv.includes("--check")){
 assert.equal(fs.readFileSync(dir+"word-context-review-priority-v0.1.json","utf8"),
  JSON.stringify(all(),null,2)+"\n");
 console.log("Priority review index reproducible: 6 crossed, 4 split, 17 single; 0 approvals.");
}else if(process.argv.includes("--write"))fs.writeFileSync(dir+"word-context-review-priority-v0.1.json",
 JSON.stringify(all(),null,2)+"\n");
