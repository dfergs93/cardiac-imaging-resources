/**
 * Cardiac Imaging Calculators
 * - ECV (T1 mapping)
 * - 4D Flow / Phase Contrast (Standard / Fontan / Quick)
 *   - Net flow primary; optional fwd/bwd for RF
 *   - BSA indexing (DuBois), HR for mL/beat conversion
 *   - Pool-of-values: computes whatever is calculable
 *   - Volumetric RF from LV/RV stroke volumes
 * - Simplified Bernoulli
 */

document.addEventListener('DOMContentLoaded', function () {
    initECVCalc();
    init4DFlowCalc();
    initBernoulliCalc();
    initCHDTabs();
});

/* ============================================================
   HELPERS
   ============================================================ */
function el(id) { return document.getElementById(id); }

function fVal(id) {
    const e = el(id);
    if (!e || e.value === '') return NaN;
    return parseFloat(e.value);
}

/**
 * Parse a flow input. Accepts single value or range like "4.5 - 4.9"
 */
function parseFlowVal(inputId) {
    const e = el(inputId);
    if (!e || e.value.trim() === '') return { mid: NaN, low: NaN, high: NaN, isRange: false };
    const s = e.value.trim();
    const m = s.match(/^([\d.]+)\s*[-\u2013]\s*([\d.]+)$/);
    if (m) {
        const lo = parseFloat(m[1]), hi = parseFloat(m[2]);
        if (isNaN(lo) || isNaN(hi)) return { mid: NaN, low: NaN, high: NaN, isRange: false };
        return { mid: (lo + hi) / 2, low: lo, high: hi, isRange: true };
    }
    const n = parseFloat(s);
    return { mid: n, low: n, high: n, isRange: false };
}

function computeBSA() {
    const h = fVal('patient-height');
    const w = fVal('patient-weight');
    if (isNaN(h) || isNaN(w) || h <= 0 || w <= 0) return NaN;
    // DuBois formula: BSA = 0.007184 × H^0.725 × W^0.425
    return 0.007184 * Math.pow(h, 0.725) * Math.pow(w, 0.425);
}

function rfBadge(rf) {
    if (isNaN(rf) || rf < 0) return '';
    if (rf < 20) return `<span class="calc-badge mild">RF ${rf.toFixed(1)}% — Trivial/Mild</span>`;
    if (rf < 40) return `<span class="calc-badge moderate">RF ${rf.toFixed(1)}% — Moderate</span>`;
    return `<span class="calc-badge severe">RF ${rf.toFixed(1)}% — Severe</span>`;
}

function qpqsBadge(ratio) {
    if (ratio > 2.0) return `<span class="calc-badge severe">Large L→R shunt</span>`;
    if (ratio > 1.5) return `<span class="calc-badge moderate">Moderate L→R shunt</span>`;
    if (ratio > 1.1) return `<span class="calc-badge mild">Small L→R shunt</span>`;
    if (ratio >= 0.9) return `<span class="calc-badge balanced">No significant shunt</span>`;
    if (ratio >= 0.7) return `<span class="calc-badge shunt-rl">Small R→L shunt</span>`;
    return `<span class="calc-badge severe">Large R→L shunt</span>`;
}

function regurgToLmin(val, units, hr) {
    if (isNaN(val)) return NaN;
    if (units === 'mlbeat') {
        if (isNaN(hr) || hr <= 0) return NaN; // can't convert without HR
        return (val * hr) / 1000.0; // (mL/beat * beat/min) / 1000 = L/min
    }
    return val; // already L/min
}

function fmtFlowWithBeat(flowLmin, hr) {
    if (isNaN(flowLmin)) return '—';
    const parts = [`${flowLmin.toFixed(2)} L/min`];
    if (!isNaN(hr) && hr > 0) parts.push(`${(flowLmin * 1000 / hr).toFixed(0)} mL/beat`);
    return parts.join(' · ');
}

/**
 * Format a vessel result cell.
 * Resolves net from netP (primary) or fwdP-bwdP (secondary).
 * Returns { netMid, html }
 */
function resolveVesselFlow(netInputId, fwdInputId, bwdInputId, hr, bsa) {
    const netP = parseFlowVal(netInputId);
    const fwdP = parseFlowVal(fwdInputId);
    const bwdP = parseFlowVal(bwdInputId);

    // Determine net flow
    let netMid = NaN;
    let autoNet = false; // true if computed from fwd-bwd rather than entered directly
    let rfHtml = '';

    if (!isNaN(netP.mid)) {
        netMid = netP.mid;
        // RF from fwd/bwd if both present
        if (!isNaN(fwdP.mid) && !isNaN(bwdP.mid) && fwdP.mid > 0) {
            rfHtml = rfBadge(bwdP.mid / fwdP.mid * 100);
        } else if (!isNaN(fwdP.mid) && isNaN(bwdP.mid)) {
            // fwd only, no bwd → RF ~ 0    
        }
    } else if (!isNaN(fwdP.mid)) {
        // No net entered — compute from fwd/bwd
        const bwdMid = isNaN(bwdP.mid) ? 0 : bwdP.mid;
        netMid = fwdP.mid - bwdMid;
        autoNet = true;
        if (bwdMid > 0 && fwdP.mid > 0) {
            rfHtml = rfBadge(bwdMid / fwdP.mid * 100);
        }
    }

    if (isNaN(netMid)) return { netMid: NaN, html: '<span class="flow-empty">—</span>' };

    // Build display string
    const parts = [`${netMid.toFixed(2)} L/min`];
    if (!isNaN(hr) && hr > 0) parts.push(`${(netMid * 1000 / hr).toFixed(0)} ml/beat`);
    if (!isNaN(bsa) && bsa > 0) parts.push(`${(netMid / bsa).toFixed(2)} L/min/m²`);

    let html = `<span class="flow-net-val">${autoNet ? '<small>(auto)</small> ' : ''}${parts.join(' <span class="flow-sep">·</span> ')}</span>`;
    if (rfHtml) html += ` ${rfHtml}`;

    return { netMid, html };
}

/* ============================================================
   ECV CALCULATOR
   ============================================================ */
let ecvState = {};

function initECVCalc() {
    const ids = ['ecv-t1pre-myo', 'ecv-t1post-myo', 'ecv-t1pre-blood', 'ecv-t1post-blood', 'ecv-hct'];
    if (!ids.every(id => el(id))) return;
    ids.forEach(id => el(id).addEventListener('input', calcECV));
}

