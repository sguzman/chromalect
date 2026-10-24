import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import {verify} from "./mandarin_written_final_ipa_crosswalk.mjs";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const data=read("data/phonetics/mandarin-written-final-ipa-source-crosswalk-v0.1.json");
const geometry=read("data/phonetics/written-final-symbol-control-v0.1.json");
const features=read("data/phonetics/mandarin-simple-final-feature-candidates-v0.1.json");
const source=read("site/pronunciation-citations-0001-1000.json");
const script=fs.readFileSync("site/mandarin-written-final-ipa-crosswalk.js","utf8");
const html=fs.readFileSync("site/mandarin-final-symbols.html","utf8");
assert.deepEqual(verify(data,geometry,source,features),
 {writtenFinals:33,sourceCitations:1171,conditionalRows:6});
assert.deepEqual(data.records.filter(r=>r.sourceTableRowChoiceRequiresPhoneticContext)
 .map(r=>r.writtenFinal),["i","o","ong","u","uan","un"]);
assert.deepEqual(data.records.find(r=>r.writtenFinal==="iu").sourceTableIPAOptions
 .map(x=>x.sourceTableRow),["iou"]);
assert.deepEqual(data.records.find(r=>r.writtenFinal==="ui").sourceTableIPAOptions
 .map(x=>x.sourceTableRow),["uei"]);
assert.deepEqual(data.records.find(r=>r.writtenFinal==="ue").sourceTableIPAOptions
 .map(x=>x.sourceTableRow),["üe"]);
assert.deepEqual(data.records.find(r=>r.writtenFinal==="u").sourceTableIPAOptions
 .map(x=>x.sourceTableRow),["u","ü"]);
const wrong=structuredClone(data);
wrong.records[0].sourceTableIPAOptions[0].caiProposedNotation="invented";
assert.throws(()=>verify(wrong,geometry,source,features));
const tampered=structuredClone(data);
tampered.records.find(r=>r.writtenFinal==="u").sourceTableIPAOptions.pop();
assert.throws(()=>verify(tampered,geometry,source,features));
const promoted=structuredClone(data);
promoted.summary.contextualIPARealizationApprovals=1;
assert.throws(()=>verify(promoted,geometry,source,features));
class Node{
 constructor(tag){this.tag=tag;this.children=[];this.textContent="";
  this.value="";this.events={};this.className="";}
 appendChild(x){this.children.push(x);return x;}
 replaceChildren(...x){this.children=x;}
 addEventListener(k,fn){this.events[k]=fn;}
}
function mount(sources=[data,geometry,features,source]){
 const ids=["final-ipa-source-table","final-ipa-status","final-filter"];
 const nodes=Object.fromEntries(ids.map(i=>[i,new Node("div")]));
 const urls=["phonetics/mandarin-written-final-ipa-source-crosswalk-v0.1.json",
  "phonetics/written-final-symbol-control-v0.1.json",
  "phonetics/mandarin-simple-final-feature-candidates-v0.1.json",
  "pronunciation-citations-0001-1000.json"];
 const env={document:{getElementById:id=>nodes[id],createElement:t=>new Node(t)},
  fetch:async url=>{
   const index=urls.indexOf(url);assert.ok(index>=0,url);
   return {ok:true,json:async()=>sources[index]};
  },Map,Set,Object,Array,JSON,Number,Error,String};
 vm.runInNewContext(script,env);
 return nodes;
}
async function settle(nodes){
 for(let i=0;i<100&&!nodes["final-ipa-status"].textContent;i++)await Promise.resolve();
}
const ui=mount();await settle(ui);
const table=ui["final-ipa-source-table"].children[0].children[0];
assert.equal(table.children[1].children.length,33);
assert.equal(table.children[0].children[0].children.length,6);
assert.match(ui["final-ipa-status"].textContent,/33 \/ 33/);
assert.match(ui["final-ipa-status"].textContent,/1,171/);
ui["final-filter"].value="uan";ui["final-filter"].events.input();
assert.equal(ui["final-ipa-source-table"].children[0].children[0].children[1].children.length,2);
ui["final-filter"].value="u";ui["final-filter"].events.input();
assert.ok(ui["final-ipa-source-table"].children[0].children[0].children[1].children.length>=8);
ui["final-filter"].value="iu";ui["final-filter"].events.input();
const row=ui["final-ipa-source-table"].children[0].children[0].children[1].children[0];
assert.match(row.children[2].textContent,/iou/);
const bad=structuredClone(data);bad.records[0].hasApprovedFeaturalGrapheme=true;
const reject=mount([bad,geometry,features,source]);await settle(reject);
assert.match(reject["final-ipa-status"].textContent,/Unable to validate/);
assert.equal(reject["final-ipa-source-table"].children.length,0);
assert.match(html,/mandarin-written-final-ipa-crosswalk\.js/);
assert.match(html,/id="final-ipa-source-table"/);
assert.match(html,/id="final-ipa-status"/);
assert.ok(!script.includes("innerHTML")&&!script.includes("localStorage"));
console.log("33-source-final crosswalk: 1,171 cited readings, six multiform Pinyin spellings, 27 unapproved complex featural finals, no inferred IPA.");
