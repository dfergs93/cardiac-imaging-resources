---
title: Simplified Bernoulli
hide:
  -toc
---

# Simplified Bernoulli

Convert between peak velocity and pressure gradient using the simplified Bernoulli equation.

**Formula:** \(\Delta P = 4 V_{max}^2\)

---

<div class="calc-card">
  <div class="calc-header bern-header">
    <div>
      <h2>Velocity ↔ Pressure Gradient</h2>
    </div>
  </div>
  <div class="calc-body">
    <div class="bern-input-row">
      <div class="bern-input-group">
        <label>Peak Velocity (m/s)</label>
        <input type="number" id="bern-vmax" min="0.1" max="10" step="0.01" placeholder="4.2">
      </div>
      <div class="bern-input-spacer">↔</div>
      <div class="bern-input-group">
        <label>Pressure Gradient (mmHg)</label>
        <input type="number" id="bern-pg" min="0" max="400" step="0.1" placeholder="70.6">
      </div>
    </div>
  </div>
</div>

---

## Stenosis Grading

<div class="bern-tabs-container">
  <div class="bern-tabs">
    <button class="bern-tab-btn active" data-tab="aortic">Aortic</button>
    <button class="bern-tab-btn" data-tab="mitral">Mitral</button>
    <button class="bern-tab-btn" data-tab="pulmonic">Pulmonary</button>
    <button class="bern-tab-btn" data-tab="tricuspid">Tricuspid</button>
  </div>

  <div class="bern-tab-content active" id="bern-tab-aortic">
    <table>
      <thead>
        <tr>
          <th>Severity</th>
          <th>Valve Area (cm²)</th>
          <th>V<sub>max</sub> (m/s)</th>
          <th>Peak Gradient (mmHg)</th>
          <th>Mean Gradient (mmHg)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Normal</td>
          <td>≥2.0</td>
          <td>&lt;2.0</td>
          <td>&lt;10</td>
          <td>&lt;5</td>
        </tr>
        <tr>
          <td>Mild</td>
          <td>1.6–2.0</td>
          <td>2.0–2.9</td>
          <td>16–36</td>
          <td>&lt;25</td>
        </tr>
        <tr>
          <td>Moderate</td>
          <td>1.0–1.5</td>
          <td>3.0–3.9</td>
          <td>36–64</td>
          <td>25–40</td>
        </tr>
        <tr>
          <td>Severe</td>
          <td>&lt;1.0 or indexed &lt;0.6</td>
          <td>≥4.0</td>
          <td>≥64</td>
          <td>≥40</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="bern-tab-content" id="bern-tab-mitral">
    <table>
      <thead>
        <tr>
          <th>Severity</th>
          <th>MVA (cm²)</th>
          <th>Mean Gradient (mmHg)</th>
          <th>PAP (mmHg)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Normal</td>
          <td>&gt;2.0</td>
          <td>--</td>
          <td>--</td>
        </tr>
        <tr>
          <td>Mild</td>
          <td>1.5–2.0</td>
          <td>&lt;5</td>
          <td>&lt;30</td>
        </tr>
        <tr>
          <td>Moderate</td>
          <td>1.0–1.5</td>
          <td>5–10</td>
          <td>30–50</td>
        </tr>
        <tr>
          <td>Severe</td>
          <td>&lt;1.0</td>
          <td>&gt;10</td>
          <td>&gt;50</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="bern-tab-content" id="bern-tab-pulmonic">
    <table>
      <thead>
        <tr>
          <th>Severity</th>
          <th>Peak Gradient (mmHg)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Normal</td>
          <td>&lt;10</td>
        </tr>
        <tr>
          <td>Mild</td>
          <td>10–36</td>
        </tr>
        <tr>
          <td>Moderate</td>
          <td>36–64</td>
        </tr>
        <tr>
          <td>Severe</td>
          <td>&gt;64</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="bern-tab-content" id="bern-tab-tricuspid">
    <table>
      <thead>
        <tr>
          <th>Category</th>
          <th>Mean Gradient (mmHg)</th>
          <th>Valve Area (cm²)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Hemodynamically Significant</td>
          <td>&gt;5</td>
          <td>&lt;1.0</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
