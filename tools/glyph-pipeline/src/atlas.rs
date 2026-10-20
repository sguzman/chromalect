use super::*;
use std::collections::{BTreeMap, HashMap};

fn ranks() -> Result<HashMap<String, usize>, String> {
    let catalog = load(&root().join("data/catalog/characters-0001-1000.json"))?;
    let mut map = HashMap::new();
    for entry in entries(&catalog, "characters")? {
        let rank = get(entry, "rank")?.as_u64().ok_or("rank is not an integer")?;
        map.insert(string(entry, "character")?.to_owned(), rank as usize);
    }
    Ok(map)
}

pub(super) fn integrate(glyphs: &[Glyph]) -> Result<usize, String> {
    let ranks = ranks()?;
    let mut pages: BTreeMap<PathBuf, String> = BTreeMap::new();
    let mut mapped = 0;
    for glyph in glyphs {
        if !glyph.candidate { continue; } // Existing 12 have hand-embedded paths.
        let rank = match ranks.get(&glyph.character) {
            Some(n) => *n, None => continue,
        };
        let start = ((rank - 1) / 100) * 100 + 1;
        let path = root().join(format!("site/characters/{start:04}-{:04}.html", start + 99));
        if !pages.contains_key(&path) {
            let html = fs::read_to_string(&path)
                .map_err(|e| format!("{}: {e}", path.display()))?;
            pages.insert(path.clone(), html);
        }
        let html = pages.get_mut(&path).unwrap();
        let opening = format!("<details class=\"tile\" id=\"c{rank:04}\"");
        let tile_start = html.find(&opening).ok_or_else(|| format!(
            "missing atlas card {} rank {rank}", glyph.character
        ))?;
        let tile_end_rel = html[tile_start..].find("</details>").ok_or_else(|| format!(
            "unclosed atlas card {} rank {rank}", glyph.character
        ))?;
        let tile_end = tile_start + tile_end_rel + "</details>".len();
        let tile = &html[tile_start..tile_end];
        let old = format!("<span class=\"glyph\" lang=\"zh-Hans\">{}</span>", escape(&glyph.character));
        if tile.matches(&old).count() != 1 {
            return Err(format!(
                "{} rank {rank}: missing or non-unique uncolored glyph in character atlas",
                glyph.character
            ));
        }
        let new = format!(
            "<span class=\"glyph glyph-with-strokes\" lang=\"zh-Hans\">{}<img class=\"stroke-svg\" src=\"../glyphs/{}\" alt=\"\" loading=\"lazy\" aria-hidden=\"true\"></span>",
            escape(&glyph.character), file_name(glyph),
        );
        let updated = tile.replace(&old, &new).replace(
            "Glyph geometry: not available. The component colors are metadata, not interior stroke fills.",
            "Source-aligned colored stroke geometry available; independent visual review pending."
        );
        html.replace_range(tile_start..tile_end, &updated);
        mapped += 1;
    }
    for (path, html) in pages {
        fs::write(&path, html).map_err(|e| format!("{}: {e}", path.display()))?;
    }
    println!("Updated {mapped} source-derived glyphs in the 1,000-character atlas.");
    Ok(mapped)
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn character_ranks_match_known_pilot_cases() {
        let r = ranks().unwrap();
        assert_eq!(r["好"], 581);
        assert_eq!(r["男"], 733);
    }
}
