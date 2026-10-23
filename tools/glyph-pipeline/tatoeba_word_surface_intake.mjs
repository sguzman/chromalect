// Scan official Mandarin corpus exports for dictionary-listed written word forms.
// Exact substrings are corpus research leads, NOT verified Chinese word boundaries or readings.
import assert from "node:assert/strict";
import fs,{createReadStream} from "node:fs";
import {createHash} from "node:crypto";
import {createInterface} from "node:readline";
import {spawn} from "node:child_process";
import {pathToFileURL} from "node:url";
import {parseDetailedRow} from "./tatoeba_context_candidate_extract.mjs";

export function createWordLeadCollector(leads,limit=5){
 if(!Array.isArray(leads)||!leads.length||!Number.isInteger(limit)||limit<1||limit>20)
  throw new Error("Invalid word lead selection limit");
 const ids=new Set(),forms=new Set();
 const output=leads.map(l=>{
  if(typeof l.id!=="string"||!l.id||ids.has(l.id)||
     typeof l.surfaceWord!=="string"||[...l.surfaceWord].length<2||
     forms.has(l.surfaceWord)||typeof l.character!=="string"||
     !l.surfaceWord.includes(l.character)||l.independentlyAdjudicated!==false||
     l.sentenceReadingAssignment!==null)
   throw new Error("Invalid, duplicate or independently adjudicated source word lead");
  ids.add(l.id);forms.add(l.surfaceWord);
  return {leadId:l.id,rank:l.rank,character:l.character,
   writtenWordLead:l.surfaceWord,publisherSourceURL:l.publisherSourceURL,
   dictionaryHeadingReading:l.dictionaryHeadingReading,
   rawMatchingSentenceCount:0,candidates:[]};
 });
 let rowsScanned=0,uncredited=0,skippedForLength=0;
 const sentenceIds=new Set();
 function add(row){
  rowsScanned++;
  if(sentenceIds.has(row.id))throw new Error("Duplicate source sentence ID");
  sentenceIds.add(row.id);
  if(!row.contributor){uncredited++;return;}
  const length=[...row.text].length;
  if(length<5||length>150){skippedForLength++;return;}
  for(const lead of output){
   if(!row.text.includes(lead.writtenWordLead))continue;
   lead.rawMatchingSentenceCount++;
   const score=createHash("sha256").update(lead.leadId+":"+row.id).digest("hex");
   const candidate={sentenceId:row.id,sourceUrl:"https://tatoeba.org/en/sentences/show/"+row.id,
    contributor:row.contributor,sentenceTextSha256:createHash("sha256").update(row.text,"utf8").digest("hex"),
    selectionScore:score,
    exactWrittenSurfaceSequenceObserved:true,
    independentlyVerifiedWordBoundary:false,
    independentlyVerifiedReading:false,
    independentlyVerifiedLexicalSense:false,redistributionPermission:"requires_individual_check"};
   const selected=lead.candidates;
   if(selected.length<limit){
    selected.push(candidate);selected.sort((a,b)=>a.selectionScore.localeCompare(b.selectionScore));
   }else if(score<selected[selected.length-1].selectionScore){
    selected[selected.length-1]=candidate;
    selected.sort((a,b)=>a.selectionScore.localeCompare(b.selectionScore));
   }
  }
 }
 function finish(sha,date){
  assert.match(sha,/^[0-9a-f]{64}$/);
  assert.match(date,/^\d{4}-\d{2}-\d{2}$/);
  const matches=output.reduce((s,x)=>s+x.rawMatchingSentenceCount,0);
  const selected=output.reduce((s,x)=>s+x.candidates.length,0);
  return {schema:"chromalect.semantic.tatoeba-word-surface-intake.v0.1",
   status:"dictionary_word_literal_substring_candidates_not_contextual_reading_validation",
   source:{dataset:"Tatoeba cmn_sentences_detailed.tsv",
    uncompressedTSVSha256:sha,snapshotRetrievalUTCDate:date,
    dictionaryWordLeads:"dictionary-word-surface-leads-v0.1.json"},
   selection:{method:"lowest_sha256_lead_id_and_sentence_id",perWordLead:limit,
    sourceSentenceTextCopied:false,independentWordBoundaryCheck:false},
   summary:{dictionaryWordLeads:output.length,sourceSentencesScanned:rowsScanned,
    rawWordSubstringMatches:matches,selectedWordSentenceAssociations:selected,
    wordLeadsWithSelectedCandidates:output.filter(x=>x.candidates.length>0).length,
    wordLeadsWithoutSelectedCandidates:output.filter(x=>x.candidates.length===0).length,
    rowsWithoutContributor:uncredited,rowsOutsideLengthWindow:skippedForLength,
    contextualReadingVerifications:0,lexicalSenseApprovals:0,pictogramApprovals:0},
   records:output};
 }
 return {add,finish};
}
export async function extractWordLeads(input,leads,limit,date){
 const compressed=input.endsWith(".bz2");
 const child=compressed?spawn("bzip2",["-dc","--",input],{stdio:["ignore","pipe","pipe"]}):null;
 const stream=child?child.stdout:createReadStream(input);
 const digest=createHash("sha256");
 stream.on("data",b=>digest.update(b));
 let errorOutput="";
 const completion=child?new Promise((resolve,reject)=>{
  child.stderr.on("data",b=>{if(errorOutput.length<1000)errorOutput+=b.toString("utf8");});
  child.once("error",reject);
  child.once("close",code=>code===0?resolve():reject(new Error("bzip2 failed: "+errorOutput.slice(0,300))));
 }):null;
 const reader=createInterface({input:stream,crlfDelay:Infinity});
 const selected=createWordLeadCollector(leads,limit);
 let rowNum=0;
 for await(const line of reader){
  rowNum++;
  if(!line.trim())continue;
  try{selected.add(parseDetailedRow(line));}
  catch(e){throw new Error("Invalid corpus TSV row "+rowNum+": "+e.message);}
 }
 if(completion)await completion;
 return selected.finish(digest.digest("hex"),date);
}
async function main(){
 const arg=n=>{const p=process.argv.indexOf(n);return p<0?null:process.argv[p+1];};
 const input=arg("--input"),output=arg("--output"),date=arg("--snapshot-date"),count=arg("--max-per-word")||"5";
 if(!input||!output||!date||!/^\d+$/.test(count))
  throw new Error("Usage: node tatoeba_word_surface_intake.mjs --input <cmn TSV or .bz2> --snapshot-date YYYY-MM-DD --output <new JSON> [--max-per-word 5]");
 const leadFile=JSON.parse(fs.readFileSync("data/semantic/cedict-crossref/dictionary-word-surface-leads-v0.1.json","utf8"));
 assert.equal(leadFile.status,"publisher_dictionary_word_leads_not_independent_usage_attestations");
 const report=await extractWordLeads(input,leadFile.leads,Number(count),date);
 fs.writeFileSync(output,JSON.stringify(report,null,2)+"\n",{flag:"wx"});
 console.log("Written word surface candidate intake:",report.summary);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)await main();