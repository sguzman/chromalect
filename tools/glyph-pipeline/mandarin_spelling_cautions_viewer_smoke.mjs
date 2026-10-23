import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const get=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const fixtures=[
 get("data/phonetics/mandarin-final-spelling-context-gates-v0.1.json"),
 get("data/phonetics/external-orthographic-spelling-rule-crosswalk-v0.1.json"),
 get("data/phonetics/external-umlaut-spelling-rule-crosswalk-v0.1.json"),
 get("data/phonetics/unresolved-phonetic-reference-leads-v0.1.json"),
 get("site/pronunciation-citations-0001-1000.json")
];
const js=fs.readFileSync("site/mandarin-spelling-cautions.js","utf8");
const html=fs.readFileSync("site/mandarin-spelling-cautions.html","utf8");
class Element{
 constructor(){this.children=[];this.textContent="";this.value="";this.events={};this.href="";this.className="";}
 appendChild(x){this.children.push(x);}
 replaceChildren(...x){this.children=x;}
 addEventListener(name,fn){this.events[name]=fn;}
}
function setup(data=fixtures){
 const names=["caution-filter","caution-query","caution-count","caution-status",
  "caution-summary","caution-list"];
 const nodes=Object.fromEntries(names.map(x=>[x,new Element()]));
 nodes["caution-filter"].value="all";
 const urls=[
  "phonetics/mandarin-final-spelling-context-gates-v0.1.json",
  "phonetics/external-orthographic-spelling-rule-crosswalk-v0.1.json",
  "phonetics/external-umlaut-spelling-rule-crosswalk-v0.1.json",
  "phonetics/unresolved-phonetic-reference-leads-v0.1.json",
  "pronunciation-citations-0001-1000.json"
 ];
 const document={
  getElementById:id=>nodes[id],
  createElement:()=>new Element(),
  createTextNode:s=>({textContent:s})
 };
 vm.runInNewContext(js,{document,fetch:async url=>({ok:urls.includes(url),
  json:async()=>data[urls.indexOf(url)]}),Map,Set,Object,Math,Error,JSON});
 return nodes;
}
async function settle(ui){for(let i=0;i<55&&
 !ui["caution-list"].children.length&&!ui["caution-status"].textContent.includes("Unable");
 i++)await Promise.resolve();}
const ui=setup();await settle(ui);
assert.equal(ui["caution-list"].children.length,9);
assert.match(ui["caution-summary"].textContent,/7 published spelling-rule correspondences/);
assert.match(ui["caution-summary"].textContent,/2 phonetic research leads/);
assert.match(ui["caution-summary"].textContent,/0 IPA approvals/);
const first=ui["caution-list"].children[0];
assert.match(first.children[0].textContent,/post sibilant i/);
assert.match(first.children[2].textContent,/Phonetic reference lead only/);
assert.match(first.children[4].children[1].href,/phonetik\.uni-muenchen\.de/);
assert.match(first.children[3].children[1].href,/mandarin-encoding-comparison\.html#c0004-r\d/);
assert.match(first.children[5].children[0].href,/mandarin-phonetic-review\.html#c0004-r\d/);
assert.match(first.children[5].children[0].textContent,/exact citation/);
const last=ui["caution-list"].children[8];
assert.match(last.children[0].textContent,/labial written o/);
assert.match(last.children[4].children[1].href,/polyu\.edu\.hk.*simple-finals/);
assert.match(last.children[5].children[0].href,/mandarin-phonetic-review\.html#c\d{4}-r\d+/);
ui["caution-filter"].value="spelling";ui["caution-filter"].events.change();
assert.equal(ui["caution-list"].children.length,7);
ui["caution-filter"].value="phonetic";ui["caution-filter"].events.change();
assert.equal(ui["caution-list"].children.length,2);
ui["caution-filter"].value="all";ui["caution-filter"].events.change();
ui["caution-query"].value="云";ui["caution-query"].events.input();
assert.ok(ui["caution-list"].children.length>=1);
const bad=structuredClone(fixtures);bad[3].records[0].proposedIPAForm="not verified";
const rejected=setup(bad);await settle(rejected);
assert.equal(rejected["caution-list"].children.length,0);
assert.match(rejected["caution-status"].textContent,/Unable to verify/);
const changed=structuredClone(fixtures);changed[4].source.blob_sha="moved";
const rejectedSource=setup(changed);await settle(rejectedSource);
assert.equal(rejectedSource["caution-list"].children.length,0);
for(const id of ["caution-filter","caution-query","caution-count","caution-status",
 "caution-summary","caution-list"])assert.match(html,new RegExp('id="'+id+'"'));
assert.ok(!js.includes("innerHTML"));
console.log("Nine Mandarin spelling caution families, deep-linked sources and withheld phonetic approvals verified.");
