//! Research-only reversible citation code for provisional simple-final feature tuples.
//! This module does not assert phonemes, acoustic realizations, or human decoding.
use super::*;
const SCHEMA: &str = "chromalect.phonetics.working-feature-citation-codec-audit.v0.1";

fn feature_key(fields: &[&str]) -> Result<String, String> {
    if fields.iter().any(|s| s.is_empty() || s.contains('|')) {
        return Err("feature field missing or ambiguous".into());
    }
    Ok(fields.join("|"))
}
fn triple_key(initial: &str, final_token: &str, tone: u64) -> (String,String,u64) {
    (initial.to_owned(),final_token.to_owned(),tone)
}
pub(super) fn check() -> Result<(),String> {
    let r=root();
    let source=load(&r.join("site/pronunciation-citations-0001-1000.json"))?;
    let working=load(&r.join("data/phonetics/mandarin-simple-final-feature-candidates-v0.1.json"))?;
    let initials=load(&r.join("data/phonetics/mandarin-initial-feature-candidates-v0.1.json"))?;
    let cautions=load(&r.join("data/phonetics/mandarin-final-spelling-context-gates-v0.1.json"))?;
    let layers=load(&r.join("site/layers-v0.1.json"))?;
    let audit=load(&r.join("data/phonetics/working-feature-citation-codec-audit-v0.1.json"))?;

    if string(&source,"schema")?!="chromalect.pronunciation-citations.v0"
        || string(&working,"schema")?!="chromalect.phonetics.mandarin-simple-final-feature-candidates.v0.1"
        || string(&working,"status")?!="six_pedagogical_written_final_feature_hypotheses_not_ipa_or_context_approval"
        || string(&initials,"schema")?!="chromalect.phonetics.mandarin-initial-feature-candidates.v0.1"
        || string(&cautions,"schema")?!="chromalect.phonetics.mandarin-final-spelling-context-gates.v0.1"
        || string(&audit,"schema")?!=SCHEMA
        || string(&audit,"status")?!="machine_reversible_six_provisional_simple_final_features_not_ipa_or_human_decoding"
        || string(get(&working,"source")?,"upstreamBlobSHA")?
            !=string(get(&source,"source")?,"blob_sha")?
        || string(get(&cautions,"source")?,"upstreamBlobSHA")?
            !=string(get(&source,"source")?,"blob_sha")?
        || string(get(&audit,"source")?,"citationBlobSHA")?
            !=string(get(&source,"source")?,"blob_sha")?
        || string(&layers,"schema")?!="chromalect.presentation-layers.v0" {
        return Err("unmatched feature citation source, pin, or published schema".into());
    }
    let summary=get(&working,"summary")?;
    for (name,expected) in [
        ("distinctSimpleFinalLabels",6),("allSourceFinalLabels",33),
        ("sourceCitationReadings",1171),("simpleFinalOccurrences",432),
        ("flaggedSimpleFinalOccurrences",112),("unflaggedSimpleFinalOccurrences",320),
        ("uniqueWorkingFeatureTuples",6),("independentIPAApprovalCount",0),
        ("humanVowelFeatureDecodingTrials",0),("learningOutcomeEvidence",0)] {
        if get(summary,name)?.as_u64()!=Some(expected){
            return Err(format!("source working feature count {name} changed"));
        }
    }
    let mut forward_final=BTreeMap::<String,String>::new();
    let mut reverse_final=BTreeMap::<String,String>::new();
    for record in entries(&working,"records")?{
        if get(record,"acceptedAsIPAOrContextualPhone")?.as_bool()!=Some(false)
            || string(record,"articulatoryFeatureStatus")?
                !="provisional_pedagogical_candidate_not_independently_adjudicated" {
            return Err("an unreviewed feature was promoted".into());
        }
        let token=string(record,"token")?;
        let key=feature_key(&[string(record,"workingHeight")?,
            string(record,"workingBackness")?,string(record,"workingRounding")?])?;
        if forward_final.insert(token.to_owned(),key.clone()).is_some()
            || reverse_final.insert(key,token.to_owned()).is_some() {
            return Err("working final feature tuple not independently reversible".into());
        }
    }
    if forward_final.len()!=6 || reverse_final.len()!=6 {
        return Err("expected six unique candidate final shapes".into());
    }
    let mut forward_initial=BTreeMap::<String,String>::new();
    let mut reverse_initial=BTreeMap::<String,String>::new();
    for record in entries(&initials,"tokens")?{
        let token=string(record,"token")?;
        let key=match string(record,"category")? {
            "conventional_pinyin_initial"=>format!("F:{}",feature_key(&[
                string(record,"place")?,string(record,"manner")?,
                string(record,"aspiration")?])?),
            "orthographic_onset_convention_not_independent_consonant"=>{
                if !matches!(token,"y"|"w"|"∅")
                    || !get(record,"workingIPACandidate")?.is_null(){
                    return Err("spelling convention received an independent consonant".into());
                }
                format!("O:{token}")
            },
            _=>return Err("unexpected source initial category".into())
        };
        if forward_initial.insert(token.to_owned(),key.clone()).is_some()
            || reverse_initial.insert(key,token.to_owned()).is_some(){
            return Err("source initial tuple collision".into());
        }
    }
    if forward_initial.len()!=24 || reverse_initial.len()!=24 {
        return Err("expected 21 initial tuples and three spelling conventions".into());
    }

    let mut rejected=BTreeSet::<(String,String,u64)>::new();
    let mut counted_flags=0u64;
    for row in entries(&cautions,"records")? {
        if get(row,"independentIPAAnalysisApproved")?.as_bool()!=Some(false)
            || get(row,"certifiedAcousticRealizations")?.as_u64()!=Some(0) {
            return Err("a source warning claims unsupported IPA approval".into());
        }
        for item in entries(row,"observedTokenTriples")?{
            let tone=get(item,"tone")?.as_u64().ok_or("bad warning tone")?;
            if !rejected.insert(triple_key(string(item,"initial")?,
                                         string(item,"final")?,tone)){
                return Err("two warning families share a citation triple".into());
            }
        }
        counted_flags+=get(row,"observedReadingCount")?.as_u64()
            .ok_or("missing warning count")?;
    }
    if rejected.len()!=108 || counted_flags!=213 {
        return Err("all nine original written-spelling caution families required".into());
    }

    let tone_symbols=get(get(get(&layers,"palette_domains")?,"tone")?,"symbols")?;
    let mut reverse_tones=BTreeMap::<String,u64>::new();
    for t in 0..5u64 {
        let symbol=string(tone_symbols,&t.to_string())?;
        if reverse_tones.insert(symbol.into(),t).is_some(){
            return Err("citation tone symbols not reversible".into());
        }
    }
    let mut eligible=0usize;
    let mut guarded=0usize;
    let mut not_proposed=0usize;
    let mut eligible_codes=BTreeMap::<(String,String,String),String>::new();
    let mut eligible_triples=BTreeSet::<(String,String,u64)>::new();
    let mut counts=BTreeMap::<String,(u64,u64)>::new();
    let characters=entries(&source,"characters")?;
    if characters.len()!=1000{return Err("unexpected citation source characters".into());}
    for (index,item) in characters.iter().enumerate(){
        if get(item,"rank")?.as_u64()!=Some(index as u64+1){
            return Err("source citation rank mismatch".into());
        }
        for r in entries(item,"readings")?{
            let initial=string(r,"initial")?;
            let final_token=string(r,"final")?;
            let tone=get(r,"tone")?.as_u64().ok_or("source tone absent")?;
            if tone>4{return Err("unsupported source citation tone".into());}
            let Some(final_code)=forward_final.get(final_token) else{
                not_proposed+=1;continue;
            };
            let entry=counts.entry(final_token.into()).or_insert((0,0));
            entry.0+=1;
            if rejected.contains(&triple_key(initial,final_token,tone)){
                entry.1+=1;guarded+=1;continue;
            }
            let onset=forward_initial.get(initial).ok_or("unmapped source onset")?;
            let tone_symbol=string(tone_symbols,&tone.to_string())?;
            // Decode from the *complete* feature key with no written final token included.
            let from_initial=reverse_initial.get(onset).ok_or("working onset cannot decode")?;
            let from_final=reverse_final.get(final_code).ok_or("working final cannot decode")?;
            let from_tone=reverse_tones.get(tone_symbol).ok_or("citation tone cannot decode")?;
            if from_initial!=initial || from_final!=final_token || *from_tone!=tone {
                return Err("candidate visual feature decoding lost source structure".into());
            }
            let visual=(onset.clone(),final_code.clone(),tone_symbol.to_owned());
            let pinyin=string(r,"display")?;
            if let Some(previous)=eligible_codes.insert(visual,pinyin.into()){
                if previous!=pinyin{
                    return Err("a working feature code has conflicting citation spellings".into());
                }
            }
            eligible_triples.insert(triple_key(initial,final_token,tone));
            eligible+=1;
        }
    }
    if eligible!=320 || guarded!=112 || not_proposed!=739
        || eligible+guarded+not_proposed!=1171 {
        return Err(format!("visual feature source coverage invalid: {eligible}/{guarded}/{not_proposed}"));
    }
    for row in entries(&working,"records")?{
        let token=string(row,"token")?;
        let (total,flagged)=counts.get(token).ok_or("missing final in source counts")?;
        if get(row,"observedSourceCitationReadings")?.as_u64()!=Some(*total)
            || get(row,"sourceSpellingContextCautions")?.as_u64()!=Some(*flagged){
            return Err(format!("candidate {token}: incorrect source/caution counts"));
        }
    }
    let proof=get(&audit,"counts")?;
    for (key,actual) in [
        ("sourceReadings",1171),("proposedSimpleFinalOccurrences",432),
        ("eligibleWorkingFeatureRoundTrips",320),
        ("withheldContextCautions",112),("withoutFinalFeatureProposal",739),
        ("distinctSimpleFinalFeatureTuples",6),
        ("distinctInitialCodes",24),("toneCategories",5),
        ("uniqueEligibleVisualCodes",eligible_codes.len() as u64),
        ("distinctEligibleSourceTriples",eligible_triples.len() as u64),
        ("roundTripFailures",0),
        ("phonologicalRepresentationApprovals",0),
        ("humanVisualDecodingTrials",0),
        ("learningEffectEvidence",0)] {
        if get(proof,key)?.as_u64()!=Some(actual) {
            return Err(format!("published working-code audit {key} disagrees: got {actual}"));
        }
    }
    if get(&audit,"approvedForHumanStudy")?.as_bool()!=Some(false){
        return Err("working feature code cannot be approved as human experiment".into());
    }
    println!("Rust candidate featural grammar: 320 eligible source-citation roundtrips; 112 withheld, 739 no final feature; zero human/IPA approvals.");
    Ok(())
}

#[cfg(test)]
mod tests{
    #[test]
    fn provisional_simple_final_decoding_is_strictly_reversible(){
        super::check().unwrap();
    }
}
