---
title: Cardiac CT
---

# Cardiac CT

Scanning protocols for cardiac CT are maintained in the **[Radiology Protocol Manager](https://dfergs93.github.io/radiology-protocols/ct/cardiac)**. This page covers general protocol requirements, acquisition considerations, and troubleshooting pearls.

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
| Right heart opacification inadequate (structural CT) | Standard left-heart timing | Use longer contrast bolus add a delay phase |
| Streak artifact from contrast in SVC | Left antecubital access, high concentration in SVC | Use right arm; add saline dilution mix; delay scan start |
| Contrast extravasation | IV infiltration | Abort scan; assess extent; reschedule |
| Contrast reaction | Allergy / prior reaction | Pre-medicate per institutional protocol; have emergency equipment available |

### Image Quality

| Problem | Likely Cause | Solution |
|---------|-------------|---------|
| Blooming from calcium / stents | Beam hardening | Use sharper reconstruction kernel; increase kV; iterative reconstruction |
| Noise / grainy images | Low tube current or high BMI | Increase mAs (or kVp); widen gating window; use iterative reconstruction |
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
