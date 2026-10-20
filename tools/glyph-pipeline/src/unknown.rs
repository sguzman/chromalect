use super::*;
use serde_json::json;
use std::collections::HashSet;

// Neutral gray is a review indicator, not an additional component-palette entry.
pub(super) const UNKNOWN_ID: &str = "unresolved-source-component";
pub(super) const UNKNOWN_FILL: &str = "#AAB5C3";

fn render(glyphs: &[Glyph]) -> String {
    let mut html = String::from(
        "<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>Unresolved source-component review · Chromalect</title><link rel=\"stylesheet\" href=\"../../style.css\"></head><body><main class=\"wrap\"><p><a href=\"../../index.html\">Chromalect</a> / <a href=\"../index.html\">Colored glyphs</a> / <a href=\"../diagnostics.html\">Diagnostics</a></p><h1>Unknown-component source review</h1><p class=\"intro\">These images are not published component-color assignments. An unidentified source component is shown in neutral gray, while compatible, source-owned known components retain their v0.4 color. The unknown component is <strong>not</strong> assigned an identity or inferred from the catalog. These comparisons never replace the normal character display.</p><p><a href=\"records.json\">Machine-readable partial ownership records</a></p><div class=\"review-grid\">"
    );
    for g in glyphs {
        let known = g.parts.iter().filter(|(_,id,_)| id != UNKNOWN_ID)
            .map(|(form,id,color)|format!(
                "<span class=\"stroke-token\"><i class=\"stroke-dot\" style=\"background:{}\"></i>{} <small>{}</small></span>",
                escape(color),escape(form),escape(id)
            )).collect::<Vec<_>>().join("");
        let undecided = g.strokes.iter().filter(|s| s.id == UNKNOWN_ID).count();
        html.push_str(&format!(
            "<article class=\"review-item\"><div class=\"review-pair\"><div><span class=\"review-native\" lang=\"zh-Hans\">{}</span><small>Native font</small></div><div><img src=\"{}\" width=\"112\" height=\"112\" loading=\"lazy\" alt=\"{} with unidentified source components in gray\"><small>Partial source match</small></div></div><p><strong>{}</strong> · {} gray source paths · {}</p><div class=\"stroke-token-row\">{}</div><p><a href=\"{}\">Open review SVG</a></p></article>",
            escape(&g.character),file_name(g),escape(&g.character),
            escape(&g.character),undecided,escape(&g.decomposition),known,file_name(g)
        ));
    }
    html.push_str("</div></main></body></html>");
    html
}

pub(super) fn generate(glyphs: &[Glyph], active: &[Glyph], target: &Path) -> Result<(), String> {
    let active_chars: HashSet<&str> = active.iter().map(|g| g.character.as_str()).collect();
    let mut seen = HashSet::new();
    for glyph in glyphs {
        if active_chars.contains(glyph.character.as_str()) {
            return Err(format!("{} cannot be both active and partially unresolved",glyph.character));
        }
        if !seen.insert(glyph.character.as_str()) {
            return Err(format!("duplicate unknown-source candidate {}",glyph.character));
        }
        if !glyph.strokes.iter().any(|s| s.id == UNKNOWN_ID)
            || !glyph.strokes.iter().any(|s| s.id != UNKNOWN_ID)
        {
            return Err(format!("{} needs both unknown and known source paths for partial review",glyph.character));
        }
        if glyph.strokes.iter().any(|s| s.id == UNKNOWN_ID && s.color != UNKNOWN_FILL) {
            return Err(format!("{} unknown stroke has a non-neutral color",glyph.character));
        }
    }
    let folder = target.join("unknown-components");
    fs::create_dir_all(&folder).map_err(|e|e.to_string())?;
    for glyph in glyphs {
        fs::write(folder.join(file_name(glyph)),svg(glyph)).map_err(|e|e.to_string())?;
    }
    fs::write(folder.join("index.html"),render(glyphs)).map_err(|e|e.to_string())?;
    let rows = glyphs.iter().map(|g|json!({
        "character":g.character,
        "source_decomposition":g.decomposition,
        "svg":file_name(g),
        "known_source_path_count":g.strokes.iter().filter(|s| s.id != UNKNOWN_ID).count(),
        "unresolved_source_path_count":g.strokes.iter().filter(|s| s.id == UNKNOWN_ID).count(),
        "known_components":g.parts.iter().filter(|(_,id,_)|id != UNKNOWN_ID)
            .map(|(form,id,color)|json!({"form":form,"component_id":id,"hex":color})).collect::<Vec<_>>(),
        "unresolved_owner_label":UNKNOWN_ID,
        "unresolved_preview_fill":UNKNOWN_FILL,
    })).collect::<Vec<_>>();
    let report = json!({
        "schema":"chromalect.unknown-source-component-review.v1",
        "status":"partial_unresolved_source_comparison_only_not_for_direct_or_marker",
        "source_revision":discover::source_revision(),
        "palette_ref_for_known_parts":"mandarin-component-identity@0.4.0",
        "unknown_fill_is_palette_identity":false,
        "candidate_count":rows.len(),
        "glyphs":rows,
        "note":"Unknown leaves are never guessed or promoted to active component assignments. Paths are identified by the pinned source's structural matches only.",
    });
    fs::write(folder.join("records.json"),
        format!("{}\n",serde_json::to_string_pretty(&report).map_err(|e|e.to_string())?))
        .map_err(|e|e.to_string())?;
    println!("Generated {} neutral-highlight partial source reviews.",glyphs.len());
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn previews_do_not_claim_unknown_component_identity() {
        let html = render(&[]);
        assert!(html.contains("not</strong> assigned an identity"));
        assert!(html.contains("never replace the normal character display"));
        assert_ne!(UNKNOWN_ID, "cmp-0001");
        assert!(UNKNOWN_FILL.starts_with('#'));
    }
}
