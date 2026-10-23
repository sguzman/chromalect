// Offline intake of Tatoeba Mandarin detailed sentence exports.
// Candidates are source-ID and surface-form matches, NOT independently attested readings.
import assert from "node:assert/strict";
import fs from "node:fs";
import {createHash} from "node:crypto";
import {createReadStream} from "node:fs";
import {createInterface} from "node:readline";
import {spawn} from "node:child_process";
import {pathToFileURL} from "node:url";

export function parseDetailedRow(line){
 const values=line.split("\t");
 if(values.length!==6)throw new Error("Expected six Tatoeba detailed TSV fields");
 const [id,language,text,contributor,created,modified]=values;
 if(!/^\d+$/.test(id)||language!=="cmn"||!text)
  throw new Error("Invalid Tatoeba Mandarin detailed sentence row");
 // The real detailed export permits an unset creation timestamp; it is not proof of invalid text.
 const dateOrNull=x=>/^\d{4}-\d{2}-\d{2}/.test(x)?x:null;
 return {id,language,text,contributor:contributor==="\\N"||!contributor?null:contributor,
  created:dateOrNull(created),modified:dateOrNull(modified)};
}

function sentenceCandidate(row){
 return {
  sourceType:"tatoeba_mandarin_sentence",
  sentenceId:row.id,
  sourceUrl:"https://tatoeba.org/en/sentences/show/"+row.id,
  contributor:row.contributor,
  sentenceTextSha256:createHash("sha256").update(row.text,"utf8").digest("hex"),
  sourceDateModified:row.modified,
  readingInContext:"not_checked",
  wordBoundary:"not_checked",
  lexicalSense:"not_checked",
  corpusRecordLicense:"requires_individual_check",
  redistributionStatus:"source_id_and_hash_only"
 };
}

export function newCollector(targets,maxPerCharacter){
 if(!Array.isArray(targets)||!targets.length||!Number.isInteger(maxPerCharacter)||
    maxPerCharacter<1||maxPerCharacter>20)throw new Error("Invalid intake configuration");
 const byChar=new Map();
 for(const target of targets){
  if(!Number.isInteger(target.rank)||typeof target.character!=="string"||
     [...target.character].length!==1||byChar.has(target.character))
   throw new Error("Ambiguous or duplicated single-character target");
  byChar.set(target.character,{rank:target.rank,character:target.character,candidates:[]});
 }
 let scanned=0,accepted=0,skippedTooLong=0,skippedMissingContributor=0;
 const seenIds=new Set();
 function add(row){
  scanned++;
  if(seenIds.has(row.id))throw new Error("Duplicate sentence ID in source export");
  seenIds.add(row.id);
  if(!row.contributor){skippedMissingContributor++;return;}
  const codepoints=[...row.text].length;
  if(codepoints<5||codepoints>150){skippedTooLong++;return;}
  const chars=new Set([...row.text]);
  const candidate=sentenceCandidate(row);
  for(const c of chars){
   const t=byChar.get(c);
   if(!t||t.candidates.length>=maxPerCharacter)continue;
   t.candidates.push(candidate);
   accepted++;
  }
 }
 function finish(snapshotHash,snapshotDate){
  assert.match(snapshotHash,/^[a-f0-9]{64}$/);
  assert.match(snapshotDate,/^\d{4}-\d{2}-\d{2}$/);
  const records=[...byChar.values()].sort((a,b)=>a.rank-b.rank);
  const summary={targetCharacters:records.length,sentencesScanned:scanned,
   matchingCandidateReferences:accepted,
   charactersWithCandidateReferences:records.filter(x=>x.candidates.length>0).length,
   charactersWithNoCandidateReferences:records.filter(x=>x.candidates.length===0).length,
   sentencesOutsideLengthWindow:skippedTooLong,
   sentencesWithoutContributorCredit:skippedMissingContributor,
   contextualReadingsVerified:0,lexicalSensesApproved:0,emojiComprehensionApproved:0};
  return {schema:"chromalect.semantic.tatoeba-surface-context-candidates.v0.1",
   status:"unadjudicated_sentence_surface_matches_not_reading_or_sense_validation",
   source:{dataset:"Tatoeba cmn_sentences_detailed.tsv",
    canonicalDownload:"https://downloads.tatoeba.org/exports/per_language/cmn/cmn_sentences_detailed.tsv.bz2",
    declaredSnapshotDate:snapshotDate,uncompressedTSVSha256:snapshotHash,
    licenseGuidance:"https://en.wiki.tatoeba.org/articles/show/using-the-tatoeba-corpus"},
   limits:{maxCandidateIDsPerCharacter:maxPerCharacter,
    sourceTextIncluded:false,individualContributorAndLicenseMustBeChecked:true},
   summary,records};
 }
 return {add,finish};
}

