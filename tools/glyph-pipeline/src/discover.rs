use super::*;
use std::collections::{HashMap, HashSet};
use std::io::{BufRead, BufReader};

const SOURCE_REV: &str = "bddc96d41bef78427ed0e034e9f7e31d71fd1b92";

struct Decomposition {
    forms: Vec<String>,
    ids: Vec<String>,
    colors: Vec<String>,
    matches: Vec<usize>,
    original: String,
}

fn parse_parts(
    chars: &[char],
    cursor: &mut usize,
    path: &mut Vec<usize>,
    parts: &mut Vec<(Vec<usize>, String, String, String)>,
    known: &HashSet<String>,
    shapes: &HashMap<String, (String, String)>,
) -> Option<()> {
    if path.len() > 6 || parts.len() > 8 { return None; }
    let token = *chars.get(*cursor)?;
    *cursor += 1;
    // Accept standard binary IDS arrangements only when each stroke points
    // to an exact terminal leaf. Overlap (⿻), unknown fragments and
    // unsupported operators are rejected instead of receiving inferred colors.
    let arity = match token {
        '⿰' | '⿱' | '⿴' | '⿵' | '⿶' | '⿷' | '⿸' | '⿹' | '⿺' => 2,
        '⿲' | '⿳' => 3,
        _ => 0,
    };
    if arity > 0 {
        for index in 0..arity {
            path.push(index);
            parse_parts(chars, cursor, path, parts, known, shapes)?;
            path.pop();
        }
    } else {
        let form = token.to_string();
        let (id, color) = shapes.get(&form)?.clone();
        if !known.contains(&id) { return None; }
        parts.push((path.clone(), form, id, color));
        if parts.len() > 8 { return None; }
    }
    Some(())
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

fn atomic_components() -> Result<HashMap<String, (String, String)>, String> {
    let palette = load(&root().join("palettes/mandarin-component-identity-v0.4.json"))?;
    let catalog = load(&root().join("data/catalog/characters-0001-1000.json"))?;
    let mut identities = HashMap::new();
    for component in entries(&palette, "components")? {
        identities.insert(
            string(component, "id")?.to_owned(),
            (string(component, "shape")?.to_owned(), string(component, "color")?.to_owned()),
        );
    }
    let mut result = HashMap::new();
    for row in entries(&catalog, "characters")? {
        if row.get("structural_status").and_then(Value::as_str) != Some("atomic_recognizer") {
            continue;
        }
        let character = string(row, "character")?;
        let instances = entries(row, "component_instances")?;
        if instances.len() != 1 { continue; }
        let part = &instances[0];
        if part.get("path").and_then(Value::as_str) != Some("root")
            || part.get("form").and_then(Value::as_str) != Some(character)
        { continue; }
        let id = string(part, "id")?;
        let Some((shape, color)) = identities.get(id) else { continue; };
        if shape == character {
            result.insert(character.to_owned(), (id.to_owned(), color.clone()));
        }
    }
    Ok(result)
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
    if chars.len() < 3 || !matches!(chars[0], '⿰' | '⿱' | '⿲' | '⿳' | '⿴' | '⿵' | '⿶' | '⿷' | '⿸' | '⿹' | '⿺') {
        return None;
    }
    let mut cursor = 0;
    let mut leaves = Vec::new();
    parse_parts(&chars, &mut cursor, &mut Vec::new(), &mut leaves, known, shapes)?;
    if cursor != chars.len() || leaves.len() < 2 { return None; }
    let mut ownership = HashMap::new();
    let mut forms = Vec::new();
    let mut ids = Vec::new();
    let mut colors = Vec::new();
    for (index, (path, form, id, color)) in leaves.into_iter().enumerate() {
        if ownership.insert(path, index).is_some() { return None; }
        forms.push(form);
        ids.push(id);
        colors.push(color);
    }
    let raw = item.get("matches")?.as_array()?;
    if raw.is_empty() { return None; }
    let mut stroke_matches = Vec::new();
    let mut counts = vec![0_usize; forms.len()];
    for match_item in raw {
        let indices = match_item.as_array()?;
        let mut path = Vec::new();
        for step in indices {
            path.push(usize::try_from(step.as_u64()?).ok()?);
        }
        let idx = *ownership.get(&path)?;
        counts[idx] += 1;
        stroke_matches.push(idx);
    }
    if counts.contains(&0) { return None; }
    Some((ch, Decomposition {
        forms, ids, colors, matches: stroke_matches, original,
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
    let mut atomics = atomic_components()?;
    let existing = validate()?;
    let curated: HashSet<String> = existing.iter().map(|g| g.character.clone()).collect();
    let mut discovered: Vec<Glyph> = Vec::new();
    let mut rejected = 0_usize;
    source_records(graphics, |record| {
        let ch = match record.get("character").and_then(Value::as_str) {
            Some(ch) => ch, None => return Ok(()),
        };
        if curated.contains(ch) { return Ok(()); }
        let mapping = pending.remove(ch);
        let atomic = if mapping.is_none() { atomics.remove(ch) } else { None };
        if mapping.is_none() && atomic.is_none() { return Ok(()); }
        let paths = match record.get("strokes").and_then(Value::as_array) {
            Some(paths) if !paths.is_empty()
                && mapping.as_ref().is_none_or(|info| paths.len() == info.matches.len()) => paths,
            _ => { rejected += 1; return Ok(()); }
        };
        let mut strokes = Vec::new();
        for (index, path) in paths.iter().enumerate() {
            let p = match path.as_str() {
                Some(p) if super::valid_path(p) => p,
                _ => { rejected += 1; return Ok(()); }
            };
            let (id, color) = if let Some(info) = &mapping {
                let part = info.matches[index];
                (&info.ids[part], &info.colors[part])
            } else {
                let a = atomic.as_ref().expect("single component identity");
                (&a.0, &a.1)
            };
            strokes.push(Stroke {
                path: p.to_owned(),
                id: id.clone(),
                color: color.clone(),
            });
        }
        if strokes.is_empty() { rejected += 1; return Ok(()); }
        let (decomposition, parts) = if let Some(info) = mapping {
            (
                info.original,
                (0..info.forms.len()).map(|i| (
                    info.forms[i].clone(), info.ids[i].clone(), info.colors[i].clone()
                )).collect()
            )
        } else {
            let (id, color) = atomic.expect("single component identity");
            (ch.to_owned(), vec![(ch.to_owned(), id, color)])
        };
        discovered.push(Glyph {
            character: ch.to_owned(),
            decomposition,
            parts,
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
    atlas::integrate(&all)?;
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
    fn atomic_root_component_is_colorable_as_a_whole_glyph() {
        let atomics = atomic_components().unwrap();
        let (id, color) = atomics.get("一").unwrap();
        assert_eq!(id, "cmp-0171");
        assert_eq!(color, "#8D2929");
        assert!(!atomics.contains_key("好"));
    }

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
    fn nested_components_are_resolved_by_exact_leaf_paths() {
        let catalog = HashMap::from([("例".into(), HashSet::from([
            "cmp-a".into(), "cmp-b".into(), "cmp-c".into(),
        ]))]);
        let shapes = HashMap::from([
            ("亻".into(), ("cmp-a".into(), "#111111".into())),
            ("歹".into(), ("cmp-b".into(), "#222222".into())),
            ("刂".into(), ("cmp-c".into(), "#333333".into())),
        ]);
        let item = serde_json::json!({
            "character":"例", "decomposition":"⿰亻⿰歹刂",
            "matches":[[0],[0],[1,0],[1,0],[1,1],[1,1]]
        });
        let r = matches_decomposition(&item, &catalog, &shapes).unwrap().1;
        assert_eq!(r.forms, ["亻", "歹", "刂"]);
        assert_eq!(r.matches, [0,0,1,1,2,2]);
        let ambiguous = serde_json::json!({
            "character":"例", "decomposition":"⿰亻⿰歹刂",
            "matches":[[0],[1],[1,0],[1,1]]
        });
        assert!(matches_decomposition(&ambiguous, &catalog, &shapes).is_none());
    }

    #[test]
    fn enclosure_requires_exact_stroke_to_leaf_ownership() {
        let catalog = HashMap::from([("死".into(), HashSet::from([
            "cmp-0101".into(), "cmp-0058".into(),
        ]))]);
        let shapes = HashMap::from([
            ("歹".into(), ("cmp-0101".into(), "#6863B1".into())),
            ("匕".into(), ("cmp-0058".into(), "#7C7DF6".into())),
        ]);
        let item = serde_json::json!({
            "character":"死", "decomposition":"⿸歹匕",
            "matches":[[0],[0],[1],[1]]
        });
        assert_eq!(
            matches_decomposition(&item, &catalog, &shapes).unwrap().1.matches,
            [0,0,1,1],
        );
        let uncertain = serde_json::json!({
            "character":"死", "decomposition":"⿸歹匕",
            "matches":[[0],null,[1],[1]]
        });
        assert!(matches_decomposition(&uncertain, &catalog, &shapes).is_none());
    }

    #[test]
    fn rejected_decomposition_types_are_not_guessed() {
        let catalog = HashMap::from([("字".into(), HashSet::from([
            "cmp-a".into(), "cmp-b".into()
        ]))]);
        let shapes = HashMap::from([
            ("宀".into(), ("cmp-a".into(), "#111111".into())),
            ("子".into(), ("cmp-b".into(), "#222222".into())),
        ]);
        for ids in ["⿻宀子", "⿰宀？", "⿰宀", "⿰宀子子"] {
            let row = serde_json::json!({
                "character":"字", "decomposition":ids, "matches":[[0],[1]]
            });
            assert!(matches_decomposition(&row, &catalog, &shapes).is_none());
        }
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