function calcECV() {
    const t1PreMyo = fVal('ecv-t1pre-myo');
    const t1PostMyo = fVal('ecv-t1post-myo');
    const t1PreBlood = fVal('ecv-t1pre-blood');
    const t1PostBlood = fVal('ecv-t1post-blood');
    const hct = fVal('ecv-hct');
    const result = el('ecv-result');

    if ([t1PreMyo, t1PostMyo, t1PreBlood, t1PostBlood, hct].some(isNaN)) {
        result.innerHTML = '<p class="calc-placeholder">Enter all T1 values and hematocrit to calculate ECV.</p>';
        ecvState = {};
        return;
    }
    if (hct <= 0 || hct >= 100) {
        result.innerHTML = '<p class="calc-error">⚠ Hematocrit must be between 1–99%.</p>';
        ecvState = {};
        return;
    }
    if (t1PostMyo >= t1PreMyo || t1PostBlood >= t1PreBlood) {
        result.innerHTML = '<p class="calc-error">⚠ Post-contrast T1 must be shorter than pre-contrast T1.</p>';
        ecvState = {};
        return;
    }

    const dR1Myo = (1 / t1PostMyo) - (1 / t1PreMyo);
    const dR1Blood = (1 / t1PostBlood) - (1 / t1PreBlood);
    const lambda = dR1Myo / dR1Blood;
    const ecv = (1 - hct / 100) * lambda * 100;

    let cls, label, notes;
    if (ecv < 30) { cls = 'normal'; label = 'Normal'; notes = 'ECV &lt;30% — normal extracellular matrix'; }
    else if (ecv <= 32) { cls = 'borderline'; label = 'Borderline'; notes = 'ECV 30–32% — borderline; correlate with clinical context'; }
    else if (ecv <= 40) { cls = 'abnormal'; label = 'Elevated'; notes = 'ECV 32–40% — elevated; consistent with diffuse fibrosis or edema'; }
    else { cls = 'severe'; label = 'Markedly Elevated'; notes = 'ECV &gt;40% — markedly elevated; consider amyloid or severe fibrosis'; }

    ecvState = { t1PreMyo, t1PostMyo, t1PreBlood, t1PostBlood, hct, lambda, ecv, label };

    result.innerHTML = `
    <div class="calc-result-main">
      <span class="calc-value">${ecv.toFixed(1)}%</span>
      <span class="calc-badge ${cls}">${label}</span>
      <button class="copy-report-btn" onclick="copyECVResult()" title="Copy to clipboard">📋 Copy</button>
    </div>
    <p class="calc-notes">${notes}</p>
    <div class="calc-details">
      <span>λ (partition coeff.): ${lambda.toFixed(3)}</span>
      <span>ΔR1 myo: ${(dR1Myo * 1000).toFixed(4)} s⁻¹</span>
      <span>ΔR1 blood: ${(dR1Blood * 1000).toFixed(4)} s⁻¹</span>
      <span>1 – Hct: ${(1 - hct / 100).toFixed(3)}</span>
    </div>`;
}

function copyECVResult() {
    if (ecvState.ecv === undefined) return;
    const { t1PreMyo, t1PostMyo, t1PreBlood, t1PostBlood, hct, lambda, ecv, label } = ecvState;
    const txt = ecvState.copyTxt || [
        `T1 Mapping / ECV:`,
        `  Hematocrit: ${hct}%`,
        `  T1 Pre (myocardium) = ${t1PreMyo} ms`,
        `  ECV: ${ecv.toFixed(1)}% (${label})`,
    ].join('\n');

    const showCopied = () => {
        const btn = document.querySelector('.copy-report-btn');
        if (btn) {
            const orig = btn.innerHTML;
            btn.innerHTML = '✓ Copied!';
            btn.classList.add('copied');
            setTimeout(() => { btn.innerHTML = orig; btn.classList.remove('copied'); }, 2000);
        }
    };

    if (navigator.clipboard) {
        navigator.clipboard.writeText(txt).then(showCopied);
    } else {
        const ta = document.createElement('textarea');
        ta.value = txt;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showCopied();
    }
}

/* ============================================================
   4D FLOW CALCULATOR
   ============================================================ */
function init4DFlowCalc() {
    // Tab switching
    document.querySelectorAll('.flow-tab-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.flow-tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.flow-tab-content').forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            const tab = el('flow-tab-' + this.dataset.tab);
            if (tab) tab.classList.add('active');
        });
    });

    // BSA auto-compute
    ['patient-height', 'patient-weight'].forEach(id => {
        const e = el(id);
        if (e) e.addEventListener('input', updateBSADisplay);
    });

    // Use event delegation on input events for flow calculator
    const stdTab = el('flow-tab-standard');
    if (stdTab) {
        stdTab.addEventListener('input', function (e) {
            if (e.target.classList.contains('flow-input')) {
                calcStandardFlow();
            }
        });
    }

    const fontanTab = el('flow-tab-fontan');
    if (fontanTab) {
        fontanTab.addEventListener('input', function (e) {
            if (e.target.classList.contains('fontan-input')) {
                calcFontanFlow();
            }
        });
    }

    // Also listen for HR changes which affect both
    const hrEl = el('flow-hr');
    if (hrEl) {
        hrEl.addEventListener('input', function () {
            const hr = fVal('flow-hr');
            if (!isNaN(hr) && (hr < 20 || hr > 300)) {
                hrEl.classList.add('input-warning');
            } else {
                hrEl.classList.remove('input-warning');
            }
            updateFontanDisplays();
            calcStandardFlow();
            calcFontanFlow();
        });
    }
    ['std-regurg-units', 'fon-regurg-units'].forEach(id => {
        const e = el(id);
        if (e) e.addEventListener('change', () => { calcStandardFlow(); calcFontanFlow(); });
    });
}

// Update display values in Fontan tab from shared inputs
function updateFontanDisplays() {
    const bsa = computeBSA();
    const hr = fVal('flow-hr');

    const bsaDisplay = el('bsa-display-fontan');
    const hrDisplay = el('hr-display-fontan');

    if (bsaDisplay) bsaDisplay.textContent = isNaN(bsa) ? '—' : `${bsa.toFixed(2)} m²`;
    if (hrDisplay) hrDisplay.textContent = isNaN(hr) ? '—' : `${hr.toFixed(0)} bpm`;
}

function updateBSADisplay() {
    const bsa = computeBSA();
    const d = el('bsa-display');
    if (d) d.textContent = isNaN(bsa) ? '—' : `${bsa.toFixed(2)} m²`;
    updateFontanDisplays(); // Add this line
    calcStandardFlow();
    calcFontanFlow();
}

