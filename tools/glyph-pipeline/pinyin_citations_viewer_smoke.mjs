import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const html=fs.readFileSync("site/pinyin-citations.html","utf8");
const js=fs.readFileSync("site/pinyin-citations.js","utf8");
const citations=JSON.parse(fs.readFileSync("site/pronunciation-citations-0001-1000.json","utf8"));
const layers=JSON.parse(fs.readFileSync("site/layers-v0.1.json","utf8"));
const audit=JSON.parse(fs.readFileSync("data/phonetics/pinyin-citation-orthography-audit-v0.1.json","utf8"));
class Element{
 constructor(){this.children=[];this.textContent="";this.value="";this.events={};this.style={};}
 replaceChildren(...xs){this.children=xs;}
 appendChild(x){this.children.push(x);}
 addEventListener(n,fn){this.events[n]=fn;}
 setAttribute(n,v){this[n]=v;}
}
function setup(a=citations,b=layers,c=audit){
 const id=["pinyin-query","pinyin-tone","pinyin-stats","pinyin-results","pinyin-status"];
 const e=Object.fromEntries(id.map(x=>[x,new Element()]));
 e["pinyin-tone"].value="all";
 vm.runInNewContext(js,{document:{getElementById:id=>e[id],createElement:()=>new Element()},
  fetch:async url=>({ok:true,json:async()=>url.includes("pronunciation-citations")?a:
   url.includes("layers-v0.1")?b:c}),Object,Math});
 return e;
}
async function settle(e){for(let i=0;i<45&&!e["pinyin-results"].children.length&&
 !e["pinyin-status"].textContent.includes("Unable");i++)await Promise.resolve();}
const e=setup();await settle(e);
assert.equal(e["pinyin-results"].children.length,60);
assert.match(e["pinyin-status"].textContent,/1,171 source-aligned/);
assert.match(e["pinyin-stats"].textContent,/1171 matching citation readings/);
e["pinyin-query"].value="yī";e["pinyin-query"].events.input();
assert.ok(e["pinyin-results"].children.length>=1);
assert.equal(e["pinyin-results"].children[0].children[0].textContent,"一 · yī");
e["pinyin-query"].value="";e["pinyin-tone"].value="0";e["pinyin-tone"].events.change();
assert.match(e["pinyin-stats"].textContent,/10 matching citation readings/);
const altered=structuredClone(audit);altered.counts.contextualPronunciationApprovals=1;
const no=setup(citations,layers,altered);await settle(no);
assert.equal(no["pinyin-results"].children.length,0);
assert.match(no["pinyin-status"].textContent,/Unable to validate/);
assert.match(html,/id="pinyin-query"/);
assert.match(html,/id="pinyin-tone"/);
assert.ok(!js.includes("innerHTML"));
console.log("Citation Pinyin explorer: 1,171 source readings, text-labeled colors, no contextual approvals.");
