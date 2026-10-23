// Structural reading segmentation is not semantic or linguistic validation.
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const context={};
context.globalThis=context;
vm.runInNewContext(fs.readFileSync("site/dictionary-readings.js","utf8"),context);
const split=context.ChromalectDictionaryReadings.split;
const dir="data/semantic/cedict-crossref/";
const blocks=["0001-0200","0201-0400","0401-0600","0601-0800","0801-1000"];
const rows=blocks.flatMap(n=>JSON.parse(
 fs.readFileSync(dir+"dictionary-excerpts-"+n+".json","utf8")).records);
assert.equal(rows.length,1000);
let sections=0,multiple=0;
for(const [index,r] of rows.entries()){
 assert.equal(r.rank,index+1);
 const entries=split(r);
 assert.equal(entries.length,r.readings.length);
 assert.equal(entries.map(e=>e.reading).join("|"),r.readings.join("|"));
 assert.ok(entries.every(e=>e.gloss.length>0));
 if(entries.length>1)multiple++;
 sections+=entries.length;
 const wrapped=split({dictionaryReadings:r.readings,dictionaryExcerpt:r.excerpt});
 assert.equal(wrapped.map(e=>e.gloss).join("|"),entries.map(e=>e.gloss).join("|"));
}
assert.equal(multiple,339);
assert.throws(()=>split({readings:["madeup1"],excerpt:"yi1: one; "}));
assert.throws(()=>split({readings:["yi1","er4"],excerpt:"yi1: one; er4: two; "}));
console.log("Pinned reading boundaries: 1000/1000 character excerpts structurally segmented, "+
 sections+" reading sections; 339 multiple-reading entries. Lexical approvals: 0.");
