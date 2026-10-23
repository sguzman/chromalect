// Reproducible written Pinyin label comparison. No lexical approval.
import assert from "node:assert/strict";
import fs from "node:fs";
const dir="data/semantic/cedict-crossref/";
const source=JSON.parse(fs.readFileSync(dir+"pinyin-reading-label-normalization-v0.1.json","utf8"));
const pages=JSON.parse(fs.readFileSync(dir+"publisher-page-provenance-v0.2.json","utf8"));
function numberedToMarked(x){
 const m=/^([a-züv:]+)([0-5])$/i.exec(x);
 if(!m)throw Error("Unsupported Pinyin label "+x);
 const plain=m[1].toLowerCase().replace(/u:/g,"ü").replace(/v/g,"ü"),tone=Number(m[2]);
 if(tone===0||tone===5)return plain;
 const chars=[...plain];
 const selected=chars.includes("a")?chars.indexOf("a"):
 chars.includes("e")?chars.indexOf("e"):
 plain.includes("ou")?chars.indexOf("o"):
 Math.max(...chars.map((c,i)=>"aeiouü".includes(c)?i:-1));
 if(selected<0)throw Error("Pinyin label has no vowel "+x);
 const marks={a:"āáǎà",e:"ēéěè",i:"īíǐì",o:"ōóǒò",u:"ūúǔù","ü":"ǖǘǚǜ"};
 chars[selected]=[...marks[chars[selected]]][tone-1];
 return chars.join("");
}
const build=function build(source,pages){
 if(source.summary.charactersAudited!==1000||
    pages.summary.highAttentionCharactersRepresented!==23||
    pages.summary.publisherPagesChecked!==27||
    source.summary.independentLexicalApproved!==0||
    pages.summary.independentlyAdjudicatedSenses!==0)
  throw Error("Source revision or approval invariant drift");
 const byRank=new Map();
 for(const page of pages.entries){
  if(!byRank.has(page.rank))byRank.set(page.rank,[]);
  byRank.get(page.rank).push(page);
 }
 const records=[...byRank].map(([rank,linked])=>{
  const pinned=source.records[rank-1];
  if(!pinned||pinned.character!==linked[0].character||
     linked.some(x=>x.character!==pinned.character))throw Error("Source identity drift");
  const sourceLabels=[...new Set(pinned.normalizedReadingLabels.map(numberedToMarked))].sort();
  const publisherLabels=[...new Set(linked.flatMap(x=>x.prominentReadings))].sort();
  const publisherOnly=publisherLabels.filter(x=>!sourceLabels.includes(x));
  const pinnedOnly=sourceLabels.filter(x=>!publisherLabels.includes(x));
  const alignment=publisherOnly.length===0&&pinnedOnly.length===0?
    "same_displayed_reading_labels":pinnedOnly.length===0?
    "publisher_has_additional_prominent_labels":publisherOnly.length===0?
    "publisher_missing_pinned_labels":"two_way_display_label_difference";
  return {rank,character:pinned.character,pinnedNumberedLabels:pinned.recordedReadingLabels,
   pinnedNormalizedLabels:sourceLabels,publisherProminentLabels:publisherLabels,
   publisherOnlyLabels:publisherOnly,pinnedOnlyLabels:pinnedOnly,alignment,
   sourceUrls:linked.map(x=>x.url),lexicalApproval:false,productionVerified:false};
 }).sort((a,b)=>a.rank-b.rank);
 const summary={
  checkedCharacters:records.length,checkedExternalPages:pages.entries.length,
  matchingProminentLabelSets:records.filter(x=>x.alignment==="same_displayed_reading_labels").length,
  publisherAdditionalLabelSets:records.filter(x=>x.alignment==="publisher_has_additional_prominent_labels").length,
  publisherMissingPinnedLabelSets:records.filter(x=>x.pinnedOnlyLabels.length>0).length,
  independentLexicalApproved:0,emojiComprehensionApproved:0,productionVerified:0
 };
 if(JSON.stringify([summary.checkedCharacters,summary.checkedExternalPages,
  summary.matchingProminentLabelSets,summary.publisherAdditionalLabelSets,
  summary.publisherMissingPinnedLabelSets])!==JSON.stringify([23,27,21,2,0]))
  throw Error("Unexpected source comparison baseline");
 return {schema:"chromalect.semantic.publisher-reading-label-comparison.v0.1",
  status:"mechanical_pinyin_display_comparison_not_lexical_adjudication",
  source:{publisherPages:"publisher-page-provenance-v0.2.json",
   canonicalReadingLabels:"pinyin-reading-label-normalization-v0.1.json"},
  caveats:["Tonemark rendering and case folding compare written pronunciation labels, not usage roles or lexical senses.",
   "Publisher basic-entry lists are not complete inventories of historical, regional, or specialized readings.",
   "The surname-tone disagreement for 过 remains unresolved even though ordinary guò is shared by both sources.",
   "No publisher-only label is imported into the canonical Mandarin profile."],
  summary,records};
};
const result=build(source,pages);
const path=dir+"publisher-reading-label-comparison-v0.1.json";
if(process.argv.includes("--check")){
 assert.deepEqual(JSON.parse(fs.readFileSync(path,"utf8")),result);
 console.log("Publisher reading labels: 21 matching sets, 2 additional-label sets, no approvals.");
}else{
 fs.writeFileSync(path,JSON.stringify(result,null,2)+"\n");
 console.log("Wrote "+path);
}
