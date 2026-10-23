import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import {deriveMnemonicGroupPilot} from "./mnemonic_group_color_pilot.mjs";
import {derivePilotGroupCounterfactual} from "./pilot_group_counterfactual.mjs";
const source=JSON.parse(fs.readFileSync(
 "palettes/mandarin-component-identity-v0.6.json","utf8"));
const pilot=deriveMnemonicGroupPilot(source);
const research=derivePilotGroupCounterfactual(source);
const script=fs.readFileSync("site/mnemonic-group-counterfactual.js","utf8");
const html=fs.readFileSync("site/mnemonic-group-counterfactual.html","utf8");
class Element{
 constructor(){this.children=[];this.events={};this.attrs={};
  this.value="";this.textContent="";this.className="";
  this.style={setProperty:(n,v)=>{this.style[n]=v}};}
 appendChild(x){this.children.push(x);return x;}
 replaceChildren(...x){this.children=x;}
 addEventListener(event,fn){this.events[event]=fn;}
 setAttribute(k,v){this.attrs[k]=v;}
}
function launch(x=research,y=source,z=pilot){
 const ids=["cf-group","cf-summary","cf-status","cf-count","cf-grid"];
 const nodes=Object.fromEntries(ids.map(x=>[x,new Element()]));
 const context={
  document:{getElementById:x=>nodes[x],createElement:()=>new Element()},
  fetch:async path=>({ok:true,json:async()=>
   path.startsWith("palettes/")?y:
   path.startsWith("semantic-group-")?z:x}),
  Set,Map,Object,Array,Number,Math,Error,JSON
 };
 vm.runInNewContext(script,context);return nodes;
}
async function settle(ui){
 for(let i=0;i<80&&!ui["cf-grid"].children.length&&
 !ui["cf-status"].textContent.includes("Unable");i++)
  await Promise.resolve();
}
const ui=launch();await settle(ui);
assert.equal(ui["cf-grid"].children.length,8);
assert.equal(ui["cf-group"].children.length,9);
assert.match(ui["cf-summary"].textContent,/hypothetical palette within-group/);
assert.match(ui["cf-summary"].textContent,/identity-discrimination risk/);
assert.match(ui["cf-status"].textContent,/Original source hex assignments unchanged/);
assert.equal(ui["cf-grid"].children[0].children[2].children.length,8);
const entry=ui["cf-grid"].children[0].children[2].children[0];
assert.equal(entry.children[1].children.length,2);
const original=entry.children[1].children[0].children[0].style["--cf-swatch"],
 alternative=entry.children[1].children[1].children[0].style["--cf-swatch"];
assert.equal(original,research.groups[0].members[0].sourceHex);
assert.equal(alternative,research.groups[0].members[0].candidateHex);
assert.notEqual(original,alternative);
ui["cf-group"].value="water-fluid";
ui["cf-group"].events.change();
assert.equal(ui["cf-grid"].children.length,1);
assert.equal(ui["cf-grid"].children[0].children[2].children.length,4);
assert.match(ui["cf-count"].textContent,/4 source component identities compared/);
ui["cf-group"].value="all";ui["cf-group"].events.change();
assert.equal(ui["cf-grid"].children.length,8);
const reject=[
 (a,b,c)=>{a.provenance.activeGlyphsRecolored=true;},
 (a,b,c)=>{a.summary.approvedSemanticFamilies=1;},
 (a,b,c)=>{a.summary.validatedIdentityDiscriminability=1;},
 (a,b,c)=>{a.groups[0].members[0].visuallyVerified=true;},
 (a,b,c)=>{a.groups[0].members[0].candidateHex="#GFFFFF";},
 (a,b,c)=>{a.groups[0].members[0].sourceHex="#000000";},
 (a,b,c)=>{a.groups[0].historicalHint="unsupported";},
 (a,b,c)=>{a.groups[0].members.pop();},
 (a,b,c)=>{b.components[0].color="#ABCDEF";},
 (a,b,c)=>{c.groups[0].mnemonicHint="fake";},
 (a,b,c)=>{a.summary.smallestWithinDeltaOk=0.09;}
];
for(const f of reject){
 const a=structuredClone(research),b=structuredClone(source),c=structuredClone(pilot);
 f(a,b,c);
 const blocked=launch(a,b,c);await settle(blocked);
 assert.equal(blocked["cf-grid"].children.length,0);
 assert.match(blocked["cf-status"].textContent,/Unable to validate/);
}
for(const id of ["cf-group","cf-summary","cf-status","cf-count","cf-grid"])
 assert.match(html,new RegExp('id="'+id+'"'));
assert.ok(!script.includes("innerHTML"));
console.log("40 nonproduction group swatches, original-vs-hypothetical comparisons and 11 fail-closed cases verified.");
