import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {spawnSync} from "node:child_process";
import {createHash} from "node:crypto";
import {deriveOfflineReviewerPacket,writeOfflinePacket,
 renderOfflinePacketGallery} from "./source_owner_local_packet.mjs";
import {verifyOfflinePacket} from "./source_owner_local_packet_verify.mjs";
import {buildOfflinePacketReceipt,RECEIPT_FILE} from "./source_owner_local_receipt.mjs";

const source=JSON.parse(fs.readFileSync(
 "site/glyphs/research/heldout-identification-target-v0.1/index-v0.1.json","utf8"));
const read=p=>fs.readFileSync("site/"+p,"utf8");
const sha=value=>createHash("sha256").update(value).digest("hex");
let id=0;
const packet=deriveOfflineReviewerPacket(source,read,
 ()=>"p-"+(++id).toString(16).padStart(32,"0"),upper=>upper-1);
const root=fs.mkdtempSync(path.join(os.tmpdir(),"chromalect-packet-verify-"));
const directory=path.join(root,"reviewer");
const map=path.join(root,"separate-private-coordinator.json");
const manifestFile=path.join(directory,"index-v0.1.json");
const galleryFile=path.join(directory,"index.html");
const readmeFile=path.join(directory,"README.md");
const receiptFile=path.join(directory,RECEIPT_FILE);
const svgFile=path.join(directory,packet.manifest.records[0].candidates[0].file);
function tempEdit(filename,change,shouldReject=true){
 const before=fs.readFileSync(filename);
 try{
  fs.writeFileSync(filename,change(before));
  if(shouldReject)assert.throws(()=>verifyOfflinePacket(directory));
  else assert.deepEqual(verifyOfflinePacket(directory),
   {pairs:49,masks:98,independentlyAcceptedOwners:0,participantResponses:0});
 }finally{fs.writeFileSync(filename,before);}
}
function alterManifest(mutate,{alsoRender=false}={}){
 const manifest=JSON.parse(fs.readFileSync(manifestFile,"utf8"));
 mutate(manifest);
 const galleryBefore=fs.readFileSync(galleryFile);
 const old=fs.readFileSync(manifestFile);
 try{
  fs.writeFileSync(manifestFile,JSON.stringify(manifest,null,2)+"\n");
  if(alsoRender)fs.writeFileSync(galleryFile,renderOfflinePacketGallery(manifest));
  assert.throws(()=>verifyOfflinePacket(directory));
 }finally{
  fs.writeFileSync(manifestFile,old);
  fs.writeFileSync(galleryFile,galleryBefore);
 }
}
try{
 writeOfflinePacket(packet,directory,map);
 assert.deepEqual(verifyOfflinePacket(directory),
  {pairs:49,masks:98,independentlyAcceptedOwners:0,participantResponses:0});
 const receipt=JSON.parse(fs.readFileSync(receiptFile,"utf8"));
 assert.equal(receipt.fileCount,101);
 assert.equal(receipt.files.length,101);
 assert.match(receipt.rootSHA256,/^[a-f0-9]{64}$/);
 assert.ok(!JSON.stringify(receipt).includes("cmp-"));
 const packetContents=new Map([
  ["index-v0.1.json",fs.readFileSync(manifestFile)],
  ["index.html",fs.readFileSync(galleryFile)],
  ["README.md",fs.readFileSync(readmeFile)]
 ]);
 for(const row of packet.manifest.records)
  for(const candidate of row.candidates)
   packetContents.set(candidate.file,fs.readFileSync(path.join(directory,candidate.file)));
 assert.deepEqual(receipt,buildOfflinePacketReceipt(packet.manifest.packetSession,
  packetContents));
 fs.unlinkSync(map);
 assert.deepEqual(verifyOfflinePacket(directory),
  {pairs:49,masks:98,independentlyAcceptedOwners:0,participantResponses:0},
  "Public packet audit must not read the separately held coordinator key");
 const args=[path.resolve("tools/glyph-pipeline/source_owner_local_packet_verify.mjs"),
  "--packet-dir",directory];
 let processResult=spawnSync(process.execPath,args,{encoding:"utf8",timeout:30000});
 assert.equal(processResult.status,0,processResult.stderr);
 assert.ok(!processResult.stdout.includes("cmp-"));
 const fingerprintResult=spawnSync(process.execPath,[...args,"--fingerprint"],
  {encoding:"utf8",timeout:30000});
 assert.equal(fingerprintResult.status,0,fingerprintResult.stderr);
 assert.ok(fingerprintResult.stdout.includes(receipt.rootSHA256));
 assert.ok(!fingerprintResult.stdout.includes("cmp-"));
 const accepted=spawnSync(process.execPath,[...args,"--expect-fingerprint",
  receipt.rootSHA256],{encoding:"utf8",timeout:30000});
 assert.equal(accepted.status,0,accepted.stderr);
 assert.match(accepted.stdout,/fingerprint matches/);
 const wrong=spawnSync(process.execPath,[...args,"--expect-fingerprint",
  "0".repeat(64)],{encoding:"utf8",timeout:30000});
 assert.notEqual(wrong.status,0,"Incorrect externally held fingerprint must be refused");
 const malformed=spawnSync(process.execPath,[...args,"--expect-fingerprint",
  "../invalid"],{encoding:"utf8",timeout:30000});
 assert.notEqual(malformed.status,0,"Non-SHA-256 reference must be refused");
 assert.throws(()=>verifyOfflinePacket(path.relative(process.cwd(),directory)),
  /absolute/);
 alterManifest(m=>{m.summary.participantResponses=1;});
 alterManifest(m=>{m.summary.independentlyCertifiedOwners=1;});
 alterManifest(m=>{m.summary.approvedStudies=1;});
 alterManifest(m=>{m.records[0].machineAssignedOwner="cmp-0001";});
 alterManifest(m=>{m.records[0].packetId=m.records[1].packetId;});
 alterManifest(m=>{m.packetSession=m.records[0].packetId;});
 alterManifest(m=>{m.records[0].studyEligible=true;});
 alterManifest(m=>{m.records[0].candidates[0].file="../private.json";});
 alterManifest(m=>{m.records[0].candidates[0].sha256="0".repeat(64);});
 alterManifest(m=>{m.records[0].candidates[0].highlightedPaths=0;});
 alterManifest(m=>{m.records.pop();});
 alterManifest(m=>{m.records[0].character="<script>alert(1)</script>";},
  {alsoRender:true});
 tempEdit(svgFile,bytes=>Buffer.concat([bytes,Buffer.from("tampered")]));
 tempEdit(svgFile,bytes=>Buffer.from(bytes.toString("utf8")
  .replace("</g>","<script>alert(1)</script></g>")));
 // A modified manifest matching the attacker's SHA-256 is still rejected by the SVG grammar.
 {
  const oldSvg=fs.readFileSync(svgFile);
  const oldIndex=fs.readFileSync(manifestFile);
  try{
   const hostile=Buffer.from(oldSvg.toString("utf8")
    .replace("</g>","<script>alert(1)</script></g>"));
   fs.writeFileSync(svgFile,hostile);
   const manifest=JSON.parse(oldIndex);
   manifest.records[0].candidates[0].sha256=sha(hostile);
   fs.writeFileSync(manifestFile,JSON.stringify(manifest,null,2)+"\n");
   assert.throws(()=>verifyOfflinePacket(directory),/Neutral SVG/);
  }finally{
   fs.writeFileSync(svgFile,oldSvg);
   fs.writeFileSync(manifestFile,oldIndex);
  }
 }
 tempEdit(galleryFile,bytes=>Buffer.concat([bytes,Buffer.from("<script>alert(1)</script>")]));
 tempEdit(readmeFile,bytes=>Buffer.concat([bytes,Buffer.from("Study approved\n")]));
 tempEdit(manifestFile,bytes=>Buffer.concat([bytes,Buffer.from("\n")]));
 tempEdit(receiptFile,bytes=>Buffer.concat([bytes,Buffer.from(" ") ]));
 tempEdit(receiptFile,bytes=>{
  const payload=JSON.parse(bytes);
  payload.rootSHA256="0".repeat(64);
  return Buffer.from(JSON.stringify(payload,null,2)+"\n");
 });
 tempEdit(receiptFile,bytes=>{
  const payload=JSON.parse(bytes);
  payload.files.pop();
  return Buffer.from(JSON.stringify(payload,null,2)+"\n");
 });
 tempEdit(receiptFile,bytes=>{
  const payload=JSON.parse(bytes);
  payload.files[0].path="../private-coordinator.json";
  return Buffer.from(JSON.stringify(payload,null,2)+"\n");
 });
 const extra=path.join(directory,"coordinator.json");
 fs.writeFileSync(extra,"{}",{flag:"wx"});
 assert.throws(()=>verifyOfflinePacket(directory),/Unexpected or missing reviewer packet files/);
 fs.unlinkSync(extra);
 const leaked=path.join(directory,"masks","unexpected.svg");
 fs.writeFileSync(leaked,"<svg/>",{flag:"wx"});
 assert.throws(()=>verifyOfflinePacket(directory),/Missing, duplicated or extraneous/);
 fs.unlinkSync(leaked);
 const existing=fs.readFileSync(svgFile);
 fs.unlinkSync(svgFile);
 fs.symlinkSync("/etc/hosts",svgFile);
 assert.throws(()=>verifyOfflinePacket(directory));
 fs.unlinkSync(svgFile);
 fs.writeFileSync(svgFile,existing);
 // Non-regular packet files must be rejected without waiting for a FIFO writer.
 // The production verifier uses O_NONBLOCK before checking fstat.
 fs.unlinkSync(svgFile);
 const fifo=spawnSync("mkfifo",[svgFile],{encoding:"utf8",timeout:30000});
 assert.equal(fifo.status,0,fifo.stderr);
 assert.throws(()=>verifyOfflinePacket(directory),
  /Unexpected packet file type or size/);
 fs.unlinkSync(svgFile);
 fs.writeFileSync(svgFile,existing);
 const aliases=path.join(root,"alias");
 fs.symlinkSync(directory,aliases,"dir");
 assert.throws(()=>verifyOfflinePacket(aliases),/real directory/);
 processResult=spawnSync(process.execPath,args,{encoding:"utf8",timeout:30000});
 assert.equal(processResult.status,0,processResult.stderr);
 assert.deepEqual(verifyOfflinePacket(directory),
  {pairs:49,masks:98,independentlyAcceptedOwners:0,participantResponses:0});
}finally{fs.rmSync(root,{recursive:true,force:true});}
console.log("Independent offline packet self-audit: 49 pairs, 98 source-shaped SVGs; private map not needed; manifest, malware-shaped SVG, symlinks, mismatched hashes, extra files and unearned approvals refused.");
