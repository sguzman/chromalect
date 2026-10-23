// Source leads for two unresolved Mandarin caution classes, not phonetic approvals.
import assert from "node:assert/strict";
import fs from "node:fs";
import {pathToFileURL} from "node:url";
import {verifyUmlautCrosswalk} from "./external_umlaut_spelling_rules.mjs";

export function verifyUnresolvedPhoneticLeads(leads,contractions,umlaut,gates,queue){
 verifyUmlautCrosswalk(umlaut,contractions,gates,queue);
 assert.equal(leads.schema,"chromalect.phonetics.unresolved-phonetic-reference-leads.v0.1");
 assert.equal(leads.status,"two_remaining_caution_families_have_reference_leads_not_approved_analysis");
 assert.equal(leads.source.citationBlobSHA,gates.source.upstreamBlobSHA);
 assert.equal(leads.source.cautionIndex,"data/phonetics/mandarin-final-spelling-context-gates-v0.1.json");
 assert.equal(leads.source.contractions,"data/phonetics/external-orthographic-spelling-rule-crosswalk-v0.1.json");
 assert.equal(leads.source.umlaut,"data/phonetics/external-umlaut-spelling-rule-crosswalk-v0.1.json");
 assert.equal(leads.source.noCopiedSourcePassages,true);
 assert.equal(leads.source.componentPaletteChanged,false);
 const sources=[
  ["lmu-mandarin-vowels","Ludwig Maximilian University of Munich, Phonetics and Speech Processing",
   "Mandarin Vowels","https://www.phonetik.uni-muenchen.de/studium/skripten/languagedemos/Demos/mandarin.html",
   "Discusses restricted so-called apical-vowel or syllabic-consonant cases; any IPA interpretation still requires independent convention and context review."],
  ["polyu-simple-finals","The Hong Kong Polytechnic University, BEPTH",
   "Simple Finals","https://www.polyu.edu.hk/bepth/introduction-to-phonetics/simple-finals/?sc_lang=en",
   "Describes weak u-like onset in labial-written o examples; not a character-specific acoustic measurement."]
 ];
 assert.equal(leads.references.length,2);
 for(let i=0;i<sources.length;i++){
  const [id,publisher,pageTitle,url,relevance]=sources[i];
  assert.deepEqual(leads.references[i],{id,publisher,pageTitle,url,relevance,accessCheckedDate:"2026-10-23"});
 }
 const cases=[
  ["post_sibilant_i","i",63,"lmu-mandarin-vowels",
   "Compare restricted post-sibilant citation-i realizations under a declared speaker and transcription convention."],
  ["labial_written_o","o",16,"polyu-simple-finals",
   "Compare the labial-written o transition against direct speech evidence under declared phonetic and speaker conventions."]
 ];
 assert.equal(leads.records.length,cases.length);
 const lookup=new Map(gates.records.map(x=>[x.id,x]));
 for(let i=0;i<cases.length;i++){
  const [id,token,count,source,question]=cases[i],row=leads.records[i],caution=lookup.get(id);
  assert.equal(row.cautionFamily,id);
  assert.equal(row.writtenFinal,token);
  assert.equal(row.observedSourceReadingUses,count);
  assert.equal(caution.observedReadingCount,count);
  assert.ok(caution.observedTokenTriples.every(x=>x.final===token));
  assert.equal(row.sourceLead,source);
  assert.equal(row.researchQuestion,question);
  assert.equal(row.phoneticEvidenceStatus,"external_description_lead_only");
  assert.equal(row.proposedIPAForm,null);
  assert.equal(row.phonemeInventoryApproval,false);
  assert.equal(row.sourceSpecificAcousticVerification,false);
  assert.equal(row.contextualPronunciationApproval,false);
  assert.equal(row.humanDecodingTrials,0);
  assert.deepEqual(Object.keys(row).sort(),[
   "cautionFamily","writtenFinal","observedSourceReadingUses","sourceLead",
   "researchQuestion","phoneticEvidenceStatus","proposedIPAForm",
   "phonemeInventoryApproval","sourceSpecificAcousticVerification",
   "contextualPronunciationApproval","humanDecodingTrials"].sort());
 }
 const all=[...contractions.records,...umlaut.records,...leads.records];
 const families=new Set(all.map(x=>x.cautionFamily));
 assert.equal(families.size,9);
 assert.equal([...lookup.keys()].every(x=>families.has(x)),true);
 assert.equal(all.reduce((n,x)=>n+x.observedSourceReadingUses,0),213);
 assert.deepEqual(leads.summary,{
  remainingCautionFamilies:2,remainingSourceReadingUses:79,
  sourceReadingOccurrencesCheckedForAudio:0,
  phonologicalRepresentationsApproved:0,humanDecodingTrials:0
 });
 return true;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 if(!process.argv.includes("--check"))throw Error("Use --check");
 const get=p=>JSON.parse(fs.readFileSync(p,"utf8"));
 verifyUnresolvedPhoneticLeads(
  get("data/phonetics/unresolved-phonetic-reference-leads-v0.1.json"),
  get("data/phonetics/external-orthographic-spelling-rule-crosswalk-v0.1.json"),
  get("data/phonetics/external-umlaut-spelling-rule-crosswalk-v0.1.json"),
  get("data/phonetics/mandarin-final-spelling-context-gates-v0.1.json"),
  get("data/phonetics/unadjudicated-compound-final-review-queue-v0.1.json"));
 console.log("Nine caution families traced to seven spelling rules and two non-certifying phonetic leads.");
}
