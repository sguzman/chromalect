import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const get=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const tones=get("data/phonetics/mandarin-citation-tone-contours-v0.1.json");
const audit=get("data/phonetics/citation-tone-isolation-audit-v0.1.json");
const js=fs.readFileSync("site/mandarin-tone-practice.js","utf8");
const html=fs.readFileSync("site/mandarin-tone-contours.html","utf8");
class Element{
 constructor(tag){this.tag=tag;this.children=[];this.textContent="";
  this.events={};this.attributes={};this.disabled=false;}
 appendChild(node){this.children.push(node);return node;}
 replaceChildren(...nodes){this.children=nodes;}
 addEventListener(key,fn){this.events[key]=fn;}
 setAttribute(k,v){this.attributes[k]=String(v);}
}
function setup(d=tones,proof=audit){
 const ids=["tone-practice-start","tone-practice-next","tone-practice-prompt",
  "tone-practice-answers","tone-practice-feedback","tone-practice-status"];
 const els=Object.fromEntries(ids.map(x=>[x,new Element("div")]));
 const doc={getElementById:id=>els[id],
  createElement:t=>new Element(t),createElementNS:(_,t)=>new Element(t)};
 vm.runInNewContext(js,{document:doc,fetch:async u=>({ok:true,json:async()=>
  u.includes("isolation")?proof:d}),Map,Set,Math,Number,Array,Error,JSON});
 return els;
}
async function settle(e){
 for(let i=0;i<60&&!e["tone-practice-status"].textContent;i++)await Promise.resolve();
}
const ui=setup();await settle(ui);
assert.match(ui["tone-practice-status"].textContent,/Eight balanced/);
ui["tone-practice-start"].events.click();
assert.equal(ui["tone-practice-answers"].children.length,4);
assert.equal(ui["tone-practice-prompt"].children.length,1);
const svg=ui["tone-practice-prompt"].children[0];
assert.equal(svg.tag,"svg");
assert.equal(svg.attributes["aria-label"],"Unlabeled idealized relative-pitch contour");
assert.equal(svg.children[0].tag,"polyline");
assert.ok(!ui["tone-practice-prompt"].textContent.includes("Pinyin"));
const initial=ui["tone-practice-status"].textContent;
assert.match(initial,/Prompt 1 \/ 8/);
const firstChoice=ui["tone-practice-answers"].children[0];
firstChoice.events.click();
assert.match(ui["tone-practice-feedback"].textContent,/source idealized T[1-4] shape/);
assert.equal(ui["tone-practice-next"].disabled,false);
assert.ok(ui["tone-practice-answers"].children.every(x=>x.disabled));
const feedback=ui["tone-practice-feedback"].textContent;
firstChoice.events.click();
assert.equal(ui["tone-practice-feedback"].textContent,feedback);
for(let i=0;i<8;i++){
 if(i>0){ui["tone-practice-next"].events.click();
  assert.match(ui["tone-practice-status"].textContent,new RegExp("Prompt "+(i+1)+" / 8"));
  ui["tone-practice-answers"].children[0].events.click();}
}
ui["tone-practice-next"].events.click();
assert.match(ui["tone-practice-status"].textContent,/Local-only practice complete/);
assert.equal(ui["tone-practice-prompt"].children.length,0);
assert.equal(ui["tone-practice-answers"].children.length,0);
ui["tone-practice-start"].events.click();
assert.match(ui["tone-practice-status"].textContent,/Prompt 1 \/ 8/);
const invalid=structuredClone(audit);invalid.summary.humanToneDiscriminationTrials=1;
const reject=setup(tones,invalid);await settle(reject);
assert.match(reject["tone-practice-status"].textContent,/Unable to validate/);
assert.equal(reject["tone-practice-prompt"].children.length,0);
const mismatched=structuredClone(tones);mismatched.tones[3].levels=[1,1];
const rejectData=setup(mismatched,audit);await settle(rejectData);
assert.match(rejectData["tone-practice-status"].textContent,/Unable to validate/);
for(const id of ["start","next","prompt","answers","feedback","status"])
 assert.ok(html.includes('id="tone-practice-'+id+'"'));
assert.ok(!js.includes("localStorage")&&!js.includes("innerHTML")&&!js.includes("sendBeacon"));
console.log("Eight balanced source-bound contour-only prompts; no onset/final cues, auto-save, network report, or invented human study.");
