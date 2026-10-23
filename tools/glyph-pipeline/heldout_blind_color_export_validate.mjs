// Offline validator for local-only Chromalect held-out color-presentation
// rehearsal exports. No raw observations are printed, copied or uploaded.
// This validates source integrity and reproducibility, NOT perception studies.
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
const pathInRepo=p=>path.join(process.cwd(),p);
export function validateLocalExport(sourceData,session,coreScript){
 const sandbox={};sandbox.globalThis=sandbox;
 vm.runInNewContext(coreScript,sandbox);
 const core=sandbox.ChromalectBlindColorRehearsal;
 assert.ok(core);
 const original=core.validateSource(
  sourceData.manifest,sourceData.folds,sourceData.palette);
 return core.validateSession(session,original);
}
if(process.argv[1]&&
 process.argv[1].endsWith("/heldout_blind_color_export_validate.mjs")){
 const args=process.argv.slice(2);
 if(args.length!==2||args[0]!=="--validate"||!args[1]||
    args[1].startsWith("-"))
  throw Error("Usage: node tools/glyph-pipeline/heldout_blind_color_export_validate.mjs --validate /path/to/local-session.json");
 const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
 const source={
  manifest:read(pathInRepo("site/glyphs/research/heldout-warning-v0.1/index-v0.1.json")),
  folds:read(pathInRepo("site/semantic-group-hue-fivefold-heldout-v0.1.json")),
  palette:read(pathInRepo("palettes/mandarin-component-identity-v0.6.json"))
 };
 const result=validateLocalExport(source,read(args[1]),
  fs.readFileSync(pathInRepo("site/heldout-blind-color-core.js"),"utf8"));
 if(result.productionVisualCertifications!==0||
    result.independentPerceptualResults!==0||
    result.semanticApprovals!==0)
  throw Error("Preliminary local export must not include independent approvals");
 console.log("Local-only preliminary rehearsal validated: "+
  result.localResponses+" / 49 observations; "+
  "0 certified visuals, 0 independent perception results, 0 semantic approvals. "+
  "No response contents transmitted or printed.");
}
