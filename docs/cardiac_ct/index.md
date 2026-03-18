---
title: Cardiac CT
---

# Cardiac CT

Scanning protocols for cardiac CT are maintained in the **[Radiology Protocol Manager](https://dfergs93.github.io/radiology-protocols/ct/cardiac)**. This page covers general protocol requirements, acquisition considerations, and troubleshooting pearls.

---

## General Protocol Requirements

### Patient Preparation

| Requirement | Target | Notes |
|-------------|--------|-------|
| Heart rate | **≤60–65 bpm** (step-and-shoot); **≤70 bpm** (helical) | Lower HR reduces motion artifact and radiation dose |
| Beta-blocker | Metoprolol 50–100 mg PO (1 hr pre) or IV 5–15 mg | Hold if HR already <55, symptomatic bradycardia, or severe bronchospasm |
| Nitroglycerin | 0.4 mg SL ~5 min before scan | Coronary vasodilation; hold if SBP <90 mmHg or recent phosphodiesterase inhibitor use |
| IV access | 18–20 G antecubital (right preferred) | Left antecubital → streak from SVC; avoid if possible |
| Breath-hold | ~5–10 s end-inspiration | Pre-scan practice; supplemental O₂ may help |
| Creatinine / eGFR | eGFR ≥30 mL/min/1.73 m² | Below threshold: hydration, minimize contrast volume, consider hold of nephrotoxins |

### Scan Modes

| Mode | Best For | Typical HR Requirement | Radiation |
|------|----------|----------------------|-----------|
| **Prospective step-and-shoot** | CCTA, most structural | ≤65 bpm, regular rhythm | Lowest |
| **Retrospective helical (full-cycle)** | Device planning (neo-LVOT, dynamic annular sizing), wall motion | Any HR; AF acceptable | Higher — use tube current modulation |
| **High-pitch helical (Flash)** | Coronaries, low HR | ≤60 bpm, regular | Very low dose |
| **Calcium scoring** | CAC quantification | Any | Very low |

### Contrast Protocol

| Parameter | Typical Value | Notes |
|-----------|--------------|-------|
| Concentration | 300–370 mgI/mL | Higher concentration improves attenuation at lower volumes |
| Volume | 60–100 mL (weight-based ~1–1.5 mL/kg) | Minimize for renal insufficiency |
| Injection rate | 4–6 mL/s | Higher rate for structural CT (coronary opacification) |
| Saline chaser | 40–50 mL at same rate | Reduces streak artifact, flushes contrast bolus |
| Timing | Bolus tracking (ROI in aorta; threshold 100–120 HU) or test bolus | Bolus tracking preferred for consistency |

!!! tip "Biphasic / Triphasic Injection"
    For structural valve CT (TMVR, TTVR) where simultaneous right and left heart opacification is needed, use a **triphasic** protocol: (1) full contrast, (2) 50:50 contrast/saline mix for right heart opacification, (3) saline flush. Adjust timing to the clinical question.

---

## Coronary CT Angiography (CCTA)

### CAD-RADS 2.0 Reporting

| CAD-RADS | Stenosis | Recommendation |
|----------|----------|----------------|
| 0 | No stenosis | No CAD |
| 1 | 1–24% | Minimal, non-obstructive |
| 2 | 25–49% | Mild, non-obstructive |
| 3 | 50–69% | Moderate — functional testing recommended |
| 4A | 70–99% (1–2 vessels) | Severe — ICA or FFR-CT |
| 4B | 70–99% (LM or 3-vessel) | Severe — heart team |
| 5 | Total occlusion | |
| N | Non-diagnostic segment | |

**Modifiers:** `+HRP` (high-risk plaque), `+S` (stent), `+G` (graft), `+E` (exception), `+I` (ischemia)

!!! tip "High-Risk Plaque Features"
    Low attenuation plaque (<30 HU), positive remodeling (RI >1.1), napkin-ring sign, spotty calcification

---

## Pericardial Disease

| Feature | CT Finding |
|---------|-----------|
| Pericardial thickening | >3–4 mm (normally ≤2 mm) |
| Calcification | Suggests constrictive pericarditis |
| Effusion | Simple (<30 HU) vs. complex/hemorrhagic |
| Constrictive physiology | Septal bounce on retrospective cine |

---

## Troubleshooting

### Motion Artifact

| Cause | Solution |
|-------|---------|
| Heart rate too high | Administer additional beta-blocker; re-scan if feasible |
| Irregular rhythm (AF, ectopy) | Switch to retrospective helical with multisegment reconstruction; use wider padding windows |
| Poor breath-hold | Shorter breath-hold protocol; supplemental O₂; patient coaching |
| Respiratory motion (diaphragm) | Re-scan; increase table speed; adjust breath-hold instruction |

### Contrast Issues

| Problem | Cause | Fix |
|---------|-------|-----|
| Poor aortic enhancement (<250 HU) | Mistimed bolus, low output, slow injection | Re-time with test bolus; increase injection rate or contrast volume |
| Right heart opacification inadequate (structural CT) | Standard left-heart timing | Use biphasic/triphasic injection; increase delay or add right-heart phase |
| Streak artifact from contrast in SVC | Left antecubital access, high concentration in SVC | Use right arm; add saline dilution mix; delay scan start |
| Contrast extravasation | IV infiltration | Abort scan; assess extent; reschedule |
| Contrast reaction | Allergy / prior reaction | Pre-medicate per institutional protocol; have emergency equipment available |

### Image Quality

| Problem | Likely Cause | Solution |
|---------|-------------|---------|
| Blooming from calcium / stents | Beam hardening | Use sharper reconstruction kernel; increase kV; iterative reconstruction |
| Noise / grainy images | Low tube current or high BMI | Increase mAs (or kVp); use iterative reconstruction |
| Banding artifact (helical) | Pitch-HR mismatch | Adjust pitch or use multi-sector reconstruction |
| Mis-registration (coronary snap) | Variable heart rate during helical scan | Retrospective gating with wider reconstruction window; manual phase selection |

---

## Reporting Checklist

=== "CCTA"
    - [ ] Coronary dominance
    - [ ] Proximal, mid, distal segments for each vessel
    - [ ] CAD-RADS classification + modifiers
    - [ ] Non-cardiac findings (lungs, mediastinum, liver)

=== "Structural / Device Planning"
    - [ ] Confirm adequate phase coverage (retrospective full-cycle)
    - [ ] Confirm adequate right and left heart opacification (if applicable)
    - [ ] Document annular measurements in correct cardiac phase
    - [ ] Assess vascular access route
    - [ ] Note any incidental findings
