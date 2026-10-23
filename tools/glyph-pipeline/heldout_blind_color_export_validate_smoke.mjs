import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import vm from "node:vm";
import {spawnSync} from "node:child_process";
import {validateLocalExport} from "./heldout_blind_color_export_validate.mjs";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const source={
 manifest:read("site/glyphs/research/heldout-warning-v0.1/index-v0.1.json"),
 folds:read("site/semantic-group-hue-fivefold-heldout-v0.1.json"),
 palette:read("palettes/mandarin-component-identity-v0.6.json")
};
const script=fs.readFileSync("site/heldout-blind-color-core.js","utf8");
const scope={};scope.globalThis=scope;vm.runInNewContext(script,scope);
const core=scope.ChromalectBlindColorRehearsal;
const trials=core.validateSource(source.manifest,source.folds,source.palette);
assert.equal(trials.length,49);
const seed=129687731,plan=core.permutation(trials,seed);
const choices=new Map(plan.map((x,i)=>[x.id,i%3===0?"left_clearer":
 i%3===1?"right_clearer":"cannot_judge"]));
const session=core.createSession(plan,choices,
 {pixelSize:32,surface:"black",appearance:"color"},
 seed,"2026-10-23T21:00:00.000Z");
assert.deepEqual(JSON.parse(JSON.stringify(validateLocalExport(source,session,script))),
 {localResponses:49,productionVisualCertifications:0,
  independentPerceptualResults:0,semanticApprovals:0});
const dirname=fs.mkdtempSync(path.join(os.tmpdir(),"chromalect-blind-rehearsal-"));
const local=path.join(dirname,"preliminary.json");
const tool="tools/glyph-pipeline/heldout_blind_color_export_validate.mjs";
const run=()=>spawnSync(process.execPath,[tool,"--validate",local],
 {cwd:process.cwd(),encoding:"utf8"});
try{
 fs.writeFileSync(local,JSON.stringify(session));
 const good=run();
 assert.equal(good.status,0,good.stderr);
 assert.match(good.stdout,/49 \/ 49 observations/);
 assert.match(good.stdout,/0 certified visuals/);
 assert.ok(!good.stdout.includes(session.observations[0].trialId));
 assert.ok(!good.stdout.includes("left_clearer"));
 for(const change of [
  x=>{x.status="independently_verified";},
  x=>{x.session.automaticallyUploaded=true;},
  x=>{x.session.ethicsProtocolApproved=true;},
  x=>{x.session.randomSeed++;},
  x=>{x.session.display.pixelSize=19;},
  x=>{x.observations[0].participantId="sensitive-example";},
  x=>{x.observations[0].visualCertificationGranted=true;},
  x=>{x.observations[0].leftCondition=
   x.observations[0].leftCondition==="original"?"experimental":"original";}
 ]){
  const bad=structuredClone(session);change(bad);
  assert.throws(()=>validateLocalExport(source,bad,script));
  fs.writeFileSync(local,JSON.stringify(bad));
  const result=run();
  assert.notEqual(result.status,0);
  assert.equal(result.stdout,"");
 }
}finally{
 fs.rmSync(dirname,{recursive:true,force:true});
}
console.log("Offline 49-observation export validation, zero printed responses, eight invalid/local-privacy cases rejected.");
