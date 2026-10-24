// Local coordinator-side provenance check; keeps machine owner assignments private.
// This validates original machine mappings, not their independent linguistic correctness.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {pathToFileURL} from "node:url";
import {deriveMaskedStimuli} from "./source_owner_masked_stimuli.mjs";
import {verifyOfflinePacket} from "./source_owner_local_packet_verify.mjs";
import {requireOutsideRepository,readPinnedSiteFile}
 from "./source_owner_local_paths.mjs";

const TARGET="glyphs/research/heldout-identification-target-v0.1/index-v0.1.json";
const exact=(x,keys)=>!!x&&typeof x==="object"&&!Array.isArray(x)&&
 Object.keys(x).length===keys.length&&keys.every(k=>Object.hasOwn(x,k));
function requireShape(ok,message){if(!ok)throw Error(message);}
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
export function verifyLocalCoordinator(packetDir,coordinatorFile,readSVG,
 source=JSON.parse(readPinnedSiteFile(TARGET))){
 requireShape(typeof packetDir==="string"&&path.isAbsolute(packetDir)&&
  typeof coordinatorFile==="string"&&path.isAbsolute(coordinatorFile),
  "Absolute reviewer packet and coordinator file paths are required");
 const packetRoot=fs.realpathSync(packetDir);
 const keyFile=requireOutsideRepository(coordinatorFile);
 const keyParent=path.dirname(keyFile);
 requireShape(keyParent!==packetRoot&&!keyParent.startsWith(packetRoot+path.sep),
  "Private coordinator map must remain outside the reviewer packet");
 const keyStat=fs.lstatSync(keyFile);
 requireShape(keyStat.isFile()&&!keyStat.isSymbolicLink()&&
  keyStat.size<256*1024&&(keyStat.mode&0o077)===0,
  "Coordinator file must be regular, small, owner-only and not a symlink");
 verifyOfflinePacket(packetDir);
 const reviewer=JSON.parse(fs.readFileSync(path.join(packetRoot,"index-v0.1.json"),"utf8"));
 const key=JSON.parse(fs.readFileSync(keyFile,"utf8"));
 requireShape(exact(key,["schema","status","packetSession",
  "sourceTargetManifest","records"])&&
  key.schema==="chromalect.glyph.local-packet-coordinator.v0.1"&&
  key.status==="private_unapproved_machine_mapping_not_independent_reviewer_evidence"&&
  key.sourceTargetManifest===TARGET&&
  key.packetSession===reviewer.packetSession&&
  Array.isArray(key.records)&&key.records.length===49,
  "Unrecognized private source crosswalk or packet-session mismatch");
 const sourceMasks=deriveMaskedStimuli(source,readSVG);
 const rows=sourceMasks.manifest.records;
 requireShape(rows.length===49&&reviewer.records.length===49,
  "Original neutral source pair count differs from packet");
 const packetById=new Map(reviewer.records.map(row=>[row.packetId,row]));
 const used=new Set();
 for(let i=0;i<rows.length;i++){
  const src=source.targets[i],orig=rows[i],entry=key.records[i];
  requireShape(exact(entry,["packetId","sourceTrialId","sourceSHA256",
   "originalRank","machineAssignedOwner","mappedOtherOwner",
   "candidateOwnerIds"])&&
   typeof entry.packetId==="string"&&!used.has(entry.packetId)&&
   entry.sourceTrialId===orig.id&&
   entry.sourceSHA256===orig.sourceSHA256&&
   entry.originalRank===orig.rank&&
   entry.machineAssignedOwner===src.machineAssignedOwner&&
   entry.mappedOtherOwner===src.otherOwner&&
   same(entry.candidateOwnerIds,src.offeredComponents.map(x=>x.id)),
   "Private crosswalk or original machine mapping drift");
  used.add(entry.packetId);
  const shown=packetById.get(entry.packetId);
  requireShape(!!shown&&shown.character===orig.character&&
   shown.sourceStrokePaths===orig.sourceStrokePaths&&
   shown.candidates.length===2,
   "Private source key points to an incorrect or missing packet pair");
  for(let j=0;j<2;j++){
   const expected=orig.candidates[j],actual=shown.candidates[j];
   requireShape(actual.slot===expected.slot&&
    actual.form===expected.form&&actual.sha256===expected.sha256&&
    actual.highlightedPaths===expected.highlightedPaths,
    "Offline candidate differs from source-pinned neutral mask");
  }
 }
 requireShape(used.size===49&&
  reviewer.records.every(row=>used.has(row.packetId)),
  "Private source map has incomplete packet coverage");
 return {pairs:49,masks:98,sourceLinksVerified:49,
  independentlyAcceptedOwners:0,participantResponses:0};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const args=process.argv.slice(2);
 assert.equal(args.length,4,
  "Usage: --packet-dir ABSOLUTE_DIRECTORY --coordinator-map ABSOLUTE_FILE");
 assert.equal(args[0],"--packet-dir");
 assert.equal(args[2],"--coordinator-map");
 const result=verifyLocalCoordinator(args[1],args[3],
  readPinnedSiteFile);
 console.log("Local coordinator source linkage verified: "+result.sourceLinksVerified+
  " provisional pairs, "+result.masks+" neutral masks, no independent approvals.");
}
