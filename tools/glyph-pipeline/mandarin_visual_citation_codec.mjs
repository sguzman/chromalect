// Strict decoding of source-aligned visual citation tokens; not phonemic/IPA decoding.
import assert from "node:assert/strict";
import fs from "node:fs";
import {pathToFileURL} from "node:url";
import {makeCitationGrammar} from "./citation_syllable_orthographic_codec.mjs";

export const visualSchema="chromalect.phonetics.mandarin-visual-citation-code.v0.1";
const keys=(data,required)=>{
 assert.ok(data&&typeof data==="object"&&!Array.isArray(data),"Structured visual token required");
 assert.deepEqual(Object.keys(data).sort(),[...required].sort(),"Unknown visual-code field");
};
const triple=r=>JSON.stringify([r.initial,r.final,r.tone]);

export function constructVisualCitationDecoder(source,layers,features,symbols){
 const base=makeCitationGrammar(source,layers,features);
 assert.equal(symbols.schema,"chromalect.phonetics.written-final-symbol-control.v0.1");
 assert.equal(symbols.status,"arbitrary_geometric_written_letter_control_not_articulatory_or_ipa");
 assert.equal(symbols.source.upstreamBlobSHA,source.source.blob_sha);
 assert.equal(symbols.source.spellingPaletteChanged,false);
 assert.equal(symbols.source.sourceGlyphStrokesChanged,false);
 assert.equal(symbols.summary.sourceCitationReadings,1171);
 assert.equal(symbols.summary.independentlyApprovedIPARealizations,0);
 assert.equal(symbols.summary.humanSymbolDecodingTrials,0);
 assert.equal(symbols.summary.learningResults,0);
 assert.equal(symbols.summary.writtenFinalsEncoded,33);
 assert.equal(symbols.summary.primitiveLetters,9);
 assert.ok(Array.isArray(symbols.primitives)&&symbols.primitives.length===9);
 assert.ok(Array.isArray(symbols.records)&&symbols.records.length===33);
 const letters=symbols.primitives.map(p=>p.letter);
 assert.equal(new Set(letters).size,9);
 const byToken=new Map(),bySignature=new Map();
 for(const rec of symbols.records){
  assert.equal(rec.machineSpellingRoundtrip,true);
  assert.equal(rec.independentPhonologicalInterpretationApproved,false);
  assert.equal(rec.humanDecodingAccuracyKnown,false);
  assert.ok(Array.isArray(rec.iconRegistryIndices)&&rec.iconRegistryIndices.length>0);
  assert.ok(Array.isArray(rec.symbolLetters)&&rec.symbolLetters.length===rec.iconRegistryIndices.length);
  for(let i=0;i<rec.iconRegistryIndices.length;i++){
   const n=rec.iconRegistryIndices[i];
   assert.ok(Number.isInteger(n)&&n>=0&&n<letters.length);
   assert.equal(letters[n],rec.symbolLetters[i]);
  }
  assert.equal(rec.symbolLetters.join(""),rec.token);
  assert.ok(Object.hasOwn(layers.palette_domains.final.tokens,rec.token));
  assert.ok(!byToken.has(rec.token));
  const signature=JSON.stringify(rec.iconRegistryIndices);
  assert.ok(!bySignature.has(signature),"Geometric symbol collision");
  byToken.set(rec.token,rec);bySignature.set(signature,rec.token);
 }
 assert.equal(byToken.size,33);
 const toneSymbols=layers.palette_domains.tone.symbols;
 assert.deepEqual(Object.keys(toneSymbols).sort(),["0","1","2","3","4"]);

 function encode(reading){
  const coded=base.encode(reading);
  const record=byToken.get(reading.final);
  assert.ok(record,"Unrecognized geometric final");
  const token=String(reading.tone);
  return {schema:visualSchema,initial:coded.initial,
   final:{kind:"geometric_written_letters",indices:[...record.iconRegistryIndices]},
   tone:{kind:"citation_tone_symbol",token,symbol:toneSymbols[token]}};
 }
 function decode(data){
  keys(data,["schema","initial","final","tone"]);
  assert.equal(data.schema,visualSchema);
  keys(data.final,["kind","indices"]);
  keys(data.tone,["kind","token","symbol"]);
  assert.equal(data.final.kind,"geometric_written_letters");
  assert.equal(data.tone.kind,"citation_tone_symbol");
  const indices=data.final.indices;
  assert.ok(Array.isArray(indices)&&indices.length>=1&&indices.length<=4);
  assert.ok(indices.every(n=>Number.isInteger(n)&&n>=0&&n<letters.length));
  const final=bySignature.get(JSON.stringify(indices));
  assert.ok(final,"Unrecognized geometric final symbol sequence");
  assert.ok(Object.hasOwn(toneSymbols,data.tone.token));
  assert.equal(data.tone.symbol,toneSymbols[data.tone.token]);
  const tone=Number(data.tone.token);
  const result=base.decode({schema:"chromalect.phonetics.citation-syllable-orthographic-code.v0.1",
   initial:data.initial,final:{kind:"written_spelling_remainder",token:final},
   tone:{kind:"citation_tone_label",value:tone}});
  return result;
 }
 return {encode,decode,attestedTriples:base.attestedTriples,encodedFinals:byToken.size};
}
export function audit(source,layers,features,symbols){
 const codec=constructVisualCitationDecoder(source,layers,features,symbols);
 let attempts=0,orthographicOnly=0;
 const serialized=new Set();
 for(const c of source.characters)for(const reading of c.readings){
  const encoded=codec.encode(reading);
  const decoded=codec.decode(JSON.parse(JSON.stringify(encoded)));
  assert.deepEqual(decoded,reading,"Visual code did not reconstruct source citation");
  serialized.add(JSON.stringify(encoded));
  if(encoded.initial.kind==="orthographic_onset_convention")orthographicOnly++;
  attempts++;
 }
 assert.equal(attempts,1171);
 assert.equal(serialized.size,673);
 assert.equal(orthographicOnly,174);
 return {schema:"chromalect.phonetics.mandarin-visual-citation-codec-audit.v0.1",
  status:"exact_machine_visual_token_decoding_not_phonemic_or_human_verified",
  sources:{citations:"site/pronunciation-citations-0001-1000.json",
   initialFeatureCodebook:"mandarin-initial-feature-candidates-v0.1.json",
   finalGeometry:"written-final-symbol-control-v0.1.json",
   orthographicGrammar:"citation-syllable-orthographic-codec-audit-v0.1.json",
   tokenPalette:"site/layers-v0.1.json",
   pinnedCitationBlobSHA:source.source.blob_sha},
  grammar:{initial:"source working-feature tuple or explicit y/w/zero spelling marker",
   final:"ordered integer references into nine geometric written-letter primitives",
   tone:"source citation category and the exact original five-symbol registry",
   acceptedCombinations:"673 observed first-tranche citation triples only",
   unknownFieldsRejected:true,unobservedTriplesRejected:true,
   sourceGlyphGeometryModified:false},
  counts:{sourceCharacters:1000,sourceReadings:1171,
   attestedCitationTriples:codec.attestedTriples,
   writtenFinalSymbols:codec.encodedFinals,primitiveLetters:9,toneCategories:5,
   consonantalInitialReadings:attempts-orthographicOnly,
   orthographicOnsetReadings:orthographicOnly,
   distinctSerializedVisualCodes:serialized.size,
   independentMachineSerializationRoundTrips:attempts,failures:0,
   independentlyVerifiedPhonemicMappings:0,
   independentHumanVisualDecodings:0,contextualReadingApprovals:0,
   educationalEffectMeasurements:0}};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const get=p=>JSON.parse(fs.readFileSync(p,"utf8"));
 const report=audit(get("site/pronunciation-citations-0001-1000.json"),
  get("site/layers-v0.1.json"),
  get("data/phonetics/mandarin-initial-feature-candidates-v0.1.json"),
  get("data/phonetics/written-final-symbol-control-v0.1.json"));
 const output="data/phonetics/mandarin-visual-citation-codec-audit-v0.1.json";
 const text=JSON.stringify(report,null,2)+"\n";
 if(process.argv.includes("--write"))fs.writeFileSync(output,text);
 else if(process.argv.includes("--check"))assert.equal(fs.readFileSync(output,"utf8"),text);
 else throw Error("Use --write or --check");
 console.log("Visual citation token grammar: 1,171/1,171 exact round-trips; 673 observed triples; zero scientific approvals.");
}
