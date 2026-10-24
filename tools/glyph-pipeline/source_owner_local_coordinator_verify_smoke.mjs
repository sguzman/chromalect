import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {spawnSync} from "node:child_process";
import {REPOSITORY_ROOT} from "./source_owner_local_paths.mjs";
import {deriveOfflineReviewerPacket,writeOfflinePacket,
 renderOfflinePacketGallery} from "./source_owner_local_packet.mjs";
import {verifyOfflinePacket} from "./source_owner_local_packet_verify.mjs";
import {verifyLocalCoordinator} from "./source_owner_local_coordinator_verify.mjs";

const source=JSON.parse(fs.readFileSync(
 "site/glyphs/research/heldout-identification-target-v0.1/index-v0.1.json","utf8"));
const read=p=>fs.readFileSync("site/"+p,"utf8");
let counter=0;
const packet=deriveOfflineReviewerPacket(source,read,
 ()=>"p-"+(++counter).toString(16).padStart(32,"0"),upper=>upper-1);
const base=fs.mkdtempSync(path.join(os.tmpdir(),"chromalect-private-crosswalk-"));
const publicDir=path.join(base,"packet");
const keyFile=path.join(base,"coordinator-only.json");
const manifestPath=path.join(publicDir,"index-v0.1.json");
const htmlPath=path.join(publicDir,"index.html");
function alterKey(mutator){
 const original=fs.readFileSync(keyFile);
 try{
  const data=JSON.parse(original);
  mutator(data);
  fs.writeFileSync(keyFile,JSON.stringify(data,null,2)+"\n");
  assert.throws(()=>verifyLocalCoordinator(publicDir,keyFile,read),
   "Coordinator tampering must not be accepted");
 }finally{fs.writeFileSync(keyFile,original);}
}
try{
 writeOfflinePacket(packet,publicDir,keyFile);
 const expected={pairs:49,masks:98,sourceLinksVerified:49,
  independentlyAcceptedOwners:0,participantResponses:0};
 assert.deepEqual(verifyLocalCoordinator(publicDir,keyFile,read),expected);
 assert.deepEqual(verifyOfflinePacket(publicDir),{
  pairs:49,masks:98,independentlyAcceptedOwners:0,participantResponses:0
 });
 const args=[path.resolve("tools/glyph-pipeline/source_owner_local_coordinator_verify.mjs"),
  "--packet-dir",publicDir,"--coordinator-map",keyFile];
 const cli=spawnSync(process.execPath,args,
  {cwd:base,encoding:"utf8",timeout:60000});
 assert.equal(cli.status,0,cli.stderr);
 assert.match(cli.stdout,/49 provisional pairs/);
 assert.ok(!cli.stdout.includes("cmp-")&&!cli.stdout.includes("sourceTrialId"));
 // A runner launched outside the Git checkout must still reject a key in that checkout.
 const invalidKeyPath=path.join(REPOSITORY_ROOT,"private-coordinator-disallowed.json");
 const rejectedKey=spawnSync(process.execPath,[
  args[0],"--packet-dir",publicDir,"--coordinator-map",invalidKeyPath],
  {cwd:base,encoding:"utf8",timeout:60000});
 assert.notEqual(rejectedKey.status,0);
 assert.ok(!fs.existsSync(invalidKeyPath));
 const repoAlias=path.join(base,"repo-alias");
 fs.symlinkSync(REPOSITORY_ROOT,repoAlias,"dir");
 const aliasKey=path.join(repoAlias,"private-coordinator-disallowed.json");
 assert.throws(()=>verifyLocalCoordinator(publicDir,aliasKey,read),
  /outside the public repository/);
 alterKey(m=>{m.packetSession="p-"+"0".repeat(32);});
 alterKey(m=>{m.status="independently_approved";});
 alterKey(m=>{m.records[0].machineAssignedOwner="cmp-9999";});
 alterKey(m=>{m.records[0].mappedOtherOwner="cmp-9999";});
 alterKey(m=>{m.records[0].sourceTrialId=m.records[1].sourceTrialId;});
 alterKey(m=>{m.records[0].sourceSHA256="0".repeat(64);});
 alterKey(m=>{m.records[0].candidateOwnerIds.reverse();});
 alterKey(m=>{m.records[0].packetId=m.records[1].packetId;});
 alterKey(m=>{m.records[0].originalRank++;});
 alterKey(m=>{m.records[0].sourceOwnerCertified=true;});
 alterKey(m=>{m.records.pop();});
 // A self-consistent switch of the two region SVGs can pass public packet
 // checks. Only the private source crosswalk detects the owner/form mismatch.
 {
  const manifestBytes=fs.readFileSync(manifestPath);
  const first=packet.manifest.records[0],a=first.candidates[0],b=first.candidates[1];
  const af=path.join(publicDir,a.file),bf=path.join(publicDir,b.file);
  const av=fs.readFileSync(af),bv=fs.readFileSync(bf);
  try{
   fs.writeFileSync(af,bv);fs.writeFileSync(bf,av);
   const manifest=JSON.parse(manifestBytes);
   const entries=manifest.records[0].candidates;
   const oldHashes=entries.map(x=>x.sha256);
   const oldCounts=entries.map(x=>x.highlightedPaths);
   entries[0].sha256=oldHashes[1];
   entries[1].sha256=oldHashes[0];
   entries[0].highlightedPaths=oldCounts[1];
   entries[1].highlightedPaths=oldCounts[0];
   fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+"\n");
   assert.deepEqual(verifyOfflinePacket(publicDir),{
    pairs:49,masks:98,independentlyAcceptedOwners:0,participantResponses:0
   });
   assert.throws(()=>verifyLocalCoordinator(publicDir,keyFile,read),
    /differs from source-pinned neutral mask/);
  }finally{
   fs.writeFileSync(manifestPath,manifestBytes);
   fs.writeFileSync(af,av);fs.writeFileSync(bf,bv);
  }
 }
 // Modifying a candidate form and regenerating the public presentation
 // is internally consistent but differs from the original source record.
 {
  const old=fs.readFileSync(manifestPath),oldHTML=fs.readFileSync(htmlPath);
  try{
   const altered=JSON.parse(old);
   altered.records[0].candidates[0].form="UNVERIFIED-OTHER";
   fs.writeFileSync(manifestPath,JSON.stringify(altered,null,2)+"\n");
   fs.writeFileSync(htmlPath,renderOfflinePacketGallery(altered));
   assert.equal(verifyOfflinePacket(publicDir).masks,98);
   assert.throws(()=>verifyLocalCoordinator(publicDir,keyFile,read),
    /differs from source-pinned neutral mask/);
  }finally{
   fs.writeFileSync(manifestPath,old);fs.writeFileSync(htmlPath,oldHTML);
  }
 }
 const permission=fs.statSync(keyFile).mode&0o777;
 try{
  fs.chmodSync(keyFile,0o644);
  assert.throws(()=>verifyLocalCoordinator(publicDir,keyFile,read),
   /owner-only/);
 }finally{fs.chmodSync(keyFile,permission);}
 const alias=path.join(base,"symlink-key.json");
 fs.symlinkSync(keyFile,alias);
 assert.throws(()=>verifyLocalCoordinator(publicDir,alias,read),/not a symlink/);
 const misplaced=path.join(publicDir,"misplaced-coordinator.json");
 fs.copyFileSync(keyFile,misplaced);
 assert.throws(()=>verifyLocalCoordinator(publicDir,misplaced,read),
  /outside the reviewer packet/);
 fs.unlinkSync(misplaced);
 const mutated=structuredClone(source);
 mutated.targets[0].machineAssignedOwner="cmp-9999";
 assert.throws(()=>verifyLocalCoordinator(publicDir,keyFile,read,mutated));
 assert.deepEqual(verifyLocalCoordinator(publicDir,keyFile,read),expected);
}finally{fs.rmSync(base,{recursive:true,force:true});}
console.log("Coordinator-only source crosswalk: 49/49 mappings independently rederived from pinned machine source; switched but self-consistent masks and metadata rejected; no owner keys printed.");
