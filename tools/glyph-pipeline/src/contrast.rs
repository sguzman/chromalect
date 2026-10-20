use super::*;
use std::collections::HashMap;

fn theme_values(style:&str, marker:&str)->Result<HashMap<String,String>,String>{
    let start=style.find(marker).ok_or_else(||format!("missing CSS theme {marker}"))?+marker.len();
    let end=style[start..].find('}').ok_or("unclosed theme variables")?+start;
    let mut map=HashMap::new();
    for declaration in style[start..end].split(';') {
        if let Some((name,value))=declaration.split_once(':') {
            if name.trim().starts_with("--") {
                map.insert(name.trim().to_owned(),value.trim().to_owned());
            }
        }
    }
    Ok(map)
}

fn luminance(hex:&str)->Result<f64,String>{
    if !hex.starts_with('#') || hex.len()!=7 {
        return Err(format!("bad RGB hex color {hex}"));
    }
    let mut channels=[0.0;3];
    for (i,x) in channels.iter_mut().enumerate(){
        let value=u8::from_str_radix(&hex[1+i*2..3+i*2],16)
            .map_err(|_|format!("invalid RGB color {hex}"))? as f64/255.0;
        *x=if value<=0.04045 {value/12.92}
        else {((value+0.055)/1.055).powf(2.4)};
    }
    Ok(channels[0]*0.2126+channels[1]*0.7152+channels[2]*0.0722)
}
fn contrast(a:&str,b:&str)->Result<f64,String>{
    let (a,b)=(luminance(a)?,luminance(b)?);
    Ok((a.max(b)+0.05)/(a.min(b)+0.05))
}
fn check_palette(values:&HashMap<String,String>,label:&str)->Result<(),String>{
    for (text,background) in [
        ("--ink","--bg"),("--sub","--panel"),("--link","--bg"),
        ("--glyph-ink","--tile-bg"),("--table-head-ink","--table-head-bg"),
        ("--review-heading","--panel"),
        ("--active-ink","--active-bg"),
    ]{
        let foreground=values.get(text).ok_or_else(||format!("{label}: missing {text}"))?;
        let background=values.get(background).ok_or_else(||format!("{label}: missing {background}"))?;
        if foreground.starts_with("var(") {continue;}
        let ratio=contrast(foreground,background)?;
        if ratio<4.5 {
            return Err(format!("{label}: {text} on {background} has insufficient text contrast {ratio:.2}:1"));
        }
    }
    Ok(())
}
pub(super) fn check()->Result<(),String>{
    let style=fs::read_to_string(root().join("site/style.css")).map_err(|e|e.to_string())?;
    let light=theme_values(&style,":root{")?;
    let dark=theme_values(&style,":root[data-theme=\"dark\"]{")?;
    check_palette(&light,"light")?;
    check_palette(&dark,"dark")?;
    if !style.contains("@media(prefers-reduced-motion:reduce)") {
        return Err("search interactions must honor reduced-motion preferences".into());
    }
    let search=fs::read_to_string(root().join("site/search.html")).map_err(|e|e.to_string())?;
    let script=fs::read_to_string(root().join("site/search.js")).map_err(|e|e.to_string())?;
    for text in ["role=\"status\"","aria-live=\"polite\"","type=\"search\"","<noscript>",
        "profiles/mandarin-1000-v1.json"] {
        if !(search.contains(text)||script.contains(text)) {
            return Err(format!("search accessibility or data contract missing: {text}"));
        }
    }
    if script.contains("innerHTML") || script.contains("eval(") {
        return Err("search must not interpolate untrusted source text into HTML".into());
    }
    println!("Theme contrast and accessible Mandarin search: light/dark text combinations meet WCAG AA.");
    Ok(())
}

#[cfg(test)]
mod tests{
    use super::*;
    #[test]
    fn interface_contrast_and_search_requirements_hold(){check().unwrap();}
    #[test]
    fn luminance_and_contrast_math_is_stable(){
        assert!((contrast("#000000","#FFFFFF").unwrap()-21.0).abs()<1e-8);
        assert!((contrast("#888888","#888888").unwrap()-1.0).abs()<1e-8);
        assert!(luminance("hello").is_err());
    }
}
