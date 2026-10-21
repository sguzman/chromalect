use super::*;
use serde_json::{json, Value};
use std::collections::{HashMap, HashSet};

const SCHEMA: &str = "chromalect.hanzivg-source-transfer.v1";
const REVISION: &str = "55ecef6a881d5120cd261587d668e1b6af843ec2";
const KANJIVG_REVISION: &str = "70a0b7ae0c18ceb5cb358274b029cce0234a43bc";

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
        || string(&source, "status")? != "automated_candidates_pending_independent_review"
    {
        return Err("HanziVG transfer provenance or schema not pinned".into());
    }
    let accepted = entries(&source, "candidates")?;
    if source["accepted_count"].as_u64() != Some(accepted.len() as u64) {
        return Err("HanziVG candidate count mismatch".into());
    }
    let catalog = load(&root().join("data/catalog/characters-0001-1000.json"))?;
    let catalog_map = entries(&catalog, "characters")?.iter().map(|item| {
        Ok((string(item, "character")?.to_owned(), item))
    }).collect::<Result<HashMap<_, _>, String>>()?;
    let palette = load(&root().join("palettes/mandarin-component-identity-v0.4.json"))?;
    let colors = entries(&palette, "components")?.iter().map(|item| {
        Ok((string(item, "id")?.to_owned(),
            (string(item, "shape")?.to_owned(), string(item, "color")?.to_owned())))
    }).collect::<Result<HashMap<_, _>, String>>()?;
    let active: HashSet<&str> = already.iter().map(|g| g.character.as_str()).collect();
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
        let expected = string(selected, "ids_primary")?.split(';').next().unwrap_or("")
            .split('(').next().unwrap_or("").trim();
        if string(row, "decomposition")? != expected {
            return Err(format!("{ch}: source transfer does not match selected IDS"));
        }
        let provider = string(row, "ownership_provider")?;
        let (source_prefix, pinned_revision) = match provider {
            "hanzivg" => ("hanzi", REVISION),
            "kanjivg_comparison" => ("kanji", KANJIVG_REVISION),
            _ => return Err(format!("{ch}: unknown ownership comparison provider"))
        };
        let svg_name = format!("{source_prefix}/{:05x}.svg", ch.chars().next().unwrap() as u32);
        if string(row, "ownership_svg")? != svg_name
            || string(row, "ownership_revision")? != pinned_revision
        {
            return Err(format!("{ch}: unpinned or mismatched source SVG name/revision"));
        }
        let method = string(row, "geometry_match_method")?;
        if method != "same_stroke_index_geometry" && method != "unique_stroke_geometry_bijection" {
            return Err(format!("{ch}: unknown stroke geometry correspondence method"));
        }
        let error = get(row, "mean_geometry_error")?.as_f64()
            .ok_or_else(||format!("{ch}: no numeric geometry comparison"))?;
        let max_error = if provider == "kanjivg_comparison" { 0.045 } else { 0.105 };
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
        for item in entries(selected, "component_instances")? {
            selected_parts.push((string(item, "form")?.to_owned(),string(item, "id")?.to_owned()));
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
            "review_status": "automated_geometry_and_group_match_pending_independent_review"
        }));
        output.push(Glyph {
            character: ch.to_owned(), decomposition: expected.to_owned(),
            parts, strokes, candidate: true,
        });
    }
    output.sort_by_key(|g|g.character.chars().next().unwrap() as u32);
    let summary = json!({
        "schema": "chromalect.hanzivg-admitted-transfers.v1",
        "ownership_provider": "HanziVG Chinese-reviewed structure and KanjiVG geometry-gated comparison",
        "ownership_revision": REVISION,
        "comparative_ownership_revision": KANJIVG_REVISION,
        "geometry_provider": "Make Me a Hanzi pinned outlines",
        "geometry_revision": discover::source_revision(),
        "license": "HanziVG group metadata CC BY-SA 3.0; original Make Me a Hanzi vector geometry keeps its original source license",
        "count": output.len(),
        "characters": output.iter().map(|g|g.character.as_str()).collect::<Vec<_>>(),
        "records": records,
        "rejected_reasons": source.get("rejected_reasons"),
        "independently_visually_certified": false,
        "note": "HanziVG Chinese-verified grouping takes priority. A separate KanjiVG comparison is permitted only where catalog component groups match and the original Chinese Make Me a Hanzi outline geometry passes a stronger bound. No Japanese stroke artwork is rendered. All imported grouping data retain CC BY-SA attribution and are awaiting independent visual review."
    });
    fs::write(target.join("hanzivg-transfers.json"),
        format!("{}\n", serde_json::to_string_pretty(&summary).map_err(|e|e.to_string())?))
        .map_err(|e|e.to_string())?;
    println!("Admitted {} conservatively matched HanziVG Chinese structural candidates.", output.len());
    Ok(output)
}
