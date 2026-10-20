use super::*;
use serde_json::{json,Value};
use std::collections::{HashMap,HashSet};

const PROFILE_ID: &str = "zh-cn-putonghua-simplified";
const SCHEMA: &str = "chromalect.mandarin-character-profile.v1";

fn canonical_colors() -> Result<HashMap<String,(String,String)>,String> {
    let data = load(&root().join("palettes/mandarin-component-identity-v0.4.json"))?;
    let mut map = HashMap::new();
    for row in entries(&data,"components")? {
        let id=string(row,"id")?;
        if map.insert(id.to_owned(),(
            string(row,"shape")?.to_owned(),string(row,"color")?.to_owned()
        )).is_some() {return Err(format!("duplicate palette component {id}"));}
    }
    Ok(map)
}

fn source_records(glyphs: &[Glyph]) -> Result<Value,String> {
    let catalog=load(&root().join("data/catalog/characters-0001-1000.json"))?;
    let readings=load(&root().join("site/pronunciation-citations-0001-1000.json"))?;
    let layers=load(&root().join("site/layers-v0.1.json"))?;
    let vocabulary=load(&root().join("ontology/ontology-v1.json"))?;
    if !entries(&vocabulary,"bindings")?.iter().any(|binding|binding.get("id").and_then(Value::as_str)==Some("mandarin-1000-ontology-profile")) { return Err("generated profile has no canonical ontology binding".into()); }
    if !entries(&vocabulary,"profiles")?.iter().any(|p|p.get("id").and_then(Value::as_str)==Some(PROFILE_ID)) {
        return Err("Mandarin profile is absent from the formal ontology".into());
    }
    let token_domains=get(&layers,"palette_domains")?;
    let initial=get(get(token_domains,"initial")?,"tokens")?;
    let final_colors=get(get(token_domains,"final")?,"tokens")?;
    let tone_colors=get(get(token_domains,"tone")?,"tokens")?;
    let tone_symbols=get(get(token_domains,"tone")?,"symbols")?;
    let colors=canonical_colors()?;
    let catalogue=entries(&catalog,"characters")?;
    let pron=entries(&readings,"characters")?;
    if catalogue.len()!=1000 || pron.len()!=1000 {return Err("Mandarin profile needs exactly 1000 records".into());}
    let available: HashMap<&str,&Glyph>=glyphs.iter().map(|g|(g.character.as_str(),g)).collect();
    let mut ranks=HashSet::new();
    let mut items=Vec::with_capacity(1000);
    let mut source_aligned=0;
    for (index,(entry,transcription)) in catalogue.iter().zip(pron).enumerate() {
        let ch=string(entry,"character")?;
        let rank=get(entry,"rank")?.as_u64().ok_or("catalog rank is not numeric")? as usize;
        if rank!=index+1 || !ranks.insert(ch.to_owned()) || string(transcription,"character")?!=ch
            || get(transcription,"rank")?.as_u64()!=Some(rank as u64) {
            return Err(format!("Mandarin alignment failed at rank {rank}"));
        }
        let mut instances=Vec::new();
        let mut instance_ids=HashSet::new();
        for component in entries(entry,"component_instances")? {
            let id=string(component,"id")?;
            let form=string(component,"form")?;
            let path=string(component,"path")?;
            let (canonical_form,hex)=colors.get(id)
                .ok_or_else(||format!("{ch} unknown palette component {id}"))?;
            if canonical_form!=form {return Err(format!("{ch} mismatched component form {id}"));}
            instance_ids.insert(id);
            instances.push(json!({
                "ontology_type":"ComponentInstance",
                "path":path,"component_id":id,"form":form,"color":hex,
                "identity_type":"GraphicComponent",
                "identity_palette":"mandarin-component-identity@0.4.0"
            }));
        }
        let selected: HashSet<&str>=entries(entry,"component_ids")?.iter().map(|id|
            id.as_str().ok_or("invalid selected ID")
        ).collect::<Result<_,_>>()?;
        if selected!=instance_ids { return Err(format!("{ch} instance and identity sets disagree")); }
        let mut citation_readings=Vec::new();
        for reading in entries(transcription,"readings")? {
            let initial_name=string(reading,"initial")?;
            let final_name=string(reading,"final")?;
            let tone=get(reading,"tone")?.as_u64().ok_or("tone must be a number")?;
            let tone_key=tone.to_string();
            let lookup=|obj:&Value,key:&str|->Result<String,String>{
                get(obj,key)?.as_str().map(str::to_owned)
                    .ok_or_else(||format!("{ch}: missing token color {key}"))
            };
            citation_readings.push(json!({
                "ontology_type":"CitationReading",
                "display":string(reading,"display")?,
                "initial":{"ontology_type":"OrthographicSegment","token":initial_name,"hex":lookup(initial,initial_name)?},
                "final":{"ontology_type":"OrthographicSegment","token":final_name,"hex":lookup(final_colors,final_name)?},
                "tone":{"ontology_type":"ToneCategory","category":tone,"hex":lookup(tone_colors,&tone_key)?,"symbol":lookup(tone_symbols,&tone_key)?},
                "contextual_pronunciation":null
            }));
        }
        if citation_readings.is_empty() {return Err(format!("{ch}: empty reading list"));}
        let start=(rank-1)/100*100+1;
        let href=format!("characters/{start:04}-{:04}.html#c{rank:04}",start+99);
        let glyph=available.get(ch);
        let geometry=if let Some(g)=glyph {
            if g.parts.iter().map(|part|part.1.as_str()).collect::<HashSet<_>>()!=selected {
                return Err(format!("{ch} colored SVG identity set disagrees with the source catalog"));
            }
            source_aligned+=1;
            json!({
                "status":"source_aligned_visual_review_pending",
                "ontology_type":"Glyph",
                "svg":format!("glyphs/{}",file_name(g)),
                "component_count":g.parts.len(),
                "source_path_count":g.strokes.len(),
                "certified":false
            })
        } else {
            json!({
                "status":"unresolved_geometry",
                "ontology_type":"Glyph",
                "svg":null,
                "certified":false
            })
        };
        items.push(json!({
            "ontology_type":"Character",
            "rank":rank,"character":ch,
            "structure":string(entry,"ids_primary")?,
            "structure_status":string(entry,"structural_status")?,
            "component_instances":instances,
            "citation_readings":citation_readings,
            "geometry":geometry,
            "atlas_url":href,
            "sense":{"status":"not_implemented","ontology_type":"Sense"},
        }));
    }
    Ok(json!({
        "schema":SCHEMA,
        "version":"1.0.0",
        "ontology_vocabulary":"ontology/ontology-v1.json",
        "ontology_profile":PROFILE_ID,
        "language_scope":"Modern Standard Mandarin; 2013 first-1000 Chinese character tranche",
        "palette_ref":"mandarin-component-identity@0.4.0",
        "phonetic_palette_ref":"chromalect.presentation-layers.v0@0.1.0",
        "citation_reading_policy":"all listed readings; the first reading controls static atlas colors; no contextual sandhi",
        "geometry_policy":"source-aligned mappings only; unresolved glyphs retain native font and marker/stripe fallback",
        "semantic_policy":"no unsupported character meanings or word analyses are invented",
        "catalog_count":items.len(),
        "source_aligned_count":source_aligned,
        "unresolved_geometry_count":items.len()-source_aligned,
        "characters":items,
    }))
}

