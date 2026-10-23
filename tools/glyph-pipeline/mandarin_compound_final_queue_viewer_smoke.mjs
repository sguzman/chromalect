import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const get=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const fixtures=[
 get("data/phonetics/unadjudicated-compound-final-review-queue-v0.1.json"),
 get("site/pronunciation-citations-0001-1000.json"),
 get("data/phonetics/mandarin-final-spelling-context-gates-v0.1.json")];
const js=fs.readFileSync("site/mandarin-compound-final-queue.js","utf8");
const html=fs.readFileSync("site/mandarin-compound-final-queue.html","utf8");
class Element{
 constructor(){this.children=[];this.textContent="";this.value="";this.className="";this.events={};this.style={};}
 appendChild(x){this.children.push(x);}
 replaceChildren(...x){this.children=x;}
 addEventListener(name,fn){this.events[name]=fn;}
}
function setup(data=fixtures){
 const names=["compound-filter","compound-query","compound-count","compound-status",
  "compound-summary","compound-list"];
 const nodes=Object.fromEntries(names.map(x=>[x,new Element()]));
 nodes["compound-filter"].value="all";
 const urls=["phonetics/unadjudicated-compound-final-review-queue-v0.1.json",
  "pronunciation-citations-0001-1000.json",
  "phonetics/mandarin-final-spelling-context-gates-v0.1.json"];
 const dom={getElementById:x=>nodes[x],createElement:()=>new Element()};
 vm.runInNewContext(js,{document:dom,fetch:async url=>({ok:true,json:async()=>data[urls.indexOf(url)]}),
  Map,Set,Object,Math,Error,JSON});
 return nodes;
}
async function settle(ui){for(let i=0;i<45&&!ui["compound-list"].children.length&&
 !ui["compound-status"].textContent.includes("Unable");i++)await Promise.resolve();}
const ui=setup();await settle(ui);
assert.equal(ui["compound-list"].children.length,27);
assert.match(ui["compound-summary"].textContent,/739 source uses/);
assert.match(ui["compound-list"].children[0].children[0].textContent,/un/);
ui["compound-filter"].value="caution";ui["compound-filter"].events.change();
assert.equal(ui["compound-list"].children.length,5);
assert.match(ui["compound-count"].textContent,/5 \/ 27/);
ui["compound-filter"].value="unflagged";ui["compound-filter"].events.change();
assert.equal(ui["compound-list"].children.length,22);
ui["compound-filter"].value="all";ui["compound-filter"].events.change();
ui["compound-query"].value="uan";ui["compound-query"].events.input();
assert.ok(ui["compound-list"].children.length>=1);
const bad=structuredClone(fixtures);bad[0].records[0].proposedIPAForm="uən";
const rejected=setup(bad);await settle(rejected);
assert.equal(rejected["compound-list"].children.length,0);
assert.match(rejected["compound-status"].textContent,/Unable to validate/);
for(const id of ["compound-filter","compound-query","compound-count","compound-status",
 "compound-summary","compound-list"])assert.match(html,new RegExp('id="'+id+'"'));
assert.ok(!js.includes("innerHTML"));
console.log("27 first-tranche Mandarin compound-final review priorities, no phonetic assignments or human study results.");
