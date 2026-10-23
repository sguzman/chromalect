// Scan a sourced CC-CEDICT word dictionary for exact headword spellings.
// Readings remain dictionary leads, not contextual Tatoeba pronunciation evidence.
import assert from "node:assert/strict";
import fs from "node:fs";
import zlib from "node:zlib";
import {createHash} from "node:crypto";
import {pathToFileURL} from "node:url";
const digest=x=>createHash("sha256").update(x).digest("hex");
const URL="https://www.mdbg.net/chinese/export/cedict/cedict_1_0_ts_utf-8_mdbg.txt.gz";
export function scanHeadwords(raw,leads,opts={}){
 assert.equal(leads.schema,"chromalect.semantic.dictionary-word-surface-leads.v0.1");
 assert.equal(leads.leads.length,8);
 const sourceBytes=Buffer.isBuffer(raw)?raw:Buffer.from(raw);
 const unpacked=opts.compressed===false?sourceBytes:zlib.gunzipSync(sourceBytes);
 const text=unpacked.toString("utf8");
 const targets=new Map(leads.leads.map(x=>[x.surfaceWord,[]]));
 let parsedRows=0,malformedRows=0;
 for(const line of text.split(/\r?\n/)){
  if(!line||line.startsWith("#"))continue;
  const m=line.match(/^(\S+) (\S+) \[([^\]]+)\] \//);
  if(!m){malformedRows++;continue;}
  parsedRows++;
  if(targets.has(m[2]))targets.get(m[2]).push({traditional:m[1],simplified:m[2],pinyin:m[3]});
 }
 const records=leads.leads.map(lead=>{
  const unique=new Map();
  for(const x of targets.get(lead.surfaceWord))unique.set(x.traditional+"|"+x.pinyin,x);
  const matches=[...unique.values()].sort((a,b)=>
   a.pinyin.localeCompare(b.pinyin,"en")||a.traditional.localeCompare(b.traditional,"en"));
  return {leadId:lead.id,simplifiedWord:lead.surfaceWord,rank:lead.rank,
   observedHeadwordRecords:matches,sourceHeadwordCount:matches.length,
   targetSentenceReadingVerified:false,wordBoundaryVerified:false,
   independentSenseApproved:false};
 });
 return {schema:"chromalect.semantic.cedict-word-headword-scan.v0.1",
  status:"exact_cedict_headword_matches_not_contextual_usage_or_lexical_approval",
  source:{canonicalDownloadURL:URL,projectAttribution:"CC-CEDICT project, published by MDBG",
   license:"CC BY-SA 4.0",retrievedUTCDate:opts.date??new Date().toISOString().slice(0,10),
   compressedInput:opts.compressed!==false,
   sourceBytesSHA256:digest(sourceBytes),uncompressedTextSHA256:digest(unpacked),
   sourceFileCopiedToReport:false,sourceDefinitionsCopiedToReport:false,
   pinnedDictionaryLeadLedger:"dictionary-word-surface-leads-v0.1.json"},
  summary:{sourceRowsParsed:parsedRows,malformedNoncommentRows:malformedRows,
   requestedWordLeads:8,wordLeadsWithHeadwords:records.filter(x=>x.sourceHeadwordCount>0).length,
   wordLeadsWithoutHeadwords:records.filter(x=>x.sourceHeadwordCount===0).length,
   exactHeadwordRecords:records.reduce((n,x)=>n+x.sourceHeadwordCount,0),
   independentlyVerifiedTatoebaReadings:0,independentWordBoundaries:0,
   approvedLexicalSenses:0,productionApprovals:0},
  records};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const inputIndex=process.argv.indexOf("--input"),outIndex=process.argv.indexOf("--output");
 if(inputIndex<0||outIndex<0||!process.argv[inputIndex+1]||!process.argv[outIndex+1])
  throw Error("Usage: node cedict_word_headword_scan.mjs --input cedict.gz --output new-scan.json");
 const leads=JSON.parse(fs.readFileSync(
  "data/semantic/cedict-crossref/dictionary-word-surface-leads-v0.1.json","utf8"));
 const report=scanHeadwords(fs.readFileSync(process.argv[inputIndex+1]),leads);
 fs.writeFileSync(process.argv[outIndex+1],JSON.stringify(report,null,2)+"\n",{flag:"wx"});
 console.log("Official word-dictionary headword scan:",report.summary);
 if(report.summary.sourceRowsParsed<1000)throw Error("Dictionary snapshot incomplete");
}