// Live Tatoeba API v1 metadata audit; read-only, zero lexical approvals, no sentence text exported.
import assert from "node:assert/strict";
import fs from "node:fs";
import {createHash} from "node:crypto";
import {pathToFileURL} from "node:url";
const sha=text=>createHash("sha256").update(text,"utf8").digest("hex");
export function parseSentence(json,credit,word,originalHash){
 const x=json?.sentence??json?.data?.sentence??json;
 if(!x||typeof x!=="object"||String(x.id)!==credit.sentenceId||
    typeof x.text!=="string"||!x.text||typeof x.lang!=="string"||
    typeof x.owner!=="string"||!x.owner||typeof x.license!=="string"||!x.license)
  return {sentenceId:credit.sentenceId,leadId:credit.leadId,status:"invalid_record_structure",liveRecordChecked:false};
 const current=sha(x.text);
 return {sentenceId:credit.sentenceId,leadId:credit.leadId,status:"live_record_read",
  sourceURL:credit.sourceURL,sourceOwner:x.owner,pinnedSnapshotContributor:credit.contributor,
  ownerMatchesSnapshot:x.owner===credit.contributor,
  liveLanguage:x.lang,isMandarin:x.lang==="cmn",
  observedLicenseLabel:x.license,individualLicenseLabelObserved:true,
  sourceTextSha256:current,sourceTextUnchangedSinceSnapshot:current===originalHash,
  stillContainsWrittenWord:x.text.includes(word.surfaceWord),
  sourceRecordMarkedUnapproved:typeof x.is_unapproved==="boolean"?x.is_unapproved:null,
  independentWordBoundaryVerified:false,independentReadingVerified:false,
  independentLexicalSenseVerified:false,quotationRightsAdjudicated:false,productionVerified:false};
}
export async function checkAll(credits,leads,fingerprints,fetcher=fetch,opts={}){
 assert.equal(credits.schema,"chromalect.semantic.tatoeba-word-candidate-attribution.v0.1");
 assert.equal(leads.schema,"chromalect.semantic.dictionary-word-surface-leads.v0.1");
 assert.equal(fingerprints.schema,"chromalect.semantic.tatoeba-word-sentence-text-fingerprints.v0.1");
 assert.equal(credits.records.length,27);
 const words=new Map(leads.leads.map(x=>[x.id,x]));
 const hashes=new Map(fingerprints.records.map(x=>[x.sentenceId,x.textSha256]));
 const pause=opts.pause??(async()=>{});
 const records=[];
 for(const c of credits.records){
  const w=words.get(c.leadId),hash=hashes.get(c.sentenceId);
  if(!w||!hash||!/^[0-9a-f]{64}$/.test(hash)||
     c.individualLicenseStatus!=="pending_live_record_check"||
     c.readingVerified!==false||c.lexicalSenseApproved!==false)
   throw Error("Pinned source record or approval state changed");
  let parsed=null;
  for(let attempt=0;attempt<3;attempt++){
   try{
    const response=await fetcher("https://api.tatoeba.org/v1/sentences/"+c.sentenceId,{
     headers:{"Accept":"application/json","User-Agent":"Chromalect-source-research/1.0 (github.com/sguzman/chromalect)"},
     signal:AbortSignal.timeout(12000)});
    if(response.ok){parsed=parseSentence(await response.json(),c,w,hash);break;}
    const reason=response.status===404?"not_found":response.status===429?"rate_limited":
     response.status>=500?"upstream_failure":"http_failure";
    parsed={sentenceId:c.sentenceId,leadId:c.leadId,status:reason,
     httpStatus:response.status,liveRecordChecked:false};
    if(response.status!==429&&response.status<500)break;
   }catch{parsed={sentenceId:c.sentenceId,leadId:c.leadId,status:"network_failure",liveRecordChecked:false};}
   if(attempt<2)await pause(600*(attempt+1));
  }
  records.push(parsed);
  await pause(250);
 }
 const good=records.filter(x=>x.status==="live_record_read");
 return {schema:"chromalect.semantic.tatoeba-live-word-record-audit.v0.1",
  status:"per_sentence_api_metadata_observed_not_rights_or_lexical_clearance",
  source:{apiEndpoint:"https://api.tatoeba.org/v1/sentences/{id}",
   pinnedAttribution:"tatoeba-word-candidate-attribution-v0.1.json",
   pinnedTextHashes:"tatoeba-word-sentence-text-fingerprints-v0.1.json",
   observedUTCDate:opts.date??new Date().toISOString().slice(0,10)},
  warnings:["Observed license labels are live API metadata, not an independent legal rights clearance.",
   "Source-owner and sentence-text drift are reported, never silently reconciled.",
   "Word substring agreement is not verified segmentation or Mandarin pronunciation.",
   "No complete sentence text is included; all linguistic approvals remain zero."],
  summary:{requested:records.length,liveRecordsRead:good.length,
   missingOrUnreachable:records.length-good.length,liveLicenseLabelsObserved:good.length,
   ownerMatchesSnapshot:good.filter(x=>x.ownerMatchesSnapshot).length,
   textMatchesSnapshot:good.filter(x=>x.sourceTextUnchangedSinceSnapshot).length,
   containsTargetWordSurface:good.filter(x=>x.stillContainsWrittenWord).length,
   markedUnapprovedAtSource:good.filter(x=>x.sourceRecordMarkedUnapproved===true).length,
   quotationRightsCleared:0,independentlyVerifiedReadings:0,approvedLexicalSenses:0,productionApprovals:0},
  records};
}
async function main(){
 const n=process.argv.indexOf("--output"),file=n>=0?process.argv[n+1]:null;
 if(!file)throw Error("Usage: node tatoeba_live_word_record_audit.mjs --output <new-file>");
 const root="data/semantic/cedict-crossref/";
 const load=name=>JSON.parse(fs.readFileSync(root+name,"utf8"));
 const report=await checkAll(load("tatoeba-word-candidate-attribution-v0.1.json"),
  load("dictionary-word-surface-leads-v0.1.json"),
  load("tatoeba-word-sentence-text-fingerprints-v0.1.json"));
 fs.writeFileSync(file,JSON.stringify(report,null,2)+"\n",{flag:"wx"});
 console.log("Live Tatoeba source check:",report.summary);
 if(report.summary.liveRecordsRead===0)throw Error("No live source records available; inspect saved audit.");
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)await main();
