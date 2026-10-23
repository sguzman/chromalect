import assert from "node:assert/strict";
import fs from "node:fs";
import {validateSpeechSourceRegistry} from "./external_speech_source_registry.mjs";
const registry=JSON.parse(fs.readFileSync(
 "data/phonetics/external-speech-source-registry-v0.1.json","utf8"));
assert.deepEqual(validateSpeechSourceRegistry(registry),
 {documentedCorpusLeads:4,acquiredUtterances:0,phoneticApprovals:0});
function rejects(mutator){
 const copy=structuredClone(registry);mutator(copy);
 assert.throws(()=>validateSpeechSourceRegistry(copy));
}
rejects(x=>{x.status="phonetic_approved";});
rejects(x=>{x.sources[0].acquisitionStatus="downloaded";});
rejects(x=>{x.sources[1].readingAlignmentStatus="confirmed";});
rejects(x=>{x.sources[2].independentAcousticAnalysisStatus="approved";});
rejects(x=>{x.provenance.copiedSourceRecordings=true;});
rejects(x=>{x.provenance.copiedTranscriptText=true;});
rejects(x=>{x.acquisitionPolicy.noBulkDownloadAuthorized=false;});
rejects(x=>{x.acquisitionPolicy.noSpeakerIdentityInference=false;});
rejects(x=>{x.summary.recordingsDownloaded=1;});
rejects(x=>{x.summary.phonemicInventoryApprovals=1;});
rejects(x=>{x.sources[2].constraints=[];});
rejects(x=>{x.sources[3].declaredLicense="CC0-1.0";});
rejects(x=>{x.sources[0].declaredArchiveSize="100 MB";});
rejects(x=>{x.sources.push(x.sources[0]);});
rejects(x=>{x.sources[0].downloadURL="https://example.invalid/archive";});
console.log("Four public Mandarin speech sources and 15 negative source-provenance/approval cases verified.");
