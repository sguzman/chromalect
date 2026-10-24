/* Source-pinned word candidate research display: no corpus quotation or approvals. */
(() => {
"use strict";
const $=id=>document.getElementById(id);
const ids=["wc-lead","wc-sentence","wc-example","wc-segments","wc-readings",
 "wc-meaning","wc-geometry","wc-sandhi","wc-status","wc-word","wc-reading-note",
 "wc-other-readings","wc-meaning-note","wc-word-source","wc-boundary",
 "wc-corpus-note","wc-sentence-link","wc-rule","wc-rule-source",
 "wc-evidence","wc-orthography"];
if(ids.some(id=>!$(id)))return;
const engine=globalThis.ChromalectContextSandhi;
if(!engine||engine.samples.length!==4){
 $("wc-status").textContent="Sandhi controls unavailable";return;
}
const make=(tag,cls,text)=>{
 const node=document.createElement(tag);
 if(cls)node.className=cls;
 if(text!==undefined)node.textContent=String(text);
 return node;
};
const safeLink=(label,url)=>{
 if(!/^https:\/\//.test(url))throw Error("A public source URL must use HTTPS");
 const a=make("a",null,label);a.href=url;a.rel="noopener noreferrer";a.target="_blank";
 return a;
};
const selectOptions=(node,rows)=>{
 node.replaceChildren();
 for(const [value,label] of rows){
  const option=make("option",null,label);option.value=String(value);node.appendChild(option);
 }
};
const wordPinyinParts=record=>{
 if(record.wordEntryPronunciationAgreement!==true)return null;
 const parts=record.cedictNumberedPinyin.split(" ");
 if(parts.length!==[...record.writtenWordLead].length)throw Error("Word reading length disagrees with written lead");
 return parts.map(x=>{
  const match=x.match(/^([a-zA-ZüÜvV:]+)([0-5])$/);
  if(!match)throw Error("Unknown dictionary-numbered Pinyin: "+x);
  return {base:match[1],tone:Number(match[2])};
 });
};
let leads=[],agreements=new Map(),priority=[],profile=new Map(),caveat=null;
function chooseLead(id){
 const lead=leads.find(r=>r.id===id);
 if(!lead)throw Error("Unknown dictionary word lead");
 const sentences=priority.filter(r=>r.leadId===id);
 selectOptions($("wc-sentence"),sentences.map(r=>[
  r.sentenceId,"#"+r.sentenceId+" · "+r.reviewTier.replaceAll("_"," ")]));
 $("wc-sentence").disabled=sentences.length===0;
 if(sentences.length)$("wc-sentence").value=sentences[0].sentenceId;
 render();
}
function render(){
 if(!leads.length)return;
 const lead=leads.find(r=>r.id===$("wc-lead").value);
 if(!lead)throw Error("Source word selection missing");
 const agreement=agreements.get(lead.id);
 const letters=[...lead.surfaceWord];
 const reading=$("wc-readings").checked?wordPinyinParts(agreement):null;
 const sourceSpan=make("div",$("wc-segments").checked?"wc-word-boundary":"wc-row");
 sourceSpan.setAttribute("aria-label",lead.surfaceWord+
  ($("wc-segments").checked?" provisional written-word span":" separated source characters"));
 for(let i=0;i<letters.length;i++){
  const char=letters[i],item=make("div","wc-character");
  if(char===lead.character)item.setAttribute("aria-current","true");
  const glyph=profile.get(char);
  if($("wc-geometry").checked&&glyph){
   const image=make("img");image.alt="Source-aligned stroke rendering of "+char;
   const src=document.querySelector('script[src$="mandarin-word-context.js"]');
   if(!src||!src.src)throw Error("Missing source script base URL");
   image.src=new URL(glyph.geometry.svg,new URL("./",src.src)).href;
   const fallback=make("strong",null,char);
   fallback.hidden=true;
   image.addEventListener("error",()=>{image.hidden=true;fallback.hidden=false;});
   item.appendChild(image);item.appendChild(fallback);
  }else item.appendChild(make("strong",null,char));
  if(reading)item.appendChild(make("small",null,
   reading[i].base+" · word-entry T"+reading[i].tone));
  else item.appendChild(make("small",null,
   char===lead.character?"Target · heading "+lead.dictionaryHeadingReading:
    "No word-entry reading displayed"));
  sourceSpan.appendChild(item);
 }
 $("wc-word").replaceChildren(sourceSpan);
 $("wc-reading-note").textContent=reading?
  "Paired published word-entry transcriptions: Wiktionary "+agreement.wiktionaryPinyin+
   " / CC-CEDICT "+agreement.cedictNumberedPinyin+
   ". These do not assign a reading to the selected sentence.":
  "No paired published word-entry reading; individual non-target syllables are not inferred.";
 const alternate=[...new Set(leads.filter(x=>x.character===lead.character).
  map(x=>x.dictionaryHeadingReading))];
 $("wc-other-readings").textContent="Source heading readings for "+lead.character+
  ": "+alternate.join(" vs ")+" (publisher leads; sentence pronunciation unassigned).";
 $("wc-meaning-note").textContent=$("wc-meaning").checked?
  "Publisher context query hint: "+lead.contextHint+
   ". Not an adjudicated sense or sentence-specific gloss.":
  "Publisher gloss hint hidden.";
 $("wc-word-source").replaceChildren(safeLink("Original publisher heading",lead.publisherSourceURL));
 const selected=priority.find(r=>r.leadId===lead.id&&
  r.sentenceId===$("wc-sentence").value);
 $("wc-boundary").replaceChildren();
 $("wc-sentence-link").replaceChildren();
 if(selected){
  const labels={
   boundary_crosses_token:"The written phrase crosses an ICU token",
   multi_token_match:"The written phrase covers multiple ICU tokens",
   single_token_suggestion:"The written phrase matches one ICU token"
  };
  $("wc-boundary").appendChild(make("strong",null,labels[selected.reviewTier]));
  $("wc-corpus-note").textContent="ICU "+selected.machineSourceVersion+
   " automated boundary hint · contributor "+selected.contributor+
   " · verified source fingerprint retained · no human segmentation approval.";
  $("wc-sentence-link").appendChild(safeLink("Open source sentence #"+selected.sentenceId,
   selected.sourceURL));
 }else{
  $("wc-boundary").appendChild(make("strong",null,
   "No pinned sentence-ID association for this written-word lead."));
  $("wc-corpus-note").textContent="Absence from the selected cohort is not evidence of non-use.";
 }
 const sample=engine.samples.find(r=>r.id===$("wc-example").value);
 if(!sample)throw Error("Unknown pinned sandhi example");
 $("wc-rule").replaceChildren();$("wc-rule-source").replaceChildren();
 if($("wc-sandhi").checked){
  const display=engine.previewPair(sample.characters,sample.tones);
  const result=make("div","wc-sandhi");
  result.appendChild(make("strong",null,display.characters));
  result.appendChild(make("span",null,
   "Two source citation tones: "+display.underlying.map(x=>"T"+x).join(" + ")));
  result.appendChild(make("span",null,
   "Conditional surface-tone model: "+display.conditionalSurface.map(x=>"T"+x).join(" + ")));
  result.appendChild(make("small",null,
   "Rule: "+display.rule.replaceAll("_"," ")+" · no contextual acoustic certification"));
  $("wc-rule").appendChild(result);
  $("wc-rule-source").appendChild(safeLink("Published tone-change reference",sample.source));
 }else $("wc-rule").appendChild(make("span",null,"Sandhi control hidden."));
 $("wc-evidence").textContent="Source alignment: 8 publisher word leads; "+
  "5 paired dictionary word-entry readings; 27 corpus-ID associations. Selected lead "+
  (agreement.wordEntryPronunciationAgreement===true?
   "has paired published word-entry Pinyin.":"lacks paired published word-entry Pinyin.")+
  " Corpus attestation is not contextual reading, sense, or rights clearance.";
 $("wc-orthography").textContent=lead.id===caveat.application.leadId?
  "GB/T 16159-2012 conditional Pinyin spelling: if 看 is a verb followed by "+
  "aspectual 过 in the actual sentence, joined orthography may apply. "+
  "The selected source sentence has not been grammatically adjudicated.":
  "Pinyin word spacing and grammatical wordhood require source-specific analysis.";
 $("wc-status").textContent="Context candidate "+lead.surfaceWord+
  " · no independently verified sentence reading, lexical sense or word boundary.";
}
async function load(){
 try{
  const urls=[
   "semantic/dictionary-word-surface-leads-v0.1.json",
   "semantic/word-entry-reading-agreement-v0.1.json",
   "semantic/word-context-review-priority-v0.1.json",
   "semantic/mandarin-word-orthography-standard-caveat-v0.1.json",
   "profiles/mandarin-1000-v1.json"
  ];
  const responses=await Promise.all(urls.map(url=>fetch(url)));
  if(responses.some(r=>!r.ok))throw Error("Missing source datasets");
  const [dictionary,agreement,corpus,standard,glyph]=await Promise.all(
   responses.map(r=>r.json()));
  if(dictionary.schema!=="chromalect.semantic.dictionary-word-surface-leads.v0.1"||
     dictionary.status!=="publisher_dictionary_word_leads_not_independent_usage_attestations"||
     dictionary.leads.length!==8||
     agreement.schema!=="chromalect.semantic.word-entry-reading-agreement.v0.1"||
     agreement.status!=="two_word_dictionary_transcriptions_not_sentence_pronunciation_verification"||
     agreement.records.length!==8||
     agreement.summary.pairedPublishedWordReadings!==5||
     agreement.summary.withoutPairedReadings!==3||
     agreement.summary.independentlyVerifiedSentenceReadings!==0||
     agreement.summary.independentWordBoundaries!==0||
     agreement.summary.approvedLexicalSenses!==0||
     corpus.schema!=="chromalect.semantic.word-context-review-priority.v0.1"||
     corpus.status!=="source_aligned_research_triage_not_sentence_or_lexical_approval"||
     corpus.records.length!==27||
     corpus.summary.boundary_crosses_token!==6||
     corpus.summary.multi_token_match!==4||
     corpus.summary.single_token_suggestion!==17||
     corpus.summary.independentlyVerifiedWordBoundaries!==0||
     corpus.summary.independentlyVerifiedContextualReadings!==0||
     corpus.summary.independentlyApprovedLexicalSenses!==0||
     corpus.summary.quotationClearanceGranted!==0||
     standard.schema!=="chromalect.semantic.mandarin-word-orthography-standard-caveat.v0.1"||
     standard.application.wordBoundariesIndependentlyVerified!==0||
     standard.application.readingsIndependentlyVerified!==0||
     glyph.schema!=="chromalect.mandarin-character-profile.v1"||
     glyph.catalog_count!==1000||glyph.characters.length!==1000)
   throw Error("Source status, provenance or research gate disagrees");
  const sourceRows=new Map();
  for(const row of dictionary.leads){
   if(sourceRows.has(row.id)||typeof row.surfaceWord!=="string"||
      ![...row.surfaceWord].includes(row.character)||
      !dictionary.sourcePages.some(p=>p.rank===row.rank&&p.character===row.character&&
       p.url===row.publisherSourceURL)||
      row.sentenceReadingAssignment!==null||row.independentlyAdjudicated!==false)
    throw Error("Malformed publisher word lead");
   sourceRows.set(row.id,row);
  }
  const compared=new Map();
  for(const row of agreement.records){
   const lead=sourceRows.get(row.leadId);
   if(!lead||compared.has(row.leadId)||row.writtenWordLead!==lead.surfaceWord||
      row.independentContextualReadingVerified!==false||
      row.independentWordBoundaryVerified!==false||
      row.independentSenseApproved!==false)
    throw Error("Publisher and independently compared word records disagree");
   const known=row.wordEntryPronunciationAgreement===true;
   if(known!==(row.status==="published_word_pinyin_agree_across_two_sources")||
      (known&&(!row.wiktionaryPinyin||!row.cedictNumberedPinyin))||
      (!known&&(row.wiktionaryPinyin!==null||row.cedictNumberedPinyin!==null)))
    throw Error("Missing word entry must not become verified");
   if(known)wordPinyinParts(row);
   compared.set(row.leadId,row);
  }
  if(compared.size!==8)throw Error("Missing lead-word agreement record");
  const seen=new Set();const hints={boundary_crosses_token:0,multi_token_match:0,
   single_token_suggestion:0};
  for(const row of corpus.records){
   const lead=sourceRows.get(row.leadId),key=row.leadId+":"+row.sentenceId;
   if(!lead||seen.has(key)||row.word!==lead.surfaceWord||
      row.sourceURL!=="https://tatoeba.org/en/sentences/show/"+row.sentenceId||
      !Object.hasOwn(hints,row.reviewTier)||
      typeof row.contributor!=="string"||!row.contributor||
      !/^[0-9a-f]{64}$/.test(row.textSHA256)||
      row.wordBoundaryVerified!==false||row.contextualReadingVerified!==false||
      row.lexicalSenseApproved!==false||row.quotationRightsAdjudicated!==false||
      row.publishedWordReadingPair!==(compared.get(row.leadId).wordEntryPronunciationAgreement===true))
    throw Error("Source sentence identity, boundary hint or independence flag changed");
   hints[row.reviewTier]++;seen.add(key);
  }
  if(seen.size!==27||hints.boundary_crosses_token!==6||
     hints.multi_token_match!==4||hints.single_token_suggestion!==17||
     standard.application.leadId!=="guo-aspect"||
     standard.application.linkedCorpusSentenceIDs.length!==5)
   throw Error("Word-boundary evidence cohort changed");
  const glyphs=new Map();
  for(const row of glyph.characters){
   if(glyphs.has(row.character)||row.geometry?.status!==
      "source_aligned_visual_review_pending"||
      !/^glyphs\/U\+[0-9A-F]{4,6}\.svg$/.test(row.geometry.svg))
    throw Error("Unverified glyph geometry or duplicate glyph");
   glyphs.set(row.character,row);
  }
  leads=dictionary.leads;agreements=compared;priority=corpus.records;
  profile=glyphs;caveat=standard;
  selectOptions($("wc-lead"),leads.map(l=>[
   l.id,l.surfaceWord+" · "+l.character+" / "+l.dictionaryHeadingReading]));
  selectOptions($("wc-example"),engine.samples.map(x=>[
   x.id,x.characters+" · "+x.id.replaceAll("-"," ")]));
  $("wc-lead").value=leads[0].id;
  $("wc-example").value=engine.samples[0].id;
  chooseLead(leads[0].id);
 }catch(e){
  leads=[];
  for(const id of ["wc-word","wc-boundary","wc-sentence-link","wc-rule"])
   $(id).replaceChildren();
  $("wc-status").textContent="Unable to validate source-aligned context: "+e.message;
 }
}
$("wc-lead").addEventListener("change",()=>chooseLead($("wc-lead").value));
$("wc-sentence").addEventListener("change",render);
$("wc-example").addEventListener("change",render);
for(const id of ["wc-segments","wc-readings","wc-meaning","wc-geometry","wc-sandhi"])
 $(id).addEventListener("change",render);
load();
})();
