/* Source-pinned CC-CEDICT reading boundary parser.
   Splits only exact documented dictionary reading markers; no sense inference. */
(() => {
"use strict";
function split(record){
 const readings=record.dictionaryReadings??record.readings;
 const excerpt=record.dictionaryExcerpt??record.excerpt;
 if(!Array.isArray(readings)||!readings.length||typeof excerpt!=="string")
  throw new TypeError("Missing source dictionary readings or excerpt");
 const markers=[];
 let from=0;
 for(const reading of readings){
  if(typeof reading!=="string"||!reading)throw new TypeError("Invalid dictionary reading");
  const marker=reading+": ";
  const index=excerpt.indexOf(marker,from);
  if(index<0)throw new Error("Pinned reading marker missing: "+reading);
  if(markers.length===0&&index!==0)
   throw new Error("First dictionary reading must begin at the start");
  if(markers.length>0&&!/;\s{2,}$/.test(excerpt.slice(Math.max(0,index-20),index)))
   throw new Error("Dictionary reading boundary is not source-aligned");
  markers.push({reading,index,start:index+marker.length});
  from=index+marker.length;
 }
 return markers.map((m,i)=>{
  const end=i+1<markers.length?markers[i+1].index:excerpt.length;
  const gloss=excerpt.slice(m.start,end).trim().replace(/;\s*$/,"").trim();
  if(!gloss)throw new Error("Empty pinned dictionary reading evidence: "+m.reading);
  return {reading:m.reading,gloss};
 });
}
globalThis.ChromalectDictionaryReadings=Object.freeze({split});
})();
