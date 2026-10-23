/* Source-pinned reading-level research, including entries without emoji candidates.
   Local preliminary observations only; no approvals or server writes. */
(() => {
"use strict";
const $=id=>document.getElementById(id);
const layers=globalThis.ChromalectLayers;
const dictionary=globalThis.ChromalectDictionaryReadings;
const references=globalThis.ChromalectDictionaryReferences;
const ids=["reading-scope","reading-count","reading-start","reading-export",
 "reading-status","reading-session","reading-count-label","reading-progress",
 "reading-progress-fill","reading-glyph","reading-rank","reading-current",
 "reading-gloss","reading-references","reading-external-sources","reading-other","reading-full","reading-source-id",
 "reading-form","reading-usage","reading-unit","reading-example","reading-reference",
 "reading-rationale","reading-commit","reading-after","reading-next"];
if(!layers||!dictionary||!references||ids.some(id=>!$(id)))return;
const blocks=["0001-0200","0201-0400","0401-0600","0601-0800","0801-1000"];
const sourceRevision="63c2569948629323b515833930fdd10f285401b6";
const categories=new Set(["ordinary","specialized","historical","proper_name","graphic","undetermined"]);
const units=new Set(["standalone","in_word","both","undetermined"]);
let entries=[],profile=new Map(),externalSources=new Map(),checkedSources=new Map(),checkedDate=null,trials=[],records=[],index=0,locked=false;
let sessionScope=null,sessionCount=null;
function status(text){$("reading-status").textContent=text;}
function shuffle(rows){
 const result=rows.slice();
 for(let i=result.length-1;i>0;i--){
  const j=Math.floor(Math.random()*(i+1));
  [result[i],result[j]]=[result[j],result[i]];
 }
 return result;
}
function eligible(scope,r){
 return scope==="all"||
  (scope==="higher"&&r.tier==="higher")||
  (scope==="higher_no_links"&&r.tier==="higher"&&!r.hasAnySourceReferences)||
  (scope==="targeted"&&r.tier==="targeted")||
  (scope==="baseline"&&r.tier==="baseline")||
  (scope==="deferred"&&r.tier==="deferred")||
  (scope==="unmapped"&&r.experimentalMeaningCount===0)||
  (scope==="multiple"&&r.readingCount>1);
}
function valid(){
 const item=trials[index];
 if(!item||locked)return false;
 return categories.has($("reading-usage").value)&&units.has($("reading-unit").value)&&
  $("reading-rationale").value.trim().length>=12&&
  $("reading-rationale").value.length<=15000&&
  $("reading-example").value.length<=500&&$("reading-reference").value.length<=1000;
}
function validate(){$("reading-commit").disabled=!valid();}
function show(){
 const total=trials.length,done=records.length;
 $("reading-progress").setAttribute("aria-valuemax",String(total));
 $("reading-progress").setAttribute("aria-valuenow",String(done));
 $("reading-progress-fill").style.width=(total?(done*100/total).toFixed(1):"0.0")+"%";
 $("reading-count-label").textContent=done+" / "+total+" preliminary reading observations ("+
  (index<total?"entry "+(index+1):"complete")+")";
 $("reading-export").disabled=!done;
 if(index===total){
  $("reading-form").hidden=true;$("reading-after").hidden=true;
  status("Session complete: "+done+" preliminary observations. Export explicitly if needed.");
  return;
 }
 const r=trials[index],glyph=profile.get(r.rank);
 if(!glyph||glyph.character!==r.character)throw new Error("Glyph and reading mismatch");
 $("reading-glyph").replaceChildren(layers.createGlyph(glyph));
 $("reading-rank").textContent="Character rank "+r.rank+" · "+
  r.tier+" automated review priority · "+r.readingCount+" recorded reading(s)"+
  (r.experimentalMeaningCount===0?" · no proposed emoji":"");
 $("reading-current").textContent=r.reading;
 $("reading-gloss").textContent=r.gloss;
 const holder=$("reading-references");
 holder.replaceChildren();
 const found=references.scan(r.gloss);
 if(!found.length){
  holder.textContent="No explicit written-form/Pinyin reference token is present in this reading excerpt.";
 }else{
  holder.textContent="";
  for(const cue of found){
   const row=document.createElement("p");
   row.textContent=cue.sourceToken+" · source-internal cross-reference only";
   holder.appendChild(row);
  }
 }
 $("reading-other").textContent=r.allReadings.join(" · ");
 $("reading-full").textContent=r.excerpt;
 const external=$("reading-external-sources");
 external.replaceChildren();
 const packet=externalSources.get(r.rank),checked=checkedSources.get(r.rank)||[];
 const linked=packet?.sources||[];
 const combined=[...linked,...checked.filter(c=>!linked.some(s=>s.url===c.url))];
 if(!combined.length){
  external.textContent="No additional dictionary source location recorded for this character.";
 }else{
  external.textContent="";
  for(const item of combined){
   const p=document.createElement("p"),a=document.createElement("a"),note=document.createElement("span");
   const verified=checked.find(c=>c.url===item.url);
   a.href=item.url;a.rel="noopener noreferrer";a.textContent=item.publisher;
   note.textContent=verified?
    " · Source page checked "+checkedDate+"; displayed readings: "+
     verified.prominentReadings.join(", ")+". No lexical approval.":
    " · Exploratory link; page not checked in the current provenance registry.";
   p.appendChild(a);p.appendChild(note);external.appendChild(p);
  }
 }
 $("reading-source-id").textContent="CC-CEDICT "+r.sourcePath+
  " · pinned blob "+r.sourceBlobSha+" · CC BY-SA 4.0";
 for(const id of ["reading-usage","reading-unit","reading-example","reading-reference","reading-rationale"])$(id).value="";
 locked=false;
 $("reading-commit").disabled=true;
 $("reading-form").hidden=false;$("reading-after").hidden=true;
 status("Entry "+(index+1)+" of "+total+". Assess the recorded reading without reference to an emoji.");
}
function start(){
 if(!entries.length)return;
 sessionScope=$("reading-scope").value;
 sessionCount=$("reading-count").value;
 const matching=entries.filter(r=>eligible(sessionScope,r));
 if(!matching.length){status("No source reading entries for this cohort.");return;}
 trials=shuffle(matching).slice(0,sessionCount==="all"?matching.length:Math.min(matching.length,Number(sessionCount)));
 records=[];index=0;
 $("reading-session").hidden=false;show();
}
function commit(){
 if(!valid())return;
 const r=trials[index];
 records.push({
  rank:r.rank,character:r.character,reading:r.reading,
  dictionarySource:r.sourcePath,dictionaryBlobSha:r.sourceBlobSha,
  pinnedSourceGloss:r.gloss,priorityAtIntake:r.tier,
  preliminaryUsageCategory:$("reading-usage").value,
  preliminaryContextualUnit:$("reading-unit").value,
  usageExample:$("reading-example").value.trim(),
  independentEvidenceReference:$("reading-reference").value.trim(),
  evidenceRationale:$("reading-rationale").value.trim(),
  lexicalApproval:"not_granted",emojiComprehensionApproval:"not_granted",
  productionVerified:false
 });
 locked=true;
 $("reading-form").hidden=true;$("reading-after").hidden=false;
 $("reading-export").disabled=false;
 $("reading-progress").setAttribute("aria-valuenow",String(records.length));
 $("reading-progress-fill").style.width=(records.length*100/trials.length).toFixed(1)+"%";
 $("reading-count-label").textContent=records.length+" / "+trials.length+" preliminary reading observations";
 status("Observation locked. No independent linguistic approval has been granted.");
}
function next(){if(!locked)return;index++;show();}
function exportJSON(){
 if(!records.length)return;
 const output={
  schema:"chromalect.reading-inventory-observation-session.v0.1",
  status:"local_source_first_reading_hypotheses_not_independent_approval",
  source:{dictionaryRevision:sourceRevision,dictionaryLicense:"CC BY-SA 4.0",
   dictionaryBlocks:blocks.map(x=>"dictionary-excerpts-"+x+".json"),
   polysemyTriage:"polysemy-triage-v0.1.json"},
  session:{scope:sessionScope,requestedCount:sessionCount,planned:trials.length,
   recorded:records.length,localOnly:true,exportedAt:new Date().toISOString()},
  observations:records.map(r=>({...r}))
 };
 const blob=new Blob([JSON.stringify(output,null,2)+"\n"],{type:"application/json"});
 const url=URL.createObjectURL(blob),a=document.createElement("a");
 a.href=url;a.download="chromalect-reading-inventory-observations.json";
 document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
}
async function load(){
 try{
  const responses=await Promise.all([
   fetch("semantic/polysemy-triage-v0.1.json"),
   fetch("semantic/external-dictionary-reconnaissance-v0.1.json"),
   fetch("semantic/external-dictionary-discrepancy-v0.1.json"),
   fetch("semantic/publisher-page-provenance-v0.1.json"),
   ...blocks.map(b=>fetch("semantic/dictionary-excerpts-"+b+".json")),
   fetch("profiles/mandarin-1000-v1.json")
  ]);
  if(responses.some(r=>!r.ok))throw new Error("Missing published source files");
  const [triage,pilot,discrepancy,pageChecks,...other]=await Promise.all(responses.map(r=>r.json()));
  const glyphs=other.pop();
  if(pilot.schema!=="chromalect.semantic.external-dictionary-reconnaissance.v0.1"||
     pilot.status!=="preliminary_external_dictionary_comparison_not_independent_approval"||
     pilot.summary.firstPriorityCharacters!==5||
     pilot.summary.independentLexicalApproved!==0||
     pilot.summary.productionVerified!==0||
     pilot.records.length!==5||
     pilot.records.some(r=>r.independentAdjudication!=="pending"||
      r.productionVerified!==false||r.sources.some(s=>!s.url.startsWith("https://"))))
    throw new Error("Invalid preliminary external dictionary research records");
  if(discrepancy.schema!=="chromalect.semantic.external-dictionary-discrepancy.v0.1"||
     discrepancy.status!=="external_dictionary_desk_comparison_not_independent_lexical_approval"||
     discrepancy.summary.recordsPrepared!==5||
     discrepancy.summary.readingSlots!==11||
     discrepancy.summary.unresolvedPronunciationConflicts!==1||
     discrepancy.summary.independentLexicalApproval!==0||
     discrepancy.summary.independentEmojiApproval!==0||
     discrepancy.summary.productionVerified!==0||
     discrepancy.records.length!==5||
     discrepancy.records.some(r=>r.independentLexicalApproval!==false||
       r.productionVerified!==false||!r.externalSource?.url?.startsWith("https://")))
   throw new Error("Invalid additional dictionary discrepancy source");
  if(pageChecks.schema!=="chromalect.semantic.publisher-page-provenance.v0.1"||
     pageChecks.status!=="source_headword_reading_labels_checked_not_lexical_approval"||
     pageChecks.summary.publisherPagesChecked!==14||
     pageChecks.summary.highAttentionCharactersRepresented!==10||
     pageChecks.summary.independentlyAdjudicatedSenses!==0||
     pageChecks.summary.emojiApprovals!==0||
     pageChecks.summary.productionApprovals!==0||
     !Array.isArray(pageChecks.entries)||pageChecks.entries.length!==14||
     pageChecks.entries.some(x=>x.verification!=="page_text_opened_and_headword_checked"||
       !x.url.startsWith("https://")||!x.prominentReadings?.length))
    throw new Error("Publisher-page provenance is inconsistent");
  checkedDate=pageChecks.checkedDateUTC;
  checkedSources=new Map();
  for(const r of pageChecks.entries){
    if(!checkedSources.has(r.rank))checkedSources.set(r.rank,[]);
    checkedSources.get(r.rank).push(r);
  }
  if(checkedSources.size!==10)throw new Error("Expected ten separately sourced characters");
  externalSources=new Map([
   ...pilot.records.map(r=>[r.rank,r]),
   ...discrepancy.records.map(r=>[r.rank,{
     rank:r.rank,character:r.character,
     sources:[{publisher:r.externalSource.publisher,url:r.externalSource.url}]
   }])
  ]);
  if(triage.schema!=="chromalect.semantic.polysemy-screening-triage.v0.1"||
    triage.summary.charactersAudited!==1000||
    triage.summary.independentLexicalApproved!==0||
    triage.summary.independentEmojiApproved!==0||triage.summary.productionVerified!==0||
    !Array.isArray(triage.records)||triage.records.length!==1000||
    glyphs.schema!=="chromalect.mandarin-character-profile.v1"||
    glyphs.catalog_count!==1000||glyphs.characters.length!==1000)
   throw new Error("Source inventory schema or status mismatch");
  profile=new Map(glyphs.characters.map(g=>[g.rank,g]));
  const dictionaryRows=other.flatMap(block=>{
   if(block.schema!=="chromalect.semantic.dictionary-excerpt-block.v0.1"||
     block.license!=="CC BY-SA 4.0"||block.sourceCommit!==sourceRevision||
     !Array.isArray(block.records))throw new Error("Unpinned dictionary block");
   return block.records;
  });
  if(dictionaryRows.length!==1000)throw new Error("Incomplete dictionary tranche");
  const rows=[];
  for(let i=0;i<1000;i++){
   const r=dictionaryRows[i],t=triage.records[i];
   if(r.rank!==i+1||t.rank!==r.rank||r.character!==t.character||
     profile.get(r.rank)?.character!==r.character||
     r.sourceBlobSha!==t.sourceBlobSha||
     r.sourcePath!==t.sourcePath||
     JSON.stringify(r.readings)!==JSON.stringify(t.dictionaryReadings)||
     t.independentLexicalApproval!==false||t.manualSenseReview!=="pending")
    throw new Error("Dictionary, glyph and triage identity conflict");
   const sections=dictionary.split(r);
   const hasAnySourceReferences=sections.some(section=>references.scan(section.gloss).length>0);
   for(const {reading,gloss} of sections)rows.push({
    rank:r.rank,character:r.character,reading,gloss,
    allReadings:r.readings,readingCount:r.readings.length,
    excerpt:r.excerpt,sourcePath:r.sourcePath,sourceBlobSha:r.sourceBlobSha,
    tier:t.triageTier,experimentalMeaningCount:t.experimentalMeaningCount,
    hasAnySourceReferences
   });
  }
  if(rows.length!==1393||rows.filter(r=>r.tier==="higher").length!==319||
     rows.filter(r=>r.readingCount>1).length!==732||
     rows.filter(r=>r.experimentalMeaningCount===0).length!==173||
     rows.filter(r=>r.tier==="higher"&&!r.hasAnySourceReferences).length!==140)
    throw new Error("Unexpected pinned reading-inventory counts");
  entries=rows;
  $("reading-start").disabled=false;
  status("Ready: 1,393 source-pinned dictionary reading entries across 1,000 characters. Independent approvals: 0.");
 }catch(error){
  status("Unable to load source-aligned reading inventory. No study can begin.");
 }
}
$("reading-start").addEventListener("click",start);
$("reading-commit").addEventListener("click",commit);
$("reading-next").addEventListener("click",next);
$("reading-export").addEventListener("click",exportJSON);
for(const id of ["reading-usage","reading-unit","reading-example","reading-reference","reading-rationale"]){
 $(id).addEventListener(id==="reading-usage"||id==="reading-unit"?"change":"input",validate);
}
load();
})();
