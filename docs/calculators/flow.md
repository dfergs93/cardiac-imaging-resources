---
title: 4D Flow Analysis
hide:
  - toc
---

# 4D Flow Analysis

Enter measurements from 4D Flow MRI or 2D Phase Contrast. All inputs in L/min. Supports ranges (e.g. `4.5-4.9`).

---

<div class="calc-card flow-full-card">
  <div class="calc-header flow-header">
    <div>
      <h2>Phase Contrast Flow Analysis</h2>
      <p>Net flow is primary input. Optional regurgitant volumes calculate RF%.</p>
    </div>
  </div>

  <!-- PATIENT PARAMETERS - COMPACT -->
  <details class="flow-patient-params-section">
    <summary>Patient Parameters <span class="optional">(optional)</span></summary>
    <div class="flow-patient-params">
      <div class="flow-params-row">
        <div class="input-row compact">
          <label>Height (cm)</label>
          <input type="number" id="patient-height" min="100" max="220" placeholder="170">
        </div>
        <div class="input-row compact">
          <label>Weight (kg)</label>
          <input type="number" id="patient-weight" min="20" max="250" placeholder="70">
        </div>
        <div class="input-row compact">
          <label>Heart Rate (bpm)</label>
          <input type="number" id="flow-hr" min="30" max="200" placeholder="70">
        </div>
        <div class="input-row compact">
          <label>BSA (m²)</label>
          <div class="auto-value" id="bsa-display">—</div>
        </div>
      </div>
    </div>
  </details>

  <!-- TABS -->
  <div class="flow-tabs">
    <button class="flow-tab-btn active" data-tab="standard">Standard Circulation</button>
    <button class="flow-tab-btn" data-tab="fontan">Fontan Circulation</button>
  </div>

  <!-- ===== STANDARD TAB ===== -->
  <div id="flow-tab-standard" class="flow-tab-content active">
      <div class="flow-calc-container">
          <!-- LEFT COLUMN: INPUTS -->
          <div class="flow-inputs-section">
              <h3>Vessel Flows (L/min)</h3>
              <div class="input-group">
                  <label for="std-ao-net">Aorta (net)</label>
                  <input type="text" id="std-ao-net" class="flow-input" placeholder="e.g., 4.5 or 4.2-4.8">
              </div>
              <div class="input-group">
                  <label for="std-pa-net">Main PA (net)</label>
                  <input type="text" id="std-pa-net" class="flow-input" placeholder="Optional if LPA+RPA entered">
              </div>
              <div class="input-group">
                  <label for="std-lpa-net">LPA</label>
                  <input type="text" id="std-lpa-net" class="flow-input">
              </div>
              <div class="input-group">
                  <label for="std-rpa-net">RPA</label>
                  <input type="text" id="std-rpa-net" class="flow-input">
              </div>
              <h3>Regurgitation (optional)</h3>
              <div class="input-group">
                  <label for="std-regurg-units">Units</label>
                  <select id="std-regurg-units">
                      <option value="mlbeat">mL/beat</option>
                      <option value="lmin">L/min</option>
                  </select>
              </div>
              <div class="input-row">
                  <div class="input-group">
                      <label for="std-ar-vol">Aortic</label>
                      <input type="number" id="std-ar-vol" class="flow-input" step="0.1">
                  </div>
                  <div class="input-group">
                      <label for="std-mr-vol">Mitral</label>
                      <input type="number" id="std-mr-vol" class="flow-input" step="0.1">
                  </div>
              </div>
              <div class="input-row">
                  <div class="input-group">
                      <label for="std-pr-vol">Pulmonic</label>
                      <input type="number" id="std-pr-vol" class="flow-input" step="0.1">
                  </div>
                  <div class="input-group">
                      <label for="std-tr-vol">Tricuspid</label>
                      <input type="number" id="std-tr-vol" class="flow-input" step="0.1">
                  </div>
              </div>
          </div>
          <!-- RIGHT COLUMN: RESULTS -->
          <div class="flow-results-wrapper">
              <div id="flow-std-result">
                  <p class="calc-placeholder">Enter vessel flows to compute results.</p>
              </div>
          </div>
      </div>
  </div>

  <!-- ===== FONTAN TAB ===== -->
  <div id="flow-tab-fontan" class="flow-tab-content">
      <div class="flow-calc-container">
          <!-- LEFT COLUMN: INPUTS -->
          <div class="flow-inputs-section">
              <h3>Systemic & Caval Flows (L/min)</h3>
              <div class="input-group">
                  <label for="fon-ao-net">Aorta (net)</label>
                  <input type="text" id="fon-ao-net" class="fontan-input">
              </div>
              <div class="input-group">
                  <label for="fon-glenn-net">Glenn/SVC</label>
                  <input type="text" id="fon-glenn-net" class="fontan-input">
              </div>
              <div class="input-group">
                  <label for="fon-fontan-net">Fontan conduit/IVC</label>
                  <input type="text" id="fon-fontan-net" class="fontan-input">
              </div>
              <h3>Pulmonary Flows (L/min)</h3>
              <div class="input-group">
                  <label for="fon-pa-net">Main PA (net)</label>
                  <input type="text" id="fon-pa-net" class="fontan-input" placeholder="Optional if LPA+RPA entered">
              </div>
              <div class="input-row">
                  <div class="input-group">
                      <label for="fon-lpa-net">LPA</label>
                      <input type="text" id="fon-lpa-net" class="fontan-input">
                  </div>
                  <div class="input-group">
                      <label for="fon-rpa-net">RPA</label>
                      <input type="text" id="fon-rpa-net" class="fontan-input">
                  </div>
              </div>
              <div class="input-row">
                  <div class="input-group">
                      <label for="fon-lpv-net">LPV</label>
                      <input type="text" id="fon-lpv-net" class="fontan-input">
                  </div>
                  <div class="input-group">
                      <label for="fon-rpv-net">RPV</label>
                      <input type="text" id="fon-rpv-net" class="fontan-input">
                  </div>
              </div>
              <h3>Regurgitation (optional)</h3>
              <div class="input-group">
                  <label for="fon-regurg-units">Units</label>
                  <select id="fon-regurg-units">
                      <option value="mlbeat">mL/beat</option>
                      <option value="lmin">L/min</option>
                  </select>
              </div>
              <div class="input-row">
                  <div class="input-group">
                      <label for="fon-ar-vol">Aortic</label>
                      <input type="number" id="fon-ar-vol" class="fontan-input" step="0.1">
                  </div>
                  <div class="input-group">
                      <label for="fon-mr-vol">Mitral</label>
                      <input type="number" id="fon-mr-vol" class="fontan-input" step="0.1">
                  </div>
              </div>
              <div class="input-row">
                  <div class="input-group">
                      <label for="fon-pr-vol">Pulmonary</label>
                      <input type="number" id="fon-pr-vol" class="fontan-input" step="0.1">
                  </div>
                  <div class="input-group">
                      <label for="fon-tr-vol">Tricuspid</label>
                      <input type="number" id="fon-tr-vol" class="fontan-input" step="0.1">
                  </div>
              </div>
          </div>
          <!-- RIGHT COLUMN: RESULTS -->
          <div class="flow-results-wrapper">
              <div id="flow-fontan-result">
                  <p class="calc-placeholder">Enter Fontan circuit flows to compute results.</p>
              </div>
          </div>
      </div>
  </div>
</div>

---