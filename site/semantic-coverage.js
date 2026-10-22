/* First-tranche semantic screening gallery: sourced glosses, unverified emoji.
   Avoid changing the source glyph, phonetic layers, or word-level semantics. */
(() => {
  "use strict";
  const grammar = globalThis.ChromalectSemanticGrammar;
  const $ = id => document.getElementById(id);
  const root = $("semantic-coverage-rows");
  const status = $("semantic-coverage-status");
  if (!grammar || !root || !status) return;
  const lookup = $("semantic-lookup");
  const filter = $("semantic-filter");
  const enabled = $("semantic-layer-character");
  const prev = $("semantic-prev");
  const next = $("semantic-next");
  const pageLabel = $("semantic-page-label");
  const pageSize = 40;
  let ledger = null;
  let page = 0;

  function elem(tag, cls, value) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (value !== undefined) node.textContent = value;
    return node;
  }
  function percent(value, total) {
    return (total ? value * 100 / total : 0).toFixed(1) + "%";
  }
  function state(entry) {
    if (entry.screening.status === "pending") return "pending";
    return entry.screening.candidates.some(x=>x.expression) ? "candidate" : "deferred";
  }
  function bindMetrics(summary) {
    const total = summary.trancheCount;
    $("semantic-source-count").textContent = summary.meaningSourceFound + " / " + total;
    $("semantic-source-percent").textContent = percent(summary.meaningSourceFound,total);
    $("semantic-screened-count").textContent = summary.screenedCharacters + " / " + total;
    $("semantic-screened-percent").textContent = percent(summary.screenedCharacters,total);
    $("semantic-candidate-count").textContent = summary.pictogramCandidateCharacters + " / " + total;
    $("semantic-candidate-percent").textContent = percent(summary.pictogramCandidateCharacters,total);
    $("semantic-verified-count").textContent = percent(summary.productionVerifiedCharacters,total);
    $("semantic-progress").setAttribute("aria-valuemax", String(total));
    $("semantic-progress").setAttribute("aria-valuenow", String(summary.screenedCharacters));
    $("semantic-progress-fill").style.width = percent(summary.screenedCharacters,total);
  }
  function card(entry) {
    const card = elem("article","semantic-entry");
    const header = elem("div","semantic-entry-top");
    const hanzi = elem("strong","semantic-character",entry.character);
    hanzi.lang="zh-Hans";
    header.append(hanzi,elem("span","semantic-rank","Rank "+entry.rank));
    card.appendChild(header);
    const screened = state(entry);
    const selection = entry.screening.candidates.find(x=>x.expression);
    const label = selection ? "Candidate meaning: " + selection.selectedMeaning :
      screened==="deferred" ? "Pictogram deferred" : "Awaiting first semantic screening";
    card.appendChild(elem("p","semantic-meaning",label));
    if (selection && enabled.checked) {
      const visual=elem("div","semantic-emoji",grammar.emojiDisplay(selection.expression));
      visual.setAttribute("role","img");
      visual.setAttribute("aria-label","Experimental emoji for "+selection.selectedMeaning);
      card.appendChild(visual);
    }
    card.appendChild(elem("p","semantic-status",
      screened==="candidate" ? "Experimental emoji • independent review pending" :
      screened==="deferred" ? "No clear pictogram selected in this pass" :
      "No pictogram reviewed yet"));
    const details=elem("details");
    const summary=elem("summary",null,"Source meaning evidence");
    details.appendChild(summary);
    const definition=elem("p","semantic-source",entry.source.definition);
    details.appendChild(definition);
    details.appendChild(elem("p","semantic-source",
      "Provisional Unihan kDefinition • "+entry.source.codepoint+
      " • "+entry.source.groupCandidates.length+" candidate definition group(s)"));
    if (selection) {
      details.appendChild(elem("p","semantic-source",
        "Emoji targets source group "+(selection.sourceGroupIndex+1)+
        " only; other potential senses have not been individually mapped."));
    } else if (screened==="deferred") {
      details.appendChild(elem("p","semantic-source",
        "No emoji was assigned; the sourced definition remains available."));
    }
    card.appendChild(details);
    return card;
  }
  function matching() {
    if (!ledger) return [];
    const q=lookup.value.trim().toLocaleLowerCase();
    const selected=filter.value;
    return ledger.characters.filter(x=>
      (selected==="all" || selected===state(x)) &&
      (!q || x.character.includes(q) || String(x.rank)===q ||
       x.source.definition.toLocaleLowerCase().includes(q) ||
       x.screening.candidates.some(c=>(c.selectedMeaning||"").toLocaleLowerCase().includes(q))));
  }
  function render() {
    if (!ledger) return;
    const rows=matching();
    const pages=Math.max(1,Math.ceil(rows.length/pageSize));
    page=Math.min(page,pages-1);
    const begin=page*pageSize;
    const frag=document.createDocumentFragment();
    for(const entry of rows.slice(begin,begin+pageSize))frag.appendChild(card(entry));
    root.replaceChildren(frag);
    prev.disabled=page===0;
    next.disabled=page>=pages-1;
    pageLabel.textContent="Page "+(page+1)+" of "+pages;
    status.textContent=rows.length+" characters match • "+(rows.length?
      "showing "+(begin+1)+"–"+Math.min(rows.length,begin+pageSize):"no matches")+
      " • screening and emoji are provisional";
  }
  function reset(){page=0;render();}
  lookup.addEventListener("input",reset);
  filter.addEventListener("change",reset);
  enabled.addEventListener("change",render);
  prev.addEventListener("click",()=>{page--;render();});
  next.addEventListener("click",()=>{page++;render();});

  async function load() {
    try {
      const response=await fetch("semantic/mandarin-1000-v0.1.json");
      if(!response.ok)throw new Error("Semantic source file not published");
      const data=await response.json();
      if(data.schema!=="chromalect.mandarin.character-semantic-tranche.v0.1" ||
         data.characters.length!==1000 ||
         data.source.provisional!==true ||
         data.layers.wholeWord.status!=="planned_unpopulated" ||
         data.summary.productionVerifiedCharacters!==0)throw new Error("Unsupported semantic dataset");
      for(const entry of data.characters)for(const candidate of entry.screening.candidates){
        if(candidate.expression)grammar.validate(candidate.expression);
      }
      ledger=data;
      bindMetrics(data.summary);
      render();
    }catch(error) {
      status.textContent="Unable to load the semantic evidence. Check the published data or deployment.";
    }
  }
  load();
})();
