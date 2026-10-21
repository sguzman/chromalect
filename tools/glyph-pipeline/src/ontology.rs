use super::*;
use serde_json::Value;
use std::collections::{HashMap, HashSet};

fn graph_nodes(graph: &Value) -> Result<HashMap<&str,&Value>,String> {
    let mut result = HashMap::new();
    for node in entries(graph,"nodes")? {
        let id = string(node,"id")?;
        if result.insert(id,node).is_some() {
            return Err(format!("duplicate instance {id}"));
        }
    }
    Ok(result)
}

fn validate_graph(vocab: &Value, graph: &Value) -> Result<(),String> {
    if string(vocab,"schema")? != "chromalect.ontology.v1"
        || string(graph,"schema")? != "chromalect.ontology-instances.v1" {
        return Err("incompatible ontology document schemas".into());
    }
    let mut classes = HashSet::new();
    for item in entries(vocab,"classes")? {
        let id = string(item,"id")?;
        if !classes.insert(id) { return Err(format!("duplicate class {id}")); }
        if string(item,"definition")?.len() < 12 {
            return Err(format!("insufficient definition of {id}"));
        }
    }
    if classes.len() < 30 { return Err("class vocabulary incomplete".into()); }
    let mut relations = HashMap::new();
    for item in entries(vocab,"relations")? {
        let id = string(item,"id")?;
        if !classes.contains(string(item,"domain")?) { return Err(format!("{id}: unknown domain")); }
        let targets = entries(item,"range")?;
        if targets.is_empty() || targets.iter().any(|x|!x.as_str().is_some_and(|k|classes.contains(k))) {
            return Err(format!("{id}: invalid target class"));
        }
        if relations.insert(id,item).is_some() { return Err(format!("duplicate relation {id}")); }
    }
    if relations.len() < 30 { return Err("relation vocabulary incomplete".into()); }
    let states: HashSet<&str> = entries(get(vocab,"controlledTerms")?,"evidenceStatus")?
        .iter().map(|v|v.as_str().ok_or("status must be a string"))
        .collect::<Result<_,_>>()?;
    let nodes = graph_nodes(graph)?;
    for (id,node) in &nodes {
        if !classes.contains(string(node,"type")?) { return Err(format!("{id}: invalid type")); }
        if !states.contains(string(node,"status")?) { return Err(format!("{id}: invalid status")); }
        if !get(node,"data")?.is_object() { return Err(format!("{id}: data must be an object")); }
    }
    let mut seen = HashSet::new();
    for edge in entries(graph,"edges")? {
        let from = string(edge,"from")?;
        let to = string(edge,"to")?;
        let relation = string(edge,"relation")?;
        if !seen.insert((from,relation,to)) { return Err(format!("duplicate edge {relation}")); }
        let signature = relations.get(relation).ok_or_else(||format!("unknown relation {relation}"))?;
        let subject = nodes.get(from).ok_or_else(||format!("unknown graph subject {from}"))?;
        let object = nodes.get(to).ok_or_else(||format!("unknown graph target {to}"))?;
        let subject_type = string(subject,"type")?;
        let object_type = string(object,"type")?;
        if subject_type != string(signature,"domain")?
            || !entries(signature,"range")?.iter().any(|v|v.as_str()==Some(object_type)) {
            return Err(format!("{relation} has invalid domain/range {subject_type} -> {object_type}"));
        }
    }
    Ok(())
}

fn verify_bindings(vocab: &Value) -> Result<(),String> {
    let mut seen = HashSet::new();
    for b in entries(vocab,"bindings")? {
        let id = string(b,"id")?;
        if !seen.insert(id) { return Err(format!("duplicate binding {id}")); }
        let path = string(b,"path")?;
        if path.starts_with("site/glyphs/") || path.starts_with("site/profiles/") { continue; } // generated in Pages CI
        let target = load(&root().join(path))?;
        if let Some(schema) = b.get("schema").and_then(Value::as_str) {
            if string(&target,"schema")? != schema {
                return Err(format!("{id}: canonical schema changed"));
            }
        }
        if let Some(version) = b.get("version").and_then(Value::as_str) {
            if string(&target,"version")? != version {
                return Err(format!("{id}: canonical version changed"));
            }
        }
        if let Some(count) = b.get("count").and_then(Value::as_u64) {
            let member = match string(b,"kind")? {
                "Palette" => "components",
                "Character"|"CitationReading" => "characters",
                "Glyph" => "glyphs",
                other => return Err(format!("{id}: count kind unsupported {other}")),
            };
            if entries(&target,member)?.len() as u64 != count {
                return Err(format!("{id}: source count disagrees with binding"));
            }
        }
    }
    Ok(())
}

