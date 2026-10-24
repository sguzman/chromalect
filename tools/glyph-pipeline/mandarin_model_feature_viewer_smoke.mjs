import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import {audit,createFeatureVisualGrammar} from "./zhao_li_visual_feature_grammar.mjs";
const load=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const model=load("data/phonetics/zhao-li-2009-34-unit-reference-model-v0.1.json");
const palette=load("site/layers-v0.1.json");
const evidence=load("data/phonetics/zhao-li-visual-feature-grammar-audit-v0.1.json");
const html=fs.readFileSync("site/mandarin-model-feature-viewer.html","utf8");
const js=fs.readFileSync("site/mandarin-model-feature-viewer.js","utf8");
const grammar=createFeatureVisualGrammar(model,palette);
assert.deepEqual(audit(model,palette),evidence);
assert.equal(grammar.sourceUnitCount,34);
class Node {
 constructor(tag){this.tag=tag;this.children=[];this.attrs={};
  this.textContent="";this.value="";this.events={};this.className="";}
 appendChild(node){this.children.push(node);return node;}
 replaceChildren(...nodes){this.children=nodes;}
 setAttribute(k,v){this.attrs[k]=String(v);}
 addEventListener(k,f){this.events[k]=f;}
}
function setup(inputs=[model,palette,evidence]){
 const ids=["model-onset","model-v1","model-v2","model-v3","model-coda",
  "model-tone","model-status","model-graphics","model-decoded","model-inventory"];
 const elements=Object.fromEntries(ids.map(id=>[id,new Node("div")]));
 const urls=["phonetics/zhao-li-2009-34-unit-reference-model-v0.1.json",
  "layers-v0.1.json",
  "phonetics/zhao-li-visual-feature-grammar-audit-v0.1.json"];
 const context={
  document:{getElementById:id=>elements[id],
   createElement:tag=>new Node(tag),createElementNS:(_,tag)=>new Node(tag)},
  fetch:async uri=>{
   const i=urls.indexOf(uri);assert.ok(i>=0,uri);
   return {ok:true,json:async()=>inputs[i]};
  },Object,Set,Map,Array,JSON,Error,Number,String};
 vm.runInNewContext(js,context);
 return elements;
}
async function settle(elements){
 for(let i=0;i<90&&!elements["model-status"].textContent;i++)await Promise.resolve();
}
const nodes=setup();await settle(nodes);
assert.equal(nodes["model-inventory"].children.length,34,"One source glyph per model unit");
assert.equal(nodes["model-onset"].children.length,22,"21 consonantal onset models plus no onset");
assert.equal(nodes["model-v1"].children.length,12);
assert.equal(nodes["model-v2"].children.length,13);
assert.equal(nodes["model-v3"].children.length,13);
assert.equal(nodes["model-coda"].children.length,3);
assert.equal(nodes["model-tone"].children.length,5);
assert.match(nodes["model-status"].textContent,/round-trip succeeded/);
assert.equal(nodes["model-graphics"].children[0].tag,"svg");
assert.equal(nodes["model-graphics"].children[0].children.length,6);
assert.match(nodes["model-decoded"].children[0].textContent,/p · a · ∅ · T1/);
nodes["model-onset"].value="P";
nodes["model-v1"].value="i";
nodes["model-v2"].value="o";
nodes["model-v3"].value="u";
nodes["model-coda"].value="N";
nodes["model-tone"].value="4";
nodes["model-onset"].events.change();
assert.match(nodes["model-decoded"].children[0].textContent,/P · i · o · u · N · T4/);
assert.equal(nodes["model-graphics"].children[0].children.length,6);
const deep=grammar.encode({onset:"P",vowels:["i","o","u"],coda:"N",tone:4});
assert.deepEqual(grammar.decode(deep),{onset:"P",vowels:["i","o","u"],coda:"N",tone:4});
assert.ok(!JSON.stringify(deep).includes('"P"'),"Feature wire cannot carry source token");
nodes["model-v2"].value="";
nodes["model-v2"].events.change();
assert.match(nodes["model-status"].textContent,/must be contiguous/);
assert.equal(nodes["model-graphics"].children.length,0);
nodes["model-v3"].value="";
nodes["model-v3"].events.change();
assert.match(nodes["model-status"].textContent,/round-trip succeeded/);
const bad=structuredClone(model);bad.summary.acceptedProjectPhonemeContrasts=1;
const denied=setup([bad,palette,evidence]);await settle(denied);
assert.match(denied["model-status"].textContent,/Unable to validate/);
assert.equal(denied["model-inventory"].children.length,0);
const collision=structuredClone(model);
collision.phonologicalUnits[1].articulatoryPlace=collision.phonologicalUnits[0].articulatoryPlace;
collision.phonologicalUnits[1].articulatoryHeight=collision.phonologicalUnits[0].articulatoryHeight;
collision.phonologicalUnits[1].rounding=collision.phonologicalUnits[0].rounding;
const rejected=setup([collision,palette,evidence]);await settle(rejected);
assert.match(rejected["model-status"].textContent,/Unable to validate/);
for(const id of ["onset","v1","v2","v3","coda","tone","status","graphics","decoded","inventory"])
 assert.ok(html.includes('id="model-'+id+'"'));
assert.ok(!js.includes("innerHTML")&&!js.includes("localStorage")&&!js.includes("sendBeacon"));
console.log("34 source-model symbols drawn, six CVVVCT positions reconstructed from features; no invented IPA approvals.");
