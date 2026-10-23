// Deterministic context-sensitive final spelling review gates from pinned citation source.
// These are not IPA readings or validated phonological analyses.
import assert from "node:assert/strict";
import fs from "node:fs";
import {pathToFileURL} from "node:url";
export const deriveContextGates = function deriveContextGates(citations){
 const ensure=(x,m)=>{if(!x)throw Error(m)};
 ensure(citations.schema==="chromalect.pronunciation-citations.v0"&&citations.tranche==="0001-1000"&&citations.characters.length===1000,"Wrong first-tranche citation source");
 const pal=new Set(["j","q","x","y"]),sib=new Set(["z","c","s","zh","ch","sh","r"]);
 const rules=[
 {id:"post_sibilant_i",description:"The letter i after conventional sibilant and retroflex initial spellings cannot be assigned an unconditional plain-i IPA reading.",
  sourceFamily:"contextual_vowel_allophony",match:r=>r.final==="i"&&sib.has(r.initial)},
 {id:"palatal_written_u",description:"Written u after a palatal category or y may require umlaut-aware phonological comparison; retain the original u spelling.",
  sourceFamily:"umlaut_suppression_context",match:r=>r.final==="u"&&pal.has(r.initial)},
 {id:"contracted_iu",description:"The spelling iu has a context-sensitive relation to the longer iou-type analysis, not literal letter-to-phoneme alignment.",
  sourceFamily:"written_final_contraction",match:r=>r.final==="iu"},
 {id:"contracted_ui",description:"The spelling ui relates to a longer uei-type analysis, not literal letter-to-phoneme alignment.",
  sourceFamily:"written_final_contraction",match:r=>r.final==="ui"},
 {id:"contracted_un_nonpalatal",description:"Written un outside the palatal set is a contracted uen-type spelling candidate, not an IPA transcription.",
  sourceFamily:"written_final_contraction",match:r=>r.final==="un"&&!pal.has(r.initial)},
 {id:"palatal_written_un",description:"Written un after a palatal category or y requires a separate ü-based interpretation; do not merge with other un contexts.",
  sourceFamily:"umlaut_suppression_context",match:r=>r.final==="un"&&pal.has(r.initial)},
 {id:"palatal_written_ue",description:"Written ue following a palatal or y category requires source-aware üe comparison rather than unconditional u+e.",
  sourceFamily:"umlaut_suppression_context",match:r=>r.final==="ue"&&pal.has(r.initial)},
 {id:"palatal_written_uan",description:"Written uan following a palatal or y category requires source-aware üan comparison rather than unconditional u+an.",
  sourceFamily:"umlaut_suppression_context",match:r=>r.final==="uan"&&pal.has(r.initial)}
 ];
 const occurrences=rules.map(()=>[]);let readingTotal=0;
 for(let index=0;index<citations.characters.length;index++){
  const c=citations.characters[index];
  ensure(c.rank===index+1&&Array.isArray(c.readings),"Nonsequential source citation row");
  for(const r of c.readings){
   readingTotal++;
   const matches=rules.map((x,i)=>x.match(r)?i:-1).filter(i=>i>=0);
   ensure(matches.length<=1,"Overlapping orthographic exception categories");
   for(const i of matches)occurrences[i].push({rank:c.rank,character:c.character,
    display:r.display,initial:r.initial,final:r.final,tone:r.tone});
  }
 }
 ensure(readingTotal===1171,"Citation reading count changed");
 const records=rules.map((x,i)=>({
  id:x.id,sourceFamily:x.sourceFamily,description:x.description,
  observedReadingCount:occurrences[i].length,
  uniqueCitationTriples:new Set(occurrences[i].map(r=>JSON.stringify([r.initial,r.final,r.tone]))).size,
  firstSourceExamples:occurrences[i].slice(0,5),
  independentIPAAnalysisApproved:false,
  certifiedAcousticRealizations:0
 }));
 const flagged=occurrences.flat(),count=flagged.length;
 ensure(records.length===8&&count===197,"Source orthographic risk count drift");
 ensure(records.map(x=>x.observedReadingCount).join(",")==="63,33,24,19,20,18,10,10","Source category counters drifted");
 const unique=new Set(flagged.map(r=>JSON.stringify([r.initial,r.final,r.tone])));
 ensure(unique.size===97,"Source exceptional triples drifted");
 return {schema:"chromalect.phonetics.mandarin-final-spelling-context-gates.v0.1",
  status:"contextual_spelling_review_flags_not_verified_ipa_or_phonemic_finals",
  source:{citationFile:"site/pronunciation-citations-0001-1000.json",
   upstreamRepository:citations.source.repository,upstreamBlobSHA:citations.source.blob_sha,
   originalLicense:citations.source.license,
   referenceNotes:[
    {publisher:"Humanities LibreTexts, Mandarin sound system",url:"https://human.libretexts.org/Bookshelves/Languages/Chinese/CHN101_Elementary_Mandarin_I_Textbook/01:_Introduction/1.01:_The_Sound_System_of_Mandarin"},
    {publisher:"Chinese lexicon and phonological-orthography analysis, academic reference",url:"https://students.aiu.edu/submissions/profiles/resources/onlineBook/d5F8W2_A_Grammar_of_Mandarin.pdf"}],
   noSourceSentenceText:true,noSourceDefinitionsCopied:true},
  limitations:[
   "Counts indicate only source written-initial/final spelling contexts; no measured speech token or authorized pronunciation.",
   "Rules flag selected high-attention spelling contexts only; unflagged spellings are not independently phonemically certified.",
   "These categories are research leads; phonological analyses and IPA transcription conventions may vary across sources.",
   "Original orthographic tokens and palette identity assignments remain unchanged."
  ],
  summary:{sourceCitationReadings:1171,flaggedSourceReadings:count,
   flaggedDistinctWrittenTriples:unique.size,flagCategories:8,
   independentlyAdjudicatedFinalPhonemes:0,
   approvedContextualPronunciations:0,
   approvedAcousticTranscriptions:0,
   learningStudyResults:0},
  records};
};
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const source=JSON.parse(fs.readFileSync("site/pronunciation-citations-0001-1000.json","utf8"));
 const body=JSON.stringify(deriveContextGates(source),null,2)+"\n";
 const path="data/phonetics/mandarin-final-spelling-context-gates-v0.1.json";
 if(process.argv.includes("--check"))assert.equal(fs.readFileSync(path,"utf8"),body);
 else if(process.argv.includes("--write"))fs.writeFileSync(path,body);
 else throw Error("Use --check or --write");
 console.log("Context-sensitive orthographic final triage: 197 source reading occurrences, 97 distinct written syllable triples, 0 IPA approvals.");
}