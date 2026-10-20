use super::*;
use serde_json::json;
use std::collections::{BTreeMap, HashMap};

pub(super) fn generate(glyphs: &[Glyph], destination: &Path) -> Result<(), String> {
    let catalog = load(&root().join("data/catalog/characters-0001-1000.json"))?;
    let mut available = HashMap::new();
    for glyph in glyphs {
        available.insert(glyph.character.as_str(), glyph);
    }
    let mut missing = Vec::new();
    let mut mapped = 0_usize;
    let mut mapped_multicomponent = 0_usize;
    let mut mapped_atomic = 0_usize;
    let mut missing_by_status: BTreeMap<String, usize> = BTreeMap::new();
    let mut html = String::from(
        "<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>Unmapped characters · Chromalect</title><link rel=\"stylesheet\" href=\"../style.css\"></head><body><main class=\"wrap\"><p><a href=\"../index.html\">Chromalect</a> / <a href=\"glyphs/index.html\">Colored glyphs</a></p><h1>Characters awaiting stroke ownership</h1><p class=\"intro\">This catalog lists characters without a complete source-aligned stroke-to-component mapping. Their original Unicode characters remain available in the atlas. No component geometry has been inferred for them.</p><div class=\"browse\">"
    );
    let entries = entries(&catalog, "characters")?;
    for entry in entries {
        let rank = get(entry, "rank")?.as_u64().ok_or("missing rank")? as usize;
        let character = string(entry, "character")?;
        let status = string(entry, "structural_status")?;
        if let Some(glyph) = available.get(character) {
            mapped += 1;
            if glyph.parts.len() == 1 { mapped_atomic += 1; }
            else { mapped_multicomponent += 1; }
        } else {
            *missing_by_status.entry(status.to_owned()).or_default() += 1;
            missing.push(json!({
                "rank": rank, "character": character, "structural_status": status,
            }));
            let start = ((rank - 1) / 100) * 100 + 1;
            html.push_str(&format!(
                "<a class=\"tile\" style=\"display:block;padding:12px;text-decoration:none\" href=\"../characters/{:04}-{:04}.html#c{:04}\"><span class=\"rank\">#{:04}</span><div lang=\"zh-Hans\" style=\"font-size:36px;text-align:center\">{}</div><div class=\"hint\">{}</div></a>",
                start, start + 99, rank, rank, escape(character), escape(status)
            ));
        }
    }
    html.push_str("</div></main></body></html>");
    if mapped + missing.len() != entries.len() {
        return Err("coverage counts do not equal catalog length".into());
    }
    let report = json!({
        "schema": "chromalect.glyph-coverage.v1",
        "palette": "mandarin-component-identity@0.4.0",
        "catalog_size": entries.len(),
        "source_aligned_catalog_glyphs": mapped,
        "source_aligned_atomic": mapped_atomic,
        "source_aligned_multicomponent": mapped_multicomponent,
        "unmapped_count": missing.len(),
        "unmapped_by_structural_status": missing_by_status,
        "unmapped": missing,
        "note": "Source-backed ownership requires independent visual and linguistic auditing. Unmapped means no fully admitted geometry in this pipeline, not absent source data."
    });
    let output = serde_json::to_string_pretty(&report).map_err(|e| e.to_string())?;
    fs::write(destination.join("coverage.json"), format!("{output}\n"))
        .map_err(|e| e.to_string())?;
    fs::write(destination.join("unmapped.html"), html).map_err(|e| e.to_string())?;
    println!(
        "Catalog coverage: {mapped}/{} glyphs ({} multicomponent, {} atomic), {} unmapped.",
        entries.len(), mapped_multicomponent, mapped_atomic, entries.len() - mapped
    );
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn curated_pilot_contains_five_in_tranche() {
        let glyphs = validate().unwrap();
        let catalog = load(&root().join("data/catalog/characters-0001-1000.json")).unwrap();
        let in_tranche: std::collections::HashSet<&str> = entries(&catalog, "characters").unwrap()
            .iter().map(|v| v["character"].as_str().unwrap()).collect();
        let count = glyphs.iter().filter(|g| in_tranche.contains(g.character.as_str())).count();
        assert_eq!(count, 5);
    }
}
