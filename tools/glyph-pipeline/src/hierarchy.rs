use super::*;
use std::collections::{HashMap,HashSet};
use serde_json::Value;

// Stroke order is only a common source-file index, never an educational goal.
// Shape normalization prevents adopting arbitrary component-index transfers.
fn numeric_pairs(svg:&str)->Option<Vec<(f64,f64)>>{
    let mut cleaned=String::new();let mut prev=false;
    for ch in svg.chars(){
        let numeric=ch.is_ascii_digit()||ch=='.';
        if ch=='-'&&prev {cleaned.push(' ');}
        cleaned.push(if numeric||ch=='-'||ch=='+'{ch}else{' '});
        prev=numeric;
    }
    let n=cleaned.split_ascii_whitespace()
        .map(|s|s.parse::<f64>().ok()).collect::<Option<Vec<_>>>()?;
    if n.len()<4||n.len()%2!=0||n.iter().any(|n|!n.is_finite()){return None;}
    Some(n.chunks_exact(2).map(|n|(n[0],n[1])).collect())
}

fn extents(svg:&str)->Option<(f64,f64,f64,f64)>{
    let p=numeric_pairs(svg)?;
    Some(p.iter().fold((f64::INFINITY,f64::INFINITY,f64::NEG_INFINITY,f64::NEG_INFINITY),
        |b,(x,y)|(b.0.min(*x),b.1.min(*y),b.2.max(*x),b.3.max(*y))))
}

fn geometry_correspondence(parent:&[&str],child:&[&str])->Option<f64>{
    if parent.len()<2||parent.len()!=child.len(){return None;}
    let pa=parent.iter().map(|s|extents(s)).collect::<Option<Vec<_>>>()?;
    let ch=child.iter().map(|s|extents(s)).collect::<Option<Vec<_>>>()?;
    let union=|list:&[(f64,f64,f64,f64)]|list.iter()
        .fold((f64::INFINITY,f64::INFINITY,f64::NEG_INFINITY,f64::NEG_INFINITY),
            |a,b|(a.0.min(b.0),a.1.min(b.1),a.2.max(b.2),a.3.max(b.3)));
    let a=union(&pa);let b=union(&ch);
    let (aw,ah,bw,bh)=(a.2-a.0,a.3-a.1,b.2-b.0,b.3-b.1);
    if [aw,ah,bw,bh].iter().any(|v|*v<1.0){return None;}
    let mut error=0.0;
    for (p,c) in pa.iter().zip(&ch){
        let px=((p.0+p.2)*0.5-a.0)/aw;let py=((p.1+p.3)*0.5-a.1)/ah;
        let cx=((c.0+c.2)*0.5-b.0)/bw;let cy=((c.1+c.3)*0.5-b.1)/bh;
        let distance=((px-cx).powi(2)+(py-cy).powi(2)).sqrt();
        if distance>0.24{return None;}
        error+=distance;
    }
    let mean=error/parent.len() as f64;
    (mean<=0.13).then_some(mean)
}

fn path(v:&Value)->Option<Vec<usize>>{
    v.as_array()?.iter().map(|v|usize::try_from(v.as_u64()?).ok())
        .collect::<Option<Vec<_>>>()
}

fn dictionary(path:&Path)->Result<HashMap<String,Value>,String>{
    let mut entries=HashMap::new();
    discover::source_records(path,|v|{
        if let Some(ch)=v.get("character").and_then(Value::as_str).map(str::to_owned){
            if entries.insert(ch.clone(),v).is_some(){return Err(format!("duplicate source {ch}"));}
        }
        Ok(())
    })?;
    Ok(entries)
}

fn source_graphics(path:&Path,needed:&HashSet<String>)->Result<HashMap<String,Value>,String>{
    let mut entries=HashMap::new();
    discover::source_records(path,|v|{
        if let Some(ch)=v.get("character").and_then(Value::as_str).map(str::to_owned){
            if needed.contains(&ch) && entries.insert(ch.clone(),v).is_some(){
                return Err(format!("duplicate geometry {ch}"));
            }
        }
        Ok(())
    })?;
    Ok(entries)
}

