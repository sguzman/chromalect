import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const sources={
 "glyphs/research/heldout-identification-target-v0.1/index-v0.1.json":
  read("site/glyphs/research/heldout-identification-target-v0.1/index-v0.1.json"),
 "glyphs/research/heldout-warning-v0.1/index-v0.1.json":
  read("site/glyphs/research/heldout-warning-v0.1/index-v0.1.json"),
 "semantic-group-hue-fivefold-heldout-v0.1.json":
  read("site/semantic-group-hue-fivefold-heldout-v0.1.json"),
 "palettes/mandarin-component-identity-v0.6.json":
  read("palettes/mandarin-component-identity-v0.6.json"),
 "glyphs/research/owner-complement-locators-v0.1/index-v0.1.json":
  read("site/glyphs/research/owner-complement-locators-v0.1/index-v0.1.json")
};
const scripts=["site/heldout-blind-color-core.js",
 "site/heldout-component-identification-core.js",
 "site/component-owner-adjudication-core.js",
 "site/component-owner-adjudication.js"].map(p=>fs.readFileSync(p,"utf8"));
const ids=["oa-status","oa-filter","oa-order","oa-cohort-count","oa-target","oa-meta","oa-size","oa-grid","oa-native","oa-source","oa-locator","oa-fold",
 "oa-owner","oa-complement","oa-complement-meta","oa-judgment","oa-evidence","oa-rationale","oa-save","oa-count",
 "oa-export","oa-output","oa-import","oa-restore"];
class Element{
 constructor(){this.value="";this.textContent="";this.children=[];this.events={};this.disabled=false;this.src="";this.style={setProperty:(k,v)=>{this.style[k]=v;}};}
 appendChild(node){this.children.push(node);return node;}
 replaceChildren(...nodes){this.children=nodes;}
 addEventListener(type,handler){this.events[type]=handler;}
}
function setup(data=sources){
 const nodes=Object.fromEntries(ids.map(id=>[id,new Element()]));
 for(const id of ["oa-target","oa-filter","oa-order","oa-save","oa-export","oa-restore"])nodes[id].disabled=true;
 nodes["oa-judgment"].value="unresolved";nodes["oa-size"].value="96";nodes["oa-filter"].value="all";nodes["oa-order"].value="source";
 const document={getElementById:id=>nodes[id],createElement:()=>new Element()};
 const fetch=async url=>{
  assert.ok(url in data,"Only the five pinned source JSON resources may be fetched");
  return {ok:true,json:async()=>data[url]};
 };
 const ctx={document,fetch,URL,Map,Set,Date,Number,Error};
 ctx.globalThis=ctx;
 for(const script of scripts)vm.runInNewContext(script,ctx);
 return nodes;
}
async function settle(nodes){
 for(let i=0;i<40&&!nodes["oa-target"].children.length&&
  !nodes["oa-status"].textContent.startsWith("Cannot");i++)await Promise.resolve();
}
const p=setup();await settle(p);
assert.equal(p["oa-target"].children.length,49);
assert.equal(p["oa-target"].disabled,false);
assert.equal(p["oa-filter"].disabled,false);
assert.equal(p["oa-order"].disabled,false);
const manifestTargets=sources[
 "glyphs/research/heldout-identification-target-v0.1/index-v0.1.json"].targets;
const maskRecords=new Map(sources[
 "glyphs/research/owner-complement-locators-v0.1/index-v0.1.json"].records
 .map(x=>[x.trialId,x]));
const targetById=new Map(manifestTargets.map(x=>[x.id,x]));
const originalOrder=p["oa-target"].children.map(x=>x.value);
p["oa-order"].value="smallest-region";p["oa-order"].events.change();
const sparse=p["oa-target"].children.map(x=>x.value);
const minority=id=>Math.min(targetById.get(id).targetRegionPaths,
 maskRecords.get(id).complementaryTargetPaths);
assert.ok(sparse.every((id,i)=>i===0||minority(sparse[i-1])<=minority(id)));
p["oa-order"].value="complexity";p["oa-order"].events.change();
const complex=p["oa-target"].children.map(x=>x.value);
assert.ok(complex.every((id,i)=>i===0||
 targetById.get(complex[i-1]).sourceStrokePaths>=targetById.get(id).sourceStrokePaths));
p["oa-order"].value="bad-order";p["oa-order"].events.change();
assert.equal(p["oa-order"].value,"complexity");
assert.match(p["oa-status"].textContent,/Cannot change source review order/);
p["oa-order"].value="source";p["oa-order"].events.change();
assert.deepEqual(p["oa-target"].children.map(x=>x.value),originalOrder);
assert.match(p["oa-cohort-count"].textContent,/49 of 49/);
for(const [cohort,count] of [["introduced",23],["resolved",21],["retained",5],["all",49]]){
 p["oa-filter"].value=cohort;
 p["oa-filter"].events.change();
 assert.equal(p["oa-target"].children.length,count);
 assert.match(p["oa-cohort-count"].textContent,new RegExp(count+" of 49"));
}
p["oa-filter"].value="not-a-cohort";p["oa-filter"].events.change();
assert.equal(p["oa-filter"].value,"all");
assert.match(p["oa-status"].textContent,/Could not change source cohort/);
assert.equal(p["oa-save"].disabled,false);
assert.equal(p["oa-restore"].disabled,false);
assert.equal(p["oa-native"].textContent,
 sources["glyphs/research/heldout-identification-target-v0.1/index-v0.1.json"].targets[0].character);
