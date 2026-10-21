use super::*;
use std::collections::HashMap;

fn check_component_atlas() -> Result<(), String> {
    let root = root();
    let catalog = load(&root.join("data/catalog/characters-0001-1000.json"))?;
    let palette = load(&root.join("palettes/mandarin-component-identity-v0.6.json"))?;
    let mut color_by_id: HashMap<String,(String,String)> = HashMap::new();
    for component in entries(&palette,"components")? {
        let id = string(component,"id")?.to_owned();
        if color_by_id.insert(id.clone(),(
            string(component,"shape")?.to_owned(),
            string(component,"color")?.to_owned()
        )).is_some() {
            return Err(format!("duplicate component color identity {id}"));
        }
    }
    let mut pages = Vec::new();
    for page in 0..10 {
        let start = page * 100 + 1;
        let file = root.join(format!("site/characters/{start:04}-{:04}.html", start + 99));
        pages.push(fs::read_to_string(&file).map_err(|e| format!("{}: {e}",file.display()))?);
    }
    let items = entries(&catalog,"characters")?;
    if items.len() != 1000 { return Err("catalog must contain 1000 characters".into()); }
    for (position,record) in items.iter().enumerate() {
        let rank = get(record,"rank")?.as_u64().ok_or("rank not integer")? as usize;
        if rank != position + 1 { return Err(format!("unexpected catalog rank at {position}")); }
        let character = string(record,"character")?;
        let page = &pages[(rank - 1)/100];
        let anchor = format!("<details class=\"tile\" id=\"c{rank:04}\" style=\"");
        let start = page.find(&anchor).ok_or_else(||format!("rank {rank} absent from atlas"))?;
        let finish = page[start..].find("</details>").ok_or_else(||format!("rank {rank} has unclosed tile"))?;
        let card = &page[start..start+finish];
        if !card.contains(&format!("<summary title=\"Inspect {character}\">")) {
            return Err(format!("rank {rank}: expected character {character}"));
        }
        let marker_start = card.find("<div class=\"comp-markers\"")
            .ok_or_else(||format!("{character}: missing component marker region"))?;
        let marker_end = card[marker_start..].find("</div>")
            .ok_or_else(||format!("{character}: unclosed component marker region"))?;
        let marker_region = &card[marker_start..marker_start + marker_end];
        let expected_instances = entries(record,"component_instances")?;
        let marker_count = marker_region.matches("class=\"mini\"").count();
        if marker_count != expected_instances.len() {
            return Err(format!(
                "{character} rank {rank}: {marker_count} visual markers for {} source component instances",
                expected_instances.len()
            ));
        }
        let mut required: HashMap<String,usize> = HashMap::new();
        for instance in expected_instances {
            let id = string(instance,"id")?;
            let form = string(instance,"form")?;
            let (canonical_form,color) = color_by_id.get(id)
                .ok_or_else(||format!("{character}: unknown palette ID {id}"))?;
            if canonical_form != form {
                return Err(format!("{character}: {id} form differs from canonical v0.6"));
            }
            let marker = format!("style=\"--color:{color}\" title=\"{form}: {id}\"");
            *required.entry(marker).or_default() += 1;
        }
        for (fragment,count) in required {
            let found = marker_region.matches(&fragment).count();
            if found != count {
                return Err(format!(
                    "{character} rank {rank}: expected {count} occurrences of marker {fragment}, found {found}"
                ));
            }
        }
        let selected_ids = entries(record,"component_ids")?;
        let style_end = card.find("\"><summary").ok_or_else(||format!("{character}: missing tile style"))?;
        let tile_style = &card[..style_end];
        for id in selected_ids {
            let id = id.as_str().ok_or("catalog ID not string")?;
            let (form,color) = color_by_id.get(id)
                .ok_or_else(||format!("{character}: unknown selected component ID {id}"))?;
            if !tile_style.contains(&format!("{color}")) {
                return Err(format!("{character}: fallback component stripe does not use {id} color {color}"));
            }
            let chip = format!("style=\"--color:{color}\"></i>{form} <span class=\"hint\">{id}</span>");
            if !card.contains(&chip) {
                return Err(format!("{character}: inspector missing the {id} palette assignment"));
            }
        }
    }
    println!("Component-color audit: all 1000 atlas cards preserve v0.6 colors for source instances, markers, stripes, and inspector chips.");
    Ok(())
}

pub(super) fn check() -> Result<(),String> { check_component_atlas() }

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn component_colors_agree_across_all_atlas_layers() {
        check_component_atlas().unwrap();
    }
}