fn reconcile(parent:&Value,glyph:&Value,selected:&Value,
    dictionaries:&HashMap<String,Value>,graphics:&HashMap<String,Value>,
    palette:&HashMap<String,(String,String)>)->Option<discover::Decomposition>{
    let source=parent.get("decomposition")?.as_str()?;
    let primary=selected.get("ids_primary")?.as_str()?.split(';').next()?
        .split('(').next()?.trim();
    if source.contains('？')||source.contains('⿻')||source.chars().next()!=primary.chars().next(){return None;}
    let source_leaves=discover::parse_ids_leaves(source)?;
    let primary_leaves=discover::parse_ids_leaves(primary)?;
    let instances=selected.get("component_instances")?.as_array()?;
    if instances.len()<2{return None;}
    let mut selected_paths=HashMap::new();
    let (mut forms,mut ids,mut colors)=(Vec::new(),Vec::new(),Vec::new());
    for (index,item) in instances.iter().enumerate(){
        let path=item.get("path")?.as_str()?.split('.')
            .map(|s|s.parse::<usize>().ok()).collect::<Option<Vec<_>>>()?;
        if selected_paths.insert(path,index).is_some(){return None;}
        let form=item.get("form")?.as_str()?;
        let id=item.get("id")?.as_str()?;
        let (shape,color)=palette.get(id)?;
        if shape!=form{return None;}
        forms.push(form.to_owned());ids.push(id.to_owned());colors.push(color.clone());
    }
    let match_data=parent.get("matches")?.as_array()?;
    let paths=glyph.get("strokes")?.as_array()?;
    if paths.len()!=match_data.len()||paths.is_empty(){return None;}
    let source_paths=match_data.iter().map(path).collect::<Option<Vec<_>>>()?;
    let mut assigned=vec![None;source_paths.len()];
    let mut transfers=0usize;
    for (source_path,form) in source_leaves{
        let positions=source_paths.iter().enumerate()
            .filter(|(_,p)|**p==source_path).map(|(i,_)|i).collect::<Vec<_>>();
        if positions.is_empty(){return None;}
        if let Some(i)=selected_paths.get(&source_path).copied(){
            if forms[i]!=form{return None;}
            for j in positions{assigned[j]=Some(i);}
            continue;
        }
        if primary_leaves.get(&source_path)!=Some(&form){return None;}
        let inner=dictionaries.get(&form)?;
        let inner_glyph=graphics.get(&form)?;
        let inner_decomp=inner.get("decomposition")?.as_str()?;
        if inner_decomp.contains('？')||inner_decomp.contains('⿻'){return None;}
        let inner_leaves=discover::parse_ids_leaves(inner_decomp)?;
        let inner_paths=inner.get("matches")?.as_array()?;
        let inner_strokes=inner_glyph.get("strokes")?.as_array()?;
        if inner_paths.len()!=positions.len()||inner_strokes.len()!=positions.len(){return None;}
        let source_svg=positions.iter().map(|&j|paths[j].as_str()).collect::<Option<Vec<_>>>()?;
        let inner_svg=inner_strokes.iter().map(Value::as_str).collect::<Option<Vec<_>>>()?;
        geometry_correspondence(&source_svg,&inner_svg)?;
        for (local,record) in inner_paths.iter().enumerate(){
            let subpath=path(record)?;
            let name=inner_leaves.get(&subpath)?;
            let mut absolute=source_path.clone();absolute.extend(subpath);
            let i=*selected_paths.get(&absolute)?;
            if forms[i]!=*name{return None;}
            assigned[positions[local]]=Some(i);
        }
        transfers+=1;
    }
    if transfers==0{return None;}
    let indices=assigned.into_iter().collect::<Option<Vec<_>>>()?;
    let mut counts=vec![0usize;instances.len()];
    for i in &indices{counts[*i]+=1;}
    if counts.contains(&0){return None;}
    Some(discover::Decomposition{forms,ids,colors,matches:indices,original:source.into()})
}

pub(super) fn recover(dictionary_path:&Path,graphics_path:&Path,
    already:&HashSet<String>)->Result<HashMap<String,discover::Decomposition>,String>{
    let catalog=load(&root().join("data/catalog/characters-0001-1000.json"))?;
    let palette=load(&root().join("palettes/mandarin-component-identity-v0.4.json"))?;
    let colors=entries(&palette,"components")?.iter().map(|r|Ok((
        string(r,"id")?.to_owned(),
        (string(r,"shape")?.to_owned(),string(r,"color")?.to_owned())
    ))).collect::<Result<HashMap<_,_>,String>>()?;
    let dictionaries=dictionary(dictionary_path)?;
    let catalogue=entries(&catalog,"characters")?.iter().map(|r|Ok((
        string(r,"character")?.to_owned(),r
    ))).collect::<Result<HashMap<_,_>,String>>()?;
    let mut needed=HashSet::new();
    for ch in catalogue.keys().filter(|ch|!already.contains(*ch)){
        needed.insert(ch.clone());
        if let Some(ids)=dictionaries.get(ch).and_then(|r|r.get("decomposition")).and_then(Value::as_str){
            if let Some(leaves)=discover::parse_ids_leaves(ids){
                needed.extend(leaves.into_values());
            }
        }
    }
    let graphics=source_graphics(graphics_path,&needed)?;
    let mut found=HashMap::new();
    for (ch,entry) in catalogue{
        if already.contains(&ch){continue;}
        if let (Some(source),Some(glyph))=(dictionaries.get(&ch),graphics.get(&ch)){
            if let Some(candidate)=reconcile(source,glyph,entry,&dictionaries,&graphics,&colors){
                found.insert(ch,candidate);
            }
        }
    }
    println!("Hierarchical source geometry recovered {} additional catalog glyphs.",found.len());
    if !found.is_empty(){
        let mut names=found.keys().cloned().collect::<Vec<_>>();names.sort();
        println!("Reconciled characters: {}",names.join(", "));
    }
    Ok(found)
}

#[cfg(test)]
mod tests{
    use super::*;
    #[test]
    fn cross_glyph_geometry_rejects_reversed_strokes(){
        let glyph=["M 0 0 L 10 10 Z","M 80 80 L 90 90 Z"];
        assert!(geometry_correspondence(&glyph,&glyph).is_some());
        assert!(geometry_correspondence(&glyph,&[glyph[1],glyph[0]]).is_none());
    }
    #[test]
    fn source_paths_must_be_explicit(){
        assert_eq!(path(&serde_json::json!([0,1])),Some(vec![0,1]));
        assert!(path(&Value::Null).is_none());
    }
}
