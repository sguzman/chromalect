// Provisional ICU segmentation diagnostics for source-checked Mandarin word leads.
// No copied sentences, independent word-boundary decisions, readings or senses are exported.
import assert from "node:assert/strict";
import fs from "node:fs";
import {createHash} from "node:crypto";
import {pathToFileURL} from "node:url";
const sha=s=>createHash("sha256").update(s,"utf8").digest("hex");
const statusValues=["single_icu_segment","multiple_icu_segments","cuts_icu_segment"];
export function segmentSurface(text,word,segmenter=new Intl.Segmenter("zh",{granularity:"word"})){
 assert.ok(typeof text==="string"&&typeof word==="string"&&word.length>=2);
 const pieces=[...segmenter.segment(text)];
 const results=[];
 let from=0,index;
 while((index=text.indexOf(word,from))!==-1){
  const end=index+word.length;
  const exact=pieces.some(x=>x.index===index&&x.segment===word);
  const starts=pieces.some(x=>x.index===index);
  const ends=pieces.some(x=>x.index+x.segment.length===end);
  results.push({offsetUTF16:index,lengthUTF16:word.length,
   segmentationHint:exact?"single_icu_segment":
    starts&&ends?"multiple_icu_segments":"cuts_icu_segment"});
  from=index+1;
 }
 return results;
}
function unwrap(json){return json?.data?.sentence??json?.data??json?.sentence??json;}
export function inspectResponse(json,credit,lead,originalHash,segmenter){
 const x=unwrap(json);
 const basic={sentenceId:credit.sentenceId,leadId:credit.leadId,
  sourceURL:credit.sourceURL,sourceTextCopied:false,
  independentWordBoundaryVerified:false,contextualReadingVerified:false,
  lexicalSenseApproved:false,quotationRightsCleared:false};
 if(!x||typeof x!=="object"||String(x.id)!==credit.sentenceId||
  typeof x.text!=="string"||typeof x.owner!=="string"||
  typeof x.lang!=="string"||typeof x.license!=="string")
  return {...basic,status:"invalid_source_record",machineHints:[]};
 if(sha(x.text)!==originalHash||x.owner!==credit.contributor||
    x.lang!=="cmn"||x.license!=="CC BY 2.0 FR"||
    x.is_unapproved!==false||!x.text.includes(lead.surfaceWord))
  return {...basic,status:"source_drift_or_policy_mismatch",machineHints:[]};
 return {...basic,status:"source_integrity_matches_pinned",
  machineHints:segmentSurface(x.text,lead.surfaceWord,segmenter)};
}
export async function inspectCohort(credits,leads,hashes,fetcher=fetch,options={}){
 assert.equal(credits.schema,"chromalect.semantic.tatoeba-word-candidate-attribution.v0.1");
 assert.equal(leads.schema,"chromalect.semantic.dictionary-word-surface-leads.v0.1");
 assert.equal(hashes.schema,"chromalect.semantic.tatoeba-word-sentence-text-fingerprints.v0.1");
 assert.equal(credits.records.length,27);
 assert.equal(hashes.records.length,27);
 const wordMap=new Map(leads.leads.map(x=>[x.id,x]));
 const hashMap=new Map(hashes.records.map(x=>[x.sentenceId,x.textSha256]));
 const segmenter=options.segmenter??new Intl.Segmenter("zh",{granularity:"word"});
 const pause=options.pause??(async()=>{});
 const records=[];
 for(const credit of credits.records){
  const lead=wordMap.get(credit.leadId),hash=hashMap.get(credit.sentenceId);
  assert.ok(lead&&hash&&/^[0-9a-f]{64}$/.test(hash));
  assert.equal(credit.readingVerified,false);
  assert.equal(credit.lexicalSenseApproved,false);
  let record={sentenceId:credit.sentenceId,leadId:credit.leadId,
   sourceURL:credit.sourceURL,status:"not_retrieved",sourceTextCopied:false,
   independentWordBoundaryVerified:false,contextualReadingVerified:false,
   lexicalSenseApproved:false,quotationRightsCleared:false,machineHints:[]};
  for(let i=0;i<3;i++){
   try{
    const res=await fetcher("https://api.tatoeba.org/v1/sentences/"+credit.sentenceId,{
     headers:{"Accept":"application/json","User-Agent":"Chromalect-source-research/1.0 (github.com/sguzman/chromalect)"},
     signal:AbortSignal.timeout(12000)});
    if(res.ok){record=inspectResponse(await res.json(),credit,lead,hash,segmenter);break;}
    record={...record,status:res.status===404?"not_found":res.status===429?"rate_limited":"http_"+res.status};
    if(res.status!==429&&res.status<500)break;
   }catch{record={...record,status:"network_failure"};}
   if(i<2)await pause(600*(i+1));
  }
  records.push(record);
  await pause(250);
 }
 const usable=records.filter(x=>x.status==="source_integrity_matches_pinned");
 const hints=usable.flatMap(x=>x.machineHints);
 return {schema:"chromalect.semantic.tatoeba-icu-word-segmentation-hints.v0.1",
  status:"runtime_tokenization_hints_not_linguistic_word_boundaries_or_approvals",
  checkedUTCDate:options.date??new Date().toISOString().slice(0,10),
  engine:{runtime:"Node.js",node:process.version,icu:process.versions.icu,
   locale:"zh",algorithm:"Intl.Segmenter",granularity:"word"},
  source:{api:"https://api.tatoeba.org/v1/sentences/{id}",
   attributionLedger:"tatoeba-word-candidate-attribution-v0.1.json",
   sentenceFingerprintLedger:"tatoeba-word-sentence-text-fingerprints-v0.1.json",
   outputContainsSentenceText:false},
  summary:{sourceRecordsRequested:27,sourceIntegrityMatches:usable.length,
   missingDriftedOrUnreachable:27-usable.length,machineOccurrenceHints:hints.length,
   singleICUSegment:hints.filter(h=>h.segmentationHint===statusValues[0]).length,
   multipleICUSegments:hints.filter(h=>h.segmentationHint===statusValues[1]).length,
   cutsICUSegment:hints.filter(h=>h.segmentationHint===statusValues[2]).length,
   independentlyVerifiedWordBoundaries:0,independentlyVerifiedReadings:0,
   approvedLexicalSenses:0,quotationRightsCleared:0},
  records};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const i=process.argv.indexOf("--output"),file=i<0?null:process.argv[i+1];
 if(!file)throw Error("Usage: node tatoeba_word_segmenter_hint.mjs --output <new-file>");
 const root="data/semantic/cedict-crossref/";
 const read=n=>JSON.parse(fs.readFileSync(root+n+"-v0.1.json","utf8"));
 const report=await inspectCohort(read("tatoeba-word-candidate-attribution"),
  read("dictionary-word-surface-leads"),read("tatoeba-word-sentence-text-fingerprints"));
 fs.writeFileSync(file,JSON.stringify(report,null,2)+"\n",{flag:"wx"});
 console.log("Provisional ICU word-segmentation source diagnostics:",report.summary);
 if(report.summary.sourceIntegrityMatches===0)
  throw Error("No source-integrity-matching sentence record could be inspected");
}