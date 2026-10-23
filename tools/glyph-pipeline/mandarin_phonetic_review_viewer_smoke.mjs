import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import {validatePhoneticCautionReview} from "./phonetic_caution_review_validate.mjs";
const get=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const gates=get("data/phonetics/mandarin-final-spelling-context-gates-v0.1.json");
const citations=get("site/pronunciation-citations-0001-1000.json");
const js=fs.readFileSync("site/mandarin-phonetic-review.js","utf8");
const html=fs.readFileSync("site/mandarin-phonetic-review.html","utf8");
class Element{
 constructor(){this.children=[];this.textContent="";this.value="";this.events={};}
 appendChild(x){this.children.push(x);}
 replaceChildren(...x){this.children=x;}
 addEventListener(name,fn){this.events[name]=fn;}
}
function setup(source=[gates,citations]){
 const names=["pc-family","pc-candidate","pc-source","pc-assessment","pc-evidence",
  "pc-rationale","pc-variety","pc-convention","pc-transcription",
  "pc-save","pc-export","pc-import","pc-import-data","pc-output","pc-count","pc-status"];
 const nodes=Object.fromEntries(names.map(k=>[k,new Element()]));
 const urls=["phonetics/mandarin-final-spelling-context-gates-v0.1.json",
  "pronunciation-citations-0001-1000.json"];
 const doc={getElementById:id=>nodes[id],createElement:()=>new Element()};
 vm.runInNewContext(js,{document:doc,fetch:async url=>({ok:urls.includes(url),
  json:async()=>source[urls.indexOf(url)]}),URL,Date,Map,Set,Object,Math,Error,JSON});
 return nodes;
}
async function settle(ui){for(let i=0;i<55&&!ui["pc-candidate"].children.length&&
 !ui["pc-status"].textContent.includes("Unable");i++)await Promise.resolve();}
const ui=setup();await settle(ui);
assert.equal(ui["pc-candidate"].children.length,213);
assert.equal(ui["pc-family"].children.length,10);
assert.match(ui["pc-source"].textContent,/source written initial/);
assert.match(ui["pc-status"].textContent,/213 pinned caution-reading identities/);
ui["pc-assessment"].value="tentative_lead";
ui["pc-evidence"].value="https://www.polyu.edu.hk/bepth/introduction-to-phonetics/spelling-rules-in-pinyin/?sc_lang=en";
ui["pc-rationale"].value="Published Pinyin spelling discussion requires separate acoustic and contextual comparison.";
ui["pc-variety"].value="Mainland Standard Mandarin; provisional";
ui["pc-convention"].value="Working broad IPA comparison; unapproved";
ui["pc-transcription"].value="[experimental label]";
ui["pc-save"].events.click();
assert.match(ui["pc-count"].textContent,/1 locally saved notes/);
ui["pc-export"].events.click();
const session=JSON.parse(ui["pc-output"].value);
assert.equal(session.observations.length,1);
assert.equal(session.session.localOnly,true);
assert.deepEqual(validatePhoneticCautionReview(session,gates,citations),
 {localNotes:1,unapprovedPreliminaryHypotheses:1,
  independentIPAApprovals:0,phonemeInventoryApprovals:0,acousticVerifications:0});
