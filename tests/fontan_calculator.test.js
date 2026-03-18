/**
 * @jest-environment jsdom
 *
 * Tests for the Fontan circulation tab of the 4D Flow calculator
 * in docs/javascripts/calculators.js.
 *
 * Strategy: build the required DOM, eval the source, then call
 * calcFontanFlow() directly and inspect the rendered HTML.
 */

const fs = require('fs');
const path = require('path');

const SRC_PATH = path.resolve(__dirname, '../docs/javascripts/calculators.js');
const calcJS = fs.readFileSync(SRC_PATH, 'utf8');

/* ---------------------------------------------------------------
   DOM HELPERS
--------------------------------------------------------------- */

/**
 * Creates every DOM element that calcFontanFlow() reads/writes.
 * Optionally pre-fills input values via the `values` map { id: value }.
 */
function setupFontanDOM(values = {}) {
    document.body.innerHTML = `
        <!-- Shared patient params -->
        <input id="patient-height" type="number">
        <input id="patient-weight" type="number">
        <input id="flow-hr"        type="number">
        <div id="bsa-display">—</div>
        <div id="bsa-display-fontan">—</div>
        <div id="hr-display-fontan">—</div>

        <!-- Fontan inputs -->
        <input id="fon-ao-net"     type="text">
        <input id="fon-glenn-net"  type="text">
        <input id="fon-fontan-net" type="text">
        <input id="fon-pa-net"     type="text">
        <input id="fon-lpa-net"    type="text">
        <input id="fon-rpa-net"    type="text">
        <input id="fon-lpv-net"    type="text">
        <input id="fon-rpv-net"    type="text">

        <!-- Volumetric stroke volumes -->
        <input id="fon-lvsv" type="number">
        <input id="fon-rvsv" type="number">

        <!-- Regurgitation -->
        <select id="fon-regurg-units">
            <option value="mlbeat" selected>mL/beat</option>
            <option value="lmin">L/min</option>
        </select>
        <input id="fon-ar-vol" type="number">
        <input id="fon-mr-vol" type="number">
        <input id="fon-pr-vol" type="number">
        <input id="fon-tr-vol" type="number">

        <!-- Result container -->
        <div id="flow-fontan-result"></div>

        <!-- Standard tab elements (referenced by init4DFlowCalc) -->
        <div id="flow-tab-standard" class="flow-tab-content active"></div>
        <div id="flow-tab-fontan"   class="flow-tab-content"></div>
        <select id="std-regurg-units">
            <option value="mlbeat" selected>mL/beat</option>
        </select>
        <div id="flow-std-result"></div>
    `;

    // Pre-fill requested values
    for (const [id, val] of Object.entries(values)) {
        const el = document.getElementById(id);
        if (el) el.value = String(val);
    }
}

/** Returns the inner text of a CSS selector within #flow-fontan-result */
function resultText() {
    return document.getElementById('flow-fontan-result').textContent;
}

/** Returns the inner HTML of #flow-fontan-result */
function resultHTML() {
    return document.getElementById('flow-fontan-result').innerHTML;
}

/* ---------------------------------------------------------------
   LOAD CALCULATOR (once per file)
--------------------------------------------------------------- */

beforeAll(() => {
    // Provide a minimal DOM so the DOMContentLoaded initialisation
    // does not throw on missing elements.
    setupFontanDOM();
    // Indirect eval runs in the global scope, making function declarations
    // (calcFontanFlow, etc.) available on `global`/`window`.
    // eslint-disable-next-line no-eval
    const geval = eval;
    geval(calcJS);
});

/* ---------------------------------------------------------------
   TESTS
--------------------------------------------------------------- */

describe('Fontan Calculator — empty / placeholder state', () => {
    beforeEach(() => setupFontanDOM());

    test('shows placeholder when no inputs are provided', () => {
        calcFontanFlow();
        expect(resultText()).toMatch(/Enter Fontan circuit flows/i);
    });
});

/* --- Core flow metrics ---------------------------------------- */

