mod discover;
mod atlas;
mod browse;
mod coverage;
mod color_registry;
mod manifest;
mod alternatives;
mod unknown;
mod phonetics;
mod component_audit;
mod diagnostics;
mod review;
mod ontology;
mod theme;

use serde_json::Value;
use std::collections::{BTreeMap, BTreeSet};
use std::env;
use std::fs;
use std::path::{Path, PathBuf};

const SOURCE_REV: &str = "68d10a4b21150cae5e1ebbd223eed289cf32d90c";
const TRANSFORM: &str = "scale(1,-1) translate(0,-900)";

struct Stroke {
    path: String,
    id: String,
    color: String,
}

struct Glyph {
    character: String,
    decomposition: String,
    parts: Vec<(String, String, String)>, // form, component ID, color
    strokes: Vec<Stroke>,
    candidate: bool,
}

fn root() -> PathBuf {
    Path::new(env!("CARGO_MANIFEST_DIR")).join("../..")
}

fn get<'a>(object: &'a Value, key: &str) -> Result<&'a Value, String> {
    object.get(key).ok_or_else(|| format!("missing {key}"))
}

fn string<'a>(object: &'a Value, key: &str) -> Result<&'a str, String> {
    get(object, key)?.as_str().ok_or_else(|| format!("{key} must be a string"))
}

fn entries<'a>(object: &'a Value, key: &str) -> Result<&'a Vec<Value>, String> {
    get(object, key)?.as_array().ok_or_else(|| format!("{key} must be an array"))
}

fn load(path: &Path) -> Result<Value, String> {
    let text = fs::read_to_string(path).map_err(|e| format!("{}: {e}", path.display()))?;
    serde_json::from_str(&text).map_err(|e| format!("{}: {e}", path.display()))
}

fn valid_path(path: &str) -> bool {
    path.starts_with("M ") && path.ends_with('Z') && path.len() >= 16
        && path.chars().all(|c| c.is_ascii_digit()
            || matches!(c, ' ' | ',' | '-' | '+' | '.' | 'M' | 'L' | 'Q' | 'C' | 'Z'))
}

fn validate() -> Result<Vec<Glyph>, String> {
    let r = root();
    let palette = load(&r.join("palettes/mandarin-component-identity-v0.4.json"))?;
    let corpus = load(&r.join("data/catalog/colored-strokes-v0.1.json"))?;
    if string(&palette, "version")? != "0.4.0" {
        return Err("palette must be version 0.4.0".into());
    }
    if string(&corpus, "palette_ref")? != "mandarin-component-identity@0.4.0" {
        return Err("colored glyphs use a different palette".into());
    }
    if string(&corpus, "transform")? != TRANSFORM {
        return Err("SVG geometry transform differs from the documented source".into());
    }
    let mut colors = BTreeMap::new();
    for p in entries(&palette, "components")? {
        let id = string(p, "id")?.to_owned();
        let form = string(p, "shape")?.to_owned();
        let color = string(p, "color")?.to_owned();
        if colors.insert(id.clone(), (form, color)).is_some() {
            return Err(format!("duplicate palette ID {id}"));
        }
    }
    if colors.len() != 513 {
        return Err(format!("expected 513 palette identities; found {}", colors.len()));
    }
    let records = entries(&corpus, "glyphs")?;
    let expected = get(&corpus, "count")?.as_u64().ok_or("count must be an integer")?;
    if records.len() as u64 != expected {
        return Err(format!("glyph count says {expected}, found {}", records.len()));
    }
    let mut glyphs = Vec::new();
    let mut chars = BTreeSet::new();
    for record in records {
        let character = string(record, "character")?.to_owned();
        if character.chars().count() != 1 || !chars.insert(character.clone()) {
            return Err(format!("duplicate or invalid character {character:?}"));
        }
        let decomposition = string(record, "decomposition")?.to_owned();
        let mut parts = Vec::new();
        let mut ids = BTreeSet::new();
        for part in entries(record, "parts")? {
            let form = string(part, "form")?.to_owned();
            let id = string(part, "component_id")?.to_owned();
            let color = string(part, "color")?.to_owned();
            let expected = colors.get(&id).ok_or_else(|| format!("{character}: unknown component {id}"))?;
            if expected != &(form.clone(), color.clone()) {
                return Err(format!("{character}: {id} form/color differs from palette v0.4"));
            }
            ids.insert(id.clone());
            parts.push((form, id, color));
        }
        if parts.is_empty() {
            return Err(format!("{character}: no components"));
        }
        let mut used = BTreeSet::new();
        let mut strokes = Vec::new();
        for (i, stroke) in entries(record, "strokes")?.iter().enumerate() {
            let path = string(stroke, "path")?.to_owned();
            let id = string(stroke, "component_id")?.to_owned();
            let color = string(stroke, "color")?.to_owned();
            if !ids.contains(&id) {
                return Err(format!("{character} stroke {i}: unlisted owner {id}"));
            }
            if colors.get(&id).map(|(_, c)| c.as_str()) != Some(color.as_str()) {
                return Err(format!("{character} stroke {i}: color differs from palette"));
            }
            if !valid_path(&path) {
                return Err(format!("{character} stroke {i}: unexpected SVG path syntax"));
            }
            used.insert(id.clone());
            strokes.push(Stroke { path, id, color });
        }
        if strokes.is_empty() || used != ids {
            return Err(format!("{character}: unassigned strokes or unused component identities"));
        }
        glyphs.push(Glyph { character, decomposition, parts, strokes, candidate: false });
    }
    Ok(glyphs)
}

