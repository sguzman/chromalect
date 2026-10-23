import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import vm from "node:vm";
import {spawnSync} from "node:child_process";
import {validateIdentificationExport} from "./heldout_component_identification_export_validate.mjs";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const src={
 warnings:read("site/glyphs/research/heldout-warning-v0.1/index-v0.1.json"),
 targets:read("site/glyphs/research/heldout-identification-target-v0.1/index-v0.1.json"),
 folds:read("site/semantic-group-hue-fivefold-heldout-v0.1.json"),
 palette:read("palettes/mandarin-component-identity-v0.6.json")
};
const scripts=[
 fs.readFileSync("site/heldout-blind-color-core.js","utf8"),
 fs.readFileSync("site/heldout-component-identification-core.js","utf8")
];
const ctx={};ctx.globalThis=ctx;
for(const s of scripts)vm.runInNewContext(s,ctx);
const items=ctx.ChromalectComponentIdentificationRehearsal.validateSource(
 src.targets,ctx.ChromalectBlindColorRehearsal.validateSource(
  src.warnings,src.folds,src.palette));
const seed=1245612;
const schedule=ctx.ChromalectComponentIdentificationRehearsal.plan(items,seed);
const answers=new Map(schedule.map((t,i)=>[t.id,i%2===0?"left":"cannot_judge"]));
const session=ctx.ChromalectComponentIdentificationRehearsal.exportSession(
 schedule,answers,{pixelSize:32,surface:"black",appearance:"grayscale"},
 seed,"2026-10-23T21:50:00.000Z");
assert.deepEqual(JSON.parse(JSON.stringify(
 validateIdentificationExport(src,session,scripts))),{
 observations:49,answered:25,abstained:24,
 machineKeyConcordance:session.summary.matchesUnverifiedMachineOwner,
 independentlyValidated:0});
const root=fs.mkdtempSync(path.join(os.tmpdir(),"chromalect-identification-"));
const local=path.join(root,"rehearsal.json");
const run=()=>spawnSync(process.execPath,[
 "tools/glyph-pipeline/heldout_component_identification_export_validate.mjs",
 "--validate",local],{cwd:process.cwd(),encoding:"utf8"});
try{
 fs.writeFileSync(local,JSON.stringify(session));
 const success=run();
 assert.equal(success.status,0,success.stderr);
 assert.match(success.stdout,/49 \/ 49 responses/);
 assert.match(success.stdout,/25 non-abstentions/);
 assert.ok(!success.stdout.includes(schedule[0].id));
 assert.ok(!success.stdout.includes("left"));
 for(const corrupt of [
  d=>{d.session.seed++;},
  d=>{d.session.ethicsApproved=true;},
  d=>{d.source.independentlyApprovedTargetOwners=1;},
  d=>{d.observations[0].machineAssignedOwner="cmp-0000";},
  d=>{d.observations[0].optionLeft=d.observations[0].optionRight;},
  d=>{d.observations[0].agreesWithUnverifiedSourceOwner=null;},
  d=>{d.observations[0].visualDiscriminationVerified=true;},
  d=>{d.observations[0].participantName="example";},
  d=>{d.summary.certifiedVisualMappings=1;},
  d=>{d.summary.matchesUnverifiedMachineOwner++;}
 ]){
  const altered=structuredClone(session);corrupt(altered);
  assert.throws(()=>validateIdentificationExport(src,altered,scripts));
  fs.writeFileSync(local,JSON.stringify(altered));
  const result=run();
  assert.notEqual(result.status,0);
  assert.equal(result.stdout,"");
 }
}finally{fs.rmSync(root,{recursive:true,force:true});}
console.log("Offline machine-keyed 49-response export replay; ten score/provenance/privacy corruptions rejected without revealing choices.");
