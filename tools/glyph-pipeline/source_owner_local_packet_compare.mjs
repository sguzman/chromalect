// Compare independent local reviewer packet exports without coordinator keys.
// Internal equivalence of source-shaped presentation does not prove owner correctness.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {createHash} from "node:crypto";
import {pathToFileURL} from "node:url";
import {verifyOfflinePacket} from "./source_owner_local_packet_verify.mjs";
import {RECEIPT_FILE} from "./source_owner_local_receipt.mjs";

const sha=x=>createHash("sha256").update(x).digest("hex");
export function compareOfflinePackets(left,right){
 const countA=verifyOfflinePacket(left),countB=verifyOfflinePacket(right);
 assert.equal(countA.pairs,49);
 assert.equal(countB.pairs,49);
 const a=JSON.parse(fs.readFileSync(path.join(left,"index-v0.1.json"),"utf8"));
 const b=JSON.parse(fs.readFileSync(path.join(right,"index-v0.1.json"),"utf8"));
 const receiptA=JSON.parse(fs.readFileSync(path.join(left,RECEIPT_FILE),"utf8"));
 const receiptB=JSON.parse(fs.readFileSync(path.join(right,RECEIPT_FILE),"utf8"));
 // The opaque packet identity, randomized record order and filename salts
 // are intentionally not compared. Candidate slot/form/geometry are retained.
 const signatures=manifest=>manifest.records.map(row=>sha(JSON.stringify({
  character:row.character,
  sourceStrokePaths:row.sourceStrokePaths,
  candidates:row.candidates.map(c=>({
   slot:c.slot,form:c.form,sha256:c.sha256,
   highlightedPaths:c.highlightedPaths
  }))
 }))).sort();
 const sortedA=signatures(a),sortedB=signatures(b);
 let matched=0;
 const counts=new Map();
 for(const item of sortedA)counts.set(item,(counts.get(item)||0)+1);
 for(const item of sortedB){
  const remaining=counts.get(item)||0;
  if(remaining>0){matched++;counts.set(item,remaining-1);}
 }
 const same=matched===49&&sortedA.length===49&&sortedB.length===49;
 return {
  schema:"chromalect.glyph.offline-packet-equivalence.v0.1",
  status:"key_free_machine_presentation_comparison_not_source_owner_certification",
  leftPairs:49,rightPairs:49,matchedPairs:matched,
  unmatchedLeftPairs:49-matched,unmatchedRightPairs:49-matched,
  presentationsEquivalent:same,
  distinctPacketSessions:a.packetSession!==b.packetSession,
  distinctFileFingerprints:receiptA.rootSHA256!==receiptB.rootSHA256,
  independentReviewerApprovals:0
 };
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const argv=process.argv.slice(2);
 assert.ok(argv.length===4&&argv[0]==="--left"&&argv[2]==="--right",
  "Usage: --left ABSOLUTE_PACKET_DIR --right ABSOLUTE_PACKET_DIR");
 const result=compareOfflinePackets(argv[1],argv[3]);
 console.log("Verified offline presentations: "+result.matchedPairs+
  "/49 corresponding neutral source-region pairs, no independent approvals.");
 console.log("Source-shaped presentations equivalent: "+result.presentationsEquivalent+
  "; packet sessions distinct: "+result.distinctPacketSessions);
 if(!result.presentationsEquivalent)process.exitCode=1;
}
