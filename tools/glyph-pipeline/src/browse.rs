use super::*;
use std::collections::{BTreeMap, BTreeSet};

struct Component<'a> {
    form: String,
    color: String,
    glyphs: Vec<&'a Glyph>,
}

fn lookup<'a>(glyphs: &'a [Glyph]) -> BTreeMap<String, Component<'a>> {
    let mut result: BTreeMap<String, Component<'a>> = BTreeMap::new();
    for glyph in glyphs {
        let mut seen = BTreeSet::new();
        for (form, id, color) in &glyph.parts {
            if !seen.insert(id.clone()) { continue; }
            let item = result.entry(id.to_owned()).or_insert_with(|| Component {
                form: form.clone(), color: color.clone(), glyphs: Vec::new(),
            });
            item.glyphs.push(glyph);
        }
    }
    result
}

fn page_header(title: &str) -> String {
    format!(
        "<!doctype html>\n<html lang=\"en\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>{} · Chromalect</title><meta name=\"color-scheme\" content=\"light dark\"><script src=\"../../theme.js\"></script><link rel=\"stylesheet\" href=\"../../style.css\"></head><body><main class=\"wrap\"><p><a href=\"../../index.html\">Chromalect</a> / <a href=\"../index.html\">Colored glyphs</a> / <a href=\"index.html\">Components</a></p>",
        escape(title)
    )
}

fn component_index(components: &BTreeMap<String, Component<'_>>) -> String {
    let mut html = page_header("Colored component index");
    html.push_str("<h1>Components with colored character examples</h1>");
    html.push_str("<p class=\"intro\">Each entry links to source-aligned characters using that stable v0.4 component identity. Candidates still require independent visual review. This index covers only component identities with mapped glyphs, not the full 513-color registry.</p>");
    html.push_str("<div class=\"browse\">");
    for (id, part) in components {
        html.push_str(&format!(
            "<a class=\"tile\" style=\"display:block;padding:12px;text-decoration:none\" href=\"{}.html\"><span class=\"mini\" style=\"--color:{}\"></span> <strong lang=\"zh-Hans\">{}</strong> <span class=\"mono\">{}</span><p>{} glyphs</p></a>",
            id, escape(&part.color), escape(&part.form), escape(id), part.glyphs.len()
        ));
    }
    html.push_str("</div></main></body></html>");
    html
}

fn component_page(id: &str, part: &Component<'_>) -> String {
    let mut html = page_header(&format!("{} ({})", part.form, id));
    html.push_str(&format!(
        "<h1 lang=\"zh-Hans\"><span class=\"mini\" style=\"--color:{}\"></span> {} <small>{}</small></h1>",
        escape(&part.color), escape(&part.form), escape(id)
    ));
    html.push_str("<p class=\"intro\">Characters whose source-backed stroke maps reference this component. Independent visual ownership review is pending for automatically imported examples.</p><div class=\"stroke-gallery\">");
    for glyph in &part.glyphs {
        html.push_str(&format!(
            "<article class=\"stroke-item\"><div class=\"stroke-art\"><img width=\"185\" height=\"185\" loading=\"lazy\" src=\"../{}\" alt=\"Component-colored {}\"></div><h2 lang=\"zh-Hans\">{}</h2><p>{}</p><p><a href=\"../{}\">Open SVG</a></p></article>",
            file_name(glyph), escape(&glyph.character), escape(&glyph.character),
            escape(&glyph.decomposition), file_name(glyph)
        ));
    }
    html.push_str("</div></main></body></html>");
    html
}

pub(super) fn generate(glyphs: &[Glyph], dest: &Path) -> Result<(), String> {
    let components = lookup(glyphs);
    let dest = dest.join("by-component");
    fs::create_dir_all(&dest).map_err(|e| e.to_string())?;
    fs::write(dest.join("index.html"), component_index(&components))
        .map_err(|e| e.to_string())?;
    for (id, part) in &components {
        fs::write(dest.join(format!("{id}.html")), component_page(id, part))
            .map_err(|e| e.to_string())?;
    }
    println!("Generated reverse-navigation pages for {} component identities.", components.len());
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn pilot_component_reverse_index() {
        let glyphs = validate().unwrap();
        let components = lookup(&glyphs);
        let women = components.get("cmp-0014").unwrap();
        assert!(women.glyphs.iter().any(|g| g.character == "好"));
        assert!(women.glyphs.iter().any(|g| g.character == "妈"));
        assert_eq!(women.color, "#EA5202");
        assert!(component_page("cmp-0014", women).contains("../U+597D.svg"));
    }
}
