// Explicit local-only key-separated packet preparation for future review design.
// No independent review authorization, observations or certifications are created.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {randomBytes,randomInt} from "node:crypto";
import {pathToFileURL} from "node:url";
import {deriveMaskedStimuli} from "./source_owner_masked_stimuli.mjs";

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
function allowedOutsideRepository(p){
 assert.ok(path.isAbsolute(p),"Explicit absolute destination required");
 const root=fs.realpathSync(process.cwd());
 const parent=fs.realpathSync(path.dirname(p));
 assert.ok(parent!==root&&!parent.startsWith(root+path.sep),
  "Reviewer packet and private coordinator file must remain outside the public repository");
 return path.join(parent,path.basename(p));
}
export function writeOfflinePacket(packet,reviewerDir,privateCoordinatorFile){
 const review=allowedOutsideRepository(reviewerDir);
 const mapping=allowedOutsideRepository(privateCoordinatorFile);
 assert.ok(review!==mapping&&mapping!==path.join(review,"index-v0.1.json"));
 assert.ok(mapping!==review&&
  !mapping.startsWith(review+path.sep),"Coordinator map must not reside inside reviewer packet");
 assert.ok(!fs.existsSync(review)&&!fs.existsSync(mapping),
  "Refuse to overwrite existing reviewer package or coordinator map");
 let created=false;
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
  // Only the separate explicitly chosen path receives any machine answer key.
  exclusive(mapping,encode(packet.coordinatorMap));
 }catch(e){
  if(created)fs.rmSync(review,{recursive:true,force:true});
  throw e;
 }
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const args=process.argv.slice(2);
 assert.equal(args.length,4,
  "Use --reviewer-dir ABSOLUTE_DIRECTORY --coordinator-map ABSOLUTE_FILE");
 assert.equal(args[0],"--reviewer-dir");
 assert.equal(args[2],"--coordinator-map");
 const reviewer=allowedOutsideRepository(args[1]);
 const mapping=allowedOutsideRepository(args[3]);
 const source=JSON.parse(fs.readFileSync("site/"+TARGET,"utf8"));
 const packet=deriveOfflineReviewerPacket(source,p=>fs.readFileSync("site/"+p,"utf8"));
 writeOfflinePacket(packet,reviewer,mapping);
 console.log("Offline neutral review packet prepared: 49 pairs, 98 masks, no participants or independent approvals. Coordinator file kept separate.");
}
