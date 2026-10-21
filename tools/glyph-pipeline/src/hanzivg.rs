use super::*;
use serde_json::{json, Value};
use std::collections::{HashMap, HashSet};

const SCHEMA: &str = "chromalect.hanzivg-source-transfer.v1";
const REVISION: &str = "55ecef6a881d5120cd261587d668e1b6af843ec2";
const KANJIVG_REVISION: &str = "70a0b7ae0c18ceb5cb358274b029cce0234a43bc";
const ANIMCJK_REVISION: &str = "3e1253b341cc7be14c3540bb3c045e6163557777";

/// Only accept independently grouped Chinese HanziVG ownership when the
/// importer has matched EVERY indexed path to the pinned Make Me a Hanzi
/// geometry, and the catalog's *selected* component-instance multiset.
pub(super) fn import(
    candidates_path: &Path,
    graphics_path: &Path,
    already: &[Glyph],
    target: &Path,
) -> Result<Vec<Glyph>, String> {
    let source = load(candidates_path)?;
    if string(&source, "schema")? != SCHEMA
        || string(&source, "ownership_revision")? != REVISION
        || string(&source, "comparative_ownership_revision")? != KANJIVG_REVISION
        || string(&source, "animcjk_revision")? != ANIMCJK_REVISION
        || string(&source, "status")? != "automated_candidates_pending_independent_review"
    {
        return Err("HanziVG transfer provenance or schema not pinned".into());
    }
    let review = entries(&source, "catalog_alternative_review_candidates")?;
    if source["catalog_alternative_review_count"].as_u64() != Some(review.len() as u64) {
        return Err("documented catalog alternative review count mismatch".into());
    }
    let live_chars: HashSet<&str> = entries(&source,"candidates")?.iter()
        .map(|item|string(item,"character"))
        .collect::<Result<_,_>>()?;
    let mut review_chars = HashSet::new();
    for item in review {
        let ch = string(item,"character")?;
        let alt = string(item,"source_selected_catalog_alternative")?;
        if alt.is_empty() || live_chars.contains(ch) || !review_chars.insert(ch.to_owned()) {
            return Err(format!("{ch}: alternative cut incorrectly admitted or duplicated"));
        }
    }
    let review_report = json!({
        "schema":"chromalect.catalog-alternative-review.v1",
        "status":"not_in_live_mandarin_direct_or_marker_coverage",
        "source":"AnimCJK ZhHans pinned structural comparison",
        "source_revision":ANIMCJK_REVISION,
        "count":review.len(),
        "candidates":review,
        "note":"Documented source alternatives are kept separate because their component IDs do not agree with selected catalog Direct/Marker identities. Stroke outlines are evidence-only, not certified."
    });
    fs::create_dir_all(target).map_err(|e|e.to_string())?;
    fs::write(target.join("catalog-alternative-source-review.json"),
        format!("{}\n",serde_json::to_string_pretty(&review_report).map_err(|e|e.to_string())?))
        .map_err(|e|e.to_string())?;
    let accepted = entries(&source, "candidates")?;
    if source["accepted_count"].as_u64() != Some(accepted.len() as u64) {
        return Err("HanziVG candidate count mismatch".into());
    }
    let catalog = load(&root().join("data/catalog/characters-0001-1000.json"))?;
    let catalog_map = entries(&catalog, "characters")?.iter().map(|item| {
        Ok((string(item, "character")?.to_owned(), item))
    }).collect::<Result<HashMap<_, _>, String>>()?;
    let palette = load(&root().join("palettes/mandarin-component-identity-v0.5.json"))?;
    let colors = entries(&palette, "components")?.iter().map(|item| {
        Ok((string(item, "id")?.to_owned(),
            (string(item, "shape")?.to_owned(), string(item, "color")?.to_owned())))
    }).collect::<Result<HashMap<_, _>, String>>()?;
    let active: HashSet<&str> = already.iter().map(|g| g.character.as_str()).collect();
    let animcjk_admitted = accepted.iter().filter(|v|v["ownership_provider"] == "animcjk_zhhans").count();
    if source.get("animcjk_admitted_count").and_then(Value::as_u64)
        != Some(animcjk_admitted as u64)
    {
        return Err("AnimCJK candidate count differs from provenance".into());
    }
    let mut accepted_chars = HashSet::new();
    let mut wanted = HashSet::new();
    for row in accepted {
        let ch = string(row, "character")?;
        if !accepted_chars.insert(ch.to_owned()) {
            return Err(format!("duplicate HanziVG candidate {ch}"));
        }
        if !active.contains(ch) {
            wanted.insert(ch.to_owned());
        }
    }
    let mut geometry = HashMap::new();
    super::discover::source_records(graphics_path, |record| {
        let Some(ch) = record.get("character").and_then(Value::as_str).map(str::to_owned) else { return Ok(()); };
        if wanted.contains(&ch) && geometry.insert(ch.clone(), record).is_some() {
            return Err(format!("duplicate pinned outline record {ch}"));
        }
        Ok(())
    })?;
    let mut output = Vec::new();
    let mut records = Vec::new();
    for row in accepted {
        let ch = string(row, "character")?;
        if active.contains(ch) { continue; }
        if ch.chars().count() != 1 { return Err("HanziVG record not one Unicode character".into()); }
        let selected = catalog_map.get(ch)
            .ok_or_else(||format!("HanziVG candidate {ch} missing from first 1000"))?;
        let catalog_ids = string(selected, "ids_primary")?;
        let primary = catalog_ids.split(';').next().unwrap_or("")
            .split('(').next().unwrap_or("").trim();
        let documented_alternative = row.get("source_selected_catalog_alternative")
            .and_then(Value::as_str);
        let explicit_source_cut = row.get("source_selected_catalog_cut")
            .and_then(Value::as_str);
        if documented_alternative.is_some() && explicit_source_cut.is_some() {
            return Err(format!("{ch}: conflicting source-selected cut definitions"));
        }
        let chosen_decomposition = documented_alternative.or(explicit_source_cut).unwrap_or(primary);
        if string(row, "decomposition")? != chosen_decomposition {
            return Err(format!("{ch}: decomposition does not match selected catalog source cut"));
        }
        if let Some(expr) = documented_alternative {
            // During generated-site publication, the vetted cut is activated
            // as the catalog's effective primary. Its original source entry
            // must still prove it was an explicitly documented alternative.
            let original = selected.get("source_original_ids_primary")
                .and_then(Value::as_str).unwrap_or(catalog_ids);
            if !original.split(';').skip(1)
                .any(|entry| entry.split('(').next().unwrap_or("").trim() == expr)
                || expr != primary
                || selected.get("source_selected_catalog_alternative")
                    .and_then(Value::as_str) != Some(expr) {
                return Err(format!("{ch}: source cut is not a synchronized, documented catalog alternative"));
            }
        }
        if let Some(expr) = explicit_source_cut {
            let expected_status = match (ch,expr) {
                ("包","⿹勹巳")|("岛","⿱鸟山") => "nonstandard_ids_not_parsed",
                ("刨","⿰⿹勹巳刂")|("抱","⿰扌⿹勹巳")|("罕","⿱⿵冖八干") => "partial_components",
                ("充","⿱⿱亠厶儿")|("弃","⿱⿱亠厶廾") => "non_disjoint_structure",
                ("亏","⿱二㇉")|("以","⿲𠄌丶人")
                |("似","⿰亻⿲𠄌丶人")|("拟","⿰扌⿲𠄌丶人")
                |("余","⿱⿱人一朩")|("杀","⿱㐅朩")
                |("杂","⿱九朩")|("条","⿱夂朩")
                |("夸","⿱大⿱二㇉")|("污","⿰氵⿱二㇉")
                    => "partial_components",
                ("礼","⿰礻乚")|("社","⿰礻土")|("祀","⿰礻巳")
                |("寻","⿱彐寸")|("当","⿱⺌彐")|("扫","⿰扌彐")
                |("帅","⿰刂巾")|("师","⿰刂⿱一巾")|("归","⿰刂彐")
                |("爷","⿱父卩")|("节","⿱艹卩")|("北","⿰丬匕")
                |("在","⿱才土")|("即","⿰艮卩")
                |("关","⿱丷天")|("坚","⿱⿲丨丨又土")
                |("尧","⿱⿻一乂兀")|("并","⿱丷开")
                |("区","⿷匸㐅")|("呕","⿰口⿷匸㐅")
                |("岖","⿰山⿷匸㐅")|("抠","⿰扌⿷匸㐅")
                |("驱","⿰马⿷匸㐅") => "resolved_structural_membership",
                _ => return Err(format!("{ch}: source-only Mandarin cut is not authorized")),
            };
            if string(selected,"structural_status")?!=expected_status
                || selected.get("source_selected_catalog_cut").and_then(Value::as_str)!=Some(expr)
                || primary!=expr
                || selected.get("source_original_ids_primary").and_then(Value::as_str)
                    .is_none_or(|original| original==catalog_ids)
            {
                return Err(format!("{ch}: unsupported or unrecorded original Mandarin source cut"));
            }
        }
        let provider = string(row, "ownership_provider")?;
        let (source_prefix, pinned_revision) = match provider {
            "hanzivg" => ("hanzi", REVISION),
            "kanjivg_comparison" => ("kanji", KANJIVG_REVISION),
            "animcjk_zhhans" => ("svgsZhHans", ANIMCJK_REVISION),
            _ => return Err(format!("{ch}: unknown ownership comparison provider"))
        };
        let number = if provider == "animcjk_zhhans" {
            (ch.chars().next().unwrap() as u32).to_string()
        } else {
            format!("{:05x}", ch.chars().next().unwrap() as u32)
        };
        let svg_name = format!("{source_prefix}/{number}.svg");
        if string(row, "ownership_svg")? != svg_name
            || string(row, "ownership_revision")? != pinned_revision
        {
            return Err(format!("{ch}: unpinned or mismatched source SVG name/revision"));
        }
        let ownership_method = string(row, "ownership_method")?;
        if ownership_method != "explicit_source_groups"
            && ownership_method != "single_root_residual_catalog_component"
            && ownership_method != "explicit_animcjk_component_stroke_counts"
            && ownership_method != "animcjk_verified_nested_component_derivation"
            && ownership_method != "animcjk_source_variant_alignment"
            && ownership_method != "animcjk_geometrically_verified_form_substitution"
        {
            return Err(format!("{ch}: unknown source component ownership method"));
        }
        if ownership_method == "animcjk_verified_nested_component_derivation" {
            if provider != "animcjk_zhhans" || entries(row, "subglyph_witnesses")?.is_empty() {
                return Err(format!("{ch}: unverified nested source derivation"));
            }
            for witness in entries(row,"subglyph_witnesses")? {
                let start = get(witness, "start")?.as_u64()
                    .ok_or_else(||format!("{ch}: invalid donor span start"))? as usize;
                let count = get(witness, "count")?.as_u64()
                    .ok_or_else(||format!("{ch}: invalid donor stroke count"))? as usize;
                let source_form = string(witness, "component")?;
                if source_form.chars().count() != 1 || count < 2
                    || start.checked_add(count).is_none_or(|end|end > row["stroke_count"].as_u64().unwrap_or(0) as usize)
                {
                    return Err(format!("{ch}: donor witness span out of range"));
                }
                let donor_method = string(witness,"geometry_match_method")?;
                if donor_method == "contextual_scale_deformation_verified" {
                    // Exception applies only to two individually measured
                    // Chinese components compressed by their parent glyph.
                    // Full source component ownership and original path
                    // bijection must still pass the ordinary glyph checks.
                    let (max_mean,max_center,max_size) = match (ch,source_form) {
                        ("克","古") => (0.090,0.180,0.350),
                        ("夸","亏") => (0.070,0.100,0.265),
                        _ => return Err(format!("{ch}: undocumented contextual donor shape change")),
                    };
                    if witness.get("indices").is_some() {
                        return Err(format!("{ch}: contextual donor cannot reorder stroke indexes"));
                    }
                    let metrics=get(witness,"contextual_geometry_metrics")?;
                    let limits=get(witness,"contextual_geometry_limits")?;
                    for (key,limit) in [
                        ("mean_error_unbounded",max_mean),
                        ("maximum_center_displacement",max_center),
                        ("maximum_relative_size_difference",max_size)
                    ] {
                        let score=get(metrics,key)?.as_f64()
                            .ok_or_else(||format!("{ch}: missing measured contextual geometry {key}"))?;
                        if !score.is_finite() || !(0.0..=limit).contains(&score) {
                            return Err(format!("{ch}: contextual donor geometry {key} exceeds individual gate"));
                        }
                    }
                    for (key,expected) in [
                        ("mean",max_mean),("center",max_center),("size",max_size)
                    ] {
                        if get(limits,key)?.as_f64()!=Some(expected) {
                            return Err(format!("{ch}: contextual donor gate parameters were altered"));
                        }
                    }
                    let rounded_mean=get(metrics,"mean_error_unbounded")?.as_f64()
                        .ok_or_else(||format!("{ch}: no contextual mean"))?;
                    let witnessed_mean=get(witness,"mean_geometry_error")?.as_f64()
                        .ok_or_else(||format!("{ch}: no witnessed mean"))?;
                    if (rounded_mean-witnessed_mean).abs()>0.00001 {
                        return Err(format!("{ch}: contextual geometry mean and witness disagree"));
                    }
                } else if donor_method != "same_stroke_index_geometry"
                    && donor_method != "unique_donor_stroke_geometry_bijection" {
                    return Err(format!("{ch}: unsupported donor alignment methodology"));
                }
                if let Some(raw_indices) = witness.get("indices") {
                    let indices=raw_indices.as_array()
                        .ok_or_else(||format!("{ch}: indexed donor positions are not an array"))?;
                    let indexes=indices.iter().map(|v|v.as_u64().map(|n|n as usize)
                        .ok_or_else(||format!("{ch}: invalid indexed donor path")))
                        .collect::<Result<Vec<_>,String>>()?;
                    if ch!="成" || source_form!="戊" || start!=0 || count!=5
                        || indexes != vec![0,1,3,4,5] {
                        return Err(format!("{ch}: indexed donor is not the pinned noncontiguous 戊 source"));
                    }
                    let strokes=entries(row,"strokes")?;
                    if strokes.len()!=6 || strokes.iter().enumerate().any(|(i,stroke)|
                        stroke.get("component_id").and_then(Value::as_str)
                            != Some(if i==2 {"cmp-0175"} else {"cmp-0399"})) {
                        return Err(format!("{ch}: interleaved 戊 source paths have wrong palette ownership"));
                    }
                }
                let expected = format!("svgsZhHans/{}.svg", source_form.chars().next().unwrap() as u32);
                if string(witness,"source_svg")? != expected
                    || get(witness,"mean_geometry_error")?.as_f64()
                        .is_none_or(|v|!v.is_finite()||!(0.0..=0.095).contains(&v))
                {
                    return Err(format!("{ch}: donor witness geometry gate failed"));
                }
            }
        }
        // A single attested source-only form may correspond to the catalog's
        // already-chosen 人 identity. Never merge two distinct v0.4 identities.
        let source_variants: &[Value] = row.get("source_variant_witnesses")
            .and_then(Value::as_array).map(Vec::as_slice).unwrap_or(&[]);
        if ownership_method == "animcjk_source_variant_alignment" && source_variants.is_empty() {
            return Err(format!("{ch}: variant method without evidence"));
        }
        for variant in source_variants {
            if provider != "animcjk_zhhans" || string(variant, "source_form")? != "𠆢"
                || string(variant, "selected_form")? != "人"
                || string(variant, "evidence")?
                    != "https://ctext.org/dictionary.pl?char=%E4%BA%BA&if=en"
                || get(variant,"count")?.as_u64() != Some(2)
            {
                return Err(format!("{ch}: unsupported source form identity correspondence"));
            }
            let start = get(variant, "start")?.as_u64()
                .ok_or_else(||format!("{ch}: malformed variant span"))? as usize;
            if start.checked_add(2).is_none_or(|end| end > row["stroke_count"].as_u64().unwrap_or(0) as usize) {
                return Err(format!("{ch}: variant span outside glyph"));
            }
            if colors.values().any(|(shape,_)|shape=="𠆢") {
                return Err(format!("{ch}: source-only form is independently registered in active v0.5"));
            }
            if !entries(row,"strokes")?.iter().skip(start).take(2).all(|path|
                path.get("component_id").and_then(Value::as_str) == Some("cmp-0012")
            ) {
                return Err(format!("{ch}: source variant not assigned to selected 人 identity"));
            }
        }
        let substitutions: &[Value] = row.get("form_substitution_witnesses")
            .and_then(Value::as_array).map(Vec::as_slice).unwrap_or(&[]);
        if ownership_method == "animcjk_geometrically_verified_form_substitution"
            && substitutions.len() != 1 {
            return Err(format!("{ch}: form reconciliation requires precisely one independent shape witness"));
        }
        if !substitutions.is_empty() && ownership_method != "animcjk_geometrically_verified_form_substitution" {
            return Err(format!("{ch}: unexpected source/catalog shape substitution"));
        }
        for witness in substitutions {
            if provider != "animcjk_zhhans" {
                return Err(format!("{ch}: external source form comparison not Chinese"));
            }
            let source_form = string(witness, "source_form")?;
            let selected_form = string(witness, "selected_form")?;
            if source_form.chars().count() != 1 || selected_form.chars().count() != 1
                || source_form == selected_form {
                return Err(format!("{ch}: invalid form equivalence identity"));
            }
            let start = get(witness,"start")?.as_u64()
                .ok_or_else(||format!("{ch}: invalid form comparison start"))? as usize;
            let count = get(witness,"count")?.as_u64()
                .ok_or_else(||format!("{ch}: invalid form comparison count"))? as usize;
            if count < 2 || start.checked_add(count).is_none_or(|end|
                end > row["stroke_count"].as_u64().unwrap_or(0) as usize) {
                return Err(format!("{ch}: form comparison stroke span invalid"));
            }
            for (key,form) in [("source_svg",source_form),("selected_svg",selected_form)] {
                let expected = format!("svgsZhHans/{}.svg", form.chars().next().unwrap() as u32);
                if string(witness,key)? != expected {
                    return Err(format!("{ch}: unpinned form shape provenance"));
                }
            }
            for (key,max) in [("component_geometry_error",0.045),("parent_geometry_error",0.095)] {
                if get(witness,key)?.as_f64().is_none_or(|score|
                    !score.is_finite() || !(0.0..=max).contains(&score)) {
                    return Err(format!("{ch}: form-substitution shape agreement insufficient"));
                }
            }
            let selected_ids: Vec<&str> = entries(selected, "component_instances")?.iter()
                .filter(|item|item.get("form").and_then(Value::as_str)==Some(selected_form))
                .filter_map(|item|item.get("id").and_then(Value::as_str)).collect();
            if selected_ids.len()!=1 || !entries(row,"strokes")?.iter().skip(start).take(count)
                .all(|stroke|stroke.get("component_id").and_then(Value::as_str)==Some(selected_ids[0]))
            {
                return Err(format!("{ch}: compared source group is not owned by selected catalog identity"));
            }
        }
        let method = string(row, "geometry_match_method")?;
        if method != "same_stroke_index_geometry" && method != "unique_stroke_geometry_bijection" {
            return Err(format!("{ch}: unknown stroke geometry correspondence method"));
        }
        let error = get(row, "mean_geometry_error")?.as_f64()
            .ok_or_else(||format!("{ch}: no numeric geometry comparison"))?;
        let max_error = if provider == "kanjivg_comparison"
            || ownership_method == "single_root_residual_catalog_component" {
            0.045
        } else if provider == "animcjk_zhhans" {
            0.075
        } else { 0.105 };
        if !error.is_finite() || !(0.0..=max_error).contains(&error) {
            return Err(format!("{ch}: geometric correspondence gate failed"));
        }
        let mut parts = Vec::new();
        let mut present = Vec::new();
        for item in entries(row, "parts")? {
            let form = string(item, "form")?;
            let id = string(item, "component_id")?;
            let color = string(item, "color")?;
            if colors.get(id).map(|(f, c)| (f.as_str(),c.as_str()))
                != Some((form,color)) {
                return Err(format!("{ch}: unregistered component color/form {id}"));
            }
            present.push((form.to_owned(),id.to_owned()));
            parts.push((form.to_owned(),id.to_owned(),color.to_owned()));
        }
        let mut selected_parts = Vec::new();
        if let Some(expression) = documented_alternative {
            if provider != "animcjk_zhhans" {
                return Err(format!("{ch}: catalog alternates require simplified Chinese source verification"));
            }
            let shapes = discover::palette_shapes()?;
            let known: HashSet<String> = colors.keys().cloned().collect();
            let mut out = Vec::new();
            let mut cursor = 0usize;
            let mut path = Vec::new();
            let chars: Vec<char> = expression.chars().collect();
            if discover::parse_parts(&chars,&mut cursor,&mut path,&mut out,&known,&shapes).is_none()
                || cursor != chars.len() || !(2..=8).contains(&out.len())
            {
                return Err(format!("{ch}: catalog alternative contains unregistered component shape"));
            }
            for (_,form,id,_) in out {
                selected_parts.push((form,id));
            }
        } else {
            for item in entries(selected, "component_instances")? {
                selected_parts.push((string(item, "form")?.to_owned(),string(item, "id")?.to_owned()));
            }
        }
        present.sort();
        selected_parts.sort();
        if selected_parts.len() < 2 || present != selected_parts {
            return Err(format!("{ch}: grouped source components disagree with catalog instances"));
        }
        let source_geometry = geometry.get(ch)
            .and_then(|item|item.get("strokes")).and_then(Value::as_array)
            .ok_or_else(||format!("{ch}: pinned outline geometry unavailable"))?;
        let candidate_strokes = entries(row, "strokes")?;
        if source_geometry.is_empty() || source_geometry.len() != candidate_strokes.len()
            || row["stroke_count"].as_u64() != Some(candidate_strokes.len() as u64)
        {
            return Err(format!("{ch}: pinned path count disagreement"));
        }
        let permitted: HashSet<&str> = parts.iter().map(|(_,id,_)|id.as_str()).collect();
        let mut used = HashSet::new();
        let mut strokes = Vec::new();
        for (i, item) in candidate_strokes.iter().enumerate() {
            let path = string(item, "path")?;
            let id = string(item, "component_id")?;
            let color = string(item, "color")?;
            if source_geometry[i].as_str() != Some(path) || !valid_path(path)
                || !permitted.contains(id)
                || colors.get(id).map(|(_,c)|c.as_str()) != Some(color)
            {
                return Err(format!("{ch}: invalid pinned stroke ownership at path {i}"));
            }
            used.insert(id);
            strokes.push(Stroke { path: path.to_owned(), id: id.to_owned(), color: color.to_owned() });
        }
        if used != permitted {
            return Err(format!("{ch}: catalog component missing owned source path"));
        }
        records.push(json!({
            "character": ch, "ownership_svg": svg_name,
            "ownership_provider": provider, "ownership_revision": pinned_revision,
            "mean_geometry_error": error, "stroke_count": strokes.len(),
            "geometry_match_method": method,
            "ownership_method": ownership_method,
            "source_selected_catalog_alternative": documented_alternative,
            "source_selected_catalog_cut": explicit_source_cut,
            "source_variant_witnesses": row.get("source_variant_witnesses"),
            "subglyph_witnesses": row.get("subglyph_witnesses"),
            "form_substitution_witnesses": row.get("form_substitution_witnesses"),
            "review_status": "automated_geometry_and_group_match_pending_independent_review"
        }));
        output.push(Glyph {
            character: ch.to_owned(), decomposition: chosen_decomposition.to_owned(),
            parts, strokes, candidate: true,
        });
    }
    output.sort_by_key(|g|g.character.chars().next().unwrap() as u32);
    let summary = json!({
        "schema": "chromalect.hanzivg-admitted-transfers.v1",
        "ownership_provider": "HanziVG Chinese-reviewed structure and KanjiVG geometry-gated comparison",
        "ownership_revision": REVISION,
        "comparative_ownership_revision": KANJIVG_REVISION,
        "animcjk_revision": ANIMCJK_REVISION,
        "geometry_provider": "Make Me a Hanzi pinned outlines",
        "geometry_revision": discover::source_revision(),
        "license": "HanziVG/KanjiVG grouping CC BY-SA 3.0; AnimCJK Mandarin dictionary LGPL-3.0-or-later and SVG reference Arphic Public License; original Make Me a Hanzi rendered geometry retains the Arphic Public License",
        "count": output.len(),
        "characters": output.iter().map(|g|g.character.as_str()).collect::<Vec<_>>(),
        "records": records,
        "rejected_reasons": source.get("rejected_reasons"),
        "independently_visually_certified": false,
        "note": "Chinese-verified HanziVG groupings, geometry-gated KanjiVG comparisons, and independent AnimCJK simplified-Chinese component stroke counts have separate source and licensing records. Only Chinese Make Me a Hanzi geometry is rendered. All automated candidates await independent visual review."
    });
    fs::write(target.join("hanzivg-transfers.json"),
        format!("{}\n", serde_json::to_string_pretty(&summary).map_err(|e|e.to_string())?))
        .map_err(|e|e.to_string())?;
    println!("Admitted {} conservatively matched secondary structural candidates, including {} AnimCJK ZhHans.", output.len(), animcjk_admitted);
    Ok(output)
}
