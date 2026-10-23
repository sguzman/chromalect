// Standalone citation-tone presentation comparison; no acoustic or learning claims.
(() => {
"use strict";
const $=id=>document.getElementById(id);
if(!$("tone-mode")||!$("tone-status")||!$("tone-results"))return;
let data=null,palette=null;
function draw(){
 const mode=$("tone-mode").value;
 if(!data?.comparisonModes.includes(mode))throw Error("Invalid presentation mode");
 $("tone-results").replaceChildren();
 for(const tone of data.tones){
  const card=document.createElement("article"),heading=document.createElement("h2"),
   visual=document.createElement("div"),note=document.createElement("p");
  card.className="tone-card";visual.className="tone-visual";note.className="tone-note";
  heading.textContent="T"+tone.token+" · "+tone.name+" · "+tone.firstSourceExample.character+" "+tone.firstSourceExample.pinyin;
  note.textContent=tone.note+(tone.levels?" · idealized contour "+tone.levels.join("–"):"");
  if(mode==="plain"||mode==="symbol"||tone.levels===null&&mode==="contour"){
   const p=document.createElement("span");p.className="tone-display";
   p.textContent=mode==="symbol"?tone.symbol:
    mode==="plain"?"T"+tone.token:"No fixed neutral contour";
   visual.appendChild(p);
  }else if(mode==="color"){
   const square=document.createElement("span");
   square.className="tone-swatch";
   square.style.backgroundColor=palette.palette_domains.tone.tokens[tone.token];
   square.setAttribute("aria-label","T"+tone.token+" color sample");
   visual.appendChild(square);
   const p=document.createElement("span");p.textContent="T"+tone.token;visual.appendChild(p);
  }else{
   const svg=document.createElementNS("http://www.w3.org/2000/svg","svg");
   svg.setAttribute("viewBox","0 0 160 108");
   svg.setAttribute("role","img");
   svg.setAttribute("aria-label","T"+tone.token+" relative pitch "+tone.levels.join("–"));
   svg.className="tone-svg";
   const line=document.createElementNS("http://www.w3.org/2000/svg","polyline");
   const points=tone.levels.map((pitch,i)=>{
    const x=12+i*136/(tone.levels.length-1),y=94-(pitch-1)*20;
    return x.toFixed(1)+","+y.toFixed(1);
   }).join(" ");
   line.setAttribute("points",points);
   line.setAttribute("stroke","currentColor");
   line.setAttribute("fill","none");
   line.setAttribute("stroke-width","5");
   line.setAttribute("stroke-linecap","round");
   line.setAttribute("stroke-linejoin","round");
   svg.appendChild(line);visual.appendChild(svg);
  }
  card.appendChild(heading);card.appendChild(visual);card.appendChild(note);
  $("tone-results").appendChild(card);
 }
 $("tone-status").textContent="Five citation-tone categories · "+mode+" presentation · no measured speech or learning outcomes.";
}
async function load(){
 try{
  const responses=await Promise.all([
   fetch("phonetics/mandarin-citation-tone-contours-v0.1.json"),
   fetch("layers-v0.1.json")]);
  if(responses.some(x=>!x.ok))throw Error("Missing source data");
  [data,palette]=await Promise.all(responses.map(x=>x.json()));
  if(data.schema!=="chromalect.phonetics.mandarin-citation-tone-contours.v0.1"||
     data.status!=="idealized_pedagogical_citation_pitch_contours_not_acoustic_or_contextual_measurements"||
     !Array.isArray(data.tones)||data.tones.length!==5||
     data.scope.sourceAlignedCitationReadings!==1171||
     !Array.isArray(data.comparisonModes)||data.comparisonModes.join(",")!=="plain,contour,symbol,color"||
     data.tones[0].levels!==null||data.tones[0].status!=="no_fixed_context_free_contour"||
     Object.values(data.evidence).some(n=>n!==0)||
     palette.schema!=="chromalect.presentation-layers.v0"||
     !data.tones.every((t,i)=>t.token===String(i)&&
       t.symbol===palette.palette_domains.tone.symbols[t.token]&&
       t.firstSourceExample&&Number.isInteger(t.firstSourceExample.rank)&&
       typeof t.firstSourceExample.character==="string"&&
       typeof t.firstSourceExample.pinyin==="string"&&
       Object.hasOwn(palette.palette_domains.tone.tokens,t.token)&&
       (i===0||Array.isArray(t.levels)&&t.levels.length>=2&&
         t.levels.every(x=>Number.isInteger(x)&&x>=1&&x<=5))))
   throw Error("Citation-tone schema or validation boundary differs");
  draw();
 }catch(e){$("tone-results").replaceChildren();$("tone-status").textContent="Unable to validate tone reference: "+e.message;}
}
$("tone-mode").addEventListener("change",draw);
load();
})();