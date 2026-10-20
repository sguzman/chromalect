use super::*;

const SOURCE_PAGES: &[&str] = &[
    "index.html", "colors.html", "components.html", "radicals.html",
    "kangxi.html", "ontology.html", "strokes.html",
];

pub(super) fn check() -> Result<(),String> {
    let root = root();
    let stylesheet = fs::read_to_string(root.join("site/style.css")).map_err(|e|e.to_string())?;
    let logic = fs::read_to_string(root.join("site/theme.js")).map_err(|e|e.to_string())?;
    for required in [
        "@media(prefers-color-scheme:dark)",
        ":root[data-theme=\"dark\"]",
        ":root[data-theme=\"light\"]",
        "--tile-bg:", "--glyph-ink:", "--review-pair-bg:",
        ".appearance-controls", "color-scheme:light", "color-scheme:dark",
    ] {
        if !stylesheet.contains(required) {
            return Err(format!("theme CSS missing {required}"));
        }
    }
    for required in [
        "chromalect-theme", "localStorage.getItem",
        "localStorage.setItem", "localStorage.removeItem",
        "system", "light", "dark",
        "document.documentElement", "input.type = \"radio\"",
    ] {
        if !logic.contains(required) {
            return Err(format!("theme controller missing {required}"));
        }
    }
    if !logic.contains("let selected = \"system\"") {
        return Err("site appearance must default to System".into());
    }
    for path in SOURCE_PAGES.iter().map(|p| format!("site/{p}"))
        .chain((0..10).map(|i|format!("site/characters/{:04}-{:04}.html",i*100+1,(i+1)*100))) {
        let page = fs::read_to_string(root.join(&path)).map_err(|e|format!("{path}: {e}"))?;
        let asset = if path.contains("site/characters/") { "../theme.js" } else { "theme.js" };
        let css = if path.contains("site/characters/") { "../style.css" } else { "style.css" };
        let theme_ref = format!("<script src=\"{asset}\"></script>");
        let sheet_ref = format!("<link rel=\"stylesheet\" href=\"{css}\">");
        let start = page.find(&theme_ref).ok_or_else(||format!("{path}: missing theme controller"))?;
        let styles = page.find(&sheet_ref).ok_or_else(||format!("{path}: stylesheet not found"))?;
        if start >= styles || !page.contains("<meta name=\"color-scheme\" content=\"light dark\">") {
            return Err(format!("{path}: missing early theme initialization or light/dark metadata"));
        }
        if page.contains("<meta name=\"color-scheme\" content=\"dark\">") {
            return Err(format!("{path}: obsolete forced dark mode"));
        }
    }
    println!("Site appearance validated: System / Light / Dark on 17 authored pages.");
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn site_theme_defaults_to_system_and_supports_all_pages() {
        check().unwrap();
    }
}