pub(super) fn generate(glyphs:&[Glyph],destination:&Path)->Result<(),String> {
    let data=source_records(glyphs)?;
    let folder=destination.join("profiles");
    fs::create_dir_all(&folder).map_err(|e|e.to_string())?;
    fs::write(folder.join("mandarin-1000-v1.json"),
        format!("{}\n",serde_json::to_string_pretty(&data).map_err(|e|e.to_string())?))
        .map_err(|e|e.to_string())?;
    println!("Mandarin-only ontology profile generated: {}/1000 source-aligned and {} unresolved.",
        data["source_aligned_count"],data["unresolved_geometry_count"]);
    Ok(())
}

#[cfg(test)]
mod tests{
    use super::*;
    #[test]
    fn all_first_thousand_characters_have_ontological_links(){
        let glyphs=validate().unwrap();
        let profile=source_records(&glyphs).unwrap();
        assert_eq!(profile["catalog_count"],1000);
        assert_eq!(profile["ontology_profile"],PROFILE_ID);
        let hao=&profile["characters"][580];
        assert_eq!(hao["character"],"好");
        assert_eq!(hao["component_instances"][0]["component_id"],"cmp-0014");
        assert_eq!(hao["citation_readings"][0]["display"],"hǎo");
        assert_eq!(hao["citation_readings"][1]["display"],"hào");
        assert_eq!(hao["geometry"]["status"],"source_aligned_visual_review_pending");
    }
    #[test]
    fn unknown_geometry_is_distinct_from_missing_character_data(){
        let data=source_records(&[]).unwrap();
        assert_eq!(data["source_aligned_count"],0);
        assert_eq!(data["unresolved_geometry_count"],1000);
        assert_eq!(data["characters"][580]["geometry"]["svg"],Value::Null);
        assert_eq!(data["characters"][580]["citation_readings"][0]["initial"]["token"],"h");
    }
}