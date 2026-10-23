import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const ctx={};ctx.globalThis=ctx;
vm.runInNewContext(fs.readFileSync("site/reference-contrast.js","utf8"),ctx);
const calc=ctx.ChromalectReferenceContrast;
assert.equal(calc.version,"wcag22-srgb-reference-v0.1");
const near=(x,y)=>assert.ok(Math.abs(x-y)<1e-6,String(x)+" versus "+y);
near(calc.luminance("#000000"),0);
near(calc.luminance("#FFFFFF"),1);
near(calc.luminance("#FF0000"),0.2126);
near(calc.luminance("#00ff00"),0.7152);
near(calc.luminance("#0000ff"),0.0722);
near(calc.ratio("#000000","#ffffff"),21);
near(calc.ratio("#ffffff","#000000"),21);
near(calc.ratio("#777777","#ffffff"),4.478089453577214);
const c=calc.neutralRatios("#000000");
near(c.white,21);near(c.black,1);
near(calc.neutralRatios("#ffffff").black,21);
near(calc.neutralRatios("#ffffff").white,1);
assert.equal(Object.isFrozen(c),true);
for(const bad of ["","red","#fff","#000000ff","#GFFFFF",null,42,{}]){
 assert.throws(()=>calc.luminance(bad));
 assert.throws(()=>calc.neutralRatios(bad));
}
assert.throws(()=>calc.ratio("#000000","transparent"));
console.log("W3C sRGB reference luminance, 21:1 endpoints, grayscale reference and invalid-color rejections checked.");
