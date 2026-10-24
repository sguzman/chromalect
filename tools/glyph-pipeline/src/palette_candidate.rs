//! Source-conditioned numerical co-occurrence palette candidate.
//! Candidate colors are only a permutation of the exact active v0.6 RGB values.
//! This does not certify color discrimination, semantics, or glyph ownership.
use super::*;
use serde_json::{json, Value};
use std::collections::{BTreeMap, BTreeSet};

const CUT: f64 = 0.07;
const CANDIDATE: &str = "0.7.0-candidate.1";

#[derive(Clone)]
pub(super) struct Edge { pub(super) a:usize, pub(super) b:usize, pub(super) weight:usize }
pub(super) fn oklab(hex:&str)->Result<[f64;3],String> {
    if hex.len()!=7 || !hex.starts_with('#') {return Err("bad sRGB hex".into());}
    let mut channels=[0.0;3];
    for (i,c) in channels.iter_mut().enumerate(){
        let n=u8::from_str_radix(&hex[1+2*i..3+2*i],16)
            .map_err(|_|"invalid palette hex".to_owned())? as f64/255.0;
        *c=if n<=0.04045 {n/12.92} else {((n+0.055)/1.055).powf(2.4)};
    }
    let [r,g,b]=channels;
    let l=(0.4122214708*r+0.5363325363*g+0.0514459929*b).cbrt();
    let m=(0.2119034982*r+0.6806995451*g+0.1073969566*b).cbrt();
    let s=(0.0883024619*r+0.2817188376*g+0.6299787005*b).cbrt();
    Ok([0.2104542553*l+0.7936177850*m-0.0040720468*s,
        1.9779984951*l-2.4285922050*m+0.4505937099*s,
        0.0259040371*l+0.7827717662*m-0.8086757660*s])
}
pub(super) fn metric(a:[f64;3],b:[f64;3])->f64{
    ((a[0]-b[0]).powi(2)+(a[1]-b[1]).powi(2)+(a[2]-b[2]).powi(2)).sqrt()
}
pub(super) fn cost(ed:&Edge,assigned:&[usize],dist:&[f64],n:usize)->bool{
    dist[assigned[ed.a]*n+assigned[ed.b]]<CUT
}
pub(super) fn warned(edges:&[Edge],assigned:&[usize],dist:&[f64],n:usize)->usize{
    edges.iter().filter(|e|cost(e,assigned,dist,n)).map(|e|e.weight).sum()
}
pub(super) fn optimize(edges:&[Edge],dist:&[f64],n:usize)->(Vec<usize>,Vec<(usize,usize,usize)>){
    let mut assignment=(0..n).collect::<Vec<_>>();
    let mut adj=vec![Vec::<usize>::new();n];
    for (i,e) in edges.iter().enumerate(){
        adj[e.a].push(i);adj[e.b].push(i);
    }
    let originally_good=edges.iter().map(|e|!cost(e,&assignment,dist,n)).collect::<Vec<_>>();
    let mut swaps=Vec::new();
    let mut previous=warned(edges,&assignment,dist,n);
    for _ in 0..64 {
        let active=edges.iter().filter(|e|cost(e,&assignment,dist,n))
            .flat_map(|e|[e.a,e.b]).collect::<BTreeSet<_>>();
        if active.is_empty(){break;}
        let mut best=None::<(usize,usize,usize)>; // newly gained warning weight, a, b
        for &a in &active{
            for b in 0..n{
                if a==b {continue;}
                // Evaluate only edges incident on the swapped identities.
                let relevant=adj[a].iter().chain(adj[b].iter()).copied()
                    .collect::<BTreeSet<_>>();
                assignment.swap(a,b);
                let mut new_weight=0isize;
                let mut valid=true;
                for idx in relevant{
                    let e=&edges[idx];
                    let now=cost(e,&assignment,dist,n);
                    if now && originally_good[idx]{valid=false;break;}
                    let left=if e.a==a {assignment[b]}
                        else if e.a==b {assignment[a]} else {assignment[e.a]};
                    let right=if e.b==a {assignment[b]}
                        else if e.b==b {assignment[a]} else {assignment[e.b]};
                    let old=dist[left*n+right]<CUT;
                    new_weight+=e.weight as isize*(now as isize-old as isize);
                }
                assignment.swap(a,b);
                if !valid||new_weight>=0 {continue;}
                let gain=(-new_weight) as usize;
                if best.map(|v|gain>v.0).unwrap_or(true){best=Some((gain,a,b));}
            }
        }
        let Some((gain,a,b))=best else{break;};
        assignment.swap(a,b);
        let current=warned(edges,&assignment,dist,n);
        assert_eq!(previous-current,gain,"Local swap delta must match global source pair census");
        previous=current;
        swaps.push((a,b,current));
    }
    (assignment,swaps)
}
/// Exploratory training-frequency prior on hypothetical color proximity.
/// A source glyph's independent visual correctness remains unverified; the
/// numerical prior is not a proxy for human visual discrimination.
pub(super) fn optimize_exposure(edges:&[Edge],dist:&[f64],n:usize,
    frequency:&[usize],lambda:f64)->(Vec<usize>,Vec<(usize,usize,usize)>){
    assert_eq!(frequency.len(),n,"training owner frequency length must equal palette size");
    assert!(lambda.is_finite()&&lambda>=0.0);
    let mut assignment=(0..n).collect::<Vec<_>>();
    let mut adj=vec![Vec::<usize>::new();n];
    for (i,e) in edges.iter().enumerate(){
        adj[e.a].push(i);adj[e.b].push(i);
    }
    let originally_good=edges.iter().map(|e|!cost(e,&assignment,dist,n)).collect::<Vec<_>>();
    let mut swaps=Vec::new();
    let mut previous=warned(edges,&assignment,dist,n);
    for _ in 0..64 {
        let active=edges.iter().filter(|e|cost(e,&assignment,dist,n))
            .flat_map(|e|[e.a,e.b]).collect::<BTreeSet<_>>();
        if active.is_empty(){break;}
        let mut best=None::<(f64,usize,usize,usize)>; // prior score, source warning gain, a, b
        for &a in &active{
            for b in 0..n{
                if a==b {continue;}
                // Evaluate only edges incident on the swapped identities.
                let relevant=adj[a].iter().chain(adj[b].iter()).copied()
                    .collect::<BTreeSet<_>>();
                assignment.swap(a,b);
                let mut new_weight=0isize;
                let mut valid=true;
                for idx in relevant{
                    let e=&edges[idx];
                    let now=cost(e,&assignment,dist,n);
                    if now && originally_good[idx]{valid=false;break;}
                    let left=if e.a==a {assignment[b]}
                        else if e.a==b {assignment[a]} else {assignment[e.a]};
                    let right=if e.b==a {assignment[b]}
                        else if e.b==b {assignment[a]} else {assignment[e.b]};
                    let old=dist[left*n+right]<CUT;
                    new_weight+=e.weight as isize*(now as isize-old as isize);
                }
                assignment.swap(a,b);
                if !valid||new_weight>=0 {continue;}
                let gain=(-new_weight) as usize;
                // Prospective exposure proxy formed from TRAINING GLYPH ownership
                // counts only. It must never inspect the excluded source ranks.
                // Swapped colors are unchanged on a-b itself; update all other
                // hypothetical identity pairs without double-counting.
                let frequency_difference=frequency[a] as i64-frequency[b] as i64;
                let mut proximity_change=0i64;
                for k in 0..n{
                    if k==a||k==b{continue;}
                    let before_a=dist[assignment[a]*n+assignment[k]]<CUT;
                    let before_b=dist[assignment[b]*n+assignment[k]]<CUT;
                    proximity_change+=frequency_difference*(frequency[k] as i64)
                         *((before_b as i64)-(before_a as i64));
                }
                let value=gain as f64-lambda*(proximity_change as f64);
                if best.map(|v|value>v.0+1e-9).unwrap_or(true){
                    best=Some((value,gain,a,b));
                }
            }
        }
        let Some((_,gain,a,b))=best else{break;};
        assignment.swap(a,b);
        let current=warned(edges,&assignment,dist,n);
        assert_eq!(previous-current,gain,"Local swap delta must match global source pair census");
        previous=current;
        swaps.push((a,b,current));
    }
    (assignment,swaps)
}
fn build()->Result<(Value,Value),String>{
    let r=root();
    let palette=load(&r.join("palettes/mandarin-component-identity-v0.6.json"))?;
    let source=load(&r.join("site/glyphs/mappings.json"))?;
    let catalog=load(&r.join("data/catalog/characters-0001-1000.json"))?;
    if string(&palette,"schema")?!="chromalect.component-palette.v0"
        || string(&palette,"version")?!="0.6.0"
        || string(&source,"schema")?!="chromalect.component-stroke-mappings.v1"
        || string(&source,"palette_ref")?!="mandarin-component-identity@0.6.0"
        || string(&catalog,"schema")?!="chromalect.character-tranche.v1"
        || entries(&catalog,"characters")?.len()!=1000
    {return Err("candidate source is not active v0.6 mapping and ranked catalog".into());}
    let components=entries(&palette,"components")?;
    if components.len()!=520{return Err("v0.6 must have 520 stable component IDs".into());}
    let mut ids=Vec::<String>::new();
    let mut hexes=Vec::<String>::new();
    let mut index=BTreeMap::<String,usize>::new();
    let mut colors=BTreeSet::<String>::new();
    for (i,x) in components.iter().enumerate(){
        let id=string(x,"id")?.to_owned();
        let hex=string(x,"color")?.to_uppercase();
        if !colors.insert(hex.clone())||index.insert(id.clone(),i).is_some(){
            return Err("duplicate stable ID or sRGB palette color".into());
        }
        ids.push(id);hexes.push(hex);
    }
    let n=ids.len();
    let labs=hexes.iter().map(|v|oklab(v)).collect::<Result<Vec<_>,_>>()?;
    let dist=(0..n).flat_map(|i|(0..n).map(move|j|(i,j)))
        .map(|(i,j)|metric(labs[i],labs[j])).collect::<Vec<_>>();
    let mut by_glyph=BTreeMap::<String,&Value>::new();
    for g in entries(&source,"glyphs")?{
        let ch=string(g,"character")?.to_owned();
        if by_glyph.insert(ch,g).is_some()
            || get(g,"independently_visually_certified")?.as_bool()!=Some(false){
            return Err("duplicated or prematurely certified source glyph".into());
        }
    }
    if by_glyph.len()!=get(&source,"glyph_count")?.as_u64()
        .ok_or("missing generated source mapping count")? as usize
        || by_glyph.len()<1000||by_glyph.len()>1032{
        return Err("generated glyph mapping inventory differs from source".into());
    }
    let mut edges=BTreeMap::<(usize,usize),usize>::new();
    let mut used_glyphs=Vec::new();
    for (i,ch) in entries(&catalog,"characters")?.iter().enumerate(){
        if get(ch,"rank")?.as_u64()!=Some(i as u64+1){
            return Err("catalog source rank not sorted".into());
        }
        let glyph=by_glyph.get(string(ch,"character")?)
            .ok_or("missing generated source glyph")?;
        let mut components_in_glyph=BTreeSet::new();
        for item in entries(glyph,"components")?{
            let id=string(item,"component_id")?;
            let Some(&idx)=index.get(id)else{return Err("source glyph owner not in v0.6".into());};
            if string(item,"hex")?.to_uppercase()!=hexes[idx]
                || string(item,"form")?!=string(&components[idx],"shape")?{
                return Err("source glyph owner or color disagrees with v0.6".into());
            }
            components_in_glyph.insert(idx);
        }
        let source_owner_ids=entries(glyph,"source_path_owner_ids")?;
        if source_owner_ids.is_empty()||!source_owner_ids.iter().all(|v|{
            v.as_str().and_then(|id|index.get(id)).map(|i|components_in_glyph.contains(i))==Some(true)
        }){return Err("missing generated source owner paths".into());}
        let members=components_in_glyph.into_iter().collect::<Vec<_>>();
        for (x,&a) in members.iter().enumerate(){
            for &b in members.iter().skip(x+1){
                *edges.entry((a,b)).or_default()+=1;
            }
        }
        used_glyphs.push((i+1,string(ch,"character")?.to_owned(),members));
    }
    let edge_list=edges.into_iter().map(|((a,b),weight)|Edge{a,b,weight}).collect::<Vec<_>>();
    if edge_list.iter().map(|x|x.weight).sum::<usize>()!=1020{
        return Err("reconstructed glyph source-pair count changed".into());
    }
    let base=(0..n).collect::<Vec<_>>();
    let baseline=warned(&edge_list,&base,&dist,n);
    if baseline!=26{return Err(format!("expected 26 measured v0.6 close pairs, got {baseline}"));}
    let (assigned,swaps)=optimize(&edge_list,&dist,n);
    let current=warned(&edge_list,&assigned,&dist,n);
    if current>=baseline||swaps.is_empty(){
        return Err("No measured co-occurrence improvement; refuse new palette version".into());
    }
    let mut new_close=0usize;
    for e in &edge_list {
        if cost(e,&assigned,&dist,n) && !cost(e,&base,&dist,n) {new_close+=e.weight;}
    }
    if new_close!=0 {return Err("Candidate introduced new source close pairs".into());}
    let assigned_colors=assigned.iter().map(|&i|hexes[i].clone()).collect::<BTreeSet<_>>();
    if assigned_colors!=colors {return Err("Candidate changed global sRGB color multiset".into());}
    let mut amended=palette.clone();
    amended["version"]=json!(CANDIDATE);
    amended["status"]=json!("experimental_cooccurrence_swap_candidate_not_active_not_independently_tested");
    amended["based_on"]=json!("mandarin-component-identity@0.6.0");
    amended["invariant"]=json!("Exact source components and exact 520 original sRGB values; permutation only. Original v0.6 palette and all glyph SVGs unchanged.");
    amended["algorithm"]=json!("Deterministic greedy source co-occurrence swaps, strict no-new-warning constraint at OKLab 0.07; same global color-distance multiset; no human visual certification.");
    amended["candidate_evidence"]=json!("palettes/mandarin-component-identity-v0.7-candidate-evidence.json");
    if let Some(rows)=amended.get_mut("components").and_then(Value::as_array_mut){
        for (i,row) in rows.iter_mut().enumerate(){row["color"]=json!(hexes[assigned[i]]);}
    }
    let swaps_json=swaps.iter().map(|&(a,b,w)|json!({
        "componentA":ids[a],"componentB":ids[b],
        "sourceHexA":hexes[a],"sourceHexB":hexes[b],"warningsAfterSwap":w
    })).collect::<Vec<_>>();
    let warning_rows=used_glyphs.iter().filter_map(|(rank,ch,components)|{
        let orig=components.iter().enumerate().flat_map(|(i,&a)|components.iter().skip(i+1).map(move|&b|(a,b)))
            .filter(|&(a,b)|dist[a*n+b]<CUT).count();
        let newer=components.iter().enumerate().flat_map(|(i,&a)|components.iter().skip(i+1).map(move|&b|(a,b)))
            .filter(|&(a,b)|dist[assigned[a]*n+assigned[b]]<CUT).count();
        if orig==0&&newer==0{return None;}
        Some(json!({"rank":rank,"character":ch,"originalClosePairs":orig,
            "candidateClosePairs":newer,"independentVisualReview":"pending"}))
    }).collect::<Vec<_>>();
    let report=json!({
        "schema":"chromalect.palette.v07-source-cooccurrence-candidate-evidence.v0.1",
        "status":"computational_first_tranche_proximity_optimization_no_human_validation",
        "sources":{"activePalette":"palettes/mandarin-component-identity-v0.6.json",
           "generatedGlyphOwners":"site/glyphs/mappings.json",
           "rankedSource":"data/catalog/characters-0001-1000.json",
           "sourceColorsOrSVGsChanged":false,"independentlyCertifiedGlyphs":0},
        "method":{"space":"OKLab","closePairThreshold":CUT,
            "algorithm":"deterministic greedy color-index swaps with no new close pairs",
            "globalPaletteColorMultisetUnchanged":true,
            "optimizedOnFirstTranche":true,"independentHeldoutGlyphEvaluation":false},
        "summary":{"sourceGlyphs":1000,"stableComponentIdentities":520,
            "distinctPairsObservedWithGlyphMultiplicity":1020,
            "originalClosePairs":baseline,"candidateClosePairs":current,
            "introducedClosePairs":new_close,
            "resolvedNetClosePairs":baseline-current,
            "swapCount":swaps.len(),"independentHumanPerceptionTrials":0,
            "glyphOwnershipApprovals":0,"learningMeasurements":0},
        "swaps":swaps_json,"sourceGlyphWarningChanges":warning_rows
    });
    Ok((amended,report))
}
pub(super) fn run(check:bool)->Result<(),String>{
    let (candidate,evidence)=build()?;
    let target=root().join("site/palettes");
    let p=target.join("mandarin-component-identity-v0.7-candidate.json");
    let e=target.join("mandarin-component-identity-v0.7-candidate-evidence.json");
    let candidate_text=serde_json::to_string_pretty(&candidate).map_err(|v|v.to_string())?+"\n";
    let evidence_text=serde_json::to_string_pretty(&evidence).map_err(|v|v.to_string())?+"\n";
    if check {
        if fs::read_to_string(&p).map_err(|v|v.to_string())?!=candidate_text
            || fs::read_to_string(&e).map_err(|v|v.to_string())?!=evidence_text {
            return Err("candidate palette differs from regenerated source evidence".into());
        }
    }else{
        fs::create_dir_all(&target).map_err(|v|v.to_string())?;
        fs::write(&p,candidate_text).map_err(|v|v.to_string())?;
        fs::write(&e,evidence_text).map_err(|v|v.to_string())?;
    }
    let s=get(&evidence,"summary")?;
    println!("v0.7 candidate source warnings: 26 -> {}, {} deterministic swaps; zero new source warnings; zero human results.",
             get(s,"candidateClosePairs")?.as_u64().ok_or("invalid candidate warning count")?,
             get(s,"swapCount")?.as_u64().ok_or("invalid swap count")?);
    Ok(())
}
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn ok_lab_distance_is_symmetric_and_zero_for_same_color(){
        let a=oklab("#000000").unwrap();
        let b=oklab("#FFFFFF").unwrap();
        assert!(metric(a,a)<1e-12);
        assert!((metric(a,b)-metric(b,a)).abs()<1e-12);
        assert!(metric(a,b)>0.5);
    }
    #[test]
    fn greedy_swap_only_removes_preexisting_source_collision(){
        let labs=["#123456","#123457","#ffffff","#ff0000"].iter().map(|s|oklab(s).unwrap())
            .collect::<Vec<_>>();
        let mut dist=Vec::new();
        for i in 0..4 {for j in 0..4 {dist.push(metric(labs[i],labs[j]));}}
        let edges=vec![Edge{a:0,b:1,weight:1},Edge{a:0,b:3,weight:1}];
        assert_eq!(warned(&edges,&[0,1,2,3],&dist,4),1);
        let (order,swaps)=optimize(&edges,&dist,4);
        assert!(!swaps.is_empty());
        assert_eq!(warned(&edges,&order,&dist,4),0);
    }
}
