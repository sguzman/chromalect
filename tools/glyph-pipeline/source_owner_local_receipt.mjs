// Offline, key-free packet checksum receipt. Hashes are not signatures or approvals.
import assert from "node:assert/strict";
import {createHash} from "node:crypto";

export const RECEIPT_FILE="integrity-v0.1.json";
const ID=/^p-[0-9a-f]{32}$/;
const hash=value=>createHash("sha256").update(value).digest("hex");
const mask=/^masks\/p-[0-9a-f]{32}--[AB]\.svg$/;
export function buildOfflinePacketReceipt(session,parts){
 assert.match(session,ID);
 assert.ok(parts instanceof Map&&parts.size===101,
  "Receipt must cover README, manifest, gallery and exactly 98 masks");
 const filenames=[...parts.keys()].sort();
 assert.deepEqual(filenames.filter(x=>!mask.test(x)),
  ["README.md","index-v0.1.json","index.html"].sort(),
  "Unexpected packet file in checksum receipt");
 assert.equal(filenames.filter(x=>mask.test(x)).length,98);
 const files=filenames.map(filename=>{
  const contents=parts.get(filename);
  assert.ok(typeof contents==="string"||Buffer.isBuffer(contents),
   "Receipt input must contain exact file bytes");
  return {path:filename,sha256:hash(contents)};
 });
 const canonical="chromalect.glyph.offline-packet-receipt.v0.1\n"+
  session+"\n"+files.map(f=>f.path+"\t"+f.sha256+"\n").join("");
 return {
  schema:"chromalect.glyph.offline-packet-receipt.v0.1",
  status:"unapproved_neutral_source_packet_not_a_certification",
  packetSession:session,
  hashAlgorithm:"SHA-256",
  fileCount:101,
  files,
  rootSHA256:hash(canonical)
 };
}
