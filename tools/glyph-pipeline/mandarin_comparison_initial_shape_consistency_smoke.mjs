import assert from "node:assert/strict";
import fs from "node:fs";
const comparator=fs.readFileSync("site/mandarin-encoding-comparison.js","utf8");
const reference=fs.readFileSync("site/mandarin-initial-features.js","utf8");
const regex=/const placePaths=\{[\s\S]*?\};\nconst mannerPaths=\{[\s\S]*?\};\nconst breathPaths=\{[^\n]*\};/;
const a=reference.match(regex),b=comparator.match(regex);
assert.ok(a&&b,"Initial shape registries missing");
assert.equal(a[0],b[0],"Side-by-side comparison initial geometry differs from upstream source initial codebook");
const integrated=fs.readFileSync("site/mandarin-citation-cell.js","utf8");
for(const token of ["front:18,central:64,back:110","close:18,mid:44,open:70"]){
 assert.ok(integrated.includes(token)&&comparator.includes(token),
  "Working simple-vowel geometry diverged between integrated and side-by-side views");
}

console.log("Side-by-side initial-shape geometry equals existing source provisional initial shapes.");
