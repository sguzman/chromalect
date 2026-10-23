// Compare two published Mandarin word-entry readings without adjudicating corpus contexts.
import assert from "node:assert/strict";
import fs from "node:fs";
import {pathToFileURL} from "node:url";

const toneMarks=new Map([["\u0304",1],["\u0301",2],["\u030c",3],["\u0300",4]]);
export function pinyinEquivalent(marked,numeric){
 if(typeof marked!=="string"||typeof numeric!=="string")return false;
 const segments=numeric.trim().split(/\s+/);
 if(!segments.length||segments.some(s=>!/^([a-zü:]+)([1-5])$/i.test(s)))return false;
 const letters=[];
 for(const c of marked.toLowerCase().normalize("NFD")){
  if(toneMarks.has(c)){if(!letters.length||letters.at(-1).tone)return false;letters.at(-1).tone=toneMarks.get(c);}
  else if(c==="\u0308"){if(!letters.length||letters.at(-1).base!=="u")return false;letters.at(-1).base="ü";}
  else if(/[a-z]/u.test(c))letters.push({base:c,tone:0});
  else return false;
 }
 let position=0;
 for(const syllable of segments){
  const m=syllable.match(/^([a-zü:]+)([1-5])$/i);
  const base=m[1].toLowerCase().replace(/u:/g,"ü");
  const chunk=letters.slice(position,position+[...base].length);
  if(chunk.map(c=>c.base).join("")!==base)return false;
  const markedTones=chunk.filter(c=>c.tone).map(c=>c.tone);
  const tone=Number(m[2]);
  if(tone===5?markedTones.length!==0:
     markedTones.length!==1||markedTones[0]!==tone)return false;
  position+=[...base].length;
 }
 return position===letters.length;
}
export function buildAgreement(external,cedict){
 assert.equal(external.schema,"chromalect.semantic.external-word-reading-observations.v0.1");
 assert.equal(cedict.schema,"chromalect.semantic.cedict-word-headword-index.v0.1");
 assert.equal(external.records.length,8);
 assert.equal(cedict.records.length,8);
 const heads=new Map(cedict.records.map(r=>[r.leadId,r]));
 const records=external.records.map(w=>{
  const d=heads.get(w.leadId);
  assert.ok(d&&d.simplifiedWord===w.writtenWordLead);
  assert.equal(w.independentSentenceReadingVerification,false);
  assert.equal(w.independentWordBoundaryVerification,false);
  assert.equal(d.independentSentenceReadingVerified,false);
  assert.equal(d.independentWordBoundaryVerified,false);
  const hasWiki=w.status==="word_entry_reading_observed";
  const hasCedict=d.headwords.length>0;
  assert.equal(hasWiki,hasCedict,"This bounded comparison requires matching observed cohorts");
  assert.ok(d.headwords.length<=1);
  const raw=hasCedict?d.headwords[0].pinyin:null;
  const concordant=hasWiki&&pinyinEquivalent(w.externalPublishedWordPinyin,raw);
  if(hasWiki)assert.equal(concordant,true,"Published word pronunciations disagree; independent review required");
  return {leadId:w.leadId,writtenWordLead:w.writtenWordLead,
   status:concordant?"published_word_pinyin_agree_across_two_sources":
    "insufficient_published_word_entry_sources",
   wiktionaryPinyin:w.externalPublishedWordPinyin,
   cedictNumberedPinyin:raw,
   wordEntryPronunciationAgreement:concordant?true:null,
   independentContextualReadingVerified:false,
   independentWordBoundaryVerified:false,independentSenseApproved:false};
 });
 return {schema:"chromalect.semantic.word-entry-reading-agreement.v0.1",
  status:"two_word_dictionary_transcriptions_not_sentence_pronunciation_verification",
  sources:{wiktionary:"external-word-reading-observations-v0.1.json",
   ccCedict:"cedict-word-headword-index-v0.1.json",
   ccCedictSnapshotSHA256:cedict.source.sourceUncompressedSHA256,
   sourceEditorialIndependenceCertified:false,sourceDefinitionsCopied:false},
  summary:{wordLeadsCompared:8,pairedPublishedWordReadings:records.filter(r=>r.wordEntryPronunciationAgreement===true).length,
   withoutPairedReadings:records.filter(r=>r.wordEntryPronunciationAgreement===null).length,
   independentlyVerifiedSentenceReadings:0,independentWordBoundaries:0,
   approvedLexicalSenses:0,productionApprovals:0},records};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const root="data/semantic/cedict-crossref/";
 const read=n=>JSON.parse(fs.readFileSync(root+n+"-v0.1.json","utf8"));
 const text=JSON.stringify(buildAgreement(read("external-word-reading-observations"),read("cedict-word-headword-index")),null,2)+"\n";
 const output=root+"word-entry-reading-agreement-v0.1.json";
 if(process.argv.includes("--check"))assert.equal(fs.readFileSync(output,"utf8"),text);
 else if(process.argv.includes("--write"))fs.writeFileSync(output,text);
 else throw Error("Use --check or --write");
 console.log("Published word Pinyin comparison: 5 paired entries, 0 sentence approvals.");
}