fn file_name(g: &Glyph) -> String {
    format!("U+{:04X}.svg", g.character.chars().next().unwrap() as u32)
}

fn source_name(g: &Glyph) -> String {
    format!("U+{:04X}.json", g.character.chars().next().unwrap() as u32)
}

fn escape(input: &str) -> String {
    input.replace('&', "&amp;").replace('<', "&lt;")
        .replace('>', "&gt;").replace('"', "&quot;")
}

fn svg(g: &Glyph) -> String {
    let labels = g.parts.iter().map(|p| p.0.as_str()).collect::<Vec<_>>().join(" + ");
    let mut s = format!(
        "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 1024 1024\" role=\"img\" aria-label=\"{} component colors\">\n<title>{}: {}</title>\n<g transform=\"{}\">\n",
        escape(&g.character), escape(&g.character), escape(&labels), TRANSFORM
    );
    for stroke in &g.strokes {
        s.push_str(&format!(
            "<path d=\"{}\" fill=\"{}\" data-component=\"{}\"/>\n",
            stroke.path, stroke.color, stroke.id
        ));
    }
    s.push_str("</g>\n</svg>\n");
    s
}

const PAGE_SIZE: usize = 48;

fn page_name(page: usize) -> String {
    if page == 0 { "index.html".into() } else { format!("page-{:02}.html", page + 1) }
}

fn pager(glyphs: &[Glyph], page: usize) -> String {
    let count = glyphs.len().div_ceil(PAGE_SIZE);
    let mut result = String::from("<nav class=\"pager\" aria-label=\"SVG atlas pages\">");
    for i in 0..count {
        let label = format!("{}–{}", i * PAGE_SIZE + 1, ((i + 1) * PAGE_SIZE).min(glyphs.len()));
        let current = if i == page { " aria-current=\"page\"" } else { "" };
        result.push_str(&format!("<a href=\"{}\"{}>{}</a>", page_name(i), current, label));
    }
    result.push_str("<a href=\"by-component/index.html\">Browse by component</a><a href=\"alternatives/index.html\">Source alternatives</a><a href=\"unknown-components/index.html\">Unidentified source parts</a><a href=\"unmapped.html\">Unmapped characters</a><a href=\"diagnostics.html\">Coverage diagnostics</a><a href=\"review/index.html\">Geometry review</a></nav>");
    result
}

