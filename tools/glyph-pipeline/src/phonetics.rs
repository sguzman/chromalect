use super::*;

fn check_atlas_colors() -> Result<(), String> {
    let root = root();
    let palette = load(&root.join("site/layers-v0.1.json"))?;
    let readings = load(&root.join("site/pronunciation-citations-0001-1000.json"))?;
    let domains = get(&palette, "palette_domains")?;
    let initials = get(get(domains, "initial")?, "tokens")?;
    let finals = get(get(domains, "final")?, "tokens")?;
    let tones = get(get(domains, "tone")?, "tokens")?;
    let symbols = get(get(domains, "tone")?, "symbols")?;
    let records = entries(&readings, "characters")?;
    if records.len() != 1000 {
        return Err(format!("phonetic atlas expected 1000 characters; got {}", records.len()));
    }
    let mut pages: Vec<String> = Vec::new();
    for page in 0..10 {
        let start = page * 100 + 1;
        let path = root.join(format!("site/characters/{start:04}-{:04}.html", start + 99));
        pages.push(fs::read_to_string(&path).map_err(|e| format!("{}: {e}",path.display()))?);
    }
    for (index, record) in records.iter().enumerate() {
        let rank = get(record, "rank")?.as_u64().ok_or("reading rank is not numeric")? as usize;
        if rank != index + 1 {
            return Err(format!("pronunciation dataset is not ordered at {rank}"));
        }
        let character = string(record, "character")?;
        let first = entries(record,"readings")?.first()
            .ok_or_else(||format!("{character}: no citation reading"))?;
        let initial = string(first, "initial")?;
        let final_token = string(first,"final")?;
        let tone = get(first, "tone")?.as_u64().ok_or("tone not integer")?;
        if tone > 4 { return Err(format!("{character}: unsupported tone {tone}")); }
        let tone_key = tone.to_string();
        let onset_color = get(initials, initial)?.as_str()
            .ok_or_else(||format!("{character}: initial token missing color"))?;
        let final_color = get(finals, final_token)?.as_str()
            .ok_or_else(||format!("{character}: final token missing color"))?;
        let tone_color = get(tones, &tone_key)?.as_str()
            .ok_or_else(||format!("{character}: tone missing color"))?;
        let tone_symbol = get(symbols, &tone_key)?.as_str()
            .ok_or_else(||format!("{character}: tone missing symbol"))?;
        let page = &pages[(rank - 1)/100];
        let heading = format!("<details class=\"tile\" id=\"c{rank:04}\" style=\"");
        let start = page.find(&heading)
            .ok_or_else(||format!("{character} rank {rank}: missing atlas tile"))?;
        let end = page[start..].find("</details>")
            .ok_or_else(||format!("{character} rank {rank}: unclosed atlas tile"))?;
        let card = &page[start..start + end];
        let style_end = card.find("\"><summary").ok_or_else(||format!("{character}: missing tile style"))?;
        let style = &card[..style_end];
        for (channel, expected) in [
            ("--onset-color", onset_color),
            ("--rime-color", final_color),
            ("--tone-color", tone_color)
        ] {
            let fragment = format!("{channel}:{expected}");
            if !style.contains(&fragment) {
                return Err(format!(
                    "{character} rank {rank}: {channel} disagrees with citation reading {} (expected {expected})",
                    string(first,"display")?
                ));
            }
        }
        if !card.contains(&format!("<summary title=\"Inspect {character}\">")) {
            return Err(format!("{character} rank {rank}: atlas card character mismatch"));
        }
        let display = string(first,"display")?;
        if !card.contains(&format!("aria-label=\"Pinyin {display}\"")) {
            return Err(format!("{character} rank {rank}: first listed citation reading {display} does not match marker"));
        }
        let expected_marker = format!(
            "<span class=\"tone-marker\" aria-label=\"Tone {tone}\">{tone_symbol}</span>"
        );
        if !card.contains(&expected_marker) {
            return Err(format!("{character} rank {rank}: tone symbol disagrees with canonical palette"));
        }
    }
    println!("Citation-color audit: all 1000 atlas tiles match their canonical initial, final and tone assignments.");
    Ok(())
}

pub(super) fn check() -> Result<(),String> { check_atlas_colors() }

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn all_static_atlas_pages_use_canonical_citation_colors() {
        check_atlas_colors().unwrap();
    }
}
