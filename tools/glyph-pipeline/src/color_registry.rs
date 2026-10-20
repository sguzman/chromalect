use super::*;
use std::fs;

fn is_hex_color(color: &str) -> bool {
    color.len() == 7 && color.starts_with('#')
        && color[1..].bytes().all(|b| b.is_ascii_hexdigit())
}

pub(super) fn validate_color_registry() -> Result<(), String> {
    let root = root();
    let palette = load(&root.join("site/layers-v0.1.json"))?;
    let registry = fs::read_to_string(root.join("docs/color-registry.md"))
        .map_err(|e| format!("docs/color-registry.md: {e}"))?;
    let html = fs::read_to_string(root.join("site/colors.html"))
        .map_err(|e| format!("site/colors.html: {e}"))?;
    let homepage = fs::read_to_string(root.join("site/index.html"))
        .map_err(|e| format!("site/index.html: {e}"))?;

    if string(&palette, "version")? != "0.1.0" {
        return Err("phonetic color contract version changed without updating reference".into());
    }
    if !homepage.contains("href=\"./colors.html\"") {
        return Err("homepage must link to the human-readable color registry".into());
    }
    let domains = get(&palette, "palette_domains")?;
    let mut seen = 0_usize;
    for (domain, expected) in [("initial", 24_usize), ("final", 33), ("tone", 5)] {
        let group = get(domains, domain)?;
        let tokens = get(group, "tokens")?.as_object()
            .ok_or_else(|| format!("{domain}.tokens must be an object"))?;
        if tokens.len() != expected {
            return Err(format!("{domain}: expected {expected} entries, found {}", tokens.len()));
        }
        for (token, color) in tokens {
            let color = color.as_str()
                .ok_or_else(|| format!("{domain} {token}: hex must be a string"))?;
            if !is_hex_color(color) {
                return Err(format!("{domain} {token}: invalid color {color}"));
            }
            let markdown_row = format!("| \x60{token}\x60 | \x60{color}\x60 |");
            if !registry.contains(&markdown_row) {
                return Err(format!("Markdown missing {domain} token {token}={color}"));
            }
            let html_row = format!(
                "<tr><th scope=\"row\"><code>{token}</code></th><td><span class=\"palette-swatch\" style=\"background:{color}\""
            );
            if !html.contains(&html_row) {
                return Err(format!("website missing {domain} token {token}={color}"));
            }
            seen += 1;
        }
    }
    if registry.lines().filter(|s| s.starts_with("| \x60")).count() != seen {
        return Err("Markdown has extra or missing palette table entries".into());
    }
    if html.matches("<tr><th scope=\"row\"><code>").count() != seen {
        return Err("website has extra or missing palette rows".into());
    }
    let tone = get(domains, "tone")?;
    let symbols = get(tone, "symbols")?.as_object().ok_or("tone symbols missing")?;
    let tone_colors = get(tone, "tokens")?.as_object().ok_or("tone colors missing")?;
    if symbols.len() != tone_colors.len() {
        return Err("tone symbols and colors have different key counts".into());
    }
    for (key, symbol) in symbols {
        if !tone_colors.contains_key(key) {
            return Err(format!("tone symbol {key} has no color"));
        }
        let symbol = symbol.as_str().ok_or("tone symbol must be text")?;
        let color = tone_colors[key].as_str().ok_or("tone color must be text")?;
        if !registry.contains(&format!("| \x60{key}\x60 | \x60{color}\x60 | {symbol} ·")) {
            return Err(format!("Markdown tone {key} has incorrect symbol"));
        }
        if !html.contains(&format!("{symbol} · ")) {
            return Err(format!("website missing tone {key} symbol {symbol}"));
        }
    }
    let components = load(&root.join("palettes/mandarin-component-identity-v0.4.json"))?;
    if string(&components, "version")? != "0.4.0"
        || entries(&components, "components")?.len() != 513
    {
        return Err("component palette version or identity count changed".into());
    }
    if !html.contains("href=\"palettes/mandarin-component-identity-v0.4.json\"") {
        return Err("website missing published component palette JSON link".into());
    }
    if !registry.contains("mandarin-component-identity-v0.4.json") {
        return Err("repository human reference missing component palette link".into());
    }
    println!("Color key verified: 24 initials, 33 finals, 5 tones, 513 component identities.");
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn public_palettes_agree_with_canonical_machine_registry() {
        validate_color_registry().unwrap();
    }

    #[test]
    fn every_color_is_an_srgb_hex_triplet() {
        assert!(is_hex_color("#71700F"));
        assert!(!is_hex_color("#71700"));
        assert!(!is_hex_color("yellow"));
        assert!(!is_hex_color("#ABCDEFG"));
    }
}
