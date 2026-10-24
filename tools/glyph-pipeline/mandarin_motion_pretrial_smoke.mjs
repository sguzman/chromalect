// One-shot motion comparison: source-bound candidates, opt-in and reduced-motion fallback.
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const load=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const semantic=load("data/semantic/mandarin-1000-v0.1.json");
const initial=load("data/phonetics/mandarin-initial-feature-candidates-v0.1.json");
const grammar=fs.readFileSync("site/semantic-grammar.js","utf8");
const js=fs.readFileSync("site/mandarin-motion-pretrial.js","utf8");
const html=fs.readFileSync("site/mandarin-motion-pretrial.html","utf8");
class Node{
 constructor(tag){
  this.tag=tag;this.children=[];this.textContent="";this.value="";
  this.disabled=false;this.events={};this.attrs={};this.className="";this.style={};
  this.classList={add:name=>{this.className+=" "+name;}};
 }
 appendChild(node){this.children.push(node);return node;}
 replaceChildren(...nodes){this.children=nodes;}
 addEventListener(event,fn){this.events[event]=fn;}
 setAttribute(key,value){this.attrs[key]=String(value);}
}
function setup(sources=[semantic,initial],reduce=false){
 const ids=["motion-domain","motion-event","motion-initial","motion-play","motion-status",
  "motion-static","motion-dynamic","motion-source-note"];
 const els=Object.fromEntries(ids.map(id=>[id,new Node("div")]));
 const urls=["semantic/mandarin-1000-v0.1.json",
  "phonetics/mandarin-initial-feature-candidates-v0.1.json"];
 const ctx={
  document:{getElementById:id=>els[id],createElement:tag=>new Node(tag)},
  fetch:async url=>{
   const idx=urls.indexOf(url);assert.ok(idx>=0,url);
   return {ok:true,json:async()=>sources[idx]};
  },
  matchMedia:query=>{
   assert.equal(query,"(prefers-reduced-motion: reduce)");
   return {matches:reduce};
  },
  Map,Set,Number,Object,String,Error,Array
 };
 ctx.globalThis=ctx;
 vm.runInNewContext(grammar,ctx);
 vm.runInNewContext(js,ctx);
 return els;
}
async function settle(ui){
 for(let i=0;i<70&&!ui["motion-static"].children.length&&
  !ui["motion-status"].textContent.includes("Unable");i++)await Promise.resolve();
}
const ui=setup();await settle(ui);
assert.equal(ui["motion-event"].children.length,280);
assert.equal(ui["motion-initial"].children.length,21);
assert.equal(ui["motion-event"].disabled,false);
assert.equal(ui["motion-initial"].disabled,true);
assert.ok(ui["motion-static"].children.length>=3);
assert.deepEqual(ui["motion-static"].children.map(x=>x.textContent),
 ui["motion-dynamic"].children.map(x=>x.textContent));
assert.ok(ui["motion-static"].children.every(x=>!x.className.includes("animated")));
assert.ok(ui["motion-dynamic"].children.every(x=>!x.className.includes("animated")));
assert.match(ui["motion-status"].textContent,/Static preview only/);
assert.match(ui["motion-source-note"].textContent,/Draft Unihan/);
ui["motion-play"].events.click();
assert.ok(ui["motion-dynamic"].children.every(x=>x.className.includes("animated")));
assert.ok(ui["motion-static"].children.every(x=>!x.className.includes("animated")));
assert.equal(ui["motion-dynamic"].children[0].attrs["data-sequence"],"0");
assert.equal(ui["motion-dynamic"].children[0].style.animationDelay,"0.00s");
assert.match(ui["motion-status"].textContent,/explicit activation/);
ui["motion-domain"].value="articulation";ui["motion-domain"].events.change();
assert.equal(ui["motion-event"].disabled,true);
assert.equal(ui["motion-initial"].disabled,false);
assert.equal(ui["motion-static"].children.length,4);
assert.ok(ui["motion-dynamic"].children.every(x=>!x.className.includes("animated")));
assert.match(ui["motion-source-note"].textContent,/not recorded mouth movement/);
ui["motion-initial"].value="p";ui["motion-initial"].events.change();
assert.match(ui["motion-static"].children[3].textContent,/aspirated/);
ui["motion-play"].events.click();
assert.ok(ui["motion-dynamic"].children.every(x=>x.className.includes("animated")));
assert.ok(ui["motion-static"].children.every(x=>!x.className.includes("animated")));
const reduced=setup([semantic,initial],true);await settle(reduced);
reduced["motion-play"].events.click();
assert.match(reduced["motion-status"].textContent,/System reduced motion is active/);
assert.ok(reduced["motion-dynamic"].children.every(x=>!x.className.includes("animated")));
const unapproved=structuredClone(semantic);
unapproved.summary.productionVerifiedCharacters=1;
const reject=setup([unapproved,initial]);await settle(reject);
assert.match(reject["motion-status"].textContent,/Unable to validate/);
const phonemic=structuredClone(initial);
phonemic.statistics.independentlyVerifiedPhonemicContrasts=1;
const rejectPhone=setup([semantic,phonemic]);await settle(rejectPhone);
assert.match(rejectPhone["motion-status"].textContent,/Unable to validate/);
for(const id of ["domain","event","initial","play","status","static","dynamic","source-note"])
 assert.ok(html.includes('id="motion-'+id+'"'));
assert.match(html,/@media\(prefers-reduced-motion:reduce\)/);
assert.match(html,/chromalect-cue-once/);
assert.ok(!js.includes("localStorage")&&!js.includes("sendBeacon")&&
 !js.includes("setInterval")&&!js.includes("innerHTML"));
console.log("Pretrial motion: 280 source event candidates, 21 source initial codes, static and one-shot matching information, zero autoplay, system reduced-motion protection, and no fabricated approvals.");
