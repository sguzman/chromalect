// Compare two individually validated source-owner note exports without certification.
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import {pathToFileURL} from "node:url";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const sourcePaths={
 targets:"site/glyphs/research/heldout-identification-target-v0.1/index-v0.1.json",
 warnings:"site/glyphs/research/heldout-warning-v0.1/index-v0.1.json",
 folds:"site/semantic-group-hue-fivefold-heldout-v0.1.json",
 palette:"palettes/mandarin-component-identity-v0.6.json",
 complements:"site/glyphs/research/owner-complement-locators-v0.1/index-v0.1.json"
};
const scripts=[
 "site/heldout-blind-color-core.js",
 "site/heldout-component-identification-core.js",
 "site/component-owner-adjudication-core.js",
 "site/component-owner-compare-core.js"
];
export function compareOwnerReports(sources,first,second,scriptTexts){
 const ctx={URL,Map,Set};ctx.globalThis=ctx;
 for(const script of scriptTexts)vm.runInNewContext(script,ctx);
 const warningPairs=ctx.ChromalectBlindColorRehearsal.validateSource(
  sources.warnings,sources.folds,sources.palette);
 const targets=ctx.ChromalectComponentIdentificationRehearsal.validateSource(
  sources.targets,warningPairs);
 ctx.ChromalectOwnerAdjudication.validateTargets(sources.targets,targets);
 ctx.ChromalectOwnerAdjudication.validateComplementaryLocators(sources.complements,targets);
 return ctx.ChromalectOwnerCompare.compare(first,second,sources.targets,targets);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const args=process.argv.slice(2);
 if(args.length!==3&&args.length!==5)
  throw Error("Usage: node tools/glyph-pipeline/source_owner_note_compare.mjs --compare first.json second.json [--output report.json]");
 if(args[0]!=="--compare"||(args.length===5&&(args[3]!=="--output"||args[4].startsWith("-")))||
  args[1].startsWith("-")||args[2].startsWith("-"))
  throw Error("Expected two local provisional note exports; optional --output filename");
 const local=p=>{
  const raw=fs.readFileSync(path.resolve(p),"utf8");
  if(raw.length>250000)throw Error("Provisional local JSON exceeds the 250000-character limit");
  return JSON.parse(raw);
 };
 const src=Object.fromEntries(Object.entries(sourcePaths).map(([k,p])=>[k,read(p)]));
 const text=scripts.map(p=>fs.readFileSync(p,"utf8"));
 const result=compareOwnerReports(src,local(args[1]),local(args[2]),text);
 if(args.length===5)fs.writeFileSync(path.resolve(args[4]),JSON.stringify(result,null,2)+"\n","utf8");
 console.log(JSON.stringify(result.summary,null,2));
 console.log("Provisional comparison only. No reviewer independence, adjudication, source-owner certification, or study eligibility verified.");
}