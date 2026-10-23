/* WCAG 2.2 sRGB relative luminance and reference contrast arithmetic.
   Ratios for palette diagnostics are not experimental legibility or conformance. */
(() => {
"use strict";
function luminance(hex){
 if(typeof hex!=="string"||!/^#[0-9a-f]{6}$/i.test(hex))
  throw new TypeError("Expected an opaque six-digit sRGB color");
 const channels=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255)
  .map(x=>x<=0.04045?x/12.92:((x+0.055)/1.055)**2.4);
 return channels[0]*0.2126+channels[1]*0.7152+channels[2]*0.0722;
}
function ratio(a,b){
 const x=luminance(a),y=luminance(b);
 return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05);
}
function neutralRatios(hex){
 return Object.freeze({white:ratio(hex,"#ffffff"),black:ratio(hex,"#000000")});
}
globalThis.ChromalectReferenceContrast=Object.freeze({
 version:"wcag22-srgb-reference-v0.1",luminance,ratio,neutralRatios
});
})();