use super::*;
use serde_json::{json, Value};
use std::collections::{BTreeMap, BTreeSet};

fn build_manifest(glyphs: &[Glyph]) -> Result<Value, String> {
    let mut chars = BTreeSet::new();
    let mut records = Vec::with_capacity(glyphs.len());
    for glyph in glyphs {
        if !chars.insert(glyph.character.as_str()) {
            return Err(format!("duplicate glyph mapping for {}", glyph.character));
        }
        let mut identities = BTreeMap::new();
        for (form, id, color) in &glyph.parts {
            if let Some((original_form, original_color)) =
                identities.insert(id.as_str(), (form.as_str(), color.as_str()))
            {
                if original_form != form || original_color != color {
                    return Err(format!("{} has inconsistent identity {id}", glyph.character));
                }
            }
        }
        let mut path_owners = Vec::with_capacity(glyph.strokes.len());
        for stroke in &glyph.strokes {
            let Some((_, registered_color)) = identities.get(stroke.id.as_str()) else {
                return Err(format!("{} stroke owner {} is unregistered", glyph.character, stroke.id));
            };
            if *registered_color != stroke.color {
                return Err(format!("{} stroke owner {} has wrong palette color", glyph.character, stroke.id));
            }
            path_owners.push(stroke.id.as_str());
        }
        let components = glyph.parts.iter().map(|(form, id, color)| json!({
            "form": form,
            "component_id": id,
            "hex": color,
        })).collect::<Vec<_>>();
        let character = glyph.character.chars().next().ok_or("empty character")?;
        if glyph.character.chars().count() != 1 { return Err("mapping is not one Unicode scalar".into()); }
        records.push(json!({
            "character": glyph.character,
            "unicode_codepoint": format!("U+{:04X}", character as u32),
            "svg": file_name(glyph),
            "decomposition": glyph.decomposition,
            "geometry_provenance": if glyph.candidate { "makemeahanzi_graphics" } else { "hanzi_writer_data" },
            "assignment_status": if glyph.candidate { "source_derived_candidate" } else { "curated_source_aligned_pilot" },
            "independently_visually_certified": false,
            "components": components,
            "source_path_owner_ids": path_owners,
        }));
    }
    Ok(json!({
        "schema": "chromalect.component-stroke-mappings.v1",
        "palette_ref": "mandarin-component-identity@0.4.0",
        "geometry_sources": {
            "curated": {
                "provider": "Hanzi Writer Data",
                "revision": SOURCE_REV,
            },
            "derived": {
                "provider": "Make Me a Hanzi",
                "revision": discover::source_revision(),
            },
        },
        "geometry_alignment": "source_path_owner_ids indexes the corresponding source SVG path positions; it does not prescribe handwriting stroke order",
        "validation_scope": "Exact recorded source ownership and palette agreement; no independent visual or linguistic certification",
        "glyph_count": records.len(),
        "glyphs": records,
    }))
}

pub(super) fn generate(glyphs: &[Glyph], directory: &Path) -> Result<(), String> {
    let manifest = build_manifest(glyphs)?;
    let formatted = serde_json::to_string_pretty(&manifest).map_err(|e| e.to_string())?;
    fs::write(directory.join("mappings.json"), format!("{formatted}\n"))
        .map_err(|e| e.to_string())?;
    println!(
        "Published {} machine-readable component-to-stroke mappings.",
        glyphs.len()
    );
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn pilot_manifest_has_full_palette_and_path_ownership() {
        let glyphs = validate().unwrap();
        let manifest = build_manifest(&glyphs).unwrap();
        assert_eq!(manifest["glyph_count"], glyphs.len());
        let entries = manifest["glyphs"].as_array().unwrap();
        let entry = entries.iter().find(|v| v["character"] == "好").unwrap();
        assert_eq!(entry["components"].as_array().unwrap().len(), 2);
        assert_eq!(entry["source_path_owner_ids"].as_array().unwrap().len(), 6);
        assert_eq!(entry["source_path_owner_ids"][0], "cmp-0014");
        assert_eq!(entry["source_path_owner_ids"][5], "cmp-0015");
        assert_eq!(entry["independently_visually_certified"], false);
        assert_eq!(entry["svg"], "U+597D.svg");
    }

    #[test]
    fn cannot_export_unsupported_component_color() {
        let mut glyphs = validate().unwrap();
        glyphs[0].strokes[0].color = "#000000".to_owned();
        assert!(build_manifest(&glyphs).is_err());
    }

    #[test]
    fn reject_duplicate_characters() {
        let mut glyphs = validate().unwrap();
        let duplicate = validate().unwrap().remove(0);
        glyphs.push(duplicate);
        assert!(build_manifest(&glyphs).is_err());
    }
}
