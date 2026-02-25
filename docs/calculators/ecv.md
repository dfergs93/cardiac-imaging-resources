---
title: ECV Calculator
hide:
  - toc
---

# ECV Calculator

Extracellular volume fraction from T1 mapping — requires pre- and post-contrast MOLLI (or ShMOLLI) and hematocrit.

---

<div class="calc-card">
  <div class="calc-header ecv-header">
    <div>
      <h2>ECV from T1 Mapping</h2>
      <p>Extracellular volume fraction from pre- and post-contrast MOLLI — requires hematocrit</p>
    </div>
  </div>
  <div class="calc-body">
    <div class="calc-input-stack">
      <div class="input-row">
        <label>Hematocrit (%)</label>
        <input type="number" id="ecv-hct" min="1" max="70" step="1" placeholder="e.g. 40">
      </div>
      <div class="input-row separator-row"></div>
      <div class="input-row">
        <label>Pre-Gd T1 — Myo (ms)</label>
        <input type="number" id="ecv-t1pre-myo" min="500" max="2000" step="1" placeholder="e.g. 1000">
      </div>
      <div class="input-row">
        <label>Pre-Gd T1 — Blood (ms)</label>
        <input type="number" id="ecv-t1pre-blood" min="500" max="3000" step="1" placeholder="e.g. 1700">
      </div>
      <div class="input-row separator-row"></div>
      <div class="input-row">
        <label>Post-Gd T1 — Myo (ms)</label>
        <input type="number" id="ecv-t1post-myo" min="100" max="1500" step="1" placeholder="e.g. 550">
      </div>
      <div class="input-row">
        <label>Post-Gd T1 — Blood (ms)</label>
        <input type="number" id="ecv-t1post-blood" min="50" max="1000" step="1" placeholder="e.g. 350">
      </div>
    </div>
    <div class="calc-result" id="ecv-result">
      <p class="calc-placeholder">Enter all T1 values and hematocrit to calculate ECV.</p>
    </div>
  </div>
</div>

---

## Reference

**Formula:** \(ECV = (1 - Hct) \times \frac{\Delta R1_{myo}}{\Delta R1_{blood}}\) where \(\Delta R1 = \frac{1}{T1_{post}} - \frac{1}{T1_{pre}}\)

| ECV (%) | Interpretation | Clinical Context |
|---------|----------------|-----------------|
| <30 | **Normal** | Normal extracellular matrix |
| 30–32 | **Borderline** | Correlate with clinical context |
| 32–40 | **Elevated** | Diffuse fibrosis / edema |
| >40 | **Markedly Elevated** | Consider amyloid or severe fibrosis |

!!! tip "Measurement Tips"
    - Use the **same 3 slices** (base/mid/apex) for pre- and post-contrast MOLLI — identical slice positions matter
    - **Blood pool T1** measured from a ROI in the LV cavity (avoid trabeculae)
    - Gadolinium should fully equilibrate before post-Gd MOLLI — ideally **≥10 min** post-injection
    - Hematocrit from **same-day** labs; point-of-care Hct is acceptable
    - At **1.5T**: native T1 ~950–1050 ms (myo), ~1600–1750 ms (blood); at **3T**: ~1150–1300 ms (myo), ~1800–2000 ms (blood)
