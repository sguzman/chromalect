import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import {createHash} from "node:crypto";
import {deriveMaskedStimuli} from "./source_owner_masked_stimuli.mjs";
import "../../site/source-owner-neutral-svg-contract.js";
const checkSVG=globalThis.ChromalectNeutralRegionSVG.validate;
const source=JSON.parse(fs.readFileSync(
 "site/glyphs/research/heldout-identification-target-v0.1/index-v0.1.json","utf8"));
const read=p=>fs.readFileSync("site/"+p,"utf8");
const sha=s=>createHash("sha256").update(s,"utf8").digest("hex");
const {manifest,files}=deriveMaskedStimuli(source,read);
assert.equal(manifest.summary.pairs,49);
assert.equal(manifest.summary.characters,48);
assert.equal(manifest.summary.maskFiles,98);
assert.equal(manifest.summary.independentlyAcceptedOwners,0);
assert.equal(files.size,98);
const ctx={URL,Map,Set};ctx.globalThis=ctx;
vm.runInNewContext(fs.readFileSync(
 "site/source-owner-masked-preview-core.js","utf8"),ctx);
const validate=ctx.ChromalectMaskedSourcePreview.validate;
assert.equal(validate(manifest).length,49);
const exact=/<path d="([^"]+)" fill="(#[0-9A-Fa-f]{6})"\/>/g;
const old=/<path d="([^"]+)" fill="(#[0-9A-Fa-f]{6})" data-component="(cmp-\d{4})"\/>/g;
let targetA=0,targetB=0;
for(let i=0;i<49;i++){
 const row=manifest.records[i],t=source.targets[i];
 assert.equal(row.id,t.id);
 assert.equal(row.sourceSHA256,t.sourceSHA256);
 assert.equal(row.independentlyVerifiedOwner,false);
 assert.equal(row.evidenceCollectionEnabled,false);
 assert.equal(row.learningStudyEligible,false);
 const originals=[t.locatorSVG,"glyphs/research/owner-complement-locators-v0.1/"+t.id+".svg"];
 const oldSvg=originals.map(read);
 const oldSvgRows=oldSvg.map(s=>[...s.matchAll(old)]);
 assert.equal(oldSvgRows[0].length,t.sourceStrokePaths);
 assert.equal(oldSvgRows[1].length,t.sourceStrokePaths);
 const masks=row.candidates.map(c=>{
  const svg=files.get(t.id+"--"+c.slot+".svg");
  assert.equal(sha(svg),c.sha256);
  assert.equal(checkSVG(svg,row.sourceStrokePaths,c.highlightedPaths),true);
  assert.ok(!svg.includes("data-component"));
  assert.ok(!/cmp-\d{4}/.test(svg));
  const matched=[...svg.matchAll(exact)];
  assert.equal(matched.length,t.sourceStrokePaths);
  assert.equal(matched.filter(x=>x[2]==="#252525").length,c.highlightedPaths);
  return {matched,svg};
 });
 for(const k of [0,1]){
  const m=masks[k].matched.map(x=>[x[1],x[2]]);
  const expected=oldSvgRows[0].map(x=>[x[1],x[2]]);
  const other=oldSvgRows[1].map(x=>[x[1],x[2]]);
  assert.ok(JSON.stringify(m)===JSON.stringify(expected)||
   JSON.stringify(m)===JSON.stringify(other),"Neutral output must preserve exact source path geometry and fill");
 }
 for(let k=0;k<t.sourceStrokePaths;k++)
  assert.ok(!(masks[0].matched[k][2]==="#252525"&&
   masks[1].matched[k][2]==="#252525"));
 if(row.candidates[0].highlightedPaths===t.targetRegionPaths&&
  row.candidates[0].sha256===sha(masks[0].svg))targetA++;
 else targetB++;
}
assert.equal(targetA+targetB,49);
const serialized=JSON.stringify(manifest);
for(const token of ["machineAssignedOwner","otherOwner","data-component",
 "locatorSHA256","humanIdentificationResultRecorded"]){
 assert.ok(!serialized.includes(token),token);
}
const poisoned=mutate=>{
 const copy=structuredClone(manifest);mutate(copy);
 assert.throws(()=>validate(copy));
};
poisoned(m=>{m.source.independentKeyAcceptance=true;});
poisoned(m=>{m.source.ownerKeysInPublishedStimuli=true;});
poisoned(m=>{m.summary.independentlyAcceptedOwners=1;});
poisoned(m=>{m.records[0].machineAssignedOwner="cmp-0001";});
poisoned(m=>{m.records[0].candidates[0].componentId="cmp-0001";});
poisoned(m=>{m.records[0].candidates[0].svg="../bad.svg";});
poisoned(m=>{m.records[0].candidates[0].sha256="not-a-sha";});
poisoned(m=>{m.records[0].candidates[0].highlightedPaths=999;});
poisoned(m=>{m.records[1].id=m.records[0].id;});
poisoned(m=>{m.records[0].learningStudyEligible=true;});
poisoned(m=>{m.records[0].reviewState="approved";});
const mutated=structuredClone(source);
mutated.targets[0].locatorSHA256="0".repeat(64);
assert.throws(()=>deriveMaskedStimuli(mutated,read));
assert.throws(()=>deriveMaskedStimuli(source,p=>
 read(p).replace('data-component="','data-component="bad')));
const canonical=files.values().next().value;
const first=manifest.records[0].candidates[0];
assert.equal(checkSVG(canonical,manifest.records[0].sourceStrokePaths,
 first.highlightedPaths),true);
const rejects=[
 canonical.replace("</g>","<script>alert(1)</script></g>"),
 canonical.replace("<g transform=", '<g onload="alert(1)" transform='),
 canonical.replace("<path ", '<path onclick="alert(1)" '),
 canonical.replace("</g>", '<foreignObject><div>HTML</div></foreignObject></g>'),
 canonical.replace("</g>", '<image href="https://example.org/tracker"/></g>'),
 canonical.replace("scale(1,-1)", "scale(2,-1)"),
 canonical.replace('viewBox="0 0 1024 1024"','viewBox="0 0 1024 1023"'),
 canonical.replace('fill="#252525"','fill="#FF0000"'),
 canonical.replace("</svg>","</svg><svg/>"),
 canonical.replace('d="','d="M0;'),
 canonical+"<!-- hidden payload -->",
 canonical.replace('role="img"','role="image"')
];
for(const svg of rejects)
 assert.throws(()=>checkSVG(svg,manifest.records[0].sourceStrokePaths,
  first.highlightedPaths),"Unexpected SVG content must fail the allowlist");
assert.throws(()=>checkSVG(canonical,manifest.records[0].sourceStrokePaths+1,
 first.highlightedPaths));
assert.throws(()=>checkSVG(canonical,manifest.records[0].sourceStrokePaths,
 first.highlightedPaths+1));
assert.throws(()=>checkSVG(canonical,manifest.records[0].sourceStrokePaths,
 0));
console.log("49-pair neutral stimulus regeneration and exact SVG allowlist: 98 valid masks, 12 active-content/markup poisons and 3 path-count poisons rejected.");
