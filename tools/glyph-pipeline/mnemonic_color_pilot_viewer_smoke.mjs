import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import {deriveMnemonicGroupPilot} from "./mnemonic_group_color_pilot.mjs";
const palette=JSON.parse(fs.readFileSync(
 "palettes/mandarin-component-identity-v0.6.json","utf8"));
const study=deriveMnemonicGroupPilot(palette);
const script=fs.readFileSync("site/mnemonic-color-pilot.js","utf8");
const html=fs.readFileSync("site/mnemonic-color-pilot.html","utf8");
class Element{
 constructor(){this.children=[];this.value="";this.textContent="";
  this.className="";this.attrs={};this.events={};
  this.style={setProperty:(k,v)=>{this.style[k]=v}};}
 appendChild(x){this.children.push(x);return x;}
 replaceChildren(...x){this.children=x;}
 addEventListener(event,fn){this.events[event]=fn;}
 setAttribute(k,v){this.attrs[k]=v;}
}
function setup(d=study,p=palette){
 const ids=["mg-filter","mg-status","mg-summary","mg-count","mg-list"];
 const nodes=Object.fromEntries(ids.map(id=>[id,new Element()]));
 const ctx={
  document:{getElementById:id=>nodes[id],createElement:()=>new Element()},
  fetch:async url=>({ok:true,json:async()=>url.startsWith("palettes/")?p:d}),
  Map,Set,Math,Number,Object,Array,Error,JSON
 };
 vm.runInNewContext(script,ctx);return nodes;
}
async function settle(ui){
 for(let i=0;i<50&&!ui["mg-list"].children.length&&
 !ui["mg-status"].textContent.includes("Unable");i++)await Promise.resolve();
}
const ui=setup();await settle(ui);
assert.equal(ui["mg-list"].children.length,8);
assert.equal(ui["mg-filter"].children.length,9);
assert.match(ui["mg-summary"].textContent,/40 source-pinned/);
assert.match(ui["mg-summary"].textContent,/88 same-hint pairs/);
assert.match(ui["mg-summary"].textContent,/692 different-hint pairs/);
assert.match(ui["mg-summary"].textContent,/No proposed semantic grouping is verified/);
assert.match(ui["mg-list"].children[0].children[0].textContent,/human body/);
assert.equal(ui["mg-list"].children[0].children[2].children.length,8);
assert.equal(ui["mg-list"].children[0].children[3].children.length,29);
assert.equal(ui["mg-list"].children[0].children[2].children[0].children[0].style["--group-color"],
 palette.components.find(c=>c.id===study.groups[0].componentColors[0].id).color);
assert.match(ui["mg-list"].children[0].children[3].children[1].children[2].textContent,/ΔOK/);
ui["mg-filter"].value="water-fluid";ui["mg-filter"].events.change();
assert.equal(ui["mg-list"].children.length,1);
assert.match(ui["mg-list"].children[0].children[0].textContent,/water fluid/);
assert.equal(ui["mg-list"].children[0].children[2].children.length,4);
assert.match(ui["mg-count"].textContent,/4 component identities displayed/);
ui["mg-filter"].value="all";ui["mg-filter"].events.change();
assert.equal(ui["mg-list"].children.length,8);
for(const edit of [
 (d,p)=>{d.status="approved_semantic_groups";},
 (d,p)=>{d.summary.independentlyApprovedSemanticFamilies=1;},
 (d,p)=>{d.summary.betweenHintPairs=700;},
 (d,p)=>{d.provenance.paletteRecolored=true;},
 (d,p)=>{d.groups[0].semanticFamilyColorSchemeApproved=true;},
 (d,p)=>{d.groups[0].componentColors[0].hex="#000000";},
 (d,p)=>{d.groups[0].withinPairs[0].deltaOk=2;},
 (d,p)=>{p.components[0].mnemonic_group_hint="moved";},
 (d,p)=>{d.groups.pop();}
]){
 const d=structuredClone(study),p=structuredClone(palette);edit(d,p);
 const refused=setup(d,p);await settle(refused);
 assert.equal(refused["mg-list"].children.length,0);
 assert.match(refused["mg-status"].textContent,/Unable to validate/);
}
for(const id of ["mg-filter","mg-status","mg-summary","mg-count","mg-list"])
 assert.match(html,new RegExp('id="'+id+'"'));
assert.ok(!script.includes("innerHTML"));
console.log("Eight source-only mnemonic groups, 40 immutable colors, 88 detailed pairs and nine nonapproval checks.");
