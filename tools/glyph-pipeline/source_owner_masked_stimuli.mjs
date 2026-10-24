// Source-verified, key-separated neutral A/B masks for read-only rehearsal.
// This public dataset does not create true reviewer blinding or accepted source ownership.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {createHash} from "node:crypto";
import {pathToFileURL} from "node:url";
import {deriveComplementLocators} from "./component_owner_complement_locators.mjs";
import "../../site/source-owner-neutral-svg-contract.js";
const validateNeutral=globalThis.ChromalectNeutralRegionSVG.validate;
const ROOT="glyphs/research/owner-masked-stimuli-v0.1";
const TARGET="glyphs/research/heldout-identification-target-v0.1/index-v0.1.json";
const PATH=/<path d="([^"]+)" fill="(#[0-9A-Fa-f]{6})" data-component="(cmp-\d{4})"\/>/g;
const CLEAN=/<path d="([^"]+)" fill="(#[0-9A-Fa-f]{6})"\/>/g;
const sha=s=>createHash("sha256").update(s,"utf8").digest("hex");
const safe=p=>typeof p==="string"&&
 /^glyphs\/[A-Za-z0-9/_.+-]+\.svg$/.test(p)&&!p.includes("..");
function neutralize(svg,expected){
 const src=[...svg.matchAll(PATH)];
 assert.ok(src.length>0&&src.length===expected,
  "Expected pinned source owner geometry in every mask");
 const out=svg.replace(PATH,(whole,d,fill,owner)=>whole.replace(
  ' data-component="'+owner+'"',""))
  .replace(/aria-label="[^"]*"/g,'aria-label="Unverified neutral source region"')
  .replace(/<title>[^<]*<\/title>/g,
   "<title>Neutral visual region; no independently verified component owner</title>");
 const paths=[...out.matchAll(CLEAN)];
 assert.equal(paths.length,src.length,"Neutral mask path count drift");
 assert.deepEqual(paths.map(x=>[x[1],x[2]]),
  src.map(x=>[x[1],x[2]]),"SVG geometry and fill must be byte-exact");
 assert.ok(!out.includes("data-component")&&!/cmp-\d{4}/.test(out),
  "Machine component ID leaked into display SVG");
 assert.equal(paths.filter(x=>x[2]==="#252525").length+
  paths.filter(x=>x[2]==="#dedede").length,paths.length,
  "Mask must not contain active component palette colors");
 return {svg:out,paths};
}
export function deriveMaskedStimuli(source,readSVG){
 const paired=deriveComplementLocators(source,readSVG);
 const rows=[],files=new Map(),seen=new Set(),counts={introduced:0,resolved:0,retained:0};
 let primaryA=0,primaryB=0;
 for(const t of source.targets){
  const c=paired.manifest.records.find(x=>x.trialId===t.id);
  assert.ok(c&&!seen.has(t.id));
  seen.add(t.id);
  assert.ok(safe(t.locatorSVG)&&safe(c.complementarySVG));
  const main=readSVG(t.locatorSVG);
  assert.equal(sha(main),t.locatorSHA256,"Original source target hash drift");
  const other=paired.files.get(t.id+".svg");
  assert.equal(sha(other),c.complementarySHA256);
  const owned=t.offeredComponents.map(x=>{
   const raw=x.id===t.machineAssignedOwner?main:
    x.id===t.otherOwner?other:null;
   assert.ok(raw,"Unrecognized candidate owner in pinned target");
   const neutral=neutralize(raw,t.sourceStrokePaths);
   assert.equal(neutral.paths.filter(p=>p[2]==="#252525").length,
    x.id===t.machineAssignedOwner?t.targetRegionPaths:c.complementaryTargetPaths);
   return {form:x.form,neutral};
  });
  assert.equal(owned.length,2);
  assert.notEqual(sha(owned[0].neutral.svg),sha(owned[1].neutral.svg));
  const highlighted=owned.map(x=>x.neutral.paths.map(p=>p[2]==="#252525"));
  for(let i=0;i<t.sourceStrokePaths;i++)
   assert.ok(!(highlighted[0][i]&&highlighted[1][i]),
    "Disjoint source owner regions must remain disjoint");
  const candidates=owned.map((x,i)=>{
   validateNeutral(x.neutral.svg,t.sourceStrokePaths,highlighted[i].filter(Boolean).length);
   const slot=i===0?"A":"B";
   const name=t.id+"--"+slot+".svg";
   files.set(name,x.neutral.svg);
   return {slot,form:x.form,svg:ROOT+"/"+name,
    sha256:sha(x.neutral.svg),
    highlightedPaths:highlighted[i].filter(Boolean).length};
  });
  if(t.offeredComponents[0].id===t.machineAssignedOwner)primaryA++;else primaryB++;
  counts[t.reviewState]++;
  rows.push({
   id:t.id,rank:t.rank,character:t.character,reviewState:t.reviewState,
   sourceSHA256:t.sourceSHA256,sourceStrokePaths:t.sourceStrokePaths,
   candidates,independentlyVerifiedOwner:false,
   evidenceCollectionEnabled:false,learningStudyEligible:false
  });
 }
 assert.equal(rows.length,49);assert.equal(files.size,98);
 assert.equal(primaryA,25);assert.equal(primaryB,24);
 assert.deepEqual(counts,{introduced:23,resolved:21,retained:5});
 const manifest={
  schema:"chromalect.glyph.owner-masked-stimuli.v0.1",
  status:"neutral_key_separated_preview_not_independently_blinded_or_reviewed",
  source:{
   originalTargetManifest:TARGET,paletteVersion:"mandarin-component-identity@0.6.0",
   ownerKeysInPublishedStimuli:false,
   ownerKeysRemainPublicInOriginalManifests:true,
   sourcePathGeometryModified:false,independentKeyAcceptance:false
  },
  summary:{
   pairs:49,characters:48,maskFiles:98,
   introduced:23,resolved:21,retained:5,
   independentlyAcceptedOwners:0,
   participantResponsesCollected:0,eligibleStudyItems:0
  },records:rows
 };
 const serialized=JSON.stringify(manifest);
 for(const phrase of ["machineAssignedOwner","otherOwner","locatorSHA256",
  "sourceOwnershipIndependentlyCertified","data-component"]){
  assert.ok(!serialized.includes(phrase),"Machine-key field leaked into neutral manifest");
 }
 return {manifest,files};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const source=JSON.parse(fs.readFileSync("site/"+TARGET,"utf8"));
 const result=deriveMaskedStimuli(source,p=>fs.readFileSync("site/"+p,"utf8"));
 const dir=path.join("site",ROOT);
 const body=JSON.stringify(result.manifest,null,2)+"\n";
 if(process.argv.length!==3||!["--write","--check"].includes(process.argv[2]))
  throw Error("Use --write or --check");
 if(process.argv[2]==="--write"){
  fs.mkdirSync(dir,{recursive:true});
  for(const [name,svg] of result.files)fs.writeFileSync(path.join(dir,name),svg,"utf8");
  fs.writeFileSync(path.join(dir,"index-v0.1.json"),body,"utf8");
 }else{
  assert.equal(fs.readFileSync(path.join(dir,"index-v0.1.json"),"utf8"),body);
  assert.deepEqual(fs.readdirSync(dir).sort(),
   ["index-v0.1.json",...result.files.keys()].sort());
  for(const [name,svg] of result.files)
   assert.equal(fs.readFileSync(path.join(dir,name),"utf8"),svg);
 }
 console.log("49 source-pinned key-separated provisional pairs, 98 neutral region masks, 0 independent reviews.");
}
