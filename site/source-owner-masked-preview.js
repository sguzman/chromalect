/* Presentation-masked, non-collecting source-region rehearsal.
 * Public manifests include the machine answer key; no true blinding is claimed.
 */
(() => {
"use strict";
const preview=globalThis.ChromalectMaskedSourcePreview;
const neutralSVG=globalThis.ChromalectNeutralRegionSVG;
const $=id=>document.getElementById(id);
const ids=["om-status","om-cohort","om-pair","om-size","om-count","om-meta",
 "om-grid","om-native","om-a","om-b","om-a-form","om-b-form",
 "om-prev","om-next","om-position"];
if(ids.some(id=>!$(id)))return;
const statuses=new Set(["all","introduced","resolved","retained"]);
const sizes=new Set([16,24,32,48,64,96,128,160]);
let targets=[],activeCohort="all",selected=null,visibleIds=[];
let requestVersion=0,objectURLs=[],activeController=null;
const verifiedMaskCache=new Map();
const MAX_VERIFIED_MASKS=24; // 24 MiB maximum given the 1 MiB per-SVG cap.
const MAX_MASK_BYTES=1048576;
// Browser fetch bodies must be consumed with a hard incremental byte bound.
// Do not buffer an untrusted full response before checking its size.
async function readBoundedMask(response,signal){
 const header=response.headers?.get?.("content-length");
 if(header!==null&&header!==undefined&&/^\d+$/.test(header)&&
  Number(header)>MAX_MASK_BYTES)
  throw Error("Neutral source SVG size outside safe bounds");
 if(!response.body||typeof response.body.getReader!=="function")
  throw Error("Bounded neutral SVG streaming unavailable");
 const reader=response.body.getReader(),chunks=[];
 let total=0;
 try{
  while(true){
   if(signal?.aborted)throw Error("Superseded source-region request");
   const result=await reader.read();
   if(signal?.aborted)throw Error("Superseded source-region request");
   if(result.done)break;
   const part=result.value;
   if(!ArrayBuffer.isView(part)||part.BYTES_PER_ELEMENT!==1)
    throw Error("Invalid neutral SVG download chunk");
   total+=part.byteLength;
   if(total>MAX_MASK_BYTES)
    throw Error("Neutral source SVG size outside safe bounds");
   chunks.push(new Uint8Array(part.buffer,part.byteOffset,part.byteLength));
  }
  if(total===0)throw Error("Neutral source SVG size outside safe bounds");
  const bytes=new Uint8Array(total);
  let offset=0;
  for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}
  return bytes.buffer;
 }catch(e){
  try{await reader.cancel();}catch{}
  throw e;
 }finally{reader.releaseLock();}
}
const message=s=>{$("om-status").textContent=s;};
function applySize(){
 const s=Number($("om-size").value);
 if(!sizes.has(s))throw Error("Invalid reading-size control");
 $("om-grid").style.setProperty("--om-glyph-size",s+"px");
}
function updateNavigation(){
 const index=visibleIds.indexOf(selected);
 $("om-prev").disabled=index<=0;
 $("om-next").disabled=index<0||index>=visibleIds.length-1;
 $("om-position").textContent=index<0?"No pair selected.":
  (index+1)+" of "+visibleIds.length+" in selected warning cohort";
}
function retireImages(){
 for(const objectURL of objectURLs)URL.revokeObjectURL(objectURL);
 objectURLs=[];
 $("om-a").removeAttribute("src");
 $("om-b").removeAttribute("src");
}
function failImageDecode(event){
 // A browser decoder error is not an expert review observation.
 const current=event?.target?.src;
 if(!current||!objectURLs.includes(current))return;
 retireImages();
 message("Region display blocked: browser could not render a verified neutral mask. Both images cleared; no visual or owner approval recorded.");
}
$("om-a").addEventListener("error",failImageDecode);
$("om-b").addEventListener("error",failImageDecode);
async function fetchVerifiedMask(candidate,sourceStrokePaths,signal){
 if(!globalThis.crypto?.subtle?.digest||!URL.createObjectURL||!URL.revokeObjectURL)
  throw Error("Browser SHA-256 or verified-image display unavailable");
 if(!neutralSVG?.validate||typeof TextDecoder!=="function")
  throw Error("Neutral SVG safety validator unavailable");
 const checkSVG=bytes=>neutralSVG.validate(
  new TextDecoder("utf-8",{fatal:true}).decode(bytes),
  sourceStrokePaths,candidate.highlightedPaths);
 if(signal?.aborted)throw Error("Superseded source-region request");
 const previous=verifiedMaskCache.get(candidate.svg);
 if(previous&&previous.sha256===candidate.sha256){
  checkSVG(previous.bytes);
  verifiedMaskCache.delete(candidate.svg);
  verifiedMaskCache.set(candidate.svg,previous);
  return previous.bytes;
 }
 const response=await fetch(candidate.svg,signal?{signal}:undefined);
 if(!response.ok)throw Error("Neutral source SVG unavailable");
 const buffer=await readBoundedMask(response,signal);
 const digest=await crypto.subtle.digest("SHA-256",buffer);
 const actual=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,"0")).join("");
 if(actual!==candidate.sha256)throw Error("Neutral source SVG SHA-256 mismatch");
 checkSVG(buffer);
 if(signal?.aborted)throw Error("Superseded source-region request");
 verifiedMaskCache.delete(candidate.svg);
 verifiedMaskCache.set(candidate.svg,{sha256:actual,bytes:buffer});
 while(verifiedMaskCache.size>MAX_VERIFIED_MASKS)
  verifiedMaskCache.delete(verifiedMaskCache.keys().next().value);
 return buffer;
}
async function selectPair(id){
 const target=targets.find(x=>x.id===id);
 if(!target)throw Error("Masked source-region pair unavailable");
 const [a,b]=target.candidates;
 const version=++requestVersion;
 if(activeController)activeController.abort();
 activeController=typeof AbortController==="function"?new AbortController():null;
 const signal=activeController?.signal;
 selected=id;
 $("om-pair").value=id;
 retireImages();
 $("om-native").textContent=target.character;
 $("om-a-form").textContent="Source component form: "+a.form;
 $("om-b-form").textContent="Source component form: "+b.form;
 $("om-meta").textContent="Source pair "+target.rank+" · "+target.character+
  " · warning cohort "+target.reviewState+" · two provisional source regions · "+
  "0 independently adjudicated owners.";
 updateNavigation();
 message("Checking both neutral SVG SHA-256 digests before display.");
 try{
  const verified=await Promise.all(target.candidates.map(c=>fetchVerifiedMask(c,target.sourceStrokePaths,signal)));
  if(version!==requestVersion)return;
  const urls=[];
  try{
   for(const bytes of verified)
    urls.push(URL.createObjectURL(new Blob([bytes],{type:"image/svg+xml"})));
  }catch(e){
   for(const url of urls)URL.revokeObjectURL(url);
   throw e;
  }
  if(version!==requestVersion){
   for(const url of urls)URL.revokeObjectURL(url);
   return;
  }
  objectURLs=urls;
  $("om-a").src=urls[0];
  $("om-b").src=urls[1];
  message("Two SHA-256-verified neutral region masks displayed; no independent owner certification.");
 }catch(e){
  if(version!==requestVersion)return;
  retireImages();
  message("Region display blocked: "+e.message+". No unverified SVG displayed.");
 }
}
function showCohort(cohort,preferredId=null){
 if(!statuses.has(cohort))throw Error("Unrecognized warning cohort");
 const rows=targets.filter(x=>cohort==="all"||x.reviewState===cohort);
 if(!rows.length)throw Error("No source-owned warning pairs");
 visibleIds=rows.map(x=>x.id);
 $("om-pair").replaceChildren();
 for(const x of rows){
  const option=document.createElement("option");
  option.value=x.id;
  option.textContent="#"+x.rank+" · "+x.character+" · "+x.id;
  $("om-pair").appendChild(option);
 }
 $("om-count").textContent=rows.length+" of 49 source-pair presentations · "+
  "0 certified components";
 activeCohort=cohort;
 return selectPair(rows.find(x=>x.id===preferredId)?.id||rows[0].id);
}
async function load(){
 try{
  if(!preview)throw Error("Neutral mask validator missing");
  const source="glyphs/research/owner-masked-stimuli-v0.1/index-v0.1.json";
  const response=await fetch(source);
  if(!response.ok)throw Error("Key-separated source stimuli unavailable");
  targets=preview.validate(await response.json());
  applySize();
  const fragment=globalThis.location?.hash?.slice(1)||"";
  await showCohort("all",targets.find(t=>t.id===fragment)?.id);
  $("om-cohort").disabled=false;$("om-pair").disabled=false;
 }catch(e){
  ++requestVersion;
  if(activeController)activeController.abort();
  retireImages();
  $("om-cohort").disabled=true;$("om-pair").disabled=true;
  $("om-prev").disabled=true;$("om-next").disabled=true;
  message("Source-region presentation unavailable: "+e.message);
 }
}
$("om-cohort").addEventListener("change",()=>{
 try{
  void showCohort($("om-cohort").value,selected);
 }catch(e){
  $("om-cohort").value=activeCohort;
  message("Cohort rejected: "+e.message);
 }
});
$("om-pair").addEventListener("change",()=>{
 try{
  void selectPair($("om-pair").value);
 }catch(e){
  if(selected)$("om-pair").value=selected;
  message("Source pair rejected: "+e.message);
 }
});
function move(offset){
 const index=visibleIds.indexOf(selected),next=visibleIds[index+offset];
 if(index<0||!next)return;
 void selectPair(next);
}
$("om-prev").addEventListener("click",()=>move(-1));
$("om-next").addEventListener("click",()=>move(1));
// Navigation is a non-collecting convenience and preserves native control keys.
document.addEventListener("keydown",event=>{
 if(event.defaultPrevented||event.altKey||event.ctrlKey||event.metaKey||
  (event.key!=="ArrowLeft"&&event.key!=="ArrowRight"))return;
 if(event.target?.closest?.("input,select,textarea,button,a,[contenteditable]"))return;
 const index=visibleIds.indexOf(selected);
 if(index<0)return;
 const offset=event.key==="ArrowLeft"?-1:1;
 if(index+offset<0||index+offset>=visibleIds.length)return;
 event.preventDefault();
 move(offset);
});
$("om-size").addEventListener("change",()=>{
 try{applySize();message("Matched glyph size changed; no human visual result.");}
 catch(e){message("Size rejected: "+e.message);}
});
load();
})();