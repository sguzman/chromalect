// Provisional reversible *written letter* shape baseline, not a phonetic-feature decoder.
import assert from "node:assert/strict";
import fs from "node:fs";
import {pathToFileURL} from "node:url";
export const buildFinalSymbolBaseline = function buildFinalSymbolBaseline(citations,layers){
 const ensure=(x,m)=>{if(!x)throw Error(m)};
 ensure(citations.schema==="chromalect.pronunciation-citations.v0"&&citations.characters.length===1000,
 "Source citation tranche changed");
 ensure(layers.schema==="chromalect.presentation-layers.v0","Unrecognized palette source");
 const primitives=[
 {letter:"a",path:"M10 39 L25 9 L40 39 Z"},
 {letter:"e",path:"M11 11 H39 V39 H11 Z"},
 {letter:"g",path:"M25 11 A14 14 0 1 1 24.9 11 M34 35 L42 43"},
 {letter:"i",path:"M25 16 V39 M25 7 V9"},
 {letter:"n",path:"M12 39 V25 C12 7 38 7 38 25 V39"},
 {letter:"o",path:"M25 11 A14 14 0 1 0 25.1 11"},
 {letter:"r",path:"M10 39 V11 H27 C41 11 41 25 27 25 L36 39"},
 {letter:"u",path:"M12 11 V26 C12 44 38 44 38 26 V11"},
 {letter:"ü",path:"M12 14 V29 C12 43 38 43 38 29 V14 M17 5 V8 M33 5 V8"}
 ];
 const primMap=new Map(primitives.map(x=>[x.letter,x]));
 ensure(primMap.size===9&&new Set(primitives.map(x=>x.path)).size===9,"Conflicting experimental symbol paths");
 const tokens=Object.keys(layers.palette_domains.final.tokens);
 ensure(tokens.length===33,"Unexpected published final spelling vocabulary");
 const occurrences=new Map(tokens.map(t=>[t,0]));
 let total=0;
 for(const item of citations.characters)for(const r of item.readings){
  ensure(occurrences.has(r.final),"Unknown citation spelling remainder");
  occurrences.set(r.final,occurrences.get(r.final)+1);total++;
 }
 ensure(total===1171,"Published source reading count changed");
 const encoded=new Set();
 const records=tokens.map(token=>{
  const letters=[...token];
  ensure(letters.every(l=>primMap.has(l)),"Source written final contains an uncoded character");
  const signature=letters.map(l=>primitives.findIndex(p=>p.letter===l)).join(".");
  ensure(!encoded.has(signature),"Visual source symbol encoding collision");
  encoded.add(signature);
  ensure(letters.join("")===token,"Final orthography roundtrip failed");
  return {token,sourceOccurrences:occurrences.get(token),symbolLetters:letters,
   iconRegistryIndices:letters.map(l=>primitives.findIndex(p=>p.letter===l)),
   machineSpellingRoundtrip:true,
   independentPhonologicalInterpretationApproved:false,
   humanDecodingAccuracyKnown:false};
 });
 ensure(records.reduce((n,x)=>n+x.sourceOccurrences,0)===1171,"Published final usage does not total source reading count");
 return {schema:"chromalect.phonetics.written-final-symbol-control.v0.1",
 status:"arbitrary_geometric_written_letter_control_not_articulatory_or_ipa",
 source:{citationTranche:"site/pronunciation-citations-0001-1000.json",
  paletteReference:"site/layers-v0.1.json",
  upstreamBlobSHA:citations.source.blob_sha,
  spellingPaletteChanged:false,sourceGlyphStrokesChanged:false},
 interpretation:{codebook:"Each geometric primitive codes one printed letter, not one phoneme.",
  decodingTarget:"Recover exactly the original final remainder string from the ordered symbol sequence.",
  blindSymbolDisplayIsNotExperimentResults:true,
  humanComprehensionTestNeeded:true,
  noSoundFeatureInference:true},
 summary:{sourceCitationReadings:1171,writtenFinalsEncoded:33,primitiveLetters:9,
  distinctEncodingSignatures:encoded.size,machineSourceSpellingRoundtrips:1171,
  independentlyApprovedIPARealizations:0,humanSymbolDecodingTrials:0,
  learningResults:0},
 primitives,records};
};
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const src=JSON.parse(fs.readFileSync("site/pronunciation-citations-0001-1000.json","utf8"));
 const palette=JSON.parse(fs.readFileSync("site/layers-v0.1.json","utf8"));
 const rendered=JSON.stringify(buildFinalSymbolBaseline(src,palette),null,2)+"\n";
 const target="data/phonetics/written-final-symbol-control-v0.1.json";
 if(process.argv.includes("--write"))fs.writeFileSync(target,rendered);
 else if(process.argv.includes("--check"))assert.equal(fs.readFileSync(target,"utf8"),rendered);
 else throw Error("Use --write or --check");
 console.log("Orthographic final symbol control: 33 distinct final spellings encoded via 9 geometric letter primitives, 1,171/1,171 source spelling roundtrips.");
}