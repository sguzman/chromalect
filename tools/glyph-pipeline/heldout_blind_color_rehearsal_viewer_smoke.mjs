import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const manifest=read("site/glyphs/research/heldout-warning-v0.1/index-v0.1.json");
const folds=read("site/semantic-group-hue-fivefold-heldout-v0.1.json");
const palette=read("palettes/mandarin-component-identity-v0.6.json");
const coreScript=fs.readFileSync("site/heldout-blind-color-core.js","utf8");
const viewScript=fs.readFileSync("site/heldout-blind-color-rehearsal.js","utf8");
const html=fs.readFileSync("site/heldout-blind-color-rehearsal.html","utf8");
class Element{
 constructor(){
  this.events={};this.children=[];this.attrs={};this.value="";
  this.hidden=false;this.disabled=false;this.textContent="";
  this.style={setProperty:(key,value)=>{this.style[key]=value}};
 }
 appendChild(e){this.children.push(e);return e;}
 replaceChildren(...values){this.children=values;}
 addEventListener(name,fn){this.events[name]=fn;}
 setAttribute(name,value){this.attrs[name]=value;}
}
let requests=[];
function start(m=manifest,f=folds,p=palette){
 const ids=["br-status","br-intro","br-size","br-surface","br-appearance",
  "br-start","br-trial","br-progress","br-left","br-right","br-question",
  "br-respond","br-next","br-export","br-output","br-key","br-finish"];
 const ui=Object.fromEntries(ids.map(id=>[id,new Element()]));
 ui["br-size"].value="48";ui["br-surface"].value="white";
 ui["br-appearance"].value="color";ui["br-start"].disabled=true;
 ui["br-trial"].hidden=true;ui["br-finish"].hidden=true;
 const ctx={
  document:{getElementById:id=>ui[id],createElement:()=>new Element()},
  fetch:async url=>{requests.push(url);return{ok:true,json:async()=>
   url.startsWith("glyphs/")?m:
   url.startsWith("semantic-group")?f:p}},
  crypto:{getRandomValues:bits=>{bits[0]=20261023;return bits}},
  Uint32Array,Date,JSON,Math,Object,Array,Map,Set,Number,Error
 };
 ctx.globalThis=ctx;
 vm.runInNewContext(coreScript,ctx);
 vm.runInNewContext(viewScript,ctx);
 return {ui,ctx};
}
async function settle(ui){
 for(let i=0;i<60&&ui["br-start"].disabled&&
 !ui["br-status"].textContent.includes("Unable");i++)await Promise.resolve();
}
requests=[];
const {ui,ctx}=start();await settle(ui);
assert.equal(ui["br-start"].disabled,false,ui["br-status"].textContent);
assert.match(ui["br-intro"].textContent,/49 source-linked comparison tasks/);
assert.equal(requests.length,3);
ui["br-start"].events.click();
assert.equal(ui["br-start"].disabled,true);
assert.equal(ui["br-size"].disabled,true);
assert.equal(ui["br-surface"].disabled,true);
assert.equal(ui["br-appearance"].disabled,true);
assert.equal(ui["br-trial"].hidden,false);
assert.equal(ui["br-left"].children.length,1);
assert.equal(ui["br-right"].children.length,1);
assert.match(ui["br-left"].children[0].alt,/stimulus/);
assert.ok(!ui["br-left"].children[0].alt.includes("original"));
assert.ok(!ui["br-right"].children[0].alt.includes("experimental"));
assert.equal(ui["br-left"].children[0].width,48);
assert.equal(ui["br-right"].children[0].width,48);
assert.equal(ui["br-left"].style["--br-background"],"#fff");
assert.equal(ui["br-right"].style["--br-background"],"#fff");
assert.equal(ui["br-respond"].children.length,4);
assert.equal(ui["br-next"].disabled,true);
for(let i=0;i<49;i++){
 const button=ui["br-respond"].children[3];
 assert.equal(button.textContent,"Cannot judge / abstain");
 button.events.click();
 assert.equal(button.attrs["aria-pressed"],"true");
 assert.equal(ui["br-next"].disabled,false);
 ui["br-next"].events.click();
 if(i<48){
  assert.equal(ui["br-trial"].hidden,false);
  assert.equal(ui["br-next"].disabled,true);
  assert.match(ui["br-progress"].textContent,new RegExp(
   "Rehearsal trial "+(i+2)+" / 49"));
 }
}
assert.equal(ui["br-trial"].hidden,true);
assert.equal(ui["br-finish"].hidden,false);
assert.match(ui["br-progress"].textContent,/Completed 49 \/ 49/);
assert.match(ui["br-status"].textContent,/no.*saved or sent/);
ui["br-export"].events.click();
const report=JSON.parse(ui["br-output"].value);
assert.equal(report.session.recorded,49);
assert.equal(report.session.randomSeed,20261023);
assert.equal(report.session.balancedOriginalLeft,25);
assert.equal(report.session.balancedExperimentalLeft,24);
assert.equal(report.session.automaticallyUploaded,false);
assert.equal(report.session.ethicsProtocolApproved,false);
assert.equal(report.source.independentlyCertifiedGlyphs,0);
assert.ok(report.observations.every(o=>o.response==="cannot_judge"));
assert.equal(ctx.ChromalectBlindColorRehearsal.validateSession(
 report,ctx.ChromalectBlindColorRehearsal.validateSource(
 manifest,folds,palette)).productionVisualCertifications,0);
assert.equal(requests.length,3,"No secondary or submission request is allowed");
const broken=structuredClone(manifest);
broken.provenance.humanVisualAssessments=1;
const refused=start(broken,folds,palette);
await settle(refused.ui);
assert.equal(refused.ui["br-start"].disabled,true);
assert.match(refused.ui["br-status"].textContent,/Unable to verify/);
for(const id of ["br-status","br-intro","br-size","br-surface","br-appearance",
 "br-start","br-trial","br-progress","br-left","br-right","br-question",
 "br-respond","br-next","br-export","br-output","br-key","br-finish"])
 assert.match(html,new RegExp('id="'+id+'"'));
assert.ok(!viewScript.includes("innerHTML"));
assert.ok(!viewScript.includes("localStorage"));
assert.ok(!viewScript.includes("sessionStorage"));
assert.ok(!viewScript.includes("sendBeacon"));
console.log("49 balanced label-masked color preferences, fixed settings, local-only export, no automatic upload and fail-closed approval.");
