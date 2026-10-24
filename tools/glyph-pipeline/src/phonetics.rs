use super::*;

fn check_atlas_colors() -> Result<(), String> {
    let root = root();
    let palette = load(&root.join("site/layers-v0.1.json"))?;
    let readings = load(&root.join("site/pronunciation-citations-0001-1000.json"))?;
    let domains = get(&palette, "palette_domains")?;
    let initials = get(get(domains, "initial")?, "tokens")?;
    let finals = get(get(domains, "final")?, "tokens")?;
    let tones = get(get(domains, "tone")?, "tokens")?;
    let symbols = get(get(domains, "tone")?, "symbols")?;
    let records = entries(&readings, "characters")?;
    if records.len() != 1000 {
        return Err(format!("phonetic atlas expected 1000 characters; got {}", records.len()));
    }
    let mut pages: Vec<String> = Vec::new();
    for page in 0..10 {
        let start = page * 100 + 1;
        let path = root.join(format!("site/characters/{start:04}-{:04}.html", start + 99));
        pages.push(fs::read_to_string(&path).map_err(|e| format!("{}: {e}",path.display()))?);
    }
    for (index, record) in records.iter().enumerate() {
        let rank = get(record, "rank")?.as_u64().ok_or("reading rank is not numeric")? as usize;
        if rank != index + 1 {
            return Err(format!("pronunciation dataset is not ordered at {rank}"));
        }
        let character = string(record, "character")?;
        let first = entries(record,"readings")?.first()
            .ok_or_else(||format!("{character}: no citation reading"))?;
        let initial = string(first, "initial")?;
        let final_token = string(first,"final")?;
        let tone = get(first, "tone")?.as_u64().ok_or("tone not integer")?;
        if tone > 4 { return Err(format!("{character}: unsupported tone {tone}")); }
        let tone_key = tone.to_string();
        let onset_color = get(initials, initial)?.as_str()
            .ok_or_else(||format!("{character}: initial token missing color"))?;
        let final_color = get(finals, final_token)?.as_str()
            .ok_or_else(||format!("{character}: final token missing color"))?;
        let tone_color = get(tones, &tone_key)?.as_str()
            .ok_or_else(||format!("{character}: tone missing color"))?;
        let tone_symbol = get(symbols, &tone_key)?.as_str()
            .ok_or_else(||format!("{character}: tone missing symbol"))?;
        let page = &pages[(rank - 1)/100];
        let heading = format!("<details class=\"tile\" id=\"c{rank:04}\" style=\"");
        let start = page.find(&heading)
            .ok_or_else(||format!("{character} rank {rank}: missing atlas tile"))?;
        let end = page[start..].find("</details>")
            .ok_or_else(||format!("{character} rank {rank}: unclosed atlas tile"))?;
        let card = &page[start..start + end];
        let style_end = card.find("\"><summary").ok_or_else(||format!("{character}: missing tile style"))?;
        let style = &card[..style_end];
        for (channel, expected) in [
            ("--onset-color", onset_color),
            ("--rime-color", final_color),
            ("--tone-color", tone_color)
        ] {
            let fragment = format!("{channel}:{expected}");
            if !style.contains(&fragment) {
                return Err(format!(
                    "{character} rank {rank}: {channel} disagrees with citation reading {} (expected {expected})",
                    string(first,"display")?
                ));
            }
        }
        if !card.contains(&format!("<summary title=\"Inspect {character}\">")) {
            return Err(format!("{character} rank {rank}: atlas card character mismatch"));
        }
        let display = string(first,"display")?;
        if !card.contains(&format!("aria-label=\"Pinyin {display}\"")) {
            return Err(format!("{character} rank {rank}: first listed citation reading {display} does not match marker"));
        }
        let expected_marker = format!(
            "<span class=\"tone-marker\" aria-label=\"Tone {tone}\">{tone_symbol}</span>"
        );
        if !card.contains(&expected_marker) {
            return Err(format!("{character} rank {rank}: tone symbol disagrees with canonical palette"));
        }
    }
    println!("Citation-color audit: all 1000 atlas tiles match their canonical initial, final and tone assignments.");
    Ok(())
}


