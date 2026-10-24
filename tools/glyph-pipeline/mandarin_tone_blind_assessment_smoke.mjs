import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const source=read("data/phonetics/mandarin-citation-tone-contours-v0.1.json");
const proof=read("data/phonetics/citation-tone-isolation-audit-v0.1.json");
const js=fs.readFileSync("site/mandarin-tone-blind-assessment.js","utf8");
const page=fs.readFileSync("site/mandarin-tone-contours.html","utf8");
class Element {
 constructor(tag){this.tag=tag;this.children=[];this.value="";this.textContent="";
  this.checked=false;this.disabled=false;this.attributes={};this.events={};}
 appendChild(n){this.children.push(n);return n;}
 replaceChildren(...items){this.children=items;}
 setAttribute(k,v){this.attributes[k]=String(v);}
 addEventListener(k,cb){this.events[k]=cb;}
 select(){this.selected=true;}
}
function setup(d=source,a=proof){
 const ids=["tone-blind-consent","tone-blind-start","tone-blind-prompt",
  "tone-blind-answers","tone-blind-status","tone-blind-summary",
  "tone-blind-export","tone-blind-export-select"];
 const elements=Object.fromEntries(ids.map(id=>[id,new Element("div")]));
 const context={document:{getElementById:id=>elements[id],
  createElement:tag=>new Element(tag),createElementNS:(_,tag)=>new Element(tag)},
  fetch:async uri=>({ok:true,json:async()=>uri.includes("isolation")?a:d}),
  Map,Set,Object,JSON,Array,Number,Error,
  Math:{random:()=>.314159, floor:Math.floor}};
 vm.runInNewContext(js,context);
 return elements;
}
async function settle(ui){
 for(let i=0;i<90&&!ui["tone-blind-status"].textContent;i++)await Promise.resolve();
}
const ui=setup();await settle(ui);
assert.match(ui["tone-blind-status"].textContent,/16-trial assessment available/);
assert.equal(ui["tone-blind-start"].disabled,true);
ui["tone-blind-start"].events.click();
assert.equal(ui["tone-blind-prompt"].children.length,0,"No implicit start without opt in");
ui["tone-blind-consent"].checked=true;ui["tone-blind-consent"].events.change();
assert.equal(ui["tone-blind-start"].disabled,false);
ui["tone-blind-start"].events.click();
assert.equal(ui["tone-blind-prompt"].children.length,1);
assert.equal(ui["tone-blind-answers"].children.length,4);
assert.equal(ui["tone-blind-prompt"].children[0].tag,"svg");
assert.equal(ui["tone-blind-prompt"].children[0].attributes["aria-label"],
 "Unlabeled monochrome relative-pitch curve; answer withheld");
assert.equal(ui["tone-blind-export"].value,"");
const choices=[];
for(let step=1;step<=16;step++){
 assert.match(ui["tone-blind-status"].textContent,new RegExp("Assessment "+step+" of 16"));
 assert.equal(ui["tone-blind-answers"].children.length,4);
 const labels=ui["tone-blind-answers"].children.map(b=>b.attributes["data-tone-choice"]);
 assert.deepEqual([...labels].sort(),["1","2","3","4"]);
 assert.ok(!ui["tone-blind-summary"].textContent);
 assert.equal(ui["tone-blind-export"].value,"","No correct-answer leaks before completion");
 const answer=ui["tone-blind-answers"].children.find(b=>b.attributes["data-tone-choice"]==="1");
 choices.push(answer);
 answer.events.click();
 if(step<16)assert.equal(ui["tone-blind-prompt"].children.length,1);
}
assert.equal(ui["tone-blind-prompt"].children.length,0);
assert.equal(ui["tone-blind-answers"].children.length,0);
assert.match(ui["tone-blind-status"].textContent,/Assessment complete/);
const exported=JSON.parse(ui["tone-blind-export"].value);
assert.equal(exported.schema,"chromalect.phonetics.blind-citation-contour-session.v0.1");
assert.equal(exported.results.correct,4,"Each category appears four times");
assert.equal(exported.results.total,16);
assert.deepEqual(exported.results.perTone.map(r=>r.presentations),[4,4,4,4]);
assert.deepEqual(exported.results.perTone.map(r=>r.correct),[4,0,0,0]);
assert.equal(exported.results.trialResponses.length,16);
assert.deepEqual(exported.results.trialResponses.map(r=>r.expectedTone).sort(),
 [1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4]);
const order=exported.results.trialResponses.map(r=>r.expectedTone);
assert.ok(order.every((r,i)=>i===0||r!==order[i-1]),"No consecutive repeated categories");
for(let block=0;block<4;block++)
 assert.deepEqual(order.slice(block*4,block*4+4).sort(),[1,2,3,4]);
assert.equal(exported.privacy.networkSubmission,false);
assert.equal(exported.privacy.automaticPersistence,false);
assert.equal(exported.validation.externallyRecruitedParticipant,false);
assert.equal(exported.validation.measuredTransferBenefit,false);
assert.equal(exported.source.pinyinShown,false);
assert.equal(exported.source.initialsShown,false);
assert.equal(exported.source.finalsShown,false);
assert.equal(exported.source.feedbackBeforeAssessmentCompleted,false);
assert.equal(exported.protocol.prerecordedSpeakerAudioUsed,false);
assert.equal(ui["tone-blind-export-select"].disabled,false);
ui["tone-blind-export-select"].events.click();
assert.equal(ui["tone-blind-export"].selected,true);
choices[0].events.click(); // stale old response cannot record a 17th observation
assert.equal(JSON.parse(ui["tone-blind-export"].value).results.trialResponses.length,16);
ui["tone-blind-start"].events.click();
assert.equal(ui["tone-blind-export"].value,"");
assert.equal(ui["tone-blind-export-select"].disabled,true);
const fail=structuredClone(proof);fail.summary.humanToneDiscriminationTrials=1;
const invalid=setup(source,fail);await settle(invalid);
assert.match(invalid["tone-blind-status"].textContent,/Unable to validate/);
assert.equal(invalid["tone-blind-start"].disabled,true);
const altered=structuredClone(source);altered.tones[2].levels=[4,5];
const reject=setup(altered,proof);await settle(reject);
assert.match(reject["tone-blind-status"].textContent,/Unable to validate/);
for(const id of ["consent","start","prompt","answers","status","summary","export","export-select"])
 assert.ok(page.includes('id="tone-blind-'+id+'"'));
assert.ok(page.includes("mandarin-tone-blind-assessment.js"));
assert.ok(!js.includes("localStorage")&&!js.includes("sendBeacon")&&
 !js.includes("innerHTML")&&!js.includes("XMLHttpRequest")&&
 !js.includes("navigator.")&&!js.includes("Date.now"));
console.log("Blind tone-only source assessment: 16 balanced nonadjacent no-feedback trials, local anonymous score/export, zero published human outcomes.");