assert.match(p["oa-source"].src,/glyphs\//);
assert.match(p["oa-locator"].src,/heldout-identification-target/);
assert.match(p["oa-complement"].src,/owner-complement-locators/);
assert.match(p["oa-complement-meta"].textContent,/unverified/);
assert.notEqual(p["oa-locator"].src,p["oa-complement"].src);
assert.match(p["oa-meta"].textContent,/source paths/);
assert.equal(p["oa-grid"].style["--oa-glyph-size"],"96px");
for(const size of [16,24,32,48,64,96,128,160]){
 p["oa-size"].value=String(size);
 p["oa-size"].events.change();
 assert.equal(p["oa-grid"].style["--oa-glyph-size"],size+"px");
}
p["oa-size"].value="123";
p["oa-size"].events.change();
assert.match(p["oa-status"].textContent,/size rejected/);
assert.equal(p["oa-grid"].style["--oa-glyph-size"],"160px");
p["oa-size"].value="96";p["oa-size"].events.change();
assert.match(p["oa-count"].textContent,/0 provisional notes/);
const original=p["oa-target"].value;
p["oa-judgment"].value="provisional_support";
p["oa-rationale"].value="The original source path group is provisionally compatible with the independently referenced component form.";
p["oa-save"].events.click();
assert.match(p["oa-status"].textContent,/Note rejected/);
assert.match(p["oa-count"].textContent,/0 provisional notes/);
p["oa-evidence"].value="https://example.org/scholarly-figure";
p["oa-save"].events.click();
assert.match(p["oa-count"].textContent,/1 provisional notes/);
assert.equal(p["oa-export"].disabled,false);
p["oa-filter"].value="introduced";p["oa-filter"].events.change();
assert.equal(p["oa-target"].children.length,23);
assert.match(p["oa-count"].textContent,/1 provisional notes/);
p["oa-filter"].value="all";p["oa-filter"].events.change();
assert.match(p["oa-count"].textContent,/1 provisional notes/);
assert.equal(p["oa-target"].children.length,49);
const next=p["oa-target"].children[1].value;
p["oa-target"].value=next;
p["oa-target"].events.change();
assert.equal(p["oa-target"].value,next);
assert.equal(p["oa-native"].textContent,targetById.get(next).character);
assert.match(p["oa-count"].textContent,/1 provisional notes/);
p["oa-export"].events.click();
const result=JSON.parse(p["oa-output"].value);
assert.equal(result.session.recorded,1);
assert.equal(result.observations[0].trialId,original);
assert.equal(result.session.sourceOwnerCertifications,0);
assert.equal(result.observations[0].glyphVisualCertified,false);
assert.ok(!("reviewerName" in result.session));
const keep=JSON.stringify(result);
const corrupt=structuredClone(result);
corrupt.observations[0].glyphVisualCertified=true;
p["oa-import"].value=JSON.stringify(corrupt);
p["oa-restore"].events.click();
assert.match(p["oa-status"].textContent,/restoration rejected/);
assert.match(p["oa-count"].textContent,/1 provisional notes/);
p["oa-import"].value="{bad JSON";
p["oa-restore"].events.click();
assert.match(p["oa-status"].textContent,/restoration rejected/);
assert.match(p["oa-count"].textContent,/1 provisional notes/);
p["oa-import"].value=keep;
p["oa-restore"].events.click();
assert.match(p["oa-status"].textContent,/Restored 1 provisional source notes locally/);
assert.match(p["oa-count"].textContent,/1 provisional notes/);
assert.equal(p["oa-output"].value,"");
p["oa-export"].events.click();
assert.deepEqual(JSON.parse(p["oa-output"].value).observations,result.observations);
const empty=setup();await settle(empty);
empty["oa-import"].value=keep;
empty["oa-restore"].events.click();
assert.match(empty["oa-status"].textContent,/Restored 1 provisional source notes locally/);
empty["oa-filter"].value="retained";empty["oa-filter"].events.change();
assert.match(empty["oa-count"].textContent,/1 provisional notes/);
const altered=structuredClone(sources);
altered["glyphs/research/heldout-identification-target-v0.1/index-v0.1.json"]
 .source.ownerKeyIndependentlyVerified=true;
const invalid=setup(altered);await settle(invalid);
assert.match(invalid["oa-status"].textContent,/Cannot load or validate/);
assert.equal(invalid["oa-target"].children.length,0);
assert.equal(invalid["oa-save"].disabled,true);
assert.equal(invalid["oa-restore"].disabled,true);
assert.equal(invalid["oa-filter"].disabled,true);
assert.equal(invalid["oa-order"].disabled,true);
const changedMask=structuredClone(sources);
changedMask["glyphs/research/owner-complement-locators-v0.1/index-v0.1.json"]
 .records[0].complementarySHA256="invalid-digest";
const invalidMask=setup(changedMask);await settle(invalidMask);
assert.match(invalidMask["oa-status"].textContent,/Cannot load or validate/);
assert.equal(invalidMask["oa-target"].children.length,0);
assert.equal(invalidMask["oa-save"].disabled,true);
const html=fs.readFileSync("site/component-owner-adjudication.html","utf8");
for(const id of ids)assert.ok(html.includes('id="'+id+'"'),id);
assert.ok(html.includes('id="oa-native"'));
assert.ok(html.includes('font-size:var(--oa-glyph-size,96px)'));
assert.ok(html.includes('lang="zh-Hans"'));
assert.ok(!scripts.at(-1).includes("localStorage"));
assert.ok(!scripts.at(-1).includes("innerHTML"));
console.log("Local source-owner intake UI: 49 paired regions, independent and complementary locator displays, strict export, poisoned-source refusal.");