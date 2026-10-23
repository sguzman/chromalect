// Deterministic orthographic Pinyin reference codec; not IPA or contextual phonology.
// A reversible baseline for the pinned 1,000-character citation-reading tranche.
import assert from "node:assert/strict";
import fs from "node:fs";
import {pathToFileURL} from "node:url";

const tones=["","\u0304","\u0301","\u030c","\u0300"];
const vowels=new Set([...("aeiouü")]);
const accentValues=new Map(tones.slice(1).map((v,i)=>[v,i+1]));
export function encodePinyinSpelling(initial,final,tone,palette){
 assert.ok(palette?.initial?.tokens&&palette?.final?.tokens&&palette?.tone?.tokens);
 assert.ok(Object.hasOwn(palette.initial.tokens,initial),"Unrecognized initial token");
 assert.ok(Object.hasOwn(palette.final.tokens,final),"Unrecognized final token");
 assert.ok(Number.isInteger(tone)&&tone>=0&&tone<=4,"Tone must use published 0-4 citation channel");
 const base=(initial==="∅"?"":initial)+final,chars=[...base];
 if(tone===0)return base;
 let pos=chars.findIndex(x=>x==="a");
 if(pos<0)pos=chars.findIndex(x=>x==="e");
 if(pos<0&&base.includes("ou"))pos=base.indexOf("o");
 if(pos<0&&base.includes("iu"))pos=base.indexOf("iu")+1;
 if(pos<0&&base.includes("ui"))pos=base.indexOf("ui")+1;
 if(pos<0)for(let i=chars.length-1;i>=0;i--)if(vowels.has(chars[i])){pos=i;break;}
 assert.ok(pos>=0,"Unable to find tone-bearing vowel");
 chars[pos]=(chars[pos]+tones[tone]).normalize("NFC");
 return chars.join("");
}
export function decodePinyinSpelling(display,palette){
 assert.ok(typeof display==="string"&&display.length>0&&display.length<=32);
 assert.equal(display,display.normalize("NFC"),"Input must be canonical NFC");
 const decomposed=display.normalize("NFD");
 let tone=0,accentCount=0;
 for(const c of decomposed){
  if(accentValues.has(c)){tone=accentValues.get(c);accentCount++;}
  else if(c==="\u0308")continue;
  else assert.ok(/[a-z]/.test(c),"Non-Pinyin character in citation reading");
 }
 assert.ok(accentCount<=1,"More than one written tone mark");
 const plain=[...decomposed].filter(c=>!accentValues.has(c)).join("").normalize("NFC");
 const initials=Object.keys(palette.initial.tokens);
 const finals=palette.final.tokens;
 const options=initials.map(initial=>({
  initial,final:plain.slice(initial==="∅"?0:initial.length)
 })).filter(v=>{
  const prefix=v.initial==="∅"?"":v.initial;
  return plain.startsWith(prefix)&&Object.hasOwn(finals,v.final);
 });
 assert.equal(options.length,1,"Ambiguous or unrecognized orthographic initial/final split");
 const {initial,final}=options[0];
 const rendered=encodePinyinSpelling(initial,final,tone,palette);
 assert.equal(rendered,display,"Pinyin tone mark is not in canonical written position");
 return {initial,final,tone,orthographic_glide:initial==="y"||initial==="w"};
}
export function auditCitationTranche(source,layers){
 assert.equal(source.schema,"chromalect.pronunciation-citations.v0");
 assert.equal(source.tranche,"0001-1000");
 assert.equal(source.language,"zh-CN-Putonghua-citation");
 assert.equal(layers.schema,"chromalect.presentation-layers.v0");
 const palette=layers.palette_domains;
 assert.equal(Object.keys(palette.initial.tokens).length,24);
 assert.equal(Object.keys(palette.final.tokens).length,33);
 assert.equal(Object.keys(palette.tone.tokens).length,5);
 assert.equal(source.characters.length,1000);
 let readings=0,glides=0,neutral=0,ambiguous=0;
 const sampleFailures=[];
 for(let index=0;index<source.characters.length;index++){
  const x=source.characters[index];
  assert.equal(x.rank,index+1);
  assert.ok(typeof x.character==="string"&&x.character.length>0);
  assert.ok(Array.isArray(x.readings)&&x.readings.length>0);
  for(const r of x.readings){
   readings++;
   const decoded=decodePinyinSpelling(r.display,palette);
   const actual={initial:r.initial,final:r.final,tone:r.tone,orthographic_glide:r.orthographic_glide};
   if(JSON.stringify(decoded)!==JSON.stringify(actual)||
      encodePinyinSpelling(r.initial,r.final,r.tone,palette)!==r.display)
    sampleFailures.push({rank:x.rank,character:x.character,display:r.display});
   if(r.orthographic_glide)glides++;
   if(r.tone===0)neutral++;
  }
 }
 assert.equal(sampleFailures.length,0,"Citation spelling identity round trip failed");
 assert.equal(readings,1171);
 return {schema:"chromalect.phonetics.pinyin-citation-orthography-audit.v0.1",
  status:"reversible_pinyin_spelling_baseline_not_phonemic_or_contextual_reading_verification",
  source:{tranche:"site/pronunciation-citations-0001-1000.json",
   tokenPalettes:"site/layers-v0.1.json",contrastInterpretation:"orthographic_pinyin_tokens_only",
   sourceAttribution:source.source,independentPhonologicalCertification:false},
  counts:{characters:1000,citationReadings:readings,roundTripMatches:readings,
   roundTripFailures:sampleFailures.length,orthographicGlides:glides,neutralToneLabels:neutral,
   publishedInitialTokens:24,publishedFinalTokens:33,publishedToneTokens:5,
   contextualPronunciationApprovals:0,verifiedPhonemicContrasts:0,learningStudyResults:0},
  unresolved:["This codec preserves source Pinyin spelling, not physical speech sounds or IPA.",
   "Pinyin letters y/w are orthographic glide labels in this presentation scheme.",
   "Citation tone numbers do not encode tone sandhi or sentence-specific pronunciation.",
   "No new phonemic contrast inventory or constructed featural glyphs are approved."]};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const source=JSON.parse(fs.readFileSync("site/pronunciation-citations-0001-1000.json","utf8"));
 const layers=JSON.parse(fs.readFileSync("site/layers-v0.1.json","utf8"));
 const report=JSON.stringify(auditCitationTranche(source,layers),null,2)+"\n";
 const path="data/phonetics/pinyin-citation-orthography-audit-v0.1.json";
 if(process.argv.includes("--check"))assert.equal(fs.readFileSync(path,"utf8"),report);
 else if(process.argv.includes("--write"))fs.writeFileSync(path,report);
 else throw Error("Use --check or --write");
 console.log("Pinyin orthographic round-trip: 1,171 citation readings over 1,000 characters; 0 contextual approvals.");
}