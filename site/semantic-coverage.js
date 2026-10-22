/* First-tranche semantic screening gallery: sourced glosses, unverified emoji.
   Avoid changing the source glyph, phonetic layers, or word-level semantics. */
(() => {
  "use strict";
  const grammar = globalThis.ChromalectSemanticGrammar;
  const presenter = globalThis.ChromalectLayers;
  const $ = id => document.getElementById(id);
  const root = $("semantic-coverage-rows");
  const status = $("semantic-coverage-status");
  if (!grammar || !presenter || !root || !status) return;
  const lookup = $("semantic-lookup");
  const filter = $("semantic-filter");
  const lexicalFilter = $("semantic-lexical-filter");
  const enabled = $("semantic-layer-character");
  const prev = $("semantic-prev");
  const next = $("semantic-next");
  const pageLabel = $("semantic-page-label");
  const pageSize = 40;
  let ledger = null;
  let profileRows = new Map();
  let lexicalRows = new Map();
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
    $("semantic-stage-screened").textContent =
      summary.screenedCharacters+" / "+total+" ("+percent(summary.screenedCharacters,total)+")";
  }
  function bindResearchProgress(metrics) {
    const total=metrics.totalCharacters;
    for (const [name,count] of [
      ["dictionary",metrics.crossReferenced],
      ["lexical",metrics.manualSenseReviewed],
      ["emoji",metrics.emojiComprehensionReviewed]
    ]) {
      const bar=$("semantic-"+name+"-progress");
      const fill=$("semantic-"+name+"-fill");
      const label=$("semantic-stage-"+name);
      if (!bar || !fill || !label) throw new Error("Missing semantic progress stage "+name);
      bar.setAttribute("aria-valuemax",String(total));
      bar.setAttribute("aria-valuenow",String(count));
      fill.style.width=percent(count,total);
      label.textContent=count+" / "+total+" ("+percent(count,total)+")";
    }
    $("semantic-crossref-note").textContent=
      metrics.headwordsFound+" independent dictionary headwords obtained; "+
      metrics.expressionLiteralMatches+" of "+metrics.candidateExpressions+
      " tentative expression glosses matched English wording literally, "+
      metrics.expressionGlossMismatchOrSynonym+
      " require closer sense alignment. These checks do not count as linguistic or emoji verification.";
  }

  function card(entry) {
    const card = elem("article","semantic-entry");
    const header = elem("div","semantic-entry-top");
    const glyph = profileRows.get(entry.rank);
    if (!glyph || glyph.character !== entry.character) throw new Error("Character profile misalignment");
    header.append(presenter.createGlyph(glyph),elem("span","semantic-rank","Rank "+entry.rank));
    card.appendChild(header);
    const screened = state(entry);
    const selections = entry.screening.candidates.filter(x=>x.expression);
    if (selections.length) {
      for(const selection of selections) {
        const sense = elem("div","semantic-sense");
        sense.appendChild(elem("p","semantic-meaning","Candidate meaning: "+selection.selectedMeaning));
        if (enabled.checked) {
          const visual=elem("div","semantic-emoji",grammar.emojiDisplay(selection.expression));
          visual.setAttribute("role","img");
          visual.setAttribute("aria-label","Experimental emoji for "+selection.selectedMeaning);
          sense.appendChild(visual);
        }
        card.appendChild(sense);
      }
    } else {
      card.appendChild(elem("p","semantic-meaning",
        screened==="deferred" ? "Pictogram deferred" : "Awaiting first semantic screening"));
    }
    card.appendChild(elem("p","semantic-status",
      screened==="candidate" ? "Experimental emoji • independent review pending" :
      screened==="deferred" ? "No clear pictogram selected in this pass" :
      "No pictogram reviewed yet"));
    const crossref=lexicalRows.get(entry.rank);
    if (crossref) {
      const literal=crossref.selectedSenseChecks.filter(s=>s.lexicalEvidence==="literal_gloss_match").length;
      card.appendChild(elem("p","semantic-dictionary-note",
        "CC-CEDICT headword located · "+
        (selections.length ? literal+" / "+selections.length+" candidate glosses matched literally" :
        "no emoji candidate to compare")+
        " · lexical review pending"));
    }
    const details=elem("details");
    const summary=elem("summary",null,"Source meaning evidence");
    details.appendChild(summary);
    details.appendChild(elem("p","semantic-source",entry.source.definition));
    details.appendChild(elem("p","semantic-source",
      "Provisional Unihan kDefinition • "+entry.source.codepoint+
      " • "+entry.source.groupCandidates.length+" candidate definition group(s)"));
    if (crossref) {
      const link=elem("a",null,"CC-CEDICT second-source headword and readings");
      link.href="https://github.com/krmanik/cedict-json/blob/63c2569948629323b515833930fdd10f285401b6/v2/"+
        encodeURIComponent(entry.character)+".json";
      link.rel="noopener noreferrer";
      details.appendChild(link);
      details.appendChild(elem("p","semantic-source",
        "CC-CEDICT CC BY-SA 4.0; a dictionary match is not a reviewed semantic assignment."));
    }
    for (const selection of selections) {
      details.appendChild(elem("p","semantic-source",
        selection.selectedMeaning+" refers to candidate definition group "+
        (selection.sourceGroupIndex+1)+"; other possible senses are not automatically mapped."));
    }
    if (screened==="deferred") {
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
    const dictionary=lexicalFilter.value;
    return ledger.characters.filter(x=>{
      const crossref=lexicalRows.get(x.rank);
      return (selected==="all" || selected===state(x)) &&
        (dictionary==="all" ||
          (dictionary==="crossref" && !!crossref) ||
          (dictionary==="not-crossref" && !crossref) ||
          (dictionary==="needs-review" &&
            !!crossref && crossref.selectedSenseChecks.some(s=>
              s.lexicalEvidence==="requires_sense_review"))) &&
      (!q || x.character.includes(q) || String(x.rank)===q ||
       x.source.definition.toLocaleLowerCase().includes(q) ||
       x.screening.candidates.some(c=>(c.selectedMeaning||"").toLocaleLowerCase().includes(q)));
    });
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
  lexicalFilter.addEventListener("change",reset);
  enabled.addEventListener("change",render);
  prev.addEventListener("click",()=>{page--;render();});
  next.addEventListener("click",()=>{page++;render();});

  async function load() {
    try {
      const [response,profileResponse,lexicalResponse]=await Promise.all([
        fetch("semantic/mandarin-1000-v0.1.json"),
        fetch("profiles/mandarin-1000-v1.json"),
        fetch("semantic/lexical-crossref-v0.1.json")
      ]);
      if(!response.ok || !profileResponse.ok || !lexicalResponse.ok)
        throw new Error("Character or dictionary data unavailable");
      const [data,profile,lexical]=await Promise.all([
        response.json(),profileResponse.json(),lexicalResponse.json()
      ]);
      if(lexical.schema!=="chromalect.semantic.lexical-crossref-summary.v0.1" ||
         lexical.status!=="independent_dictionary_ingestion_only_not_validated" ||
         lexical.metrics.totalCharacters!==1000 ||
         lexical.metrics.manualSenseReviewed!==0 ||
         lexical.metrics.emojiComprehensionReviewed!==0 ||
         lexical.metrics.productionVerified!==0 ||
         lexical.records.length!==lexical.metrics.crossReferenced ||
         lexical.records.some(e=>data.characters[e.rank-1]?.character!==e.character))
        throw new Error("Lexical cross-reference provenance or alignment mismatch");
      lexicalRows=new Map(lexical.records.map(r=>[r.rank,r]));
      if(profile.schema!=="chromalect.mandarin-character-profile.v1" ||
         profile.catalog_count!==1000 || !Array.isArray(profile.characters) ||
         profile.characters.length!==1000)throw new Error("Unsupported Mandarin profile");
      const lookup=new Map(profile.characters.map(row=>[row.rank,row]));
      if(data.characters.some(row=>lookup.get(row.rank)?.character!==row.character))
        throw new Error("Semantic data and glyph catalog do not align");
      profileRows=lookup;
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
      bindResearchProgress(lexical.metrics);
      render();
    }catch(error) {
      status.textContent="Unable to load the semantic evidence. Check the published data or deployment.";
    }
  }
  load();
})();
