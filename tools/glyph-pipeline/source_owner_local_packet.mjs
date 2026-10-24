// Explicit local-only key-separated packet preparation for future review design.
// No independent review authorization, observations or certifications are created.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {createHash,randomBytes,randomInt} from "node:crypto";
import {pathToFileURL} from "node:url";
import {deriveMaskedStimuli} from "./source_owner_masked_stimuli.mjs";
import {requireOutsideRepository,readPinnedSiteFile} from "./source_owner_local_paths.mjs";
import "../../site/source-owner-neutral-svg-contract.js";
import {buildOfflinePacketReceipt,RECEIPT_FILE}
 from "./source_owner_local_receipt.mjs";

const TARGET="glyphs/research/heldout-identification-target-v0.1/index-v0.1.json";
const ID=/^p-[0-9a-f]{32}$/;
const encode=x=>JSON.stringify(x,null,2)+"\n";
export const publicREADME=`# Neutral component-region packet preparation

This file set contains 49 provisional Chinese source-region presentations,
with two machine-derived neutral masks each. Packet identifiers are randomized
and do not directly encode source component IDs. The private coordinator map
is deliberately not included.

These candidate masks derive from the same existing source interpretation,
not independently confirmed decompositions. The packet is not a validated
blinded reviewer instrument, has no participant instructions or consent
workflow, and records no completed review or approval. Source-owner decisions,
independence, ethics, privacy and study eligibility remain unresolved.

The two masks for a packet have matching glyph path coordinates and grayscale
fills. They are candidates for prospective protocol development only.
`;

