---
title: Congenital / 4D Flow Protocol
---

# Congenital / 4D Flow Protocol

**Indications:** Congenital heart disease (ASD, VSD, TOF, TGA, Fontan, coarctation), shunt quantification, valvular flow (AR/PR from CMR), vessel stenosis assessment.

---

## Sequence Order

| # | Sequence | View | Notes |
|---|----------|------|-------|
| 1 | Localizers | 3-plane | |
| 2 | **Dark blood HASTE** | Axial stack (thorax) | Situs, connections, great vessel relationships |
| 3 | **Dark blood HASTE** | Coronal / oblique sagittal | Aortic arch, PA, SVC/IVC anatomy |
| 4 | **Cine SSFP** | 4CH, 2CH, 3CH | LV/RV function; AV valve regurgitation |
| 5 | **Cine SSFP** | SAX stack (LV) | LV volumetry and wall motion |
| 6 | **Cine SSFP** | SAX stack (RV-focused if needed) | RV volumetry; free wall |
| 7 | **Cine SSFP** | RVOT, LVOT, aortic arch, PA bifurcation | Site-specific cines for stenosis and morphology |
| 8 | **2D Phase Contrast** | Perpendicular to Ao, PA, LPA, RPA | Flow quantification; Qp:Qs |
| 9 | **4D Flow** | Volume covering heart and great vessels | Replaces 2D PC if available; post-process for all vessels |
| 10 | LGE (if Gd given) | SAX + LAX | RV insertion points; fibrosis in systemic RV |

!!! note "2D PC vs. 4D Flow"
    2D PC is faster and works well when you know the specific vessels to measure. 4D flow allows retrospective plane placement and WSS/visualization — better for complex anatomy or when vessels are uncertain.

---

## Phase Contrast (2D PC) — Practical Tips

- **VENC:** Set 10–20% above expected peak velocity. Aliasing artifacts = increase VENC. Too high VENC = poor SNR.
  - Typical: Ao ~150–180 cm/s, PA ~100–130 cm/s, SVC ~60–80 cm/s
- **Plane placement:** Perpendicular to vessel long axis; avoid turbulence zones (place 1–2 cm from valve)
- **Background phase correction:** Apply in post-processing if available (e.g., use stationary tissue outside vessel)

---

## Qp:Qs Calculation

Standard: \(\frac{Qp}{Qs} = \frac{\text{PA net flow}}{\text{Ao net flow}}\)

If LPA + RPA measured: use sum as Qp.

Use the **[4D Flow Calculator](../../calculators/index.md)** on the Calculators page.

### Regurgitant Fraction

\(RF = \frac{\text{Backward flow}}{\text{Forward flow}} \times 100\%\)

| RF | Severity |
|----|----------|
| <20% | Trivial/Mild |
| 20–39% | Moderate |
| ≥40% | Severe |

---

## Key Reporting Elements

- **Situs and connections:** Situs (solitus/inversus/ambiguous), visceroatrial concordance, AV and ventriculoarterial concordance
- **Shunts:** Qp:Qs, shunt direction, size of defect on cine
- **Biventricular function:** EDVi, EF for both ventricles (BSA-indexed)
- **Flow measurements:** Net flows (mL/beat) for Ao, PA, LPA, RPA; RF for pulmonary regurgitation
- **Stenosis:** Gradient by modified Bernoulli from peak PC velocity
- **LPA:RPA ratio:** Normal ~55:45; >60:40 = asymmetric flow (branch PA stenosis)
- **Collateral flow (Fontan):** Qp − Fontan flow; >20% suggests significant aortopulmonary collaterals

---

## Reporting Template (CHD)

```
TECHNIQUE: CMR [with/without] gadolinium on [X]T scanner.
Morphologic cine and flow assessment performed.

SITUS AND CONNECTIONS:
Situs [solitus/inversus]. [AV concordance/discordance]. [VA concordance/discordance].
[Describe septal defects, shunts, outflow tract abnormalities]

VENTRICULAR FUNCTION:
LV: EDVi XX mL/m², EF XX%. [Normal/Dilated/Hypertrophied]
RV: EDVi XX mL/m², EF XX%. [Normal/Dilated]

FLOW ANALYSIS:
Ao net flow: XX mL/beat. PA net flow: XX mL/beat.
Qp:Qs: X.X ([interpretation])
LPA: XX mL/beat (XX% of Qp). RPA: XX mL/beat (XX% of Qp).
[Pulmonary RF: XX% — [mild/moderate/severe] PR]

IMPRESSION:
[Primary diagnosis with hemodynamic summary]
```
