import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import {createHash} from "node:crypto";
const manifest=JSON.parse(fs.readFileSync(
 "site/glyphs/research/owner-masked-stimuli-v0.1/index-v0.1.json","utf8"));
const indexPath="glyphs/research/owner-masked-stimuli-v0.1/index-v0.1.json";
const scripts=["site/source-owner-masked-preview-core.js",
 "site/source-owner-masked-preview.js"].map(p=>fs.readFileSync(p,"utf8"));
const ids=["om-status","om-cohort","om-pair","om-size","om-count","om-meta",
 "om-grid","om-native","om-a","om-b","om-a-form","om-b-form",
 "om-prev","om-next","om-position"];
const bytes=new Map(manifest.records.flatMap(r=>r.candidates.map(c=>
 [c.svg,fs.readFileSync("site/"+c.svg)])));
class Element{
 constructor(){
  this.value="";this.textContent="";this.src="";this.children=[];this.events={};
  this.disabled=false;this.style={setProperty:(name,value)=>{this.style[name]=value;}};
 }
 appendChild(x){this.children.push(x);return x;}
 replaceChildren(...nodes){this.children=nodes;}
 addEventListener(name,fn){this.events[name]=fn;}
 removeAttribute(name){if(name==="src")this.src="";}
}
async function flush(){for(let i=0;i<120;i++)await Promise.resolve();}
function setup({source=manifest,hash="",assets=bytes,withCrypto=true}={}){
 const nodes=Object.fromEntries(ids.map(id=>[id,new Element()]));
 nodes["om-size"].value="96";nodes["om-cohort"].value="all";
 for(const id of ["om-cohort","om-pair","om-prev","om-next"])nodes[id].disabled=true;
 const fetched=[],objectURLs=new Map(),revoked=[],delayed=new Map();
 let count=0;
 class MockBlob{
  constructor(parts,opts){this.parts=parts;this.type=opts.type;}
 }
 const MockURL={
  createObjectURL(b){assert.equal(b.type,"image/svg+xml");
   const ref="blob:verified-mask-"+(++count);objectURLs.set(ref,b);return ref;},
  revokeObjectURL(ref){assert.ok(objectURLs.has(ref),"Only allocated object URLs revoked");
   revoked.push(ref);objectURLs.delete(ref);}
 };
 const crypto={subtle:{
  digest:async (algorithm,array)=>{
   assert.equal(algorithm,"SHA-256");
   return Uint8Array.from(createHash("sha256").update(Buffer.from(array)).digest()).buffer;
  }
 }};
 const fetch=async url=>{
  fetched.push(url);
  if(url===indexPath)return {ok:true,json:async()=>source};
  assert.ok(assets.has(url),"Viewer must only fetch key-reduced masks");
  return {ok:true,arrayBuffer:async()=>{
   if(delayed.has(url))return delayed.get(url).promise;
   return Uint8Array.from(assets.get(url)).buffer;
  }};
 };
 const document={getElementById:id=>nodes[id],createElement:()=>new Element()};
 const ctx={document,fetch,URL:MockURL,Blob:MockBlob,Map,Set,Number,Error,
  location:{hash},crypto:withCrypto?crypto:undefined};
 ctx.globalThis=ctx;
 for(const s of scripts)vm.runInNewContext(s,ctx);
 return {nodes,fetched,objectURLs,revoked,delayed};
}
async function loaded(session){
 for(let i=0;i<200&&!session.nodes["om-cohort"].disabled&&false;i++)await Promise.resolve();
 await flush();
}
function assertImages(session,row){
 const p=session.nodes;
 const urls=[p["om-a"].src,p["om-b"].src];
 assert.equal(urls.length,2);
 for(const [index,url] of urls.entries()){
  assert.match(url,/^blob:verified-mask-/);
  const blob=session.objectURLs.get(url);
  assert.ok(blob,"Verified image must own a live object URL");
  const content=Buffer.from(blob.parts[0]);
  const digest=createHash("sha256").update(content).digest("hex");
  assert.equal(digest,row.candidates[index].sha256);
 }
 assert.equal(session.objectURLs.size,2,"Only two masks should remain allocated");
 assert.match(p["om-status"].textContent,/Two SHA-256-verified/);
}
const state=setup();await loaded(state);
const p=state.nodes;
assert.equal(p["om-pair"].children.length,49);
assert.equal(p["om-cohort"].disabled,false);
assert.equal(p["om-pair"].disabled,false);
assert.equal(p["om-grid"].style["--om-glyph-size"],"96px");
assert.deepEqual(state.fetched.slice(0,3),
 [indexPath,...manifest.records[0].candidates.map(c=>c.svg)]);
