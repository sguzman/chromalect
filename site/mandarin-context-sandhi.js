/* Bounded two-syllable Mandarin sandhi controls. Not acoustic predictions.
   Rule citations: PolyU BEPTH tone-sandhi reference and Beijing tourism
   Mandarin tone-change explainer. Linguistic context is not inferred. */
(() => {
"use strict";
function previewPair(characters,tones){
 if(typeof characters!=="string"||[...characters].length!==2||
    !Array.isArray(tones)||tones.length!==2||
    tones.some(t=>!Number.isInteger(t)||t<0||t>4))
  throw new TypeError("Expected exactly two characters and two citation-tone integers");
 const a=[...characters],surface=[...tones];
 let rule="none";
 if(a[0]==="不"&&tones[0]===4&&tones[1]===4){
  surface[0]=2;rule="bu_before_fourth";
 }else if(a[0]==="一"&&tones[0]===1&&tones[1]===4){
  surface[0]=2;rule="yi_before_fourth";
 }else if(a[0]==="一"&&tones[0]===1&&[1,2,3].includes(tones[1])){
  surface[0]=4;rule="yi_before_nonfourth";
 }else if(tones[0]===3&&tones[1]===3){
  surface[0]=2;rule="third_before_third";
 }
 return Object.freeze({characters,underlying:[...tones],conditionalSurface:surface,
  rule,contextVerified:false,acousticRealizationVerified:false});
}
const samples=Object.freeze([
 Object.freeze({id:"third-third",characters:"你好",tones:[3,3],
  source:"https://www.polyu.edu.hk/bepth/introduction-to-phonetics/tones/tone-sandhi/"}),
 Object.freeze({id:"bu-fourth",characters:"不是",tones:[4,4],
  source:"https://www.polyu.edu.hk/bepth/introduction-to-phonetics/tones/tone-sandhi/"}),
 Object.freeze({id:"yi-fourth",characters:"一个",tones:[1,4],
  source:"https://www.polyu.edu.hk/bepth/introduction-to-phonetics/tones/tone-sandhi/"}),
 Object.freeze({id:"yi-first",characters:"一天",tones:[1,1],
  source:"https://english.visitbeijing.com.cn/article/4GYdPVIQEGr"})
]);
globalThis.ChromalectContextSandhi=Object.freeze({previewPair,samples});
})();