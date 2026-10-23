// Reproducible sRGB reference-background audit of the immutable v0.6 palette.
// No color reassignment or accessibility conformance claim is produced.
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import {pathToFileURL} from "node:url";

const ctx={};ctx.globalThis=ctx;
vm.runInNewContext(fs.readFileSync("site/reference-contrast.js","utf8"),ctx);
const colors=ctx.ChromalectReferenceContrast;
const rnd=x=>Number(x.toFixed(6));
export function deriveReferenceContrastAudit(palette){
 assert.equal(palette.schema,"chromalect.component-palette.v0");
 assert.equal(palette.id,"mandarin-component-identity");
 assert.equal(palette.version,"0.6.0");
 assert.equal(palette.palette_space,"sRGB");
 assert.equal(palette.coverage.total_component_identities,520);
 assert.equal(palette.components.length,520);
 assert.match(palette.status,/pending-independent-visual-review/);
 const ids=new Set(),hexes=new Set();
 const records=palette.components.map((c,i)=>{
  assert.match(c.id,/^cmp-\d{4}$/);
  assert.equal(c.id,"cmp-"+String(i+1).padStart(4,"0"));
  assert.ok(typeof c.shape==="string"&&c.shape.length>0);
  assert.match(c.color,/^#[0-9a-f]{6}$/i);
  assert.ok(!ids.has(c.id));ids.add(c.id);
  assert.ok(!hexes.has(c.color.toUpperCase()));hexes.add(c.color.toUpperCase());
  const ratio=colors.neutralRatios(c.color);
  return {componentId:c.id,form:c.shape,sourceColor:c.color,
   sourceScope:c.source_scope,groupHint:c.mnemonic_group_hint??null,
   whiteRatio:rnd(ratio.white),blackRatio:rnd(ratio.black),
   whiteBelow3:ratio.white<3,blackBelow3:ratio.black<3,
   whiteBelow4_5:ratio.white<4.5,blackBelow4_5:ratio.black<4.5,
   visualReview:"pending",accessibleGlyphCertified:false,
   paletteColorChanged:false};
 });
 const count=k=>records.filter(r=>r[k]).length;
 return {schema:"chromalect.palette.reference-background-contrast.v0.1",
  status:"machine_srgb_reference_arithmetic_only_no_glyph_legibility_or_accessibility_approval",
  source:{palette:"mandarin-component-identity@0.6.0",
   path:"palettes/mandarin-component-identity-v0.6.json",
   reference:"https://www.w3.org/TR/WCAG22/#dfn-contrast-ratio",
   formula:"WCAG 2.2 sRGB relative luminance; foreground-to-solid-white-and-black ratio",
   physicalDisplayCalibration:false,sourcePaletteMutated:false},
  summary:{componentColors:520,sourceColorIdentitiesPreserved:520,
   referenceWhite:"#FFFFFF",referenceBlack:"#000000",
   whiteBelow3:count("whiteBelow3"),blackBelow3:count("blackBelow3"),
   whiteBelow4_5:count("whiteBelow4_5"),blackBelow4_5:count("blackBelow4_5"),
   independentlyVisuallyVerified:0,accessibilityCertifications:0,
   humanColorDiscriminationTrials:0},
  records};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const source=JSON.parse(fs.readFileSync("palettes/mandarin-component-identity-v0.6.json","utf8"));
 const report=deriveReferenceContrastAudit(source);
 const file="site/color-reference-contrast-v0.1.json",payload=JSON.stringify(report,null,2)+"\n";
 if(process.argv.includes("--write"))fs.writeFileSync(file,payload);
 else if(process.argv.includes("--check"))assert.equal(fs.readFileSync(file,"utf8"),payload);
 else throw Error("Use --write or --check");
 console.log("520 immutable v0.6 component colors audited against neutral reference surfaces:",JSON.stringify(report.summary));
}
