// Independently sourced spelling-rule links; no claim about speech realization or IPA.
import assert from "node:assert/strict";
import fs from "node:fs";
import {pathToFileURL} from "node:url";

export function verifyOrthographicCrosswalk(ledger,gates,queue){
 assert.equal(ledger.schema,"chromalect.phonetics.external-orthographic-spelling-rule-crosswalk.v0.1");
 assert.equal(ledger.status,"research_only_written_spelling_correspondence_not_phonological_adjudication");
 assert.equal(gates.schema,"chromalect.phonetics.mandarin-final-spelling-context-gates.v0.1");
 assert.equal(queue.schema,"chromalect.phonetics.unadjudicated-compound-final-review-queue.v0.1");
 assert.equal(gates.summary.flaggedSourceReadings,213);
 assert.equal(queue.summary.compoundWrittenFinalCategories,27);
 assert.equal(queue.summary.independentFinalPhonologicalApprovals,0);
 assert.equal(queue.summary.approvedContextualPronunciations,0);
 assert.equal(ledger.source.citationBlobSHA,queue.sources.sourceBlobSHA);
 assert.equal(ledger.source.citationBlobSHA,gates.source.upstreamBlobSHA);
 assert.equal(ledger.source.cautionIndex,"data/phonetics/mandarin-final-spelling-context-gates-v0.1.json");
 assert.equal(ledger.source.workqueue,"data/phonetics/unadjudicated-compound-final-review-queue-v0.1.json");
 assert.equal(ledger.source.noLicensedSentenceTextCopied,true);
 assert.equal(ledger.source.componentPaletteChanged,false);
 assert.equal(gates.records.length,9);
 assert.equal(ledger.references.length,1);
 assert.deepEqual(ledger.references[0],{
  id:"polyu-pinyin-spelling",
  publisher:"The Hong Kong Polytechnic University, BEPTH",
  pageTitle:"Spelling Rules in Pinyin",
  url:"https://www.polyu.edu.hk/bepth/introduction-to-phonetics/spelling-rules-in-pinyin/?sc_lang=en",
  ruleScope:"Orthographic shortening of iou, uei and uen after a consonantal initial; not IPA or an acoustic measurement",
  accessCheckedDate:"2026-10-23"
 });
 const cases=[
  ["contracted_iu","iu","iou"],
  ["contracted_ui","ui","uei"],
  ["contracted_un_nonpalatal","un","uen"]
 ];
 assert.equal(ledger.records.length,cases.length);
 const all=new Map(gates.records.map(x=>[x.id,x]));
 assert.equal(all.size,9);
 let total=0;
 for(let i=0;i<cases.length;i++){
  const [family,written,expanded]=cases[i],row=ledger.records[i],warning=all.get(family);
  assert.ok(warning,"Missing source caution category");
  assert.equal(row.cautionFamily,family);
  assert.equal(row.writtenFinal,written);
  assert.equal(row.expandedOrthographicComparison,expanded);
  assert.equal(row.observedSourceReadingUses,warning.observedReadingCount);
  assert.ok(warning.observedTokenTriples.every(t=>t.final===written));
  assert.equal(row.sourceRule,"polyu-pinyin-spelling");
  assert.equal(row.comparisonStatus,"documented_spelling_rule_only");
  assert.equal(row.phonologicalRepresentation,null);
  assert.equal(row.ipaApproval,false);
  assert.equal(row.contextualReadingApproval,false);
  assert.deepEqual(Object.keys(row).sort(),[
   "cautionFamily","comparisonStatus","contextualReadingApproval",
   "expandedOrthographicComparison","ipaApproval","observedSourceReadingUses",
   "phonologicalRepresentation","sourceRule","writtenFinal"].sort());
  total+=warning.observedReadingCount;
 }
 assert.deepEqual(ledger.summary,{
  cautionFamiliesInSource:9,
  externallyCrosscheckedSpellingFamilies:3,
  sourceReadingUsesInThoseFamilies:total,
  remainingCautionFamilies:6,
  remainingSourceReadingUses:213-total,
  independentPhonologicalApprovals:0,
  humanDecodingTrials:0
 });
 assert.equal(total,63);
 assert.equal(queue.summary.humanDecodingTrials,0);
 // In particular, only the 20 nonpalatal "un" uses are covered by the
 // contraction reference: the 18 palatal-written "un" uses stay separate.
 assert.equal(all.get("contracted_un_nonpalatal").observedReadingCount,20);
 assert.equal(all.get("palatal_written_un").observedReadingCount,18);
 return true;
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 if(!process.argv.includes("--check"))throw Error("Use --check");
 const get=p=>JSON.parse(fs.readFileSync(p,"utf8"));
 verifyOrthographicCrosswalk(
  get("data/phonetics/external-orthographic-spelling-rule-crosswalk-v0.1.json"),
  get("data/phonetics/mandarin-final-spelling-context-gates-v0.1.json"),
  get("data/phonetics/unadjudicated-compound-final-review-queue-v0.1.json"));
 console.log("Verified 3 published orthographic comparison leads (63 caution uses), zero sound approvals.");
}
