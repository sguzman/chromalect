use super::*;
use serde_json::json;
use std::collections::BTreeMap;

const REVIEW_PAGE_SIZE: usize = 36;

#[derive(Clone, Copy)]
struct Bounds {
    min_x: f64,
    min_y: f64,
    max_x: f64,
    max_y: f64,
}

impl Bounds {
    fn center_x(&self) -> f64 { (self.min_x + self.max_x) * 0.5 }
    fn center_y(&self) -> f64 { (self.min_y + self.max_y) * 0.5 }
    fn merge(&mut self, other: Bounds) {
        self.min_x = self.min_x.min(other.min_x);
        self.min_y = self.min_y.min(other.min_y);
        self.max_x = self.max_x.max(other.max_x);
        self.max_y = self.max_y.max(other.max_y);
    }
}

fn outline_bounds(path: &str) -> Option<Bounds> {
    let mut cleaned = String::new();
    for ch in path.chars() {
        if ch == '-' && cleaned.chars().last().is_some_and(|last| last.is_ascii_digit()) {
            cleaned.push(' ');
        }
        if ch.is_ascii_digit() || matches!(ch, '-' | '+' | '.') {
            cleaned.push(ch);
        } else {
            cleaned.push(' ');
        }
    }
    let values: Vec<f64> = cleaned.split_whitespace()
        .map(|s| s.parse::<f64>().ok()).collect::<Option<Vec<_>>>()?;
    if values.len() < 4 || values.len() % 2 != 0 { return None; }
    let mut b = Bounds {
        min_x: f64::INFINITY, min_y: f64::INFINITY,
        max_x: f64::NEG_INFINITY, max_y: f64::NEG_INFINITY,
    };
    for xy in values.chunks_exact(2) {
        let (x,y) = (xy[0], xy[1]);
        if !x.is_finite() || !y.is_finite() { return None; }
        b.min_x = b.min_x.min(x);
        b.max_x = b.max_x.max(x);
        b.min_y = b.min_y.min(y);
        b.max_y = b.max_y.max(y);
    }
    Some(b)
}

fn flags(glyph: &Glyph) -> Vec<&'static str> {
    let mut problems = Vec::new();
    let mut owners: BTreeMap<&str, Bounds> = BTreeMap::new();
    for stroke in &glyph.strokes {
        let Some(bounds) = outline_bounds(&stroke.path) else {
            if !problems.contains(&"unparseable_path") { problems.push("unparseable_path"); }
            continue;
        };
        if bounds.min_x < -256.0 || bounds.max_x > 1280.0
            || bounds.min_y < -400.0 || bounds.max_y > 1150.0
        {
            if !problems.contains(&"coordinates_outside_expected_range") {
                problems.push("coordinates_outside_expected_range");
            }
        }
        if let Some(current) = owners.get_mut(stroke.id.as_str()) {
            current.merge(bounds);
        } else {
            owners.insert(stroke.id.as_str(), bounds);
        }
    }
    // A coarse visual-review prompt, not a linguistic or shape certification.
    // Only use this rule when exactly two *different* leaf identities exist.
    if glyph.decomposition.chars().count() == 3
        && glyph.parts.len() == 2
        && glyph.parts[0].1 != glyph.parts[1].1
    {
        let first = owners.get(glyph.parts[0].1.as_str());
        let second = owners.get(glyph.parts[1].1.as_str());
        if let (Some(a),Some(b)) = (first,second) {
            match glyph.decomposition.chars().next().unwrap() {
                '⿰' if a.center_x() >= b.center_x() => problems.push("horizontal_component_order_check"),
                '⿱' if a.center_y() <= b.center_y() => problems.push("vertical_component_order_check"),
                _ => {}
            }
        }
    }
    problems
}

fn review_page_name(i: usize) -> String {
    if i == 0 { "index.html".into() } else { format!("page-{:02}.html",i + 1) }
}

fn review_navigation(count: usize, page: usize) -> String {
    let total = count.div_ceil(REVIEW_PAGE_SIZE);
    let mut html = String::from("<nav class=\"pager\" aria-label=\"Geometry review pages\">");
    for index in 0..total {
        let left = index * REVIEW_PAGE_SIZE + 1;
        let right = ((index + 1) * REVIEW_PAGE_SIZE).min(count);
        html.push_str(&format!(
            "<a href=\"{}\"{}>{left}–{right}</a>",
            review_page_name(index), if page == index { " aria-current=\"page\"" } else { "" }
        ));
    }
    html.push_str("</nav>");
    html
}

