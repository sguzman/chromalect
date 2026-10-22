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
  const actionFilter = $("semantic-action-filter");
  const visualFilter = $("semantic-visual-filter");
  const enabled = $("semantic-layer-character");
  const prev = $("semantic-prev");
  const next = $("semantic-next");
  const pageLabel = $("semantic-page-label");
  const pageSize = 40;
  let ledger = null;
  let profileRows = new Map();
  let lexicalRows = new Map();
  let strictRows = new Map();
  let reviewRows = new Map();
  let visibilityRows = new Map();
  let strictSummary = null;
  let deskCounts = {analyzed:0,total:248};
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
  function bindResearchProgress(metrics, audit) {
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
    $("semantic-desk-progress").setAttribute("aria-valuemax",String(deskCounts.total));
    $("semantic-desk-progress").setAttribute("aria-valuenow",String(deskCounts.analyzed));
    $("semantic-desk-fill").style.width=percent(deskCounts.analyzed,deskCounts.total);
    $("semantic-stage-desk").textContent=deskCounts.analyzed+" / "+deskCounts.total+
      " ("+percent(deskCounts.analyzed,deskCounts.total)+") · not approval";
    const audited=audit.scope.charactersAudited;
    $("semantic-boundary-progress").setAttribute("aria-valuemax",String(total));
    $("semantic-boundary-progress").setAttribute("aria-valuenow",String(audited));
    $("semantic-boundary-fill").style.width=percent(audited,total);
    $("semantic-stage-boundary").textContent=audited+" / "+total+" ("+percent(audited,total)+")";
    $("semantic-crossref-note").textContent=
      metrics.headwordsFound+" independent headwords; "+
      audit.summary.wholeTermMatched+" of "+audit.scope.proposedExpressionCount+
      " experimental glosses matched whole terms, "+
      audit.summary.requiresSenseReview+" need sense alignment (including "+
      audit.summary.substringOnlyFalsePositives+
      " substring-only false matches). All remain unapproved.";
  }

  function bindVisibilityProgress(metrics) {
    const count=metrics.auditedExpressions,total=metrics.proposedExpressions;
    $("semantic-visibility-progress").setAttribute("aria-valuemax",String(total));
    $("semantic-visibility-progress").setAttribute("aria-valuenow",String(count));
    $("semantic-visibility-fill").style.width=percent(count,total);
    $("semantic-stage-visibility").textContent=count+" / "+total+" ("+percent(count,total)+") · research only";
    $("semantic-visibility-note").textContent=
      metrics.singleEmojiExpressions+" expressions use one emoji, including "+
      metrics.singleEmojiEventExpressions+" action cues whose verb role is invisible. "+
      metrics.sameCharacterSenseCollisionCharacters+" character has two different senses with identical emoji. "+
      "These are review flags, not automatic mapping failures.";
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
      const comparisons=strictRows.get(entry.rank)||[];
      const matched=comparisons.filter(s=>s.wholeTermMatch).length;
      const needs=comparisons.filter(s=>!s.wholeTermMatch).length;
      card.appendChild(elem("p","semantic-dictionary-note",
        "CC-CEDICT headword located · "+
        (selections.length ? matched+" / "+selections.length+" candidate glosses matched whole terms"+
          (needs ? " · "+needs+" need closer alignment" : "") :
        "no emoji candidate to compare")+
        " · no human lexical approval"));
    }
    const visibleCues=visibilityRows.get(entry.rank)||[];
    if(visibleCues.length) {
      const events=visibleCues.filter(x=>x.operators.includes("event"));
      const ambiguous=visibleCues.filter(x=>x.riskFlags.includes("same_character_senses_identical_display"));
      if(events.length||ambiguous.length)card.appendChild(elem("p","semantic-review-note",
        (events.length?events.length+" emoji action cue(s) omit explicit event roles":"")+
        (events.length&&ambiguous.length?" · ":"")+
        (ambiguous.length?"Different meanings share one visible emoji":"")+
        " · research flag only"));
    }
    const flagged=reviewRows.get(entry.rank)||[];
    if (flagged.length) {
      const priorities=[...new Set(flagged.map(x=>x.priority))];
      card.appendChild(elem("p","semantic-review-note",
        priorities.join(" / ")+" priority · "+flagged.length+
        " experimental sense"+(flagged.length===1?"":"s")+" needs independent lexical review"));
    }
    const details=elem("details");
    const summary=elem("summary",null,"Source meaning evidence");
    details.appendChild(summary);
    details.appendChild(elem("p","semantic-source",entry.source.definition));
    details.appendChild(elem("p","semantic-source",
      "Provisional Unihan kDefinition • "+entry.source.codepoint+
      " • "+entry.source.groupCandidates.length+" candidate definition group(s)"));
    for(const cue of visibleCues)if(cue.riskFlags.length) {
      details.appendChild(elem("p","semantic-review-detail",
        "Emoji display for "+cue.selectedMeaning+": "+cue.emojiDisplay+
        " · automatic visibility flags: "+cue.riskFlags.join(", ").replaceAll("_"," ")+
        ". These are not comprehension judgments."));
    }
    for(const item of flagged){
      const msg=item.selectedMeaning+" — "+item.reviewReason.replaceAll("_"," ")+
        " · "+item.priority+" priority · no independent approval";
      details.appendChild(elem("p","semantic-review-detail",msg));
      if(item.earlierResearchNote)details.appendChild(elem("p","semantic-review-detail",item.earlierResearchNote));
      if(item.deskAnalysis) {
        details.appendChild(elem("p","semantic-review-detail",
          "Preliminary desk analysis — "+item.deskAnalysis.observation+
          " Suggested next action: "+item.deskAnalysis.provisionalNextAction.replaceAll("_"," ")+
          ". This is not independent lexical approval."));
        if(item.deskAnalysis.sourceExcerpt)
          details.appendChild(elem("p","semantic-review-detail",
            "CC-CEDICT excerpt (CC BY-SA 4.0): "+item.deskAnalysis.sourceExcerpt));
      }
    }
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
    const action=actionFilter.value;
    const visual=visualFilter.value;
    return ledger.characters.filter(x=>{
      const crossref=lexicalRows.get(x.rank);
      const aligned=strictRows.get(x.rank)||[];
      const cues=visibilityRows.get(x.rank)||[];
      return (selected==="all" || selected===state(x)) &&
        (visual==="all" ||
          (visual==="single-icon" && cues.some(y=>y.emojiCount===1)) ||
          (visual==="multiple-icons" && cues.some(y=>y.emojiCount>1)) ||
          (visual==="event-role" && cues.some(y=>y.operators.includes("event"))) ||
          (visual==="single-event" && cues.some(y=>y.operators.includes("event")&&y.emojiCount===1)) ||
          (visual==="association" && cues.some(y=>y.operators.includes("associate"))) ||
          (visual==="same-character-collision" && cues.some(y=>
            y.riskFlags.includes("same_character_senses_identical_display")))) &&
        (action==="all" || (reviewRows.get(x.rank)||[]).some(y=>
          y.deskAnalysis?.provisionalNextAction===action)) &&
        (dictionary==="all" ||
          (dictionary==="crossref" && !!crossref) ||
          (dictionary==="not-crossref" && !crossref) ||
          (dictionary==="needs-review" && aligned.some(s=>!s.wholeTermMatch)) ||
          (dictionary==="desk-analyzed" && (reviewRows.get(x.rank)||[]).some(y=>!!y.deskAnalysis)) ||
          (dictionary==="desk-pending" && (reviewRows.get(x.rank)||[]).some(y=>!y.deskAnalysis)) ||
          (dictionary==="high-priority" && (reviewRows.get(x.rank)||[]).some(y=>y.priority==="high")) ||
          (dictionary==="medium-priority" && (reviewRows.get(x.rank)||[]).some(y=>y.priority==="medium")) ||
          (dictionary==="unclassified-priority" && (reviewRows.get(x.rank)||[]).some(y=>y.priority==="unclassified")) ||
          (dictionary==="substring-only" && aligned.some(s=>s.legacySubstringMatch&&!s.wholeTermMatch)) ||
          (dictionary==="whole-match" && aligned.some(s=>s.wholeTermMatch))) &&
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
  actionFilter.addEventListener("change",reset);
  visualFilter.addEventListener("change",reset);
  enabled.addEventListener("change",render);
  prev.addEventListener("click",()=>{page--;render();});
  next.addEventListener("click",()=>{page++;render();});

  async function load() {
    try {
      const [response,profileResponse,lexicalResponse,auditResponse,reviewResponse,visibilityResponse]=await Promise.all([
        fetch("semantic/mandarin-1000-v0.1.json"),
        fetch("profiles/mandarin-1000-v1.json"),
        fetch("semantic/lexical-crossref-v0.1.json"),
        fetch("semantic/strict-gloss-index-v0.1.json"),
        fetch("semantic/sense-review-queue-v0.1.json"),
        fetch("semantic/emoji-visibility-audit-v0.1.json")
      ]);
      if(!response.ok || !profileResponse.ok || !lexicalResponse.ok || !auditResponse.ok || !reviewResponse.ok || !visibilityResponse.ok)
        throw new Error("Character, dictionary or audit data unavailable");
      const [data,profile,lexical,audit,review,visibility]=await Promise.all([
        response.json(),profileResponse.json(),lexicalResponse.json(),auditResponse.json(),reviewResponse.json(),visibilityResponse.json()
      ]);
      if(visibility.schema!=="chromalect.semantic.emoji-visibility-audit.v0.1" ||
         visibility.status!=="automated_visual_projection_review_only_not_linguistic_or_comprehension_approval" ||
         visibility.summary.proposedExpressions!==897 ||
         visibility.summary.auditedExpressions!==visibility.records.length ||
         visibility.summary.humanLexicalApproved!==0 ||
         visibility.summary.humanEmojiComprehensionApproved!==0 ||
         visibility.summary.productionVerified!==0 ||
         visibility.records.some(x=>data.characters[x.rank-1]?.character!==x.character ||
           x.productionVerified!==false || x.independentLexicalReview!=="pending" ||
           x.independentEmojiComprehensionReview!=="pending"))
        throw new Error("Invalid automated semantic visibility audit");
      for(const entry of visibility.records){
        if(!visibilityRows.has(entry.rank))visibilityRows.set(entry.rank,[]);
        visibilityRows.get(entry.rank).push(entry);
      }
      if(review.schema!=="chromalect.semantic.lexical-sense-review-queue.v0.1" ||
         review.status!=="unreviewed_prioritization_only" ||
         !Array.isArray(review.records) ||
         review.records.length!==audit.summary.requiresSenseReview ||
         review.records.some(x=>data.characters[x.rank-1]?.character!==x.character ||
           x.lexicalDecision!=="pending" ||
           x.visualComprehensionDecision!=="pending" ||
           x.productionVerified!==false))
        throw new Error("Unverified sense review data malformed or promoted without approval");
      if(review.counts.deskAnalyzedTotal!==
           review.counts.deskAnalyzedHighPriority+
           review.counts.deskAnalyzedMediumPriority+
           review.counts.deskAnalyzedUnclassified ||
         review.counts.independentlyLexicallyApproved!==0 ||
         review.counts.emojiComprehensionApproved!==0 ||
         review.counts.pendingSenseAlignment!==248 ||
         review.counts.deskAnalysisPending!==
           review.counts.pendingSenseAlignment-review.counts.deskAnalyzedTotal ||
         review.records.filter(x=>!!x.deskAnalysis).length!==review.counts.deskAnalyzedTotal)
         throw new Error("Desk-analysis counts do not match provisional entries");
      deskCounts={analyzed:review.counts.deskAnalyzedTotal,total:review.counts.pendingSenseAlignment};
      const reviews=new Map();
      for(const item of review.records){
        if(!reviews.has(item.rank))reviews.set(item.rank,[]);
        reviews.get(item.rank).push(item);
      }
      reviewRows=reviews;
      if(audit.schema!=="chromalect.semantic.strict-gloss-index.v0.1" ||
         audit.status!=="automated_boundary_check_only_no_linguistic_approval" ||
         audit.scope.charactersAudited!==1000 ||
         audit.scope.independentHumanApproved!==0 ||
         audit.scope.emojiComprehensionApproved!==0 ||
         audit.scope.proposedExpressionCount!==897 ||
         audit.records.length!==audit.scope.proposedExpressionCount ||
         audit.records.some(x=>data.characters[x.rank-1]?.character!==x.character))
        throw new Error("Inconsistent strict-term audit provenance");
      const grouped=new Map();
      for(const row of audit.records){
        if(!grouped.has(row.rank))grouped.set(row.rank,[]);
        grouped.get(row.rank).push(row);
      }
      if(audit.summary.wholeTermMatched!==audit.records.filter(x=>x.wholeTermMatch).length ||
         audit.summary.requiresSenseReview!==audit.records.filter(x=>!x.wholeTermMatch).length ||
         audit.summary.substringOnlyFalsePositives!==audit.records.filter(x=>x.legacySubstringMatch&&!x.wholeTermMatch).length)
        throw new Error("Strict-term audit totals disagree with records");
      strictRows=grouped;
      strictSummary=audit.summary;
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
      bindResearchProgress(lexical.metrics,audit);
      bindVisibilityProgress(visibility.summary);
      render();
    }catch(error) {
      status.textContent="Unable to load the semantic evidence. Check the published data or deployment.";
    }
  }
  load();
})();
