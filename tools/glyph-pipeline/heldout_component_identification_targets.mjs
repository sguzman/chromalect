// Source-derived component-identification locator stimuli.
// Each separate monochrome locator darkens one original component owner.
// The two experimental color SVGs and active palette remain unmodified.
// A source-mapping answer key is not independently certified truth.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {createHash} from "node:crypto";
import {pathToFileURL} from "node:url";
import {deriveHeldoutWarningGallery} from "./heldout_color_warning_gallery.mjs";
const PATH=/<path d="([^"]+)" fill="(#[0-9A-Fa-f]{6})" data-component="(cmp-\d{4})"\/>/g;
const ROOT="glyphs/research/heldout-identification-target-v0.1";
const sha=x=>createHash("sha256").update(x,"utf8").digest("hex");
const neutral=s=>s.replace(PATH,(whole,d,hex)=>whole.replace('fill="'+hex+'"','fill="#000000"'));
export function deriveIdentificationTargets(catalog,mappings,palette,folds,manifest,readSVG){
 const replay=deriveHeldoutWarningGallery(catalog,mappings,palette,folds,readSVG);
 assert.deepEqual(replay.manifest,manifest,
  "Identification prompts must derive from the same held-out source warning review");
 const rows=[],svgs=new Map(),ids=new Set();
 let index=0;
 for(const row of manifest.glyphs){
  const file=row.originalSVG.slice("glyphs/".length);
  const source=readSVG(file);
  assert.equal(sha(source),row.originalSHA256);
  const paths=[...source.matchAll(PATH)];
  assert.equal(paths.length,row.sourceOwnedPaths);
  const sourceOwners=new Set(paths.map(x=>x[3]));
  assert.ok(paths.length&&sourceOwners.size>=2);
  for(const pair of row.pairs){
   const key=row.rank+"-"+[pair.componentA.id,pair.componentB.id].sort().join("-");
   assert.match(key,/^\d{1,4}-cmp-\d{4}-cmp-\d{4}$/);
   assert.ok(!ids.has(key),"A source pair must not create duplicate locator trials");
   ids.add(key);
   const target=index%2===0?pair.componentA:pair.componentB;
   const distractor=index%2===0?pair.componentB:pair.componentA;
   assert.notEqual(target.id,distractor.id);
   assert.ok(sourceOwners.has(target.id)&&sourceOwners.has(distractor.id));
   const maskName=key+".svg";
   let selected=0,position=0;
   const locator=source.replace(PATH,(whole,d,hex,id)=>{
    assert.equal(whole,paths[position][0]);
    position++;
    const isTarget=id===target.id;
    if(isTarget)selected++;
    return whole.replace('fill="'+hex+'"',
     'fill="'+(isTarget?"#252525":"#dedede")+'"');
   }).replace(/<svg ([^\n]*) role="img" aria-label="[^"]*">/,
    '<svg $1 role="img" aria-label="Unverified source-aligned component region locator">')
    .replace(/<title>[^<]*<\/title>/,
     '<title>Dark region: source-mapping component location; no certified owner</title>');
   assert.equal(position,paths.length);
   assert.ok(selected>0);
   assert.equal(neutral(locator.replace("fill=\"#252525\"","fill=\"#000000\"").replaceAll("fill=\"#dedede\"","fill=\"#000000\""))
    .includes('data-component="'),true);
   const originalStructure=source.match(/<g transform="[^"]+">/);
   const locStructure=locator.match(/<g transform="[^"]+">/);
   assert.ok(originalStructure&&locStructure&&originalStructure[0]===locStructure[0]);
   assert.equal([...locator.matchAll(PATH)].length,paths.length);
   assert.deepEqual([...locator.matchAll(PATH)].map(x=>[x[1],x[3]]),
    paths.map(x=>[x[1],x[3]]));
   assert.ok(!locator.includes(row.character+" component colors"));
   svgs.set(maskName,locator);
   rows.push({
    id:key,rank:row.rank,character:row.character,foldIndex:row.foldIndex,
    reviewState:pair.reviewState,
    sourceSVG:row.originalSVG,foldSVG:row.heldoutSVG,
    locatorSVG:ROOT+"/"+maskName,
    sourceSHA256:row.originalSHA256,foldSHA256:row.heldoutSHA256,
    locatorSHA256:sha(locator),
    sourceStrokePaths:paths.length,targetRegionPaths:selected,
    offeredComponents:[
     {id:pair.componentA.id,form:pair.componentA.form},
     {id:pair.componentB.id,form:pair.componentB.form}
    ],
    machineAssignedOwner:target.id,otherOwner:distractor.id,
    targetSelectionRule:"alternating_A_B_by_source_warning_order",
    sourceGeometryUnmodified:true,
    locatorUsesSameSourcePathGeometry:true,
    sourceOwnershipIndependentlyCertified:false,
    humanIdentificationResultRecorded:false,
    semanticsApproved:false
   });
   index++;
  }
 }
 assert.equal(rows.length,49);
 assert.equal(rows.filter(x=>x.reviewState==="introduced").length,23);
 assert.equal(rows.filter(x=>x.reviewState==="resolved").length,21);
 assert.equal(rows.filter(x=>x.reviewState==="retained").length,5);
 assert.equal(rows.filter((x,i)=>x.machineAssignedOwner===x.offeredComponents[0].id).length,25);
 assert.equal(svgs.size,49);
 return {manifest:{
  schema:"chromalect.glyph.heldout-identification-targets.v0.1",
  status:"machine_assigned_source_owner_ground_truth_not_independent_visual_adjudication",
  source:{warningManifest:"glyphs/research/heldout-warning-v0.1/index-v0.1.json",
   activePalette:"mandarin-component-identity@0.6.0",
   sourceGeometryModified:false,
   foldExperimentalGlyphsModified:false,
   targetLocatorsSeparateFromColorConditions:true,
   ownerKeyIndependentlyVerified:false,
   participantStudyApproved:false,
   semanticMeaningApproved:false},
  summary:{catalogCharacters:1000,warningObservations:49,flaggedCharacters:48,
   introduced:23,resolved:21,retained:5,
   targetA:25,targetB:24,separateLocators:49,
   independentlyVisualCertified:0,
   independentlyVerifiedAnswerKeys:0,
   humanResponses:0,approvedSemanticMappings:0},
  targets:rows
 },files:svgs};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
 const built=deriveIdentificationTargets(
  read("data/catalog/characters-0001-1000.json"),
  read("site/glyphs/mappings.json"),
  read("palettes/mandarin-component-identity-v0.6.json"),
  read("site/semantic-group-hue-fivefold-heldout-v0.1.json"),
  read("site/glyphs/research/heldout-warning-v0.1/index-v0.1.json"),
  f=>fs.readFileSync("site/glyphs/"+f,"utf8"));
 const dir=path.join("site",ROOT),manifest=JSON.stringify(built.manifest,null,2)+"\n";
 if(process.argv.includes("--write")){
  fs.mkdirSync(dir,{recursive:true});
  for(const [f,s] of built.files)fs.writeFileSync(path.join(dir,f),s,"utf8");
  fs.writeFileSync(path.join(dir,"index-v0.1.json"),manifest,"utf8");
 }else if(process.argv.includes("--check")){
  assert.equal(fs.readFileSync(path.join(dir,"index-v0.1.json"),"utf8"),manifest);
  assert.deepEqual(fs.readdirSync(dir).sort(),
   ["index-v0.1.json",...built.files.keys()].sort());
  for(const [f,s] of built.files)
   assert.equal(fs.readFileSync(path.join(dir,f),"utf8"),s);
 }else throw Error("Use --write or --check");
 console.log("Machine-owned component locator targets:",
  JSON.stringify(built.manifest.summary));
}
