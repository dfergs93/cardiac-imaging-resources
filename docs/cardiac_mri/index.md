---
title: Cardiac MRI — Overview & Sequences
---

# Cardiac MRI — Overview & Sequences

Overview of commonly used cardiac MRI sequences, their key purposes, and acquisition parameters.

---

## Common Cardiac MRI Sequences

| Sequence | Type | Primary Purpose | Key Parameters |
|----------|------|-----------------|----------------|
| **Cine SSFP** | bSSFP (bright blood) | Ventricular function, morphology, valve motion | 25–35 phases, 6–8 mm slice, breath-hold, retrospective ECG gating |
| **LGE** | IR-GRE | Myocardial scar, fibrosis, infiltration | TI scout first (null normal myocardium); ~10–15 min post-Gd |
| **T1 MOLLI** | LL (Look-Locker) | T1 mapping → ECV calculation | Native + post-contrast; 5(3)3 or 5(3b)3 scheme |
| **T1 ShMOLLI** | Modified LL | T1 mapping (shorter BH) | Less accurate at long T1 |
| **T1 SASHA** | Saturation-recovery | T1 mapping — heart rate independent | Longer BH; reference at 3T |
| **T2 Mapping** | T2-prepared bSSFP | Edema (myocarditis, acute MI) | Normal ~45–55 ms at 1.5T |
| **T2 STIR / T2 BB** | BB-TSE | Edema, masses, pericarditis | |
| **T2\*** | Multi-echo GRE | Iron overload quantification | Normal T2* >20 ms; severe <10 ms |
| **4D Flow** | PC-VIPR or Cartesian | Flow in all vessels; WSS; shunt quantification | Long acquisition (10–20 min), retrospective |
| **2D Phase Contrast** | Velocity-encoded GRE | Flow quantification at specific vessels | Set VENC 10–20% above expected peak velocity |
| **Perfusion (first-pass)** | T1w SSFP or GRE | Ischemia detection; rest+stress | 0.075–0.1 mmol/kg Gd; 3 SAX slices + long axis |
| **Black Blood (HASTE)** | SE EPI | Morphology, vessel anatomy, masses | Single-shot; good for rapid survey |
| **Dark Blood TSE** | IR-TSE | Vessel wall, pericardium, masses | Better SNR than HASTE; longer |
| **Tagging (DENSE/SENC)** | Grid or spectral | Myocardial strain | Circumferential strain normal ~ −20 to −25% |

---

## Normal Reference Values

### LV (Biplane Simpson or 3D)

| Parameter | Male | Female |
|-----------|------|--------|
| EDVi (mL/m²) | 62–96 | 54–82 |
| ESVi (mL/m²) | 21–40 | 17–36 |
| EF (%) | 57–75 | 57–75 |
| Mass index (g/m²) | 50–88 | 38–70 |

### RV (Axial stack or SAX)

| Parameter | Male | Female |
|-----------|------|--------|
| EDVi (mL/m²) | 74–108 | 58–98 |
| ESVi (mL/m²) | 25–50 | 18–45 |
| EF (%) | 52–69 | 55–72 |

### T1 / T2 Normal Ranges (field-strength dependent)

| Sequence | 1.5T (ms) | 3T (ms) |
|----------|-----------|---------|
| Native T1 (MOLLI) | 950–1050 | 1150–1280 |
| Post-Gd T1 | 350–550 | 350–550 |
| T2 mapping | 45–55 | 45–55 |
| T2* (iron) | >20 (normal) | >20 (normal) |

---

## Troubleshooting

!!! tip "Cardiac Anesthesia"
    - 4 cardiac issues that will make anesthetists stressed if you ask them to do a study under GA:
    - Severe aortic stenosis
    - Pulmonary Hypertension
    - Severe LV heart failure
    - Arrhythmia (ventricular)

!!! tip "Motion Artifacts (ghosting)"
    - Arrhythmia: switch to real-time cine (lower resolution but no ECG issues)
    - Breathing: use free-breathing with navigator; check patient coaching
    - Cine ghosting: check VENC if using velocity-encoded sequence; check shimming

!!! tip "LGE — Wrong TI"
    Always run a TI scout after gadolinium dosing. Re-run if myocardium not nulled (appears bright on PSIR inversion images).

!!! tip "Banding Artifacts (bSSFP)"
    Banding from B₀ inhomogeneity: re-shim, or switch to 1.5T equivalent (spoiled GRE / FIESTA at off-resonance range). More problematic at 3T.

!!! tip "4D Flow Quality Check"
    - Velocity aliasing: increase VENC (but SNR decreases)
    - Flow inconsistencies: SVC + IVC should ≈ PA; Ao ≈ PA in normal hearts
    - Check background phase correction in post-processing software

---

## Standard Views

| View | Prescription | Content |
|------|-------------|---------|
| 4-chamber (4CH) | From axial showing RA/LA/RV/LV | All four chambers; mitral and tricuspid valves |
| 2-chamber (2CH) | Perpendicular to 4CH through LV | LA, LV, mitral valve |
| 3-chamber (3CH) | LVOT view | LV, LVOT, aortic valve; rules out LVOTO |
| Short axis (SAX) | Perpendicular to LV long axis | Stack base to apex for volumetry |
| RVOT | Free-hand, right-heart focus | PA, pulmonic valve, RVOT |
| Coronal / Oblique sag | Free-hand | Aorta, PA, aortic arch, great vessels |