function calcStandardFlow() {
    const hr = fVal('flow-hr');
    const bsa = computeBSA();

    // Main flows (these are NET flows)
    const aoNet = parseFlowVal('std-ao-net');
    const paNet = parseFlowVal('std-pa-net');
    const lpaNet = parseFlowVal('std-lpa-net');
    const rpaNet = parseFlowVal('std-rpa-net');

    // Regurgitant volumes (optional)
    const regUnits = el('std-regurg-units') ? el('std-regurg-units').value : 'mlbeat';

    const arIn = fVal('std-ar-vol');
    const prIn = fVal('std-pr-vol');
    let mrIn = fVal('std-mr-vol');
    let trIn = fVal('std-tr-vol');

    // Support LVSV/RVSV calculation
    const lvsv = fVal('std-lvsv');
    const rvsv = fVal('std-rvsv');

    const arFlow = regurgToLmin(arIn, regUnits, hr);
    const prFlow = regurgToLmin(prIn, regUnits, hr);

    // Calculate forward flows from net + regurgitant volumes
    const aoForward = (!isNaN(aoNet.mid)) ? aoNet.mid + (!isNaN(arFlow) ? arFlow : 0) : NaN;
    const paForward = (!isNaN(paNet.mid)) ? paNet.mid + (!isNaN(prFlow) ? prFlow : 0) : NaN;

    // Calculate MR from LVSV - AVFF if LVSV provided and MR not directly entered
    if (!isNaN(lvsv) && isNaN(mrIn) && !isNaN(aoForward) && aoForward > 0 && !isNaN(hr) && hr > 0) {
        // Convert aoForward (L/min) to mL/beat for comparison with LVSV
        const aoForwardMlBeat = (aoForward * 1000) / hr;
        mrIn = lvsv - aoForwardMlBeat;  // in mL/beat
        if (mrIn < 0) mrIn = 0;
    }

    // Calculate TR from RVSV - PVFF if RVSV provided and TR not directly entered
    if (!isNaN(rvsv) && isNaN(trIn) && !isNaN(paForward) && paForward > 0 && !isNaN(hr) && hr > 0) {
        // Convert paForward (L/min) to mL/beat for comparison with RVSV
        const paForwardMlBeat = (paForward * 1000) / hr;
        trIn = rvsv - paForwardMlBeat;  // in mL/beat
        if (trIn < 0) trIn = 0;
    }

    // Convert MR and TR - auto-calculated values are ALWAYS in mL/beat
    const mrFlow = !isNaN(mrIn) ? regurgToLmin(mrIn, 'mlbeat', hr) : NaN;
    const trFlow = !isNaN(trIn) ? regurgToLmin(trIn, 'mlbeat', hr) : NaN;

    const resultEl = el('flow-std-result');
    if (!resultEl) return;

    // Check if any inputs filled
    const anyFilled = !isNaN(aoNet.mid) || !isNaN(paNet.mid) || !isNaN(lpaNet.mid) || !isNaN(rpaNet.mid);
    if (!anyFilled) {
        resultEl.innerHTML = '<p class="calc-placeholder">Enter vessel flows to compute results.</p>';
        return;
    }

    // Qp and Qs (using NET flows for shunt calculation)
    const qp = !isNaN(paNet.mid) ? paNet.mid : (!isNaN(lpaNet.mid) && !isNaN(rpaNet.mid) ? lpaNet.mid + rpaNet.mid : NaN);
    const qs = !isNaN(aoNet.mid) ? aoNet.mid : NaN;

    // Build report text
    let reportLines = [];
    reportLines.push('4D Flow Analysis:');
    reportLines.push('');

    // HTML output
    let html = '<div class="flow-results-wrapper">';
    html += '<div class="flow-results-header">';
    html += '<h3>Results</h3>';
    html += '<button class="copy-flow-btn" onclick="copyStandardFlowReport()">📋 Copy to Report</button>';
    html += '</div>';
    html += '<div class="flow-results-grid">';

    // Aortic Flow
    if (!isNaN(qs)) {
        const qsIndexed = !isNaN(bsa) && bsa > 0 ? (qs / bsa).toFixed(2) : null;
        html += `<div class="flow-result-line">
            <span class="flow-result-label">Ao Flow</span>
            <span class="flow-result-value">${qs.toFixed(2)} L/min${qsIndexed ? `, ${qsIndexed} L/min/m²` : ''}</span>
            <span class="flow-result-badge"></span>
        </div>`;
        reportLines.push(`Ao Flow: ${qs.toFixed(2)} L/min${qsIndexed ? `, ${qsIndexed} L/min/m²` : ''}`);
    }

    // PA Flow
    if (!isNaN(qp)) {
        const qpIndexed = !isNaN(bsa) && bsa > 0 ? (qp / bsa).toFixed(2) : null;
        const qpSource = !isNaN(paNet.mid) ? 'MPA' : 'LPA+RPA';
        html += `<div class="flow-result-line">
            <span class="flow-result-label">PA Flow (${qpSource})</span>
            <span class="flow-result-value">${qp.toFixed(2)} L/min${qpIndexed ? `, ${qpIndexed} L/min/m²` : ''}</span>
            <span class="flow-result-badge"></span>
        </div>`;
        reportLines.push(`PA Flow: ${qp.toFixed(2)} L/min${qpIndexed ? `, ${qpIndexed} L/min/m²` : ''}`);
    }

    // LPA/RPA Split
    if (!isNaN(lpaNet.mid) && !isNaN(rpaNet.mid)) {
        const total = lpaNet.mid + rpaNet.mid;
        if (total > 0) {
            const lPct = (lpaNet.mid / total * 100).toFixed(0);
            const rPct = (rpaNet.mid / total * 100).toFixed(0);
            const asymmetric = Math.abs(lpaNet.mid / total - 0.55) > 0.10;
            html += `<div class="flow-result-line ${asymmetric ? 'highlight' : ''}">
                <span class="flow-result-label">RPA/LPA Split</span>
                <span class="flow-result-value">${rPct}% / ${lPct}%</span>
                <span class="flow-result-badge">${asymmetric ? '<span class="calc-badge moderate">Asymmetric</span>' : ''}</span>
            </div>`;
            reportLines.push(`RPA/LPA Split: ${rPct}%/${lPct}%${asymmetric ? ' (asymmetric)' : ''}`);
        }
    }

    // Qp:Qs
    if (!isNaN(qp) && !isNaN(qs) && qs > 0) {
        const ratio = qp / qs;
        let shuntType = '';
        if (ratio > 1.1) shuntType = 'L→R shunt';
        else if (ratio < 0.9) shuntType = 'R→L shunt';
        else shuntType = 'No shunt';

        html += `<div class="flow-result-line highlight">
            <span class="flow-result-label">Qp:Qs</span>
            <span class="flow-result-value">${ratio.toFixed(2)}</span>
            <span class="flow-result-badge">${qpqsBadge(ratio)}</span>
        </div>`;
        reportLines.push(`Qp:Qs: ${ratio.toFixed(2)} (${shuntType})`);
    }

    // Regurgitation section
    let regurgItems = [];

    // Aortic Regurgitation
    if (!isNaN(arIn) && arIn > 0 && !isNaN(aoForward) && aoForward > 0) {
        const arRf = arFlow / aoForward * 100;
        const arCls = arRf < 20 ? 'mild' : arRf < 40 ? 'moderate' : 'severe';
        const highlight = arRf >= 40 ? 'highlight' : '';
        regurgItems.push({
            label: 'Aortic Regurgitation',
            value: fmtFlowWithBeat(arFlow, hr),
            rf: arRf,
            cls: arCls,
            highlight: highlight,
            reportText: `  Aortic: ${fmtFlowWithBeat(arFlow, hr)}, regurgitant fraction ${arRf.toFixed(0)}%`
        });
    }

    // Mitral Regurgitation
    if (!isNaN(mrIn) && mrIn > 0 && !isNaN(aoNet.mid) && aoNet.mid > 0) {
        const mrRf = mrFlow / (aoNet.mid+mrFlow) * 100;
        const mrCls = mrRf < 20 ? 'mild' : mrRf < 40 ? 'moderate' : 'severe';
        const highlight = mrRf >= 40 ? 'highlight' : '';
        regurgItems.push({
            label: 'Mitral Regurgitation',
            value: fmtFlowWithBeat(mrFlow, hr),
            rf: mrRf,
            cls: mrCls,
            highlight: highlight,
            reportText: `  Mitral: ${fmtFlowWithBeat(mrFlow, hr)}, regurgitant fraction ${mrRf.toFixed(0)}%`
        });
    }

    // Pulmonary Regurgitation
    if (!isNaN(prIn) && prIn > 0 && !isNaN(paForward) && paForward > 0) {
        const prRf = prFlow / paForward * 100;
        const prCls = prRf < 20 ? 'mild' : prRf < 40 ? 'moderate' : 'severe';
        const highlight = prRf >= 40 ? 'highlight' : '';
        regurgItems.push({
            label: 'Pulmonary Regurgitation',
            value: fmtFlowWithBeat(prFlow, hr),
            rf: prRf,
            cls: prCls,
            highlight: highlight,
            reportText: `  Pulmonary: ${fmtFlowWithBeat(prFlow, hr)}, regurgitant fraction ${prRf.toFixed(0)}%`
        });
    }

    // Tricuspid Regurgitation - graded by absolute volume (mL/beat)
    if (!isNaN(trIn) && trIn > 0) {
        // trFlow is already converted to L/min via regurgToLmin(trIn, 'mlbeat', hr)
        // Convert back to mL/beat for grading
        let trVolMlBeat = !isNaN(hr) && hr > 0 ? (trFlow * 1000 / hr) : NaN;
        
        if (!isNaN(trVolMlBeat)) {
            let trCls, trGrade;
            if (trVolMlBeat < 30) {
                trCls = 'mild';
                trGrade = 'Mild';
            } else if (trVolMlBeat < 45) {
                trCls = 'moderate';
                trGrade = 'Moderate';
            } else {
                trCls = 'severe';
                trGrade = 'Severe';
            }
            
            let rfText = '';
            let trRf = NaN;
            if (!isNaN(paNet.mid) && paNet.mid > 0) {
                trRf = trFlow / (paNet.mid+trFlow) * 100;
                rfText = `, RF ${trRf.toFixed(0)}%`;
            }
            
            const highlight = trCls === 'severe' ? 'highlight' : '';
            regurgItems.push({
                label: 'Tricuspid Regurgitation',
                value: `${trVolMlBeat.toFixed(1)} mL/beat`,
                rf: trRf,
                cls: trCls,
                grade: trGrade,
                highlight: highlight,
                rfText: rfText,
                reportText: `  Tricuspid: ${trVolMlBeat.toFixed(1)} mL/beat (${trGrade})${rfText}`
            });
        }
    }

    // Build regurgitation grid HTML
    let regurgLines = [];
    if (regurgItems.length > 0) {
        html += '<div class="regurg-results-grid">';
        
        // Define the order: AR, MR, PR, TR
        const regurgOrder = ['Aortic Regurgitation', 'Mitral Regurgitation', 
                            'Pulmonary Regurgitation', 'Tricuspid Regurgitation'];
        
        regurgOrder.forEach(regurgName => {
            const item = regurgItems.find(r => r.label === regurgName);
            

            if (item) {
                const badgeLabel = item.grade || item.cls.charAt(0).toUpperCase() + item.cls.slice(1);
                html += `<div class="regurg-result-item ${item.highlight}">
                    <span class="regurg-result-label">${item.label}</span>
                    <div>
                        <span class="regurg-result-value">${item.value}</span>
                        ${!isNaN(item.rf) && item.label !== 'Tricuspid Regurgitation' ? 
                            `<span class="regurg-result-value">RF ${item.rf.toFixed(0)}%</span>` : 
                            item.rfText ? `<span class="regurg-result-value">${item.rfText.replace(', ', '')}</span>` : ''
                        }
                    </div>
                    <span class="regurg-result-badge">
                        <span class="calc-badge ${item.cls}">${badgeLabel}</span>
                    </span>
                </div>`;
                regurgLines.push(item.reportText);
            } else {
                // Empty slot
                html += `<div class="regurg-result-item empty">
                    <span class="regurg-result-label">${regurgName}</span>
                    <span class="regurg-result-value">—</span>
                </div>`;
            }
        });
        
        html += '</div>';
    }

    // Add regurgitation to report
    if (regurgLines.length > 0) {
        reportLines.push('');
        reportLines.push('Regurgitation:');
        reportLines.push(...regurgLines);
    }
    html += '</div></div>';
    resultEl.innerHTML = html;

    // Store report text for copying
    window.standardFlowReport = reportLines.join('\n');
}