fn index(glyphs: &[Glyph], page: usize) -> String {
    let mut s = String::from(
        "<!doctype html>\n<html lang=\"en\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>Component glyph atlas · Chromalect</title><meta name=\"color-scheme\" content=\"light dark\"><script src=\"../theme.js\"></script><link rel=\"stylesheet\" href=\"../style.css\"></head>\n<body><main class=\"wrap\"><p><a href=\"../index.html\">Chromalect</a> / <a href=\"../strokes.html\">Colored glyph gallery</a></p>\n<h1>Component-colored SVG atlas</h1><p class=\"intro\">Source-aligned vector strokes, colored by v0.4 component identity. Stroke ownership is algorithmically checked but requires independent visual review. <a href=\"mappings.json\">Machine-readable mapping manifest (JSON)</a>.</p>\n"
    );
    s.push_str(&pager(glyphs, page));
    s.push_str("<div class=\"stroke-gallery\">");
    for g in glyphs.iter().skip(page * PAGE_SIZE).take(PAGE_SIZE) {
        let file = file_name(g);
        let labels = g.parts.iter().map(|p| p.0.as_str()).collect::<Vec<_>>().join(" + ");
        s.push_str(&format!(
            "<article class=\"stroke-item\"><div class=\"stroke-art\"><img width=\"185\" height=\"185\" loading=\"lazy\" alt=\"{}: {}\" src=\"{}\"></div><h2>{}</h2><p>{} · {} strokes</p><p>{}</p><p><a href=\"{}\">Open vector glyph</a></p></article>\n",
            escape(&g.character), escape(&labels), file,
            escape(&g.character), escape(&g.decomposition),
            g.strokes.len(), if g.candidate { "Automated source alignment · visual review pending" } else { "Curated pilot · visual review pending" }, file
        ));
    }
    s.push_str("</div>");
    s.push_str(&pager(glyphs, page));
    s.push_str("</main></body></html>\n");
    s
}

fn build(glyphs: &[Glyph]) -> Result<(), String> {
    let target = root().join("site/glyphs");
    fs::create_dir_all(&target).map_err(|e| e.to_string())?;
    for g in glyphs {
        fs::write(target.join(file_name(g)), svg(g)).map_err(|e| e.to_string())?;
    }
    for page in 0..glyphs.len().div_ceil(PAGE_SIZE) {
        fs::write(target.join(page_name(page)), index(glyphs, page)).map_err(|e| e.to_string())?;
    }
    browse::generate(glyphs, &target)?;
    coverage::generate(glyphs, &target)?;
    manifest::generate(glyphs, &target)?;
    review::generate(glyphs, &target)?;
    println!("Generated {} component-colored SVGs across {} gallery pages.", glyphs.len(), glyphs.len().div_ceil(PAGE_SIZE));
    Ok(())
}

fn percent_encoded(s: &str) -> String {
    s.as_bytes().iter().map(|b| format!("%{b:02X}")).collect()
}

fn sources(glyphs: &[Glyph]) {
    for g in glyphs {
        println!("{}\thttps://raw.githubusercontent.com/chanind/hanzi-writer-data/{SOURCE_REV}/data/{}.json", source_name(g), percent_encoded(&g.character));
    }
}

fn verify_source(glyphs: &[Glyph], dir: &Path) -> Result<(), String> {
    for g in glyphs {
        let upstream = load(&dir.join(source_name(g)))?;
        let strokes = entries(&upstream, "strokes")?;
        if strokes.len() != g.strokes.len() {
            return Err(format!("{}: {} local strokes, {} upstream", g.character, g.strokes.len(), strokes.len()));
        }
        for (i, stroke) in strokes.iter().enumerate() {
            if stroke.as_str() != Some(&g.strokes[i].path) {
                return Err(format!("{}: stroke {} differs from pinned Hanzi Writer geometry", g.character, i));
            }
        }
    }
    println!("Verified exact path order for {} glyphs against pinned upstream geometry.", glyphs.len());
    Ok(())
}

fn check_site(glyphs: &[Glyph]) -> Result<(), String> {
    let site = fs::read_to_string(root().join("site/strokes.html"))
        .map_err(|e| format!("reading published stroke gallery: {e}"))?;
    for g in glyphs {
        let title = format!("<title>{}: ", g.character);
        if !site.contains(&title) {
            return Err(format!("site/strokes.html is missing {} entirely", g.character));
        }
        for stroke in &g.strokes {
            let fragment = format!("d=\"{}\" fill=\"{}\"", stroke.path, stroke.color);
            if !site.contains(&fragment) {
                return Err(format!("site/strokes.html differs from {} stroke data", g.character));
            }
        }
    }
    println!("Published stroke gallery matches {} machine-readable glyphs.", glyphs.len());
    Ok(())
}