pub(super) fn generate(glyphs: &[Glyph], root: &Path) -> Result<(), String> {
    let path = root.join("review");
    fs::create_dir_all(&path).map_err(|e| e.to_string())?;
    let mut records = Vec::new();
    let mut flagged_count = 0_usize;
    for glyph in glyphs {
        let problems = flags(glyph);
        if !problems.is_empty() { flagged_count += 1; }
        records.push(json!({
            "character": glyph.character,
            "decomposition": glyph.decomposition,
            "source_category": if glyph.candidate { "source_derived_candidate" } else { "curated_source_aligned_pilot" },
            "component_ids": glyph.parts.iter().map(|p| p.1.clone()).collect::<Vec<_>>(),
            "stroke_count": glyph.strokes.len(),
            "geometry_review_flags": problems,
            "independently_visually_reviewed": false,
        }));
    }
    for page in 0..glyphs.len().div_ceil(REVIEW_PAGE_SIZE) {
        let mut html = String::from("<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>Geometry review · Chromalect</title><link rel=\"stylesheet\" href=\"../../style.css\"></head><body><main class=\"wrap\"><p><a href=\"../../index.html\">Chromalect</a> / <a href=\"../index.html\">Colored glyphs</a> / Geometry review</p><h1>Side-by-side geometry review</h1><p class=\"intro\">The left glyph uses the native browser font. The right glyph uses the pinned source-aligned SVG outlines with component colors. Differences in style are expected; source ownership and glyph shape still require independent visual validation. Automatic placement flags only prioritize review; they are not certifications.</p><p><a href=\"report.json\">Machine-readable geometry review report</a></p>");
        html.push_str(&review_navigation(glyphs.len(), page));
        html.push_str("<div class=\"review-grid\">");
        for glyph in glyphs.iter().skip(page * REVIEW_PAGE_SIZE).take(REVIEW_PAGE_SIZE) {
            let issues = flags(glyph);
            let issue_note = if issues.is_empty() { "No automatic placement warning".to_owned() }
                else { format!("Review flags: {}",issues.join(", ")) };
            let components = glyph.parts.iter().map(|(form,id,color)| {
                format!("<span class=\"stroke-token\"><i class=\"stroke-dot\" style=\"background:{}\"></i>{} <small>{}</small></span>",
                    escape(color), escape(form), escape(id))
            }).collect::<Vec<_>>().join("");
            html.push_str(&format!(
                "<article class=\"review-item\"><div class=\"review-pair\"><div><span class=\"review-native\" lang=\"zh-Hans\">{}</span><small>Native font</small></div><div><img src=\"../{}\" loading=\"lazy\" width=\"112\" height=\"112\" alt=\"Source-aligned component coloring for {}\"><small>Source SVG</small></div></div><p><b>{}</b> · {} strokes</p><div class=\"stroke-token-row\">{}</div><p class=\"hint\">{}</p><p><a href=\"../{}\">Open SVG</a></p></article>",
                escape(&glyph.character), file_name(glyph), escape(&glyph.character),
                escape(&glyph.decomposition),glyph.strokes.len(),components,escape(&issue_note),file_name(glyph)
            ));
        }
        html.push_str("</div>");
        html.push_str(&review_navigation(glyphs.len(),page));
        html.push_str("</main></body></html>");
        fs::write(path.join(review_page_name(page)), html).map_err(|e| e.to_string())?;
    }
    let report = json!({
        "schema": "chromalect.geometry-review.v1",
        "total_glyphs": glyphs.len(),
        "flagged_for_additional_review": flagged_count,
        "independently_certified_count": 0,
        "method": "Non-certifying path extent and simple horizontal/vertical grouping checks. Source geometry and catalog component interpretation still need independent human/visual validation.",
        "glyphs": records,
    });
    fs::write(path.join("report.json"),format!("{}\n",serde_json::to_string_pretty(&report).map_err(|e| e.to_string())?))
        .map_err(|e| e.to_string())?;
    println!("Geometry review: {} glyphs, {} flagged for closer inspection.",glyphs.len(),flagged_count);
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn path_extent_parses_svg_numbers_without_order_training() {
        let b = outline_bounds("M 10 20 Q 30 40 50 60 L 70 -10 Z").unwrap();
        assert_eq!(b.min_x, 10.0);
        assert_eq!(b.max_x, 70.0);
        assert_eq!(b.min_y, -10.0);
        assert_eq!(b.max_y, 60.0);
        assert!(outline_bounds("M 30 Z").is_none());
    }
    #[test]
    fn pilot_glyphs_have_reviewable_geometry() {
        let glyphs = validate().unwrap();
        assert!(glyphs.iter().all(|g| !g.strokes.is_empty()));
        assert!(glyphs.iter().all(|g| g.strokes.iter().all(|s| outline_bounds(&s.path).is_some())));
    }
}
