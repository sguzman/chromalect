import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {spawnSync} from "node:child_process";
import {createHash} from "node:crypto";
import {REPOSITORY_ROOT,readPinnedSiteFile} from "./source_owner_local_paths.mjs";
import {deriveOfflineReviewerPacket,writeOfflinePacket,
 renderOfflinePacketGallery,validatePreparedOfflinePacket} from "./source_owner_local_packet.mjs";
const source=JSON.parse(fs.readFileSync(
 "site/glyphs/research/heldout-identification-target-v0.1/index-v0.1.json","utf8"));
const read=p=>fs.readFileSync("site/"+p,"utf8");
for(const forbidden of ["../site/glyphs/glyph.svg",
 "glyphs/../../private.svg","glyphs/research/../mask.svg",
 "http://example.test/glyph.svg","glyphs/no-file.js",
 "glyphs/owner.svg?key=1","/glyphs/research/owner.svg"]){
 assert.throws(()=>readPinnedSiteFile(forbidden),
  "Pinned source reads must reject traversal or non-glyph paths");
}
let index=0;
const makeId=()=>"p-"+(++index).toString(16).padStart(32,"0");
const built=deriveOfflineReviewerPacket(source,read,makeId,n=>n-1);
assert.equal(built.manifest.summary.pairs,49);
assert.equal(built.manifest.summary.neutralSVGs,98);
assert.equal(built.manifest.summary.participantResponses,0);
assert.equal(built.manifest.summary.independentlyCertifiedOwners,0);
assert.equal(built.manifest.summary.approvedStudies,0);
assert.equal(built.manifest.records.length,49);
assert.equal(built.coordinatorMap.records.length,49);
assert.equal(built.files.size,98);
assert.equal((built.gallery.match(/<article class="pair">/g)||[]).length,49);
assert.equal((built.gallery.match(/<img loading="lazy"/g)||[]).length,98);
assert.ok(!built.gallery.includes("cmp-"));
assert.ok(!built.gallery.includes("<script"));
assert.ok(!built.gallery.includes("<form"));
const hostile=structuredClone(built.manifest);
hostile.records[0].character="<img src=x onerror=alert(1)>";
hostile.records[0].candidates[0].form='<script>alert(1)</script>';
const escaped=renderOfflinePacketGallery(hostile);
assert.ok(escaped.includes("&lt;img src=x onerror=alert(1)&gt;"));
assert.ok(escaped.includes("&lt;script&gt;alert(1)&lt;/script&gt;"));
assert.ok(!escaped.includes("<script"));
assert.ok(!escaped.includes("<img src=x"));
const manifestText=JSON.stringify(built.manifest);
for(const forbidden of ["cmp-","machineAssignedOwner","sourceTrialId",
 "mappedOtherOwner","sourceSHA256","originalRank","participantName",
 "reviewerIdentity","sourceOwnerCertified"]){
 assert.ok(!manifestText.includes(forbidden),forbidden);
}
const seen=new Set(),originalIds=new Set(source.targets.map(r=>r.id));
for(const row of built.manifest.records){
 assert.match(row.packetId,/^p-[a-f0-9]{32}$/);
 assert.ok(!seen.has(row.packetId));seen.add(row.packetId);
 assert.equal(row.candidates.length,2);
 assert.equal(row.participantResponseRecorded,false);
 assert.equal(row.sourceOwnerIndependentlyVerified,false);
 assert.equal(row.studyEligible,false);
 for(const c of row.candidates){
  assert.equal(c.file,"masks/"+row.packetId+"--"+c.slot+".svg");
  const svg=built.files.get(c.file);
  assert.ok(svg&&!svg.includes("cmp-")&&!svg.includes("data-component"));
  assert.equal(createHash("sha256").update(svg).digest("hex"),c.sha256);
 }
}
assert.equal(seen.size,49);
for(const entry of built.coordinatorMap.records){
 assert.ok(seen.has(entry.packetId));
 assert.ok(originalIds.has(entry.sourceTrialId));
 assert.match(entry.machineAssignedOwner,/^cmp-[0-9]{4}$/);
 assert.equal(entry.candidateOwnerIds.length,2);
}
let next=0;
assert.throws(()=>deriveOfflineReviewerPacket(source,read,
 ()=>"p-"+"1".repeat(32),n=>n-1),"Reusing opaque IDs is rejected");
