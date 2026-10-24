import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {spawnSync} from "node:child_process";
import {deriveOfflineReviewerPacket,renderOfflinePacketGallery,
 writeOfflinePacket} from "./source_owner_local_packet.mjs";
import {buildOfflinePacketReceipt,RECEIPT_FILE}
 from "./source_owner_local_receipt.mjs";
import {verifyOfflinePacket} from "./source_owner_local_packet_verify.mjs";
import {compareOfflinePackets} from "./source_owner_local_packet_compare.mjs";

const source=JSON.parse(fs.readFileSync(
 "site/glyphs/research/heldout-identification-target-v0.1/index-v0.1.json","utf8"));
const read=p=>fs.readFileSync("site/"+p,"utf8");
function packet(prefix,order){
 let i=0;
 return deriveOfflineReviewerPacket(source,read,
  ()=>"p-"+prefix+(++i).toString(16).padStart(31,"0"),
  order==="reverse"?upper=>upper-1:()=>0);
}
const first=packet("a","reverse");
const second=packet("b","forward");
assert.notEqual(first.manifest.packetSession,second.manifest.packetSession);
assert.notDeepEqual(first.manifest.records.map(r=>r.packetId),
 second.manifest.records.map(r=>r.packetId));
const root=fs.mkdtempSync(path.join(os.tmpdir(),"chromalect-packet-compare-"));
const a=path.join(root,"reviewer-a"),b=path.join(root,"reviewer-b");
const keyA=path.join(root,"private-a.json"),keyB=path.join(root,"private-b.json");
function refreshReceipt(dir){
 const manifest=JSON.parse(fs.readFileSync(path.join(dir,"index-v0.1.json"),"utf8"));
 const parts=new Map([
  ["README.md",fs.readFileSync(path.join(dir,"README.md"))],
  ["index.html",fs.readFileSync(path.join(dir,"index.html"))],
  ["index-v0.1.json",fs.readFileSync(path.join(dir,"index-v0.1.json"))]
 ]);
 for(const row of manifest.records)
  for(const candidate of row.candidates)
   parts.set(candidate.file,fs.readFileSync(path.join(dir,candidate.file)));
 fs.writeFileSync(path.join(dir,RECEIPT_FILE),
  JSON.stringify(buildOfflinePacketReceipt(manifest.packetSession,parts),null,2)+"\n");
}
try{
 writeOfflinePacket(first,a,keyA);
 writeOfflinePacket(second,b,keyB);
 const expected=compareOfflinePackets(a,b);
 assert.deepEqual(expected,{
  schema:"chromalect.glyph.offline-packet-equivalence.v0.1",
  status:"key_free_machine_presentation_comparison_not_source_owner_certification",
  leftPairs:49,rightPairs:49,matchedPairs:49,
  unmatchedLeftPairs:0,unmatchedRightPairs:0,
  presentationsEquivalent:true,
  distinctPacketSessions:true,distinctFileFingerprints:true,
  independentReviewerApprovals:0
 });
 assert.equal(compareOfflinePackets(b,a).matchedPairs,49);
 assert.equal(compareOfflinePackets(a,a).distinctPacketSessions,false);
 assert.equal(compareOfflinePackets(a,a).distinctFileFingerprints,false);
 // The equivalence comparison is meaningful without access to either secret key.
 fs.unlinkSync(keyA);fs.unlinkSync(keyB);
 assert.equal(compareOfflinePackets(a,b).presentationsEquivalent,true);
 const script=path.resolve("tools/glyph-pipeline/source_owner_local_packet_compare.mjs");
 const args=[script,"--left",a,"--right",b];
 const success=spawnSync(process.execPath,args,{encoding:"utf8",timeout:30000});
 assert.equal(success.status,0,success.stderr);
 assert.match(success.stdout,/49\/49 corresponding neutral/);
 assert.ok(!success.stdout.includes("cmp-")&&!success.stdout.includes("sourceTrialId"));
 const origManifest=fs.readFileSync(path.join(b,"index-v0.1.json"));
 const origGallery=fs.readFileSync(path.join(b,"index.html"));
 const origReceipt=fs.readFileSync(path.join(b,RECEIPT_FILE));
 try{
  const changed=JSON.parse(origManifest);
  changed.records[0].candidates[0].form="different-neutral-form";
  fs.writeFileSync(path.join(b,"index-v0.1.json"),
   JSON.stringify(changed,null,2)+"\n");
  fs.writeFileSync(path.join(b,"index.html"),
   renderOfflinePacketGallery(changed));
  refreshReceipt(b);
  assert.equal(verifyOfflinePacket(b).pairs,49,
   "A properly rehashed, source-divergent packet can be internally valid");
  const mismatch=compareOfflinePackets(a,b);
  assert.equal(mismatch.presentationsEquivalent,false);
  assert.equal(mismatch.matchedPairs,48);
  assert.equal(mismatch.unmatchedLeftPairs,1);
  assert.equal(mismatch.unmatchedRightPairs,1);
  const rejected=spawnSync(process.execPath,args,{encoding:"utf8",timeout:30000});
  assert.notEqual(rejected.status,0);
  assert.match(rejected.stdout,/48\/49 corresponding neutral/);
 }finally{
  fs.writeFileSync(path.join(b,"index-v0.1.json"),origManifest);
  fs.writeFileSync(path.join(b,"index.html"),origGallery);
  fs.writeFileSync(path.join(b,RECEIPT_FILE),origReceipt);
 }
 assert.equal(compareOfflinePackets(a,b).matchedPairs,49);
 // No amount of equivalence permits an invalid packet or forged study outcome.
 {
  const manifestFile=path.join(a,"index-v0.1.json");
  const old=fs.readFileSync(manifestFile);
  try{
   const bad=JSON.parse(old);
   bad.summary.independentlyCertifiedOwners=1;
   fs.writeFileSync(manifestFile,JSON.stringify(bad,null,2)+"\n");
   assert.throws(()=>compareOfflinePackets(a,b));
  }finally{fs.writeFileSync(manifestFile,old);}
 }
 assert.equal(compareOfflinePackets(a,b).presentationsEquivalent,true);
}finally{fs.rmSync(root,{recursive:true,force:true});}
console.log("Key-free offline presentation comparison: 49 equivalent source-region pairs across distinct packet identities; single rehashed form discrepancy detected; no coordinator key or certification needed.");
