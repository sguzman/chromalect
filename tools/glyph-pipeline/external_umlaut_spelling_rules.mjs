// Source-linked Pinyin umlaut-omission correspondence; never a phonetic transcription.
import assert from "node:assert/strict";
import fs from "node:fs";
import {pathToFileURL} from "node:url";
import {verifyOrthographicCrosswalk} from "./external_orthographic_spelling_rules.mjs";

export function verifyUmlautCrosswalk(ledger,contractions,gates,queue){
 verifyOrthographicCrosswalk(contractions,gates,queue);
 assert.equal(ledger.schema,"chromalect.phonetics.external-umlaut-spelling-rule-crosswalk.v0.1");
 assert.equal(ledger.status,"research_only_written_spelling_correspondence_not_phonological_adjudication");
 assert.equal(ledger.source.citationBlobSHA,queue.sources.sourceBlobSHA);
 assert.equal(ledger.source.cautionIndex,"data/phonetics/mandarin-final-spelling-context-gates-v0.1.json");
 assert.equal(ledger.source.contractionCrosswalk,"data/phonetics/external-orthographic-spelling-rule-crosswalk-v0.1.json");
 assert.equal(ledger.source.noLicensedSentenceTextCopied,true);
 assert.equal(ledger.source.componentPaletteChanged,false);
 assert.deepEqual(ledger.references,[{
  id:"polyu-pinyin-spelling",
  publisher:"The Hong Kong Polytechnic University, BEPTH",
  pageTitle:"Spelling Rules in Pinyin",
  url:"https://www.polyu.edu.hk/bepth/introduction-to-phonetics/spelling-rules-in-pinyin/?sc_lang=en",
  ruleScope:"Written ü marks are omitted with j, q, x and syllable-initial y; the examples are spelling comparisons only",
  accessCheckedDate:"2026-10-23"
 }]);
 const cases=[
  ["palatal_written_u","u","ü"],
  ["palatal_written_un","un","ün"],
  ["palatal_written_ue","ue","üe"],
  ["palatal_written_uan","uan","üan"]
 ];
 assert.equal(ledger.records.length,cases.length);
 let total=0;
 const cautions=new Map(gates.records.map(x=>[x.id,x]));
 for(let i=0;i<cases.length;i++){
  const [family,written,expanded]=cases[i],row=ledger.records[i],gate=cautions.get(family);
  assert.ok(gate);
  assert.equal(row.cautionFamily,family);
  assert.equal(row.writtenFinal,written);
  assert.equal(row.expandedOrthographicComparison,expanded);
  assert.equal(row.observedSourceReadingUses,gate.observedReadingCount);
  assert.ok(gate.observedTokenTriples.length>0);
  assert.ok(gate.observedTokenTriples.every(t=>t.final===written&&
   ["j","q","x","y"].includes(t.initial)));
  assert.equal(row.sourceRule,"polyu-pinyin-spelling");
  assert.equal(row.ruleClass,"umlaut_omission_after_j_q_x_or_y");
  assert.equal(row.comparisonStatus,"documented_spelling_rule_only");
  assert.equal(row.phonologicalRepresentation,null);
  assert.equal(row.ipaApproval,false);
  assert.equal(row.contextualReadingApproval,false);
  assert.deepEqual(Object.keys(row).sort(),[
   "cautionFamily","writtenFinal","expandedOrthographicComparison","observedSourceReadingUses",
   "sourceRule","ruleClass","comparisonStatus","phonologicalRepresentation",
   "ipaApproval","contextualReadingApproval"].sort());
  total+=gate.observedReadingCount;
 }
 assert.equal(total,71);
 assert.equal(cautions.get("palatal_written_un").observedReadingCount,18);
 assert.equal(cautions.get("contracted_un_nonpalatal").observedReadingCount,20);
 assert.deepEqual(ledger.summary,{
  umlautRuleFamilies:4,sourceReadingUsesInThoseFamilies:71,
  combinedDocumentedWarningFamilies:7,combinedSourceReadingUses:134,
  remainingWarningFamilies:2,remainingSourceUses:79,
  independentPhonologicalApprovals:0,humanDecodingTrials:0
 });
 const linked=new Set([...contractions.records,...ledger.records].map(x=>x.cautionFamily));
 assert.equal(linked.size,7);
 assert.deepEqual(gates.records.filter(x=>!linked.has(x.id)).map(x=>x.id),
  ["post_sibilant_i","labial_written_o"]);
 return true;
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 if(!process.argv.includes("--check"))throw Error("Use --check");
 const get=p=>JSON.parse(fs.readFileSync(p,"utf8"));
 verifyUmlautCrosswalk(
  get("data/phonetics/external-umlaut-spelling-rule-crosswalk-v0.1.json"),
  get("data/phonetics/external-orthographic-spelling-rule-crosswalk-v0.1.json"),
  get("data/phonetics/mandarin-final-spelling-context-gates-v0.1.json"),
  get("data/phonetics/unadjudicated-compound-final-review-queue-v0.1.json"));
 console.log("Verified 4 written umlaut-spelling cohorts and 71 source uses; zero IPA approvals.");
}
