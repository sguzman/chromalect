use super::*;

pub(super) fn check() -> Result<(),String>{
    let root=root();
    let script=fs::read_to_string(root.join("site/layers.js"))
        .map_err(|e|format!("site/layers.js: {e}"))?;
    for required in [
        "\"component\"","\"reading\"","\"tone\"","\"off\"","\"direct\"","\"marker\"",
        "localStorage.getItem","localStorage.setItem",
        "chromalect-layer-",
        "document.querySelector(\".controls\")"
    ] {
        if !script.contains(required) {
            return Err(format!("presentation persistence missing {required}"));
        }
    }
    if script.contains("semantic") || script.contains("chromalect-theme") {
        return Err("presentation persistence must not enable semantic channel or change the site theme".into());
    }
    let source=load(&root.join("site/layers-v0.1.json"))?;
    if string(get(&source,"ui")?,"mode_selection_scope")?.contains("resets on navigation") {
        return Err("presentation JSON disagrees with persisted state".into());
    }
    for (path,reference) in std::iter::once(("site/index.html".to_owned(),"src=\"layers.js\"".to_owned()))
        .chain((0..10).map(|i|(
            format!("site/characters/{:04}-{:04}.html",i*100+1,(i+1)*100),
            "src=\"../layers.js\"".to_owned()
        ))) {
        let doc=fs::read_to_string(root.join(&path)).map_err(|e|format!("{path}: {e}"))?;
        if !doc.contains(&reference) {
            return Err(format!("{path}: missing layer preference controller"));
        }
        for group in ["component","reading","tone"] {
            if doc.matches(&format!("name=\"{group}\"")).count()!=3 {
                return Err(format!("{path}: expected 3 {group} controls"));
            }
        }
        if !doc.contains("name=\"semantic\" type=\"radio\" value=\"off\" checked")
            || !doc.contains("name=\"semantic\" type=\"radio\" value=\"direct\" disabled")
            || !doc.contains("name=\"semantic\" type=\"radio\" value=\"marker\" disabled") {
            return Err(format!("{path}: semantic channel must remain disabled until verified data is available"));
        }
    }
    println!("Layer preferences validated: three independent site-local modes on all 11 Mandarin presentation pages.");
    Ok(())
}

#[cfg(test)]
mod tests{
    use super::*;
    #[test]
    fn independent_layer_preference_policy() {check().unwrap();}
}
