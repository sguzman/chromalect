import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const html=fs.readFileSync("site/context-evidence.html","utf8");
const source=fs.readFileSync("site/context-evidence.js","utf8");
const old=JSON.parse(fs.readFileSync("data/semantic/cedict-crossref/tatoeba-sentence-id-index-v0.1.json","utf8"));
const hashed=JSON.parse(fs.readFileSync("data/semantic/cedict-crossref/tatoeba-hash-sample-source-id-index-v0.1.json","utf8"));
const ids=["candidate-query","candidate-scope","candidate-cohort","candidate-status","candidate-stats","candidate-rows","candidate-prev","candidate-next"];
class Element {
 constructor(){this.children=[];this.value="";this.textContent="";this.disabled=false;this.events={};}
 addEventListener(name,fn){this.events[name]=fn;}
 replaceChildren(...x){this.children=x;}
 appendChild(x){this.children.push(x);}
 click(){this.events.click?.();}
}
function setup(a=old,b=hashed){
 const nodes=Object.fromEntries(ids.map(id=>[id,new Element()]));
 nodes["candidate-scope"].value="all";
 nodes["candidate-cohort"].value="combined";
 const fetch=async path=>({ok:true,json:async()=>path.includes("hash-sample")?b:a});
 const sandbox={document:{getElementById:id=>nodes[id],createElement:()=>new Element()},fetch};
 vm.runInNewContext(source,sandbox);
 return nodes;
}
async function settle(nodes){
 for(let n=0;n<30&&!nodes["candidate-rows"].children.length&&!nodes["candidate-status"].textContent.includes("Unable");n++)
  await Promise.resolve();
}
const nodes=setup();
await settle(nodes);
assert.equal(nodes["candidate-rows"].children.length,18);
assert.ok(nodes["candidate-stats"].textContent.includes("142 matching character(s)"));
assert.match(nodes["candidate-status"].textContent,/1087 character\/sentence associations, 1015 distinct source IDs/);
assert.equal(nodes["candidate-prev"].disabled,true);
assert.equal(nodes["candidate-next"].disabled,false);
nodes["candidate-scope"].value="without";nodes["candidate-scope"].events.change();
assert.equal(nodes["candidate-rows"].children.length,1);
assert.equal(nodes["candidate-rows"].children[0].children[0].children[0].textContent,"刨");
nodes["candidate-scope"].value="all";nodes["candidate-query"].value="127";
nodes["candidate-query"].events.input();
assert.equal(nodes["candidate-rows"].children.length,1);
const combo=nodes["candidate-rows"].children[0];
assert.equal(combo.children[0].children[0].textContent,"长");
assert.equal(combo.children[2].children.length,8);
assert.ok(combo.children[2].children.every(li=>li.children[0].href.startsWith("https://tatoeba.org/en/sentences/show/")));
assert.ok(combo.children[2].children.some(li=>li.children[1]?.textContent.includes("Hash")));
nodes["candidate-cohort"].value="early";nodes["candidate-cohort"].events.change();
assert.equal(nodes["candidate-rows"].children[0].children[2].children.length,3);
assert.ok(nodes["candidate-status"].textContent.includes("423 character/sentence associations"));
nodes["candidate-cohort"].value="hashed";nodes["candidate-cohort"].events.change();
assert.equal(nodes["candidate-rows"].children[0].children[2].children.length,5);
assert.ok(nodes["candidate-status"].textContent.includes("701 character/sentence associations"));
assert.match(html,/id="candidate-cohort"/);
assert.ok(!source.includes("innerHTML"));
const malformed=structuredClone(hashed);
malformed.records[0].independentReadingApproval=true;
const invalid=setup(old,malformed);
await settle(invalid);
assert.ok(invalid["candidate-status"].textContent.includes("Unable to validate"));
assert.equal(invalid["candidate-rows"].children.length,0);
console.log("Context viewer: 423 early + 701 hash associations / 37 shared = 1087 combined; zero approvals.");