describe('Fontan Calculator — core flow metrics', () => {
    // Balanced scenario:
    // Ao = 3.5, Glenn = 1.5, Fontan = 2.0, LPA = 1.6, RPA = 1.9
    // Total caval = 3.5  |  Qp = 3.5  |  Qs = 3.5
    // Qp:Qs = 1.00  →  No shunt
    // Fontan-to-Pulm = 3.5 / 3.5 = 1.00  →  Good match
    const BALANCED = {
        'fon-ao-net':     '3.5',
        'fon-glenn-net':  '1.5',
        'fon-fontan-net': '2.0',
        'fon-lpa-net':    '1.6',
        'fon-rpa-net':    '1.9',
    };

    beforeEach(() => setupFontanDOM(BALANCED));

    test('displays aortic flow', () => {
        calcFontanFlow();
        expect(resultText()).toContain('3.50');
    });

    test('displays total pulmonary artery flow (LPA + RPA)', () => {
        calcFontanFlow();
        // Qp = 1.6 + 1.9 = 3.50
        const html = resultHTML();
        // PA Flow line should include 3.50
        expect(html).toMatch(/PA Flow.*3\.50/s);
    });

    test('calculates total caval flow (Glenn + Fontan conduit)', () => {
        calcFontanFlow();
        // 1.5 + 2.0 = 3.50
        expect(resultHTML()).toMatch(/Total Caval Flow.*3\.50/s);
    });

    test('displays Qp:Qs ratio = 1.00', () => {
        calcFontanFlow();
        expect(resultHTML()).toMatch(/Qp:Qs.*1\.00/s);
    });

    test('classifies Qp:Qs = 1.00 as No significant shunt', () => {
        calcFontanFlow();
        expect(resultHTML()).toContain('No significant shunt');
    });

    test('Fontan-to-pulmonary ratio = 1.00 → Good match badge', () => {
        calcFontanFlow();
        expect(resultHTML()).toContain('Good match');
    });

    test('inflow distribution: Glenn 43% / Fontan 57%', () => {
        calcFontanFlow();
        // Glenn 1.5 / 3.5 = 42.9% → 43%  ;  Fontan 2.0 / 3.5 = 57.1% → 57%
        const html = resultHTML();
        expect(html).toMatch(/Glenn\s*43%/);
        expect(html).toMatch(/Fontan\s*57%/);
    });
});

/* --- PA split -------------------------------------------------- */

describe('Fontan Calculator — RPA/LPA split', () => {
    beforeEach(() => setupFontanDOM({
        'fon-ao-net':     '3.0',
        'fon-glenn-net':  '1.0',
        'fon-fontan-net': '2.0',
        'fon-lpa-net':    '1.5',
        'fon-rpa-net':    '1.5',
    }));

    test('shows 50% / 50% symmetric split', () => {
        calcFontanFlow();
        const html = resultHTML();
        expect(html).toMatch(/50%\s*\/\s*50%/);
    });

    test('does NOT flag 50/50 split as asymmetric', () => {
        calcFontanFlow();
        expect(resultHTML()).not.toContain('Asymmetric');
    });
});

describe('Fontan Calculator — asymmetric PA distribution', () => {
    // LPA = 0.5, RPA = 2.5, Qp = 3.0
    // LPA% = 17%, RPA% = 83%
    // |0.5/3.0 - 0.5| = 0.333 > 0.15 → Asymmetric
    beforeEach(() => setupFontanDOM({
        'fon-ao-net':     '3.0',
        'fon-glenn-net':  '1.0',
        'fon-fontan-net': '2.0',
        'fon-lpa-net':    '0.5',
        'fon-rpa-net':    '2.5',
    }));

    test('calculates correct individual PA flows', () => {
        calcFontanFlow();
        const html = resultHTML();
        expect(html).toMatch(/LPA Flow.*0\.50/s);
        expect(html).toMatch(/RPA Flow.*2\.50/s);
    });

    test('shows correct split percentages (83% / 17%)', () => {
        calcFontanFlow();
        // RPA/LPA Split: 83% / 17%
        expect(resultHTML()).toMatch(/83%\s*\/\s*17%/);
    });

    test('flags asymmetric distribution', () => {
        calcFontanFlow();
        expect(resultHTML()).toContain('Asymmetric');
    });
});

/* --- Fontan-to-pulmonary ratio --------------------------------- */

describe('Fontan Calculator — Fontan-to-pulmonary ratio classification', () => {
    test('"Good match" when ratio > 0.95', () => {
        setupFontanDOM({
            'fon-ao-net':     '3.0',
            'fon-glenn-net':  '1.5',
            'fon-fontan-net': '2.0',  // total = 3.5
            'fon-lpa-net':    '1.75',
            'fon-rpa-net':    '1.75', // Qp = 3.5  →  ratio = 1.00
        });
        calcFontanFlow();
        expect(resultHTML()).toContain('Good match');
    });

    test('"Acceptable" when ratio is between 0.85 and 0.95', () => {
        // Total caval = 2.7, Qp = 3.0  →  ratio = 0.90
        setupFontanDOM({
            'fon-ao-net':     '3.0',
            'fon-glenn-net':  '1.2',
            'fon-fontan-net': '1.5',
            'fon-lpa-net':    '1.5',
            'fon-rpa-net':    '1.5',
        });
        calcFontanFlow();
        expect(resultHTML()).toContain('Acceptable');
    });

    test('"Underfilled PAs" when ratio < 0.85', () => {
        // Total caval = 2.0, Qp = 3.0  →  ratio ≈ 0.667
        setupFontanDOM({
            'fon-ao-net':     '3.0',
            'fon-glenn-net':  '1.0',
            'fon-fontan-net': '1.0',
            'fon-lpa-net':    '1.5',
            'fon-rpa-net':    '1.5',
        });
        calcFontanFlow();
        expect(resultHTML()).toContain('Underfilled PAs');
    });
});

