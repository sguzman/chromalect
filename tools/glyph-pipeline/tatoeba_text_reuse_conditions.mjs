// Independently checked publisher/CC conditions applied to 27 preverified Tatoeba
// sentence records. This is NOT a new live API call or third-party title guarantee.
import assert from "node:assert/strict";
import fs from "node:fs";
import {pathToFileURL} from "node:url";
const sourceDir="data/semantic/cedict-crossref/";
const read=name=>JSON.parse(fs.readFileSync(sourceDir+name,"utf8"));
export const policy={
 publisher:"Tatoeba",
 publisherTerms:"https://en.wiki.tatoeba.org/articles/show/using-the-tatoeba-corpus",
 publisherFAQ:"https://en.wiki.tatoeba.org/articles/show/faq",
 ccLicense:"https://creativecommons.org/licenses/by/2.0/fr/",
 ccExplanation:"https://creativecommons.org/licenses/by/2.0/fr/deed.en",
 checkedUTCDate:"2026-10-24",
 scope:"Text only; audio licenses are independently assigned.",
 requirements:["identify contributing author","link original sentence","name CC BY 2.0 FR and link the license","identify modifications when made","do not imply endorsement"],
 limitations:["Current policy text does not establish who originally owned every sentence",
  "Snapshot metadata and a 2026-10-23 live observation do not establish 2026-10-24 license status",
  "Any subsequent license change, attribution correction, imported-work condition or third-party claim requires renewed assessment",
  "No source sentence text or audio is redistributed by this record"]
};
const key=r=>r.sentenceId;
export function assess(live,contributors,priority) {
 assert.equal(live.schema,"chromalect.semantic.tatoeba-live-word-record-audit-summary.v0.1");
 assert.equal(live.status,"observed_live_api_source_integrity_not_rights_or_lexical_adjudication");
 assert.equal(live.checkedUTCDate,"2026-10-23");
 assert.equal(contributors.schema,"chromalect.semantic.tatoeba-word-candidate-attribution.v0.1");
 assert.equal(priority.schema,"chromalect.semantic.word-context-review-priority.v0.1");
 assert.equal(contributors.source.snapshotSHA256,live.provenance.corpusSnapshotSHA256);
 assert.equal(priority.source.corpusSnapshotSHA256,live.provenance.corpusSnapshotSHA256);
 assert.equal(live.provenance.sourceAttribution,"tatoeba-word-candidate-attribution-v0.1.json");
 assert.equal(live.summary.requested,27);
 assert.equal(live.summary.liveRecordsRead,27);
 assert.equal(live.summary.CC_BY_2_0_FR_LicenseLabels,27);
 assert.equal(live.summary.ownerMatchesSnapshot,27);
 assert.equal(live.summary.textMatchesSnapshot,27);
 assert.equal(live.summary.markedUnapprovedAtSource,0);
 assert.equal(live.summary.reuseRightsAdjudicated,0);
 assert.equal(live.summary.independentlyVerifiedReadings,0);
 assert.equal(live.summary.approvedLexicalSenses,0);
 assert.equal(contributors.summary.selectedCorpusSentenceIDs,27);
 assert.equal(contributors.summary.distinctPublicCorpusContributors,20);
 assert.equal(priority.summary.sourceVerifiedAssociations,27);
 assert.equal(priority.summary.quotationClearanceGranted,0);
 assert.equal(priority.summary.independentlyVerifiedContextualReadings,0);
 assert.equal(priority.summary.independentlyApprovedLexicalSenses,0);
 const byContributor=new Map(contributors.records.map(r=>[key(r),r]));
 const byPriority=new Map(priority.records.map(r=>[key(r),r]));
 assert.equal(byContributor.size,27);
 assert.equal(byPriority.size,27);
 const seen=new Set(),authors=new Set();
 const rows=[];
 for(const liveRecord of live.records){
  const id=liveRecord.sentenceId,attr=byContributor.get(id),task=byPriority.get(id);
  assert.ok(typeof id==="string"&&/^\d+$/.test(id)&&!seen.has(id),"Repeated sentence identity");
  seen.add(id);
  assert.ok(attr&&task,"Missing source contribution or review record");
  assert.equal(attr.sentenceId,id);assert.equal(task.sentenceId,id);
  assert.equal(attr.leadId,liveRecord.leadId);
  assert.equal(task.leadId,liveRecord.leadId);
  assert.equal(attr.sourceURL,task.sourceURL);
  assert.equal(attr.sourceURL,"https://tatoeba.org/en/sentences/show/"+id);
  assert.equal(attr.contributor,task.contributor);
  assert.ok(typeof attr.contributor==="string"&&attr.contributor.length>0);
  assert.match(task.textSHA256,/^[a-f0-9]{64}$/);
  assert.equal(liveRecord.observedLiveLicense,"CC BY 2.0 FR");
  assert.equal(liveRecord.individualLicenseLabelObserved,true);
  assert.equal(liveRecord.matchedPinnedContributor,true);
  assert.equal(liveRecord.matchedPinnedSentenceTextSHA256,true);
  assert.equal(liveRecord.liveLanguageWasMandarin,true);
  assert.equal(liveRecord.preservedDictionaryWordSurface,true);
  assert.equal(liveRecord.sourceMarkedUnapproved,false);
  assert.equal(liveRecord.reuseRightsAdjudicated,false);
  assert.equal(liveRecord.independentReadingVerification,false);
  assert.equal(liveRecord.independentLexicalSenseApproval,false);
  assert.equal(attr.sourceTextCopied,false);
  assert.equal(attr.wordBoundaryVerified,false);
  assert.equal(attr.readingVerified,false);
  assert.equal(attr.lexicalSenseApproved,false);
  assert.equal(task.quotationRightsAdjudicated,false);
  assert.equal(task.wordBoundaryVerified,false);
  assert.equal(task.contextualReadingVerified,false);
  assert.equal(task.lexicalSenseApproved,false);
  authors.add(attr.contributor);
  rows.push({
   sentenceId:id,leadId:attr.leadId,
   attribution:{contributor:attr.contributor,sourceURL:attr.sourceURL,
     sourceTextSHA256:task.textSHA256,license:"CC BY 2.0 FR",licenseURI:policy.ccLicense},
   evidence:{licenseObservedInLiveAPIOn:live.checkedUTCDate,
     liveAttributionMatchesSource:true,liveTextHashMatchesSource:true,
     policyTermsCheckedOn:policy.checkedUTCDate,
     publisherPolicyCompatibleWithObservedLicense:true},
   determination:"conditional_text_reuse_license_identified_attribution_required",
   conditions:{creditOriginalContributor:true,linkSentence:true,linkLicense:true,
     indicateDerivatives:true,doNotImplyEndorsement:true},
   limits:{independentThirdPartyRightsCheckCompleted:false,
     freshSourceLicenseRecheckBeforeQuotation:true,
     independentlyAdjudicatedSentenceReading:false,
     independentlyAdjudicatedLexicalSense:false,
     permissionForImmediateUnattributedQuotation:false},
   sourceSentenceReproduced:false
  });
 }
 assert.equal(authors.size,20);
 assert.equal(rows.length,27);
 rows.sort((a,b)=>Number(a.sentenceId)-Number(b.sentenceId));
 return {
  schema:"chromalect.semantic.tatoeba-text-reuse-conditions.v0.1",
  status:"publisher_policy_and_cc_deed_correlated_with_per_sentence_observations_not_publication_clearance",
  source:{liveRecordAudit:"tatoeba-live-word-record-audit-summary-v0.1.json",
   contributorRecords:"tatoeba-word-candidate-attribution-v0.1.json",
   researchPriority:"word-context-review-priority-v0.1.json",
   corpusSHA256:live.provenance.corpusSnapshotSHA256,
   liveCheckedUTCDate:live.checkedUTCDate},
  publisherPolicy:policy,
  summary:{targetSentenceIDs:27,documentedOriginalSentenceURLs:27,
   distinctAttributedContributors:20,individuallyObservedCompatibleCCLicenses:27,
   publisherLicensePolicyIndependentlyChecked:1,
   attributedConditionalTextReuseCases:27,
   newLiveLicenseQueries:0,
   independentThirdPartyOwnershipConfirmations:0,
   unconditionalQuotationClearances:0,
   approvedSentenceReadings:0,approvedLexicalSenses:0,
   sourceSentencesReproduced:0},
  records:rows
 };
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const result=assess(read("tatoeba-live-word-record-audit-summary-v0.1.json"),
  read("tatoeba-word-candidate-attribution-v0.1.json"),
  read("word-context-review-priority-v0.1.json"));
 const output=sourceDir+"tatoeba-text-reuse-conditions-v0.1.json";
 const encoded=JSON.stringify(result,null,2)+"\n";
 if(process.argv.includes("--write"))fs.writeFileSync(output,encoded);
 else if(process.argv.includes("--check"))assert.equal(fs.readFileSync(output,"utf8"),encoded);
 else throw Error("Use --write or --check");
 console.log("Corroborated Tatoeba text policy for 27 source-matched, individually licensed sentences and 20 source authors; zero unconditional quotation clearances.");
}
