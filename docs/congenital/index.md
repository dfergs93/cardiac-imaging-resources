---
title: Congenital Heart Disease
hide:
    -toc
---

# Congenital Heart Disease

CMR reporting template and reference for imaging pearls in common CHD entities.

<div class="chd-tabs-container">
    <div class="chd-tabs">
        <button class="chd-tab-btn active" data-tab="normal" data-lesion="normal">Normal</button>
        <button class="chd-tab-btn" data-tab="tof" data-lesion="tof">TOF</button>
        <button class="chd-tab-btn" data-tab="tga" data-lesion="tga">TGA</button>
        <button class="chd-tab-btn" data-tab="cctga" data-lesion="cctga">ccTGA</button>
        <button class="chd-tab-btn" data-tab="dorv" data-lesion="dorv">DORV</button>
        <button class="chd-tab-btn" data-tab="asd" data-lesion="asd">ASD</button>
        <button class="chd-tab-btn" data-tab="vsd" data-lesion="vsd">VSD</button>
        <button class="chd-tab-btn" data-tab="fontan" data-lesion="fontan">Fontan</button>
        <button class="chd-tab-btn" data-tab="coa" data-lesion="coa">CoA</button>
        <button class="chd-tab-btn" data-tab="ebstein" data-lesion="ebstein">Ebstein</button>
        <button class="chd-tab-btn" data-tab="avsd" data-lesion="avsd">AVSD</button>
    </div>
    <!-- Template Section -->
    <div class="template-container">
        <div class="template-header">
            <h3>Segmental Analysis Template</h3>
            <button class="copy-btn" onclick="copyTemplate()" id="copy-template-btn">
                <span class="copy-icon">📋</span> Copy Template
            </button>
        </div>
        <div class="template-content" id="segmental-template">
            <p><strong>Situs:</strong> <span id="temp-situs">Situs solitus by normal spleen in the left upper quadrant and normal pulmonary arteries and airways relationships.</span></p>
            
            <p><strong>Cavae:</strong> <span id="temp-cavae">Single right-sided SVC and single right-sided IVC drain to the right atrium unobstructed.</span></p>
            
            <p><strong>Pulmonary Veins:</strong> <span id="temp-pv">Two right-sided pulmonary vein(s) and Two left-sided pulmonary vein(s) drain to the left atrium. No evidence of compression, stenosis or anomalous pulmonary venous return.</span></p>
            
            <p><strong>Atria:</strong> <span id="temp-atria">No gross interatrial communication.</span></p>
            
            <p><strong>Atrioventricular Connection:</strong> <span id="temp-av">Concordant. An endocardial cushion and two distinct atrioventricular valves are present.</span></p>
            
            <p><strong>Ventricles:</strong> <span id="temp-ventricles">D-loop with levocardia. Both ventricles are normal in size, morphology and function. No gross interventricular communication.</span></p>
            
            <p><strong>Ventriculoarterial Connection:</strong> <span id="temp-va">Concordant. Main pulmonary artery courses anterior and to the left of the ascending aorta, consistent with normal position of the great arteries.</span></p>
            
            <p><strong>Coronary Arteries:</strong> <span id="temp-coronary">Right and left coronary arteries originate from their expected sinuses of Valsalva.</span></p>
            
            <p><strong>Aorta:</strong> <span id="temp-aorta">Left-sided aortic arch with normal branching pattern. No evidence of aneurysm, coarctation or major aorto-pulmonary collateral arteries.</span></p>
            
            <p><strong>Pulmonary Arteries:</strong> <span id="temp-pa">Central pulmonary arteries are patent. No evidence of dilatation or stenosis.</span></p>
            
            <p><strong>Miscellaneous:</strong> <span id="temp-misc">None.</span></p>
        </div>
    </div>
</div>

!!! info "Using the Template"
    Click on any lesion tab below to automatically update the template with lesion-specific findings. The template will highlight key anatomic features for each CHD entity. Click the **Copy Template** button to copy the formatted text to your clipboard.

---

## Individual Lesion Pages

- [Tetralogy of Fallot (TOF)](tof.md)
- [Transposition of the Great Arteries (TGA)](tga.md)
- [Congenitally Corrected TGA (ccTGA)](cctga.md)
- [Double Outlet Right Ventricle (DORV)](dorv.md)
- [Atrial Septal Defect (ASD)](asd.md)
- [Ventricular Septal Defect (VSD)](vsd.md)
- [Fontan Circulation](fontan.md)
- [Coarctation of the Aorta (CoA)](coa.md)
- [Ebstein Anomaly](ebstein.md)
- [Atrioventricular Septal Defect (AVSD)](avsd.md)

---

## General MRI Tips

!!! tip "General Approach"
    1. **Morphology first** — dark blood (HASTE/TSE) axial stack for situs, connections, great vessel relationships
    2. **Cine function** — SAX stack of each ventricle (measure volumes separately)
    3. **Flow** — 2D PC or 4D flow at Ao, PA, LPA, RPA, any shunt vessel
    4. **LGE** — assess fibrosis, especially in systemic RV patients
    5. **T1/T2 mapping** — if myocarditis, infiltrative, or congestive hepatopathy suspected

**Breath-holding:** Use free-breathing with respiratory navigator for uncooperative patients or complex anatomy requiring long sequences.

**Sedation/anesthesia:** Required for young children; coordinate with anesthesia for timing of sequences.
