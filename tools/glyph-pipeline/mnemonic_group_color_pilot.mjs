// Pilot palette-hint distance study; source hints are not independently
// attested semantic families and this study changes no component identity.
import assert from "node:assert/strict";
import fs from "node:fs";
import {pathToFileURL} from "node:url";

function oklab(hex){
 assert.match(hex,/^#[0-9a-f]{6}$/i);
 const linear=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255)
  .map(v=>v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4);
 const [r,g,b]=linear;
 const l=Math.cbrt(0.4122214708*r+0.5363325363*g+0.0514459929*b);
 const m=Math.cbrt(0.2119034982*r+0.6806995451*g+0.1073969566*b);
 const s=Math.cbrt(0.0883024619*r+0.2817188376*g+0.6299787005*b);
 return [
  0.2104542553*l+0.7936177850*m-0.0040720468*s,
  1.9779984951*l-2.4285922050*m+0.4505937099*s,
  0.0259040371*l+0.7827717662*m-0.8086757660*s
 ];
}
const distance=(x,y)=>Math.hypot(...oklab(x).map((v,i)=>v-oklab(y)[i]));
const round=x=>Number(x.toFixed(6));
const average=values=>values.reduce((n,v)=>n+v,0)/values.length;
const expectedHints=[
 ["human-body",8],["movement-space",6],["speech-senses",5],
 ["earth-material",5],["structural-series",5],["water-fluid",4],
 ["heat-light",4],["plant-growth",3]
];
export function deriveMnemonicGroupPilot(palette){
 assert.equal(palette.schema,"chromalect.component-palette.v0");
 assert.equal(palette.id,"mandarin-component-identity");
 assert.equal(palette.version,"0.6.0");
 assert.equal(palette.coverage.total_component_identities,520);
 assert.equal(palette.components.length,520);
 assert.match(palette.status,/pending-independent-visual-review/);
 const hints=new Map(),colors=new Set(),ids=new Set();
 for(let i=0;i<palette.components.length;i++){
  const c=palette.components[i];
  assert.equal(c.id,"cmp-"+String(i+1).padStart(4,"0"));
  assert.ok(!ids.has(c.id));ids.add(c.id);
  assert.match(c.color,/^#[0-9a-f]{6}$/i);
  assert.ok(!colors.has(c.color.toUpperCase()));colors.add(c.color.toUpperCase());
  if(c.mnemonic_group_hint!==null){
   assert.equal(c.source_scope,"pilot-preserved");
   assert.ok(i<40,"Only source-pinned original pilot components may have historical hints");
   if(!hints.has(c.mnemonic_group_hint))hints.set(c.mnemonic_group_hint,[]);
   hints.get(c.mnemonic_group_hint).push(c);
  }
 }
 assert.equal(hints.size,8);
 assert.equal([...hints.values()].reduce((n,x)=>n+x.length,0),40);
 for(const [hint,count] of expectedHints)
  assert.equal(hints.get(hint)?.length,count);
 const groups=[];
 let within=[];
 for(const [hint,] of expectedHints){
  const members=hints.get(hint);
  const pairs=[];
  for(let i=0;i<members.length;i++)for(let j=i+1;j<members.length;j++){
   const a=members[i],b=members[j],value=distance(a.color,b.color);
   pairs.push({a:a.id,b:b.id,deltaOk:round(value)});
   within.push(value);
  }
  const pairDistances=pairs.map(x=>x.deltaOk);
  groups.push({mnemonicHint:hint,
   status:"unverified_pilot_mnemonic_hint_not_lexical_or_semantic_family",
   sourceComponentIds:members.map(c=>c.id),
   componentColors:members.map(c=>({id:c.id,form:c.shape,hex:c.color})),
   withinPairs:pairs,
   summary:{members:members.length,pairs:pairs.length,
    minimumDeltaOk:round(Math.min(...pairDistances)),
    meanDeltaOk:round(average(pairDistances)),
    maximumDeltaOk:round(Math.max(...pairDistances))},
   semanticEvidenceApproved:false,semanticFamilyColorSchemeApproved:false});
 }
 const hinted=palette.components.slice(0,40),between=[];
 for(let i=0;i<hinted.length;i++)for(let j=i+1;j<hinted.length;j++)
  if(hinted[i].mnemonic_group_hint!==hinted[j].mnemonic_group_hint)
   between.push(distance(hinted[i].color,hinted[j].color));
 assert.equal(within.length,88);assert.equal(between.length,692);
 return {schema:"chromalect.palette.mnemonic-hint-color-pilot.v0.1",
  status:"pilot_hint_color_distance_measurement_not_verified_semantic_families",
  provenance:{palette:"mandarin-component-identity@0.6.0",
   source:"palettes/mandarin-component-identity-v0.6.json",
   metric:"Euclidean OKLab delta for exact sRGB component colors",
   colorSpaceReference:"https://bottosson.github.io/posts/oklab/",
   paletteRecolored:false,componentIdentityReassigned:false},
  summary:{sourceComponentColors:520,pilotHintedComponents:40,unhintedComponents:480,
   provisionalMnemonicHintGroups:8,withinHintPairs:88,betweenHintPairs:692,
   meanWithinHintDeltaOk:round(average(within)),
   meanBetweenHintDeltaOk:round(average(between)),
   independentlyApprovedSemanticFamilies:0,
   humanColorOrSemanticComprehensionTrials:0},
  groups};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const data=JSON.parse(fs.readFileSync("palettes/mandarin-component-identity-v0.6.json","utf8"));
 const result=deriveMnemonicGroupPilot(data);
 const target="site/semantic-group-color-pilot-v0.1.json";
 const value=JSON.stringify(result,null,2)+"\n";
 if(process.argv.includes("--write"))fs.writeFileSync(target,value);
 else if(process.argv.includes("--check"))assert.equal(fs.readFileSync(target,"utf8"),value);
 else throw Error("Use --write or --check");
 console.log("Original 40 pilot hints measured without semantic-family claims:",JSON.stringify(result.summary));
}