fn is_final_spelling_risk(id: &str, initial: &str, final_spelling: &str) -> bool {
    let palatal = matches!(initial, "j" | "q" | "x" | "y");
    match id {
        "post_sibilant_i" =>
            final_spelling == "i" && matches!(initial, "z" | "c" | "s" | "zh" | "ch" | "sh" | "r"),
        "palatal_written_u" => final_spelling == "u" && palatal,
        "contracted_iu" => final_spelling == "iu",
        "contracted_ui" => final_spelling == "ui",
        "contracted_un_nonpalatal" => final_spelling == "un" && !palatal,
        "palatal_written_un" => final_spelling == "un" && palatal,
        "palatal_written_ue" => final_spelling == "ue" && palatal,
        "palatal_written_uan" => final_spelling == "uan" && palatal,
        "labial_written_o" =>
            final_spelling == "o" && matches!(initial, "b" | "p" | "m" | "f" | "w"),
        _ => false,
    }
}

/// Independently recounts source-orthographic evidence in Rust.
/// The source's written symbols are not phonetic or linguistic approvals.
fn check_written_final_source_evidence() -> Result<(), String> {
    const RULES: [(&str, usize); 9] = [
        ("post_sibilant_i", 63),
        ("palatal_written_u", 33),
        ("contracted_iu", 24),
        ("contracted_ui", 19),
        ("contracted_un_nonpalatal", 20),
        ("palatal_written_un", 18),
        ("palatal_written_ue", 10),
        ("palatal_written_uan", 10),
        ("labial_written_o", 16),
    ];
    let r = root();
    let source = load(&r.join("site/pronunciation-citations-0001-1000.json"))?;
    let controls = load(&r.join("data/phonetics/written-final-symbol-control-v0.1.json"))?;
    let warnings = load(&r.join("data/phonetics/mandarin-final-spelling-context-gates-v0.1.json"))?;
    if string(&source, "schema")? != "chromalect.pronunciation-citations.v0"
        || string(&controls, "schema")? != "chromalect.phonetics.written-final-symbol-control.v0.1"
        || string(&warnings, "schema")? != "chromalect.phonetics.mandarin-final-spelling-context-gates.v0.1"
    {
        return Err("phonetic source research schema drift".into());
    }
    if string(get(&controls, "source")?, "upstreamBlobSHA")?
        != string(get(&source, "source")?, "blob_sha")?
        || string(get(&warnings, "source")?, "upstreamBlobSHA")?
        != string(get(&source, "source")?, "blob_sha")?
    {
        return Err("phonetic research no longer shares pinned citation source".into());
    }
    let rows = entries(&source, "characters")?;
    if rows.len() != 1000 { return Err("phonetic evidence requires 1000 source characters".into()); }

    let mut frequencies = BTreeMap::<String, usize>::new();
    let mut counts = BTreeMap::<&str, usize>::new();
    let mut flagged_triples = BTreeMap::<&str, BTreeSet<(String,String,u64)>>::new();
    let mut reading_count = 0;
    for (index, row) in rows.iter().enumerate() {
        if get(row, "rank")?.as_u64() != Some(index as u64 + 1) {
            return Err("citation source rank order changed".into());
        }
        for reading in entries(row, "readings")? {
            reading_count += 1;
            let initial = string(reading, "initial")?;
            let final_token = string(reading, "final")?;
            let tone = get(reading, "tone")?.as_u64().ok_or("source tone not numeric")?;
            if tone > 4 { return Err("source tone outside documented citation categories".into()); }
            *frequencies.entry(final_token.into()).or_default() += 1;
            let mut matching = 0;
            for (id, _) in RULES {
                if is_final_spelling_risk(id, initial, final_token) {
                    matching += 1;
                    *counts.entry(id).or_default() += 1;
                    flagged_triples.entry(id).or_default().insert(
                        (initial.into(), final_token.into(), tone));
                }
            }
            if matching > 1 { return Err("source phonetic warning classes overlap".into()); }
        }
    }
    if reading_count != 1171 || frequencies.len() != 33 {
        return Err("source citation final vocabulary or reading count changed".into());
    }

    let control_data = get(&controls, "summary")?;
    if get(control_data, "writtenFinalsEncoded")?.as_u64() != Some(33)
        || get(control_data, "machineSourceSpellingRoundtrips")?.as_u64() != Some(1171)
        || get(control_data, "independentlyApprovedIPARealizations")?.as_u64() != Some(0)
        || get(control_data, "humanSymbolDecodingTrials")?.as_u64() != Some(0)
        || get(control_data, "learningResults")?.as_u64() != Some(0)
    {
        return Err("written final control misstates evidence or approvals".into());
    }
    let letters = entries(&controls, "primitives")?.iter()
        .map(|p| string(p,"letter").map(str::to_owned))
        .collect::<Result<Vec<_>,_>>()?;
    if letters.len() != 9 || letters.iter().collect::<BTreeSet<_>>().len() != 9 {
        return Err("written final geometric alphabet not nine unique letters".into());
    }
    let mut symbols = BTreeSet::new();
    for record in entries(&controls, "records")? {
        let token = string(record,"token")?;
        let occurrences = get(record,"sourceOccurrences")?.as_u64()
            .ok_or("written final source occurrence not numeric")? as usize;
        if frequencies.get(token) != Some(&occurrences)
            || get(record,"independentPhonologicalInterpretationApproved")?.as_bool() != Some(false)
            || get(record,"humanDecodingAccuracyKnown")?.as_bool() != Some(false)
            || get(record,"machineSpellingRoundtrip")?.as_bool() != Some(true)
            || !symbols.insert(token.to_owned())
        {
            return Err(format!("written final {token:?} contains unsupported approval or count"));
        }
        let digits = entries(record,"iconRegistryIndices")?;
        let original = entries(record,"symbolLetters")?;
        if digits.len() != original.len() || digits.is_empty() {
            return Err(format!("written final {token}: malformed symbol indices"));
        }
        let mut decoded = String::new();
        for (digit, glyph) in digits.iter().zip(original) {
            let i = digit.as_u64().ok_or("nonintegral geometric symbol index")? as usize;
            let letter = letters.get(i).ok_or("geometric primitive index out of bounds")?;
            if glyph.as_str() != Some(letter.as_str()) { return Err("geometric letter mismatch".into()); }
            decoded.push_str(letter);
        }
        if decoded != token { return Err("geometric control failed literal final roundtrip".into()); }
    }
    if symbols.len() != 33 { return Err("not all 33 source final symbols represented".into()); }

    let flags = get(&warnings,"summary")?;
    if get(flags,"flaggedSourceReadings")?.as_u64() != Some(213)
        || get(flags,"flaggedDistinctWrittenTriples")?.as_u64() != Some(108)
        || get(flags,"flagCategories")?.as_u64() != Some(9)
        || get(flags,"independentlyAdjudicatedFinalPhonemes")?.as_u64() != Some(0)
        || get(flags,"approvedContextualPronunciations")?.as_u64() != Some(0)
        || get(flags,"approvedAcousticTranscriptions")?.as_u64() != Some(0)
    {
        return Err("final spelling exception worklist or nonapproval counters disagree".into());
    }
    let mut seen_rules = BTreeSet::new();
    for record in entries(&warnings,"records")? {
        let id = string(record,"id")?;
        let expected = RULES.iter().find(|(name,_)| *name == id)
            .map(|(_, count)| *count).ok_or("unrecognized source phonetic caution")?;
        if !seen_rules.insert(id)
            || counts.get(id) != Some(&expected)
            || get(record,"observedReadingCount")?.as_u64() != Some(expected as u64)
            || get(record,"independentIPAAnalysisApproved")?.as_bool() != Some(false)
            || get(record,"certifiedAcousticRealizations")?.as_u64() != Some(0)
        {
            return Err(format!("source phonetic caution {id} differs from original citation corpus"));
        }
        let independent = flagged_triples.get(id).ok_or("missing source exception triples")?;
        let stated = entries(record,"observedTokenTriples")?;
        if stated.len() != independent.len()
            || get(record,"uniqueCitationTriples")?.as_u64() != Some(independent.len() as u64)
        {
            return Err(format!("source phonetic caution {id} distinct token count changed"));
        }
        let mut seen = BTreeSet::new();
        for triple in stated {
            let item = (
                string(triple,"initial")?.to_owned(),
                string(triple,"final")?.to_owned(),
                get(triple,"tone")?.as_u64().ok_or("source exception tone not numeric")?,
            );
            if !independent.contains(&item) || !seen.insert(item) {
                return Err(format!("source warning {id} has fabricated or duplicated token"));
            }
        }
    }
    if seen_rules.len() != 9
        || counts.values().sum::<usize>() != 213
        || flagged_triples.values().map(BTreeSet::len).sum::<usize>() != 108
    {
        return Err("written final exception coverage incomplete".into());
    }
    println!("Rust source cross-check: 33 final spellings, 1171 readings, 213 warnings in 9 classes; no IPA approvals.");
    Ok(())
}


