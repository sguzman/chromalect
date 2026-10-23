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
  "pc-save","pc-export","pc-output","pc-count","pc-status"];
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
assert.match(ui["pc-count"].textContent,/1 local draft notes/);
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
 "pc-save","pc-export","pc-output","pc-count","pc-status"])
 assert.match(html,new RegExp('id="'+id+'"'));
assert.ok(!js.includes("innerHTML"));
console.log("213 local-only Mandarin phonetic candidates, strict JSON export and refusal paths checked.");
