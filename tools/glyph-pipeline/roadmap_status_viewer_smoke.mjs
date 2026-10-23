import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const js=fs.readFileSync("site/roadmap-status.js","utf8");
const html=fs.readFileSync("site/roadmap-status.html","utf8");
const data=JSON.parse(fs.readFileSync("data/progress/roadmap-checkpoints-v0.1.json","utf8"));
class Element{
 constructor(){this.children=[];this.textContent="";this.max=0;this.value=0;}
 replaceChildren(...c){this.children=c;}
 appendChild(c){this.children.push(c);}
}
function setup(d){
 const state=new Element(),target=new Element();
 const document={getElementById:id=>id==="roadmap-status"?state:id==="roadmap-phases"?target:null,
  createElement:()=>new Element()};
 vm.runInNewContext(js,{document,fetch:async()=>({ok:true,json:async()=>d}),Error,Math});
 return {state,target};
}
const ok=setup(data);
for(let n=0;n<30&&!ok.target.children.length;n++)await Promise.resolve();
assert.equal(ok.target.children.length,5);
assert.match(ok.state.textContent,/no scientific acceptance/);
const invalid=structuredClone(data);invalid.phases[0].complete=100;
const x=setup(invalid);
for(let n=0;n<30&&!x.state.textContent.includes("Unable");n++)await Promise.resolve();
assert.match(x.state.textContent,/Unable to validate/);
assert.equal(x.target.children.length,0);
assert.match(html,/id="roadmap-status"/);
assert.match(html,/id="roadmap-phases"/);
assert.ok(!js.includes("innerHTML"));
console.log("Roadmap status page reflects checked source, rejects inconsistent phase counts.");
