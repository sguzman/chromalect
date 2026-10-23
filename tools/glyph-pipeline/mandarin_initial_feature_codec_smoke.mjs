import assert from "node:assert/strict";
import fs from "node:fs";
import {constructCodec,audit} from "./mandarin_initial_feature_codec.mjs";
const read=path=>JSON.parse(fs.readFileSync(path,"utf8"));
const table=read("data/phonetics/mandarin-initial-feature-candidates-v0.1.json");
const citations=read("site/pronunciation-citations-0001-1000.json");
const previous=read("data/phonetics/initial-feature-codec-audit-v0.1.json");
const codec=constructCodec(table);
for(const r of table.tokens){
 const encoded=codec.encode(r.token);
 assert.equal(codec.decode(encoded),r.token);
 assert.equal(encoded.schema,"chromalect.phonetics.initial-feature-orthographic-code.v0.1");
 if(["y","w","∅"].includes(r.token)){
  assert.equal(encoded.kind,"orthographic_onset_convention");
  assert.equal(encoded.marker,r.token);
  assert.ok(!("place" in encoded));
 }else{
  assert.equal(encoded.kind,"working_consonantal_tuple");
  assert.ok(!("marker" in encoded));
 }
}
assert.deepEqual(audit(table,citations),previous);
assert.equal(previous.counts.sourceCitationReadings,1171);
assert.equal(previous.counts.conventionalOccurrenceRoundtrips,997);
assert.equal(previous.counts.orthographicOccurrenceRoundtrips,174);
assert.equal(previous.counts.humanDecodingTrials,0);
assert.equal(previous.counts.independentlyEstablishedPhonemicContrasts,0);
assert.throws(()=>codec.encode("yu"));
assert.throws(()=>codec.decode({schema:"chromalect.phonetics.initial-feature-orthographic-code.v0.1",
 kind:"working_consonantal_tuple",place:"alveolar",manner:"stop",aspiration:"extra"}));
assert.throws(()=>codec.decode({...codec.encode("j"),IPA:"tɕ"}));
assert.throws(()=>codec.decode({...codec.encode("w"),place:"velar"}));
assert.throws(()=>codec.decode({...codec.encode("b"),kind:"approved_phoneme"}));
const modified=structuredClone(table);
modified.tokens.find(r=>r.token==="p").aspiration="unaspirated";
assert.throws(()=>constructCodec(modified));
console.log("Full source initial-feature codec roundtrip: 1,171/1,171 labels; no phonemic or perception claims.");
