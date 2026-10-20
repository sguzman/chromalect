use super::*;
use std::collections::{HashMap, HashSet};
use std::io::{BufRead, BufReader};

const SOURCE_REV: &str = "bddc96d41bef78427ed0e034e9f7e31d71fd1b92";

struct Decomposition {
    forms: [String; 2],
    ids: [String; 2],
    colors: [String; 2],
    matches: Vec<usize>,
    original: String,
}

fn source_records(path: &Path, mut f: impl FnMut(Value) -> Result<(), String>) -> Result<(), String> {
    let file = fs::File::open(path).map_err(|e| format!("{}: {e}", path.display()))?;
    for (i, line) in BufReader::new(file).lines().enumerate() {
        let line = line.map_err(|e| e.to_string())?;
        if line.trim().is_empty() { continue; }
        let entry: Value = serde_json::from_str(&line)
            .map_err(|e| format!("{}:{}: {e}", path.display(), i + 1))?;
        f(entry)?;
    }
    Ok(())
}

fn catalog_map() -> Result<HashMap<String, HashSet<String>>, String> {
    let v = load(&root().join("data/catalog/characters-0001-1000.json"))?;
    let mut map = HashMap::new();
    for record in entries(&v, "characters")? {
        let character = string(record, "character")?.to_owned();
        let mut ids = HashSet::new();
        for id in entries(record, "component_ids")? {
            if let Some(id) = id.as_str() { ids.insert(id.to_owned()); }
        }
        map.insert(character, ids);
    }
    Ok(map)
}

fn palette_shapes() -> Result<HashMap<String, (String, String)>, String> {
    let v = load(&root().join("palettes/mandarin-component-identity-v0.4.json"))?;
    let mut unique = HashMap::new();
    let mut duplicates = HashSet::new();
    for row in entries(&v, "components")? {
        let shape = string(row, "shape")?.to_owned();
        if unique.insert(shape.clone(), (string(row, "id")?.to_owned(), string(row, "color")?.to_owned())).is_some() {
            duplicates.insert(shape);
        }
    }
    for shape in duplicates { unique.remove(&shape); }
    Ok(unique)
}

fn matches_decomposition(
    item: &Value,
    catalog: &HashMap<String, HashSet<String>>,
    shapes: &HashMap<String, (String, String)>,
) -> Option<(String, Decomposition)> {
    let ch = item.get("character")?.as_str()?.to_owned();
    let known = catalog.get(&ch)?;
    let original = item.get("decomposition")?.as_str()?.to_owned();
    let chars: Vec<char> = original.chars().collect();
    // For non-overlapping two-way arrangements only. Nested and enclosure
    // layouts need explicit recursive ownership support and visual review.
    if chars.len() != 3 || !matches!(chars[0], '⿰' | '⿱') { return None; }
    let first = chars[1].to_string();
    let second = chars[2].to_string();
    let (id0, c0) = shapes.get(&first)?.clone();
    let (id1, c1) = shapes.get(&second)?.clone();
    if !known.contains(&id0) || !known.contains(&id1) { return None; }
    let raw = item.get("matches")?.as_array()?;
    let mut stroke_matches = Vec::new();
    let mut counts = [0_usize; 2];
    for match_item in raw {
        let path = match_item.as_array()?;
        if path.len() != 1 { return None; }
        let idx = usize::try_from(path[0].as_u64()?).ok()?;
        if idx > 1 { return None; }
        counts[idx] += 1;
        stroke_matches.push(idx);
    }
    if counts.contains(&0) { return None; }
    Some((ch, Decomposition {
        forms: [first, second], ids: [id0, id1], colors: [c0, c1],
        matches: stroke_matches, original,
    }))
}

