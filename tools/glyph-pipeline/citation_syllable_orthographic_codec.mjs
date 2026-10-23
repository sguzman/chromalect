// Complete *orthographic* citation-token grammar. Not a phonemic syllable model.
import assert from "node:assert/strict";
import fs from "node:fs";
import {pathToFileURL} from "node:url";
import {constructCodec} from "./mandarin_initial_feature_codec.mjs";
import {encodePinyinSpelling,decodePinyinSpelling} from "./pinyin_citation_roundtrip.mjs";
export const codeSchema="chromalect.phonetics.citation-syllable-orthographic-code.v0.1";
const allowedFields=(v,keys)=>assert.deepEqual(Object.keys(v).sort(),keys.slice().sort(),
 "Encoded citation spelling contains an unexpected field");
const key=(i,f,t)=>JSON.stringify([i,f,t]);
export function makeCitationGrammar(source,layers,initialFeatures){
 assert.equal(source.schema,"chromalect.pronunciation-citations.v0");
 assert.equal(source.tranche,"0001-1000");
 assert.equal(source.language,"zh-CN-Putonghua-citation");
 assert.equal(source.characters.length,1000);
 assert.equal(layers.schema,"chromalect.presentation-layers.v0");
 const palette=layers.palette_domains;
 assert.equal(Object.keys(palette.initial.tokens).length,24);
 assert.equal(Object.keys(palette.final.tokens).length,33);
 assert.equal(Object.keys(palette.tone.tokens).length,5);
 const onset=constructCodec(initialFeatures);
 const seen=new Set(),counters={readings:0,orthographicConventions:0,consonantalTokens:0};
 const finals=new Set();
 for(let idx=0;idx<source.characters.length;idx++){
  const c=source.characters[idx];
  assert.equal(c.rank,idx+1);
  for(const r of c.readings){
   counters.readings++;
   assert.ok(Object.hasOwn(palette.initial.tokens,r.initial));
   assert.ok(Object.hasOwn(palette.final.tokens,r.final));
   assert.ok(Object.hasOwn(palette.tone.tokens,String(r.tone)));
   assert.equal(encodePinyinSpelling(r.initial,r.final,r.tone,palette),r.display);
   assert.deepEqual(decodePinyinSpelling(r.display,palette),
    {initial:r.initial,final:r.final,tone:r.tone,orthographic_glide:r.orthographic_glide});
   assert.equal(r.orthographic_glide,r.initial==="y"||r.initial==="w");
   const onsetCode=onset.encode(r.initial);
   if(onsetCode.kind==="orthographic_onset_convention")counters.orthographicConventions++;
   else counters.consonantalTokens++;
   seen.add(key(r.initial,r.final,r.tone));
   finals.add(r.final);
  }
 }
 assert.equal(counters.readings,1171);
 assert.equal(counters.consonantalTokens,997);
 assert.equal(counters.orthographicConventions,174);
 assert.equal(seen.size,673,"Source attested token triple count changed");
 assert.equal(finals.size,33);
 function encode(reading){
  assert.ok(reading&&typeof reading==="object"&&!Array.isArray(reading));
  allowedFields(reading,["initial","final","tone","display","orthographic_glide"]);
  assert.ok(seen.has(key(reading.initial,reading.final,reading.tone)),
    "Initial/final/tone combination is not in the pinned citation tranche");
  assert.equal(reading.display,
   encodePinyinSpelling(reading.initial,reading.final,reading.tone,palette));
  assert.equal(reading.orthographic_glide,reading.initial==="y"||reading.initial==="w");
  return {schema:codeSchema,
   initial:onset.encode(reading.initial),
   final:{kind:"written_spelling_remainder",token:reading.final},
   tone:{kind:"citation_tone_label",value:reading.tone}};
 }
 function decode(encoded){
  assert.ok(encoded&&typeof encoded==="object"&&!Array.isArray(encoded));
  allowedFields(encoded,["schema","initial","final","tone"]);
  assert.equal(encoded.schema,codeSchema);
  assert.ok(encoded.final&&typeof encoded.final==="object"&&!Array.isArray(encoded.final));
  assert.ok(encoded.tone&&typeof encoded.tone==="object"&&!Array.isArray(encoded.tone));
  allowedFields(encoded.final,["kind","token"]);
  allowedFields(encoded.tone,["kind","value"]);
  assert.equal(encoded.final.kind,"written_spelling_remainder");
  assert.equal(encoded.tone.kind,"citation_tone_label");
  assert.ok(Object.hasOwn(palette.final.tokens,encoded.final.token),"Unknown written final");
  assert.ok(Number.isInteger(encoded.tone.value)&&encoded.tone.value>=0&&encoded.tone.value<=4);
  const initial=onset.decode(encoded.initial);
  const final=encoded.final.token,tone=encoded.tone.value;
  assert.ok(seen.has(key(initial,final,tone)),
   "Constructed feature code does not match an attested citation token combination");
  const display=encodePinyinSpelling(initial,final,tone,palette);
  return {initial,final,tone,display,
   orthographic_glide:initial==="y"||initial==="w"};
 }
 return {encode,decode,attestedTriples:seen.size,observedFinalTokens:finals.size,counts:counters};
}
export function audit(source,layers,initialFeatures){
 const grammar=makeCitationGrammar(source,layers,initialFeatures);
 let verified=0,exceptions=0;
 for(const c of source.characters)for(const r of c.readings){
  const encoded=grammar.encode(r);
  const decoded=grammar.decode(encoded);
  assert.deepEqual(decoded,r,"Full orthographic citation token round-trip failed");
  assert.equal(encoded.schema,codeSchema);
  assert.equal(encoded.tone.kind,"citation_tone_label");
  assert.equal(encoded.final.kind,"written_spelling_remainder");
  if(encoded.initial.kind==="orthographic_onset_convention")exceptions++;
  verified++;
 }
 assert.equal(verified,1171);
 assert.equal(exceptions,174);
 return {schema:"chromalect.phonetics.citation-syllable-orthographic-codec-audit.v0.1",
  status:"source_attested_reversible_orthographic_grammar_not_phonemic_decoding",
  sources:{readingTranche:"site/pronunciation-citations-0001-1000.json",
   sourceInitialFeatures:"mandarin-initial-feature-candidates-v0.1.json",
   sourcePalette:"site/layers-v0.1.json",externalIndependentPhonologicalReview:false},
  grammar:{initial:"provisional feature tuple or original spelling-only y/w/zero convention",
   final:"exact published written final token, not IPA rhyme or phonetic vowel field",
   tone:"source-listed tone category 0 through 4, not a sentence contour",
   acceptedCombinations:"only observed source citation spelling triples",
   noImplicitNormalization:true},
  counts:{sourceCharacters:1000,sourceReadings:verified,attestedInitialFinalToneTriples:grammar.attestedTriples,
   initialTokens:24,finalTokens:grammar.observedFinalTokens,toneTokens:5,
   consonantalInitialOccurrences:verified-exceptions,orthographicOnlyOnsetOccurrences:exceptions,
   exactRoundTrips:verified,roundTripFailures:0,unreviewedFinalPhonologicalCategories:33,
   independentWordContextReadingApprovals:0,humanDecodingTrials:0,educationalEffectMeasurements:0}};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const source=JSON.parse(fs.readFileSync("site/pronunciation-citations-0001-1000.json","utf8"));
 const layers=JSON.parse(fs.readFileSync("site/layers-v0.1.json","utf8"));
 const features=JSON.parse(fs.readFileSync("data/phonetics/mandarin-initial-feature-candidates-v0.1.json","utf8"));
 const report=JSON.stringify(audit(source,layers,features),null,2)+"\n";
 const output="data/phonetics/citation-syllable-orthographic-codec-audit-v0.1.json";
 if(process.argv.includes("--check"))assert.equal(fs.readFileSync(output,"utf8"),report);
 else if(process.argv.includes("--write"))fs.writeFileSync(output,report);
 else throw Error("Use --check or --write");
 console.log("Source citation grammar: 1,171/1,171 initial/final/tone roundtrips; 673 observed triples, zero IPA or contextual approvals.");
}