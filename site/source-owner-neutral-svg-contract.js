/* Exact, non-executable SVG grammar for source-region display masks.
 * A safe source-shaped mask is not an independently verified owner assignment.
 */
(() => {
"use strict";
const prefix='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" role="img" aria-label="Unverified neutral source region">\n'+
 '<title>Neutral visual region; no independently verified component owner</title>\n'+
 '<g transform="scale(1,-1) translate(0,-900)">\n';
const suffix='</g>\n</svg>\n';
const path=/^<path d="([A-Za-z0-9., +\-]+)" fill="#(252525|dedede)"\/>$/;
function validate(svg,expectedPaths,expectedHighlighted){
 if(typeof svg!=="string"||svg.length>1048576||!svg.startsWith(prefix)||
  !svg.endsWith(suffix))throw Error("Unexpected neutral SVG document framing");
 if(!Number.isInteger(expectedPaths)||expectedPaths<2||expectedPaths>300||
  !Number.isInteger(expectedHighlighted)||expectedHighlighted<1||
  expectedHighlighted>=expectedPaths)
  throw Error("Invalid source-path bounds");
 const body=svg.slice(prefix.length,-suffix.length);
 if(!body.endsWith("\n"))throw Error("Neutral SVG path terminator absent");
 const lines=body.slice(0,-1).split("\n");
 if(lines.length!==expectedPaths)throw Error("Neutral SVG path count mismatch");
 let highlighted=0;
 for(const line of lines){
  const m=path.exec(line);
  if(!m||m[1].length>20000||!/[Mm]/.test(m[1]))
   throw Error("Unexpected neutral SVG path grammar");
  if(m[2]==="252525")highlighted++;
 }
 if(highlighted!==expectedHighlighted)
  throw Error("Neutral SVG region coverage mismatch");
 return true;
}
globalThis.ChromalectNeutralRegionSVG=Object.freeze({validate});
})();
