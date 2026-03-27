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

function qpqsClass(ratio) {
    if (ratio > 2.0) return 'severe';
    if (ratio > 1.5) return 'moderate';
    if (ratio > 1.1) return 'mild';
    if (ratio >= 0.9) return 'balanced';
    if (ratio >= 0.7) return 'shunt-rl';
    return 'severe';
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

    // Track whether MR/TR were user-entered or calculated
    const mrUserEntered = !isNaN(mrIn);
    const trUserEntered = !isNaN(trIn);

    const arFlow = regurgToLmin(arIn, regUnits, hr);
    const prFlow = regurgToLmin(prIn, regUnits, hr);

    // Qp and Qs (using NET flows for shunt calculation)
    const qp = (!isNaN(lpaNet.mid) && !isNaN(rpaNet.mid)) ? lpaNet.mid + rpaNet.mid : (!isNaN(paNet.mid) ? paNet.mid : NaN);
    const qs = !isNaN(aoNet.mid) ? aoNet.mid : NaN;

    // Calculate forward flows from net + regurgitant volumes
    const aoForward = (!isNaN(aoNet.mid)) ? aoNet.mid + (!isNaN(arFlow) ? arFlow : 0) : NaN;
    // Use MPA if available, otherwise fall back to LPA+RPA sum
    const paNetBase = !isNaN(paNet.mid) ? paNet.mid : qp;
    const paForward = (!isNaN(paNetBase)) ? paNetBase + (!isNaN(prFlow) ? prFlow : 0) : NaN;

    // Calculate MR from LVSV - AVFF if LVSV provided and MR not directly entered
    if (!isNaN(lvsv) && !mrUserEntered && !isNaN(aoForward) && aoForward > 0 && !isNaN(hr) && hr > 0) {
        // Convert aoForward (L/min) to mL/beat for comparison with LVSV
        const aoForwardMlBeat = (aoForward * 1000) / hr;
        mrIn = lvsv - aoForwardMlBeat;  // in mL/beat
        if (mrIn < 0) mrIn = 0;
    }

    // Calculate TR from RVSV - PVFF if RVSV provided and TR not directly entered
    if (!isNaN(rvsv) && !trUserEntered && !isNaN(paForward) && paForward > 0 && !isNaN(hr) && hr > 0) {
        // Convert paForward (L/min) to mL/beat for comparison with RVSV
        const paForwardMlBeat = (paForward * 1000) / hr;
        trIn = rvsv - paForwardMlBeat;  // in mL/beat
        if (trIn < 0) trIn = 0;
    }

    // Convert flows - auto-calculated MR/TR are in mL/beat, user-entered ones follow regUnits
    const mrFlow = !isNaN(mrIn) ? regurgToLmin(mrIn, mrUserEntered ? regUnits : 'mlbeat', hr) : NaN;
    const trFlow = !isNaN(trIn) ? regurgToLmin(trIn, trUserEntered ? regUnits : 'mlbeat', hr) : NaN;

    const resultEl = el('flow-std-result');
    if (!resultEl) return;

    // Check if any inputs filled
    const anyFilled = !isNaN(aoNet.mid) || !isNaN(paNet.mid) || !isNaN(lpaNet.mid) || !isNaN(rpaNet.mid);
    if (!anyFilled) {
        resultEl.innerHTML = '<p class="calc-placeholder">Enter vessel flows to compute results.</p>';
        return;
    }

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
            html += `<div class="flow-result-line ${asymmetric ? 'highlight moderate' : ''}">
                <span class="flow-result-label">RPA/LPA Split</span>
                <span class="flow-result-value">${rPct}% / ${lPct}%</span>
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

        html += `<div class="flow-result-line highlight ${qpqsClass(ratio)}">
            <span class="flow-result-label">Qp:Qs</span>
            <span class="flow-result-value">${ratio.toFixed(2)}</span>
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
            method: 'Direct',
            reportText: `  Aortic: ${fmtFlowWithBeat(arFlow, hr)}, regurgitant fraction ${arRf.toFixed(0)}%`
        });
    }

    // Mitral Regurgitation
    // MR RF = MR / LVSV, LVSV = MR + AVFF (AVFF = aoForward = aoNet + AR)
    if (!isNaN(mrIn) && mrIn > 0 && !isNaN(aoForward) && aoForward > 0) {
        const mrRf = mrFlow / (aoForward + mrFlow) * 100;
        const mrCls = mrRf < 20 ? 'mild' : mrRf < 40 ? 'moderate' : 'severe';
        const highlight = mrRf >= 40 ? 'highlight' : '';
        regurgItems.push({
            label: 'Mitral Regurgitation',
            value: fmtFlowWithBeat(mrFlow, hr),
            rf: mrRf,
            cls: mrCls,
            highlight: highlight,
            method: mrUserEntered ? 'Direct' : 'LVSV − AVFF',
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
            method: 'Direct',
            reportText: `  Pulmonary: ${fmtFlowWithBeat(prFlow, hr)}, regurgitant fraction ${prRf.toFixed(0)}%`
        });
    }

    // Tricuspid Regurgitation - graded by absolute volume (mL/beat)
    if (!isNaN(trIn) && trIn > 0) {
        // trFlow is already converted to L/min
        // Convert back to mL/beat for grading
        let trVolMlBeat = !isNaN(hr) && hr > 0 ? (trFlow * 1000 / hr) : NaN;

        if (!isNaN(trVolMlBeat)) {
            let trCls;
            if (trVolMlBeat < 30) {
                trCls = 'mild';
            } else if (trVolMlBeat < 45) {
                trCls = 'moderate';
            } else {
                trCls = 'severe';
            }

            let trRf = NaN;
            // TR RF = TR / RVSV, RVSV = TR + PVFF (PVFF = paForward = paNet + PR)
            if (!isNaN(paForward) && paForward > 0) {
                trRf = trFlow / (paForward + trFlow) * 100;
            }

            const highlight = trCls === 'severe' ? 'highlight' : '';
            regurgItems.push({
                label: 'Tricuspid Regurgitation',
                value: fmtFlowWithBeat(trFlow, hr),
                rf: trRf,
                cls: trCls,
                highlight: highlight,
                method: trUserEntered ? 'Direct' : 'RVSV − PVFF',
                reportText: `  Tricuspid: ${fmtFlowWithBeat(trFlow, hr)}${!isNaN(trRf) ? `, RF ${trRf.toFixed(0)}%` : ''}`
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
                html += `<div class="regurg-result-item ${item.cls}">
                    <span class="regurg-result-label">${item.label}</span>
                    <div>
                        <span class="regurg-result-value">${item.value}</span>
                        ${!isNaN(item.rf) ?
                            `<span class="regurg-result-value">RF ${item.rf.toFixed(0)}%</span>` : ''
                        }
                        <span class="regurg-method">${item.method}</span>
                    </div>
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

    // Track whether MR/TR were user-entered or calculated
    const mrUserEntered = !isNaN(fVal('fon-mr-vol'));
    const trUserEntered = !isNaN(fVal('fon-tr-vol'));

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

    // Convert flows - auto-calculated MR/TR are in mL/beat, user-entered ones follow regUnits
    const mrFlow = !isNaN(mrIn) ? regurgToLmin(mrIn, mrUserEntered ? regUnits : 'mlbeat', hr) : NaN;
    const trFlow = !isNaN(trIn) ? regurgToLmin(trIn, trUserEntered ? regUnits : 'mlbeat', hr) : NaN;

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
    // Pulmonary venous flow (Qpv) — for collateral quantification and shunt ratios
    const qpv = (!isNaN(lpvNet.mid) && !isNaN(rpvNet.mid)) ? lpvNet.mid + rpvNet.mid : NaN;

    // Pre-compute collateral values (needed for both HTML and copied report)
    // pa = pulmonary arterial, pv = pulmonary venous, sa = systemic arterial, sv = systemic venous
    const qRatioRows = [
        { label: 'Qpa:Qsa', num: qp,  den: qs,              primary: true  },
        { label: 'Qpv:Qsa', num: qpv, den: qs,              primary: false },
        { label: 'Qpa:Qsv', num: qp,  den: totalFontanFlow, primary: false },
        { label: 'Qpv:Qsv', num: qpv, den: totalFontanFlow, primary: false },
    ];

    let pulCollateral = NaN;
    let pulCollPctOfAo = null;
    let pulCollSevere = false;
    if (!isNaN(qpv) && !isNaN(qp)) {
        pulCollateral = qpv - qp;
        pulCollPctOfAo = !isNaN(qs) && qs > 0 ? (pulCollateral / qs * 100).toFixed(0) : null;
        pulCollSevere = !isNaN(qs) && qs > 0 ? pulCollateral > qs * 0.2 : pulCollateral > qp * 0.2;
    }

    let systCollateral = NaN;
    let systCollPct = null;
    let systCollSignificant = false;
    if (!isNaN(aoForward) && !isNaN(totalFontanFlow)) {
        const raw = aoForward - totalFontanFlow;
        if (raw > 0) {
            systCollateral = raw;
            systCollPct = !isNaN(qs) && qs > 0 ? (systCollateral / qs * 100).toFixed(0) : null;
            systCollSignificant = systCollateral > aoForward * 0.15;
        }
    }

    let avgCollateral = NaN;
    let avgCollCls = '';
    let avgCollNote = '';
    if (!isNaN(pulCollateral) && !isNaN(systCollateral) && systCollateral > 0) {
        avgCollateral = (Math.abs(pulCollateral) + systCollateral) / 2;
        const avgI = !isNaN(bsa) && bsa > 0 ? avgCollateral / bsa : NaN;
        if (!isNaN(avgI)) {
            if (avgI < 0.5)       { avgCollCls = 'normal';   avgCollNote = 'Minimal'; }
            else if (avgI < 1.0)  { avgCollCls = 'mild';     avgCollNote = 'Mild'; }
            else if (avgI < 1.5)  { avgCollCls = 'moderate'; avgCollNote = 'Moderate'; }
            else                  { avgCollCls = 'severe';   avgCollNote = 'Severe'; }
        } else if (avgCollateral > 1.0) {
            avgCollCls = 'moderate'; avgCollNote = 'Significant';
        }
    }

    // HTML output — sections mirror the copied report layout
    let html = '<div class="flow-results-wrapper">';
    html += '<div class="flow-results-header">';
    html += '<h3>Fontan Results</h3>';
    html += '<button class="copy-flow-btn" onclick="copyFontanFlowReport()">📋 Copy to Report</button>';
    html += '</div>';
    html += '<div class="flow-results-grid">';

    // ── SYSTEMIC ──────────────────────────────────────────────
    html += '<div class="flow-section-label">Systemic</div>';
    if (!isNaN(qs)) {
        const qsI = !isNaN(bsa) && bsa > 0 ? `, ${(qs / bsa).toFixed(2)} L/min/m²` : '';
        html += `<div class="flow-result-line">
            <span class="flow-result-label">Systemic Output (Qs)</span>
            <span class="flow-result-value">${qs.toFixed(2)} L/min${qsI}</span>
        </div>`;
    }

    // ── PULMONARY ARTERIES ────────────────────────────────────
    if (!isNaN(qp) || !isNaN(rpaNet.mid) || !isNaN(lpaNet.mid)) {
        html += '<div class="flow-section-label">Pulmonary Arteries</div>';
        if (!isNaN(rpaNet.mid)) {
            html += `<div class="flow-result-line">
                <span class="flow-result-label">RPA</span>
                <span class="flow-result-value">${rpaNet.mid.toFixed(2)} L/min</span>
                </div>`;
        }
        if (!isNaN(lpaNet.mid)) {
            html += `<div class="flow-result-line">
                <span class="flow-result-label">LPA</span>
                <span class="flow-result-value">${lpaNet.mid.toFixed(2)} L/min</span>
                </div>`;
        }
        if (!isNaN(qp)) {
            const qpI = !isNaN(bsa) && bsa > 0 ? `, ${(qp / bsa).toFixed(2)} L/min/m²` : '';
            html += `<div class="flow-result-line highlight">
                <span class="flow-result-label">Pulmonary Output (Qpa)</span>
                <span class="flow-result-value">${qp.toFixed(2)} L/min${qpI}</span>
                </div>`;
            if (!isNaN(qs) && qs > 0) {
                html += `<div class="flow-result-line ${qpqsClass(qp / qs)}">
                    <span class="flow-result-label">Qpa:Qs</span>
                    <span class="flow-result-value">${(qp / qs).toFixed(2)}</span>
                </div>`;
            }
        }
        if (!isNaN(lpaNet.mid) && !isNaN(rpaNet.mid) && qp > 0) {
            const rPct = (rpaNet.mid / qp * 100).toFixed(0);
            const lPct = (lpaNet.mid / qp * 100).toFixed(0);
            const asymmetric = Math.abs(lpaNet.mid / qp - 0.5) > 0.15;
            html += `<div class="flow-result-line ${asymmetric ? 'highlight moderate' : ''}">
                <span class="flow-result-label">RPA/LPA Split</span>
                <span class="flow-result-value">${rPct}% / ${lPct}%</span>
            </div>`;
        }
    }

    // ── PULMONARY VEINS ───────────────────────────────────────
    if (!isNaN(qpv) || !isNaN(rpvNet.mid) || !isNaN(lpvNet.mid)) {
        html += '<div class="flow-section-label">Pulmonary Veins</div>';
        if (!isNaN(rpvNet.mid)) {
            html += `<div class="flow-result-line">
                <span class="flow-result-label">RPV</span>
                <span class="flow-result-value">${rpvNet.mid.toFixed(2)} L/min</span>
                </div>`;
        }
        if (!isNaN(lpvNet.mid)) {
            html += `<div class="flow-result-line">
                <span class="flow-result-label">LPV</span>
                <span class="flow-result-value">${lpvNet.mid.toFixed(2)} L/min</span>
                </div>`;
        }
        if (!isNaN(qpv)) {
            const qpvI = !isNaN(bsa) && bsa > 0 ? `, ${(qpv / bsa).toFixed(2)} L/min/m²` : '';
            html += `<div class="flow-result-line highlight">
                <span class="flow-result-label">PV Return (Qpv)</span>
                <span class="flow-result-value">${qpv.toFixed(2)} L/min${qpvI}</span>
                </div>`;
            if (!isNaN(qs) && qs > 0) {
                html += `<div class="flow-result-line">
                    <span class="flow-result-label">Qpv:Qs</span>
                    <span class="flow-result-value">${(qpv / qs).toFixed(2)}</span>
                        </div>`;
            }
            if (!isNaN(rpvNet.mid) && !isNaN(lpvNet.mid) && qpv > 0) {
                const rPvPct = (rpvNet.mid / qpv * 100).toFixed(0);
                const lPvPct = (lpvNet.mid / qpv * 100).toFixed(0);
                html += `<div class="flow-result-line">
                    <span class="flow-result-label">RPV/LPV Split</span>
                    <span class="flow-result-value">${rPvPct}% / ${lPvPct}%</span>
                        </div>`;
            }
        }
    }

    // ── CAVAE / SYSTEMIC VEINS ────────────────────────────────
    if (glennOk || fontanOk || !isNaN(totalFontanFlow)) {
        html += '<div class="flow-section-label">Cavae / Systemic Veins</div>';
        if (glennOk) {
            const gI = !isNaN(bsa) && bsa > 0 ? `, ${(glennNet.mid / bsa).toFixed(2)} L/min/m²` : '';
            html += `<div class="flow-result-line">
                <span class="flow-result-label">SVC / Glenn</span>
                <span class="flow-result-value">${glennNet.mid.toFixed(2)} L/min${gI}</span>
                </div>`;
        }
        if (fontanOk) {
            const fI = !isNaN(bsa) && bsa > 0 ? `, ${(fontanNet.mid / bsa).toFixed(2)} L/min/m²` : '';
            html += `<div class="flow-result-line">
                <span class="flow-result-label">Fontan / IVC</span>
                <span class="flow-result-value">${fontanNet.mid.toFixed(2)} L/min${fI}</span>
                </div>`;
        }
        if (!isNaN(totalFontanFlow)) {
            const tI = !isNaN(bsa) && bsa > 0 ? `, ${(totalFontanFlow / bsa).toFixed(2)} L/min/m²` : '';
            html += `<div class="flow-result-line highlight">
                <span class="flow-result-label">Total Caval Return</span>
                <span class="flow-result-value">${totalFontanFlow.toFixed(2)} L/min${tI}</span>
                </div>`;
        }
        if (glennOk && fontanOk) {
            const totalIn = glennNet.mid + fontanNet.mid;
            const glennPct = (glennNet.mid / totalIn * 100).toFixed(0);
            const fontanPct = (fontanNet.mid / totalIn * 100).toFixed(0);
            html += `<div class="flow-result-line">
                <span class="flow-result-label">Inflow Distribution</span>
                <span class="flow-result-value">Glenn ${glennPct}% / Fontan ${fontanPct}%</span>
                </div>`;
        }
    }

    // ── SHUNT RATIOS ──────────────────────────────────────────
    const availableRatios = qRatioRows.filter(r => !isNaN(r.num) && !isNaN(r.den) && r.den > 0);
    if (availableRatios.length > 0) {
        html += '<div class="flow-section-label">Shunt Ratios</div>';
        availableRatios.forEach(({ label, num, den, primary }) => {
            const ratio = num / den;
            html += `<div class="flow-result-line ${primary ? `highlight ${qpqsClass(ratio)}` : ''}">
                <span class="flow-result-label">${label}</span>
                <span class="flow-result-value">${ratio.toFixed(2)}</span>
            </div>`;
        });
    }

    // ── COLLATERAL FLOWS ──────────────────────────────────────
    const anyCollateral = (!isNaN(systCollateral) && systCollateral > 0) || !isNaN(pulCollateral) || !isNaN(avgCollateral);
    if (anyCollateral) {
        html += '<div class="flow-section-label">Collateral Flows</div>';
        if (!isNaN(systCollateral) && systCollateral > 0) {
            html += `<div class="flow-result-line ${systCollSignificant ? 'highlight moderate' : ''}">
                <span class="flow-result-label">Qcoll-syst (Qsa − Qsv)</span>
                <span class="flow-result-value">${systCollateral.toFixed(2)} L/min${systCollPct ? ` (${systCollPct}% aortic flow)` : ''}</span>
            </div>`;
        }
        if (!isNaN(pulCollateral)) {
            html += `<div class="flow-result-line ${pulCollSevere ? 'highlight moderate' : ''}">
                <span class="flow-result-label">Qcoll-pulm (Qpv − Qpa)</span>
                <span class="flow-result-value">${pulCollateral.toFixed(2)} L/min${pulCollPctOfAo !== null ? ` (${pulCollPctOfAo}% aortic flow)` : ''}</span>
            </div>`;
        }
        if (!isNaN(avgCollateral)) {
            html += `<div class="flow-result-line ${avgCollCls && avgCollCls !== 'normal' ? `highlight ${avgCollCls}` : ''}">
                <span class="flow-result-label">Q coll-avg</span>
                <span class="flow-result-value">${avgCollateral.toFixed(2)} L/min</span>
            </div>`;
        }
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
            method: 'Direct',
            reportText: `  Aortic: ${fmtFlowWithBeat(arFlow, hr)}, regurgitant fraction ${arRf.toFixed(0)}%`
        });
    }

    // Mitral Regurgitation
    // MR RF = MR / LVSV, LVSV = MR + AVFF (AVFF = aoForward = aoNet + AR)
    if (!isNaN(mrIn) && mrIn > 0 && !isNaN(aoForward) && aoForward > 0) {
        const mrRf = mrFlow / (aoForward + mrFlow) * 100;
        const mrCls = mrRf < 20 ? 'mild' : mrRf < 40 ? 'moderate' : 'severe';
        const highlight = mrRf >= 40 ? 'highlight' : '';
        regurgItems.push({
            label: 'Mitral Regurgitation',
            value: fmtFlowWithBeat(mrFlow, hr),
            rf: mrRf,
            cls: mrCls,
            highlight: highlight,
            method: mrUserEntered ? 'Direct' : 'LVSV − AVFF',
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
            method: 'Direct',
            reportText: `  Pulmonary: ${fmtFlowWithBeat(prFlow, hr)}, regurgitant fraction ${prRf.toFixed(0)}%`
        });
    }

    // Tricuspid Regurgitation - graded by absolute volume (mL/beat)
    if (!isNaN(trIn) && trIn > 0) {
        // trFlow is already converted to L/min via regurgToLmin(trIn, 'mlbeat', hr)
        // Convert back to mL/beat for grading
        let trVolMlBeat = !isNaN(hr) && hr > 0 ? (trFlow * 1000 / hr) : NaN;

        if (!isNaN(trVolMlBeat)) {
            let trCls;
            if (trVolMlBeat < 30) {
                trCls = 'mild';
            } else if (trVolMlBeat < 45) {
                trCls = 'moderate';
            } else {
                trCls = 'severe';
            }

            let trRf = NaN;
            // TR RF = TR / RVSV, RVSV = TR + PVFF (PVFF = paForward = paNet + PR)
            if (!isNaN(paForward) && paForward > 0) {
                trRf = trFlow / (paForward + trFlow) * 100;
            }

            const highlight = trCls === 'severe' ? 'highlight' : '';
            regurgItems.push({
                label: 'Tricuspid Regurgitation',
                value: fmtFlowWithBeat(trFlow, hr),
                rf: trRf,
                cls: trCls,
                highlight: highlight,
                method: trUserEntered ? 'Direct' : 'RVSV − PVFF',
                reportText: `  Tricuspid: ${fmtFlowWithBeat(trFlow, hr)}${!isNaN(trRf) ? `, RF ${trRf.toFixed(0)}%` : ''}`
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
                html += `<div class="regurg-result-item ${item.cls}">
                    <span class="regurg-result-label">${item.label}</span>
                    <div>
                        <span class="regurg-result-value">${item.value}</span>
                        ${!isNaN(item.rf) ?
                            `<span class="regurg-result-value">RF ${item.rf.toFixed(0)}%</span>` : ''
                        }
                        <span class="regurg-method">${item.method}</span>
                    </div>
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

    html += '</div></div>';
    resultEl.innerHTML = html;

    // Build structured report for copying
    const rpt = ['Flow Quantification (estimated via 4D Flow MRI):'];
    rpt.push('');

    // Systemic
    if (!isNaN(qs)) {
        const qsI = !isNaN(bsa) && bsa > 0 ? `, ${(qs / bsa).toFixed(2)} L/min/m²` : '';
        rpt.push(`Systemic Output (Qs): ${qs.toFixed(2)} L/min${qsI}`);
    }
    rpt.push('');

    // Pulmonary Arteries
    rpt.push('Pulmonary Arteries:');
    rpt.push('');
    if (!isNaN(rpaNet.mid)) rpt.push(`Right pulmonary artery: ${rpaNet.mid.toFixed(2)} L/min`);
    if (!isNaN(lpaNet.mid)) rpt.push(`Left pulmonary artery: ${lpaNet.mid.toFixed(2)} L/min`);
    if (!isNaN(qp)) {
        const qpI = !isNaN(bsa) && bsa > 0 ? `, ${(qp / bsa).toFixed(2)} L/min/m²` : '';
        rpt.push(`Pulmonary Output (Qpa): ${qp.toFixed(2)} L/min${qpI}`);
    }
    if (!isNaN(qp) && !isNaN(qs) && qs > 0) rpt.push(`Qpa:Qs: ${(qp / qs).toFixed(2)}`);
    if (!isNaN(lpaNet.mid) && !isNaN(rpaNet.mid) && qp > 0) {
        const rPct = (rpaNet.mid / qp * 100).toFixed(0);
        const lPct = (lpaNet.mid / qp * 100).toFixed(0);
        rpt.push(`RPA/LPA Flow Split: ${rPct}% right / ${lPct}% left`);
    }
    rpt.push('');

    // Pulmonary Veins
    rpt.push('Pulmonary Veins:');
    rpt.push('');
    if (!isNaN(rpvNet.mid)) rpt.push(`Right pulmonary veins: ${rpvNet.mid.toFixed(2)} L/min`);
    if (!isNaN(lpvNet.mid)) rpt.push(`Left pulmonary veins: ${lpvNet.mid.toFixed(2)} L/min`);
    if (!isNaN(qpv)) {
        const qpvI = !isNaN(bsa) && bsa > 0 ? `, ${(qpv / bsa).toFixed(2)} L/min/m²` : '';
        rpt.push(`Pulmonary venous return: ${qpv.toFixed(2)} L/min${qpvI}`);
        if (!isNaN(qs) && qs > 0) rpt.push(`Qpv/Qs: ${(qpv / qs).toFixed(2)}`);
        if (!isNaN(rpvNet.mid) && !isNaN(lpvNet.mid) && qpv > 0) {
            const rPvPct = (rpvNet.mid / qpv * 100).toFixed(0);
            const lPvPct = (lpvNet.mid / qpv * 100).toFixed(0);
            rpt.push(`RPV/LPV Flow Split: ${rPvPct}% right / ${lPvPct}% left`);
        }
    }
    rpt.push('');

    // Cavae/Systemic Veins
    rpt.push('Cavae/Systemic Veins:');
    rpt.push('');
    if (glennOk) rpt.push(`SVC/Glenn: ${glennNet.mid.toFixed(2)} L/min`);
    if (fontanOk) rpt.push(`Fontan: ${fontanNet.mid.toFixed(2)} L/min`);
    if (!isNaN(totalFontanFlow)) {
        const tffI = !isNaN(bsa) && bsa > 0 ? `, ${(totalFontanFlow / bsa).toFixed(2)} L/min/m²` : '';
        rpt.push(`Total Caval Return: ${totalFontanFlow.toFixed(2)} L/min${tffI}`);
    }
    rpt.push('');

    // Shunt Ratios
    rpt.push('Shunt Ratios:');
    qRatioRows.forEach(({ label, num, den }) => {
        if (!isNaN(num) && !isNaN(den) && den > 0) {
            rpt.push(`${label}: ${(num / den).toFixed(2)}`);
        }
    });
    rpt.push('');

    // Collaterals
    if (!isNaN(systCollateral) && systCollateral > 0) {
        const pct = !isNaN(qs) && qs > 0 ? ` (${(systCollateral / qs * 100).toFixed(0)}% aortic flow)` : '';
        rpt.push(`Qcoll-syst (Qsa − Qsv): ${systCollateral.toFixed(2)} L/min${pct}`);
    }
    if (!isNaN(pulCollateral)) {
        const pct = !isNaN(qs) && qs > 0 ? ` (${(pulCollateral / qs * 100).toFixed(0)}% aortic flow)` : '';
        rpt.push(`Qcoll-pulm (Qpv − Qpa): ${pulCollateral.toFixed(2)} L/min${pct}`);
    }
    if (!isNaN(avgCollateral)) {
        const pct = !isNaN(qs) && qs > 0 ? ` (${(avgCollateral / qs * 100).toFixed(0)}% aortic flow)` : '';
        rpt.push(`Q coll-avg ((Qcoll-syst + Qcoll-pulm)/2): ${avgCollateral.toFixed(2)} L/min${pct}`);
    }

    // Regurgitation
    if (regurgItems.length > 0) {
        rpt.push('');
        rpt.push('Regurgitation:');
        rpt.push('');
        [
            { name: 'Aortic Regurgitation',    label: 'Aortic' },
            { name: 'Pulmonary Regurgitation', label: 'Pulmonary' },
            { name: 'Mitral Regurgitation',    label: 'Mitral' },
            { name: 'Tricuspid Regurgitation', label: 'Tricuspid' },
        ].forEach(({ name, label }) => {
            const item = regurgItems.find(r => r.label === name);
            if (item) {
                const rf = !isNaN(item.rf) ? `, RF ${item.rf.toFixed(0)}%` : '';
                rpt.push(`${label}: ${item.value}${rf}`);
            }
        });
    }

    window.fontanFlowReport = rpt.join('\n');
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