/* --- Pulmonary collateral flow --------------------------------- */

describe('Fontan Calculator — pulmonary collateral flow', () => {
    test('calculates pulmonary collateral (PV total − PA total)', () => {
        // LPA = 2.0, RPA = 2.0 → Qp = 4.0
        // LPV = 2.5, RPV = 2.5 → total PV = 5.0
        // Collateral = 5.0 - 4.0 = 1.00 L/min
        setupFontanDOM({
            'fon-ao-net':     '4.0',
            'fon-glenn-net':  '2.0',
            'fon-fontan-net': '2.0',
            'fon-lpa-net':    '2.0',
            'fon-rpa-net':    '2.0',
            'fon-lpv-net':    '2.5',
            'fon-rpv-net':    '2.5',
        });
        calcFontanFlow();
        expect(resultHTML()).toMatch(/Pulmonary Collateral.*1\.00/s);
    });

    test('flags "Significant" when collateral > 20% of PA flow', () => {
        // Collateral = 1.0, Qp = 4.0  →  1.0 > 4.0*0.2 = 0.8 → Significant
        setupFontanDOM({
            'fon-ao-net':     '4.0',
            'fon-glenn-net':  '2.0',
            'fon-fontan-net': '2.0',
            'fon-lpa-net':    '2.0',
            'fon-rpa-net':    '2.0',
            'fon-lpv-net':    '2.5',
            'fon-rpv-net':    '2.5',
        });
        calcFontanFlow();
        expect(resultHTML()).toContain('Significant');
    });

    test('does NOT flag "Significant" when collateral ≤ 20% of PA flow', () => {
        // LPV = 2.1, RPV = 2.1 → total PV = 4.2
        // Qp = 4.0  →  collateral = 0.2  →  0.2 < 0.8 → not significant
        setupFontanDOM({
            'fon-ao-net':     '4.0',
            'fon-glenn-net':  '2.0',
            'fon-fontan-net': '2.0',
            'fon-lpa-net':    '2.0',
            'fon-rpa-net':    '2.0',
            'fon-lpv-net':    '2.1',
            'fon-rpv-net':    '2.1',
        });
        calcFontanFlow();
        // Pulmonary Collateral section should appear but not the Significant badge
        const html = resultHTML();
        expect(html).toMatch(/Pulmonary Collateral.*0\.20/s);
        expect(html).not.toContain('Significant');
    });

    test('shows pulmonary vein split percentages', () => {
        // LPV = 1.0, RPV = 3.0 → total = 4.0 → LPV 25%, RPV 75%
        setupFontanDOM({
            'fon-ao-net':     '4.0',
            'fon-glenn-net':  '2.0',
            'fon-fontan-net': '2.0',
            'fon-lpa-net':    '2.0',
            'fon-rpa-net':    '2.0',
            'fon-lpv-net':    '1.0',
            'fon-rpv-net':    '3.0',
        });
        calcFontanFlow();
        expect(resultHTML()).toMatch(/75%\s*\/\s*25%/);
    });
});

/* --- Systemic collateral flow ---------------------------------- */

describe('Fontan Calculator — systemic collateral flow', () => {
    test('calculates systemic collateral (Ao forward − total caval) when > 0', () => {
        // Ao = 4.0, no AR → AoForward = 4.0
        // Glenn = 1.0, Fontan = 2.0 → total caval = 3.0
        // Collateral = 4.0 - 3.0 = 1.0 L/min  (25% of Ao forward → Significant)
        setupFontanDOM({
            'fon-ao-net':     '4.0',
            'fon-glenn-net':  '1.0',
            'fon-fontan-net': '2.0',
            'fon-lpa-net':    '1.5',
            'fon-rpa-net':    '1.5',
        });
        calcFontanFlow();
        expect(resultHTML()).toMatch(/Systemic Collateral.*1\.00/s);
    });

    test('flags systemic collateral as "Significant" when > 15% of Ao forward', () => {
        // 1.0 / 4.0 = 25% > 15%
        setupFontanDOM({
            'fon-ao-net':     '4.0',
            'fon-glenn-net':  '1.0',
            'fon-fontan-net': '2.0',
            'fon-lpa-net':    '1.5',
            'fon-rpa-net':    '1.5',
        });
        calcFontanFlow();
        expect(resultHTML()).toContain('Significant');
    });

    test('does NOT show systemic collateral when total caval ≥ Ao forward', () => {
        // Total caval = 3.5 = Ao forward → collateral = 0 (not shown)
        setupFontanDOM({
            'fon-ao-net':     '3.5',
            'fon-glenn-net':  '1.5',
            'fon-fontan-net': '2.0',
            'fon-lpa-net':    '1.75',
            'fon-rpa-net':    '1.75',
        });
        calcFontanFlow();
        expect(resultHTML()).not.toMatch(/Systemic Collateral/);
    });
});

