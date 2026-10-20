use super::*;
use serde_json::json;
use std::collections::{BTreeMap, HashMap, HashSet};

const DICTIONARY_REVISION: &str = "bddc96d41bef78427ed0e034e9f7e31d71fd1b92";

fn source_is_declared_alternative(catalog: &Value, dictionary: &Value) -> bool {
    let Some(source) = dictionary.get("decomposition").and_then(Value::as_str) else {
        return false;
    };
    let Some(variants) = catalog.get("ids_primary").and_then(Value::as_str) else {
        return false;
    };
    // Variant qualifiers like (H,T) are metadata, not component glyphs.
    // Only compare a complete expression, never a prefix or substring.
    variants.split(';').skip(1).any(|variant| {
        variant.trim().split('(').next().unwrap_or("").trim() == source
    })
}

fn dictionary_entries(path: &Path, allowed: &HashSet<String>) -> Result<HashMap<String, Value>, String> {
    let mut entries = HashMap::new();
    discover::source_records(path, |row| {
        if let Some(character) = row.get("character").and_then(Value::as_str).map(str::to_owned) {
            if allowed.contains(&character) && entries.insert(character.clone(), row).is_some() {
                return Err(format!("multiple dictionary entries for {character}"));
            }
        }
        Ok(())
    })?;
    Ok(entries)
}

fn reason_description(reason: &str) -> &'static str {
    match reason {
        "unknown_component_in_source" =>
            "The reference decomposition contains an unidentified component (？). A catalog candidate is recorded, but stroke ownership has not been reconciled.",
        "source_matches_declared_catalog_alternative" =>
            "The stroke source agrees with a recorded alternate decomposition, not the selected primary catalog components. Direct and Marker identities must remain consistent.",
        "source_catalog_component_disagreement" =>
            "The source and selected catalog analysis disagree about which recognizable parts are present.",
        "unresolved_source_components" =>
            "At least one source part is absent from the uniquely mapped v0.4 component shapes or has unsupported decomposition structure.",
        "overlapping_components_unresolved" =>
            "The source has an overlapping structural form without complete independently identified stroke ownership.",
        "atomic_geometry_missing" =>
            "The catalog treats this character as one component, but the corresponding complete source outline was not available.",
        "dictionary_entry_missing" =>
            "No matching character-level decomposition was present in the pinned dictionary source.",
        "ambiguous_or_partial_source_stroke_ownership" =>
            "At least one stroke is unassigned, shared, or matched to an unresolved component subtree.",
        "source_owned_but_geometry_unavailable" =>
            "The source structure is compatible, but exact complete stroke-outline geometry has not been admitted.",
        "no_dictionary_decomposition" =>
            "No decomposition is recorded in the pinned source dictionary.",
        "unsupported_source_structure" =>
            "The source uses a structural representation that cannot be safely decoded by the current parser.",
        _ => "Additional source and component verification is required before assigning any new stroke colors.",
    }
}

