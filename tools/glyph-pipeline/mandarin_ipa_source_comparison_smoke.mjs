import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import {validate} from "./mandarin_ipa_source_comparison.mjs";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const report=read("data/phonetics/mandarin-pinyin-ipa-source-disagreement-v0.1.json");
const initials=read("data/phonetics/mandarin-initial-feature-candidates-v0.1.json");
const finals=read("data/phonetics/mandarin-simple-final-feature-candidates-v0.1.json");
const citations=read("site/pronunciation-citations-0001-1000.json");
const script=fs.readFileSync("site/mandarin-ipa-source-comparison.js","utf8");
const initialPage=fs.readFileSync("site/mandarin-initial-features.html","utf8");
const finalPage=fs.readFileSync("site/mandarin-simple-final-features.html","utf8");
validate(report,initials,finals,citations);
assert.equal(report.initials.find(x=>x.pinyinInitial==="b").linReportedIPA,"p");
assert.equal(report.initials.find(x=>x.pinyinInitial==="b").caiSuggestedIPA,"b");
assert.equal(report.initials.find(x=>x.pinyinInitial==="t").meiReportedIPA,"ts");
assert.equal(report.initials.find(x=>x.pinyinInitial==="zh").originalWorkingCandidate,"ʈʂ");
assert.equal(report.initials.find(x=>x.pinyinInitial==="zh").linReportedIPA,"tʂ");
assert.equal(report.simples.find(x=>x.writtenFinal==="ü").linReportedIPA,"ɥy");
const changed=structuredClone(report);changed.initials[0].originalWorkingCandidate="made-up";
assert.throws(()=>validate(changed,initials,finals,citations));
const approved=structuredClone(report);approved.counts.independentPhonemicContrastApprovals=1;
assert.throws(()=>validate(approved,initials,finals,citations));
const incomplete=structuredClone(report);incomplete.initials.pop();
assert.throws(()=>validate(incomplete,initials,finals,citations));
const wrongFinal=structuredClone(report);wrongFinal.simples[0].writtenFinal="unsupported";
assert.throws(()=>validate(wrongFinal,initials,finals,citations));
class Node{
 constructor(tag){this.tag=tag;this.children=[];this.textContent="";this.className="";}
 appendChild(x){this.children.push(x);return x;}
 replaceChildren(...xs){this.children=xs;}
}
function mount(mode,data=[report,initials,finals]){
 const elements=Object.fromEntries([
  "ipa-source-compare-status",
  mode==="initial"?"ipa-source-initial-table":"ipa-source-simple-final-table"
 ].map(id=>[id,new Node("div")]));
 const urls=["phonetics/mandarin-pinyin-ipa-source-disagreement-v0.1.json",
  "phonetics/mandarin-initial-feature-candidates-v0.1.json",
  "phonetics/mandarin-simple-final-feature-candidates-v0.1.json"];
 const ctx={
  document:{getElementById:id=>elements[id],createElement:t=>new Node(t)},
  fetch:async url=>{
   const index=urls.indexOf(url);assert.ok(index>=0,"Unexpected endpoint "+url);
   return {ok:true,json:async()=>data[index]};
  },Map,Set,Object,Array,Error,String
 };
 vm.runInNewContext(script,ctx);
 return elements;
}
async function settle(e){
 for(let i=0;i<80&&!e["ipa-source-compare-status"].textContent;i++)await Promise.resolve();
}
const ni=mount("initial");await settle(ni);
const table=ni["ipa-source-initial-table"].children[0].children[0];
assert.equal(table.tag,"table");
assert.equal(table.children[0].children[0].children.length,6);
assert.equal(table.children[1].children.length,21);
assert.equal(table.children[1].children[0].children[0].textContent,"b");
assert.equal(table.children[1].children[0].children[1].textContent,"p");
assert.match(ni["ipa-source-compare-status"].textContent,/16 rows differ/);
const nf=mount("final");await settle(nf);
const finalsTable=nf["ipa-source-simple-final-table"].children[0].children[0];
assert.equal(finalsTable.children[1].children.length,6);
assert.equal(finalsTable.children[1].children[0].children[0].textContent,"a");
assert.equal(finalsTable.children[1].children[2].children[0].textContent,"e");
assert.match(finalsTable.children[1].children[1].children[5].textContent,/16 \/ 16/);
const unexpected=structuredClone(report);unexpected.initials[0].caiSuggestedIPA="invalid";
unexpected.initials[0].disagreementsBetweenReports=true;
const ui=mount("initial",[unexpected,initials,finals]);await settle(ui);
assert.match(ui["ipa-source-compare-status"].textContent,/Unable to validate/);
assert.equal(ui["ipa-source-initial-table"].children.length,0);
const forbidden=structuredClone(report);
forbidden.counts.humanDecodingTrials=1;
const rejected=mount("final",[forbidden,initials,finals]);await settle(rejected);
assert.match(rejected["ipa-source-compare-status"].textContent,/Unable to validate/);
for(const html of [initialPage,finalPage]){
 assert.match(html,/mandarin-ipa-source-comparison\.js/);
 assert.match(html,/id="ipa-source-compare-status"/);
 assert.match(html,/https:\/\/scholarworks\.iu\.edu\//);
}
assert.ok(initialPage.includes('id="ipa-source-initial-table"'));
assert.ok(finalPage.includes('id="ipa-source-simple-final-table"'));
assert.ok(!script.includes("innerHTML")&&!script.includes("localStorage")&&!script.includes("sendBeacon"));
console.log("IU IPA comparison: 21 initials, 6 simple finals, 16 reported convention disagreements, and no phonemic promotion.");