ui["pc-evidence"].value="http://unverified.invalid";
ui["pc-save"].events.click();
assert.match(ui["pc-status"].textContent,/Draft not saved/);
ui["pc-evidence"].value="https://www.polyu.edu.hk/bepth/introduction-to-phonetics/spelling-rules-in-pinyin/?sc_lang=en";
// Unsubmitted changes stay in page memory on navigation, and cannot disappear
// into a superficially valid export of only the earlier saved notes.
ui["pc-rationale"].value="Changed but not yet explicitly saved; provenance still needs separate review.";
ui["pc-family"].value="labial_written_o";ui["pc-family"].events.change();
assert.match(ui["pc-count"].textContent,/1 unsaved edits/);
ui["pc-family"].value="all";ui["pc-family"].events.change();
assert.match(ui["pc-rationale"].value,/Changed but not yet explicitly saved/);
// A second reading contains incomplete scratch edits. Export must not
// silently omit it when the first reading is saved.
ui["pc-family"].value="labial_written_o";ui["pc-family"].events.change();
ui["pc-rationale"].value="Other incomplete local scratch note";
ui["pc-family"].value="all";ui["pc-family"].events.change();
ui["pc-export"].events.click();
assert.match(ui["pc-status"].textContent,/Export blocked/);
// Returning the incomplete note to defaults clears its scratch state.
ui["pc-family"].value="labial_written_o";ui["pc-family"].events.change();
assert.match(ui["pc-rationale"].value,/Other incomplete local scratch note/);
ui["pc-rationale"].value="";
ui["pc-family"].value="all";ui["pc-family"].events.change();
ui["pc-save"].events.click();
assert.match(ui["pc-count"].textContent,/0 unsaved edits/);
ui["pc-export"].events.click();
const revised=JSON.parse(ui["pc-output"].value);
assert.equal(revised.observations.length,1);
assert.match(revised.observations[0].evidenceRationale,/Changed but not yet/);
assert.equal(validatePhoneticCautionReview(revised,gates,citations).localNotes,1);

// A complete exported session may be restored into a new browser instance.
const restored=setup();await settle(restored);
restored["pc-import-data"].value=JSON.stringify(revised);
restored["pc-import"].events.click();
assert.match(restored["pc-count"].textContent,/1 locally saved notes/);
assert.match(restored["pc-rationale"].value,/Changed but not yet/);
restored["pc-export"].events.click();
const roundtrip=JSON.parse(restored["pc-output"].value);
assert.equal(validatePhoneticCautionReview(roundtrip,gates,citations).localNotes,1);

// Rejected source drift, extra approval flags and duplicate identities do not
// mutate the valid in-memory drafts that predated the attempted import.
for(const mutate of [
 x=>{x.source.citationBlobSHA="wrong";},
 x=>{x.observations[0].independentIPAApproved=true;},
 x=>{x.observations.push(x.observations[0]);x.session.recorded=2;},
 x=>{x.observations[0].evidenceURL="http://invalid.example";},
 x=>{x.observations[0].cautionFamily="incorrect";},
 x=>{x.observations[0].evidenceRationale="too short";}
]){
 const invalid=structuredClone(revised);mutate(invalid);
 restored["pc-import-data"].value=JSON.stringify(invalid);
 restored["pc-import"].events.click();
 assert.match(restored["pc-status"].textContent,/Import blocked; existing drafts preserved/);
 assert.match(restored["pc-count"].textContent,/1 locally saved notes/);
}
restored["pc-export"].events.click();
assert.equal(validatePhoneticCautionReview(
 JSON.parse(restored["pc-output"].value),gates,citations).localNotes,1);
ui["pc-family"].value="labial_written_o";ui["pc-family"].events.change();
assert.equal(ui["pc-candidate"].children.length,16);
assert.match(ui["pc-source"].textContent,/labial_written_o/);
const tampered=[structuredClone(gates),structuredClone(citations)];
tampered[1].source.blob_sha="unknown";
const blocked=setup(tampered);await settle(blocked);
assert.match(blocked["pc-status"].textContent,/Unable to load/);
assert.equal(blocked["pc-candidate"].children.length,0);
for(const id of ["pc-family","pc-candidate","pc-source","pc-assessment","pc-evidence",
 "pc-rationale","pc-variety","pc-convention","pc-transcription",
 "pc-save","pc-export","pc-import","pc-import-data","pc-output","pc-count","pc-status"])
 assert.match(html,new RegExp('id="'+id+'"'));
assert.ok(!js.includes("innerHTML"));
console.log("213 source-pinned citations, lossless navigation, transactional import, export parity and rejection paths checked.");
