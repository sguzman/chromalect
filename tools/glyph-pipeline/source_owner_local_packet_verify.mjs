// Offline reviewer-packet verification. Never reads the private coordinator map.
// Checks self-consistency and source-shaped SVGs, not independent owner truth.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {createHash} from "node:crypto";
import {pathToFileURL} from "node:url";
import "../../site/source-owner-neutral-svg-contract.js";
import {publicREADME,renderOfflinePacketGallery} from "./source_owner_local_packet.mjs";
import {buildOfflinePacketReceipt,RECEIPT_FILE}
 from "./source_owner_local_receipt.mjs";

const SCHEMA="chromalect.glyph.local-keyless-packet.v0.1";
const STATUS="unapproved_local_reviewer_packet_preparation_not_a_blinded_study";
const ID=/^p-[a-f0-9]{32}$/;
const SHA=/^[a-f0-9]{64}$/;
const exact=(obj,names)=>!!obj&&typeof obj==="object"&&!Array.isArray(obj)&&
 Object.keys(obj).length===names.length&&names.every(name=>Object.hasOwn(obj,name));
function requireShape(ok,msg){if(!ok)throw Error(msg);}
const sorted=values=>[...values].sort();
const same=(a,b)=>JSON.stringify(sorted(a))===JSON.stringify(sorted(b));
const digest=value=>createHash("sha256").update(value).digest("hex");
function readRegular(root,rel,maxBytes){
 const filename=path.join(root,rel);
 const stat=fs.lstatSync(filename);
 requireShape(stat.isFile()&&!stat.isSymbolicLink()&&stat.size<=maxBytes,
  "Unexpected packet file type or size: "+rel);
 return fs.readFileSync(filename);
}
function decoded(buffer,rel){
 try{return new TextDecoder("utf-8",{fatal:true}).decode(buffer);}
 catch{throw Error("Invalid UTF-8 in packet file: "+rel);}
}
export function verifyOfflinePacket(directory){
 requireShape(typeof directory==="string"&&path.isAbsolute(directory),
  "An absolute offline packet directory is required");
 const root=path.resolve(directory);
 requireShape(fs.lstatSync(root).isDirectory()&&!fs.lstatSync(root).isSymbolicLink(),
  "Reviewer packet must be a real directory");
 const rootFiles=fs.readdirSync(root);
 requireShape(same(rootFiles,["README.md","index.html","index-v0.1.json",
  "masks",RECEIPT_FILE]),
  "Unexpected or missing reviewer packet files");
 const masksPath=path.join(root,"masks");
 requireShape(fs.lstatSync(masksPath).isDirectory()&&
  !fs.lstatSync(masksPath).isSymbolicLink(),
  "Reviewer masks directory must not be a symlink");
 const manifestBytes=readRegular(root,"index-v0.1.json",256*1024);
 const manifest=JSON.parse(decoded(manifestBytes,"index-v0.1.json"));
 requireShape(exact(manifest,["schema","status","packetSession","summary","records"])&&
  manifest.schema===SCHEMA&&manifest.status===STATUS&&
  ID.test(manifest.packetSession),"Invalid or promoted offline packet");
 const s=manifest.summary;
 requireShape(exact(s,["pairs","neutralSVGs","participantResponses",
  "independentlyCertifiedOwners","approvedStudies"])&&
  s.pairs===49&&s.neutralSVGs===98&&s.participantResponses===0&&
  s.independentlyCertifiedOwners===0&&s.approvedStudies===0&&
  Array.isArray(manifest.records)&&manifest.records.length===49,
  "Offline packet acceptance and counts must remain unapproved");
 const seen=new Set([manifest.packetSession]),characters=new Set(),files=[];
 for(const row of manifest.records){
  requireShape(exact(row,["packetId","character","sourceStrokePaths",
   "candidates","sourceOwnerIndependentlyVerified",
   "participantResponseRecorded","studyEligible"])&&
   ID.test(row.packetId)&&!seen.has(row.packetId)&&
   typeof row.character==="string"&&[...row.character].length===1&&
   Number.isInteger(row.sourceStrokePaths)&&row.sourceStrokePaths>=2&&
   row.sourceStrokePaths<=300&&
   row.sourceOwnerIndependentlyVerified===false&&
   row.participantResponseRecorded===false&&row.studyEligible===false&&
   Array.isArray(row.candidates)&&row.candidates.length===2,
   "Invalid offline pair or unexpected approval fields");
  seen.add(row.packetId);
  characters.add(row.character);
  let highlighted=0;
  for(let i=0;i<2;i++){
   const c=row.candidates[i],slot=i===0?"A":"B";
   requireShape(exact(c,["slot","form","file","sha256","highlightedPaths"])&&
    c.slot===slot&&typeof c.form==="string"&&
    c.form.length>0&&c.form.length<=24&&
    c.file==="masks/"+row.packetId+"--"+slot+".svg"&&
    SHA.test(c.sha256)&&Number.isInteger(c.highlightedPaths)&&
    c.highlightedPaths>0&&c.highlightedPaths<row.sourceStrokePaths,
    "Invalid neutral source mask metadata");
   highlighted+=c.highlightedPaths;
   files.push(c.file.slice("masks/".length));
  }
  requireShape(highlighted<=row.sourceStrokePaths&&
   row.candidates[0].sha256!==row.candidates[1].sha256,
   "Pair regions have conflicting source-path counts");
 }
 requireShape(seen.size===50&&characters.size===48,"Duplicate or missing packet identities");
 requireShape(same(fs.readdirSync(masksPath),files)&&new Set(files).size===98,
  "Missing, duplicated or extraneous neutral source SVG");
 const parts=new Map([["index-v0.1.json",manifestBytes]]);
 const text=decoded(manifestBytes,"index-v0.1.json");
 requireShape(text===JSON.stringify(manifest,null,2)+"\n",
  "Offline packet JSON must use the canonical serialization");
 const readme=readRegular(root,"README.md",16*1024);
 const gallery=readRegular(root,"index.html",512*1024);
 requireShape(decoded(readme,"README.md")===publicREADME,
  "Packet scope and eligibility notice differs from the source template");
 requireShape(decoded(gallery,"index.html")===renderOfflinePacketGallery(manifest),
  "Offline presentation differs from the validated, read-only layout");
 parts.set("README.md",readme);
 parts.set("index.html",gallery);
 for(const row of manifest.records){
  for(const c of row.candidates){
   const svgBytes=readRegular(root,c.file,1048576);
   requireShape(digest(svgBytes)===c.sha256,
    "Offline neutral SVG digest differs from its manifest");
   const svg=decoded(svgBytes,c.file);
   globalThis.ChromalectNeutralRegionSVG.validate(
    svg,row.sourceStrokePaths,c.highlightedPaths);
   parts.set(c.file,svgBytes);
  }
 }
 const actualReceiptBytes=readRegular(root,RECEIPT_FILE,32*1024);
 const receipt=JSON.parse(decoded(actualReceiptBytes,RECEIPT_FILE));
 const expectedReceipt=buildOfflinePacketReceipt(manifest.packetSession,parts);
 requireShape(JSON.stringify(receipt)===JSON.stringify(expectedReceipt)&&
  decoded(actualReceiptBytes,RECEIPT_FILE)===
   JSON.stringify(expectedReceipt,null,2)+"\n",
  "Offline receipt must cover the exact contents of all 101 packet files");
 return {pairs:49,masks:98,independentlyAcceptedOwners:0,participantResponses:0};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const argv=process.argv.slice(2);
 const print=argv.length===3&&argv[2]==="--fingerprint";
 const expect=argv.length===4&&argv[2]==="--expect-fingerprint"&&
  /^[a-f0-9]{64}$/.test(argv[3]);
 assert.ok(argv[0]==="--packet-dir"&&(argv.length===2||print||expect),
  "Usage: node source_owner_local_packet_verify.mjs --packet-dir ABSOLUTE_DIRECTORY [--fingerprint | --expect-fingerprint SHA256]");
 const result=verifyOfflinePacket(argv[1]);
 const receipt=JSON.parse(fs.readFileSync(path.join(argv[1],RECEIPT_FILE),"utf8"));
 if(expect)assert.equal(receipt.rootSHA256,argv[3],
  "Offline packet differs from the externally preserved content fingerprint");
 console.log("Offline reviewer packet self-consistency verified: "+result.pairs+
  " pairs, "+result.masks+" neutral SVGs, 0 independent source-owner approvals.");
 if(print)console.log("Packet content fingerprint (not a signature): "+receipt.rootSHA256);
 if(expect)console.log("Externally supplied SHA-256 fingerprint matches this packet.");
}