/* --- Qp:Qs shunt classification ------------------------------- */

describe('Fontan Calculator — Qp:Qs shunt classification', () => {
    function shuntSetup(qp, qs) {
        // Use MPA for Qp and Ao for Qs for simplicity
        setupFontanDOM({
            'fon-ao-net': String(qs),
            'fon-pa-net': String(qp),
            'fon-glenn-net':  '1.5',
            'fon-fontan-net': '1.5',
        });
    }

    test('Qp:Qs > 2.0 → "Large L→R shunt"', () => {
        shuntSetup(6.0, 3.0); // ratio = 2.0 exactly is "Moderate", need > 2.0
        shuntSetup(6.1, 3.0);
        calcFontanFlow();
        expect(resultHTML()).toContain('Large L→R shunt');
    });

    test('Qp:Qs = 1.8 → "Moderate L→R shunt" (threshold is ratio > 1.5)', () => {
        shuntSetup(5.4, 3.0); // ratio = 1.80
        calcFontanFlow();
        expect(resultHTML()).toContain('Moderate L→R shunt');
    });

    test('Qp:Qs = 1.2 → "Small L→R shunt"', () => {
        shuntSetup(3.6, 3.0);
        calcFontanFlow();
        expect(resultHTML()).toContain('Small L→R shunt');
    });

    test('Qp:Qs = 1.0 → "No significant shunt"', () => {
        shuntSetup(3.0, 3.0);
        calcFontanFlow();
        expect(resultHTML()).toContain('No significant shunt');
    });

    test('Qp:Qs = 0.75 → "Small R→L shunt"', () => {
        shuntSetup(2.25, 3.0);
        calcFontanFlow();
        expect(resultHTML()).toContain('Small R→L shunt');
    });

    test('Qp:Qs < 0.7 → "Large R→L shunt" (fenestrated Fontan)', () => {
        shuntSetup(1.8, 3.0); // ratio = 0.60
        calcFontanFlow();
        expect(resultHTML()).toContain('Large R→L shunt');
    });
});

/* --- Range input parsing --------------------------------------- */

describe('Fontan Calculator — range input parsing', () => {
    test('parses "1.4-1.6" as midpoint 1.50', () => {
        setupFontanDOM({
            'fon-ao-net':     '3.5',
            'fon-glenn-net':  '1.4-1.6',  // mid = 1.5
            'fon-fontan-net': '2.0',
            'fon-lpa-net':    '1.75',
            'fon-rpa-net':    '1.75',
        });
        calcFontanFlow();
        // Total caval = 1.5 + 2.0 = 3.50
        expect(resultHTML()).toMatch(/Total Caval Flow.*3\.50/s);
    });

    test('parses en-dash range "1.4–1.6" as midpoint 1.50', () => {
        setupFontanDOM({
            'fon-ao-net':     '3.5',
            'fon-glenn-net':  '1.4\u20131.6', // en-dash
            'fon-fontan-net': '2.0',
            'fon-lpa-net':    '1.75',
            'fon-rpa-net':    '1.75',
        });
        calcFontanFlow();
        expect(resultHTML()).toMatch(/Total Caval Flow.*3\.50/s);
    });
});

/* --- BSA indexing --------------------------------------------- */

