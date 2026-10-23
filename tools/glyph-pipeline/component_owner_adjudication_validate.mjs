// Validate a locally copied, provisional pair-level source ownership note.
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import {pathToFileURL} from "node:url";
export function validateOwnerNotes(sources,report,scripts){
 const ctx={URL,Map,Set};ctx.globalThis=ctx;
 for(const script of scripts)vm.runInNewContext(script,ctx);
 const pairs=ctx.ChromalectBlindColorRehearsal.validateSource(
  sources.warnings,sources.folds,sources.palette);
 const targets=ctx.ChromalectComponentIdentificationRehearsal.validateSource(sources.targets,pairs);
 const audit=ctx.ChromalectOwnerAdjudication;
 audit.validateTargets(sources.targets,targets);
 return audit.validateExport(report,sources.targets,targets);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 if(process.argv.length!==4||process.argv[2]!=="--validate"||
  process.argv[3].startsWith("-"))throw Error("Usage: node tools/glyph-pipeline/component_owner_adjudication_validate.mjs --validate /path/to/local-notes.json");
 const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
 const s={targets:read("site/glyphs/research/heldout-identification-target-v0.1/index-v0.1.json"),
  warnings:read("site/glyphs/research/heldout-warning-v0.1/index-v0.1.json"),
  folds:read("site/semantic-group-hue-fivefold-heldout-v0.1.json"),
  palette:read("palettes/mandarin-component-identity-v0.6.json")};
 const scripts=["site/heldout-blind-color-core.js",
  "site/heldout-component-identification-core.js",
  "site/component-owner-adjudication-core.js"].map(p=>fs.readFileSync(p,"utf8"));
 const result=validateOwnerNotes(s,read(path.resolve(process.argv[3])),scripts);
 console.log("Valid provisional source-owner notes: "+result.recorded+
  " distinct regions; 0 certified component assignments, 0 study approvals.");
}