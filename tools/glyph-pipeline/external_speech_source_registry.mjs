// Publisher-documented speech-corpus leads only. No corpus, transcript or speech
// analysis is imported into Chromalect by this registry.
import assert from "node:assert/strict";
import fs from "node:fs";
import {pathToFileURL} from "node:url";
const own=(value,names)=>assert.deepEqual(Object.keys(value).sort(),names.slice().sort());
const entries=[
 ["aishell-3-slr93","AISHELL-3","https://www.openslr.org/93/","Apache-2.0","19 GB"],
 ["aishell-1-slr33","AISHELL-1","https://openslr.org/33/","Apache-2.0","15 GB"],
 ["common-voice-27-zh-cn","Common Voice Scripted Speech 27.0 — Chinese (China)",
  "https://commonvoice.mozilla.org/rw/datasets","CC0-1.0","21.40 GB"],
 ["mandi-2022","ManDi regional and Standard Mandarin spoken corpus",
  "https://aclanthology.org/2022.lrec-1.213/","CC-BY-NC-3.0",
  "about 9.6 hours of recordings"]
];
export function validateSpeechSourceRegistry(data){
 own(data,["schema","status","provenance","acquisitionPolicy","summary","sources"]);
 assert.equal(data.schema,"chromalect.phonetics.external-speech-source-registry.v0.1");
 assert.equal(data.status,"source_reconnaissance_only_no_audio_acquisition_or_phonetic_approval");
 own(data.provenance,["reviewedDate","method","sourceScope",
  "copiedSourceRecordings","copiedTranscriptText","sourcePaletteChanged"]);
 assert.equal(data.provenance.reviewedDate,"2026-10-23");
 assert.equal(data.provenance.method,"Official publisher or publication source pages, recorded as leads only");
 assert.equal(data.provenance.sourceScope,"Mainland Standard Mandarin citation and contextual phonetic research");
 assert.equal(data.provenance.copiedSourceRecordings,false);
 assert.equal(data.provenance.copiedTranscriptText,false);
 assert.equal(data.provenance.sourcePaletteChanged,false);
 own(data.acquisitionPolicy,["metadataFirst","noBulkDownloadAuthorized",
  "noRecordingRedistribution","noSpeakerIdentityInference",
  "selectiveLocalMatchingRequiresIndependentReview"]);
 for(const [key,value] of Object.entries(data.acquisitionPolicy))
  assert.equal(value,true,"Expected cautious audio acquisition policy: "+key);
 own(data.summary,["sourceCandidates","recordingsDownloaded",
  "sourceUtterancesMatchedToCitationReadings",
  "independentlyAnalyzedSpeechTokens","phonemicInventoryApprovals","humanDecodingTrials"]);
 assert.deepEqual(data.summary,{sourceCandidates:4,recordingsDownloaded:0,
  sourceUtterancesMatchedToCitationReadings:0,
  independentlyAnalyzedSpeechTokens:0,phonemicInventoryApprovals:0,
  humanDecodingTrials:0});
 assert.ok(Array.isArray(data.sources)&&data.sources.length===4);
 const seen=new Set();
 for(let i=0;i<entries.length;i++){
  const [id,name,url,license,size]=entries[i],entry=data.sources[i];
  own(entry,["priority","id","name","publisher","publisherPage",
   "declaredLicense","declaredArchiveSize","speechDomain","annotatedUnits",
   "researchRole","constraints","acquisitionStatus","licensingReviewStatus",
   "readingAlignmentStatus","independentAcousticAnalysisStatus"]);
  assert.equal(entry.priority,i+1);
  assert.equal(entry.id,id);assert.equal(entry.name,name);
  assert.equal(entry.publisherPage,url);assert.equal(entry.declaredLicense,license);
  assert.equal(entry.declaredArchiveSize,size);
  assert.ok(!seen.has(id));seen.add(id);
  for(const key of ["publisher","speechDomain","annotatedUnits","researchRole"])
   assert.ok(typeof entry[key]==="string"&&entry[key].length>=15);
  assert.ok(Array.isArray(entry.constraints)&&entry.constraints.length>=2);
  assert.ok(entry.constraints.every(v=>typeof v==="string"&&v.length>=20));
  assert.equal(entry.acquisitionStatus,"not_acquired");
  assert.equal(entry.licensingReviewStatus,
   "requires_dataset_specific_confirmation_before_reuse");
  assert.equal(entry.readingAlignmentStatus,"not_established");
  assert.equal(entry.independentAcousticAnalysisStatus,"not_conducted");
 }
 const cv=data.sources[2];
 assert.ok(cv.constraints.some(x=>x.includes("speaker identification")));
 assert.ok(cv.constraints.some(x=>x.includes("rehost or redistribute")));
 const regional=data.sources[3];
 assert.ok(regional.constraints.some(x=>x.includes("Noncommercial")));
 assert.ok(regional.constraints.some(x=>x.includes("regional")));
 return {documentedCorpusLeads:4,acquiredUtterances:0,
  phoneticApprovals:0};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 if(!process.argv.includes("--check"))throw Error("Use --check");
 const registry=JSON.parse(fs.readFileSync(
  "data/phonetics/external-speech-source-registry-v0.1.json","utf8"));
 console.log(JSON.stringify(validateSpeechSourceRegistry(registry)));
}
