#!/usr/bin/env python3
"""Activate vetted Mandarin alternate cuts coherently in a GENERATED site build.

The committed original catalog and HTML remain untouched. This script changes
only the CI working tree after a separately verified AnimCJK ZhHans comparison.
It updates both source-catalog presentation data and Direct/Marker card HTML,
so there is never an active vector glyph using incompatible marker identities.
"""
import argparse
from collections import Counter
from html import escape
import json
from pathlib import Path
import re

OPS = {"⿰":2,"⿱":2,"⿴":2,"⿵":2,"⿶":2,"⿷":2,"⿸":2,
       "⿹":2,"⿺":2,"⿻":2,"⿲":3,"⿳":3}

def fail(reason):
    raise ValueError(reason)

def leaves(ids):
    chars = iter(ids)
    out = []
    def parse(path, depth=0):
        if depth > 12: fail("IDS nesting too deep")
        try: ch = next(chars)
        except StopIteration: fail("truncated IDS structure")
        if ch in OPS:
            for i in range(OPS[ch]):
                parse(path + str(i),depth + 1)
        else:
            if not ch.strip() or ch in ":.;~" or ch.isdigit():
                fail("invalid component form in IDS")
            out.append((ch,path))
    parse("")
    try:
        next(chars)
        fail("unparsed IDS tokens")
    except StopIteration:
        pass
    if len(out) < 2 or len(out) > 8:
        fail("alternate must be multicomponent")
    return out

def original_alternatives(catalog):
    out = set()
    for token in catalog.split(";")[1:]:
        expression = token.split("(")[0].strip()
        if expression:
            out.add(expression)
    return out

def gradient(colors):
    n = len(colors)
    sections = []
    for i,color in enumerate(colors):
        sections.append(f"{color} {100*i/n:.2f}% {100*(i+1)/n:.2f}%")
    return "linear-gradient(90deg," + ",".join(sections) + ")"

def render_card(card, row, chosen, parts, palette):
    ch = row["character"]
    if card.count(f'<summary title="Inspect {escape(ch)}">') != 1:
        fail(f"{ch}: atlas card has missing/duplicate summary")
    ids = [p["id"] for p in parts]
    colors = [palette[id]["color"] for id in ids]
    card,count = re.subn(
        r'--parts-gradient:(?:linear-gradient\(90deg,[^;]*\)|#[0-9A-Fa-f]{6});',
        '--parts-gradient:' + gradient(colors) + ';',
        card,count=1)
    if count != 1: fail(f"{ch}: no component gradient")
    markers = '<div class="comp-markers" aria-label="Component color markers">' + ''.join(
        f'<span class="mini" style="--color:{color}" title="{escape(p["form"])}: {p["id"]}"></span>'
        for p,color in zip(parts,colors)) + '</div>'
    card,count = re.subn(r'<div class="comp-markers"[^>]*>.*?</div>',lambda _:markers,
                         card,count=1,flags=re.S)
    if count != 1: fail(f"{ch}: no marker region")
    chips = '<h3>Components · ' + str(len(parts)) + '</h3><div class="chiprow">' + ''.join(
        f'<span class="chip"><i class="swatch" style="--color:{color}"></i>{escape(p["form"])} <span class="hint">{p["id"]}</span></span>'
        for p,color in zip(parts,colors)) + '</div>'
    card,count = re.subn(r'<h3>Components · \d+</h3><div class="chiprow">.*?</div>',
                         lambda _:chips,card,count=1,flags=re.S)
    if count != 1: fail(f"{ch}: no source component chips")
    card,count = re.subn(r'(<h3>IDS analysis</h3><p class="mono">).*?(</p>)',
                         lambda m:m.group(1) + escape(chosen) + m.group(2),
                         card,count=1,flags=re.S)
    if count != 1: fail(f"{ch}: no source IDS annotation")
    msg = (f'Active component cut: attested alternate {escape(chosen)} from a pinned '
           f'simplified-Chinese geometry comparison; original source cut remains '
           'in the catalog provenance. Automated research candidate awaiting '
           'independent visual review.')
    card,count = re.subn(r'<div class="cap">.*?</div>',lambda _:'<div class="cap">Source-aligned alternative</div>',
                         card,count=1,flags=re.S)
    if count != 1: fail(f"{ch}: missing card status")
    needle = '<p class="hint">Glyph geometry: not available. The component colors are metadata, not interior stroke fills.</p>'
    if card.count(needle) != 1: fail(f"{ch}: unexpected glyph card layout")
    card=card.replace(needle,'<p class="hint">' + msg + '</p>' + needle)
    return card

