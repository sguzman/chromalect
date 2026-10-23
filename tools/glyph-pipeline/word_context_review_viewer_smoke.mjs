import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const js=fs.readFileSync("site/word-context-review.js","utf8");
const html=fs.readFileSync("site/word-context-review.html","utf8");
const src="data/semantic/cedict-crossref/";
const names=["dictionary-word-surface-leads","tatoeba-word-surface-id-index",
 "tatoeba-word-candidate-attribution","tatoeba-live-word-record-audit-summary",
 "tatoeba-word-sentence-text-fingerprints"];
const data=names.map(n=>JSON.parse(fs.readFileSync(src+n+"-v0.1.json","utf8")));
class Element{
 constructor(){this.value="";this.textContent="";this.children=[];this.events={};}
 addEventListener(name,fn){this.events[name]=fn;}
 appendChild(c){this.children.push(c);}
 replaceChildren(...items){this.children=items;}
}
const ids=["review-candidate","review-boundary","review-reading","review-sense","review-evidence",
 "review-rationale","review-source","review-heading","review-status","review-link",
 "review-save","review-export","review-output","review-count"];
function setup(all=data){
 const nodes=Object.fromEntries(ids.map(id=>[id,new Element()]));
 for(const id of ["review-boundary","review-reading","review-sense"])nodes[id].value="undetermined";
 const context={document:{getElementById:id=>nodes[id],createElement:()=>new Element()},
 fetch:async url=>({ok:true,json:async()=>all[names.findIndex(n=>url===("semantic/"+n+"-v0.1.json"))]}),
 URL,Date,console};
 vm.runInNewContext(js,context);
 return nodes;
}
async function settle(x){
 for(let i=0;i<40&&!x["review-candidate"].children.length&&!x["review-status"].textContent.includes("Unable");i++)
  await Promise.resolve();
}
const a=setup();await settle(a);
assert.equal(a["review-candidate"].children.length,27);
assert.match(a["review-count"].textContent,/0 local/);
a["review-boundary"].value="supports";
a["review-rationale"].value="A preliminary hypothesis without the independent evidence needed for approval.";
a["review-export"].events.click();
assert.match(a["review-status"].textContent,/Cannot export/);
a["review-evidence"].value="https://example.org/independent";
a["review-export"].events.click();
const exported=JSON.parse(a["review-output"].value);
assert.equal(exported.schema,"chromalect.word-context-review-session.v0.1");
assert.equal(exported.session.localOnly,true);
assert.equal(exported.session.recorded,1);
assert.equal(exported.observations[0].wordBoundaryAssessment,"supports");
assert.ok(!("sentenceText" in exported.observations[0]));
assert.ok(!("productionVerified" in exported.observations[0]));
assert.match(a["review-status"].textContent,/JSON prepared locally/);
a["review-evidence"].value=exported.observations[0].sourceURL;
a["review-export"].events.click();
assert.match(a["review-status"].textContent,/Cannot export/);
const manipulated=structuredClone(data);manipulated[3].summary.approvedLexicalSenses=1;
const invalid=setup(manipulated);await settle(invalid);
assert.match(invalid["review-status"].textContent,/Unable to validate/);
assert.equal(invalid["review-candidate"].children.length,0);
for(const id of ids)assert.ok(html.includes('id="'+id+'"'));
assert.ok(!js.includes("innerHTML"));
assert.match(html,/not uploaded, stored, approved/);
console.log("Local word-context research browser: 27 pinned records and nonapproval exports.");
