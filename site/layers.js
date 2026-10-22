/* Shared site-wide character layer settings and glyph presenter.
   Identity, Pinyin and tone remain independent of experimental meanings. */
(() => {
  "use strict";
  const version = "v1";
  const permitted = new Set(["off", "direct", "marker"]);
  const channels = ["component", "reading", "tone"];
  const storageKey = channel => "chromalect-layer-" + version + "-" + channel;
  const defaults = Object.freeze({component:"direct", reading:"direct", tone:"direct"});
  function chosen(channel) {
    let saved = null;
    try { saved = localStorage.getItem(storageKey(channel)); }
    catch (_) { /* Local defaults still work without browser storage. */ }
    return permitted.has(saved) ? saved : defaults[channel];
  }
  function save(channel, mode) {
    if (!channels.includes(channel) || !permitted.has(mode)) return;
    try { localStorage.setItem(storageKey(channel), mode); }
    catch (_) { /* Ephemeral controls remain functional. */ }
  }
  function make(tag, className, value) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (value !== undefined) el.textContent = value;
    return el;
  }
  function makeControls(target) {
    const section = make("section", "controls");
    section.setAttribute("aria-label", "Visual layer settings");
    section.appendChild(make("h2", null, "Independent character presentation channels"));
    const grid = make("div", "layers");
    const settings = [
      ["component","Component identity","Direct colors source-aligned strokes; Marker shows component dots."],
      ["reading","Initial + final","Citation Pinyin colors appear as glyph edges or a text marker."],
      ["tone","Tone","Citation tone appears as a top edge or a labeled marker."]
    ];
    for (const [channel, label, note] of settings) {
      const group=make("fieldset","layer");
      group.appendChild(make("legend",null,label));
      const choices=make("div","choices");
      for (const mode of ["off","direct","marker"]) {
        const option=make("label");
        const radio=make("input");
        radio.type="radio";
        radio.id=channel+"-"+mode;
        radio.name=channel;
        radio.value=mode;
        radio.checked=mode==="direct";
        option.append(radio,make("span",null,mode[0].toUpperCase()+mode.slice(1)));
        choices.appendChild(option);
      }
      group.appendChild(choices);
      group.appendChild(make("small","layer-note",note));
      grid.appendChild(group);
    }
    section.appendChild(grid);
    section.appendChild(make("div","legend",
      "Saved across character views. All three channels initially use Direct; change each independently. Source-aligned glyph artwork remains provisional."));
    target.replaceChildren(section);
    return section;
  }
  function install() {
    // The authored atlas has controls already; interactive data browsers use a target.
    const controls = document.querySelector(".controls") ||
      (document.querySelector("[data-character-layer-controls]") &&
       makeControls(document.querySelector("[data-character-layer-controls]")));
    if (!controls) return;
    for (const channel of channels) {
      const inputs=[...controls.querySelectorAll('input[type="radio"]')]
        .filter(input=>input.name===channel && permitted.has(input.value));
      if (inputs.length!==3) continue;
      const selected=chosen(channel);
      const match=inputs.find(input=>input.value===selected && !input.disabled);
      if (match) for (const input of inputs) input.checked=(input===match);
      for (const input of inputs) {
        input.addEventListener("change",()=>{
          if (input.checked && !input.disabled) save(channel,input.value);
        });
      }
    }
  }

  function createGlyph(row) {
    if (!row || !row.character || !Array.isArray(row.component_instances) ||
        !Array.isArray(row.citation_readings) || !row.citation_readings.length) {
      throw new TypeError("Source-aligned Mandarin character profile required");
    }
    const componentColors = [];
    const markers = make("div","comp-markers");
    markers.setAttribute("aria-label","Component color markers");
    const ids = new Set();
    for (const item of row.component_instances) {
      const id=item.component_id+":"+item.form;
      if(ids.has(id)) continue;
      ids.add(id);
      componentColors.push(item.color);
      const dot=make("span","mini");
      dot.style.setProperty("--color",item.color);
      dot.title=item.form+" · "+item.component_id;
      markers.appendChild(dot);
    }
    const reading=row.citation_readings[0];
    const wrap=make("div","glyph-wrap");
    const colors=componentColors.length?componentColors:["var(--stripe-fallback)"];
    const parts=colors.map((color,i)=>
      color+" "+(i*100/colors.length).toFixed(2)+"% "+((i+1)*100/colors.length).toFixed(2)+"%").join(",");
    wrap.style.setProperty("--parts-gradient","linear-gradient(90deg,"+parts+")");
    wrap.style.setProperty("--onset-color",reading.initial.hex);
    wrap.style.setProperty("--rime-color",reading.final.hex);
    wrap.style.setProperty("--tone-color",reading.tone.hex);
    wrap.appendChild(markers);
    const glyph=make("span","glyph",row.character);
    glyph.lang="zh-Hans";
    const asset=row.geometry && row.geometry.svg;
    if (row.geometry && row.geometry.status==="source_aligned_visual_review_pending" &&
        typeof asset==="string" && /^glyphs\/U\+[0-9A-F]+\.svg$/.test(asset)) {
      glyph.classList.add("glyph-with-strokes");
      const picture=make("img","stroke-svg");
      picture.src=new URL(asset, new URL("./", document.querySelector('script[src$="layers.js"]').src)).href;
      picture.alt="";
      picture.loading="lazy";
      picture.setAttribute("aria-hidden","true");
      glyph.appendChild(picture);
    }
    wrap.appendChild(glyph);
    const pronunciation=make("div","phonetics-marker");
    pronunciation.setAttribute("aria-label","Pinyin "+reading.display);
    pronunciation.append(make("span","onset",reading.initial.token),
      make("span","rime",reading.final.token));
    wrap.appendChild(pronunciation);
    const tone=make("span","tone-marker",reading.tone.symbol);
    tone.setAttribute("aria-label","Tone "+reading.tone.category);
    wrap.appendChild(tone);
    return wrap;
  }
  globalThis.ChromalectLayers=Object.freeze({defaults,createGlyph,chosen});
  if (document.readyState==="loading") document.addEventListener("DOMContentLoaded",install,{once:true});
  else install();
})();
