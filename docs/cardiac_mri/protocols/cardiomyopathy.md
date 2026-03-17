---
title: Cardiomyopathy Protocol
---

# Cardiomyopathy Protocol

**Indications:** Ischemic and non-ischemic cardiomyopathy characterization (HCM, DCM, myocarditis, infiltrative), ECV calculation.

---

## Sequence Order

| # | Sequence | View | Notes |
|---|----------|------|-------|
| 1 | **Localizers** | 3-plane | Quick survey |
| 2 | **Dark blood HASTE** | Axial stack (thorax) | Morphology survey; pericardium; pleura |
| 3 | **Cine SSFP** | 4CH | Can do as a stack for ARVC |
| 4 | **Cine SSFP** | 2CH | LV function, mitral |
| 5 | **Cine SSFP** | 3CH | LVOT, mitral, aortic valve, can do as a stack for HOCM |
| 6 | **Cine SSFP** | SAX stack (base → apex in 8 mm steps) | Volumetry |
| 7 | **T2 DIR** | 3 SAX (base/mid/apex) | |
| 8 | **T2 mapping** | 3 SAX (base/mid/apex) | optional, helpful in myocarditis |
| 9 | **T1 MOLLI (pre-contrast)** | 3 SAX (base/mid/apex) | |
| — | — | ***Inject gadolinium (0.1 mmol/kg)*** | Note time and dose |
| 10 | **TI Scout** | Mid-SA | Determine TI to null normal myocardium |
| 11 | **LGE** | SAX stack | Adjusted TI from scout, single-shot first, then repeat without single shot |
| 12 | **LGE** | 4CH, 2CH, 3CH | Orthogonal views |
| 13 | **T1 MOLLI (post-contrast)** | SAX | Calculate ECV |

## Optional Sequences
| # | Sequence | View | Notes |
|---|----------|------|-------|
| 1 | **Cine SSFP** | RV2CH/RV3CH/RVOT | RV morphology and function |
| 2 | **Cine SSFP** | Aortic valve (en face) | Valve morphology, orifice |
| 3 | **Cine SSFP** | SAX Free breathing | For pericardial constriction |

---

## Troubleshooting Tips

**Cine SSFP**
- If gating issues, switch to cineDL (less sensitive to heart rate changes)
- if banding artifacts, switch to GRE or cineDL
- For small banding artifacts overlying portion of the myocardium (typically at lung interface), can try changing center frequency. 
- GRE should be done post-contrast

**LGE** 
- Try to get additional slices to confirm LGE if seen at the scanner.
- If difficult with breath-hold, try single shot LGE. 
- If still not working, do cine IRs in multiple planes. 
- Can use raw MOLLI sequences as a double check for LGE. 

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