assertImages(state,manifest.records[0]);
assert.equal(p["om-prev"].disabled,true);
assert.equal(p["om-next"].disabled,false);
p["om-next"].events.click();await flush();
assert.equal(p["om-pair"].value,manifest.records[1].id);
assertImages(state,manifest.records[1]);
assert.equal(p["om-prev"].disabled,false);
p["om-prev"].events.click();await flush();
assert.equal(p["om-pair"].value,manifest.records[0].id);
assert.equal(p["om-prev"].disabled,true);
for(const row of manifest.records){
 p["om-pair"].value=row.id;p["om-pair"].events.change();
 await flush();
 assert.equal(p["om-native"].textContent,row.character);
 assert.equal(p["om-a-form"].textContent,"Source component form: "+row.candidates[0].form);
 assert.equal(p["om-b-form"].textContent,"Source component form: "+row.candidates[1].form);
 assert.ok(!p["om-meta"].textContent.includes("cmp-"));
 assert.match(p["om-meta"].textContent,/0 independently adjudicated owners/);
 assertImages(state,row);
}
assert.ok(state.revoked.length>=98,"Old mask URLs must be released on each selection");
for(const [cohort,count] of [["introduced",23],["resolved",21],["retained",5],["all",49]]){
 p["om-cohort"].value=cohort;p["om-cohort"].events.change();await flush();
 assert.equal(p["om-pair"].children.length,count);
 assert.match(p["om-count"].textContent,new RegExp(count+" of 49"));
 assert.match(p["om-position"].textContent,new RegExp("[0-9]+ of "+count));
 for(let i=0;i<count;i++)p["om-prev"].events.click();
 await flush();
 assert.equal(p["om-pair"].value,p["om-pair"].children[0].value);
 assert.equal(p["om-prev"].disabled,true);
 for(let i=1;i<count;i++)p["om-next"].events.click();
 await flush();
 assert.equal(p["om-pair"].value,p["om-pair"].children[count-1].value);
 assert.equal(p["om-next"].disabled,true);
 const last=p["om-pair"].value;p["om-next"].events.click();
 assert.equal(p["om-pair"].value,last);
 p["om-prev"].events.click();await flush();
 assert.equal(p["om-pair"].value,p["om-pair"].children[count-2].value);
}
p["om-cohort"].value="not-a-cohort";p["om-cohort"].events.change();
assert.equal(p["om-cohort"].value,"all");
assert.match(p["om-status"].textContent,/Cohort rejected/);
for(const s of [16,24,32,48,64,96,128,160]){
 p["om-size"].value=String(s);p["om-size"].events.change();
 assert.equal(p["om-grid"].style["--om-glyph-size"],s+"px");
}
p["om-size"].value="400";p["om-size"].events.change();
assert.match(p["om-status"].textContent,/Size rejected/);
assert.equal(p["om-grid"].style["--om-glyph-size"],"160px");
const anchored=setup({hash:"#"+manifest.records[21].id});await loaded(anchored);
assert.equal(anchored.nodes["om-pair"].value,manifest.records[21].id);
assertImages(anchored,manifest.records[21]);
const ignored=setup({hash:"#../invalid"});await loaded(ignored);
assert.equal(ignored.nodes["om-pair"].value,manifest.records[0].id);
const corrupted=structuredClone(manifest);
corrupted.records[0].candidates[0].componentId="cmp-0001";
const invalid=setup({source:corrupted});await loaded(invalid);
assert.equal(invalid.nodes["om-pair"].children.length,0);
assert.equal(invalid.nodes["om-cohort"].disabled,true);
assert.equal(invalid.nodes["om-prev"].disabled,true);
assert.equal(invalid.objectURLs.size,0);
assert.match(invalid.nodes["om-status"].textContent,/Source-region presentation unavailable/);
const noCrypto=setup({withCrypto:false});await loaded(noCrypto);
assert.equal(noCrypto.objectURLs.size,0);
assert.equal(noCrypto.nodes["om-a"].src,"");
assert.match(noCrypto.nodes["om-status"].textContent,/Region display blocked/);
const modified=new Map(bytes);
const badPath=manifest.records[4].candidates[1].svg;
modified.set(badPath,Buffer.concat([modified.get(badPath),Buffer.from("tamper")]));
const mismatch=setup({assets:modified});await loaded(mismatch);
mismatch.nodes["om-pair"].value=manifest.records[4].id;
mismatch.nodes["om-pair"].events.change();await flush();
assert.equal(mismatch.nodes["om-a"].src,"");
assert.equal(mismatch.nodes["om-b"].src,"");
assert.equal(mismatch.objectURLs.size,0);
assert.match(mismatch.nodes["om-status"].textContent,/SHA-256 mismatch/);
mismatch.nodes["om-pair"].value=manifest.records[5].id;
mismatch.nodes["om-pair"].events.change();await flush();
assertImages(mismatch,manifest.records[5]);
const race=setup();await loaded(race);
const blocked=manifest.records[7].candidates[0].svg;
let resolveBlocked;
const promise=new Promise(resolve=>{resolveBlocked=resolve;});
race.delayed.set(blocked,{promise});
race.nodes["om-pair"].value=manifest.records[7].id;
race.nodes["om-pair"].events.change();
await flush();
assert.equal(race.nodes["om-a"].src,"");
race.nodes["om-pair"].value=manifest.records[8].id;
race.nodes["om-pair"].events.change();await flush();
assertImages(race,manifest.records[8]);
const current=race.nodes["om-a"].src;
resolveBlocked(Uint8Array.from(bytes.get(blocked)).buffer);
await flush();
assert.equal(race.nodes["om-a"].src,current,"Stale asset must not replace newer verified selection");
assertImages(race,manifest.records[8]);
const html=fs.readFileSync("site/source-owner-masked-preview.html","utf8");
for(const id of ids)assert.ok(html.includes('id="'+id+'"'),id);
for(const expected of ["not a blinded expert-review instrument","records no judgments",
 "original public source manifests","source-owner-masked-preview-core.js"])
 assert.ok(html.toLowerCase().includes(expected.toLowerCase()),expected);
const pageJS=scripts.at(-1);
for(const forbidden of ["localStorage","sessionStorage","navigator.sendBeacon",
 "document.cookie","innerHTML","XMLHttpRequest","machineAssignedOwner",
 "otherOwner","heldout-identification-target-v0.1/index-v0.1.json"])
 assert.equal(pageJS.includes(forbidden),false,forbidden);
assert.ok(!html.includes("<form")&&!html.includes('type="submit"'));
console.log("49 source-pair SHA-256-verified browser masks; corrupted SVG and missing crypto blocked; stale navigation discarded; object URLs revoked; 23/21/5 cohorts.");
