(() => {
"use strict";
const status=document.getElementById("roadmap-status");
const target=document.getElementById("roadmap-phases");
if(!status||!target)return;
fetch("progress/roadmap-checkpoints-v0.1.json")
 .then(response=>{if(!response.ok)throw Error("Missing published roadmap index");return response.json();})
 .then(data=>{
  if(data.schema!=="chromalect.project.roadmap-checkpoints.v0.1"||
    data.status!=="document_checklist_completion_not_scientific_validation_or_overall_project_percentage"||
    data.source.independentValidationNotImplied!==true||
    !Array.isArray(data.phases)||data.phases.length!==5)
   throw Error("Wrong research checkpoint provenance");
  target.replaceChildren();
  for(const p of data.phases){
   if(p.complete+p.pending!==p.total||p.checkpoints.length!==p.total||
      p.checkpoints.filter(x=>x.state==="complete").length!==p.complete||
      p.checkpoints.filter(x=>x.state==="pending").length!==p.pending||
      Math.round(100*p.complete/p.total)!==p.checklistPercent)
    throw Error("Roadmap counts do not match checkpoint rows");
   const card=document.createElement("section"),h=document.createElement("h2"),
    sub=document.createElement("p"),meter=document.createElement("progress"),details=document.createElement("details"),
    summary=document.createElement("summary"),list=document.createElement("ul");
   card.className="roadmap-card";h.textContent=p.label;sub.className="roadmap-secondary";
   sub.textContent=p.complete+" of "+p.total+" checklist items marked complete · "+p.checklistPercent+"% (unweighted)";
   meter.max=p.total;meter.value=p.complete;
   summary.textContent="Remaining checkpoints ("+p.pending+")";
   for(const checkpoint of p.checkpoints.filter(x=>x.state==="pending")){
    const li=document.createElement("li");li.textContent=checkpoint.description;list.appendChild(li);
   }
   details.appendChild(summary);details.appendChild(list);
   card.appendChild(h);card.appendChild(sub);card.appendChild(meter);card.appendChild(details);
   target.appendChild(card);
  }
  status.textContent="Checkpoint counts generated from docs/roadmap.md; no scientific acceptance or overall project completion is implied.";
 }).catch(e=>{target.replaceChildren();status.textContent="Unable to validate roadmap progress: "+e.message;});
})();