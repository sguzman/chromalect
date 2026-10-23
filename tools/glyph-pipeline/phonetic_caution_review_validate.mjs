// Local-only phonetic research notes pinned to Mandarin citation readings.
// A validated draft is never an independently approved phonological analysis.
import assert from "node:assert/strict";
import fs from "node:fs";
import {pathToFileURL} from "node:url";

const fields=[
 "rank","character","display","initial","final","tone","cautionFamily",
 "assessment","evidenceURL","evidenceRationale","declaredVariety",
 "transcriptionConvention","workingTranscription"
];
const own=(value,keys)=>assert.deepEqual(Object.keys(value).sort(),keys.slice().sort(),
 "Unexpected fields, including any unsupported approval claims");
const assessmentValues=new Set(["undetermined","tentative_lead","needs_correction"]);
const validString=(text,max)=>typeof text==="string"&&text.length<=max&&
 !/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/u.test(text);

export function validatePhoneticCautionReview(session,gates,citations){
 assert.ok(session&&typeof session==="object"&&!Array.isArray(session));
 own(session,["schema","status","source","session","observations"]);
 assert.equal(session.schema,"chromalect.phonetics.local-caution-review-session.v0.1");
 assert.equal(session.status,"unverified_local_phonetic_research_notes_not_ipa_or_phoneme_approval");
 assert.equal(gates.schema,"chromalect.phonetics.mandarin-final-spelling-context-gates.v0.1");
 assert.equal(gates.summary.flaggedSourceReadings,213);
 assert.equal(gates.records.length,9);
 assert.equal(citations.schema,"chromalect.pronunciation-citations.v0");
 assert.equal(citations.characters.length,1000);
 assert.equal(gates.source.upstreamBlobSHA,citations.source.blob_sha);
 own(session.source,["citationBlobSHA","cautionIndex","citationIndex"]);
 assert.equal(session.source.citationBlobSHA,citations.source.blob_sha);
 assert.equal(session.source.cautionIndex,"mandarin-final-spelling-context-gates-v0.1.json");
 assert.equal(session.source.citationIndex,"pronunciation-citations-0001-1000.json");
 own(session.session,["localOnly","exportedAt","recorded"]);
 assert.equal(session.session.localOnly,true);
 assert.ok(typeof session.session.exportedAt==="string"&&
  !Number.isNaN(Date.parse(session.session.exportedAt)));
 assert.ok(Array.isArray(session.observations)&&session.observations.length>=1&&
  session.observations.length<=213);
 assert.equal(session.session.recorded,session.observations.length);

 const byTriple=new Map();
 const gateCounts=new Map();
 for(const gate of gates.records){
  assert.ok(!gateCounts.has(gate.id));
  assert.equal(gate.independentIPAAnalysisApproved,false);
  assert.equal(gate.certifiedAcousticRealizations,0);
  gateCounts.set(gate.id,0);
  for(const r of gate.observedTokenTriples){
   const key=JSON.stringify([r.initial,r.final,r.tone]);
   assert.ok(!byTriple.has(key),"Overlapping caution predicates");
   byTriple.set(key,gate.id);
  }
 }
 assert.equal(byTriple.size,108);
 const allowed=new Map();
 let flagged=0;
 for(let i=0;i<citations.characters.length;i++){
  const c=citations.characters[i];
  assert.equal(c.rank,i+1);
  for(const r of c.readings){
   const family=byTriple.get(JSON.stringify([r.initial,r.final,r.tone]));
   if(!family)continue;
   flagged++;
   gateCounts.set(family,gateCounts.get(family)+1);
   const key=JSON.stringify([c.rank,r.display,r.initial,r.final,r.tone]);
   assert.ok(!allowed.has(key),"Duplicate citation reading identity");
   allowed.set(key,{character:c.character,family});
  }
 }
 assert.equal(flagged,213);
 for(const gate of gates.records)
  assert.equal(gateCounts.get(gate.id),gate.observedReadingCount);

 const seen=new Set();let preliminary=0;
 for(const r of session.observations){
  assert.ok(r&&typeof r==="object"&&!Array.isArray(r));
  own(r,fields);
  const key=JSON.stringify([r.rank,r.display,r.initial,r.final,r.tone]);
  const expected=allowed.get(key);
  assert.ok(expected,"Not a pinned caution-specific citation reading");
  assert.equal(r.character,expected.character);
  assert.equal(r.cautionFamily,expected.family);
  assert.ok(!seen.has(key),"Duplicate source reading note");
  seen.add(key);
  assert.ok(assessmentValues.has(r.assessment));
  for(const field of ["evidenceURL","evidenceRationale",
   "declaredVariety","transcriptionConvention","workingTranscription"])
   assert.ok(validString(r[field],field==="evidenceRationale"?3000:field==="evidenceURL"?1000:120),
    "Invalid review note value");
  assert.ok(!/[\r\n]/u.test(r.workingTranscription),
   "A working transcription must be a bounded single-line label");
  const assessed=r.assessment!=="undetermined"||r.workingTranscription.length>0;
  if(assessed){
   preliminary++;
   assert.ok(r.evidenceURL.length>0,"A preliminary hypothesis requires external evidence");
   assert.ok(r.evidenceRationale.trim().length>=30,
    "A preliminary hypothesis requires a substantive rationale");
   assert.ok(r.declaredVariety.trim().length>0&&
    r.transcriptionConvention.trim().length>0,
    "Proposed symbols need declared linguistic scope and transcription convention");
  }
  if(r.evidenceURL){
   const url=new URL(r.evidenceURL);
   assert.equal(url.protocol,"https:");
   assert.equal(url.username,"");assert.equal(url.password,"");
   assert.equal(url.hash,"");
   assert.ok(url.hostname);
  }
 }
 return {localNotes:seen.size,unapprovedPreliminaryHypotheses:preliminary,
  independentIPAApprovals:0,phonemeInventoryApprovals:0,acousticVerifications:0};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const path=process.argv[2];
 if(!path)throw Error("Supply an explicitly exported local phonetic review JSON file");
 const get=p=>JSON.parse(fs.readFileSync(p,"utf8"));
 const status=validatePhoneticCautionReview(
  get(path),
  get("data/phonetics/mandarin-final-spelling-context-gates-v0.1.json"),
  get("site/pronunciation-citations-0001-1000.json"));
 console.log(JSON.stringify(status));
}
