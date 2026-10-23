// Reversible encoding of proposed orthographic initial-feature tuples. Not a phoneme decoder.
import assert from "node:assert/strict";
import fs from "node:fs";
import {pathToFileURL} from "node:url";
const schema="chromalect.phonetics.initial-feature-orthographic-code.v0.1";
const own=(o,n)=>assert.deepEqual(Object.keys(o).sort(),[...n].sort(),"Only versioned code fields allowed");
export function constructCodec(table){
 assert.equal(table.schema,"chromalect.phonetics.mandarin-initial-feature-candidates.v0.1");
 assert.equal(table.status,"working_articulatory_candidate_codebook_not_independently_certified_phoneme_inventory");
 assert.equal(table.statistics.conventionalInitialTokens,21);
 assert.equal(table.statistics.orthographicConventions,3);
 assert.equal(table.statistics.independentlyVerifiedPhonemicContrasts,0);
 const byToken=new Map(),byTuple=new Map(),orthographic=new Set(["y","w","∅"]);
 for(const r of table.tokens){
  assert.ok(!byToken.has(r.token));byToken.set(r.token,r);
  if(r.category==="conventional_pinyin_initial"){
   const key=[r.place,r.manner,r.aspiration].join("|");
   assert.ok(!byTuple.has(key),"Duplicated articulatory working tuple");
   byTuple.set(key,r.token);
  }else{
   assert.ok(orthographic.has(r.token));
   assert.equal(r.category,"orthographic_onset_convention_not_independent_consonant");
   assert.equal(r.workingIPACandidate,null);
  }
 }
 assert.equal(byToken.size,24);assert.equal(byTuple.size,21);
 function encode(token){
  const r=byToken.get(token);
  assert.ok(r,"Unknown source spelling token");
  return r.category==="conventional_pinyin_initial"?
   {schema,kind:"working_consonantal_tuple",place:r.place,manner:r.manner,aspiration:r.aspiration}:
   {schema,kind:"orthographic_onset_convention",marker:r.token};
 }
 function decode(data){
  assert.ok(data&&typeof data==="object"&&!Array.isArray(data));
  assert.equal(data.schema,schema);
  if(data.kind==="working_consonantal_tuple"){
   own(data,["schema","kind","place","manner","aspiration"]);
   const token=byTuple.get([data.place,data.manner,data.aspiration].join("|"));
   assert.ok(token,"Unmapped source working feature combination");
   return token;
  }
  if(data.kind==="orthographic_onset_convention"){
   own(data,["schema","kind","marker"]);
   assert.ok(orthographic.has(data.marker),"Unrecognized orthographic onset convention");
   return data.marker;
  }
  throw Error("Unknown source initial code category");
 }
 return {encode,decode};
}
export function audit(table,citations){
 assert.equal(citations.schema,"chromalect.pronunciation-citations.v0");
 assert.equal(citations.tranche,"0001-1000");
 assert.equal(citations.characters.length,1000);
 const codec=constructCodec(table);
 let conventional=0,orthographic=0;
 const used=new Map();
 for(const c of citations.characters)for(const r of c.readings){
  const coded=codec.encode(r.initial);
  const decoded=codec.decode(coded);
  assert.equal(decoded,r.initial,"Pinyin initial feature-code roundtrip mismatch");
  if(coded.kind==="working_consonantal_tuple")conventional++;
  else orthographic++;
  used.set(r.initial,1+(used.get(r.initial)??0));
 }
 assert.equal(conventional+orthographic,1171);
 assert.equal(conventional,997);assert.equal(orthographic,174);
 assert.equal(used.size,24);
 for(const r of table.tokens)assert.equal(r.citationReadingOccurrences,used.get(r.token)??0);
 return {schema:"chromalect.phonetics.initial-feature-codec-audit.v0.1",
  status:"reversible_working_pinyin_initial_features_not_independent_phonological_proof",
  source:{candidateFeatures:"mandarin-initial-feature-candidates-v0.1.json",
   citationTranche:"site/pronunciation-citations-0001-1000.json",
   interpretation:"Machine roundtrip of only source initial spelling tokens. No syllable-final, phoneme, IPA or contextual transcription is reconstructed.",
   visualShapeReadabilityAssessed:false,sourcePaletteAssignmentsChanged:false},
  counts:{sourceCharacters:1000,sourceCitationReadings:1171,distinctSourceInitialTokens:24,
   sourceConsonantalInitialCategories:21,orthographicOnsetConventions:3,
   conventionalOccurrenceRoundtrips:conventional,orthographicOccurrenceRoundtrips:orthographic,
   roundTripFailures:0,independentlyEstablishedPhonemicContrasts:0,
   humanDecodingTrials:0,learningStudyResults:0}};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const get=path=>JSON.parse(fs.readFileSync(path,"utf8"));
 const d=audit(get("data/phonetics/mandarin-initial-feature-candidates-v0.1.json"),
 get("site/pronunciation-citations-0001-1000.json"));
 const text=JSON.stringify(d,null,2)+"\n",path="data/phonetics/initial-feature-codec-audit-v0.1.json";
 if(process.argv.includes("--write"))fs.writeFileSync(path,text);
 else if(process.argv.includes("--check"))assert.equal(fs.readFileSync(path,"utf8"),text);
 else throw Error("Use --write or --check");
 console.log("Reversible working initial-feature labels: "+d.counts.sourceCitationReadings+" source readings, 0 human decoding trials.");
}