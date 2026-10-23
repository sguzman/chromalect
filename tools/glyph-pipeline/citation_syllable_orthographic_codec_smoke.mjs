import assert from "node:assert/strict";
import fs from "node:fs";
import {makeCitationGrammar,audit,codeSchema} from "./citation_syllable_orthographic_codec.mjs";
const get=path=>JSON.parse(fs.readFileSync(path,"utf8"));
const source=get("site/pronunciation-citations-0001-1000.json");
const layers=get("site/layers-v0.1.json");
const initials=get("data/phonetics/mandarin-initial-feature-candidates-v0.1.json");
const expected=get("data/phonetics/citation-syllable-orthographic-codec-audit-v0.1.json");
const grammar=makeCitationGrammar(source,layers,initials);
assert.deepEqual(audit(source,layers,initials),expected);
assert.equal(grammar.attestedTriples,673);
const examples=source.characters.flatMap(c=>c.readings.map(r=>({character:c.character,...r})));
for(const r of examples){
 const {character,...reading}=r,encoded=grammar.encode(reading),decoded=grammar.decode(encoded);
 assert.deepEqual(decoded,reading);
 assert.equal(encoded.schema,codeSchema);
 if(reading.initial==="∅")assert.equal(encoded.initial.marker,"∅");
 if(reading.initial==="w")assert.equal(encoded.initial.marker,"w");
 if(reading.initial==="y")assert.equal(encoded.initial.marker,"y");
}
const attested=grammar.encode(source.characters[0].readings[0]);
assert.throws(()=>grammar.decode({...attested,extra:"not_allowed"}));
assert.throws(()=>grammar.decode({...attested,final:{kind:"IPA_rime",token:attested.final.token}}));
assert.throws(()=>grammar.decode({...attested,tone:{kind:"citation_tone_label",value:7}}));
assert.throws(()=>grammar.decode({...attested,initial:{...attested.initial,verified:true}}));
assert.throws(()=>grammar.encode({...source.characters[0].readings[0],verified:true}));
assert.throws(()=>grammar.encode({...source.characters[0].readings[0],display:"yí"}));
assert.throws(()=>grammar.decode({...attested,final:{kind:"written_spelling_remainder",token:"zzz"}}));
assert.deepEqual(expected.counts,{sourceCharacters:1000,sourceReadings:1171,
 attestedInitialFinalToneTriples:673,initialTokens:24,finalTokens:33,toneTokens:5,
 consonantalInitialOccurrences:997,orthographicOnlyOnsetOccurrences:174,
 exactRoundTrips:1171,roundTripFailures:0,unreviewedFinalPhonologicalCategories:33,
 independentWordContextReadingApprovals:0,humanDecodingTrials:0,educationalEffectMeasurements:0});
assert.equal(expected.sources.externalIndependentPhonologicalReview,false);
console.log("1,171/1,171 fully structured citation orthography roundtrips; unknown combinations fail closed.");
