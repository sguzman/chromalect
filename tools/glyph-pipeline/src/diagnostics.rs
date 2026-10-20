use super::*;
use serde_json::json;
use std::collections::{BTreeMap, HashMap, HashSet};

const DICTIONARY_REVISION: &str = "bddc96d41bef78427ed0e034e9f7e31d71fd1b92";

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
    let mut by_reason: BTreeMap<String, Vec<Value>> = BTreeMap::new();
    let mut total_missing = 0_usize;

    for row in catalog {
        let character = string(row, "character")?;
        if available.contains(character) { continue; }
        let reason = match dictionary.get(character) {
            None if atomics.contains_key(character) => "atomic_geometry_missing",
            None => "dictionary_entry_missing",
            Some(_) if atomics.contains_key(character) => "atomic_geometry_missing",
            Some(source) => discover::explain_dictionary_rejection(source, &known_ids, &shapes),
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

    let mut summaries = Vec::new();
    let mut html = String::from("<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>Unmapped glyph diagnostics · Chromalect</title><link rel=\"stylesheet\" href=\"../style.css\"></head><body><main class=\"wrap\"><p><a href=\"../index.html\">Chromalect</a> / <a href=\"index.html\">Colored glyphs</a> / <a href=\"unmapped.html\">Unmapped characters</a></p><h1>Unmapped glyph diagnostics</h1><p class=\"intro\">This report classifies why a character is not yet eligible for stroke-based component coloring. Source structure, palette identity, catalog component choice, and complete stroke ownership are distinct requirements. A source agreement is not a visual accuracy certificate.</p><p><a href=\"diagnostics.json\">Machine-readable diagnostics JSON</a></p><nav class=\"quick-links\" aria-label=\"Diagnostic categories\">");
    for (reason, rows) in &by_reason {
        summaries.push(json!({"reason": reason, "count": rows.len()}));
        html.push_str(&format!("<a href=\"#reason-{}\">{}: {}</a>", escape(reason), escape(reason), rows.len()));
    }
    html.push_str("</nav>");
    for (reason, rows) in &by_reason {
        html.push_str(&format!("<section class=\"cards-section\" id=\"reason-{}\"><h2>{} ({})</h2><div class=\"browse\">",escape(reason), escape(reason).replace('_'," "), rows.len()));
        for row in rows {
            let rank = row["rank"].as_u64().ok_or("invalid diagnostic rank")? as usize;
            let character = row["character"].as_str().ok_or("invalid diagnostic character")?;
            let start = ((rank - 1) / 100) * 100 + 1;
            html.push_str(&format!("<a class=\"tile\" href=\"../characters/{:04}-{:04}.html#c{:04}\" style=\"padding:9px 12px;display:block;text-decoration:none\"><span class=\"rank\">#{rank:04}</span><div lang=\"zh-Hans\" style=\"font-size:34px;text-align:center\">{}</div><div class=\"hint\">{}</div></a>", start, start + 99, rank, escape(character), escape(row["catalog_structural_status"].as_str().unwrap_or("unknown"))));
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
        "reason_counts": summaries,
        "unmapped_by_reason": by_reason,
        "method": "Conservative classification of the pinned Make Me A Hanzi source, v0.4 palette, existing catalog identities and accepted geometry; no inferred stroke ownership."
    });
    let json = serde_json::to_string_pretty(&report).map_err(|e| e.to_string())?;
    fs::write(dest.join("diagnostics.json"), format!("{json}\n")).map_err(|e| e.to_string())?;
    fs::write(dest.join("diagnostics.html"), html).map_err(|e| e.to_string())?;
    println!("Glyph diagnostics: {total_missing} unmapped characters.");
    for category in report["reason_counts"].as_array().ok_or("missing reason counts")? {
        println!("  {}: {}",category["reason"].as_str().unwrap_or("unknown"), category["count"]);
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
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
