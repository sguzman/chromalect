// Reproducible complementary source-owner locators for the 49 warning pairs.
// These are visual review aids, not independently verified component labels.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {createHash} from "node:crypto";
import {pathToFileURL} from "node:url";

const SCHEMA="chromalect.glyph.owner-complement-locators.v0.1";
const ROOT="glyphs/research/owner-complement-locators-v0.1";
const TARGET_ROOT="glyphs/research/heldout-identification-target-v0.1";
const SOURCE_PATH="glyphs/research/heldout-identification-target-v0.1/index-v0.1.json";
const PATH=/<path d="([^"]+)" fill="(#[0-9A-Fa-f]{6})" data-component="(cmp-\d{4})"\/>/g;
const sha=value=>createHash("sha256").update(value,"utf8").digest("hex");
const safeSVG=p=>typeof p==="string"&&p.startsWith("glyphs/")&&
 !p.includes("..")&&/^glyphs\/[A-Za-z0-9/_-]+\.svg$/.test(p);
function mask(source,owner){
 const paths=[...source.matchAll(PATH)];
 assert.ok(paths.length>0,"Source paths are required");
 let selected=0,visited=0;
 const svg=source.replace(PATH,(whole,d,hex,id)=>{
  assert.equal(whole,paths[visited++][0],"Source path ordering changed");
  if(id===owner)selected++;
  return whole.replace('fill="'+hex+'"','fill="'+(id===owner?"#252525":"#dedede")+'"');
 }).replace(/<svg ([^\n]*) role="img" aria-label="[^"]*">/,
  '<svg $1 role="img" aria-label="Unverified source-aligned component region locator">')
  .replace(/<title>[^<]*<\/title>/,
  '<title>Dark region: source-mapping component location; no certified owner</title>');
 assert.equal(visited,paths.length);
 assert.ok(selected>0&&selected<paths.length,"Owner must identify a proper source subset");
 const output=[...svg.matchAll(PATH)];
 assert.equal(output.length,paths.length);
 assert.deepEqual(output.map(p=>[p[1],p[3]]),paths.map(p=>[p[1],p[3]]),
  "Locator must retain original path geometry and owner IDs");
 assert.ok(output.every(p=>p[2]===(p[3]===owner?"#252525":"#dedede")));
 return {svg,count:selected,paths:output};
}
export function deriveComplementLocators(targets,readSVG){
 assert.equal(targets.schema,"chromalect.glyph.heldout-identification-targets.v0.1");
 assert.equal(targets.status,
  "machine_assigned_source_owner_ground_truth_not_independent_visual_adjudication");
 assert.equal(targets.source.activePalette,"mandarin-component-identity@0.6.0");
 assert.equal(targets.source.ownerKeyIndependentlyVerified,false);
 assert.equal(targets.source.sourceGeometryModified,false);
 assert.equal(targets.summary.warningObservations,49);
 assert.equal(targets.summary.independentlyVerifiedAnswerKeys,0);
 assert.equal(targets.targets.length,49);
 const records=[],files=new Map(),seen=new Set(),kinds={introduced:0,resolved:0,retained:0};
 for(const t of targets.targets){
  assert.ok(!seen.has(t.id)&&/^\d{1,4}-cmp-\d{4}-cmp-\d{4}$/.test(t.id));
  seen.add(t.id);
  assert.ok(safeSVG(t.sourceSVG)&&safeSVG(t.locatorSVG)&&
   t.locatorSVG===TARGET_ROOT+"/"+t.id+".svg");
  assert.ok(t.offeredComponents.length===2&&
   t.offeredComponents.some(x=>x.id===t.machineAssignedOwner)&&
   t.offeredComponents.some(x=>x.id===t.otherOwner)&&
   t.machineAssignedOwner!==t.otherOwner);
  assert.equal(t.sourceOwnershipIndependentlyCertified,false);
  assert.equal(t.sourceGeometryUnmodified,true);
  assert.equal(t.locatorUsesSameSourcePathGeometry,true);
  assert.equal(t.semanticsApproved,false);
  assert.ok(Object.hasOwn(kinds,t.reviewState));
  kinds[t.reviewState]++;
  const source=readSVG(t.sourceSVG);
  assert.equal(sha(source),t.sourceSHA256,"Source SVG content drift");
  const existing=readSVG(t.locatorSVG);
  assert.equal(sha(existing),t.locatorSHA256,"Original target locator drift");
  const targetMask=mask(source,t.machineAssignedOwner);
  assert.equal(existing,targetMask.svg,
   "Original machine target locator differs from source-derived mask");
  assert.equal(targetMask.count,t.targetRegionPaths);
  assert.equal(targetMask.paths.length,t.sourceStrokePaths);
  const altMask=mask(source,t.otherOwner);
  assert.notEqual(sha(altMask.svg),sha(existing));
  for(let i=0;i<altMask.paths.length;i++){
   const own=targetMask.paths[i][2]==="#252525";
   const alt=altMask.paths[i][2]==="#252525";
   assert.ok(!(own&&alt),"Two distinct source components must not overlap in path ownership");
  }
  const file=t.id+".svg",url=ROOT+"/"+file;
  files.set(file,altMask.svg);
  records.push({
   trialId:t.id,rank:t.rank,character:t.character,reviewState:t.reviewState,
   sourceSVG:t.sourceSVG,sourceSHA256:t.sourceSHA256,
   locatorSVG:t.locatorSVG,locatorSHA256:t.locatorSHA256,
   machineAssignedOwner:t.machineAssignedOwner,otherOwner:t.otherOwner,
   complementarySVG:url,complementarySHA256:sha(altMask.svg),
   originalTargetPaths:t.targetRegionPaths,
   complementaryTargetPaths:altMask.count,totalSourcePaths:t.sourceStrokePaths,
   unchangedPathGeometry:true,independentOwnershipCertified:false,
   participantStudyEligible:false,semanticApproval:false
  });
 }
 assert.equal(records.length,49);
 assert.deepEqual(kinds,{introduced:23,resolved:21,retained:5});
 assert.equal(files.size,49);
 return {manifest:{schema:SCHEMA,
  status:"source_owned_complementary_region_masks_not_independent_adjudication",
  source:{identificationTargets:SOURCE_PATH,
   paletteVersion:"mandarin-component-identity@0.6.0",
   sourceSVGsChanged:false,originalLocatorSVGsChanged:false,
   independentKeyApproval:false},
  summary:{warningPairs:49,sourceGlyphs:48,complementaryMasks:49,
   independentlyApprovedOwners:0,humanVisualCertifications:0,eligibleStudyItems:0},
  records},files};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const targets=JSON.parse(fs.readFileSync("site/"+SOURCE_PATH,"utf8"));
 const result=deriveComplementLocators(targets,p=>fs.readFileSync("site/"+p,"utf8"));
 const dir=path.join("site",ROOT);
 const content=JSON.stringify(result.manifest,null,2)+"\n";
 if(process.argv.includes("--write")){
  fs.mkdirSync(dir,{recursive:true});
  for(const [name,svg] of result.files)fs.writeFileSync(path.join(dir,name),svg,"utf8");
  fs.writeFileSync(path.join(dir,"index-v0.1.json"),content,"utf8");
 }else if(process.argv.includes("--check")){
  assert.equal(fs.readFileSync(path.join(dir,"index-v0.1.json"),"utf8"),content);
  assert.deepEqual(fs.readdirSync(dir).sort(),
   ["index-v0.1.json",...result.files.keys()].sort());
  for(const [name,svg] of result.files)
   assert.equal(fs.readFileSync(path.join(dir,name),"utf8"),svg);
 }else throw Error("Use --write or --check");
 console.log("Source-derived complementary locator masks: 49 / 49; independently certified: 0.");
}
