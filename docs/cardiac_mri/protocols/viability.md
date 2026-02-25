---
title: Viability Protocol
---

# Viability Protocol

**Indications:** Ischemic cardiomyopathy (scar quantification for revascularization decision), non-ischemic cardiomyopathy characterization (HCM, DCM, myocarditis, infiltrative), ECV calculation.

---

## Sequence Order

| # | Sequence | View | Notes |
|---|----------|------|-------|
| 1 | Localizers | 3-plane | |
| 2 | Dark blood HASTE | Axial | Morphology |
| 3 | **Native T1 MOLLI** | 3 SAX (base/mid/apex) | Must be done **before** contrast |
| 4 | Cine SSFP | 4CH, 2CH, 3CH, SAX stack | Function |
| 5 | **T2 mapping** | 3 SAX | Edema (myocarditis workup) |
| 6 | **T2 STIR** | 4CH, SAX | Edema — regional |
| — | — | ***Inject gadolinium (0.1 mmol/kg)*** | Note time and dose |
| 7 | **Post-Gd T1 MOLLI** | Same 3 SAX slices as native | ≥15 min post-injection — wait for equilibrium |
| 8 | **TI Scout** | Mid-SA | Determine TI to null normal myocardium |
| 9 | **LGE** | SAX stack | Adjusted TI from scout |
| 10 | **LGE** | 4CH, 2CH, 3CH, RVOT | Orthogonal views |
| 11 | Phase-sensitive IR (PSIR) | SAX + LAX | *If available — better null tolerance* |

---

## LGE Patterns and Diagnosis

| Pattern | Distribution | Likely Diagnosis |
|---------|-------------|-----------------|
| Subendocardial / transmural | Coronary territory | Ischemic scar |
| Mid-wall | Septal (IVS) "stripe" | DCM, myocarditis, LBBB |
| Subepicardial | Lateral wall | Myocarditis (focal) |
| Diffuse subendocardial | Global, circumferential | Amyloid; also consider ECV |
| RV insertion points | Bilateral septal junctions | Pressure overload (pulm HTN, TOF) |
| Patchy / geographic | HCM segments | HCM — correlates with arrhythmia risk |
| Pericardium | Delayed enhancement | Pericarditis |

!!! tip "Ischemic vs. Non-Ischemic"
    Ischemic scar **always starts at the endocardium** and may extend transmurally.  
    Non-ischemic patterns (mid-wall, subepicardial, RV insertion) are **never endocardial-dominant**.

### Transmural Extent and Viability

| Transmural Extent | Likelihood of Functional Recovery with Revascularization |
|-------------------|----------------------------------------------------------|
| 0% (no LGE) | High |
| 1–25% | High |
| 26–50% | Intermediate |
| 51–75% | Unlikely |
| >75% | Very unlikely |

---

## ECV Calculation

**Formula:** \(ECV = (1 - Hct) \times \frac{\Delta R1_{myo}}{\Delta R1_{blood}}\)

Where \(\Delta R1 = \frac{1}{T1_{post}} - \frac{1}{T1_{pre}}\) (in ms⁻¹)

Use the **[ECV Calculator](../../calculators/index.md)** on the Calculators page.

| ECV (%) | Interpretation |
|---------|----------------|
| <25 | Normal |
| 25–30 | Borderline |
| 30–40 | Diffuse fibrosis / edema |
| >40 | Markedly elevated — amyloid? |

!!! warning "Amyloid Pattern"
    High native T1, high ECV, diffuse subendocardial LGE, difficulty nulling myocardium, small LV with thick walls + preserved/reduced EF. RV involvement common.

---

## Reporting Template

```
TECHNIQUE: CMR with gadolinium contrast [dose/agent]. 
T1 mapping pre- and post-contrast performed. LGE images obtained XX min post-injection.

LV: EDVi XX mL/m², ESVi XX mL/m², EF XX%, mass index XX g/m².

LGE FINDINGS:
[Segment] — [extent]% transmural LGE in an [ischemic/non-ischemic] pattern.
Max transmural extent: XX%.
Total LGE burden: XX% of LV myocardial mass.

T1 MAPPING (MOLLI):
Native T1: XX ms (ref 950–1050 ms at 1.5T)
Post-Gd T1: XX ms
ECV: XX% (Hct XX%)

IMPRESSION:
[Ischemic cardiomyopathy with scar / Non-ischemic pattern consistent with DCM / myocarditis / amyloid, etc.]
```
