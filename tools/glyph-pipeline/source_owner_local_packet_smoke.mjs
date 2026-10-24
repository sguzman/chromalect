import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {spawnSync} from "node:child_process";
import {createHash} from "node:crypto";
import {deriveOfflineReviewerPacket,writeOfflinePacket} from "./source_owner_local_packet.mjs";
const source=JSON.parse(fs.readFileSync(
 "site/glyphs/research/heldout-identification-target-v0.1/index-v0.1.json","utf8"));
const read=p=>fs.readFileSync("site/"+p,"utf8");
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
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),"chromalect-review-packet-"));
try{
 const reviewerDir=path.join(tmp,"reviewer-material");
 const privateMap=path.join(tmp,"coordinator-private.json");
 writeOfflinePacket(built,reviewerDir,privateMap);
 assert.equal(fs.readdirSync(path.join(reviewerDir,"masks")).length,98);
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
  {encoding:"utf8",timeout:60000});
 assert.equal(run.status,0,run.stderr);
 assert.ok(fs.existsSync(path.join(cliDir,"index-v0.1.json")));
 assert.ok(fs.existsSync(cliMap));
 assert.ok(!run.stdout.includes("cmp-"));
 const live=JSON.parse(fs.readFileSync(path.join(cliDir,"index-v0.1.json"),"utf8"));
 assert.equal(live.records.length,49);
 assert.notEqual(live.packetSession,built.manifest.packetSession);
 const before=fs.readFileSync(cliMap);
 const refused=spawnSync(process.execPath,[script,
  "--reviewer-dir",cliDir,"--coordinator-map",cliMap],
  {encoding:"utf8",timeout:60000});
 assert.notEqual(refused.status,0,"No coordinator or packet overwrite allowed");
 assert.deepEqual(fs.readFileSync(cliMap),before);
}finally{fs.rmSync(tmp,{recursive:true,force:true});}
console.log("Local-only reviewer packet: 49 opaque pair IDs, 98 neutral masks, private source map, randomized ordering, create-only output, no participant or certification claims.");
