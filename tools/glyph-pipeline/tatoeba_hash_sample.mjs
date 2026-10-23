// Deterministic whole-snapshot sampling of surface-form matches, not reading adjudication.
// Preserves only source IDs, contributor credits, sentence hashes, and source checksum.
import assert from "node:assert/strict";
import fs,{createReadStream} from "node:fs";
import {createHash} from "node:crypto";
import {createInterface} from "node:readline";
import {spawn} from "node:child_process";
import {pathToFileURL} from "node:url";
import {parseDetailedRow} from "./tatoeba_context_candidate_extract.mjs";

export function createSampler(targets,perCharacter=5){
 if(!Array.isArray(targets)||!targets.length||!Number.isInteger(perCharacter)||
    perCharacter<1||perCharacter>20)throw new Error("Invalid selection size");
 const targetsByCharacter=new Map();
 for(const item of targets){
  if(!Number.isInteger(item.rank)||item.rank<1||
     typeof item.character!=="string"||[...item.character].length!==1||
     targetsByCharacter.has(item.character))throw new Error("Invalid or duplicated target");
  targetsByCharacter.set(item.character,{rank:item.rank,character:item.character,chosen:[]});
 }
 let scanned=0,matched=0,missingCredit=0,outsideWindow=0;
 const ids=new Set();
 function add(row){
  scanned++;
  if(ids.has(row.id))throw new Error("Duplicate corpus sentence ID");
  ids.add(row.id);
  if(!row.contributor){missingCredit++;return;}
  const length=[...row.text].length;
  if(length<5||length>150){outsideWindow++;return;}
  const chars=new Set([...row.text]);
  for(const char of chars){
   const target=targetsByCharacter.get(char);
   if(!target)continue;
   matched++;
   const score=createHash("sha256").update(target.rank+":"+row.id).digest("hex");
   const picked={score,sentenceId:row.id,
    sourceUrl:"https://tatoeba.org/en/sentences/show/"+row.id,
    contributor:row.contributor,
    sentenceTextSha256:createHash("sha256").update(row.text,"utf8").digest("hex"),
    readingInContext:"not_checked",
    lexicalSense:"not_checked",license:"requires_individual_check"};
   const chosen=target.chosen;
   if(chosen.length<perCharacter){chosen.push(picked);chosen.sort((a,b)=>a.score.localeCompare(b.score));}
   else if(score<chosen[chosen.length-1].score){
    chosen[chosen.length-1]=picked;chosen.sort((a,b)=>a.score.localeCompare(b.score));
   }
  }
 }
 function finish(sourceHash,date){
  assert.match(sourceHash,/^[a-f0-9]{64}$/);
  assert.match(date,/^\d{4}-\d{2}-\d{2}$/);
  const records=[...targetsByCharacter.values()].sort((a,b)=>a.rank-b.rank).map(r=>({
   rank:r.rank,character:r.character,
   candidates:r.chosen.map(x=>({...x}))
  }));
  const selected=records.reduce((n,r)=>n+r.candidates.length,0);
  const unique=new Set(records.flatMap(r=>r.candidates.map(x=>x.sentenceId)));
  return {schema:"chromalect.semantic.tatoeba-hash-sampled-candidate-ids.v0.1",
   status:"independently_hosted_surface_matches_not_verified_readings",
   source:{corpus:"Tatoeba cmn_sentences_detailed.tsv",retrievedUTC:date,
    uncompressedTSVSha256:sourceHash,
    download:"https://downloads.tatoeba.org/exports/per_language/cmn/cmn_sentences_detailed.tsv.bz2"},
   selection:{method:"smallest_sha256_rank_and_sentence_id",perCharacter,
    orderIndependent:true,includesSentenceText:false,sourceLicenseMustBeChecked:true},
   summary:{targetCharacters:records.length,sourceSentenceRowsScanned:scanned,
    rawCharacterSentenceMatchesEvaluated:matched,selectedCharacterSentenceAssociations:selected,
    selectedDistinctSentenceIds:unique.size,
    charactersWithSelectedMatches:records.filter(x=>x.candidates.length>0).length,
    charactersWithoutSelectedMatches:records.filter(x=>x.candidates.length===0).length,
    sourceRowsSkippedForMissingCredit:missingCredit,
    sourceRowsSkippedForLength:outsideWindow,
    contextualReadingsVerified:0,lexicalSenseApprovals:0,pictogramApprovals:0},
   caveats:["Cryptographic sampling diversifies IDs over the full snapshot but does not independently identify readings, senses or linguistic quality.",
    "No literal sentence text is copied; contributor rights must be checked before quoting.",
    "The selection is by source ID hash and does not guarantee dialect, register, or pronunciation balance."],
   records};
 }
 return {add,finish};
}

export async function sampleFile(input,targets,perCharacter,date){
 const compressed=input.endsWith(".bz2");
 const child=compressed?spawn("bzip2",["-dc","--",input],{stdio:["ignore","pipe","pipe"]}):null;
 const stream=child?child.stdout:createReadStream(input);
 const hash=createHash("sha256");
 stream.on("data",chunk=>hash.update(chunk));
 let diagnostics="";
 const completion=child?new Promise((resolve,reject)=>{
  child.stderr.on("data",chunk=>{if(diagnostics.length<1500)diagnostics+=chunk.toString("utf8");});
  child.once("error",reject);
  child.once("close",code=>code===0?resolve():reject(new Error("bzip2 failed: "+diagnostics.slice(0,250))));
 }):null;
 const reader=createInterface({input:stream,crlfDelay:Infinity});
 const sampler=createSampler(targets,perCharacter);
 let lineNo=0;
 for await(const line of reader){
  lineNo++;
  if(!line.trim())continue;
  try{sampler.add(parseDetailedRow(line));}
  catch(error){throw new Error("Invalid source row "+lineNo+": "+error.message);}
 }
 if(completion)await completion;
 return sampler.finish(hash.digest("hex"),date);
}

async function main(){
 const arg=(name)=>{const i=process.argv.indexOf(name);return i>=0?process.argv[i+1]:null;};
 const input=arg("--input"),output=arg("--output"),date=arg("--snapshot-date");
 const max=arg("--max-per-character")||"5";
 if(!input||!output||!date||!/^\d+$/.test(max))
  throw new Error("Usage: node tatoeba_hash_sample.mjs --input <cmn TSV or .bz2> --snapshot-date YYYY-MM-DD --output <new local JSON> [--max-per-character 5]");
 const source=JSON.parse(fs.readFileSync("data/semantic/cedict-crossref/high-attention-evidence-priority-v0.1.json","utf8"));
 assert.equal(source.summary.highAttentionCharacters,142);
 const targets=source.records.map(x=>({rank:x.rank,character:x.character}));
 const report=await sampleFile(input,targets,Number(max),date);
 assert.equal(report.summary.targetCharacters,142);
 fs.writeFileSync(output,JSON.stringify(report,null,2)+"\n",{flag:"wx"});
 console.log("Deterministic corpus hash sample:",report.summary);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)await main();