function copyStandardFlowReport() {
    const txt = window.standardFlowReport || '';
    if (!txt) return;

    const btn = document.querySelector('.copy-flow-btn');
    const showCopied = () => {
        if (btn) {
            const orig = btn.innerHTML;
            btn.innerHTML = '✓ Copied!';
            btn.classList.add('copied');
            setTimeout(() => { btn.innerHTML = orig; btn.classList.remove('copied'); }, 2000);
        }
    };

    if (navigator.clipboard) {
        navigator.clipboard.writeText(txt).then(showCopied);
    } else {
        const ta = document.createElement('textarea');
        ta.value = txt;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showCopied();
    }
}

function calcFontanFlow() {
    const hr = fVal('flow-hr');
    const bsa = computeBSA();

    // Main systemic/pulmonary flows (NET)
    const aoNet = parseFlowVal('fon-ao-net');
    const glennNet = parseFlowVal('fon-glenn-net');
    const fontanNet = parseFlowVal('fon-fontan-net');
    const paNet = parseFlowVal('fon-pa-net');
    const lpaNet = parseFlowVal('fon-lpa-net');
    const rpaNet = parseFlowVal('fon-rpa-net');

    // Pulmonary veins (optional, for collateral calcs)
    const lpvNet = parseFlowVal('fon-lpv-net');
    const rpvNet = parseFlowVal('fon-rpv-net');

    // Regurgitations
    const regUnits = el('fon-regurg-units') ? el('fon-regurg-units').value : 'mlbeat';

    const arIn = fVal('fon-ar-vol');
    const prIn = fVal('fon-pr-vol');
    let mrIn = fVal('fon-mr-vol');
    let trIn = fVal('fon-tr-vol');

    // Support LVSV/RVSV calculation
    const lvsv = fVal('fon-lvsv');
    const rvsv = fVal('fon-rvsv');

    const arFlow = regurgToLmin(arIn, regUnits, hr);
    const prFlow = regurgToLmin(prIn, regUnits, hr);
    
    // Calculate forward flows from net + regurgitant volumes
    const aoForward = (!isNaN(aoNet.mid)) ? aoNet.mid + (!isNaN(arFlow) ? arFlow : 0) : NaN;
    const paForward = (!isNaN(paNet.mid)) ? paNet.mid + (!isNaN(prFlow) ? prFlow : 0) : NaN;

    // Calculate MR from LVSV - AVFF if LVSV provided and MR not directly entered
    if (!isNaN(lvsv) && isNaN(mrIn) && !isNaN(aoForward) && aoForward > 0 && !isNaN(hr) && hr > 0) {
        // Convert aoForward (L/min) to mL/beat for comparison with LVSV
        const aoForwardMlBeat = (aoForward * 1000) / hr;
        mrIn = lvsv - aoForwardMlBeat;  // in mL/beat
        if (mrIn < 0) mrIn = 0;
    }

    // Calculate TR from RVSV - PVFF if RVSV provided and TR not directly entered
    if (!isNaN(rvsv) && isNaN(trIn) && !isNaN(paForward) && paForward > 0 && !isNaN(hr) && hr > 0) {
        // Convert paForward (L/min) to mL/beat for comparison with RVSV
        const paForwardMlBeat = (paForward * 1000) / hr;
        trIn = rvsv - paForwardMlBeat;  // in mL/beat
        if (trIn < 0) trIn = 0;
    }

    // Convert MR and TR - auto-calculated values are ALWAYS in mL/beat
    const mrFlow = !isNaN(mrIn) ? regurgToLmin(mrIn, 'mlbeat', hr) : NaN;
    const trFlow = !isNaN(trIn) ? regurgToLmin(trIn, 'mlbeat', hr) : NaN;

    const resultEl = el('flow-fontan-result');
    if (!resultEl) return;

    // Check if any inputs filled
    const anyFilled = !isNaN(aoNet.mid) || !isNaN(glennNet.mid) || !isNaN(fontanNet.mid) ||
        !isNaN(paNet.mid) || !isNaN(lpaNet.mid) || !isNaN(rpaNet.mid);
    if (!anyFilled) {
        resultEl.innerHTML = '<p class="calc-placeholder">Enter Fontan circuit flows to compute results.</p>';
        return;
    }

    // Calculate totals
    const glennOk = !isNaN(glennNet.mid) && glennNet.mid > 0;
    const fontanOk = !isNaN(fontanNet.mid) && fontanNet.mid > 0;
    const totalFontanFlow = [glennNet.mid, fontanNet.mid].filter(v => !isNaN(v)).reduce((a, b) => a + b, 0) || NaN;
    const qp = (!isNaN(lpaNet.mid) && !isNaN(rpaNet.mid)) ? lpaNet.mid + rpaNet.mid : (!isNaN(paNet.mid) ? paNet.mid : NaN);
    const qs = !isNaN(aoNet.mid) ? aoNet.mid : NaN;

    // Build report text
    let reportLines = [];
    reportLines.push('4D Flow Analysis (Fontan):');
    reportLines.push('');

    // HTML output
    let html = '<div class="flow-results-wrapper">';
    html += '<div class="flow-results-header">';
    html += '<h3>Fontan Results</h3>';
    html += '<button class="copy-flow-btn" onclick="copyFontanFlowReport()">📋 Copy to Report</button>';
    html += '</div>';
    html += '<div class="flow-results-grid">';

    // Aortic Flow
    if (!isNaN(qs)) {
        const qsIndexed = !isNaN(bsa) && bsa > 0 ? (qs / bsa).toFixed(2) : null;
        const ciCls = qsIndexed && parseFloat(qsIndexed) < 2.2 ? 'abnormal' : qsIndexed && parseFloat(qsIndexed) > 4.0 ? 'moderate' : 'normal';
        html += `<div class="flow-result-line">
            <span class="flow-result-label">Ao Flow</span>
            <span class="flow-result-value">${qs.toFixed(2)} L/min${qsIndexed ? `, ${qsIndexed} L/min/m²` : ''}</span>
        </div>`;
        reportLines.push(`Ao Flow: ${qs.toFixed(2)} L/min${qsIndexed ? `, ${qsIndexed} L/min/m²` : ''}`);
    }

    // PA Flow
    if (!isNaN(qp)) {
        const qpIndexed = !isNaN(bsa) && bsa > 0 ? (qp / bsa).toFixed(2) : null;
        html += `<div class="flow-result-line">
            <span class="flow-result-label">PA Flow</span>
            <span class="flow-result-value">${qp.toFixed(2)} L/min${qpIndexed ? `, ${qpIndexed} L/min/m²` : ''}</span>
            <span class="flow-result-badge"></span>
        </div>`;
        reportLines.push(`PA Flow: ${qp.toFixed(2)} L/min${qpIndexed ? `, ${qpIndexed} L/min/m²` : ''}`);
    }

    // Qp:Qs
    if (!isNaN(qp) && !isNaN(qs) && qs > 0) {
        const ratio = qp / qs;
        let shuntType = '';
        if (ratio > 1.1) shuntType = 'L→R shunt';
        else if (ratio < 0.9) shuntType = 'R→L shunt';
        else shuntType = 'No shunt';

        html += `<div class="flow-result-line highlight">
            <span class="flow-result-label">Qp:Qs</span>
            <span class="flow-result-value">${ratio.toFixed(2)}</span>
            <span class="flow-result-badge">${qpqsBadge(ratio)}</span>
        </div>`;
        reportLines.push(`Qp:Qs: ${ratio.toFixed(2)} (${shuntType})`);
    }

    // RPA/LPA Split
    if (!isNaN(lpaNet.mid) && !isNaN(rpaNet.mid) && qp > 0) {
        const lPct = (lpaNet.mid / qp * 100).toFixed(0);
        const rPct = (rpaNet.mid / qp * 100).toFixed(0);
        const asymmetric = Math.abs(lpaNet.mid / qp - 0.5) > 0.15;
        html += `<div class="flow-result-line">
            <span class="flow-result-label">RPA Flow</span>
            <span class="flow-result-value">${rpaNet.mid.toFixed(2)} L/min</span>
            <span class="flow-result-badge"></span>
        </div>`;
        html += `<div class="flow-result-line">
            <span class="flow-result-label">LPA Flow</span>
            <span class="flow-result-value">${lpaNet.mid.toFixed(2)} L/min</span>
            <span class="flow-result-badge"></span>
        </div>`;
        html += `<div class="flow-result-line ${asymmetric ? 'highlight' : ''}">
            <span class="flow-result-label">RPA/LPA Split</span>
            <span class="flow-result-value">${rPct}% / ${lPct}%</span>
            <span class="flow-result-badge">${asymmetric ? '<span class="calc-badge moderate">Asymmetric</span>' : ''}</span>
        </div>`;
        reportLines.push('');
        reportLines.push(`RPA Flow: ${rpaNet.mid.toFixed(2)} L/min`);
        reportLines.push(`LPA Flow: ${lpaNet.mid.toFixed(2)} L/min`);
        reportLines.push(`RPA/LPA Split: ${rPct}%/${lPct}%${asymmetric ? ' (asymmetric)' : ''}`);
    }

    // Pulmonary Veins
    if (!isNaN(lpvNet.mid) && !isNaN(rpvNet.mid)) {
        const totalPvFlow = lpvNet.mid + rpvNet.mid;
        const lPvPct = (lpvNet.mid / totalPvFlow * 100).toFixed(0);
        const rPvPct = (rpvNet.mid / totalPvFlow * 100).toFixed(0);
        html += `<div class="flow-result-line">
            <span class="flow-result-label">RPV Flow</span>
            <span class="flow-result-value">${rpvNet.mid.toFixed(2)} L/min</span>
            <span class="flow-result-badge"></span>
        </div>`;
        html += `<div class="flow-result-line">
            <span class="flow-result-label">LPV Flow</span>
            <span class="flow-result-value">${lpvNet.mid.toFixed(2)} L/min</span>
            <span class="flow-result-badge"></span>
        </div>`;
        html += `<div class="flow-result-line">
            <span class="flow-result-label">RPV/LPV Split</span>
            <span class="flow-result-value">${rPvPct}% / ${lPvPct}%</span>
            <span class="flow-result-badge"></span>
        </div>`;
        reportLines.push('');
        reportLines.push(`RPV Flow: ${rpvNet.mid.toFixed(2)} L/min`);
        reportLines.push(`LPV Flow: ${lpvNet.mid.toFixed(2)} L/min`);
        reportLines.push(`RPV/LPV Split: ${rPvPct}%/${lPvPct}%`);
    }

    // Glenn Flow
    if (glennOk) {
        const glennIndexed = !isNaN(bsa) && bsa > 0 ? (glennNet.mid / bsa).toFixed(2) : null;
        html += `<div class="flow-result-line">
            <span class="flow-result-label">Glenn Flow</span>
            <span class="flow-result-value">${glennNet.mid.toFixed(2)} L/min${glennIndexed ? `, ${glennIndexed} L/min/m²` : ''}</span>
            <span class="flow-result-badge"></span>
        </div>`;
        reportLines.push('');
        reportLines.push(`Glenn Flow: ${glennNet.mid.toFixed(2)} L/min${glennIndexed ? `, ${glennIndexed} L/min/m²` : ''}`);
    }

    // Fontan Flow
    if (fontanOk) {
        const fontanIndexed = !isNaN(bsa) && bsa > 0 ? (fontanNet.mid / bsa).toFixed(2) : null;
        html += `<div class="flow-result-line">
            <span class="flow-result-label">Fontan Flow</span>
            <span class="flow-result-value">${fontanNet.mid.toFixed(2)} L/min${fontanIndexed ? `, ${fontanIndexed} L/min/m²` : ''}</span>
            <span class="flow-result-badge"></span>
        </div>`;
        reportLines.push(`Fontan Flow: ${fontanNet.mid.toFixed(2)} L/min${fontanIndexed ? `, ${fontanIndexed} L/min/m²` : ''}`);
    }

    // Total Caval Flow
    if (!isNaN(totalFontanFlow)) {
        const totalIndexed = !isNaN(bsa) && bsa > 0 ? (totalFontanFlow / bsa).toFixed(2) : null;
        html += `<div class="flow-result-line highlight">
            <span class="flow-result-label">Total Caval Flow</span>
            <span class="flow-result-value">${totalFontanFlow.toFixed(2)} L/min${totalIndexed ? `, ${totalIndexed} L/min/m²` : ''}</span>
            <span class="flow-result-badge"></span>
        </div>`;
        reportLines.push(`Total Caval Flow: ${totalFontanFlow.toFixed(2)} L/min${totalIndexed ? `, ${totalIndexed} L/min/m²` : ''}`);
    }

    // Fontan Inflow Distribution
    if (glennOk && fontanOk) {
        const totalIn = glennNet.mid + fontanNet.mid;
        const glennPct = (glennNet.mid / totalIn * 100).toFixed(0);
        const fontanPct = (fontanNet.mid / totalIn * 100).toFixed(0);
        html += `<div class="flow-result-line">
            <span class="flow-result-label">Inflow Distribution</span>
            <span class="flow-result-value">Glenn ${glennPct}% / Fontan ${fontanPct}%</span>
            <span class="flow-result-badge"></span>
        </div>`;
    }

    // Fontan-to-Pulmonary match
    if (!isNaN(totalFontanFlow) && !isNaN(qp) && qp > 0) {
        const match = totalFontanFlow / qp;
        let matchCls = 'abnormal';
        let matchNote = '';
        if (match > 0.95) { matchCls = 'normal'; matchNote = 'Good match'; }
        else if (match > 0.85) { matchCls = 'mild'; matchNote = 'Acceptable'; }
        else { matchCls = 'severe'; matchNote = 'Underfilled PAs'; }

        html += `<div class="flow-result-line highlight">
            <span class="flow-result-label">Fontan-to-Pulm Ratio</span>
            <span class="flow-result-value">${match.toFixed(2)}</span>
            <span class="flow-result-badge"><span class="calc-badge ${matchCls}">${matchNote}</span></span>
        </div>`;
    }

    // Pulmonary Collateral Flow
    let pulCollateral = NaN;
    if (!isNaN(lpvNet.mid) && !isNaN(rpvNet.mid) && !isNaN(qp)) {
        const totalPvFlow = lpvNet.mid + rpvNet.mid;
        pulCollateral = totalPvFlow - qp;
        const collPct = totalPvFlow > 0 ? (pulCollateral / totalPvFlow * 100).toFixed(0) : NaN;
        const severe = pulCollateral > qp * 0.2;
        html += `<div class="flow-result-line ${severe ? 'highlight' : ''}">
            <span class="flow-result-label">Pulmonary Collateral</span>
            <span class="flow-result-value">${pulCollateral.toFixed(2)} L/min${!isNaN(collPct) ? ` (${collPct}%)` : ''}</span>
            <span class="flow-result-badge">${severe ? '<span class="calc-badge moderate">Significant</span>' : ''}</span>
        </div>`;
        reportLines.push(`Pulmonary Collateral Flow: ${pulCollateral.toFixed(2)} L/min${!isNaN(collPct) ? ` (${collPct}% of PV return)` : ''}`);
    }

    // Systemic Collateral Flow (already defined earlier, but storing in variable)
    let systCollateral = NaN;
    if (!isNaN(aoForward) && !isNaN(totalFontanFlow)) {
        systCollateral = aoForward - totalFontanFlow;
        if (systCollateral > 0) {
            const collPct = aoForward > 0 ? (systCollateral / aoForward * 100).toFixed(0) : NaN;
            const significant = systCollateral > aoForward * 0.15;
            html += `<div class="flow-result-line ${significant ? 'highlight' : ''}">
                <span class="flow-result-label">Systemic Collateral</span>
                <span class="flow-result-value">${systCollateral.toFixed(2)} L/min${!isNaN(collPct) ? ` (${collPct}%)` : ''}</span>
                <span class="flow-result-badge">${significant ? '<span class="calc-badge moderate">Significant</span>' : ''}</span>
            </div>`;
            reportLines.push('');
            reportLines.push(`Systemic Collateral Flow: ${systCollateral.toFixed(2)} L/min${!isNaN(collPct) ? ` (${collPct}% of Ao forward)` : ''}`);
        }
    }

    // Averaged Collateral Flow (net collateral burden)
    if (!isNaN(pulCollateral) && !isNaN(systCollateral) && systCollateral > 0) {
        const avgCollateral = (Math.abs(pulCollateral) + systCollateral) / 2;
        const avgIndexed = !isNaN(bsa) && bsa > 0 ? (avgCollateral / bsa).toFixed(2) : null;

        // Assess severity based on indexed value or absolute
        let collCls = '';
        let collNote = '';
        if (avgIndexed) {
            if (parseFloat(avgIndexed) < 0.5) {
                collCls = 'normal';
                collNote = 'Minimal';
            } else if (parseFloat(avgIndexed) < 1.0) {
                collCls = 'mild';
                collNote = 'Mild';
            } else if (parseFloat(avgIndexed) < 1.5) {
                collCls = 'moderate';
                collNote = 'Moderate';
            } else {
                collCls = 'severe';
                collNote = 'Severe';
            }
        } else if (avgCollateral > 1.0) {
            collCls = 'moderate';
            collNote = 'Significant';
        }

        html += `<div class="flow-result-line ${collCls === 'severe' || collCls === 'moderate' ? 'highlight' : ''}">
            <span class="flow-result-label">Average Collateral</span>
            <span class="flow-result-value">${avgCollateral.toFixed(2)} L/min${avgIndexed ? `, ${avgIndexed} L/min/m²` : ''}</span>
            <span class="flow-result-badge">${collNote ? `<span class="calc-badge ${collCls}">${collNote}</span>` : ''}</span>
        </div>`;
        reportLines.push(`Average Collateral Flow: ${avgCollateral.toFixed(2)} L/min${avgIndexed ? `, ${avgIndexed} L/min/m²` : ''} (${collNote})`);
    }

    // Regurgitation section
    let regurgItems = [];

    // Aortic Regurgitation
    if (!isNaN(arIn) && arIn > 0 && !isNaN(aoForward) && aoForward > 0) {
        const arRf = arFlow / aoForward * 100;
        const arCls = arRf < 20 ? 'mild' : arRf < 40 ? 'moderate' : 'severe';
        const highlight = arRf >= 40 ? 'highlight' : '';
        regurgItems.push({
            label: 'Aortic Regurgitation',
            value: fmtFlowWithBeat(arFlow, hr),
            rf: arRf,
            cls: arCls,
            highlight: highlight,
            reportText: `  Aortic: ${fmtFlowWithBeat(arFlow, hr)}, regurgitant fraction ${arRf.toFixed(0)}%`
        });
    }

    // Mitral Regurgitation
    if (!isNaN(mrIn) && mrIn > 0 && !isNaN(aoNet.mid) && aoNet.mid > 0) {
        const mrRf = mrFlow / (aoNet.mid + mrFlow) * 100;
        const mrCls = mrRf < 20 ? 'mild' : mrRf < 40 ? 'moderate' : 'severe';
        const highlight = mrRf >= 40 ? 'highlight' : '';
        regurgItems.push({
            label: 'Mitral Regurgitation',
            value: fmtFlowWithBeat(mrFlow, hr),
            rf: mrRf,
            cls: mrCls,
            highlight: highlight,
            reportText: `  Mitral: ${fmtFlowWithBeat(mrFlow, hr)}, regurgitant fraction ${mrRf.toFixed(0)}%`
        });
    }

    // Pulmonary Regurgitation
    if (!isNaN(prIn) && prIn > 0 && !isNaN(qp) && qp > 0) {
        const prRf = prFlow / (qp + prFlow) * 100;
        const prCls = prRf < 20 ? 'mild' : prRf < 40 ? 'moderate' : 'severe';
        const highlight = prRf >= 40 ? 'highlight' : '';
        regurgItems.push({
            label: 'Pulmonary Regurgitation',
            value: fmtFlowWithBeat(prFlow, hr),
            rf: prRf,
            cls: prCls,
            highlight: highlight,
            reportText: `  Pulmonary: ${fmtFlowWithBeat(prFlow, hr)}, regurgitant fraction ${prRf.toFixed(0)}%`
        });
    }

    // Tricuspid Regurgitation - graded by absolute volume (mL/beat)
    if (!isNaN(trIn) && trIn > 0) {
        // trFlow is already converted to L/min via regurgToLmin(trIn, 'mlbeat', hr)
        // Convert back to mL/beat for grading
        let trVolMlBeat = !isNaN(hr) && hr > 0 ? (trFlow * 1000 / hr) : NaN;
        
        if (!isNaN(trVolMlBeat)) {
            let trCls, trGrade;
            if (trVolMlBeat < 30) {
                trCls = 'mild';
                trGrade = 'Mild';
            } else if (trVolMlBeat < 45) {
                trCls = 'moderate';
                trGrade = 'Moderate';
            } else {
                trCls = 'severe';
                trGrade = 'Severe';
            }
            
            let rfText = '';
            let trRf = NaN;
            if (!isNaN(paNet.mid) && paNet.mid > 0) {
                trRf = trFlow / (paNet.mid + trFlow) * 100;
                rfText = `, RF ${trRf.toFixed(0)}%`;
            }
            
            const highlight = trCls === 'severe' ? 'highlight' : '';
            regurgItems.push({
                label: 'Tricuspid Regurgitation',
                value: `${trVolMlBeat.toFixed(1)} mL/beat`,
                rf: trRf,
                cls: trCls,
                grade: trGrade,
                highlight: highlight,
                rfText: rfText,
                reportText: `  Tricuspid: ${trVolMlBeat.toFixed(1)} mL/beat (${trGrade})${rfText}`
            });
        }
    }

    // Build regurgitation grid HTML
    let regurgLines = [];
    if (regurgItems.length > 0) {
        html += '<div class="regurg-results-grid">';
        
        const regurgOrder = ['Aortic Regurgitation', 'Mitral Regurgitation', 
                            'Pulmonary Regurgitation', 'Tricuspid Regurgitation'];
        
        regurgOrder.forEach(regurgName => {
            const item = regurgItems.find(r => r.label === regurgName);

            if (item) {
                const badgeLabel = item.grade || item.cls.charAt(0).toUpperCase() + item.cls.slice(1);
                html += `<div class="regurg-result-item ${item.highlight}">
                    <span class="regurg-result-label">${item.label}</span>
                    <div>
                        <span class="regurg-result-value">${item.value}</span>
                        ${!isNaN(item.rf) && item.label !== 'Tricuspid Regurgitation' ? 
                            `<span class="regurg-result-value">RF ${item.rf.toFixed(0)}%</span>` : 
                            item.rfText ? `<span class="regurg-result-value">${item.rfText.replace(', ', '')}</span>` : ''
                        }
                    </div>
                    <span class="regurg-result-badge">
                        <span class="calc-badge ${item.cls}">${badgeLabel}</span>
                    </span>
                </div>`;
                regurgLines.push(item.reportText);
            } else {
                html += `<div class="regurg-result-item empty">
                    <span class="regurg-result-label">${regurgName}</span>
                    <span class="regurg-result-value">—</span>
                </div>`;
            }
        });
        
        html += '</div>';
    }

    if (regurgLines.length > 0) {
        reportLines.push('');
        reportLines.push('Regurgitation:');
        reportLines.push(...regurgLines);
    }
    html += '</div></div>';
    resultEl.innerHTML = html;

    // Store report text for copying
    window.fontanFlowReport = reportLines.join('\n');
}

