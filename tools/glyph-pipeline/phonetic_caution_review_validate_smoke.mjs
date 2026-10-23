import assert from "node:assert/strict";
import fs from "node:fs";
import {validatePhoneticCautionReview} from "./phonetic_caution_review_validate.mjs";
const get=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const gates=get("data/phonetics/mandarin-final-spelling-context-gates-v0.1.json");
const citations=get("site/pronunciation-citations-0001-1000.json");
const original=gates.records[0].firstSourceExamples[0];
const second=gates.records.at(-1).firstSourceExamples[0];
function entry(x,id){
 return {rank:x.rank,character:x.character,display:x.display,
  initial:x.initial,final:x.final,tone:x.tone,cautionFamily:id,
  assessment:"undetermined",evidenceURL:"",evidenceRationale:"",
  declaredVariety:"",transcriptionConvention:"",workingTranscription:""};
}
const session={
 schema:"chromalect.phonetics.local-caution-review-session.v0.1",
 status:"unverified_local_phonetic_research_notes_not_ipa_or_phoneme_approval",
 source:{citationBlobSHA:citations.source.blob_sha,
  cautionIndex:"mandarin-final-spelling-context-gates-v0.1.json",
  citationIndex:"pronunciation-citations-0001-1000.json"},
 session:{localOnly:true,exportedAt:"2026-10-23T00:00:00Z",recorded:2},
 observations:[entry(original,"post_sibilant_i"),entry(second,"labial_written_o")]
};
session.observations[1].assessment="tentative_lead";
session.observations[1].evidenceURL="https://www.polyu.edu.hk/bepth/introduction-to-phonetics/simple-finals/?sc_lang=en";
session.observations[1].evidenceRationale="An external written reference suggests a comparison worth independent acoustic review.";
session.observations[1].declaredVariety="Mainland Standard Mandarin, declared for research only";
session.observations[1].transcriptionConvention="Working comparison label, not adopted IPA";
session.observations[1].workingTranscription="[unverified label]";
assert.deepEqual(validatePhoneticCautionReview(session,gates,citations),
 {localNotes:2,unapprovedPreliminaryHypotheses:1,
  independentIPAApprovals:0,phonemeInventoryApprovals:0,acousticVerifications:0});
function reject(modify){
 const s=structuredClone(session),g=structuredClone(gates),c=structuredClone(citations);
 modify(s,g,c);
 assert.throws(()=>validatePhoneticCautionReview(s,g,c));
}
reject(s=>{s.source.citationBlobSHA="unknown";});
reject(s=>{s.status="approved";});
reject(s=>{s.session.localOnly=false;});
reject(s=>{s.session.recorded=3;});
reject(s=>{s.observations[0].rank=3;});
reject(s=>{s.observations[0].cautionFamily="labial_written_o";});
reject(s=>{s.observations[0].character="假";});
reject(s=>{s.observations[0].initial="x";});
reject(s=>{s.observations[0].independentIPAApproved=true;});
reject(s=>{s.observations.push(s.observations[0]);s.session.recorded=3;});
reject(s=>{s.observations[1].evidenceURL="http://example.org";});
reject(s=>{s.observations[1].evidenceURL="https://username:password@example.org";});
reject(s=>{s.observations[1].evidenceURL="https://example.org/a#frag";});
reject(s=>{s.observations[1].evidenceRationale="short";});
reject(s=>{s.observations[1].declaredVariety="";});
reject(s=>{s.observations[1].workingTranscription="two\nlines";});
reject((s,g)=>{g.records[0].independentIPAAnalysisApproved=true;});
reject((s,g,c)=>{c.source.blob_sha="moved";});
console.log("Two pinned citation-specific local notes and 18 negative linguistic approval/provenance cases passed.");
