import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const original=[
 read("site/pronunciation-citations-0001-1000.json"),
 read("data/phonetics/mandarin-simple-final-feature-candidates-v0.1.json"),
 read("data/phonetics/mandarin-initial-feature-candidates-v0.1.json"),
 read("data/phonetics/mandarin-final-spelling-context-gates-v0.1.json"),
 read("site/layers-v0.1.json"),
 read("data/phonetics/working-feature-citation-codec-audit-v0.1.json")
];
const html=fs.readFileSync("site/mandarin-simple-final-features.html","utf8");
const js=fs.readFileSync("site/mandarin-working-feature-decoder.js","utf8");
class Element {
 constructor(){this.children=[];this.textContent="";this.value="";this.events={};this.className="";}
 replaceChildren(...items){this.children=items;}
 appendChild(item){this.children.push(item);return item;}
 addEventListener(k,fn){this.events[k]=fn;}
}
function setup(sources=original){
 const names=["vowel-code-initial","vowel-code-height","vowel-code-backness",
  "vowel-code-rounding","vowel-code-tone","vowel-code-output","vowel-code-status"];
 const els=Object.fromEntries(names.map(n=>[n,new Element()]));
 const urls=["pronunciation-citations-0001-1000.json",
  "phonetics/mandarin-simple-final-feature-candidates-v0.1.json",
  "phonetics/mandarin-initial-feature-candidates-v0.1.json",
  "phonetics/mandarin-final-spelling-context-gates-v0.1.json",
  "layers-v0.1.json","phonetics/working-feature-citation-codec-audit-v0.1.json"];
 vm.runInNewContext(js,{document:{getElementById:k=>els[k],createElement:()=>new Element()},
  fetch:async url=>{
   const index=urls.indexOf(url);assert.ok(index>=0,"Unpinned fetch URL: "+url);
   return {ok:true,json:async()=>sources[index]};
  },Array,Set,Map,Object,Number,JSON,Error});
 return els;
}
async function settle(els){
 for(let i=0;i<90&&!els["vowel-code-output"].children.length&&
  !els["vowel-code-status"].textContent.includes("Unable");i++)await Promise.resolve();
}
const els=setup();await settle(els);
assert.equal(els["vowel-code-initial"].children.length,24);
assert.equal(els["vowel-code-tone"].children.length,5);
assert.equal(els["vowel-code-height"].children.length,3);
assert.equal(els["vowel-code-backness"].children.length,3);
assert.equal(els["vowel-code-rounding"].children.length,2);
assert.equal(els["vowel-code-output"].children[0].textContent,"bā");
assert.match(els["vowel-code-output"].children[1].textContent,/八/);
assert.match(els["vowel-code-status"].textContent,/Source-attested/);
els["vowel-code-height"].value="open";
els["vowel-code-backness"].value="front";
els["vowel-code-rounding"].value="unrounded";
els["vowel-code-height"].events.change();
assert.match(els["vowel-code-status"].textContent,/Absent, withheld or unsupported/);
const sh=original[2].tokens.find(x=>x.token==="sh");
assert.ok(sh);
els["vowel-code-initial"].value="F:"+[sh.place,sh.manner,sh.aspiration].join("|");
els["vowel-code-height"].value="close";
els["vowel-code-backness"].value="front";
els["vowel-code-rounding"].value="unrounded";
els["vowel-code-tone"].value="↗";
els["vowel-code-tone"].events.change();
assert.match(els["vowel-code-status"].textContent,/Absent, withheld or unsupported/);
els["vowel-code-initial"].value="O:y";
els["vowel-code-tone"].value="—";
els["vowel-code-initial"].events.change();
assert.equal(els["vowel-code-output"].children[0].textContent,"yī");
const altered=structuredClone(original);
altered[5].counts.eligibleWorkingFeatureRoundTrips=321;
const reject=setup(altered);await settle(reject);
assert.match(reject["vowel-code-status"].textContent,/Unable to validate/);
assert.equal(reject["vowel-code-output"].children.length,0);
const contaminated=structuredClone(original);
contaminated[3].records[0].independentIPAAnalysisApproved=true;
const rejectIPA=setup(contaminated);await settle(rejectIPA);
assert.match(rejectIPA["vowel-code-status"].textContent,/Unable to validate/);
for(const id of ["initial","height","backness","rounding","tone","output","status"])
 assert.ok(html.includes('id="vowel-code-'+id+'"'));
assert.ok(html.includes("mandarin-working-feature-decoder.js"));
assert.ok(!js.includes("innerHTML")&&!js.includes("localStorage")&&
 !js.includes("sendBeacon")&&!js.includes("eval("));
console.log("Working featural decoder: exact source citations, withheld post-sibilant example, 320/112/739 eligibility and zero phonemic claims.");
