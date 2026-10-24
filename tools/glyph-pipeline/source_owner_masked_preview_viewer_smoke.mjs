import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import {createHash} from "node:crypto";
const manifest=JSON.parse(fs.readFileSync(
 "site/glyphs/research/owner-masked-stimuli-v0.1/index-v0.1.json","utf8"));
const indexPath="glyphs/research/owner-masked-stimuli-v0.1/index-v0.1.json";
const scripts=["site/source-owner-neutral-svg-contract.js",
 "site/source-owner-masked-preview-core.js",
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
function setup({source=manifest,hash="",assets=bytes,withCrypto=true,
 streamChunkSize=Number.MAX_SAFE_INTEGER,streamMode="normal"}={}){
 const nodes=Object.fromEntries(ids.map(id=>[id,new Element()]));
 nodes["om-size"].value="96";nodes["om-cohort"].value="all";
 for(const id of ["om-cohort","om-pair","om-prev","om-next"])nodes[id].disabled=true;
 const fetched=[],objectURLs=new Map(),revoked=[],delayed=new Map(),abortEvents=[];
 const streamStats={reads:0,cancels:0,closed:0};
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
 class MockAbortController{
  constructor(){
   const listeners=[];
   this.signal={aborted:false,
    addEventListener:(event,cb)=>{if(event==="abort")listeners.push(cb);}
   };
   this.listeners=listeners;
  }
  abort(){
   if(this.signal.aborted)return;
   this.signal.aborted=true;abortEvents.push(this.signal);
   for(const cb of this.listeners)cb();
  }
 }
 const fetch=async (url,opts)=>{
  fetched.push(url);
  if(url===indexPath)return {ok:true,json:async()=>source};
  assert.ok(assets.has(url),"Viewer must only fetch key-reduced masks");
  assert.ok(opts?.signal,"All SVG fetches must receive cancellation signals");
  const payload=assets.get(url);
  if(streamMode==="no-stream")return {ok:true,headers:{get:()=>null}};
  const header=streamMode==="oversized-header"?
   String(1048577):streamMode==="no-length"?null:String(payload.byteLength);
  return {ok:true,headers:{get:name=>name==="content-length"?header:null},
   body:{getReader(){
    let content=null,index=0,canceled=false;
    async function bytes(){
     if(content!==null)return content;
     if(opts.signal.aborted)throw Error("AbortError");
     if(delayed.has(url)){
      const awaited=await new Promise((resolve,reject)=>{
       opts.signal.addEventListener("abort",()=>reject(Error("AbortError")));
       delayed.get(url).promise.then(resolve,reject);
      });
      content=new Uint8Array(awaited);
     }else content=Uint8Array.from(payload);
     return content;
    }
    return {
     async read(){
      streamStats.reads++;
      if(canceled)return {done:true};
      const data=await bytes();
      if(opts.signal.aborted)throw Error("AbortError");
      if(index>=data.byteLength)return {done:true};
      const next=Math.min(data.byteLength,index+streamChunkSize);
      const value=data.subarray(index,next);
      index=next;
      return {done:false,value};
     },
     async cancel(){canceled=true;streamStats.cancels++;},
     releaseLock(){streamStats.closed++;}
    };
   }}};
 };
 const keyListeners={};
 const document={getElementById:id=>nodes[id],createElement:()=>new Element(),
  addEventListener:(name,cb)=>{keyListeners[name]=cb;}};
 const ctx={document,fetch,URL:MockURL,Blob:MockBlob,AbortController:MockAbortController,
  Map,Set,Number,Error,TextDecoder,location:{hash},crypto:withCrypto?crypto:undefined};
 ctx.globalThis=ctx;
 for(const s of scripts)vm.runInNewContext(s,ctx);
 return {nodes,fetched,objectURLs,revoked,delayed,abortEvents,keyListeners,streamStats};
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
assert.equal(typeof state.keyListeners.keydown,"function");
function keyOf(session,key,{target=null,altKey=false,ctrlKey=false,
 metaKey=false,defaultPrevented=false}={}){
 let canceled=false;
 session.keyListeners.keydown({
  key,target,altKey,ctrlKey,metaKey,defaultPrevented,
  preventDefault(){canceled=true;}
 });
 return canceled;
}
assert.equal(keyOf(state,"ArrowLeft"),false,"Do not wrap before first pair");
for(const key of ["ArrowRight","ArrowLeft"]){
 assert.equal(keyOf(state,key,{ctrlKey:true}),false);
 assert.equal(keyOf(state,key,{altKey:true}),false);
 assert.equal(keyOf(state,key,{metaKey:true}),false);
 assert.equal(keyOf(state,key,{defaultPrevented:true}),false);
 assert.equal(keyOf(state,key,{target:{closest:()=>({})}}),false);
}
assert.equal(p["om-pair"].value,manifest.records[0].id);
assert.equal(keyOf(state,"ArrowRight"),true);
await flush();
assert.equal(p["om-pair"].value,manifest.records[1].id);
assertImages(state,manifest.records[1]);
assert.equal(keyOf(state,"ArrowLeft"),true);
await flush();
assert.equal(p["om-pair"].value,manifest.records[0].id);
assertImages(state,manifest.records[0]);
assert.equal(keyOf(state,"Space"),false);
p["om-next"].events.click();await flush();
assert.equal(p["om-pair"].value,manifest.records[1].id);
assertImages(state,manifest.records[1]);
assert.equal(p["om-prev"].disabled,false);
const seenBeforeReturn=state.fetched.length;
p["om-prev"].events.click();await flush();
assert.equal(p["om-pair"].value,manifest.records[0].id);
assert.equal(p["om-prev"].disabled,true);
assert.equal(state.fetched.length,seenBeforeReturn,
 "Returning to a recently verified region must not refetch its two SVGs");
assert.ok(state.abortEvents.length>=2,
 "Navigation should abort superseded requests even when already settled");
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
const latestPair=manifest.records[48];
const fetchBeforeRecentVisit=state.fetched.length;
p["om-pair"].value=latestPair.id;p["om-pair"].events.change();await flush();
assertImages(state,latestPair);
assert.equal(state.fetched.length,fetchBeforeRecentVisit,
 "Most recently verified mask bytes must remain in the bounded LRU cache");
const fetchBeforeOldVisit=state.fetched.length;
p["om-pair"].value=manifest.records[0].id;p["om-pair"].events.change();await flush();
assertImages(state,manifest.records[0]);
assert.equal(state.fetched.length,fetchBeforeOldVisit+2,
 "An evicted older pair must be fetched and verified again");
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
const decodeFailure=setup();await loaded(decodeFailure);
assertImages(decodeFailure,manifest.records[0]);
assert.ok(typeof decodeFailure.nodes["om-b"].events.error==="function");
decodeFailure.nodes["om-b"].events.error({
 target:decodeFailure.nodes["om-b"]
});
assert.equal(decodeFailure.nodes["om-a"].src,"");
assert.equal(decodeFailure.nodes["om-b"].src,"");
assert.equal(decodeFailure.objectURLs.size,0);
assert.match(decodeFailure.nodes["om-status"].textContent,/browser could not render/);
assert.match(decodeFailure.nodes["om-status"].textContent,/no visual or owner approval/);
decodeFailure.nodes["om-a"].events.error({
 target:decodeFailure.nodes["om-a"]
});
assert.equal(decodeFailure.objectURLs.size,0,
 "Stale decoding errors must not reopen or restore revoked objects");
decodeFailure.nodes["om-next"].events.click();await flush();
assertImages(decodeFailure,manifest.records[1]);
const tinyChunks=setup({streamChunkSize:256});
await loaded(tinyChunks);
assertImages(tinyChunks,manifest.records[0]);
assert.ok(tinyChunks.streamStats.reads>4,
 "Multiple streamed SVG chunks must reassemble into exact verified bytes");
assert.equal(tinyChunks.streamStats.cancels,0);
const oversizedHeader=setup({streamMode:"oversized-header"});
await loaded(oversizedHeader);
assert.equal(oversizedHeader.objectURLs.size,0);
assert.equal(oversizedHeader.streamStats.reads,0,
 "Oversized Content-Length must be rejected before opening the body");
assert.match(oversizedHeader.nodes["om-status"].textContent,/size outside safe bounds/);
const noStream=setup({streamMode:"no-stream"});
await loaded(noStream);
assert.equal(noStream.objectURLs.size,0);
assert.match(noStream.nodes["om-status"].textContent,/streaming unavailable/);
const tooLong=new Map(bytes);
const oversizePath=manifest.records[0].candidates[0].svg;
tooLong.set(oversizePath,Buffer.alloc(1048577,42));
const oversizedBody=setup({assets:tooLong,streamChunkSize:65536});
await loaded(oversizedBody);
assert.equal(oversizedBody.objectURLs.size,0);
assert.equal(oversizedBody.streamStats.reads,0,
 "Accurate oversized Content-Length must prevent body buffering");
const hiddenSize=setup({assets:tooLong,streamMode:"no-length",streamChunkSize:65536});
await loaded(hiddenSize);
assert.equal(hiddenSize.objectURLs.size,0);
assert.match(hiddenSize.nodes["om-status"].textContent,/size outside safe bounds/);
assert.ok(hiddenSize.streamStats.cancels>=1,
 "Oversized chunked downloads must cancel readers on overflow");
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
// Checksum agreement alone must not permit active SVG content to be displayed.
const injected=structuredClone(manifest),injectedAssets=new Map(bytes);
const hostilePath=injected.records[0].candidates[0].svg;
const hostile=Buffer.from(
 injectedAssets.get(hostilePath).toString("utf8").replace(
  "</g>","<script>alert(1)</script></g>"),"utf8");
injectedAssets.set(hostilePath,hostile);
injected.records[0].candidates[0].sha256=
 createHash("sha256").update(hostile).digest("hex");
const blockedSVG=setup({source:injected,assets:injectedAssets});await loaded(blockedSVG);
assert.equal(blockedSVG.nodes["om-a"].src,"");
assert.equal(blockedSVG.nodes["om-b"].src,"");
assert.equal(blockedSVG.objectURLs.size,0);
assert.match(blockedSVG.nodes["om-status"].textContent,/Region display blocked: Neutral SVG/);
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
assert.ok(race.abortEvents.some(signal=>signal.aborted),
 "Pending older pair must have received a real AbortController cancellation");
const current=race.nodes["om-a"].src;
resolveBlocked(Uint8Array.from(bytes.get(blocked)).buffer);
await flush();
assert.equal(race.nodes["om-a"].src,current,"Stale asset must not replace newer verified selection");
assertImages(race,manifest.records[8]);
const html=fs.readFileSync("site/source-owner-masked-preview.html","utf8");
for(const id of ids)assert.ok(html.includes('id="'+id+'"'),id);
assert.ok(html.includes('http-equiv="Content-Security-Policy"'));
for(const directive of ["default-src 'none'","script-src 'self'",
 "img-src 'self' blob:","connect-src 'self'","object-src 'none'",
 "frame-src 'none'","base-uri 'none'","form-action 'none'"]){
 assert.ok(html.includes(directive),"Missing presentation-page CSP policy: "+directive);
}
for(const expected of ["not a blinded expert-review instrument","records no judgments",
 "original public source manifests","source-owner-masked-preview-core.js"])
 assert.ok(html.toLowerCase().includes(expected.toLowerCase()),expected);
const pageJS=scripts.at(-1);
assert.ok(html.includes('src="source-owner-neutral-svg-contract.js"'));
assert.ok(pageJS.includes("checkSVG(buffer)"));
assert.ok(pageJS.includes("checkSVG(previous.bytes)"));
assert.ok(pageJS.includes("readBoundedMask(response,signal)"));
assert.equal(pageJS.includes("response.arrayBuffer()"),false);
for(const forbidden of ["localStorage","sessionStorage","navigator.sendBeacon",
 "document.cookie","innerHTML","XMLHttpRequest","machineAssignedOwner",
 "otherOwner","heldout-identification-target-v0.1/index-v0.1.json"])
 assert.equal(pageJS.includes(forbidden),false,forbidden);
assert.ok(!html.includes("<form")&&!html.includes('type="submit"'));
console.log("49 source-pair browser masks SHA-256 and structurally verified; matching-hash active SVG content blocked; stale navigation canceled; verified-mask cache and cohort boundaries checked.");