assert.throws(()=>deriveOfflineReviewerPacket(source,read,
 ()=>"invalid-id",n=>n-1));
assert.throws(()=>deriveOfflineReviewerPacket(source,read,
 ()=>"p-"+(++next).toString(16).padStart(32,"0"),()=>Number.NaN));
assert.equal(validatePreparedOfflinePacket(built),true);
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),"chromalect-review-packet-"));
try{
 function poisonedPacket(change){
  const p={manifest:structuredClone(built.manifest),
   coordinatorMap:structuredClone(built.coordinatorMap),
   readme:built.readme,gallery:built.gallery,files:new Map(built.files)};
  change(p);
  const output=path.join(tmp,"rejected-public");
  const key=path.join(tmp,"rejected-private.json");
  assert.throws(()=>writeOfflinePacket(p,output,key),
   "Malformed programmatic packet must be refused before any output");
  assert.ok(!fs.existsSync(output)&&!fs.existsSync(key));
 }
 const incompleteReview=path.join(tmp,"incomplete-public");
 const incompleteKey=path.join(tmp,"incomplete-private.json");
 const originalWrite=fs.writeFileSync;
 fs.writeFileSync=function(target,body,opts){
  if(typeof target==="number"&&typeof body==="string"&&
   body.includes("private_unapproved_machine_mapping")){
   originalWrite(target,body.slice(0,96),opts);
   throw Error("Injected coordinator write interruption");
  }
  return originalWrite(target,body,opts);
 };
 try{
  assert.throws(()=>writeOfflinePacket(built,incompleteReview,incompleteKey),
   /Injected coordinator write interruption/);
 }finally{fs.writeFileSync=originalWrite;}
 assert.ok(!fs.existsSync(incompleteReview)&&!fs.existsSync(incompleteKey),
  "Interrupted private key write must be removed with incomplete reviewer output");
 const reservedKey=path.join(tmp,"existing-private.json");
 const reservedReview=path.join(tmp,"existing-public");
 fs.writeFileSync(reservedKey,"unrelated pre-existing local file");
 assert.throws(()=>writeOfflinePacket(built,reservedReview,reservedKey),
  /Refuse to overwrite/);
 assert.equal(fs.readFileSync(reservedKey,"utf8"),
  "unrelated pre-existing local file");
 assert.ok(!fs.existsSync(reservedReview));
 poisonedPacket(p=>{p.manifest.summary.approvedStudies=1;});
 poisonedPacket(p=>{p.manifest.records[0].machineAssignedOwner="cmp-0001";});
 poisonedPacket(p=>{p.manifest.records[0].candidates[0].sha256="0".repeat(64);});
 poisonedPacket(p=>{p.manifest.records[0].candidates[0].file="../secret.svg";});
 poisonedPacket(p=>{p.manifest.records[0].packetId=p.manifest.records[1].packetId;});
 poisonedPacket(p=>{p.files.delete(built.manifest.records[0].candidates[0].file);});
 poisonedPacket(p=>{p.files.set(built.manifest.records[0].candidates[0].file,
  '<svg onload="alert(1)"></svg>');});
 poisonedPacket(p=>{p.gallery+="<script>alert(1)</script>";});
 poisonedPacket(p=>{p.readme+="Approved study";});
 poisonedPacket(p=>{p.coordinatorMap.packetSession="p-"+"0".repeat(32);});
 poisonedPacket(p=>{p.coordinatorMap.records[0].sourceTrialId="../bad";});
 poisonedPacket(p=>{p.coordinatorMap.records[0].mappedOtherOwner=
  p.coordinatorMap.records[0].machineAssignedOwner;});
 const reviewerDir=path.join(tmp,"reviewer-material");
 const privateMap=path.join(tmp,"coordinator-private.json");
 writeOfflinePacket(built,reviewerDir,privateMap);
 assert.equal(fs.readdirSync(path.join(reviewerDir,"masks")).length,98);
 assert.equal(fs.readFileSync(path.join(reviewerDir,"index.html"),"utf8"),
  built.gallery);
 assert.ok(!fs.readFileSync(path.join(reviewerDir,"index.html"),"utf8").includes("cmp-"));
 const published=JSON.parse(fs.readFileSync(
  path.join(reviewerDir,"index-v0.1.json"),"utf8"));
 assert.deepEqual(published,built.manifest);
 const secret=JSON.parse(fs.readFileSync(privateMap,"utf8"));
 assert.deepEqual(secret,built.coordinatorMap);
 assert.equal(fs.statSync(privateMap).mode&0o077,0,
  "Coordinator mapping must be owner-only");
 assert.ok(!fs.existsSync(path.join(reviewerDir,"coordinator-private.json")));
 const packetFiles=fs.readdirSync(reviewerDir,{recursive:true});
 assert.ok(!packetFiles.some(f=>f.includes("cmp-")||f.includes("coordinator")));
 assert.throws(()=>writeOfflinePacket(built,reviewerDir,privateMap),
  /Refuse to overwrite/);
 assert.throws(()=>writeOfflinePacket(built,
  path.join(process.cwd(),"site","unsafe-test-packet"),
  path.join(tmp,"unused-map.json")),/outside the public repository/);
 assert.throws(()=>writeOfflinePacket(built,
  path.join(tmp,"unused-packet"),
  path.join(process.cwd(),"unsafe-map.json")),/outside the public repository/);
 const script=path.resolve("tools/glyph-pipeline/source_owner_local_packet.mjs");
 const cliDir=path.join(tmp,"cli-reviewer"),cliMap=path.join(tmp,"cli-private.json");
 const run=spawnSync(process.execPath,[script,
  "--reviewer-dir",cliDir,"--coordinator-map",cliMap],
  {cwd:tmp,encoding:"utf8",timeout:60000});
 assert.equal(run.status,0,run.stderr);
 assert.ok(fs.existsSync(path.join(cliDir,"index-v0.1.json")));
 assert.ok(fs.existsSync(path.join(cliDir,"index.html")));
 assert.ok(fs.existsSync(cliMap));
 assert.ok(!run.stdout.includes("cmp-"));
 const live=JSON.parse(fs.readFileSync(path.join(cliDir,"index-v0.1.json"),"utf8"));
 assert.equal(live.records.length,49);
 assert.notEqual(live.packetSession,built.manifest.packetSession);
 // The source-boundary check must still reject repo outputs when cwd is elsewhere.
 const forbidden=path.join(REPOSITORY_ROOT,"site","rejected-external-cwd-packet");
 const refusedRepo=spawnSync(process.execPath,[script,
  "--reviewer-dir",forbidden,"--coordinator-map",path.join(tmp,"unused-map.json")],
  {cwd:tmp,encoding:"utf8",timeout:60000});
 assert.notEqual(refusedRepo.status,0,"Repository output rejected even from external cwd");
 assert.ok(!fs.existsSync(forbidden));
 const alias=path.join(tmp,"repo-alias");
 fs.symlinkSync(REPOSITORY_ROOT,alias,"dir");
 assert.throws(()=>writeOfflinePacket(built,path.join(alias,"alias-packet"),
  path.join(tmp,"unused-key.json")),/outside the public repository/);
 const privateRepoPath=path.join(REPOSITORY_ROOT,"source-owner-rejected-private-map.json");
 const refusedCoordinator=spawnSync(process.execPath,[script,
  "--reviewer-dir",path.join(tmp,"unused-packet"),
  "--coordinator-map",privateRepoPath],
  {cwd:tmp,encoding:"utf8",timeout:60000});
 assert.notEqual(refusedCoordinator.status,0,
  "Coordinator key may never be written inside the repository");
 assert.ok(!fs.existsSync(privateRepoPath));
 const before=fs.readFileSync(cliMap);
 const refused=spawnSync(process.execPath,[script,
  "--reviewer-dir",cliDir,"--coordinator-map",cliMap],
  {encoding:"utf8",timeout:60000});
 assert.notEqual(refused.status,0,"No coordinator or packet overwrite allowed");
 assert.deepEqual(fs.readFileSync(cliMap),before);
}finally{fs.rmSync(tmp,{recursive:true,force:true});}
console.log("Local-only reviewer packet: 49 opaque pairs, 98 neutral masks and a non-collecting offline gallery; private coordinator map and create-only paths verified.");