fn check_citation_tone_isolation() -> Result<(), String> {
    let r = root();
    let citations = load(&r.join("site/pronunciation-citations-0001-1000.json"))?;
    let reference = load(&r.join("data/phonetics/mandarin-citation-tone-contours-v0.1.json"))?;
    let audit = load(&r.join("data/phonetics/citation-tone-isolation-audit-v0.1.json"))?;
    let colors = load(&r.join("site/layers-v0.1.json"))?;
    if string(&audit, "schema")? != "chromalect.phonetics.citation-tone-isolation-audit.v0.1"
        || string(&audit, "status")? != "source_citation_labels_and_distinct_idealized_pitches_not_automatic_perceptual_or_contextual_validation"
        || string(&reference, "schema")? != "chromalect.phonetics.mandarin-citation-tone-contours.v0.1"
        || string(get(&audit,"sources")?, "sourceBlobSHA")? != string(get(&citations,"source")?, "blob_sha")?
    {
        return Err("source tone isolation audit or pin changed".into());
    }
    let mut counts = [0usize; 5];
    for (index, row) in entries(&citations,"characters")?.iter().enumerate() {
        if get(row, "rank")?.as_u64() != Some(index as u64 + 1) {
            return Err("citation tone source rank changed".into());
        }
        for reading in entries(row,"readings")? {
            let t = get(reading,"tone")?.as_u64()
                .ok_or("tone label is not an integer")? as usize;
            let slot = counts.get_mut(t).ok_or("out-of-range citation tone")?;
            *slot += 1;
        }
    }
    if counts != [10,304,252,223,382] {
        return Err("first-tranche citation tone counts differ from pinned source".into());
    }
    let summary = get(&audit, "summary")?;
    if get(summary, "sourceCitationReadings")?.as_u64() != Some(1171)
        || get(summary, "toneCategories")?.as_u64() != Some(5)
        || get(summary, "machineDistinctContourShapes")?.as_u64() != Some(4)
        || get(summary, "independentPhoneticToneCertifications")?.as_u64() != Some(0)
        || get(summary, "contextualToneApprovals")?.as_u64() != Some(0)
        || get(summary, "humanToneDiscriminationTrials")?.as_u64() != Some(0)
        || get(summary, "learningStudyEvidence")?.as_u64() != Some(0)
    {
        return Err("tone evidence approval counters were modified".into());
    }
    let frequencies = get(summary,"sourceToneCounts")?;
    let a = entries(&audit,"records")?;
    let b = entries(&reference,"tones")?;
    if a.len() != 5 || b.len() != 5 { return Err("five source tone categories required".into()); }
    let palette = get(get(get(&colors, "palette_domains")?, "tone")?, "symbols")?;
    let mut unique_contours = BTreeSet::new();
    for i in 0..5 {
        let token = i.to_string();
        let tone = &b[i];
        let record = &a[i];
        if string(record,"token")? != token
            || string(tone,"token")? != token
            || get(record,"sourceCitationOccurrences")?.as_u64() != Some(counts[i] as u64)
            || get(frequencies,&token)?.as_u64() != Some(counts[i] as u64)
            || string(record,"citationToneSymbol")? != string(palette,&token)?
            || get(record,"idealizedLevels")? != get(tone,"levels")?
            || get(record,"independentlyAcousticallyCalibrated")?.as_bool() != Some(false)
            || get(record,"contextualSandhiApproved")?.as_bool() != Some(false)
            || !get(record,"humanPerceptionAccuracy")?.is_null()
        {
            return Err(format!("source tone {i} mismatch or unearned approval"));
        }
        let levels = get(tone,"levels")?;
        if i == 0 {
            if !levels.is_null() { return Err("neutral citation tone must lack fixed contour".into()); }
        } else {
            let values = levels.as_array().ok_or("nonneutral contour not an array")?;
            if values.len() < 2 || !values.iter().all(|x| matches!(x.as_u64(), Some(1..=5))) {
                return Err("idealized nonneutral pitch values out of bounds".into());
            }
            if !unique_contours.insert(levels.to_string()) {
                return Err("non-neutral reference contours are not distinct".into());
            }
        }
    }
    if unique_contours.len() != 4 {
        return Err("expected four unique idealized nonneutral contours".into());
    }
    let separations = get(&audit,"separation")?;
    for label in ["tonalChannelUsesOnlySourceToneLabel",
                  "noInitialFeatureClassificationRequired",
                  "noFinalFeatureClassificationRequired",
                  "neutralToneHasNoFixedContextFreeContour",
                  "ChaoScaleIsRelativeNotHertz"] {
        if get(separations,label)?.as_bool() != Some(true) {
            return Err(format!("tone source-only separation guarantee {label} invalid"));
        }
    }
    if get(separations,"supportsHumanAcousticEquivalenceClaims")?.as_bool() != Some(false) {
        return Err("machine tone shapes cannot claim human acoustic equivalence".into());
    }
    println!("Rust tone cross-check: 1,171 citation labels, four distinct idealized contours, undefined neutral contour, zero phonetic approvals.");
    Ok(())
}


