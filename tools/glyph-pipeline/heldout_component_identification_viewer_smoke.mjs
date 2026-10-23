import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const load=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const targets=load("site/glyphs/research/heldout-identification-target-v0.1/index-v0.1.json");
const warnings=load("site/glyphs/research/heldout-warning-v0.1/index-v0.1.json");
const folds=load("site/semantic-group-hue-fivefold-heldout-v0.1.json");
const palette=load("palettes/mandarin-component-identity-v0.6.json");
const scripts=[
 fs.readFileSync("site/heldout-blind-color-core.js","utf8"),
 fs.readFileSync("site/heldout-component-identification-core.js","utf8"),
 fs.readFileSync("site/heldout-component-identification.js","utf8")
];
const html=fs.readFileSync("site/heldout-component-identification.html","utf8");
class MockNode{
 constructor(){
  this.value="";this.disabled=false;this.hidden=true;
  this.children=[];this.attrs={};this.events={};this.textContent="";
  this.style={setProperty:(k,v)=>{this.style[k]=v}};
 }
 appendChild(v){this.children.push(v);return v;}
 replaceChildren(...nodes){this.children=nodes;}
 setAttribute(k,v){this.attrs[k]=v;}
 addEventListener(k,fn){this.events[k]=fn;}
}
function boot(source=targets){
 const names=["ci-status","ci-intro","ci-size","ci-surface","ci-appearance",
  "ci-start","ci-running","ci-complete","ci-progress","ci-image","ci-locator",
  "ci-question","ci-choices","ci-next","ci-summary","ci-export","ci-output"];
 const ui=Object.fromEntries(names.map(x=>[x,new MockNode()]));
 ui["ci-size"].value="48";ui["ci-surface"].value="white";
 ui["ci-appearance"].value="color";ui["ci-start"].disabled=true;
 const requests=[];
 const context={
  document:{getElementById:id=>ui[id],createElement:()=>new MockNode()},
  fetch:async name=>{
   requests.push(name);
   const obj=name.includes("identification-target")?source:
    name.includes("heldout-warning")?warnings:
    name.includes("fivefold-heldout")?folds:palette;
   return{ok:true,json:async()=>obj};
  },
  crypto:{getRandomValues:x=>{x[0]=20261023;return x}},
  Uint32Array,Date,JSON,Math,Map,Set,Array,Object,Number,Error
 };
 context.globalThis=context;
 for(const script of scripts)vm.runInNewContext(script,context);
 return{ui,requests,context};
}
async function settle(ui){
 for(let i=0;i<100&&ui["ci-start"].disabled&&
  !ui["ci-status"].textContent.includes("Unable");i++)await Promise.resolve();
}
const {ui,requests,context}=boot();
await settle(ui);
assert.equal(ui["ci-start"].disabled,false,ui["ci-status"].textContent);
assert.match(ui["ci-intro"].textContent,/49 machine-keyed source-component questions/);
assert.equal(requests.length,4);
ui["ci-start"].events.click();
assert.equal(ui["ci-running"].hidden,false);
assert.equal(ui["ci-size"].disabled,true);
assert.equal(ui["ci-image"].children.length,1);
assert.equal(ui["ci-locator"].children.length,1);
assert.match(ui["ci-image"].children[0].alt,/condition masked/);
assert.equal(ui["ci-image"].children[0].width,48);
assert.ok(ui["ci-locator"].children[0].src.startsWith(
 "glyphs/research/heldout-identification-target-v0.1/"));
assert.equal(ui["ci-image"].style["--ci-surface"],"#fff");
assert.equal(ui["ci-locator"].style["--ci-surface"],"#fff");
assert.equal(ui["ci-choices"].children.length,3);
assert.equal(ui["ci-next"].disabled,true);
for(let i=0;i<49;i++){
 const option=ui["ci-choices"].children[2];
 assert.equal(option.textContent,"Cannot judge / abstain");
 option.events.click();
 assert.equal(option.attrs["aria-pressed"],"true");
 assert.equal(ui["ci-next"].disabled,false);
 ui["ci-next"].events.click();
 if(i<48){
  assert.equal(ui["ci-running"].hidden,false);
  assert.equal(ui["ci-next"].disabled,true);
  assert.match(ui["ci-progress"].textContent,
   new RegExp("rehearsal "+(i+2)+" / 49"));
 }
}
assert.equal(ui["ci-running"].hidden,true);
assert.equal(ui["ci-complete"].hidden,false);
assert.match(ui["ci-summary"].textContent,/0 \/ 0 attempts; 49 abstentions/);
assert.match(ui["ci-summary"].textContent,/Independently validated: 0/);
ui["ci-export"].events.click();
const report=JSON.parse(ui["ci-output"].value);
assert.equal(report.session.recorded,49);
assert.equal(report.summary.abstained,49);
assert.equal(report.summary.answered,0);
assert.equal(report.session.balancedOriginalTreatments,25);
assert.equal(report.session.balancedExperimentalTreatments,24);
assert.equal(report.session.balancedCorrectLeft,25);
assert.equal(report.session.automaticallyUploaded,false);
assert.equal(report.source.independentlyApprovedTargetOwners,0);
const core=context.ChromalectComponentIdentificationRehearsal;
const pairCore=context.ChromalectBlindColorRehearsal;
assert.equal(core.validateSession(report,
 core.validateSource(targets,pairCore.validateSource(warnings,folds,palette))
).independentlyValidated,0);
assert.equal(requests.length,4,"No trial response requests may be sent");
const corrupted=structuredClone(targets);
corrupted.targets[0].sourceOwnershipIndependentlyCertified=true;
const rejected=boot(corrupted);await settle(rejected.ui);
assert.equal(rejected.ui["ci-start"].disabled,true);
assert.match(rejected.ui["ci-status"].textContent,/Unable to verify/);
for(const id of ["ci-status","ci-intro","ci-size","ci-surface","ci-appearance",
 "ci-start","ci-running","ci-complete","ci-progress","ci-image","ci-locator",
 "ci-question","ci-choices","ci-next","ci-summary","ci-export","ci-output"])
 assert.match(html,new RegExp('id="'+id+'"'));
assert.ok(!scripts[2].includes("innerHTML"));
assert.ok(!scripts[2].includes("localStorage"));
assert.ok(!scripts[2].includes("sessionStorage"));
assert.ok(!scripts[2].includes("sendBeacon"));
console.log("49 machine-keyed source-component prompts, 25/24 balanced color conditions, 49 abstentions, no uploads or unearned approvals.");