function copyFontanFlowReport() {
    const txt = window.fontanFlowReport || '';
    if (!txt) return;

    const btn = document.querySelector('.copy-flow-btn');
    const showCopied = () => {
        if (btn) {
            const orig = btn.innerHTML;
            btn.innerHTML = '✓ Copied!';
            btn.classList.add('copied');
            setTimeout(() => { btn.innerHTML = orig; btn.classList.remove('copied'); }, 2000);
        }
    };

    if (navigator.clipboard) {
        navigator.clipboard.writeText(txt).then(showCopied);
    } else {
        const ta = document.createElement('textarea');
        ta.value = txt;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showCopied();
    }
}

/* ============================================================
   SIMPLIFIED BERNOULLI CALCULATOR
   ============================================================ */

const SEVERITY = {
    aortic: [
        { label: 'Normal', maxPG: 10, cls: 'normal' },
        { label: 'Mild', maxPG: 36, cls: 'mild' },
        { label: 'Moderate', maxPG: 64, cls: 'moderate' },
        { label: 'Severe', maxPG: 999, cls: 'severe' }
    ],
    mitral: [
        { label: 'Normal', maxPG: 5, cls: 'normal' },
        { label: 'Mild', maxPG: 10, cls: 'mild' },
        { label: 'Moderate', maxPG: 15, cls: 'moderate' },
        { label: 'Severe', maxPG: 999, cls: 'severe' }
    ],
    pulmonic: [
        { label: 'Normal', maxPG: 10, cls: 'normal' },
        { label: 'Mild', maxPG: 36, cls: 'mild' },
        { label: 'Moderate', maxPG: 64, cls: 'moderate' },
        { label: 'Severe', maxPG: 999, cls: 'severe' }
    ],
    tricuspid: [
        { label: 'Normal', maxPG: 5, cls: 'normal' },
        { label: 'Mild', maxPG: 10, cls: 'mild' },
        { label: 'Moderate', maxPG: 15, cls: 'moderate' },
        { label: 'Severe', maxPG: 999, cls: 'severe' }
    ]
};

