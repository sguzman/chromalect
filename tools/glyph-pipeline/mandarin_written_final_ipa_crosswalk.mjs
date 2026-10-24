// Source-published vocal IPA heading candidates beside 33 written Pinyin finals.
// The crosswalk explicitly forbids automatic real-syllable IPA realization.
import assert from "node:assert/strict";
import fs from "node:fs";
import {pathToFileURL} from "node:url";
const get=x=>JSON.parse(fs.readFileSync(x,"utf8"));
const path="data/phonetics/mandarin-written-final-ipa-source-crosswalk-v0.1.json";
const options={
 "i-retroflex":"ɹ̩","a":"a","ai":"a:ɪ","an":"an","ang":"aŋ","ao":"ɑ:ʊ",
 "e":"ɤ:ə","ei":"e:ɪ","en":"ɤn","eng":"ɤŋ","er":"ar","i":"i",
 "ia":"ja","ian":"jɛn","iang":"jɑŋ","iao":"jɑ:ʊ","ie":"jɛ",
 "in":"in","ing":"iŋ","iong":"joŋ","iou":"jɔ:ʊ",
 "o":"ɔ","ong":"oŋ","ou":"o:ʊ","u":"u","ua":"wa",
 "uai":"wa:ɪ","uan":"wan","uang":"wɑŋ","uei":"we:ɪ","uen":"wɤn",
 "ueng":"wɤŋ","uo":"wɔ","ü":"y","üan":"ɥan","üe":"ɥɤ","ün":"ɥyn"
};
const normalization={
 i:["i","i-retroflex"],o:["o","uo"],ong:["ong","iong"],
 u:["u","ü"],uan:["uan","üan"],un:["uen","ün"],
 iu:["iou"],ui:["uei"],ue:["üe"]
};
export function verify(d,geometry,citations,features){
 assert.equal(d.schema,"chromalect.phonetics.mandarin-written-final-ipa-source-crosswalk.v0.1");
 assert.equal(d.status,"source_editorial_ipa_labels_not_attested_contextual_or_phonemic_realizations");
 assert.equal(d.source.author,"Hana J. Cai");
 assert.equal(d.source.year,2020);
 assert.equal(d.source.documentURI,
  "https://scholarworks.iu.edu/iuswrrest/api/core/bitstreams/9dc66f3c-a3fb-4221-a9a6-815a1c4811a0/content");
 assert.equal(d.source.originalTableTextOrImagesRedistributed,false);
 assert.equal(d.bases.paletteOrGlyphGeometryChanged,false);
 assert.equal(d.bases.totalFirstTrancheCitations,1171);
 assert.equal(geometry.schema,"chromalect.phonetics.written-final-symbol-control.v0.1");
 assert.equal(geometry.status,"arbitrary_geometric_written_letter_control_not_articulatory_or_ipa");
 assert.equal(geometry.records.length,33);
 assert.equal(citations.schema,"chromalect.pronunciation-citations.v0");
 assert.equal(citations.characters.length,1000);
 assert.equal(features.schema,"chromalect.phonetics.mandarin-simple-final-feature-candidates.v0.1");
 assert.equal(features.summary.independentIPAApprovalCount,0);
 const sourceFinals=new Map(geometry.records.map(r=>[r.token,r]));
 const proposed=new Set(features.records.map(r=>r.token));
 const frequencies=new Map();
 for(const c of citations.characters){
  for(const x of c.readings)frequencies.set(x.final,(frequencies.get(x.final)||0)+1);
 }
 assert.equal(sourceFinals.size,33);
 assert.equal(proposed.size,6);
 assert.equal(Object.keys(options).length,37);
 assert.equal(d.records.length,33);
 const seen=new Set();
 let total=0,multiform=0;
 for(const x of d.records){
  const original=sourceFinals.get(x.writtenFinal);
  assert.ok(original&&!seen.has(x.writtenFinal));
  seen.add(x.writtenFinal);
  assert.equal(x.sourceCitationOccurrences,frequencies.get(x.writtenFinal));
  assert.deepEqual(x.geometricalWrittenLetters,original.symbolLetters);
  assert.equal(x.workingSimpleVowelCandidateAvailable,proposed.has(x.writtenFinal));
  assert.equal(x.hasApprovedFeaturalGrapheme,false);
  assert.equal(x.candidateFullSyllableIPAAsserted,false);
  assert.equal(x.contextualIPAAdjudication,"not_done");
  const rows=normalization[x.writtenFinal]??[x.writtenFinal];
  assert.equal(x.sourceTableRowChoiceRequiresPhoneticContext,rows.length>1);
  assert.deepEqual(x.sourceTableIPAOptions.map(y=>y.sourceTableRow),rows);
  for(const item of x.sourceTableIPAOptions){
   assert.equal(item.caiProposedNotation,options[item.sourceTableRow]);
   assert.ok(Number.isInteger(item.sourcePrintedPage)&&item.sourcePrintedPage>=27&&item.sourcePrintedPage<=29);
  }
  if(rows.length>1)multiform++;
  total+=x.sourceCitationOccurrences;
 }
 assert.deepEqual(seen,new Set(sourceFinals.keys()));
 assert.deepEqual(Object.keys(d.summary).sort(),[
  "complexWrittenFinalsWithoutVowelFeatureProposal",
  "contextualIPARealizationApprovals","humanIPAComprehensionTrials",
  "phonologicalRepresentationApprovals","simpleWrittenVowelFeatureHypotheses",
  "sourceCitationOccurrences","sourceEditorialIPAOptionEntries",
  "sourceWrittenFinalTypes","writtenFinalTypesWithMultipleCandidateTableRows"
 ].sort());
 assert.equal(d.summary.sourceWrittenFinalTypes,33);
 assert.equal(d.summary.sourceCitationOccurrences,total);
 assert.equal(total,1171);
 assert.equal(d.summary.sourceEditorialIPAOptionEntries,Object.keys(options).length);
 assert.equal(d.summary.simpleWrittenVowelFeatureHypotheses,6);
 assert.equal(d.summary.complexWrittenFinalsWithoutVowelFeatureProposal,27);
 assert.equal(d.summary.writtenFinalTypesWithMultipleCandidateTableRows,multiform);
 assert.equal(multiform,6);
 for(const key of ["phonologicalRepresentationApprovals","contextualIPARealizationApprovals",
   "humanIPAComprehensionTrials"])assert.equal(d.summary[key],0);
 return {writtenFinals:seen.size,sourceCitations:total,conditionalRows:multiform};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 assert.ok(process.argv.includes("--check"));
 const r=verify(get(path),get("data/phonetics/written-final-symbol-control-v0.1.json"),
  get("site/pronunciation-citations-0001-1000.json"),
  get("data/phonetics/mandarin-simple-final-feature-candidates-v0.1.json"));
 console.log("Source IPA option crosswalk: "+r.writtenFinals+" written finals, "+
  r.sourceCitations+" citation occurrences, "+r.conditionalRows+
  " explicitly multiform normalization rows, zero acoustic claims.");
}