function escapeHTML(value){
 return String(value).replace(/[&<>"']/g,c=>
  ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
export function renderOfflinePacketGallery(manifest){
 assert.equal(manifest.schema,"chromalect.glyph.local-keyless-packet.v0.1");
 assert.equal(manifest.summary.pairs,49);
 assert.equal(manifest.records.length,49);
 const cards=manifest.records.map((r,i)=>{
  assert.match(r.packetId,ID);
  assert.equal(r.candidates.length,2);
  const regions=r.candidates.map(c=>{
   assert.match(c.file,new RegExp("^masks/"+r.packetId+"--[AB][.]svg$"));
   return '<figure><div class="mask"><img loading="lazy" alt="Unverified neutral source region '+
    escapeHTML(c.slot)+'" src="'+escapeHTML(c.file)+'"></div>'+
    '<figcaption>Region '+escapeHTML(c.slot)+' · '+escapeHTML(c.form)+'</figcaption></figure>';
  }).join("");
  return '<article class="pair"><h2>Pair '+(i+1)+' of 49</h2>'+
   '<div class="row"><div class="native"><span lang="zh-Hans">'+
   escapeHTML(r.character)+'</span><small>Font-dependent context</small></div>'+
   regions+'</div></article>';
 }).join("\n");
 const html='<!doctype html><html lang="en"><head><meta charset="utf-8">'+
  '<meta name="viewport" content="width=device-width,initial-scale=1">'+
  '<meta name="color-scheme" content="light dark">'+
  '<title>Local neutral source-region packet · Chromalect</title>'+
  '<style>:root{font-family:system-ui,sans-serif;color-scheme:light dark}'+
  'body{max-width:1100px;margin:auto;padding:24px;line-height:1.5}'+
  '.notice,.pair{border:1px solid #888;border-radius:12px;padding:14px;margin:14px 0}'+
  '.row{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}'+
  'figure{margin:0;min-width:0}figcaption,small{display:block;margin-top:8px}'+
  '.mask,.native{display:flex;flex-direction:column;align-items:center;justify-content:center;'+
  'min-height:180px;overflow:auto;border:1px solid #aaa;border-radius:8px;padding:8px}'+
  '.mask{background:#fff;color:#111}.mask img{width:100px;height:100px;max-width:none}'+
  '.native span{font-size:96px;line-height:1.2}'+
  '@media(max-width:700px){.row{grid-template-columns:1fr}}</style></head>'+
  '<body><main><h1>Neutral source-region packet · preparation only</h1>'+
  '<p class="notice"><strong>Not an approved blinded review or a study.</strong> '+
  'Both region masks are provisional mappings from the same source. No reviewer results, '+
  'owner certifications, eligibility decisions, or participant information are recorded. '+
  'The separate public source project may disclose original machine mappings. '+
  'This offline gallery does not contact a server.</p>'+cards+
  '<p>See the accompanying README for scope and limitations.</p></main></body></html>\n';
 if(html.includes("cmp-")||html.includes("<script")||html.includes("<form"))
  throw Error("Local gallery includes a source key or collection capability");
 return html;
}
export function deriveOfflineReviewerPacket(source,readSVG,
 makeId=()=> "p-"+randomBytes(16).toString("hex"),
 drawIndex=upper=>randomInt(upper)){
 const derived=deriveMaskedStimuli(source,readSVG);
 const used=new Set(),records=[],coordinator=[],files=new Map();
 const packetSession=makeId();
 assert.match(packetSession,ID);
 used.add(packetSession);
 for(const row of derived.manifest.records){
  const sourceRow=source.targets.find(t=>t.id===row.id);
  assert.ok(sourceRow&&sourceRow.sourceSHA256===row.sourceSHA256);
  const packetId=makeId();
  assert.match(packetId,ID,"Packet identifier must be a random-looking opaque 128-bit token");
  assert.ok(!used.has(packetId),"Packet identifier collision");
  used.add(packetId);
  const masks=row.candidates.map(candidate=>{
   const sourceKey=row.id+"--"+candidate.slot+".svg";
   const svg=derived.files.get(sourceKey);
   assert.ok(svg,"Missing source-verified mask");
   const name="masks/"+packetId+"--"+candidate.slot+".svg";
   assert.ok(!files.has(name));files.set(name,svg);
   return {slot:candidate.slot,form:candidate.form,file:name,sha256:candidate.sha256,
    highlightedPaths:candidate.highlightedPaths};
  });
  records.push({packetId,character:row.character,sourceStrokePaths:row.sourceStrokePaths,
   candidates:masks,sourceOwnerIndependentlyVerified:false,
   participantResponseRecorded:false,studyEligible:false});
  coordinator.push({packetId,sourceTrialId:row.id,sourceSHA256:row.sourceSHA256,
   originalRank:row.rank,machineAssignedOwner:sourceRow.machineAssignedOwner,
   mappedOtherOwner:sourceRow.otherOwner,
   candidateOwnerIds:sourceRow.offeredComponents.map(x=>x.id)});
 }
 assert.equal(records.length,49);assert.equal(files.size,98);
 // Randomized output order is not experimental random assignment.
 for(let i=records.length-1;i>0;i--){
  const j=drawIndex(i+1);
  assert.ok(Number.isInteger(j)&&j>=0&&j<=i,"Invalid private packet order index");
  [records[i],records[j]]=[records[j],records[i]];
 }
 const manifest={schema:"chromalect.glyph.local-keyless-packet.v0.1",
  status:"unapproved_local_reviewer_packet_preparation_not_a_blinded_study",
  packetSession,summary:{pairs:49,neutralSVGs:98,participantResponses:0,
   independentlyCertifiedOwners:0,approvedStudies:0},
  records};
 const coordinatorMap={schema:"chromalect.glyph.local-packet-coordinator.v0.1",
  status:"private_unapproved_machine_mapping_not_independent_reviewer_evidence",
  packetSession,sourceTargetManifest:TARGET,records:coordinator};
 const serialized=encode(manifest)+publicREADME;
 for(const secret of ["cmp-","machineAssignedOwner","sourceTrialId",
  "originalRank","mappedOtherOwner","candidateOwnerIds",
  "owner-masked-stimuli-v0.1"]){
  assert.ok(!serialized.includes(secret),"Machine source key leaked into local reviewer packet");
 }
 for(const [name,svg] of files){
  assert.ok(!name.includes("cmp-")&&!svg.includes("data-component")&&!svg.includes("cmp-"));
 }
 return {manifest,coordinatorMap,readme:publicREADME,
  gallery:renderOfflinePacketGallery(manifest),files};
}
// Reject malformed programmatic packets before creating any public-facing files.
export function validatePreparedOfflinePacket(packet){
 const exact=(obj,keys)=>!!obj&&typeof obj==="object"&&!Array.isArray(obj)&&
  Object.keys(obj).length===keys.length&&keys.every(k=>Object.hasOwn(obj,k));
 assert.ok(exact(packet,["manifest","coordinatorMap","readme","gallery","files"]));
 const {manifest,coordinatorMap,readme,gallery,files}=packet;
 assert.ok(exact(manifest,["schema","status","packetSession","summary","records"]));
 assert.equal(manifest.schema,"chromalect.glyph.local-keyless-packet.v0.1");
 assert.equal(manifest.status,"unapproved_local_reviewer_packet_preparation_not_a_blinded_study");
 assert.match(manifest.packetSession,ID);
 assert.ok(exact(manifest.summary,["pairs","neutralSVGs","participantResponses",
  "independentlyCertifiedOwners","approvedStudies"]));
 assert.deepEqual(manifest.summary,{pairs:49,neutralSVGs:98,participantResponses:0,
  independentlyCertifiedOwners:0,approvedStudies:0});
 assert.ok(Array.isArray(manifest.records)&&manifest.records.length===49);
 assert.equal(readme,publicREADME);
 assert.equal(gallery,renderOfflinePacketGallery(manifest));
 assert.ok(files instanceof Map&&files.size===98);
 const hidden=JSON.stringify(manifest)+readme+gallery;
 for(const phrase of ["cmp-","machineAssignedOwner","sourceTrialId",
  "candidateOwnerIds","sourceSHA256","mappedOtherOwner","data-component"]){
  assert.ok(!hidden.includes(phrase),"Source-owner metadata exposed in reviewer materials");
 }
 const ids=new Set([manifest.packetSession]),expectedFiles=new Set();
 for(const row of manifest.records){
  assert.ok(exact(row,["packetId","character","sourceStrokePaths","candidates",
   "sourceOwnerIndependentlyVerified","participantResponseRecorded","studyEligible"]));
  assert.match(row.packetId,ID);
  assert.ok(!ids.has(row.packetId),"Duplicate packet token");
  ids.add(row.packetId);
  assert.ok(typeof row.character==="string"&&[...row.character].length===1);
  assert.ok(Number.isInteger(row.sourceStrokePaths)&&row.sourceStrokePaths>=2&&
   row.sourceStrokePaths<=300);
  assert.ok(row.sourceOwnerIndependentlyVerified===false&&
   row.participantResponseRecorded===false&&row.studyEligible===false);
  assert.ok(Array.isArray(row.candidates)&&row.candidates.length===2);
  let total=0;
  for(const [index,candidate] of row.candidates.entries()){
   const slot=index===0?"A":"B";
   assert.ok(exact(candidate,["slot","form","file","sha256","highlightedPaths"]));
   assert.equal(candidate.slot,slot);
   assert.ok(typeof candidate.form==="string"&&candidate.form.length>0&&
    candidate.form.length<=24);
   const filename="masks/"+row.packetId+"--"+slot+".svg";
   assert.equal(candidate.file,filename);
   assert.ok(!expectedFiles.has(filename));
   expectedFiles.add(filename);
   assert.match(candidate.sha256,/^[a-f0-9]{64}$/);
   const svg=files.get(filename);
   assert.ok(typeof svg==="string"&&svg.length>0&&svg.length<=1048576,
    "Missing or oversized neutral mask");
   assert.equal(createHash("sha256").update(svg).digest("hex"),candidate.sha256);
   globalThis.ChromalectNeutralRegionSVG.validate(svg,row.sourceStrokePaths,
    candidate.highlightedPaths);
   total+=candidate.highlightedPaths;
  }
  assert.ok(total<=row.sourceStrokePaths);
  assert.notEqual(row.candidates[0].sha256,row.candidates[1].sha256);
 }
 assert.equal(ids.size,50);
 assert.deepEqual(new Set(files.keys()),expectedFiles);
 assert.ok(exact(coordinatorMap,["schema","status","packetSession",
  "sourceTargetManifest","records"]));
 assert.equal(coordinatorMap.schema,"chromalect.glyph.local-packet-coordinator.v0.1");
 assert.equal(coordinatorMap.status,
  "private_unapproved_machine_mapping_not_independent_reviewer_evidence");
 assert.equal(coordinatorMap.packetSession,manifest.packetSession);
 assert.equal(coordinatorMap.sourceTargetManifest,TARGET);
 assert.ok(Array.isArray(coordinatorMap.records)&&coordinatorMap.records.length===49);
 const covered=new Set();
 for(const entry of coordinatorMap.records){
  assert.ok(exact(entry,["packetId","sourceTrialId","sourceSHA256",
   "originalRank","machineAssignedOwner","mappedOtherOwner","candidateOwnerIds"]));
  assert.ok(ids.has(entry.packetId)&&!covered.has(entry.packetId));
  covered.add(entry.packetId);
  assert.match(entry.sourceTrialId,/^\d{1,4}-cmp-\d{4}-cmp-\d{4}$/);
  assert.match(entry.sourceSHA256,/^[a-f0-9]{64}$/);
  assert.ok(Number.isInteger(entry.originalRank)&&entry.originalRank>0);
  assert.match(entry.machineAssignedOwner,/^cmp-\d{4}$/);
  assert.match(entry.mappedOtherOwner,/^cmp-\d{4}$/);
  assert.notEqual(entry.machineAssignedOwner,entry.mappedOtherOwner);
  assert.ok(Array.isArray(entry.candidateOwnerIds)&&entry.candidateOwnerIds.length===2);
  assert.ok(entry.candidateOwnerIds.every(id=>/^cmp-\d{4}$/.test(id)));
 }
 assert.equal(covered.size,49);
 return true;
}
export function writeOfflinePacket(packet,reviewerDir,privateCoordinatorFile){
 validatePreparedOfflinePacket(packet);
 const review=requireOutsideRepository(reviewerDir);
 const mapping=requireOutsideRepository(privateCoordinatorFile);
 assert.ok(review!==mapping&&mapping!==path.join(review,"index-v0.1.json"));
 assert.ok(mapping!==review&&
  !mapping.startsWith(review+path.sep),"Coordinator map must not reside inside reviewer packet");
 assert.ok(!fs.existsSync(review)&&!fs.existsSync(mapping),
  "Refuse to overwrite existing reviewer package or coordinator map");
 let created=false,keyCreated=false;
 try{
  fs.mkdirSync(review,{mode:0o700});created=true;
  fs.mkdirSync(path.join(review,"masks"),{mode:0o700});
  const exclusive=(p,content)=>fs.writeFileSync(p,content,
   {encoding:"utf8",flag:"wx",mode:0o600});
  exclusive(path.join(review,"index-v0.1.json"),encode(packet.manifest));
  exclusive(path.join(review,"README.md"),packet.readme);
  exclusive(path.join(review,"index.html"),packet.gallery);
  for(const [name,svg] of packet.files)
   exclusive(path.join(review,name),svg);
  const parts=new Map([
   ["README.md",packet.readme],
   ["index.html",packet.gallery],
   ["index-v0.1.json",encode(packet.manifest)],
   ...packet.files
  ]);
  const receipt=buildOfflinePacketReceipt(packet.manifest.packetSession,parts);
  // The private crosswalk must exist before the reviewer packet receives a
  // complete receipt marker. Both files are created exclusively.
  const fd=fs.openSync(mapping,"wx",0o600);
  keyCreated=true;
  try{
   fs.writeFileSync(fd,encode(packet.coordinatorMap),{encoding:"utf8"});
   fs.fsyncSync(fd);
  }finally{fs.closeSync(fd);}
  const receiptFd=fs.openSync(path.join(review,RECEIPT_FILE),"wx",0o600);
  try{
   fs.writeFileSync(receiptFd,encode(receipt),{encoding:"utf8"});
   fs.fsyncSync(receiptFd);
  }finally{fs.closeSync(receiptFd);}
 }catch(e){
  const errors=[e];
  if(keyCreated){
   try{fs.rmSync(mapping,{force:true});}catch(err){errors.push(err);}
  }
  if(created){
   try{fs.rmSync(review,{recursive:true,force:true});}catch(err){errors.push(err);}
  }
  if(errors.length>1)throw new AggregateError(errors,
   "Failed to clean incomplete local reviewer packet output");
  throw e;
 }
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const args=process.argv.slice(2);
 assert.equal(args.length,4,
  "Use --reviewer-dir ABSOLUTE_DIRECTORY --coordinator-map ABSOLUTE_FILE");
 assert.equal(args[0],"--reviewer-dir");
 assert.equal(args[2],"--coordinator-map");
 const reviewer=requireOutsideRepository(args[1]);
 const mapping=requireOutsideRepository(args[3]);
 const source=JSON.parse(readPinnedSiteFile(TARGET));
 const packet=deriveOfflineReviewerPacket(source,readPinnedSiteFile);
 writeOfflinePacket(packet,reviewer,mapping);
 console.log("Offline neutral review packet prepared: 49 pairs, 98 masks, no participants or independent approvals. Coordinator file kept separate.");
}
