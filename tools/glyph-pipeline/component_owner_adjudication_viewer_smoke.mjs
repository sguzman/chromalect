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
const ids=["oa-status","oa-target","oa-meta","oa-source","oa-locator","oa-fold",
 "oa-owner","oa-complement","oa-complement-meta","oa-judgment","oa-evidence","oa-rationale","oa-save","oa-count",
 "oa-export","oa-output"];
class Element{
 constructor(){this.value="";this.textContent="";this.children=[];this.events={};this.disabled=false;this.src="";}
 appendChild(node){this.children.push(node);return node;}
 addEventListener(type,handler){this.events[type]=handler;}
}
function setup(data=sources){
 const nodes=Object.fromEntries(ids.map(id=>[id,new Element()]));
 for(const id of ["oa-target","oa-save","oa-export"])nodes[id].disabled=true;
 nodes["oa-judgment"].value="unresolved";
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
assert.equal(p["oa-save"].disabled,false);
assert.match(p["oa-source"].src,/glyphs\//);
assert.match(p["oa-locator"].src,/heldout-identification-target/);
assert.match(p["oa-complement"].src,/owner-complement-locators/);
assert.match(p["oa-complement-meta"].textContent,/unverified/);
assert.notEqual(p["oa-locator"].src,p["oa-complement"].src);
assert.match(p["oa-meta"].textContent,/source paths/);
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
const next=p["oa-target"].children[1].value;
p["oa-target"].value=next;
p["oa-target"].events.change();
assert.equal(p["oa-target"].value,next);
assert.match(p["oa-count"].textContent,/1 provisional notes/);
p["oa-export"].events.click();
const result=JSON.parse(p["oa-output"].value);
assert.equal(result.session.recorded,1);
assert.equal(result.observations[0].trialId,original);
assert.equal(result.session.sourceOwnerCertifications,0);
assert.equal(result.observations[0].glyphVisualCertified,false);
assert.ok(!("reviewerName" in result.session));
const altered=structuredClone(sources);
altered["glyphs/research/heldout-identification-target-v0.1/index-v0.1.json"]
 .source.ownerKeyIndependentlyVerified=true;
const invalid=setup(altered);await settle(invalid);
assert.match(invalid["oa-status"].textContent,/Cannot load or validate/);
assert.equal(invalid["oa-target"].children.length,0);
assert.equal(invalid["oa-save"].disabled,true);
const changedMask=structuredClone(sources);
changedMask["glyphs/research/owner-complement-locators-v0.1/index-v0.1.json"]
 .records[0].complementarySHA256="invalid-digest";
const invalidMask=setup(changedMask);await settle(invalidMask);
assert.match(invalidMask["oa-status"].textContent,/Cannot load or validate/);
assert.equal(invalidMask["oa-target"].children.length,0);
assert.equal(invalidMask["oa-save"].disabled,true);
const html=fs.readFileSync("site/component-owner-adjudication.html","utf8");
for(const id of ids)assert.ok(html.includes('id="'+id+'"'),id);
assert.ok(!scripts.at(-1).includes("localStorage"));
assert.ok(!scripts.at(-1).includes("innerHTML"));
console.log("Local source-owner intake UI: 49 paired regions, independent and complementary locator displays, strict export, poisoned-source refusal.");