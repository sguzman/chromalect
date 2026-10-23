import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const json=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const optimized=json("site/mnemonic-group-risk-optimized-v0.2.json");
const grouped=json("site/mnemonic-group-counterfactual-v0.1.json");
const palette=json("palettes/mandarin-component-identity-v0.6.json");
const script=fs.readFileSync("site/mnemonic-group-optimized.js","utf8");
const html=fs.readFileSync("site/mnemonic-group-optimized.html","utf8");
class Element{
 constructor(){this.children=[];this.events={};this.attrs={};
  this.value="";this.textContent="";this.className="";
  this.style={setProperty:(k,v)=>{this.style[k]=v}};}
 appendChild(x){this.children.push(x);return x;}
 replaceChildren(...xs){this.children=xs;}
 addEventListener(k,fn){this.events[k]=fn;}
 setAttribute(k,v){this.attrs[k]=v;}
}
function start(a=optimized,b=grouped,c=palette){
 const ids=["opt-status","opt-count","opt-summary","opt-group","opt-swatches"];
 const nodes=Object.fromEntries(ids.map(id=>[id,new Element()]));
 const ctx={
  document:{getElementById:id=>nodes[id],createElement:()=>new Element()},
  fetch:async path=>({ok:true,json:async()=>path.includes("risk-optimized")?a:
   path.includes("counterfactual")?b:c}),
  Map,Set,Array,Object,Number,Math,Error,JSON
 };
 vm.runInNewContext(script,ctx);
 return nodes;
}
async function wait(ui){
 for(let i=0;i<60&&!ui["opt-swatches"].children.length&&
 !ui["opt-status"].textContent.includes("Unable");i++)await Promise.resolve();
}
const ui=start();await wait(ui);
assert.equal(ui["opt-swatches"].children.length,8,ui["opt-status"].textContent);
assert.equal(ui["opt-group"].children.length,9);
assert.match(ui["opt-count"].textContent,/40 experimental component identities/);
assert.match(ui["opt-summary"].textContent,/first grouping and/);
const first=ui["opt-swatches"].children[0].children[2].children[0];
assert.equal(first.children[1].children.length,3);
const identity=first.children[1].children[0].children[0].style["--opt-color"];
const proposal=first.children[1].children[1].children[0].style["--opt-color"];
const optimizedColor=first.children[1].children[2].children[0].style["--opt-color"];
const source=palette.components.find(c=>c.id===optimized.groups[0].members[0].componentId);
assert.equal(identity,source.color);
assert.equal(proposal,optimized.groups[0].members[0].firstTrialHex);
assert.equal(optimizedColor,optimized.groups[0].members[0].optimizedTrialHex);
ui["opt-group"].value="water-fluid";ui["opt-group"].events.change();
assert.equal(ui["opt-swatches"].children.length,1);
assert.equal(ui["opt-swatches"].children[0].children[2].children.length,4);
ui["opt-group"].value="all";ui["opt-group"].events.change();
assert.equal(ui["opt-swatches"].children.length,8);
for(const modify of [
 (a,b,c)=>{a.provenance.activeSourcePaletteMutated=true;},
 (a,b,c)=>{a.provenance.heldOutGlyphsEvaluated=1;},
 (a,b,c)=>{a.summary.optimizedWarningsInAffectedEdges=
   a.summary.firstTrialWarningsInAffectedEdges+1;},
 (a,b,c)=>{a.summary.approvedLexicalOrSemanticFamilies=1;},
 (a,b,c)=>{a.groups[0].historicalHint="fabricated";},
 (a,b,c)=>{a.groups[0].members[0].optimizedTrialHex="#invalid";},
 (a,b,c)=>{a.groups[0].members[0].sourceHex="#FFFFFF";},
 (a,b,c)=>{a.groups[0].members[0].semanticallyVerified=true;},
 (a,b,c)=>{b.groups[0].members[0].candidateHex="#000000";},
 (a,b,c)=>{c.components[0].color="#000000";}
]){
 const a=structuredClone(optimized),b=structuredClone(grouped),
  c=structuredClone(palette);modify(a,b,c);
 const refusal=start(a,b,c);await wait(refusal);
 assert.equal(refusal["opt-swatches"].children.length,0);
 assert.match(refusal["opt-status"].textContent,/Unable to validate/);
}
for(const id of ["opt-status","opt-count","opt-summary","opt-group","opt-swatches"])
 assert.match(html,new RegExp('id="'+id+'"'));
assert.ok(!script.includes("innerHTML"));
console.log("40 original source identities, two independent hypothesis swatches, filters and 10 approval/source failures verified.");
