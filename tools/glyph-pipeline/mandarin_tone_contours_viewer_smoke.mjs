import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const js=fs.readFileSync("site/mandarin-tone-contours.js","utf8");
const html=fs.readFileSync("site/mandarin-tone-contours.html","utf8");
const tones=JSON.parse(fs.readFileSync("data/phonetics/mandarin-citation-tone-contours-v0.1.json","utf8"));
const palette=JSON.parse(fs.readFileSync("site/layers-v0.1.json","utf8"));
const isolation=JSON.parse(fs.readFileSync("data/phonetics/citation-tone-isolation-audit-v0.1.json","utf8"));
class Element{
 constructor(){this.children=[];this.textContent="";this.value="";this.events={};this.attributes={};this.style={};}
 replaceChildren(...xs){this.children=xs;}
 appendChild(c){this.children.push(c);}
 addEventListener(k,cb){this.events[k]=cb;}
 setAttribute(k,v){this.attributes[k]=v;}
}
function setup(ref=tones,check=isolation){
 const els={ "tone-mode":new Element(),"tone-results":new Element(),"tone-status":new Element()};
 els["tone-mode"].value="contour";
 const document={getElementById:id=>els[id],createElement:()=>new Element(),createElementNS:()=>new Element()};
 vm.runInNewContext(js,{document,fetch:async url=>({ok:true,json:async()=>url.includes("citation-tone-isolation-audit")?check:url.startsWith("phonetics/")?ref:palette}),Object,Number,Array,Error});
 return els;
}
async function settle(x){for(let i=0;i<30&&!x["tone-results"].children.length&&!x["tone-status"].textContent.includes("Unable");i++)await Promise.resolve();}
const state=setup();await settle(state);
assert.equal(state["tone-results"].children.length,5);
assert.match(state["tone-status"].textContent,/1,171 pinned readings/);
assert.match(state["tone-results"].children[0].children[0].textContent,/10 listed source readings/);
assert.match(state["tone-results"].children[3].children[0].textContent,/223 listed source readings/);
assert.match(state["tone-results"].children[0].children[0].textContent,/卜 bo/);
assert.match(state["tone-results"].children[3].children[0].textContent,/乙 yǐ/);
assert.equal(state["tone-results"].children[0].children[1].children[0].textContent,"No fixed neutral contour");
assert.match(state["tone-results"].children[3].children[1].children[0].attributes["aria-label"],/2–1–4/);
assert.equal(state["tone-results"].children[3].children[1].children[0].children[0].attributes.points.split(" ").length,3);
state["tone-mode"].value="symbol";state["tone-mode"].events.change();
assert.equal(state["tone-results"].children[3].children[1].children[0].textContent,"⌄");
state["tone-mode"].value="color";state["tone-mode"].events.change();
assert.equal(state["tone-results"].children[3].children[1].children[0].style.backgroundColor,palette.palette_domains.tone.tokens["3"]);
state["tone-mode"].value="plain";state["tone-mode"].events.change();
assert.equal(state["tone-results"].children[3].children[1].children[0].textContent,"T3");
const changedAudit=structuredClone(isolation);changedAudit.summary.humanToneDiscriminationTrials=1;
const noApproval=setup(tones,changedAudit);await settle(noApproval);
assert.equal(noApproval["tone-results"].children.length,0);
assert.match(noApproval["tone-status"].textContent,/Unable to validate/);
const invalid=structuredClone(tones);invalid.tones[0].levels=[1,1];
const bad=setup(invalid);await settle(bad);
assert.match(bad["tone-status"].textContent,/Unable to validate/);
assert.equal(bad["tone-results"].children.length,0);
assert.match(html,/id="tone-results"/);
assert.ok(!js.includes("innerHTML"));
console.log("Tone encoding viewer: four separate presentation choices, neutral undefined.");
