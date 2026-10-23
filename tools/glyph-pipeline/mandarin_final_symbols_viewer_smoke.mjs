import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const get=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const sources=[
 get("data/phonetics/written-final-symbol-control-v0.1.json"),
 get("site/pronunciation-citations-0001-1000.json")];
const js=fs.readFileSync("site/mandarin-final-symbols.js","utf8");
const html=fs.readFileSync("site/mandarin-final-symbols.html","utf8");
class Element{
 constructor(){this.children=[];this.textContent="";this.value="";this.checked=false;this.events={};this.style={};this.classList={add:()=>{}};this.attrs={};}
 appendChild(x){this.children.push(x);}
 replaceChildren(...x){this.children=x;}
 addEventListener(name,fn){this.events[name]=fn;}
 setAttribute(name,value){this.attrs[name]=value;}
}
function setup(data=sources){
 const ids=["final-filter","final-labels","final-status","final-count","final-gallery","final-legend"];
 const nodes=Object.fromEntries(ids.map(id=>[id,new Element()]));
 nodes["final-labels"].checked=true;
 const doc={getElementById:id=>nodes[id],createElement:()=>new Element(),createElementNS:()=>new Element()};
 const urls=["phonetics/written-final-symbol-control-v0.1.json","pronunciation-citations-0001-1000.json"];
 vm.runInNewContext(js,{document:doc,fetch:async url=>({ok:true,json:async()=>data[urls.indexOf(url)]}),
  Map,Set,Object,Number,JSON,Error});
 return nodes;
}
async function settle(v){for(let i=0;i<35&&!v["final-gallery"].children.length&&
 !v["final-status"].textContent.includes("Unable");i++)await Promise.resolve();}
const view=setup();await settle(view);
assert.equal(view["final-gallery"].children.length,33);
assert.equal(view["final-legend"].children.length,9);
assert.match(view["final-count"].textContent,/33 \/ 33/);
assert.match(view["final-gallery"].children[0].children[2].textContent,/a/);
assert.equal(view["final-gallery"].children[0].children[1].children.length,1);
view["final-labels"].checked=false;view["final-labels"].events.change();
assert.equal(view["final-gallery"].children[0].children[2].textContent,"Spelling label hidden");
view["final-filter"].value="ü";view["final-filter"].events.input();
assert.equal(view["final-gallery"].children.length,1);
const damaged=structuredClone(sources);damaged[0].records[0].independentPhonologicalInterpretationApproved=true;
const bad=setup(damaged);await settle(bad);
assert.match(bad["final-status"].textContent,/Unable to validate/);
assert.equal(bad["final-gallery"].children.length,0);
for(const id of ["final-filter","final-labels","final-status","final-count","final-gallery","final-legend"])
 assert.match(html,new RegExp('id="'+id+'"'));
assert.ok(!js.includes("innerHTML"));
console.log("33 distinct geometric written-final controls; no phonemic assignments or learner claims.");
