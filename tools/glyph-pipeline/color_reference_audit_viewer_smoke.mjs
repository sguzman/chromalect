import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import {deriveReferenceContrastAudit} from "./component_palette_background_contrast.mjs";
const source=JSON.parse(fs.readFileSync("palettes/mandarin-component-identity-v0.6.json","utf8"));
const report=deriveReferenceContrastAudit(source);
const arithmetic=fs.readFileSync("site/reference-contrast.js","utf8");
const script=fs.readFileSync("site/color-reference-audit.js","utf8");
const html=fs.readFileSync("site/color-reference-audit.html","utf8");
class Element{
 constructor(){this.children=[];this.value="";this.textContent="";
  this.className="";this.attrs={};this.events={};this.disabled=false;
  this.style={setProperty:(k,v)=>{this.style[k]=v}};}
 appendChild(child){this.children.push(child);return child;}
 replaceChildren(...x){this.children=x;}
 addEventListener(event,callback){this.events[event]=callback;}
 setAttribute(key,value){this.attrs[key]=value;}
}
function start(d=report,p=source){
 const ids=["rc-filter","rc-sort","rc-query","rc-count","rc-summary","rc-status",
  "rc-list","rc-prev","rc-next"];
 const nodes=Object.fromEntries(ids.map(id=>[id,new Element()]));
 nodes["rc-filter"].value="all";nodes["rc-sort"].value="id";
 const ctx={
  document:{getElementById:id=>nodes[id],createElement:()=>new Element()},
  fetch:async file=>({ok:true,json:async()=>file.startsWith("palettes/")?p:d}),
  Map,Set,Math,Number,Object,Array,Error,JSON
 };
 ctx.globalThis=ctx;
 vm.runInNewContext(arithmetic,ctx);vm.runInNewContext(script,ctx);
 return nodes;
}
async function settle(ui){
 for(let i=0;i<50&&!ui["rc-list"].children.length&&
 !ui["rc-status"].textContent.includes("Unable");i++)await Promise.resolve();
}
const ui=start();await settle(ui);
assert.equal(ui["rc-list"].children.length,60);
assert.match(ui["rc-summary"].textContent,/49 below 3:1 on white/);
assert.match(ui["rc-summary"].textContent,/69 below 3:1 on black/);
assert.match(ui["rc-count"].textContent,/520 matching/);
assert.equal(ui["rc-list"].children[0].children[1].children.length,2);
assert.equal(ui["rc-list"].children[0].children[1].children[0].className,"rc-sample rc-on-white");
assert.equal(ui["rc-list"].children[0].children[1].children[1].className,"rc-sample rc-on-black");
assert.equal(ui["rc-list"].children[0].children[1].children[0].children[0].style["--rc-color"],
 source.components[0].color);
assert.match(ui["rc-list"].children[0].children[2].textContent,/White [0-9.]+:1 · Black [0-9.]+:1/);
assert.equal(ui["rc-prev"].disabled,true);
assert.equal(ui["rc-next"].disabled,false);
ui["rc-next"].events.click();
assert.match(ui["rc-count"].textContent,/showing 61–120/);
ui["rc-prev"].events.click();
assert.match(ui["rc-count"].textContent,/showing 1–60/);
ui["rc-filter"].value="white3";ui["rc-filter"].events.change();
assert.equal(ui["rc-list"].children.length,49);
assert.match(ui["rc-count"].textContent,/49 matching/);
ui["rc-filter"].value="black3";ui["rc-filter"].events.change();
assert.equal(ui["rc-list"].children.length,60);
assert.match(ui["rc-count"].textContent,/69 matching/);
ui["rc-next"].events.click();
assert.equal(ui["rc-list"].children.length,9);
ui["rc-filter"].value="all";ui["rc-filter"].events.change();
ui["rc-sort"].value="white";ui["rc-sort"].events.change();
assert.match(ui["rc-list"].children[0].children[0].textContent,/cmp-0519/);
ui["rc-sort"].value="black";ui["rc-sort"].events.change();
assert.match(ui["rc-list"].children[0].children[0].textContent,/cmp-0081/);
ui["rc-query"].value="#AF56FD";ui["rc-query"].events.input();
assert.equal(ui["rc-list"].children.length,1);
assert.match(ui["rc-list"].children[0].children[0].textContent,/cmp-0001/);
const changes=[
 (d,p)=>{d.summary.accessibilityCertifications=1;},
 (d,p)=>{d.summary.whiteBelow3=48;},
 (d,p)=>{d.source.sourcePaletteMutated=true;},
 (d,p)=>{d.records[0].sourceColor="#FFFFFF";},
 (d,p)=>{d.records[0].whiteRatio=1;},
 (d,p)=>{d.records[0].accessibleGlyphCertified=true;},
 (d,p)=>{p.components[0].color="#123456";},
 (d,p)=>{d.records.pop();},
 (d,p)=>{d.records[0].whiteBelow3=true;}
];
for(const modify of changes){
 const d=structuredClone(report),p=structuredClone(source);modify(d,p);
 const bad=start(d,p);await settle(bad);
 assert.equal(bad["rc-list"].children.length,0);
 assert.match(bad["rc-status"].textContent,/Unable to verify/);
}
for(const id of ["rc-filter","rc-sort","rc-query","rc-count","rc-summary","rc-status",
 "rc-list","rc-prev","rc-next"])
 assert.match(html,new RegExp('id="'+id+'"'));
assert.ok(!script.includes("innerHTML"));
console.log("520 immutable color comparisons, 49 white and 69 black under-3 cohorts, pagination, sort and nine provenance failures verified.");