describe('Fontan Calculator — BSA indexing', () => {
    test('displays indexed flows (L/min/m²) when height and weight are set', () => {
        // DuBois BSA for 170 cm / 70 kg ≈ 1.81 m²
        // Ao = 3.62 → indexed ≈ 2.00 L/min/m²
        setupFontanDOM({
            'patient-height': '170',
            'patient-weight': '70',
            'fon-ao-net':     '3.62',
            'fon-glenn-net':  '1.5',
            'fon-fontan-net': '2.0',
            'fon-lpa-net':    '1.75',
            'fon-rpa-net':    '1.75',
        });
        calcFontanFlow();
        // Should contain "L/min/m²" somewhere in the results
        expect(resultHTML()).toContain('L/min/m²');
    });

    test('omits indexed flows when height/weight are absent', () => {
        setupFontanDOM({
            'fon-ao-net':     '3.5',
            'fon-glenn-net':  '1.5',
            'fon-fontan-net': '2.0',
            'fon-lpa-net':    '1.75',
            'fon-rpa-net':    '1.75',
        });
        calcFontanFlow();
        expect(resultHTML()).not.toContain('L/min/m²');
    });
});

/* --- Regurgitation --------------------------------------------- */

describe('Fontan Calculator — AV valve regurgitation', () => {
    // HR required for mL/beat → L/min conversion
    const HR = 75;

    test('mild AR: RF < 20%', () => {
        // Ao net = 4.0, AR vol = 5 mL/beat → arFlow = 5*75/1000 = 0.375 L/min
        // AoForward = 4.0 + 0.375 = 4.375  →  RF = 0.375/4.375 = 8.6%  →  Mild
        setupFontanDOM({
            'flow-hr':        String(HR),
            'fon-ao-net':     '4.0',
            'fon-glenn-net':  '2.0',
            'fon-fontan-net': '2.0',
            'fon-lpa-net':    '2.0',
            'fon-rpa-net':    '2.0',
            'fon-ar-vol':     '5',
        });
        calcFontanFlow();
        const html = resultHTML();
        expect(html).toContain('Aortic Regurgitation');
        expect(html).toContain('Mild');
    });

    test('severe AR: RF ≥ 40%', () => {
        // Ao net = 3.0, AR vol = 40 mL/beat → arFlow = 40*75/1000 = 3.0 L/min
        // AoForward = 3.0 + 3.0 = 6.0  →  RF = 3.0/6.0 = 50%  →  Severe
        setupFontanDOM({
            'flow-hr':        String(HR),
            'fon-ao-net':     '3.0',
            'fon-glenn-net':  '1.5',
            'fon-fontan-net': '1.5',
            'fon-lpa-net':    '1.5',
            'fon-rpa-net':    '1.5',
            'fon-ar-vol':     '40',
        });
        calcFontanFlow();
        const html = resultHTML();
        expect(html).toContain('Aortic Regurgitation');
        expect(html).toContain('Severe');
    });

    test('MR calculation from LVSV − AoForward when MR not directly entered', () => {
        // LVSV = 80 mL/beat, Ao = 4.0 L/min, HR = 75
        // AoForward = 4.0 L/min = 4000/75 ≈ 53.3 mL/beat
        // MR = 80 - 53.3 = 26.7 mL/beat → mrFlow = 26.7*75/1000 = 2.0 L/min
        // mrRf = 2.0 / (4.0 + 2.0) * 100 = 33.3% → Moderate
        setupFontanDOM({
            'flow-hr':        String(HR),
            'fon-ao-net':     '4.0',
            'fon-glenn-net':  '2.0',
            'fon-fontan-net': '2.0',
            'fon-lpa-net':    '2.0',
            'fon-rpa-net':    '2.0',
            'fon-lvsv':       '80',
        });
        calcFontanFlow();
        const html = resultHTML();
        expect(html).toContain('Mitral Regurgitation');
        expect(html).toContain('Moderate');
    });
});

/* --- MPA fallback --------------------------------------------- */

describe('Fontan Calculator — MPA vs LPA+RPA', () => {
    test('uses MPA net when LPA/RPA not entered', () => {
        setupFontanDOM({
            'fon-ao-net':     '3.5',
            'fon-pa-net':     '3.5',
            'fon-glenn-net':  '1.5',
            'fon-fontan-net': '2.0',
        });
        calcFontanFlow();
        expect(resultHTML()).toMatch(/PA Flow.*3\.50/s);
    });

    test('prefers LPA+RPA sum over MPA when both entered', () => {
        // LPA + RPA = 1.6 + 1.9 = 3.5, MPA entered as 3.0 (should be ignored for Qp)
        setupFontanDOM({
            'fon-ao-net':     '3.5',
            'fon-pa-net':     '3.0',
            'fon-lpa-net':    '1.6',
            'fon-rpa-net':    '1.9',
            'fon-glenn-net':  '1.5',
            'fon-fontan-net': '2.0',
        });
        calcFontanFlow();
        // Qp:Qs should be based on 3.50 / 3.50 = 1.00
        expect(resultHTML()).toMatch(/Qp:Qs.*1\.00/s);
    });
});
