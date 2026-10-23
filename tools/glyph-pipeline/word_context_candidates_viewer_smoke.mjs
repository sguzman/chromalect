import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const html=fs.readFileSync("site/word-context-candidates.html","utf8");
const js=fs.readFileSync("site/word-context-candidates.js","utf8");
const leads=JSON.parse(fs.readFileSync("data/semantic/cedict-crossref/dictionary-word-surface-leads-v0.1.json","utf8"));
const data=JSON.parse(fs.readFileSync("data/semantic/cedict-crossref/tatoeba-word-surface-id-index-v0.1.json","utf8"));
const attributions=JSON.parse(fs.readFileSync("data/semantic/cedict-crossref/tatoeba-word-candidate-attribution-v0.1.json","utf8"));
const live=JSON.parse(fs.readFileSync("data/semantic/cedict-crossref/tatoeba-live-word-record-audit-summary-v0.1.json","utf8"));
const hints=JSON.parse(fs.readFileSync("data/semantic/cedict-crossref/tatoeba-icu-word-segmentation-index-v0.1.json","utf8"));
class Element{constructor(){this.children=[];this.value="";this.textContent="";this.events={};}
 addEventListener(n,fn){this.events[n]=fn;}replaceChildren(...c){this.children=c;}appendChild(c){this.children.push(c);}}
function setup(a=leads,b=data,c=attributions,l=live,h=hints){
 const e=Object.fromEntries(["word-query","word-scope","word-status","word-stats","word-results"].map(id=>[id,new Element()]));
 e["word-scope"].value="all";
 const context={document:{getElementById:id=>e[id],createElement:()=>new Element()},
  fetch:async url=>({ok:true,json:async()=>url.includes("dictionary-word-surface")?a:url.includes("candidate-attribution")?c:url.includes("live-word-record-audit")?l:url.includes("icu-word-segmentation-index")?h:b})};
 vm.runInNewContext(js,context);return e;
}
async function settle(e){for(let n=0;n<30&&!e["word-results"].children.length&&!e["word-status"].textContent.includes("Unable");n++)await Promise.resolve();}
const x=setup();await settle(x);
assert.equal(x["word-results"].children.length,8);
assert.match(x["word-stats"].textContent,/27 selected source IDs/);
x["word-scope"].value="without";x["word-scope"].events.change();
assert.deepEqual(x["word-results"].children.map(c=>c.children[1].textContent),["刨坑","刨木头"]);
x["word-scope"].value="all";x["word-query"].value="计划";x["word-query"].events.input();
assert.equal(x["word-results"].children.length,1);
const c=x["word-results"].children[0];
assert.equal(c.children[0].textContent,"计划");
assert.match(c.children[2].textContent,/120 literal matches/);
assert.equal(c.children[4].children.length,5);
assert.ok(c.children[4].children.every(li=>li.children[0].href.startsWith("https://tatoeba.org/en/sentences/show/")));
assert.ok(c.children[4].children.every(li=>li.children[1].textContent.includes("contributor:")));
assert.ok(c.children[4].children.every(li=>li.children[1].textContent.includes("CC BY 2.0 FR observed 2026-10-23")));
assert.ok(c.children[4].children.every(li=>li.children[1].textContent.includes("quotation clearance and pronunciation pending")));
assert.ok(c.children[4].children.every(li=>li.children[1].textContent.includes("ICU word segmentation: single_icu_segment (machine hint only)")));
const fakeCredits=structuredClone(attributions);
fakeCredits.records[0].individualLicenseStatus="confirmed";
const invalidCredit=setup(leads,data,fakeCredits);await settle(invalidCredit);
assert.match(invalidCredit["word-status"].textContent,/Unable to validate/);
assert.equal(invalidCredit["word-results"].children.length,0);
const fakeLive=structuredClone(live);fakeLive.records[0].reuseRightsAdjudicated=true;
const invalidLive=setup(leads,data,attributions,fakeLive);await settle(invalidLive);
assert.match(invalidLive["word-status"].textContent,/Unable to validate/);
assert.equal(invalidLive["word-results"].children.length,0);
const fakeHints=structuredClone(hints);fakeHints.records[0].independentWordBoundaryVerified=true;
const invalidHints=setup(leads,data,attributions,live,fakeHints);await settle(invalidHints);
assert.match(invalidHints["word-status"].textContent,/Unable to validate/);
assert.equal(invalidHints["word-results"].children.length,0);
const falseData=structuredClone(data);falseData.records[0].independentLexicalSenseVerified=true;
const invalid=setup(leads,falseData);await settle(invalid);
assert.match(invalid["word-status"].textContent,/Unable to validate/);
assert.equal(invalid["word-results"].children.length,0);
assert.match(html,/id="word-query"/);
assert.match(html,/https:\/\/creativecommons\.org\/licenses\/by\/2\.0\/fr\//);assert.ok(!js.includes("innerHTML"));
console.log("Word surface candidate browser: eight publisher leads, 27 unapproved source IDs.");