def promote(candidates, catalog, palette, pages):
    if candidates["schema"] != "chromalect.hanzivg-source-transfer.v1":
        fail("unsupported candidate source")
    review = candidates.get("catalog_alternative_review_candidates",[])
    if candidates.get("catalog_alternative_review_count") != len(review):
        fail("alternate review count mismatch")
    catalog_rows = {row["character"]:row for row in catalog["characters"]}
    palette_ids = {item["id"]: item for item in palette["components"]}
    changes = []
    active = {row["character"] for row in candidates["candidates"]}
    for entry in review:
        ch = entry["character"]
        if ch in active or ch not in catalog_rows or entry["ownership_provider"] != "animcjk_zhhans":
            fail(f"{ch}: unsupported or duplicate source cut")
        row = catalog_rows[ch]
        alt = entry.get("source_selected_catalog_alternative")
        unparsed = entry.get("source_selected_catalog_cut")
        if bool(alt) == bool(unparsed):
            fail(f"{ch}: missing or ambiguous source selection method")
        chosen = alt or unparsed
        if alt and chosen not in original_alternatives(row["ids_primary"]):
            fail(f"{ch}: source cut not declared in catalog")
        if unparsed:
            pinned = {("包","⿹勹巳"):"nonstandard_ids_not_parsed",
                      ("岛","⿱鸟山"):"nonstandard_ids_not_parsed",
                      ("刨","⿰⿹勹巳刂"):"partial_components",
                      ("抱","⿰扌⿹勹巳"):"partial_components",
                      ("罕","⿱⿵冖八干"):"partial_components",
                      ("充","⿱⿱亠厶儿"):"non_disjoint_structure",
                      ("弃","⿱⿱亠厶廾"):"non_disjoint_structure",
                      **{(ch,cut):"partial_components" for ch,cut in [
                          ("亏","⿱二㇉"),("以","⿲𠄌丶人"),
                          ("似","⿰亻⿲𠄌丶人"),("拟","⿰扌⿲𠄌丶人"),
                          ("余","⿱⿱人一朩"),("杀","⿱㐅朩"),
                          ("杂","⿱九朩"),("条","⿱夂朩"),
                          ("夸","⿱大⿱二㇉"),("污","⿰氵⿱二㇉")
                      ]},
                      **{(ch,cut):"resolved_structural_membership" for ch,cut in [
                          ("礼","⿰礻乚"),("社","⿰礻土"),("祀","⿰礻巳"),
                          ("寻","⿱彐寸"),("当","⿱⺌彐"),("扫","⿰扌彐"),
                          ("帅","⿰刂巾"),("师","⿰刂⿱一巾"),("归","⿰刂彐"),
                          ("爷","⿱父卩"),("节","⿱艹卩"),("北","⿰丬匕"),
                          ("在","⿱才土"),("即","⿰艮卩"),
                          ("关","⿱丷天"),("坚","⿱⿲丨丨又土"),
                          ("尧","⿱⿻一乂兀"),("并","⿱丷开"),
                          ("区","⿷匸㐅"),("呕","⿰口⿷匸㐅"),
                          ("岖","⿰山⿷匸㐅"),("抠","⿰扌⿷匸㐅"),
                          ("驱","⿰马⿷匸㐅")
                      ]}}
            status = pinned.get((ch,chosen))
            if not status or row.get("structural_status")!=status:
                fail(f"{ch}: source reinterpretation is not a pinned incomplete-catalog case")
            if status=="partial_components":
                missing = {
                    "罕":"㓁","刨":"包","抱":"包",
                    "亏":"㇉","以":"𠄌","似":"𠄌","拟":"𠄌",
                    "夸":"㇉","污":"㇉","余":"亅",
                    "杀":"亅","杂":"亅","条":"亅"
                }
                if ch not in missing or {item["form"] for item in row.get("missing_components",[])}!={missing[ch]}:
                    fail(f"{ch}: source-selected cut has unsupported missing-catalog provenance")
            elif status=="nonstandard_ids_not_parsed":
                if row.get("component_instances"):
                    fail(f"{ch}: unparsed source had unexpected selected components")
            elif not row.get("component_instances"):
                fail(f"{ch}: resolved original source was missing component identities")
        cut = leaves(chosen)
        parts = []
        for form,path in cut:
            ids = [item["id"] for item in palette["components"] if item["shape"] == form]
            if len(ids) != 1:
                fail(f"{ch}: alternate component has zero/multiple palette identities")
            parts.append({"form":form,"path":path,"id":ids[0]})
        if Counter((p["form"],p["id"]) for p in parts) != Counter(
                (p["form"],p["component_id"]) for p in entry["parts"]):
            fail(f"{ch}: evidence component inventory disagrees with active cut")
        expected_ids = {part["id"] for part in parts}
        if {stroke["component_id"] for stroke in entry["strokes"]} != expected_ids:
            fail(f"{ch}: incomplete source path ownership")
        rank=row["rank"]
        start=((rank-1)//100)*100+1
        page=f"site/characters/{start:04}-{start+99:04}.html"
        text=pages[page]
        opening=f'<details class="tile" id="c{rank:04}"'
        at=text.find(opening)
        if at<0: fail(f"{ch}: source HTML card absent")
        ending=text.find("</details>",at)
        if ending<0: fail(f"{ch}: source HTML card incomplete")
        ending+=len("</details>")
        replacement=render_card(text[at:ending],row,chosen,parts,palette_ids)
        pages[page]=text[:at]+replacement+text[ending:]
        original=row["ids_primary"]
        row["source_original_ids_primary"]=original
        row["source_original_component_instances"]=row["component_instances"]
        row["source_original_component_ids"]=row["component_ids"]
        if alt:
            row["source_selected_catalog_alternative"]=chosen
        else:
            row["source_selected_catalog_cut"]=chosen
        row["ids_primary"]=chosen + "(AnimCJK source-aligned);" + original
        row["component_instances"]=parts
        row["component_ids"]=list(dict.fromkeys(p["id"] for p in parts))
        forms={p["form"] for p in parts}
        radicals=list(zip(row.get("modern_radical_forms",[]),
                          row.get("modern_radical_participation",[])))
        row["source_original_radical_participation"]=radicals
        pairs=[(a,b) for a,b in radicals if a in forms]
        row["modern_radical_forms"]=[a for a,b in pairs]
        row["modern_radical_participation"]=[b for a,b in pairs]
        row["annotation_note"]="Pinned AnimCJK simplified-Chinese source-selected alternate; original catalog cut retained as source_original_*; independent visual review pending."
        row["glyph_coloring_status"]="source_aligned_candidate_pending_visual_review"
        changes.append({"character":ch,"rank":rank,"active_cut":chosen,
                        "selection_method":"documented_alternative" if alt else "unparsed_source_reinterpretation",
                        "original_primary":original.split(";")[0],"component_ids":row["component_ids"]})
        candidates["candidates"].append(entry)
        active.add(ch)
    candidates["accepted_count"]=len(candidates["candidates"])
    candidates["animcjk_admitted_count"]=sum(
        x["ownership_provider"]=="animcjk_zhhans" for x in candidates["candidates"])
    candidates["catalog_alternative_review_candidates"]=[]
    candidates["catalog_alternative_review_count"]=0
    candidates["active_catalog_alt_count"]=len(changes)
    return changes

def self_test():
    assert leaves("⿰女彐")==[("女","0"),("彐","1")]
    assert leaves("⿰⿻刀二阝")==[("刀","00"),("二","01"),("阝","1")]
    assert gradient(["#123456","#abcdef"])=="linear-gradient(90deg,#123456 0.00% 50.00%,#abcdef 50.00% 100.00%)"
    try:
        leaves("⿰女彐口")
        fail("accepted unexpected extra IDS component")
    except ValueError:
        pass
    print("Active catalog cut alignment parser self-tests passed")

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--candidates")
    ap.add_argument("--catalog")
    ap.add_argument("--palette")
    ap.add_argument("--summary")
    ap.add_argument("--self-test",action="store_true")
    args=ap.parse_args()
    if args.self_test:
        self_test()
        return
    required=(args.candidates,args.catalog,args.palette,args.summary)
    if any(not a for a in required):fail("required generated catalog and candidate files missing")
    candidates=json.loads(Path(args.candidates).read_text())
    catalog=json.loads(Path(args.catalog).read_text())
    palette=json.loads(Path(args.palette).read_text())
    page_files={str(p):p.read_text() for p in Path("site/characters").glob("[0-9]*-[0-9]*.html")}
    changes=promote(candidates,catalog,palette,page_files)
    required = set("妇延廷有灰灵肖那包岛")
    optional = set("刨抱罕礼社祀寻当扫帅师归爷节北在即关坚尧并杀杂条充弃亏以似拟余区匹医呕岖抠驱夸污")
    chosen = {item["character"] for item in changes}
    if not required <= chosen or not chosen <= required | optional:
        fail("pinned source change set contains missing baseline or unauthorized Mandarin cuts")
    for path,html in page_files.items():
        Path(path).write_text(html)
    Path(args.catalog).write_text(json.dumps(catalog,ensure_ascii=False,indent=2)+"\n")
    Path(args.candidates).write_text(json.dumps(candidates,ensure_ascii=False,indent=2)+"\n")
    Path(args.summary).write_text(json.dumps({
        "schema":"chromalect.active-mandarin-catalog-cut.v1",
        "status":"source-aligned_automated_pending_independent_visual_review",
        "source":"AnimCJK ZhHans; original catalog primary preserved",
        "count":len(changes),"selected":changes
    },ensure_ascii=False,indent=2)+"\n")
    print("Applied source-selected Mandarin catalog cuts:", "".join(row["character"] for row in changes))

if __name__=="__main__":
    main()