function initBernoulliCalc() {
    // Tab switching for Bernoulli reference tables
    document.querySelectorAll('.bern-tab-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.bern-tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.bern-tab-content').forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            const tab = el('bern-tab-' + this.dataset.tab);
            if (tab) tab.classList.add('active');
        });
    });

    // Bidirectional calculation
    const vmaxEl = el('bern-vmax');
    const pgEl = el('bern-pg');
    if (!vmaxEl || !pgEl) return;
    
    vmaxEl.addEventListener('input', function() {
        calcBernoulli('vmax');
    });
    
    pgEl.addEventListener('input', function() {
        calcBernoulli('pg');
    });
}

function calcBernoulli(source) {
    const vmaxEl = el('bern-vmax');
    const pgEl = el('bern-pg');
    
    if (!vmaxEl || !pgEl) return;
    
    const vmax = fVal('bern-vmax');
    const pg = fVal('bern-pg');
    
    // Calculate based on which one was updated
    if (source === 'vmax' && !isNaN(vmax) && vmax > 0) {
        // Calculate PG from velocity
        const calcPG = 4 * vmax * vmax;
        pgEl.value = calcPG.toFixed(1);
    } else if (source === 'pg' && !isNaN(pg) && pg >= 0) {
        // Calculate velocity from PG
        const calcVmax = Math.sqrt(pg / 4);
        vmaxEl.value = calcVmax.toFixed(2);
    }
}

/* ============================================================
   CHD SEGMENTAL ANALYSIS TABS
   ============================================================ */

function initCHDTabs() {
    // Setup tab switching for CHD segmental analysis
    document.querySelectorAll('.chd-tab-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const tabName = this.dataset.tab;
            const container = this.closest('.chd-tabs-container');
            
            if (!container) return;
            
            // Remove active class from all buttons and content in this container
            container.querySelectorAll('.chd-tab-btn').forEach(b => b.classList.remove('active'));
            container.querySelectorAll('.chd-tab-content').forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            this.classList.add('active');
            const contentEl = container.querySelector('#chd-tab-' + tabName);
            if (contentEl) {
                contentEl.classList.add('active');
            }
        });
    });
}
