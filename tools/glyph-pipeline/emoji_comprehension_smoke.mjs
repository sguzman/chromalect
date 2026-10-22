// Browser-free smoke of the ACTUAL blind trial UI and versioned source audit.
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const html=fs.readFileSync("site/emoji-comprehension.html","utf8");
const source=fs.readFileSync("site/emoji-comprehension.js","utf8");
const audit=JSON.parse(fs.readFileSync("data/semantic/cedict-crossref/emoji-visibility-audit-v0.1.json","utf8"));
const ids=[
 "emoji-study-scope","emoji-study-count","emoji-study-start","emoji-study-export",
 "emoji-study-status","emoji-study-session","emoji-study-counter","emoji-study-progress",
 "emoji-study-fill","emoji-study-symbol","emoji-study-blind","emoji-study-interpretation",
 "emoji-study-confidence","emoji-study-reveal","emoji-study-post","emoji-study-target",
 "emoji-study-source","emoji-study-next"
];
class Element {
  constructor(tag="div"){
    this.tagName=tag;this.listeners={};this.dataset={};this.attributes={};this.hidden=false;
    this.disabled=false;this.textContent="";this.value="";this.style={};this.children=[];
  }
  addEventListener(type,callback){this.listeners[type]=callback;}
  setAttribute(name,val){this.attributes[name]=String(val);}
  appendChild(child){this.children.push(child);}
  click(){this.listeners.click?.();this.clicked=true;}
  remove(){this.removed=true;}
}
const elements=Object.fromEntries(ids.map(id=>[id,new Element()]));
elements["emoji-study-scope"].value="all";
elements["emoji-study-count"].value="20";
elements["emoji-study-start"].disabled=true;
elements["emoji-study-export"].disabled=true;
elements["emoji-study-session"].hidden=true;
elements["emoji-study-post"].hidden=true;
elements["emoji-study-next"].disabled=true;
const clarity=["clear","partial","misleading","uncertain"].map(v=>{
  const el=new Element("button");el.dataset.clarity=v;return el;
});
let exportedBlob=null,downloaded=null,revoked=false;
const body=new Element("body");
const document={
 getElementById:id=>elements[id],
 querySelectorAll:sel=>{
  assert.equal(sel,"[data-clarity]");
  return clarity;
 },
 createElement:tag=>{
  const e=new Element(tag);
  if(tag==="a")downloaded=e;
  return e;
 },
 body
};
const sandbox={
 document,Blob,Date,Math,
 URL:{createObjectURL:blob=>{exportedBlob=blob;return "blob:test";},
  revokeObjectURL:url=>{assert.equal(url,"blob:test");revoked=true;}},
 fetch:async path=>{
   assert.equal(path,"semantic/emoji-visibility-audit-v0.1.json");
   return {ok:true,json:async()=>audit};
 }
};
sandbox.globalThis=sandbox;
vm.runInNewContext(source,sandbox);
for(let i=0;i<12&&elements["emoji-study-start"].disabled;i++) await Promise.resolve();
assert.equal(elements["emoji-study-start"].disabled,false,"Versioned audit must load");
assert.match(elements["emoji-study-status"].textContent,/897 experimental expressions/);
assert.equal(elements["emoji-study-export"].disabled,true);
elements["emoji-study-start"].click();
const panel=elements["emoji-study-session"];
assert.equal(panel.hidden,false);
assert.equal(elements["emoji-study-post"].hidden,true,"Answer must initially remain hidden");
assert.equal(elements["emoji-study-blind"].hidden,false);
assert.ok(elements["emoji-study-symbol"].textContent.length>0);
assert.equal(elements["emoji-study-target"].textContent,"","No intended meaning may leak before revealing");
assert.equal(elements["emoji-study-progress"].attributes["aria-valuenow"],"0");
const symbol=elements["emoji-study-symbol"].textContent;
assert.ok(audit.records.some(r=>r.emojiDisplay===symbol));
elements["emoji-study-interpretation"].value="A possible meaning";
elements["emoji-study-confidence"].value="medium";
elements["emoji-study-reveal"].click();
assert.equal(elements["emoji-study-blind"].hidden,true);
assert.equal(elements["emoji-study-post"].hidden,false);
assert.match(elements["emoji-study-target"].textContent,/.+ — .+/);
assert.equal(elements["emoji-study-next"].disabled,true,"Rating is required after reveal");
clarity[1].click();
assert.equal(elements["emoji-study-next"].disabled,false);
assert.equal(clarity[1].attributes["aria-pressed"],"true");
elements["emoji-study-next"].click();
assert.equal(elements["emoji-study-progress"].attributes["aria-valuenow"],"1");
assert.equal(elements["emoji-study-fill"].style.width,"5.0%");
assert.equal(elements["emoji-study-post"].hidden,true,"Next item starts blinded");
assert.equal(elements["emoji-study-export"].disabled,false);
elements["emoji-study-export"].click();
assert.ok(exportedBlob instanceof Blob);
assert.equal(revoked,true);
assert.equal(downloaded.download,"chromalect-emoji-blind-study.json");
const payload=JSON.parse(await exportedBlob.text());
assert.equal(payload.schema,"chromalect.emoji-comprehension-session.v0.1");
assert.equal(payload.status,"unverified_exploratory_observations_not_production_review");
assert.equal(payload.session.rated,1);
assert.equal(payload.session.planned,20);
assert.equal(payload.answers.length,1);
assert.equal(payload.answers[0].blindResponse,"A possible meaning");
assert.equal(payload.answers[0].confidence,"medium");
assert.equal(payload.answers[0].clarityRatingAfterReveal,"partial");
assert.ok(payload.answers[0].trialId);
assert.doesNotMatch(JSON.stringify(payload),/productionVerified":true|humanLexicalApproved":\s*[1-9]/);
assert.match(html,/Nothing is sent to Chromalect or GitHub/);
assert.match(html,/id="emoji-study-symbol"/);
assert.match(html,/semantic\/emoji-visibility-audit-v0.1\.json/);
console.log("Blind comprehension: 897 source examples, hidden meaning until answer, required clarity rating, local-only export and 5% session progress.");