pub(super) fn generate(dictionary: &Path, glyphs: &[Glyph], dest: &Path) -> Result<(), String> {
    let catalog_data = load(&root().join("data/catalog/characters-0001-1000.json"))?;
    let catalog = entries(&catalog_data, "characters")?;
    let allowed = catalog.iter().map(|r| string(r, "character").map(str::to_owned))
        .collect::<Result<HashSet<_>, _>>()?;
    let dictionary = dictionary_entries(dictionary, &allowed)?;
    let known_ids = discover::catalog_map()?;
    let shapes = discover::palette_shapes()?;
    let atomics = discover::atomic_components()?;
    let available: HashSet<&str> = glyphs.iter().map(|g| g.character.as_str()).collect();
    let mapped_glyphs: HashMap<&str, &Glyph> =
        glyphs.iter().map(|g| (g.character.as_str(), g)).collect();
    let mut mapped_component_disagreements = Vec::new();
    let mut by_reason: BTreeMap<String, Vec<Value>> = BTreeMap::new();
    let mut total_missing = 0_usize;

    for row in catalog {
        let character = string(row, "character")?;
        if available.contains(character) {
            if let Some(glyph) = mapped_glyphs.get(character) {
                let rendered_ids: HashSet<&str> = glyph.parts.iter()
                    .map(|(_, id, _)| id.as_str()).collect();
                let catalog_ids: HashSet<&str> = entries(row, "component_ids")?
                    .iter().filter_map(Value::as_str).collect();
                if rendered_ids != catalog_ids {
                    mapped_component_disagreements.push(json!({
                        "rank": get(row, "rank")?,
                        "character": character,
                        "rendered_component_ids": rendered_ids,
                        "catalog_component_ids": catalog_ids,
                    }));
                }
            }
            continue;
        }
        let reason = match dictionary.get(character) {
            None if atomics.contains_key(character) => "atomic_geometry_missing",
            None => "dictionary_entry_missing",
            Some(_) if atomics.contains_key(character) => "atomic_geometry_missing",
            Some(source) => {
                let reason = discover::explain_dictionary_rejection(source, &known_ids, &shapes);
                if reason == "source_catalog_component_disagreement"
                    && source_is_declared_alternative(row, source)
                {
                    "source_matches_declared_catalog_alternative"
                } else if reason == "unresolved_source_components"
                    && source.get("decomposition").and_then(Value::as_str)
                        .is_some_and(|s| s.contains('？'))
                {
                    "unknown_component_in_source"
                } else {
                    reason
                }
            }
        };
        total_missing += 1;
        by_reason.entry(reason.to_owned()).or_default().push(json!({
            "rank": get(row, "rank")?,
            "character": character,
            "catalog_structural_status": string(row, "structural_status")?,
            "catalog_component_ids": get(row, "component_ids")?,
            "catalog_primary_structure": get(row, "ids_primary")?,
            "source_decomposition": dictionary.get(character)
                .and_then(|v| v.get("decomposition")).cloned(),
        }));
    }

    // The Direct and Marker component layers must describe the same identities.
    // Reject a publication that colors geometry using a different catalog set.
    if !mapped_component_disagreements.is_empty() {
        return Err(format!(
            "{} mapped glyphs disagree with the catalog component IDs; refusing to publish mismatched Direct/Marker annotations",
            mapped_component_disagreements.len()
        ));
    }

    let mut summaries = Vec::new();
    let mut html = String::from("<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>Unmapped glyph diagnostics · Chromalect</title><link rel=\"stylesheet\" href=\"../style.css\"></head><body><main class=\"wrap\"><p><a href=\"../index.html\">Chromalect</a> / <a href=\"index.html\">Colored glyphs</a> / <a href=\"unmapped.html\">Unmapped characters</a></p><h1>Unmapped glyph diagnostics</h1><p class=\"intro\">This report classifies why a character is not yet eligible for stroke-based component coloring. Source structure, palette identity, catalog component choice, and complete stroke ownership are distinct requirements. A source agreement is not a visual accuracy certificate.</p><p><a href=\"diagnostics.json\">Machine-readable diagnostics JSON</a></p><nav class=\"quick-links\" aria-label=\"Diagnostic categories\">");
    for (reason, rows) in &by_reason {
        summaries.push(json!({"reason": reason, "count": rows.len()}));
        html.push_str(&format!("<a href=\"#reason-{}\">{}: {}</a>", escape(reason), escape(reason), rows.len()));
    }
    html.push_str("</nav>");
    for (reason, rows) in &by_reason {
        html.push_str(&format!("<section class=\"cards-section\" id=\"reason-{}\"><h2>{} ({})</h2><p class=\"hint\">{}</p><div class=\"browse\">",
            escape(reason), escape(reason).replace('_'," "), rows.len(), escape(reason_description(reason))));
        for row in rows {
            let rank = row["rank"].as_u64().ok_or("invalid diagnostic rank")? as usize;
            let character = row["character"].as_str().ok_or("invalid diagnostic character")?;
            let start = ((rank - 1) / 100) * 100 + 1;
            html.push_str(&format!("<a class=\"tile\" href=\"../characters/{:04}-{:04}.html#c{:04}\" style=\"padding:9px 12px;display:block;text-decoration:none\"><span class=\"rank\">#{rank:04}</span><div lang=\"zh-Hans\" style=\"font-size:34px;text-align:center\">{}</div><div class=\"hint\">{}</div><div class=\"mono\" style=\"font-size:11px;overflow-wrap:anywhere;margin-top:6px\">Source: {}<p style=\"margin:2px 0;font-size:11px\">Catalog: {}</p></div></a>",
                start, start + 99, rank, escape(character),
                escape(row["catalog_structural_status"].as_str().unwrap_or("unknown")),
                escape(row["source_decomposition"].as_str().unwrap_or("unknown")),
                escape(row["catalog_primary_structure"].as_str().unwrap_or("unknown"))));
        }
        html.push_str("</div></section>");
    }
    html.push_str("</main></body></html>");
    let report = json!({
        "schema": "chromalect.glyph-diagnostics.v1",
        "catalog_size": catalog.len(),
        "source_revision": DICTIONARY_REVISION,
        "mapped_count": catalog.len() - total_missing,
        "unmapped_count": total_missing,
        "mapped_component_set_disagreements": mapped_component_disagreements,
        "reason_counts": summaries,
        "unmapped_by_reason": by_reason,
        "method": "Conservative classification of the pinned Make Me A Hanzi source, v0.4 palette, existing catalog identities and accepted geometry; no inferred stroke ownership."
    });
    let json = serde_json::to_string_pretty(&report).map_err(|e| e.to_string())?;
    fs::write(dest.join("diagnostics.json"), format!("{json}\n")).map_err(|e| e.to_string())?;
    fs::write(dest.join("diagnostics.html"), html).map_err(|e| e.to_string())?;
    println!("Glyph diagnostics: {total_missing} unmapped characters.");
    println!("Mapped glyphs with differing catalog marker identities: {}.", mapped_component_disagreements.len());
    for entry in mapped_component_disagreements.iter().take(14) {
        println!("    #{} {} rendered={} catalog={}",
            entry["rank"], entry["character"], entry["rendered_component_ids"], entry["catalog_component_ids"]);
    }
    for (reason, examples) in &by_reason {
        println!("  {reason}: {}", examples.len());
        for entry in examples.iter().take(14) {
            println!("    #{} {} source={} catalog={}",
                entry["rank"],
                entry["character"].as_str().unwrap_or("?"),
                entry["source_decomposition"].as_str().unwrap_or("unknown"),
                entry["catalog_primary_structure"].as_str().unwrap_or("unknown"),
            );
        }
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn documented_variant_must_match_the_whole_source_expression() {
        let variants = json!({"ids_primary":"⿰亻𠤎(.);⿰亻匕(H,T)"});
        assert!(source_is_declared_alternative(
            &variants, &json!({"decomposition":"⿰亻匕"})
        ));
        assert!(!source_is_declared_alternative(
            &variants, &json!({"decomposition":"⿰亻"})
        ));
        assert!(!source_is_declared_alternative(
            &variants, &json!({"decomposition":"⿰亻𠤎"})
        ));
    }

    #[test]
    fn empty_source_cannot_claim_stroke_ownership() {
        let known = HashMap::from([("好".into(), HashSet::from(["cmp-0014".into(),"cmp-0015".into()]))]);
        let shapes = HashMap::from([
            ("女".into(), ("cmp-0014".into(),"#EA5202".into())),
            ("子".into(), ("cmp-0015".into(),"#98518A".into())),
        ]);
        let record = json!({"character":"好", "decomposition":"⿰女子", "matches":[[0],null,[1]]});
        assert_eq!(
            discover::explain_dictionary_rejection(&record, &known, &shapes),
            "ambiguous_or_partial_source_stroke_ownership"
        );
        let incompatible = json!({"character":"好", "decomposition":"⿰女子", "matches":[[0],[1]]});
        let missing = HashMap::from([("好".into(), HashSet::from(["cmp-0014".into()]))]);
        assert_eq!(
            discover::explain_dictionary_rejection(&incompatible, &missing, &shapes),
            "source_catalog_component_disagreement"
        );
    }
}