export async function extractFile(input,targets,maxPerCharacter,snapshotDate){
 // bzip2 is passed an argument array with no shell and is used only for local files.
 const compressed=input.endsWith(".bz2");
 const child=compressed?spawn("bzip2",["-dc","--",input],{
  stdio:["ignore","pipe","pipe"]}):null;
 const inputStream=compressed?child.stdout:createReadStream(input);
 const hash=createHash("sha256");
 inputStream.on("data",chunk=>hash.update(chunk));
 let stderr="";
 let finished=null;
 if(child){
  child.stderr.on("data",chunk=>{if(stderr.length<4096)stderr+=chunk.toString("utf8");});
  finished=new Promise((resolve,reject)=>{
   child.once("error",reject);
   child.once("close",code=>code===0?resolve():reject(new Error("bzip2 exited "+code+": "+stderr.slice(0,300))));
  });
 }
 const reader=createInterface({input:inputStream,crlfDelay:Infinity});
 const collect=newCollector(targets,maxPerCharacter);
 let rowNumber=0;
 for await(const line of reader){
  rowNumber++;
  if(!line.trim())continue;
  try{collect.add(parseDetailedRow(line));}
  catch(error){
   const v=line.split("\t");
   throw new Error("Corpus TSV row "+rowNumber+": "+error.message+
     " (fields="+v.length+", language="+(v[1]??"missing")+
     ", contributorPresent="+Boolean(v[3]&&v[3]!=="\\N")+
     ", addedDatePattern="+/^[0-9]{4}-[0-9]{2}-[0-9]{2}/.test(v[4]??"")+
     ", modifiedDatePattern="+/^[0-9]{4}-[0-9]{2}-[0-9]{2}/.test(v[5]??"")+")");
  }
 }
 if(finished)await finished;
 return collect.finish(hash.digest("hex"),snapshotDate);
}

async function main(){
 const argv=process.argv.slice(2),get=name=>{
  const i=argv.indexOf(name);return i<0?null:argv[i+1];
 };
 const input=get("--input"),output=get("--output"),snapshot=get("--snapshot-date"),size=get("--max-per-character")||"3";
 if(!input||!output||!snapshot||!/^\d+$/.test(size))
  throw new Error("Usage: node tatoeba_context_candidate_extract.mjs --input <cmn detailed TSV or .bz2> --snapshot-date YYYY-MM-DD --output <local JSON> [--max-per-character 3]");
 const q=JSON.parse(fs.readFileSync("data/semantic/cedict-crossref/high-attention-evidence-priority-v0.1.json","utf8"));
 assert.equal(q.summary.highAttentionCharacters,142);
 const targets=q.records.map(x=>({rank:x.rank,character:x.character}));
 const report=await extractFile(input,targets,Number(size),snapshot);
 assert.equal(report.summary.targetCharacters,142);
 fs.writeFileSync(output,JSON.stringify(report,null,2)+"\n",{flag:"wx"});
 console.log("Saved "+report.summary.matchingCandidateReferences+
  " unadjudicated source-ID matches for "+report.summary.charactersWithCandidateReferences+
  " characters; no sentence text copied and no lexical approvals.");
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)await main();
