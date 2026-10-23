// Orthographic, nonphonemic conversion of pinned CC-CEDICT numeric Pinyin labels.
// Retain source capitalization and explicitly quarantine non-full-syllable labels.
import assert from "node:assert/strict";
import fs from "node:fs";
import {pathToFileURL} from "node:url";
import {encodePinyinSpelling,decodePinyinSpelling} from "./pinyin_citation_roundtrip.mjs";
export function parseNumericCitation(label,palette){
 assert.ok(typeof label==="string"&&label.length>0);
 const m=label.toLowerCase().match(/^([a-zü:]+)([1-5])$/);
 if(!m)return null;
 const base=m[1].replace(/u:/g,"ü");
 const options=Object.keys(palette.initial.tokens).map(initial=>({
  initial,final:base.slice(initial==="∅"?0:initial.length)
 })).filter(o=>base.startsWith(o.initial==="∅"?"":o.initial)&&
  Object.hasOwn(palette.final.tokens,o.final));
 if(options.length!==1)return null;
 const {initial,final}=options[0],tone=m[2]==="5"?0:Number(m[2]);
 const display=encodePinyinSpelling(initial,final,tone,palette);
 const decoded=decodePinyinSpelling(display,palette);
 assert.equal(decoded.initial,initial);
 assert.equal(decoded.final,final);
 assert.equal(decoded.tone,tone);
 return {display,initial,final,tone,orthographicGlide:decoded.orthographic_glide,
  sourceCapitalized:label!==label.toLowerCase()};
}
export function buildNumericCitationIndex(source,layers){
 assert.equal(source.schema,"chromalect.semantic.pinyin-reading-label-normalization.v0.1");
 assert.equal(source.summary.charactersAudited,1000);
 assert.equal(source.summary.recordedSourceReadingEntries,1393);
 assert.equal(source.summary.duplicateCasefoldedEntries,202);
 assert.equal(layers.schema,"chromalect.presentation-layers.v0");
 const palette=layers.palette_domains;
 const records=[],failures=[];
 for(const c of source.records){
  for(const label of c.recordedReadingLabels){
   const parsed=parseNumericCitation(label,palette);
   const record={rank:c.rank,character:c.character,sourceReadingLabel:label,
    normalizedDisplay:parsed?.display??null,initial:parsed?.initial??null,
    final:parsed?.final??null,citationTone:parsed?.tone??null,
    orthographicGlide:parsed?.orthographicGlide??null,
    sourceCapitalized:parsed?.sourceCapitalized??null,
    status:parsed?"source_label_orthographic_roundtrip":"unmodeled_numeric_source_label",
    independentContextualReadingVerified:false,independentPhonemicVerification:false,
    lexicalSenseApproved:false};
   records.push(record);
   if(!parsed)failures.push({rank:c.rank,character:c.character,sourceReadingLabel:label,
    reason:"no_unambiguous_full_syllable_split_in_published_pinyin_palette"});
  }
 }
 assert.equal(records.length,1393);
 assert.equal(failures.length,1);
 assert.deepEqual(failures,[{rank:12,character:"儿",sourceReadingLabel:"r5",
  reason:"no_unambiguous_full_syllable_split_in_published_pinyin_palette"}]);
 return {schema:"chromalect.phonetics.cedict-numeric-pinyin-orthography.v0.1",
  status:"numeric_dictionary_label_spelling_conversion_not_sentence_readings_or_phonemic_approval",
  source:{normalizedDictionaryLabels:"pinyin-reading-label-normalization-v0.1.json",
   dictionaryLicense:"CC BY-SA 4.0",orthographicReference:"site/layers-v0.1.json",
   originalLabelsPreserved:true,capitalizationRetainedAsSourceMetadata:true,
   noncanonicalSourceLabelsNotSilentlySubstituted:true},
  summary:{sourceCharacterEntries:1000,sourceReadingLabels:1393,
   exactOrthographicFullSyllableConversions:1392,sourceLabelsOutsideCodec:1,
   sourceCapitalizationDuplicates:202,independentlyVerifiedContextualReadings:0,
   phonemicContrastsApproved:0,approvedLexicalSenses:0,productionApprovals:0},
  exceptions:failures,records};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const src=JSON.parse(fs.readFileSync(
  "data/semantic/cedict-crossref/pinyin-reading-label-normalization-v0.1.json","utf8"));
 const layers=JSON.parse(fs.readFileSync("site/layers-v0.1.json","utf8"));
 const json=JSON.stringify(buildNumericCitationIndex(src,layers),null,2)+"\n";
 const path="data/phonetics/cedict-numeric-pinyin-orthography-v0.1.json";
 if(process.argv.includes("--check"))assert.equal(fs.readFileSync(path,"utf8"),json);
 else if(process.argv.includes("--write"))fs.writeFileSync(path,json);
 else throw Error("Use --check or --write");
 console.log("CC-CEDICT Pinyin spelling: 1,392 of 1,393 labels reversible; 1 suffix-label exception; 0 approvals.");
}