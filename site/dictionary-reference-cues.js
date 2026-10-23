/* Exact CC-CEDICT cross-reference tokens from pinned dictionary gloss text.
   Cross-references are not word-frequency, sentence or independent usage attestations. */
(() => {
"use strict";
function scan(gloss){
 if(typeof gloss!=="string")throw new TypeError("Expected source dictionary gloss text");
 const rx=/([\p{Script=Han}]+(?:\|[\p{Script=Han}]+)?)\[([A-Za-z0-9 ]+)\]/gu;
 const out=[];
 for(const match of gloss.matchAll(rx)){
  const written=match[1],forms=written.split("|");
  out.push({
   sourceToken:match[0],written,pinyin:match[2],
   traditional:forms.length===2?forms[0]:null,
   simplified:forms.length===2?forms[1]:null
  });
 }
 return out;
}
globalThis.ChromalectDictionaryReferences=Object.freeze({scan});
})();
