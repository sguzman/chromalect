// Validate local machine-keyed component identification rehearsal exports.
// No session responses, participant data, or scores are printed.
// This is a structural and source-key validation, NOT human certification.
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import {pathToFileURL} from "node:url";
export function validateIdentificationExport(sources,session,scripts){
 const context={};context.globalThis=context;
 for(const script of scripts)vm.runInNewContext(script,context);
 const pairing=context.ChromalectBlindColorRehearsal;
 const instrument=context.ChromalectComponentIdentificationRehearsal;
 assert.ok(pairing&&instrument);
 const original=pairing.validateSource(
  sources.warnings,sources.folds,sources.palette);
 const targets=instrument.validateSource(sources.targets,original);
 return instrument.validateSession(session,targets);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const args=process.argv.slice(2);
 if(args.length!==2||args[0]!=="--validate"||!args[1]||
    args[1].startsWith("-"))
  throw Error("Usage: node tools/glyph-pipeline/heldout_component_identification_export_validate.mjs --validate /path/to/local-session.json");
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
 const summary=validateIdentificationExport(src,read(path.resolve(args[1])),scripts);
 assert.equal(summary.independentlyValidated,0);
 console.log("Local source-mapping identification record verified: "+
  summary.observations+" / 49 responses; "+
  summary.answered+" non-abstentions; 0 independently verified glyphs, "+
  "0 certified perceptual results. Individual choices and machine-concordance counts are not displayed or uploaded.");
}
