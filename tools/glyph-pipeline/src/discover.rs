use super::*;
use std::collections::{HashMap, HashSet};
use std::io::{BufRead, BufReader};

const SOURCE_REV: &str = "bddc96d41bef78427ed0e034e9f7e31d71fd1b92";

pub(super) struct Decomposition {
    forms: Vec<String>,
    ids: Vec<String>,
    colors: Vec<String>,
    matches: Vec<usize>,
    original: String,
}

pub(super) fn parse_parts(
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
    // Admit overlapping or non-overlapping IDS compositions only when every
    // source stroke explicitly maps to exactly one known terminal component.
    // A shared or unknown ownership path is rejected, not inferred.
    let arity = match token {
        '⿰' | '⿱' | '⿴' | '⿵' | '⿶' | '⿷' | '⿸' | '⿹' | '⿺' | '⿻' => 2,
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

pub(super) fn source_records(path: &Path, mut f: impl FnMut(Value) -> Result<(), String>) -> Result<(), String> {
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

pub(super) fn catalog_map() -> Result<HashMap<String, HashSet<String>>, String> {
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

pub(super) fn atomic_components() -> Result<HashMap<String, (String, String)>, String> {
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

pub(super) fn palette_shapes() -> Result<HashMap<String, (String, String)>, String> {
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

pub(super) fn matches_decomposition(
    item: &Value,
    catalog: &HashMap<String, HashSet<String>>,
    shapes: &HashMap<String, (String, String)>,
) -> Option<(String, Decomposition)> {
    let ch = item.get("character")?.as_str()?.to_owned();
    let known = catalog.get(&ch)?;
    let original = item.get("decomposition")?.as_str()?.to_owned();
    let chars: Vec<char> = original.chars().collect();
    if chars.len() < 3 || !matches!(chars[0], '⿰' | '⿱' | '⿲' | '⿳' | '⿴' | '⿵' | '⿶' | '⿷' | '⿸' | '⿹' | '⿺' | '⿻') {
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

pub(super) fn explain_dictionary_rejection(
    item: &Value,
    catalog: &HashMap<String, HashSet<String>>,
    shapes: &HashMap<String, (String, String)>,
) -> &'static str {
    if matches_decomposition(item, catalog, shapes).is_some() {
        return "source_owned_but_geometry_unavailable";
    }
    let original = match item.get("decomposition").and_then(Value::as_str) {
        Some(source) => source,
        None => return "no_dictionary_decomposition",
    };
    let chars: Vec<char> = original.chars().collect();
    if chars.contains(&'⿻') {
        return "overlapping_components_unresolved";
    }
    if chars.len() < 3 || !matches!(
        chars[0],
        '⿰' | '⿱' | '⿲' | '⿳' | '⿴' | '⿵' | '⿶' | '⿷' | '⿸' | '⿹' | '⿺'
    ) {
        return "unsupported_source_structure";
    }
    let ch = match item.get("character").and_then(Value::as_str) {
        Some(ch) => ch,
        None => return "invalid_dictionary_character",
    };
    let known = match catalog.get(ch) {
        Some(known) => known,
        None => return "not_in_catalog",
    };
    let any_palette: HashSet<String> =
        shapes.values().map(|(id, _)| id.clone()).collect();
    let mut cursor = 0;
    let mut parts = Vec::new();
    if parse_parts(&chars, &mut cursor, &mut Vec::new(), &mut parts, &any_palette, shapes).is_none()
        || cursor != chars.len()
        || parts.len() < 2
    {
        return "unresolved_source_components";
    }
    if parts.iter().any(|(_, _, id, _)| !known.contains(id)) {
        return "source_catalog_component_disagreement";
    }
    "ambiguous_or_partial_source_stroke_ownership"
}

fn raw_ids_nodes(chars: &[char], pos: &mut usize, path: &mut Vec<usize>,
    nodes: &mut HashMap<Vec<usize>,String>) -> Option<()> {
    if path.len()>8 { return None; }
    let c=*chars.get(*pos)?;
    *pos+=1;
    let arity=match c {
        '⿰'|'⿱'|'⿴'|'⿵'|'⿶'|'⿷'|'⿸'|'⿹'|'⿺'|'⿻'=>2,
        '⿲'|'⿳'=>3,
        _=>0,
    };
    if arity==0 {
        nodes.insert(path.clone(),c.to_string());
    } else {
        for i in 0..arity {
            path.push(i);
            raw_ids_nodes(chars,pos,path,nodes)?;
            path.pop();
        }
    }
    Some(())
}

fn parse_ids_leaves(decomposition:&str)->Option<HashMap<Vec<usize>,String>>{
    let chars:Vec<char>=decomposition.chars().collect();
    let mut nodes=HashMap::new();
    let mut pos=0;
    raw_ids_nodes(&chars,&mut pos,&mut Vec::new(),&mut nodes)?;
    (pos==chars.len()).then_some(nodes)
}

fn strict_catalog_path_reconciliation(
    source:&Value, selected:&Value,
    palette:&HashMap<String,(String,String)>
)->Option<Decomposition>{
    let source_ids=source.get("decomposition")?.as_str()?;
    let selected_ids=selected.get("ids_primary")?.as_str()?
        .split(';').next()?.split('(').next()?.trim();
    if source_ids.starts_with('⿻') || source_ids.contains('？') {return None;}
    // The catalog and source must at least agree on the enclosing IDS operator.
    if source_ids.chars().next()?!=selected_ids.chars().next()? {return None;}
    let source_leaves=parse_ids_leaves(source_ids)?;
    let selected_leaves=parse_ids_leaves(selected_ids)?;
    let instances=selected.get("component_instances")?.as_array()?;
    if instances.len()<2 {return None;}
    let mut paths=HashMap::new();
    let mut forms=Vec::new();
    let mut ids=Vec::new();
    let mut colors=Vec::new();
    for item in instances {
        let raw=item.get("path")?.as_str()?;
        let path=raw.split('.').map(|part|part.parse::<usize>().ok())
            .collect::<Option<Vec<usize>>>()?;
        let form=item.get("form")?.as_str()?;
        let id=item.get("id")?.as_str()?;
        let (registered_form,color)=palette.get(id)?;
        if registered_form!=form || paths.contains_key(&path) { return None; }
        // A source leaf can cover an entire catalog subtree, but the subtree's
        // *named* catalog source component must be exactly the same character.
        // Refuse to invent identities for unknown or differently labeled leaves.
        let ancestor=source_leaves.iter().filter(|(key,_)|
            key.len()<=path.len() && path.starts_with(key.as_slice())
        ).max_by_key(|(key,_)|key.len())?;
        if ancestor.0.len()==path.len() {
            if ancestor.1!=form {return None;}
        } else if selected_leaves.get(ancestor.0)!=Some(ancestor.1) {
            return None;
        }
        paths.insert(path,forms.len());
        forms.push(form.to_owned());
        ids.push(id.to_owned());
        colors.push(color.clone());
    }
    let raw_matches=source.get("matches")?.as_array()?;
    if raw_matches.is_empty(){return None;}
    let mut counts=vec![0usize;forms.len()];
    let mut matches=Vec::with_capacity(raw_matches.len());
    for item in raw_matches {
        let path=item.as_array()?.iter().map(|n|usize::try_from(n.as_u64()?).ok())
            .collect::<Option<Vec<usize>>>()?;
        // Every source stroke must name an exact catalog leaf. No distribution
        // by stroke order, location, spatial approximation, or character shape.
        let index=*paths.get(&path)?;
        counts[index]+=1;
        matches.push(index);
    }
    if counts.contains(&0){return None;}
    Some(Decomposition{forms,ids,colors,matches,original:source_ids.to_owned()})
}

fn load_matches(path: &Path) -> Result<HashMap<String, Decomposition>, String> {
    let catalog = catalog_map()?;
    let shapes = palette_shapes()?;
    let raw_catalog=load(&root().join("data/catalog/characters-0001-1000.json"))?;
    let catalog_rows=entries(&raw_catalog,"characters")?.iter()
        .map(|row|Ok((string(row,"character")?.to_owned(),row)))
        .collect::<Result<HashMap<_,_>,String>>()?;
    let palette_data=load(&root().join("palettes/mandarin-component-identity-v0.4.json"))?;
    let colors=entries(&palette_data,"components")?.iter().map(|item|Ok((
        string(item,"id")?.to_owned(),
        (string(item,"shape")?.to_owned(),string(item,"color")?.to_owned())
    ))).collect::<Result<HashMap<_,_>,String>>()?;
    let mut recovered=Vec::new();
    let mut known = HashMap::new();
    source_records(path, |record| {
        let direct=matches_decomposition(&record,&catalog,&shapes);
        let aligned=if direct.is_none() {
            record.get("character").and_then(Value::as_str)
                .and_then(|ch|catalog_rows.get(ch)
                    .and_then(|entry|strict_catalog_path_reconciliation(&record,entry,&colors))
                    .map(|d|(ch.to_owned(),d)))
        } else {None};
        if let Some((ch,decomposition))=direct.or(aligned.map(|(ch,d)| {
            recovered.push(ch.clone());
            (ch,d)
        })) {
            known.insert(ch,decomposition);
        }
        Ok(())
    })?;
    if !recovered.is_empty() {
        println!("Reconciled {} exact source ownership maps to finer catalog leaf paths: {}",
            recovered.len(),recovered.join(", "));
    }
    Ok(known)
}

fn documented_alternatives(path: &Path) -> Result<HashMap<String, Decomposition>, String> {
    let catalog = load(&root().join("data/catalog/characters-0001-1000.json"))?;
    let mut by_character = HashMap::new();
    for item in entries(&catalog,"characters")? {
        by_character.insert(string(item,"character")?.to_owned(), item.clone());
    }
    let shapes = palette_shapes()?;
    let palette_ids: HashSet<String> = shapes.values().map(|(id,_)| id.clone()).collect();
    let mut alternatives = HashMap::new();
    source_records(path, |dictionary| {
        let Some(ch) = dictionary.get("character").and_then(Value::as_str) else {
            return Ok(());
        };
        let Some(catalog) = by_character.get(ch) else { return Ok(()); };
        if !diagnostics::source_is_declared_alternative(catalog, &dictionary) {
            return Ok(());
        }
        let ids = HashMap::from([(ch.to_owned(),palette_ids.clone())]);
        if let Some((name, decomposition)) = matches_decomposition(&dictionary, &ids, &shapes) {
            if alternatives.insert(name.clone(), decomposition).is_some() {
                return Err(format!("duplicate documented alternative mapping for {name}"));
            }
        }
        Ok(())
    })?;
    Ok(alternatives)
}

fn partially_owned_source(
    row: &Value,
    catalog_ids: &HashSet<String>,
    shapes: &HashMap<String,(String,String)>
) -> Option<Decomposition> {
    let source = row.get("decomposition")?.as_str()?.to_owned();
    if source.chars().filter(|ch|*ch == '？').count() != 1 { return None; }
    let chars:Vec<char> = source.chars().collect();
    if chars.len() < 3 { return None; }
    let mut cursor = 0;
    let mut leaves = Vec::new();
    let mut allowed = catalog_ids.clone();
    allowed.insert(unknown::UNKNOWN_ID.to_owned());
    parse_parts(&chars, &mut cursor, &mut Vec::new(), &mut leaves, &allowed, shapes)?;
    if cursor != chars.len() || leaves.len() < 2 { return None; }
    let mut paths = HashMap::new();
    let mut unknown_index = None;
    let mut forms = Vec::new();
    let mut ids = Vec::new();
    let mut colors = Vec::new();
    for (index, (path, form, id, color)) in leaves.into_iter().enumerate() {
        if id == unknown::UNKNOWN_ID { unknown_index = Some(index); }
        if paths.insert(path,index).is_some() { return None; }
        forms.push(form);
        ids.push(id);
        colors.push(color);
    }
    let unknown_index = unknown_index?;
    let source_matches = row.get("matches")?.as_array()?;
    if source_matches.is_empty() { return None; }
    let mut matched_known = 0_usize;
    let mut matched_unknown = 0_usize;
    let mut matches = Vec::with_capacity(source_matches.len());
    for source_match in source_matches {
        // Only an exact terminal path counts as positively owned.
        // Null, non-leaf, or ambiguous mappings are neutral.
        let exact = source_match.as_array().and_then(|steps| {
            let steps:Option<Vec<usize>> = steps.iter()
                .map(|item|item.as_u64().and_then(|n|usize::try_from(n).ok()))
                .collect();
            steps.and_then(|steps|paths.get(&steps).copied())
        });
        let index = exact.unwrap_or(unknown_index);
        if index == unknown_index { matched_unknown += 1; }
        else { matched_known += 1; }
        matches.push(index);
    }
    if matched_known == 0 || matched_unknown == 0 { return None; }
    Some(Decomposition { forms,ids,colors,matches,original:source })
}

fn unresolved_component_matches(path: &Path) -> Result<HashMap<String,Decomposition>,String> {
    let catalog = catalog_map()?;
    let mut shapes = palette_shapes()?;
    shapes.insert(
        "？".to_owned(),
        (unknown::UNKNOWN_ID.to_owned(),unknown::UNKNOWN_FILL.to_owned())
    );
    let mut eligible = HashMap::new();
    source_records(path, |row| {
        let Some(ch) = row.get("character").and_then(Value::as_str) else { return Ok(()); };
        let Some(known_ids) = catalog.get(ch) else { return Ok(()); };
        if let Some(info) = partially_owned_source(&row,known_ids,&shapes) {
            if eligible.insert(ch.to_owned(),info).is_some() {
                return Err(format!("duplicate source unknown-component review for {ch}"));
            }
        }
        Ok(())
    })?;
    Ok(eligible)
}

fn alternative_from_source(ch: &str, info: Decomposition, graphic: &Value) -> Option<Glyph> {
    let paths = graphic.get("strokes")?.as_array()?;
    if paths.is_empty() || paths.len() != info.matches.len() { return None; }
    let mut strokes = Vec::with_capacity(paths.len());
    for (path, index) in paths.iter().zip(&info.matches) {
        let path = path.as_str()?;
        if !valid_path(path) { return None; }
        strokes.push(Stroke {
            path: path.to_owned(),
            id: info.ids.get(*index)?.clone(),
            color: info.colors.get(*index)?.clone(),
        });
    }
    let parts = (0..info.forms.len()).map(|i|(
        info.forms[i].clone(),info.ids[i].clone(),info.colors[i].clone()
    )).collect();
    Some(Glyph {
        character: ch.to_owned(),
        decomposition: info.original,
        parts,
        strokes,
        candidate: true,
    })
}

pub(super) fn run(dictionary: &Path, graphics: &Path) -> Result<(), String> {
    let mut pending = load_matches(dictionary)?;
    let mut alternate_source = documented_alternatives(dictionary)?;
    let mut unknown_source = unresolved_component_matches(dictionary)?;
    let mut atomics = atomic_components()?;
    let existing = validate()?;
    let curated: HashSet<String> = existing.iter().map(|g| g.character.clone()).collect();
    let mut discovered: Vec<Glyph> = Vec::new();
    let mut alternative_glyphs: Vec<Glyph> = Vec::new();
    let mut unknown_glyphs: Vec<Glyph> = Vec::new();
    let mut rejected = 0_usize;
    source_records(graphics, |record| {
        let ch = match record.get("character").and_then(Value::as_str) {
            Some(ch) => ch, None => return Ok(()),
        };
        if curated.contains(ch) { return Ok(()); }
        if let Some(info) = alternate_source.remove(ch) {
            if let Some(candidate) = alternative_from_source(ch,info,&record) {
                alternative_glyphs.push(candidate);
            }
        }
        if let Some(info) = unknown_source.remove(ch) {
            if let Some(candidate) = alternative_from_source(ch,info,&record) {
                unknown_glyphs.push(candidate);
            }
        }
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
    // Some sources list alternates for already-rendered characters.
    // Only publish this comparison queue for characters not in the active atlas.
    let active: HashSet<&str> = all.iter().map(|g| g.character.as_str()).collect();
    alternative_glyphs.retain(|g| !active.contains(g.character.as_str()));
    unknown_glyphs.retain(|g| !active.contains(g.character.as_str()));
    alternatives::generate(&alternative_glyphs,&all,&root().join("site/glyphs"))?;
    unknown::generate(&unknown_glyphs,&all,&root().join("site/glyphs"))?;
    diagnostics::generate(dictionary, &all, &root().join("site/glyphs"))?;
    profile::generate(&all, &root().join("site"))?;
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
    fn partial_unknown_paths_only_color_confirmed_known_owners() {
        let mut shapes = HashMap::from([
            ("又".into(), ("cmp-0463".into(), "#111111".into()))
        ]);
        shapes.insert(
            "？".into(),
            (unknown::UNKNOWN_ID.into(), unknown::UNKNOWN_FILL.into())
        );
        let catalog = HashSet::from(["cmp-0463".into()]);
        let record = serde_json::json!({
            "character":"友","decomposition":"⿸？又",
            "matches":[null,[1],[0],[1,0],[1]]
        });
        let matched = partially_owned_source(&record,&catalog,&shapes).unwrap();
        // Null or nonterminal paths never receive the known color.
        assert_eq!(matched.matches,[0,1,0,0,1]);
        assert_eq!(matched.ids[0],unknown::UNKNOWN_ID);
        assert_eq!(matched.ids[1],"cmp-0463");
    }

    #[test]
    fn unknown_source_leaf_keeps_known_color_and_neutral_review_fill() {
        let mut shapes = HashMap::from([
            ("又".into(), ("cmp-0463".into(), "#111111".into())),
        ]);
        shapes.insert(
            "？".into(),
            (unknown::UNKNOWN_ID.into(),unknown::UNKNOWN_FILL.into()),
        );
        let catalog = HashMap::from([("友".into(),HashSet::from([
            "cmp-0463".into(),unknown::UNKNOWN_ID.into()
        ]))]);
        let dictionary = serde_json::json!({
            "character":"友","decomposition":"⿸？又",
            "matches":[[0],[0],[1],[1]]
        });
        let matched = matches_decomposition(&dictionary,&catalog,&shapes).unwrap().1;
        let graphics = serde_json::json!({
            "strokes":[
                "M 100 200 L 400 500 Z",
                "M 100 200 L 400 500 Z",
                "M 100 200 L 400 500 Z",
                "M 100 200 L 400 500 Z"
            ]
        });
        // The parser refuses geometric inventions: only exact, source-owned
        // paths are retained, and unknown ownership has no component color.
        let glyph = alternative_from_source("友",matched,&graphics).unwrap();
        assert_eq!(glyph.strokes[0].id,unknown::UNKNOWN_ID);
        assert_eq!(glyph.strokes[0].color,unknown::UNKNOWN_FILL);
        assert_eq!(glyph.strokes[3].id,"cmp-0463");
    }

    #[test]
    fn bridge_requires_explicit_source_paths_for_every_catalog_component() {
        let palette=HashMap::from([
            ("cmp-human".into(),("人".into(),"#111111".into())),
            ("cmp-one".into(),("一".into(),"#222222".into()))
        ]);
        let catalog=serde_json::json!({
            "ids_primary":"⿱从一",
            "component_instances":[
                {"path":"0.0","form":"人","id":"cmp-human"},
                {"path":"0.1","form":"人","id":"cmp-human"},
                {"path":"1","form":"一","id":"cmp-one"}
            ]
        });
        // This positive case is only allowed when the source labels *each*
        // nested path; a flat path [0] is not enough to split 从 into two 人.
        let complete=serde_json::json!({
            "decomposition":"⿱从一",
            "matches":[[0,0],[0,0],[0,1],[0,1],[1]]
        });
        assert_eq!(strict_catalog_path_reconciliation(&complete,&catalog,&palette)
            .unwrap().matches,[0,0,1,1,2]);
        let flattened=serde_json::json!({
            "decomposition":"⿱从一",
            "matches":[[0],[0],[0],[0],[1]]
        });
        assert!(strict_catalog_path_reconciliation(&flattened,&catalog,&palette).is_none());
        let ambiguous=serde_json::json!({
            "decomposition":"⿱从一",
            "matches":[[0,0],null,[0,1],[0,1],[1]]
        });
        assert!(strict_catalog_path_reconciliation(&ambiguous,&catalog,&palette).is_none());
        let wrong=serde_json::json!({
            "decomposition":"⿱比一",
            "matches":[[0,0],[0,0],[0,1],[0,1],[1]]
        });
        assert!(strict_catalog_path_reconciliation(&wrong,&catalog,&palette).is_none());
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
    fn overlap_requires_unique_source_owned_strokes() {
        let catalog = HashMap::from([("巫".into(), HashSet::from([
            "cmp-left".into(), "cmp-right".into(),
        ]))]);
        let shapes = HashMap::from([
            ("工".into(), ("cmp-left".into(), "#111111".into())),
            ("从".into(), ("cmp-right".into(), "#222222".into())),
        ]);
        let aligned = serde_json::json!({
            "character":"巫", "decomposition":"⿻工从",
            "matches":[[0],[1],[0],[1]]
        });
        assert_eq!(
            matches_decomposition(&aligned, &catalog, &shapes).unwrap().1.matches,
            [0,1,0,1]
        );
        let unowned = serde_json::json!({
            "character":"巫", "decomposition":"⿻工从",
            "matches":[[0],[1],null,[1]]
        });
        assert!(matches_decomposition(&unowned, &catalog, &shapes).is_none());
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
        for ids in ["⿼宀子", "⿰宀？", "⿰宀", "⿰宀子子"] {
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
