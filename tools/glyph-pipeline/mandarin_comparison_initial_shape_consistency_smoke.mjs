import assert from "node:assert/strict";
import fs from "node:fs";
const comparator=fs.readFileSync("site/mandarin-encoding-comparison.js","utf8");
const reference=fs.readFileSync("site/mandarin-initial-features.js","utf8");
const regex=/const placePaths=\{[\s\S]*?\};\nconst mannerPaths=\{[\s\S]*?\};\nconst breathPaths=\{[^\n]*\};/;
const a=reference.match(regex),b=comparator.match(regex);
assert.ok(a&&b,"Initial shape registries missing");
assert.equal(a[0],b[0],"Side-by-side comparison initial geometry differs from upstream source initial codebook");
console.log("Side-by-side initial-shape geometry equals existing source provisional initial shapes.");