fn load_matches(path: &Path) -> Result<HashMap<String, Decomposition>, String> {
    let catalog = catalog_map()?;
    let shapes = palette_shapes()?;
    let mut known = HashMap::new();
    source_records(path, |record| {
        if let Some((ch, decomposition)) = matches_decomposition(&record, &catalog, &shapes) {
            known.insert(ch, decomposition);
        }
        Ok(())
    })?;
    Ok(known)
}

pub(super) fn run(dictionary: &Path, graphics: &Path) -> Result<(), String> {
    let mut pending = load_matches(dictionary)?;
    let existing = validate()?;
    let curated: HashSet<String> = existing.iter().map(|g| g.character.clone()).collect();
    let mut discovered: Vec<Glyph> = Vec::new();
    let mut rejected = 0_usize;
    source_records(graphics, |record| {
        let ch = match record.get("character").and_then(Value::as_str) {
            Some(ch) => ch, None => return Ok(()),
        };
        if curated.contains(ch) { return Ok(()); }
        let info = match pending.remove(ch) {
            Some(info) => info, None => return Ok(()),
        };
        let paths = match record.get("strokes").and_then(Value::as_array) {
            Some(paths) if paths.len() == info.matches.len() => paths,
            _ => { rejected += 1; return Ok(()); }
        };
        let mut strokes = Vec::new();
        for (path, part) in paths.iter().zip(&info.matches) {
            let p = match path.as_str() {
                Some(p) if super::valid_path(p) => p,
                _ => { rejected += 1; return Ok(()); }
            };
            strokes.push(Stroke {
                path: p.to_owned(),
                id: info.ids[*part].clone(),
                color: info.colors[*part].clone(),
            });
        }
        if strokes.is_empty() { rejected += 1; return Ok(()); }
        discovered.push(Glyph {
            character: ch.to_owned(),
            decomposition: info.original,
            parts: (0..2).map(|i| (
                info.forms[i].clone(),
                info.ids[i].clone(),
                info.colors[i].clone(),
            )).collect(),
            strokes,
            candidate: true,
        });
        Ok(())
    })?;
    discovered.sort_by_key(|g| g.character.chars().next().unwrap() as u32);
    let count = discovered.len();
    let mut all = existing;
    all.extend(discovered);
    build(&all)?;
    println!(
        "Generated {} SVGs: {} curated and {} source-derived candidates; {} incomplete geometry cases; {} source candidates without usable geometry.",
        all.len(), curated.len(), count, rejected, pending.len()
    );
    Ok(())
}

pub(super) fn source_revision() -> &'static str { SOURCE_REV }

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn simple_two_component_dictionary_record() {
        let catalog = HashMap::from([("好".into(), HashSet::from(["cmp-0014".into(), "cmp-0015".into()]))]);
        let shapes = HashMap::from([
            ("女".into(), ("cmp-0014".into(), "#EA5202".into())),
            ("子".into(), ("cmp-0015".into(), "#98518A".into())),
        ]);
        let item = serde_json::json!({
            "character":"好", "decomposition":"⿰女子",
            "matches":[[0],[0],[0],[1],[1],[1]]
        });
        let result = matches_decomposition(&item, &catalog, &shapes).unwrap().1;
        assert_eq!(result.matches, [0,0,0,1,1,1]);
        assert_eq!(result.ids, ["cmp-0014","cmp-0015"]);
    }
    #[test]
    fn ambiguous_mapping_is_rejected() {
        let catalog = HashMap::from([("好".into(), HashSet::from(["cmp-0014".into(), "cmp-0015".into()]))]);
        let shapes = HashMap::from([
            ("女".into(), ("cmp-0014".into(), "#EA5202".into())),
            ("子".into(), ("cmp-0015".into(), "#98518A".into())),
        ]);
        for matches in [serde_json::json!([[0],null,[1]]), serde_json::json!([[0],[0,1],[1]])] {
            let item = serde_json::json!({"character":"好","decomposition":"⿰女子","matches":matches});
            assert!(matches_decomposition(&item, &catalog, &shapes).is_none());
        }
    }
}
