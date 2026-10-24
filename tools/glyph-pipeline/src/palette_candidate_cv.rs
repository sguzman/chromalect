//! Five-fold source-character-held-out check for the existing numerical v0.7 swap algorithm.
//! Evaluates glyph pairs outside each fitting fold; DOES NOT establish human discrimination.
use super::*;
use super::palette_candidate::{Edge,oklab,metric,cost,warned,optimize};
use serde_json::{json,Value};
use std::collections::{BTreeMap,BTreeSet};

const CUTOFF:f64=0.07;
const SCHEMA:&str="chromalect.palette.v07-fivefold-source-heldout.v0.1";
type Pairs=Vec<Vec<(usize,usize)>>;

fn prepare()->Result<(Pairs,Vec<String>,Vec<f64>),String>{
    let base=root();
    let catalog=load(&base.join("data/catalog/characters-0001-1000.json"))?;
    let mapping=load(&base.join("site/glyphs/mappings.json"))?;
    let palette=load(&base.join("palettes/mandarin-component-identity-v0.6.json"))?;
    if string(&catalog,"schema")?!="chromalect.character-tranche.v1"
        || entries(&catalog,"characters")?.len()!=1000
        || string(&mapping,"schema")?!="chromalect.component-stroke-mappings.v1"
        || string(&mapping,"palette_ref")?!="mandarin-component-identity@0.6.0"
        || string(&palette,"schema")?!="chromalect.component-palette.v0"
        || string(&palette,"version")?!="0.6.0"
    {return Err("held-out source version/geometry pin mismatch".into());}
    let components=entries(&palette,"components")?;
    if components.len()!=520{return Err("expected 520 exact active component colors".into());}
    let mut ids=BTreeMap::new();let mut colors=Vec::new();
    let mut colorSet=BTreeSet::new();
    for (i,x) in components.iter().enumerate(){
        let id=string(x,"id")?.to_owned(),color=string(x,"color")?.to_uppercase();
        if ids.insert(id,i).is_some()||!colorSet.insert(color.clone()){
            return Err("component identity or color reused".into());
        }
        colors.push(color);
    }
    let labs=colors.iter().map(|s|oklab(s)).collect::<Result<Vec<_>,_>>()?;
    let mut distance=Vec::with_capacity(520*520);
    for a in &labs {for b in &labs {distance.push(metric(*a,*b));}}
    let mut byGlyph=BTreeMap::new();
    for x in entries(&mapping,"glyphs")?{
        if get(x,"independently_visually_certified")?.as_bool()!=Some(false)
            || byGlyph.insert(string(x,"character")?.to_owned(),x).is_some(){
            return Err("source glyph ownership requires independent certification gate".into());
        }
    }
    if byGlyph.len()!=get(&mapping,"glyph_count")?.as_u64().unwrap_or(0) as usize
        || byGlyph.len()<1000{return Err("incomplete generated glyph mapping set".into());}
    let mut byCharacter=Vec::new(),ranked=Vec::new();
    for (i,x) in entries(&catalog,"characters")?.iter().enumerate(){
        if get(x,"rank")?.as_u64()!=Some(i as u64+1){
            return Err("ranked source tranche no longer stable".into());
        }
        let ch=string(x,"character")?.to_owned();
        let glyph=byGlyph.get(&ch).ok_or("missing source-owned ranked glyph")?;
        let mut members=BTreeSet::new();
        for part in entries(glyph,"components")?{
            let id=string(part,"component_id")?;
            let Some(&n)=ids.get(id)else{return Err("unknown source component owner".into());};
            if string(part,"hex")?.to_uppercase()!=colors[n]
                || string(part,"form")?!=string(&components[n],"shape")?{
                return Err("source glyph color/shape differs from v0.6".into());
            }
            members.insert(n);
        }
        if !entries(glyph,"source_path_owner_ids")?.iter().all(|v|
            v.as_str().and_then(|id|ids.get(id))
            .map(|n|members.contains(n))==Some(true)){
            return Err("glyph source path owner has no v0.6 component".into());
        }
        if members.is_empty(){return Err("empty source owned glyph".into());}
        let group=members.into_iter().collect::<Vec<_>>();
        let mut pairs=Vec::new();
        for (j,&a) in group.iter().enumerate(){
            for &b in group.iter().skip(j+1){pairs.push((a,b));}
        }
        ranked.push(ch);
        byCharacter.push(pairs);
    }
    if byCharacter.iter().map(Vec::len).sum::<usize>()!=1020{
        return Err("expected 1,020 source-owned intra-glyph pair observations".into());
    }
    Ok((byCharacter,ranked,distance))
}
fn edgeCounts(pairs:&Pairs,fold:usize,train:bool)->Vec<Edge>{
    let mut counts=BTreeMap::<(usize,usize),usize>::new();
    for (rank,obs) in pairs.iter().enumerate(){
        if (rank%5!=fold)!=train {continue;}
        for &(a,b) in obs{*counts.entry((a,b)).or_default()+=1;}
    }
    counts.into_iter().map(|((a,b),weight)|Edge{a,b,weight}).collect()
}
fn checkHoldout(pairs:&Pairs,fold:usize,assignment:&[usize],dist:&[f64])
    ->(usize,usize,usize,usize,usize,usize,Vec<usize>){
    let mut baseline=0;let mut candidate=0;let mut introduced=0;
    let mut resolved=0;let mut retained=0;let mut pairCount=0;let mut ranks=Vec::new();
    let identity=(0..520).collect::<Vec<_>>();
    for (rank,obs) in pairs.iter().enumerate(){
        if rank%5!=fold{continue;}
        ranks.push(rank+1);
        for &(a,b) in obs{
            let e=Edge{a,b,weight:1};
            let old=cost(&e,&identity,dist,520);
            let new=cost(&e,assignment,dist,520);
            baseline+=usize::from(old);
            candidate+=usize::from(new);
            if new&&!old{introduced+=1;}
            if old&&!new{resolved+=1;}
            if old&&new{retained+=1;}
            pairCount+=1;
        }
    }
    (baseline,candidate,introduced,resolved,retained,pairCount,ranks)
}
fn build()->Result<Value,String>{
    let (pairs,_characters,dist)=prepare()?;
    let mut folds=Vec::new();
    let mut baselineHeldout=0;let mut candidateHeldout=0;let mut introduced=0;
    let mut resolved=0;let mut retained=0;let mut heldoutPairCount=0;
    let mut distinctRanks=BTreeSet::new();let mut totalSwaps=0;
    for fold in 0..5{
        let training=edgeCounts(&pairs,fold,true);
        let heldout=edgeCounts(&pairs,fold,false);
        if heldout.len()>training.len(){return Err("fold heldout larger than training".into());}
        let identity=(0..520).collect::<Vec<_>>();
        let trainBase=warned(&training,&identity,&dist,520);
        let (candidate,swaps)=optimize(&training,&dist,520);
        let trainAfter=warned(&training,&candidate,&dist,520);
        if trainAfter>trainBase{return Err("in-sample warning count increased".into());}
        let paletteMultiset=candidate.iter().copied().collect::<BTreeSet<_>>();
        if paletteMultiset.len()!=520{return Err("palette color permutation lost an identity".into());}
        let (base,alternative,added,removed,kept,pairCount,ranks)=
            checkHoldout(&pairs,fold,&candidate,&dist);
        if ranks.len()!=200||added+kept!=alternative||removed+kept!=base||
            pairCount!=heldout.iter().map(|e|e.weight).sum::<usize>(){
            return Err("held-out source warning conservation failed".into());
        }
        if !ranks.iter().all(|r|(r-1)%5==fold
           &&distinctRanks.insert(*r)){
            return Err("repeated or in-sample source rank in heldout fold".into());
        }
        let trainSeen=(0..1000).filter(|rank|rank%5!=fold).count();
        if trainSeen!=800{return Err("fold training count changed".into());}
        baselineHeldout+=base;candidateHeldout+=alternative;
        introduced+=added;resolved+=removed;retained+=kept;
        heldoutPairCount+=pairCount;totalSwaps+=swaps.len();
        folds.push(json!({
            "fold":fold+1,"heldoutModulo":fold,"trainGlyphs":800,"heldoutGlyphs":200,
            "heldoutSourceRanks":ranks,
            "trainingPairObservations":training.iter().map(|e|e.weight).sum::<usize>(),
            "trainingClosePairsOriginal":trainBase,
            "trainingClosePairsCandidate":trainAfter,
            "swapCount":swaps.len(),
            "holdoutPairObservations":pairCount,
            "heldoutClosePairsOriginal":base,
            "heldoutClosePairsCandidate":alternative,
            "heldoutWarningsIntroduced":added,
            "heldoutWarningsResolved":removed,
            "heldoutWarningsRetained":kept,
            "noNewWarningRestrictionAppliesOnlyToTrainingPairs":true,
            "heldoutGlyphMembershipExcludedFromFitting":true,
            "global520ColorMultisetPreserved":true
        }));
    }
    if distinctRanks.len()!=1000||heldoutPairCount!=1020
      ||baselineHeldout!=26||introduced+retained!=candidateHeldout
      ||resolved+retained!=baselineHeldout{
        return Err("five-fold aggregate source warning counts inconsistent".into());
    }
    Ok(json!({
        "schema":SCHEMA,
        "status":"fivefold_character_heldout_numerical_proximity_check_not_perceptual_validation",
        "sources":{
            "baseline":"palettes/mandarin-component-identity-v0.6.json",
            "workingOptimizer":"tools/glyph-pipeline/src/palette_candidate.rs",
            "glyphOwnership":"site/glyphs/mappings.json",
            "rankedTranche":"data/catalog/characters-0001-1000.json",
            "activePaletteModified":false,"geometryOrOwnershipModified":false,
            "independentlyCertifiedGlyphs":0
        },
        "method":{
            "folds":5,"rankPartition":"(rank-1) modulo 5",
            "sourceTrainingGlyphsPerFold":800,
            "heldoutGlyphsPerFold":200,
            "fitUsesOnlyFourNonheldoutRankResidueClasses":true,
            "sameDeterministicSourceConditionedGreedySwapsAsV07":true,
            "onlyTrainingPairsSubjectToZeroNewWarningConstraint":true,
            "sourceColorSpace":"OKLab","closePairThreshold":CUTOFF,
            "eachFoldRetainsExactGlobal520ColorMultiset":true,
            "notTheSingleFullSampleV07Candidate":true
        },
        "summary":{
            "independentSourceRankHoldoutPredictions":1000,
            "sourceIntraGlyphPairObservations":heldoutPairCount,
            "baselineHeldoutClosePairs":baselineHeldout,
            "trainedHeldoutClosePairs":candidateHeldout,
            "newHeldoutClosePairs":introduced,
            "resolvedHeldoutClosePairs":resolved,
            "retainedHeldoutClosePairs":retained,
            "totalSwapsAcrossFiveIndependentFits":totalSwaps,
            "perceptualContrastOrLegibilityValidated":false,
            "independentlyAdjudicatedOwnerRegions":0,
            "humanDiscriminationResults":0,"learnerTransferStudies":0
        },
        "folds":folds
    }))
}
pub(super) fn run(check:bool)->Result<(),String>{
    let d=build()?;
    let path=root().join("site/palettes/mandarin-component-identity-v0.7-fivefold-heldout-v0.1.json");
    let serialized=serde_json::to_string_pretty(&d).map_err(|e|e.to_string())?+"\n";
    if check {
        let exists=fs::read_to_string(&path).map_err(|e|e.to_string())?;
        if exists!=serialized{return Err("regenerated heldout source report differs".into());}
    } else {
        fs::create_dir_all(path.parent().ok_or("missing candidate path")?)
         .map_err(|e|e.to_string())?;
        fs::write(&path,serialized).map_err(|e|e.to_string())?;
    }
    let s=get(&d,"summary")?;
    println!("v0.7 fivefold out-of-sample source warning pairs: v0.6={}, trained={}, newly introduced={}; zero perception approvals.",
     get(s,"baselineHeldoutClosePairs")?.as_u64().unwrap_or(0),
     get(s,"trainedHeldoutClosePairs")?.as_u64().unwrap_or(0),
     get(s,"newHeldoutClosePairs")?.as_u64().unwrap_or(0));
    Ok(())
}
#[cfg(test)]
mod tests{
 use super::*;
 #[test]
 fn source_rank_holdout_excludes_all_training_characters(){
     let rows=(0..1000).map(|i|vec![(0,i%3+1)]).collect::<Pairs>();
     for f in 0..5{
         let train=edgeCounts(&rows,f,true);
         let held=edgeCounts(&rows,f,false);
         assert_eq!(train.iter().map(|e|e.weight).sum::<usize>(),800);
         assert_eq!(held.iter().map(|e|e.weight).sum::<usize>(),200);
     }
 }
}
