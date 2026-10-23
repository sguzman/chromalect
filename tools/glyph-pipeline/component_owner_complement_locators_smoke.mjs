import assert from "node:assert/strict";
import fs from "node:fs";
import {createHash} from "node:crypto";
import {deriveComplementLocators} from "./component_owner_complement_locators.mjs";
const manifest=JSON.parse(fs.readFileSync(
 "site/glyphs/research/heldout-identification-target-v0.1/index-v0.1.json","utf8"));
const read=p=>fs.readFileSync("site/"+p,"utf8");
const hash=s=>createHash("sha256").update(s,"utf8").digest("hex");
const {manifest:output,files}=deriveComplementLocators(manifest,read);
assert.equal(output.summary.warningPairs,49);
assert.equal(output.summary.sourceGlyphs,48);
assert.equal(output.summary.complementaryMasks,49);
assert.equal(output.summary.independentlyApprovedOwners,0);
assert.equal(files.size,49);
const pattern=/<path d="([^"]+)" fill="(#[0-9A-Fa-f]{6})" data-component="(cmp-\d{4})"\/>/g;
for(const r of output.records){
 const t=manifest.targets.find(x=>x.id===r.trialId);
 assert.ok(t);
 const other=files.get(r.trialId+".svg");
 assert.equal(hash(other),r.complementarySHA256);
 const original=[...read(t.sourceSVG).matchAll(pattern)];
 const prior=[...read(t.locatorSVG).matchAll(pattern)];
 const alt=[...other.matchAll(pattern)];
 assert.deepEqual(alt.map(x=>[x[1],x[3]]),original.map(x=>[x[1],x[3]]));
 assert.deepEqual(prior.map(x=>[x[1],x[3]]),original.map(x=>[x[1],x[3]]));
 assert.equal(alt.filter(x=>x[2]==="#252525").length,r.complementaryTargetPaths);
 assert.equal(prior.filter(x=>x[2]==="#252525").length,r.originalTargetPaths);
 assert.ok(alt.every(x=>x[2]===(x[3]===t.otherOwner?"#252525":"#dedede")));
 assert.ok(prior.every(x=>x[2]===(x[3]===t.machineAssignedOwner?"#252525":"#dedede")));
 assert.ok(prior.every((x,i)=>!(x[2]==="#252525"&&alt[i][2]==="#252525")));
 assert.equal(r.independentOwnershipCertified,false);
}
function reject(mutate,reader=read){
 const clone=structuredClone(manifest);mutate(clone);
 assert.throws(()=>deriveComplementLocators(clone,reader));
}
reject(m=>{m.source.ownerKeyIndependentlyVerified=true;});
reject(m=>{m.targets[0].sourceSHA256="0".repeat(64);});
reject(m=>{m.targets[0].locatorSHA256="0".repeat(64);});
reject(m=>{m.targets[0].otherOwner=m.targets[0].machineAssignedOwner;});
reject(m=>{m.targets[0].sourceOwnershipIndependentlyCertified=true;});
reject(m=>{m.targets[0].semanticsApproved=true;});
reject(m=>{m.targets[0].otherOwner="cmp-9999";});
reject(m=>{m.targets[0].targetRegionPaths++;});
reject(m=>{m.targets[0].sourceGeometryUnmodified=false;});
reject(m=>{m.targets[1].id=m.targets[0].id;});
assert.throws(()=>deriveComplementLocators(manifest,p=>p.endsWith(".svg")?
 read(p).replace('data-component="','data-component="corrupted-'):read(p)));
console.log("49 disjoint complement masks; byte-identical original locator reconstruction; 11 source or approval tampering cases rejected.");