fn run() -> Result<(), String> {
    let glyphs = validate()?;
    let mut args = env::args().skip(1);
    match args.next().as_deref() {
        Some("check") => {
            check_site(&glyphs)?;
            color_registry::validate_color_registry()?;
            phonetics::check()?;
            component_audit::check()?;
            ontology::check()?;
            theme::check()?;
            println!("Validated {} glyphs and their v0.4 component assignments.", glyphs.len());
        }
        Some("build") => build(&glyphs)?,
        Some("discover") => {
            let dictionary = args.next().ok_or("usage: glyph-pipeline discover DICTIONARY GRAPHICS")?;
            let graphics = args.next().ok_or("usage: glyph-pipeline discover DICTIONARY GRAPHICS")?;
            discover::run(Path::new(&dictionary), Path::new(&graphics))?;
        },
        Some("sources") => sources(&glyphs),
        Some("verify-source") => {
            let dir = args.next().ok_or("usage: glyph-pipeline verify-source DIR")?;
            verify_source(&glyphs, Path::new(&dir))?;
        }
        Some("report") => {
            for g in &glyphs {
                println!("{}: {} strokes, {} component records, {}", g.character, g.strokes.len(), g.parts.len(), g.decomposition);
            }
        }
        _ => return Err("usage: glyph-pipeline {check|build|discover DICTIONARY GRAPHICS|sources|verify-source DIR|report}".into()),
    }
    Ok(())
}

fn main() {
    if let Err(message) = run() {
        eprintln!("Glyph pipeline: {message}");
        std::process::exit(1);
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn curated_glyphs_match_palette() {
        assert_eq!(validate().unwrap().len(), 12);
    }
    #[test]
    fn known_svg_is_rendered_with_component_ownership() {
        let glyph = validate().unwrap().into_iter().find(|g| g.character == "好").unwrap();
        let output = svg(&glyph);
        assert!(output.contains("data-component=\"cmp-0014\""));
        assert!(output.contains("data-component=\"cmp-0015\""));
        assert_eq!(output.matches("<path ").count(), 6);
        assert!(output.contains("<title>好: 女 + 子</title>"));
    }
    #[test]
    fn generated_index_includes_all_source_glyphs() {
        let glyphs = validate().unwrap();
        let html = index(&glyphs, 0);
        assert_eq!(html.matches("<article ").count(), glyphs.len().min(PAGE_SIZE));
        assert!(html.contains("U+597D.svg"));
    }
    #[test]
    fn gallery_navigation_sits_outside_the_card_grid() {
        let pilot = validate().unwrap();
        let html = index(&pilot,0);
        let top_pager = html.find("<nav class=\"pager\"").unwrap();
        let grid = html.find("<div class=\"stroke-gallery\"").unwrap();
        let first_article = html.find("<article class=\"stroke-item\"").unwrap();
        let grid_end = html.rfind("</div>").unwrap();
        assert!(top_pager < grid && grid < first_article);
        assert!(html.matches("<nav class=\"pager\"").count() == 2);
        assert!(grid_end > first_article);
    }

    #[test]
    fn homepage_demo_shows_real_components_without_competing_default_overlays() {
        let html = fs::read_to_string(root().join("site/index.html")).unwrap();
        for ch in ["好", "妈", "休", "男"] {
            let pilot = validate().unwrap().into_iter().find(|g| g.character == ch).unwrap();
            assert!(html.contains(&format!("aria-label=\"{} with colored components\"", ch)));
            for stroke in &pilot.strokes {
                assert!(html.contains(&format!("fill=\"{}\" d=\"{}\"", stroke.color, stroke.path)));
            }
        }
        assert!(html.contains("id=\"component-direct\" name=\"component\" type=\"radio\" value=\"direct\" checked"));
        assert!(html.contains("id=\"reading-off\" name=\"reading\" type=\"radio\" value=\"off\" checked"));
        assert!(html.contains("id=\"tone-off\" name=\"tone\" type=\"radio\" value=\"off\" checked"));
        assert!(!html.contains("Direct does not mean full glyph recoloring yet"));
    }

    #[test]
    fn site_html_paths_match_the_source_dataset() {
        check_site(&validate().unwrap()).unwrap();
    }
}