fn verify_example(graph: &Value) -> Result<(),String> {
    let nodes = graph_nodes(graph)?;
    let catalog = load(&root().join("data/catalog/characters-0001-1000.json"))?;
    let palette = load(&root().join("palettes/mandarin-component-identity-v0.6.json"))?;
    let phonetics = load(&root().join("site/pronunciation-citations-0001-1000.json"))?;
    let ch = entries(&catalog,"characters")?.iter().find(|r|
        r.get("character").and_then(Value::as_str)==Some("好")
    ).ok_or("missing cited character")?;
    if get(ch,"rank")?.as_u64()!=Some(581) || string(ch,"ids_primary")? != "⿰女子" {
        return Err("source character rank or decomposition changed".into());
    }
    let cited = entries(&phonetics,"characters")?.iter().find(|r|
        r.get("character").and_then(Value::as_str)==Some("好")
    ).ok_or("no citation readings for example")?;
    for (node_id,reading) in [("reading:U+597D:hao3","hǎo"),("reading:U+597D:hao4","hào")] {
        let node = nodes.get(node_id).ok_or_else(||format!("missing {node_id}"))?;
        if string(get(node,"data")?,"written")? != reading
            || !entries(cited,"readings")?.iter().any(|r|r.get("display").and_then(Value::as_str)==Some(reading)) {
            return Err(format!("{node_id}: unsupported citation reading"));
        }
    }
    for id in ["cmp-0014","cmp-0015"] {
        if !entries(ch,"component_ids")?.iter().any(|item|item.as_str()==Some(id)) {
            return Err(format!("unsupported structural component {id}"));
        }
        let component = entries(&palette,"components")?.iter().find(|item|
            item.get("id").and_then(Value::as_str)==Some(id)
        ).ok_or_else(||format!("unknown palette identity {id}"))?;
        let node_name = format!("component:{id}");
        let visual_name = format!("assignment:{id}@0.4.0");
        let graph_component = nodes.get(node_name.as_str()).ok_or("example missing component")?;
        let assignment = nodes.get(visual_name.as_str()).ok_or("example missing color assignment")?;
        if string(get(graph_component,"data")?,"form")? != string(component,"shape")?
            || string(get(assignment,"data")?,"value")? != string(component,"color")? {
            return Err(format!("{id}: graph differs from source palette"));
        }
    }
    let specimen = nodes.get("specimen:U+597D:direct").ok_or("missing renderer specimen")?;
    if get(get(specimen,"data")?,"independentVisualVerification")?.as_bool()!=Some(false) {
        return Err("source-aligned geometry cannot imply independent verification".into());
    }
    Ok(())
}

fn verify_presentation(vocab: &Value) -> Result<(),String> {
    for path in ["ontology/vocabulary.schema.json","ontology/instances.schema.json"] {
        let schema = load(&root().join(path))?;
        if string(&schema,"$schema")? != "https://json-schema.org/draft/2020-12/schema" {
            return Err(format!("{path}: not JSON Schema 2020-12"));
        }
        for key in ["schema","version"] {
            if !entries(&schema,"required")?.iter().any(|item|item.as_str()==Some(key)) {
                return Err(format!("{path}: missing structural required field {key}"));
            }
        }
    }
    let page = fs::read_to_string(root().join("site/ontology.html")).map_err(|e|e.to_string())?;
    let human = fs::read_to_string(root().join("ONTOLOGY.md")).map_err(|e|e.to_string())?;
    for group in ["classes","relations"] {
        for item in entries(vocab,group)? {
            let id = string(item,"id")?;
            if !page.contains(&format!("<code>{id}</code>")) || !human.contains(id) {
                return Err(format!("public ontology views missing {group} {id}"));
            }
        }
    }
    for link in ["ontology/ontology-v1.json","ontology/specimens-v1.json",
        "ontology/vocabulary.schema.json","ontology/instances.schema.json"] {
        if !root().join(link).exists() || !page.contains(&format!("href=\"{link}\"")) {
            return Err(format!("ontology public gallery missing machine reference {link}"));
        }
    }
    Ok(())
}

pub(super) fn check() -> Result<(),String> {
    let vocab = load(&root().join("ontology/ontology-v1.json"))?;
    let graph = load(&root().join("ontology/specimens-v1.json"))?;
    validate_graph(&vocab,&graph)?;
    verify_bindings(&vocab)?;
    verify_example(&graph)?;
    verify_presentation(&vocab)?;
    println!("Ontology validated: {} classes, {} relations, {} sourced example nodes.",
        entries(&vocab,"classes")?.len(),entries(&vocab,"relations")?.len(),
        entries(&graph,"nodes")?.len());
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn ontology_and_example_are_consistent() { check().unwrap(); }
    #[test]
    fn reject_invalid_typed_edge() {
        let vocab = load(&root().join("ontology/ontology-v1.json")).unwrap();
        let mut graph = load(&root().join("ontology/specimens-v1.json")).unwrap();
        graph["edges"][0]["from"] = Value::String("script:hani".into());
        assert!(validate_graph(&vocab,&graph).is_err());
    }
    #[test]
    fn reject_palette_drift() {
        let mut graph = load(&root().join("ontology/specimens-v1.json")).unwrap();
        let node = graph["nodes"].as_array_mut().unwrap()
            .iter_mut().find(|n|n["id"]=="assignment:cmp-0014@0.4.0").unwrap();
        node["data"]["value"]=Value::String("#000000".into());
        assert!(verify_example(&graph).is_err());
    }
}
