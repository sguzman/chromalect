import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const js=fs.readFileSync("site/mandarin-initial-features.js","utf8");
const html=fs.readFileSync("site/mandarin-initial-features.html","utf8");
const source=JSON.parse(fs.readFileSync("data/phonetics/mandarin-initial-feature-candidates-v0.1.json","utf8"));
const codecAudit=JSON.parse(fs.readFileSync("data/phonetics/initial-feature-codec-audit-v0.1.json","utf8"));
class Element{
 constructor(){this.children=[];this.textContent="";this.value="";this.events={};this.attributes={};this.classList={add:()=>{}};}
 replaceChildren(...parts){this.children=parts;}
 appendChild(x){this.children.push(x);}
 addEventListener(event,cb){this.events[event]=cb;}
 setAttribute(k,v){this.attributes[k]=v;}
}
function create(data=source,proof=codecAudit){
 const ids=["initial-mode","initial-filter","initial-count","initial-status","initial-list"];
 const elements=Object.fromEntries(ids.map(x=>[x,new Element()]));
 elements["initial-mode"].value="featural";
 const document={getElementById:id=>elements[id],
  createElement:()=>new Element(),createElementNS:()=>new Element()};
 vm.runInNewContext(js,{document,fetch:async url=>({ok:true,json:async()=>url.includes("codec-audit")?proof:data}),Object,Set,Error});
 return elements;
}
async function settle(x){for(let i=0;i<30&&!x["initial-list"].children.length&&!x["initial-status"].textContent.includes("Unable");i++)await Promise.resolve();}
const view=create();await settle(view);
assert.equal(view["initial-list"].children.length,21);
assert.match(view["initial-status"].textContent,/3 written onset conventions excluded/);
assert.match(view["initial-status"].textContent,/1171 machine-only spelling roundtrips/);
assert.equal(view["initial-list"].children[0].children[1].children[0].attributes.role,"img");
assert.ok(view["initial-list"].children[0].children[1].children[0].children.length>=2);
assert.match(view["initial-list"].children[0].children[2].textContent,/feature key/);
view["initial-mode"].value="ipa";view["initial-mode"].events.change();
assert.equal(view["initial-list"].children.length,21);
assert.ok(view["initial-list"].children[0].children[1].children[0].textContent.length>0);
view["initial-mode"].value="pinyin";view["initial-mode"].events.change();
const code=view["initial-list"].children[0].children[0].textContent.split(" · ")[0];
assert.equal(view["initial-list"].children[0].children[1].children[0].textContent,code);
view["initial-filter"].value="aspirated";view["initial-filter"].events.input();
assert.ok(view["initial-list"].children.length>0&&view["initial-list"].children.length<21);
const fakeAudit=structuredClone(codecAudit);fakeAudit.counts.roundTripFailures=1;
const invalidAudit=create(source,fakeAudit);await settle(invalidAudit);
assert.match(invalidAudit["initial-status"].textContent,/Unable to validate/);
assert.equal(invalidAudit["initial-list"].children.length,0);
const invalid=structuredClone(source);invalid.tokens.find(t=>t.token==="p").aspiration="unaspirated";
const bad=create(invalid);await settle(bad);
assert.match(bad["initial-status"].textContent,/Unable to validate/);
assert.equal(bad["initial-list"].children.length,0);
assert.match(html,/id="initial-mode"/);
assert.ok(!js.includes("innerHTML"));
console.log("21 collision-free working initial feature shapes; 3 orthographic-only onsets excluded.");