/// Reconstruct the 1,171 source citation spellings from the combined
/// initial working-feature key, geometric final indices and citation tone symbol.
/// This is deliberately orthographic, not a verified phonological IPA decoder.
fn check_composed_visual_citation_decoder() -> Result<(), String> {
    let r = root();
    let source = load(&r.join("site/pronunciation-citations-0001-1000.json"))?;
    let layers = load(&r.join("site/layers-v0.1.json"))?;
    let features = load(&r.join("data/phonetics/mandarin-initial-feature-candidates-v0.1.json"))?;
    let finals = load(&r.join("data/phonetics/written-final-symbol-control-v0.1.json"))?;
    let audit = load(&r.join("data/phonetics/mandarin-visual-citation-codec-audit-v0.1.json"))?;
    if string(&audit, "schema")? != "chromalect.phonetics.mandarin-visual-citation-codec-audit.v0.1"
        || string(&audit, "status")? != "exact_machine_visual_token_decoding_not_phonemic_or_human_verified"
        || string(&features, "schema")? != "chromalect.phonetics.mandarin-initial-feature-candidates.v0.1"
        || string(&finals, "schema")? != "chromalect.phonetics.written-final-symbol-control.v0.1"
        || string(get(&audit,"sources")?,"pinnedCitationBlobSHA")?
            != string(get(&source,"source")?,"blob_sha")?
        || string(get(&finals,"source")?,"upstreamBlobSHA")?
            != string(get(&source,"source")?,"blob_sha")?
    {
        return Err("composed visual citation sources diverged".into());
    }
    let counts = get(&audit, "counts")?;
    for field in ["independentlyVerifiedPhonemicMappings", "independentHumanVisualDecodings",
                  "contextualReadingApprovals", "educationalEffectMeasurements"] {
        if get(counts, field)?.as_u64() != Some(0) {
            return Err(format!("unsupported composed citation scientific approval: {field}"));
        }
    }
    if get(counts,"sourceReadings")?.as_u64() != Some(1171)
        || get(counts,"attestedCitationTriples")?.as_u64() != Some(673)
        || get(counts,"writtenFinalSymbols")?.as_u64() != Some(33)
        || get(counts,"primitiveLetters")?.as_u64() != Some(9)
        || get(counts,"distinctSerializedVisualCodes")?.as_u64() != Some(673)
        || get(counts,"independentMachineSerializationRoundTrips")?.as_u64() != Some(1171)
        || get(counts,"failures")?.as_u64() != Some(0)
    {
        return Err("composed visual codec audit counts do not match source".into());
    }

    // A conventional initial is represented by a unique provisional working tuple;
    // y, w and zero have their own spelling-marker namespace.
    let mut forward_initial = BTreeMap::<String, String>::new();
    let mut reverse_initial = BTreeMap::<String, String>::new();
    for row in entries(&features,"tokens")? {
        let token = string(row, "token")?;
        let category = string(row, "category")?;
        let code = match category {
            "conventional_pinyin_initial" => format!(
                "feature:{}|{}|{}",
                string(row,"place")?,string(row,"manner")?,string(row,"aspiration")?),
            "orthographic_onset_convention_not_independent_consonant" => {
                if !matches!(token, "y" | "w" | "∅")
                    || !get(row,"workingIPACandidate")?.is_null() {
                    return Err("orthographic-only source onset received phoneme mapping".into());
                }
                format!("spelling:{token}")
            },
            _ => return Err("unrecognized source initial feature category".into()),
        };
        if forward_initial.insert(token.to_owned(), code.clone()).is_some()
            || reverse_initial.insert(code, token.to_owned()).is_some() {
            return Err("initial working feature code collides".into());
        }
    }
    if forward_initial.len() != 24 || reverse_initial.len() != 24 {
        return Err("source initial symbol vocabulary incomplete".into());
    }

    let alphabet = entries(&finals,"primitives")?.iter()
        .map(|x| string(x,"letter").map(str::to_owned))
        .collect::<Result<Vec<_>,_>>()?;
    if alphabet.len() != 9 || alphabet.iter().collect::<BTreeSet<_>>().len() != 9 {
        return Err("expected nine distinct geometric letters".into());
    }
    let mut forward_final = BTreeMap::<String, Vec<usize>>::new();
    let mut reverse_final = BTreeMap::<Vec<usize>, String>::new();
    for row in entries(&finals,"records")? {
        let token = string(row,"token")?;
        let indices = entries(row,"iconRegistryIndices")?.iter().map(|n| {
            n.as_u64().map(|v|v as usize).ok_or("geometric index is not integral".to_owned())
        }).collect::<Result<Vec<_>,_>>()?;
        if indices.is_empty() || indices.len() > 4
            || indices.iter().any(|n|*n >= alphabet.len())
            || indices.iter().map(|&i|alphabet[i].as_str()).collect::<String>() != token
            || get(row,"independentPhonologicalInterpretationApproved")?.as_bool()!=Some(false)
        {
            return Err(format!("source final {token} has nonreversible visual indices"));
        }
        if forward_final.insert(token.to_owned(),indices.clone()).is_some()
            || reverse_final.insert(indices,token.to_owned()).is_some() {
            return Err("two source final spellings share geometric code".into());
        }
    }
    if forward_final.len() != 33 || reverse_final.len()!=33 {
        return Err("expected 33 unambiguous source geometric finals".into());
    }

    let symbols = get(get(get(&layers,"palette_domains")?,"tone")?,"symbols")?;
    let mut tone_by_symbol = BTreeMap::<String,u64>::new();
    for tone in 0..5u64 {
        let symbol = string(symbols,&tone.to_string())?;
        if tone_by_symbol.insert(symbol.to_owned(),tone).is_some() {
            return Err("citation tone symbols collide".into());
        }
    }
    if tone_by_symbol.len()!=5 { return Err("source tone symbols incomplete".into()); }

    let readings = entries(&source,"characters")?;
    if readings.len()!=1000 { return Err("citation source tranche changed".into()); }
    let mut observed = BTreeMap::<(String,String,u64), String>::new();
    let mut encoded = BTreeSet::<(String,Vec<usize>,String)>::new();
    let mut occurrences = 0usize;
    for (i,row) in readings.iter().enumerate() {
        if get(row,"rank")?.as_u64()!=Some(i as u64+1) {
            return Err("visual citation source rank mismatch".into());
        }
        for reading in entries(row,"readings")? {
            occurrences+=1;
            let initial = string(reading,"initial")?;
            let final_token = string(reading,"final")?;
            let tone = get(reading,"tone")?.as_u64().ok_or("nonintegral citation tone")?;
            let display = string(reading,"display")?;
            let visual_initial = forward_initial.get(initial).ok_or("missing working onset visual key")?;
            let visual_final = forward_final.get(final_token).ok_or("missing geometric final code")?;
            let visual_tone = string(symbols,&tone.to_string())?;
            // Reverse using the visual code, rather than the original spelling fields.
            let decoded_initial = reverse_initial.get(visual_initial).ok_or("unmapped initial feature code")?;
            let decoded_final = reverse_final.get(visual_final).ok_or("unmapped final symbol sequence")?;
            let decoded_tone = tone_by_symbol.get(visual_tone).ok_or("unmapped tone contour label")?;
            if decoded_initial != initial || decoded_final != final_token || *decoded_tone != tone {
                return Err("visual initial/final/tone reconstruction lost source identity".into());
            }
            let triple=(decoded_initial.clone(),decoded_final.clone(),*decoded_tone);
            if let Some(existing)=observed.insert(triple,display.to_owned()) {
                if existing!=display { return Err("one source visual code has two Pinyin spellings".into()); }
            }
            encoded.insert((visual_initial.clone(),visual_final.clone(),visual_tone.to_owned()));
        }
    }
    if occurrences!=1171 || observed.len()!=673 || encoded.len()!=673 {
        return Err(format!("composed source visual grammar expected 1171/673, got {occurrences}/{}/{}",
                           observed.len(),encoded.len()));
    }
    println!("Rust composed visual citation decoder: 1,171 orthographic reconstructions, 673 codes, no phonemic approvals.");
    Ok(())
}

pub(super) fn check() -> Result<(),String> {
    check_atlas_colors()?;
    check_written_final_source_evidence()?;
    check_citation_tone_isolation()?;
    check_composed_visual_citation_decoder()?;
    feature_citation::check()
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn all_static_atlas_pages_use_canonical_citation_colors() {
        check_atlas_colors().unwrap();
    }
    #[test]
    fn phonetic_source_final_controls_are_cross_checked_in_rust() {
        check_written_final_source_evidence().unwrap();
    }
    #[test]
    fn pinned_tone_labels_and_idealized_contours_are_separately_verified() {
        check_citation_tone_isolation().unwrap();
    }
    #[test]
    fn composed_visual_citation_symbols_roundtrip_in_rust() {
        check_composed_visual_citation_decoder().unwrap();
    }
}
