use super::*;
use serde_json::json;
use std::collections::HashSet;

fn render_index(glyphs: &[Glyph]) -> String {
    let mut html = String::from(
        "<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>Alternate decomposition comparisons · Chromalect</title><link rel=\"stylesheet\" href=\"../../style.css\"></head><body><main class=\"wrap\"><p><a href=\"../../index.html\">Chromalect</a> / <a href=\"../index.html\">Colored glyphs</a> / <a href=\"../diagnostics.html\">Diagnostics</a></p><h1>Source alternative comparisons</h1><p class=\"intro\">These source-aligned vector examples use a recorded <strong>alternate</strong> decomposition that differs from the catalog-selected component identity set. They are for research comparison only: these colors do not appear in the active character atlas, Direct mode, or Marker mode. Selecting a canonical decomposition and certifying these assignments requires separate linguistic and visual review.</p><p><a href=\"records.json\">Download alternative mappings as JSON</a></p><div class=\"review-grid\">"
    );
    for g in glyphs {
        let components = g.parts.iter().map(|(form, id, color)| {
            format!(
                "<span class=\"stroke-token\"><i class=\"stroke-dot\" style=\"background:{}\"></i>{} <small>{}</small></span>",
                escape(color), escape(form), escape(id),
            )
        }).collect::<Vec<_>>().join("");
        html.push_str(&format!(
            "<article class=\"review-item\"><div class=\"review-pair\"><div><span class=\"review-native\" lang=\"zh-Hans\">{}</span><small>Native font</small></div><div><img width=\"112\" height=\"112\" loading=\"lazy\" src=\"{}\" alt=\"{} colored using an alternate source decomposition\"><small>Source alternative</small></div></div><p><strong>{}</strong> · {} source paths · {}</p><div class=\"stroke-token-row\">{}</div><p><a href=\"{}\">Open comparison SVG</a></p></article>",
            escape(&g.character), file_name(g), escape(&g.character),
            escape(&g.character), g.strokes.len(), escape(&g.decomposition),
            components, file_name(g)
        ));
    }
    html.push_str("</div></main></body></html>");
    html
}

pub(super) fn generate(glyphs: &[Glyph], active: &[Glyph], target: &Path) -> Result<(), String> {
    let active_ids: HashSet<&str> = active.iter().map(|g| g.character.as_str()).collect();
    let mut seen = HashSet::new();
    for g in glyphs {
        if active_ids.contains(g.character.as_str()) {
            return Err(format!("{} is both an active glyph and an alternate-only candidate",g.character));
        }
        if !seen.insert(g.character.as_str()) {
            return Err(format!("duplicate alternate candidate {}",g.character));
        }
    }
    let folder = target.join("alternatives");
    fs::create_dir_all(&folder).map_err(|e| e.to_string())?;
    for g in glyphs {
        fs::write(folder.join(file_name(g)),svg(g)).map_err(|e| e.to_string())?;
    }
    fs::write(folder.join("index.html"),render_index(glyphs)).map_err(|e| e.to_string())?;
    let manifest = json!({
        "schema": "chromalect.alternative-decomposition-review.v1",
        "status": "research_candidates_not_enabled_in_direct_or_marker",
        "palette_ref": "mandarin-component-identity@0.4.0",
        "source_revision": discover::source_revision(),
        "visual_certification": "not_performed",
        "alternative_count": glyphs.len(),
        "alternatives": glyphs.iter().map(|g| json!({
            "character":g.character,
            "decomposition":g.decomposition,
            "svg":file_name(g),
            "components":g.parts.iter().map(|(form,id,color)|json!({
                "form":form,"component_id":id,"hex":color
            })).collect::<Vec<_>>(),
            "source_path_owner_ids":g.strokes.iter().map(|s|s.id.as_str()).collect::<Vec<_>>(),
        })).collect::<Vec<_>>(),
        "note": "A recorded source alternative is not necessarily the chosen canonical catalog decomposition. This gallery is deliberately separate from active Direct/Marker displays.",
    });
    fs::write(folder.join("records.json"),
        format!("{}\n",serde_json::to_string_pretty(&manifest).map_err(|e|e.to_string())?))
        .map_err(|e|e.to_string())?;
    println!("Generated {} alternate-only candidates for separate comparison.",glyphs.len());
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn alternative_gallery_is_distinct_from_active_renderer() {
        let sample = validate().unwrap();
        let html = render_index(&sample);
        assert!(html.contains("do not appear in the active character atlas"));
        assert_eq!(html.matches("Source alternative</small>").count(),sample.len());
        assert!(html.contains("records.json"));
    }
}
