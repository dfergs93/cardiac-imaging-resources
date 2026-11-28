---
title: Cardiac CT
---

# Cardiac CT

!!! danger "Parts of this page are wrong: do not use them for patient management (notice, 27 November 2026)"
    A check against CAD-RADS 2.0 and the CAR/CSTR 2024 cardiac CT guidelines found errors that could change management:

    - **CAD-RADS 0** is no plaque and no stenosis. Plaque without stenosis, including positively remodelled plaque, is CAD-RADS 1.
    - **CAD-RADS 3** (50–69%): consider functional assessment (CT-FFR, CT perfusion or stress testing); with ischaemia, consider invasive angiography. Functional testing is not "recommended".
    - **CAD-RADS 4A** (70–99% in one or two vessels, without left main or three-vessel disease): consider invasive angiography or functional assessment; angiography is favoured with a stenosis over 90%, high-risk plaque or ischaemia.
    - **CAD-RADS 4B** is a left main stenosis of 50% or more, or three-vessel obstructive (70% or more) disease, and invasive angiography is recommended. On this page a 50–69% left main stenosis falls into category 3.
    - **CAD-RADS N** applies only when no interpretable segment has a stenosis of 50% or more; otherwise grade the worst stenosis and add /N. Obstructive disease cannot then be excluded, and further evaluation may be needed.
    - **Plaque burden (P1–P4)**, which sets the management of categories 1 and 2, is missing, and the recommendations given are those for stable chest pain; acute chest pain has its own (CAD-RADS 2.0, Table 5).
    - **High-risk plaque (HRP)** is coded only when one plaque shows two or more of the four features.
    - **After a prior contrast reaction**, CAR/CSACI 2025 advises a different contrast agent, without steroid premedication. **Extravasation:** stop the injection, examine and elevate the limb, apply cold compresses and give discharge instructions; ask for a surgical consultation on the warning signs in the ACR Manual.

    Sources: [CAD-RADS 2.0](https://doi.org/10.1148/ryct.220183), [CAR/CSTR 2024 Part 1](https://doi.org/10.1177/08465371241233240), [CAR/CSACI 2025](https://car.ca/wp-content/uploads/2025/05/CAR_CSACI-Practice-Guidance-for-Contrast-Media-Hypersensitivity_2025.pdf) and the [ACR Manual on Contrast Media](https://www.acr.org/Clinical-Resources/Clinical-Tools-and-Reference/Contrast-Manual).

Scanning protocols for cardiac CT are maintained in the **[Radiology Protocol Manager](https://dfergs93.github.io/radiology-protocols/ct/cardiac)**. This page covers general protocol requirements, acquisition considerations, and troubleshooting pearls.

## Coronary CT Angiography (CCTA)

### CAD-RADS 2.0 Reporting

!!! danger "Out of date: see the notice at the top of this page"


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

!!! danger "Out of date: see the notice at the top of this page"


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
