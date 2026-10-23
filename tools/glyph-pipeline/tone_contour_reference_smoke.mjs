import assert from "node:assert/strict";
import fs from "node:fs";
const j=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const d=j("data/phonetics/mandarin-citation-tone-contours-v0.1.json");
const palette=j("site/layers-v0.1.json");
const source=j("site/pronunciation-citations-0001-1000.json");
const codec=j("data/phonetics/pinyin-citation-orthography-audit-v0.1.json");
assert.equal(d.schema,"chromalect.phonetics.mandarin-citation-tone-contours.v0.1");
assert.equal(d.status,"idealized_pedagogical_citation_pitch_contours_not_acoustic_or_contextual_measurements");
assert.equal(d.scope.sourceAlignedCitationReadings,codec.counts.citationReadings);
assert.equal(source.characters.reduce((n,r)=>n+r.readings.length,0),1171);
assert.deepEqual(d.comparisonModes,["plain","contour","symbol","color"]);
assert.deepEqual(d.tones.map(t=>t.token),["0","1","2","3","4"]);
assert.deepEqual(d.tones.map(t=>t.levels),[null,[5,5],[3,5],[2,1,4],[5,1]]);
assert.equal(d.tones[0].status,"no_fixed_context_free_contour");
for(const t of d.tones){
 const r=source.characters[t.firstSourceExample.rank-1];
 assert.equal(r.character,t.firstSourceExample.character);
 assert.ok(r.readings.some(x=>x.display===t.firstSourceExample.pinyin&&String(x.tone)===t.token));
}

for(const t of d.tones){
 assert.equal(t.symbol,palette.palette_domains.tone.symbols[t.token]);
 assert.ok(Object.hasOwn(palette.palette_domains.tone.tokens,t.token));
 if(t.levels!==null)assert.ok(t.levels.every(v=>Number.isInteger(v)&&v>=1&&v<=5));
}
assert.equal(d.sources.length,3);
assert.ok(d.sources.every(s=>new URL(s.url).protocol==="https:"));
assert.ok(Object.values(d.evidence).every(n=>n===0));
console.log("Mandarin citation contours: 4 idealized pitch targets, context-dependent neutral tone, 0 measured outcomes.");
