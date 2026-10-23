// Research-only 40-component group-hue counterfactual. NEVER a production
// palette upgrade or approved semantic-family assignment. Stable v0.6 colors
// are preserved in the source and remain authoritative in all glyph renderers.
import assert from "node:assert/strict";
import fs from "node:fs";
import {pathToFileURL} from "node:url";
import {deriveMnemonicGroupPilot} from "./mnemonic_group_color_pilot.mjs";
const names=["human-body","movement-space","speech-senses","earth-material",
 "structural-series","water-fluid","heat-light","plant-growth"];
const offsets=[-0.06,-0.045,-0.03,-0.015,0.015,0.03,0.045,0.06];
const CHROMA=0.09, BASE_L=0.62, START_HUE=20, STEP_HUE=45;
function counterfactualHex(L,C,h){
 const rad=h*Math.PI/180,a=C*Math.cos(rad),b=C*Math.sin(rad);
 const l=(L+0.3963377774*a+0.2158037573*b)**3,
  m=(L-0.1055613458*a-0.0638541728*b)**3,
  s=(L-0.0894841775*a-1.2914855480*b)**3;
 const values=[4.0767416621*l-3.3077115913*m+0.2309699292*s,
  -1.2684380046*l+2.6097574011*m-0.3413193965*s,
  -0.0041960863*l-0.7034186147*m+1.7076147010*s];
 assert.ok(values.every(v=>Number.isFinite(v)&&v>=0&&v<=1),
  "Out-of-gamut source-independent candidate must be rejected instead of clamped");
 return "#"+values.map(x=>{
  const srgb=x<=0.0031308?12.92*x:1.055*x**(1/2.4)-0.055;
  return Math.round(srgb*255).toString(16).padStart(2,"0");
 }).join("").toUpperCase();
}
function oklab(hex){
 const [r,g,b]=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255)
  .map(x=>x<=0.04045?x/12.92:((x+0.055)/1.055)**2.4);
 const l=Math.cbrt(0.4122214708*r+0.5363325363*g+0.0514459929*b),
  m=Math.cbrt(0.2119034982*r+0.6806995451*g+0.1073969566*b),
  s=Math.cbrt(0.0883024619*r+0.2817188376*g+0.6299787005*b);
 return [0.2104542553*l+0.7936177850*m-0.0040720468*s,
  1.9779984951*l-2.4285922050*m+0.4505937099*s,
  0.0259040371*l+0.7827717662*m-0.8086757660*s];
}
const difference=(a,b)=>{
 const x=oklab(a),y=oklab(b);
 return Math.hypot(...x.map((value,i)=>value-y[i]));
};
const round=x=>Number(x.toFixed(6));
const avg=arr=>arr.reduce((n,x)=>n+x,0)/arr.length;
export function derivePilotGroupCounterfactual(palette){
 const source=deriveMnemonicGroupPilot(palette);
 assert.deepEqual(source.groups.map(x=>x.mnemonicHint),names);
 assert.equal(source.summary.pilotHintedComponents,40);
 assert.equal(source.summary.unhintedComponents,480);
 const seenIds=new Set(),seenColors=new Set();
 const groups=source.groups.map((group,i)=>{
  assert.ok(group.componentColors.length<=offsets.length);
  const members=group.componentColors.map((c,j)=>{
   const proposedHex=counterfactualHex(BASE_L+offsets[j],CHROMA,
    START_HUE+STEP_HUE*i);
   assert.ok(!seenIds.has(c.id));seenIds.add(c.id);
   assert.ok(!seenColors.has(proposedHex));seenColors.add(proposedHex);
   return {componentId:c.id,form:c.form,sourceHex:c.hex,
    candidateHex:proposedHex,
    candidateOklch:{lightness:round(BASE_L+offsets[j]),
     chroma:CHROMA,hueDegrees:START_HUE+STEP_HUE*i},
    candidateStatus:"hypothetical_group_color_not_production",
    originalIdentityPreservedInActivePalette:true,
    visuallyVerified:false,semanticallyVerified:false};
  });
  return {historicalHint:group.mnemonicHint,
   groupMembershipStatus:"unverified_historical_mnemonic_hint",
   proposedHueDegrees:START_HUE+STEP_HUE*i,
   sourceMemberCount:group.summary.members,
   members};
 });
 assert.equal(seenIds.size,40);
 const all=groups.flatMap(g=>g.members.map(m=>({...m,group:g.historicalHint})));
 const within=[],between=[];
 for(let i=0;i<all.length;i++)for(let j=i+1;j<all.length;j++){
  const d=difference(all[i].candidateHex,all[j].candidateHex);
  (all[i].group===all[j].group?within:between).push(d);
 }
 assert.equal(within.length,88);assert.equal(between.length,692);
 const withinMean=avg(within),betweenMean=avg(between);
 return {schema:"chromalect.palette.historical-hint-counterfactual.v0.1",
  status:"isolated_40_component_hue_grouping_hypothesis_not_a_palette_or_semantic_approval",
  provenance:{sourcePalette:"mandarin-component-identity@0.6.0",
   sourcePilot:"chromalect.palette.mnemonic-hint-color-pilot.v0.1",
   construction:"Eight equidistant OKLCH hue anchors; fixed chroma; deterministic lightness offsets per original source-group member; no gamut clipping",
   originalPaletteModified:false,activeGlyphsRecolored:false,
   independentLexicalClassification:false,participantEvaluations:0},
  construction:{model:"OKLCH into D65 sRGB through OKLab",
   baseLightness:BASE_L,chroma:CHROMA,startHueDegrees:START_HUE,
   hueStepDegrees:STEP_HUE,memberLightnessOffsets:offsets},
  summary:{sourceIdentityColors:520,hypotheticalColorAssignments:40,
   unclassifiedComponentsExcluded:480,historicalHints:8,
   proposedUniqueColors:seenColors.size,withinHintPairs:88,betweenHintPairs:692,
   baselineMeanWithinDeltaOk:source.summary.meanWithinHintDeltaOk,
   baselineMeanBetweenDeltaOk:source.summary.meanBetweenHintDeltaOk,
   counterfactualMeanWithinDeltaOk:round(withinMean),
   counterfactualMeanBetweenDeltaOk:round(betweenMean),
   smallestWithinDeltaOk:round(Math.min(...within)),
   smallestBetweenDeltaOk:round(Math.min(...between)),
   approvedSemanticFamilies:0,validatedIdentityDiscriminability:0,
   actualHumanLearningOutcomes:0},
  groups};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const palette=JSON.parse(fs.readFileSync(
  "palettes/mandarin-component-identity-v0.6.json","utf8"));
 const value=JSON.stringify(derivePilotGroupCounterfactual(palette),null,2)+"\n";
 const path="site/mnemonic-group-counterfactual-v0.1.json";
 if(process.argv.includes("--write"))fs.writeFileSync(path,value);
 else if(process.argv.includes("--check"))assert.equal(fs.readFileSync(path,"utf8"),value);
 else throw Error("Use --write or --check");
 console.log("Isolated 40-color structural counterfactual with no production changes");
}
