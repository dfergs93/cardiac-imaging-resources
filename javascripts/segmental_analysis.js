/* ============================================================
   SEGMENTAL ANALYSIS TEMPLATE
   ============================================================ */

// Template data for each CHD lesion
const templateData = {
    normal: {
        situs: "Situs solitus by normal spleen in the left upper quadrant and normal pulmonary arteries and airways relationships.",
        cavae: "Single right-sided SVC and single right-sided IVC drain to the right atrium unobstructed.",
        pv: "Two right-sided pulmonary vein(s) and Two left-sided pulmonary vein(s) drain to the left atrium. No evidence of compression, stenosis or anomalous pulmonary venous return.",
        atria: "No gross interatrial communication.",
        av: "Concordant. An endocardial cushion and two distinct atrioventricular valves are present.",
        ventricles: "D-loop with levocardia. Both ventricles are normal in size, morphology and function. No gross interventricular communication.",
        va: "Concordant. Main pulmonary artery courses anterior and to the left of the ascending aorta, consistent with normal position of the great arteries.",
        coronary: "Right and left coronary arteries originate from their expected sinuses of Valsalva.",
        aorta: "Left-sided aortic arch with normal branching pattern. No evidence of aneurysm, coarctation or major aorto-pulmonary collateral arteries.",
        pa: "Central pulmonary arteries are patent. No evidence of dilatation or stenosis.",
        misc: "None."
    },
    tof: {
        situs: "Situs solitus.",
        cavae: "Single right-sided SVC and single right-sided IVC drain to the right atrium unobstructed.",
        pv: "Two right-sided pulmonary vein(s) and Two left-sided pulmonary vein(s) drain to the left atrium.",
        atria: "No gross interatrial communication.",
        av: "Concordant.",
        ventricles: "D-loop with levocardia. Right ventricular hypertrophy present. Perimembranous ventricular septal defect measuring [X] mm.",
        va: "Overriding aorta with approximately [25-50]% override of the ventricular septal defect. Right ventricular outflow tract obstruction with infundibular stenosis. Hypoplastic main pulmonary artery measuring [X] mm.",
        coronary: "Right and left coronary arteries originate from their expected sinuses of Valsalva. [Note: Evaluate for anomalous coronary anatomy, particularly LAD from RCA].",
        aorta: "Left-sided aortic arch with normal branching pattern. [Assess for aortic root dilation].",
        pa: "Hypoplastic main pulmonary artery and branch pulmonary arteries. [Assess for presence of major aortopulmonary collateral arteries (MAPCAs)].",
        misc: "Classic tetralogy of Fallot with [specify degree of] RVOTO, overriding aorta, VSD, and RVH."
    },
    tga: {
        situs: "Situs solitus.",
        cavae: "Single right-sided SVC and single right-sided IVC drain to the right atrium unobstructed.",
        pv: "Two right-sided pulmonary vein(s) and Two left-sided pulmonary vein(s) drain to the left atrium.",
        atria: "[Assess for atrial septal defect - often present for mixing].",
        av: "Concordant. Right atrium connects to morphologic right ventricle via tricuspid valve. Left atrium connects to morphologic left ventricle via mitral valve.",
        ventricles: "D-loop with levocardia. Both ventricles normal in size and function. [Assess for ventricular septal defect].",
        va: "Discordant (D-TGA). Morphologic right ventricle gives rise to anteriorly positioned aorta. Morphologic left ventricle gives rise to posteriorly positioned pulmonary artery.",
        coronary: "[Carefully assess coronary artery anatomy - critical for arterial switch operation]. Coronary pattern: [specify - e.g., 1LCx;2R, 1L;2RCx, etc.]",
        aorta: "Aorta arises anteriorly and to the right from the morphologic right ventricle. [Post-ASO: assess for neo-aortic regurgitation and ascending aorta dilation].",
        pa: "Pulmonary artery arises posteriorly from the morphologic left ventricle. [Post-ASO: assess for branch PA stenosis].",
        misc: "D-Transposition of the great arteries. [If post-ASO: arterial switch operation with Lecompte maneuver. Assess coronary reimplantation sites and neo-aortic valve]."
    },
    cctga: {
        situs: "Situs solitus [or heterotaxy].",
        cavae: "Single right-sided SVC and single right-sided IVC drain to the morphologic left atrium unobstructed. [Assess for anomalous cavae drainage].",
        pv: "[Typically] Two pulmonary veins drain to the morphologic right atrium. [Anomalous pulmonary venous return common - assess carefully].",
        atria: "[Atrial arrangement is inverted/mirror-image of normal]. Morphologic right atrium receives pulmonary venous return. Morphologic left atrium receives systemic venous return. [Assess for atrial septal defect].",
        av: "Discordant. Morphologic right atrium connects to morphologic left ventricle via mitral valve. Morphologic left atrium connects to morphologic right ventricle via tricuspid valve. [Assess for left AV valve (mitral) regurgitation and Ebstein-like tricuspid malposition].",
        ventricles: "L-loop with levocardia (normally positioned despite inverted connections). Morphologic right ventricle is in left position and acts as systemic ventricle (morphologic LV hypoplasia common). Morphologic left ventricle is in right position and acts as subpulmonary ventricle. [Assess for ventricular septal defect and interventricular communication].",
        va: "Discordant. Morphologic left ventricle (subpulmonary) gives rise to posteriorly positioned aorta (arising from left-sided ventricle). Morphologic right ventricle (systemic) gives rise to anteriorly positioned pulmonary artery (arising from right-sided ventricle).",
        coronary: "[Right coronary artery typically arises from left-facing sinus]. Coronary pattern typically mirror-image of normal (1R from left, 1LCx from right). [Critical for surgical planning].",
        aorta: "Aorta arises from morphologic left ventricle (subpulmonary, in right position). Characteristically posterior and to the left. [Assess for aortic root dilation and aortic regurgitation].",
        pa: "Pulmonary artery arises from morphologic right ventricle (systemic, in left position), anteriorly positioned. [Assess for branch PA stenosis; reduced flow if subaortic stenosis present].",
        misc: "Congenitally corrected transposition (L-TGA/ccTGA) with discordant AV and ventriculoarterial connections. Associated findings: [specify VSD, left AV valve regurgitation, subaortic stenosis, conduction abnormalities]. Systemic right ventricle predisposes to ventricular dysfunction and may eventually require double switch or heart transplantation."
    },
    dorv: {
        situs: "Situs solitus [or heterotaxy].",
        cavae: "Single right-sided SVC and single right-sided IVC drain to the right atrium unobstructed. [For heterotaxy: assess carefully].",
        pv: "Two right-sided pulmonary vein(s) and Two left-sided pulmonary vein(s) drain to the left atrium. [Assess for anomalous pulmonary venous return].",
        atria: "No gross interatrial communication. [May have associated atrial septal defect].",
        av: "Concordant. Right atrium connects to morphologic right ventricle via tricuspid valve. Left atrium connects to morphologic left ventricle via mitral valve.",
        ventricles: "D-loop with levocardia. Both aorta and pulmonary artery arise predominantly or completely from the morphologic right ventricle. [Assess for ventricular septal defect and type: subarterial/doubly committed, perimembranous, or remote].",
        va: "Discordant from left ventricle perspective. Aorta and pulmonary artery both arise from the right ventricle. Relationship of great arteries: [anterior-posterior, side-by-side, or aorta posterior and to the right]. Left ventricle contribution to aorta or pulmonary artery: [specify if present - rare].",
        coronary: "Coronary arteries originating from expected sinuses, though variable given the abnormal great artery positioning. [Assess coronary ostia carefully relative to aortic root].",
        aorta: "Aorta arises predominantly or entirely from the morphologic right ventricle. Position: [specify - anterior-posterior, side-by-side, posterior and to the right, etc.].",
        pa: "Pulmonary artery arises predominantly or entirely from the morphologic right ventricle. [Often hypoplastic]. Systemic-to-pulmonary connection via VSD is essential for survival.",
        misc: "Double Outlet Right Ventricle (DORV) with [specify VSD type and relationship to great arteries]. Associated: [heterotaxy/isomerism, cardiac malpositions, other CHD]. Surgical repair destination typically depends on VSD position and relationshop to pulmonary artery."
    },
    asd: {
        situs: "Situs solitus.",
        cavae: "Single right-sided SVC and single right-sided IVC drain to the right atrium unobstructed. [For sinus venosus ASD: defect at SVC or IVC junction to right atrium].",
        pv: "[For secundum/primum ASD: normal pulmonary venous return]. [For sinus venosus ASD: anomalous pulmonary venous return present, typically right upper pulmonary vein to SVC].",
        atria: "[Secundum ASD]: Defect in the fossa ovalis measuring [X] mm with left-to-right shunting. [Primum ASD]: Defect in the lower atrial septum. Right and left atrial enlargement due to volume overload.",
        av: "Concordant.",
        ventricles: "D-loop with levocardia. Both ventricles normal in morphology and function. Right ventricular dilation due to volume overload. No interventricular communication.",
        va: "Concordant.",
        coronary: "Right and left coronary arteries originate from their expected sinuses of Valsalva.",
        aorta: "Left-sided aortic arch with normal branching pattern.",
        pa: "Main and branch pulmonary arteries enlarged due to increased flow. Qp:Qs = [X]:[X] indicating [hemodynamically significant/insignificant] shunt.",
        misc: "Atrial septal defect with left-to-right shunt. [If Qp:Qs >1.5: hemodynamically significant]."
    },
    vsd: {
        situs: "Situs solitus.",
        cavae: "Single right-sided SVC and single right-sided IVC drain to the right atrium unobstructed.",
        pv: "Two right-sided pulmonary vein(s) and Two left-sided pulmonary vein(s) drain to the left atrium.",
        atria: "No gross interatrial communication.",
        av: "Concordant.",
        ventricles: "D-loop with levocardia. [Perimembranous/muscular/inlet/outlet] ventricular septal defect measuring [X] mm with left-to-right shunting. Biventricular enlargement due to volume overload.",
        va: "Concordant. [For outlet VSD: assess for mild aortic override].",
        coronary: "Right and left coronary arteries originate from their expected sinuses of Valsalva.",
        aorta: "Left-sided aortic arch with normal branching pattern. [For outlet VSD: assess for aortic regurgitation].",
        pa: "Main and branch pulmonary arteries enlarged due to increased flow. Qp:Qs = [X]:[X]. [If reversed shunt: Eisenmenger physiology with fixed pulmonary hypertension and cyanosis].",
        misc: "Ventricular septal defect with left-to-right shunt. [If Qp:Qs >2.0: large, hemodynamically significant VSD warranting closure]."
    },
    fontan: {
        situs: "Situs [solitus/inversus/ambiguous] - variable depending on underlying anatomy.",
        cavae: "Superior and inferior vena cavae drain directly to the pulmonary arteries via total cavopulmonary connection (Fontan). No connection to atrium.",
        pv: "[Specify number and drainage pattern based on underlying diagnosis] pulmonary veins drain to common atrium.",
        atria: "Single common atrium receives pulmonary venous return. Morphologic right atrium absent or minimal.",
        av: "Single atrioventricular valve from common atrium to single ventricle. [Assess for regurgitation].",
        ventricles: "Single morphologic [right/left/indeterminate] ventricle. No subpulmonary ventricle. End-diastolic volume index = [X] mL/m². Ejection fraction = [X]%.",
        va: "Single ventricle gives rise to aorta. Pulmonary arteries receive passive flow from Fontan conduit (SVC + IVC).",
        coronary: "Coronary arteries [describe origin based on single ventricle morphology].",
        aorta: "Aorta arises from single systemic ventricle. [Describe arch sidedness and branching].",
        pa: "Pulmonary arteries receive passive inflow from Fontan conduit. [Fenestration present/absent]. Collateral flow = [X]% of total PA flow (normal <20%). [Assess for PA stenosis or thrombosis].",
        misc: "Total cavopulmonary connection (Fontan) for single ventricle physiology. Monitor for: single ventricle function, AV valve regurgitation, collateral flow, arrhythmias, protein-losing enteropathy, and hepatic complications."
    },
    coa: {
        situs: "Situs solitus.",
        cavae: "Single right-sided SVC and single right-sided IVC drain to the right atrium unobstructed.",
        pv: "Two right-sided pulmonary vein(s) and Two left-sided pulmonary vein(s) drain to the left atrium.",
        atria: "No gross interatrial communication.",
        av: "Concordant.",
        ventricles: "D-loop with levocardia. Both ventricles normal in size and morphology. [Assess for left ventricular hypertrophy if severe coarctation].",
        va: "Concordant.",
        coronary: "Right and left coronary arteries originate from their expected sinuses of Valsalva. [Note: bicuspid aortic valve present in approximately 50% of cases].",
        aorta: "Coarctation of the aorta at the isthmus (juxtaductal), distal to the left subclavian artery. Coarctation diameter = [X] mm with velocity gradient = [X] mmHg. Collateral vessels via intercostal and internal mammary arteries are enlarged. Ascending aorta and aortic root show [normal/dilated] dimensions.",
        pa: "Central pulmonary arteries are patent. No evidence of dilatation or stenosis.",
        misc: "Coarctation of the aorta. [Native/repaired]. Monitor for: residual/recurrent coarctation, hypertension, aortic valve disease (if bicuspid), and aortic root dilation."
    },
    ebstein: {
        situs: "Situs solitus.",
        cavae: "Single right-sided SVC and single right-sided IVC drain to the right atrium unobstructed.",
        pv: "Two right-sided pulmonary vein(s) and Two left-sided pulmonary vein(s) drain to the left atrium.",
        atria: "[Assess for patent foramen ovale or atrial septal defect with right-to-left shunting].",
        av: "Concordant. Apical displacement of the septal and posterior leaflets of the tricuspid valve by [X] mm ([X] mm/m² indexed). [Severe/moderate/mild] tricuspid regurgitation present.",
        ventricles: "D-loop with levocardia. Atrialized portion of the right ventricle measures [X] mL. Functional right ventricle is diminished in size. Left ventricle normal in size and function.",
        va: "Concordant.",
        coronary: "Right and left coronary arteries originate from their expected sinuses of Valsalva.",
        aorta: "Left-sided aortic arch with normal branching pattern.",
        pa: "Central pulmonary arteries are patent. [Assess for reduced flow if severe TR with right-to-left shunt].",
        misc: "Ebstein anomaly with apical displacement of tricuspid valve and [severe/moderate/mild] tricuspid regurgitation. Atrialized right ventricle volume = [X] mL. Monitor for: arrhythmias (especially WPW), right heart failure, and cyanosis."
    },
    avsd: {
        situs: "Situs solitus.",
        cavae: "Single right-sided SVC and single right-sided IVC drain to the right atrium unobstructed.",
        pv: "Two right-sided pulmonary vein(s) and Two left-sided pulmonary vein(s) drain to the left atrium.",
        atria: "Primum atrial septal defect measuring [X] mm with left-to-right shunting.",
        av: "[Complete/partial] atrioventricular septal defect. Common atrioventricular valve with [superior and inferior bridging leaflets/separate mitral and tricuspid components]. [Assess degree of left AV valve regurgitation].",
        ventricles: "D-loop with levocardia. Inlet ventricular septal defect measuring [X] mm. Both ventricles enlarged due to volume overload. Characteristic 'goose-neck' deformity of left ventricular outflow tract.",
        va: "Concordant. Aorta is anteriorly displaced secondary to goose-neck anatomy. [Assess for subaortic stenosis].",
        coronary: "Right and left coronary arteries originate from their expected sinuses of Valsalva.",
        aorta: "Left-sided aortic arch with normal branching pattern. Aorta is anteriorly positioned.",
        pa: "Main and branch pulmonary arteries enlarged due to increased flow. [Assess for pulmonary hypertension if unrepaired].",
        misc: "Atrioventricular septal defect (AVSD) with primum ASD, inlet VSD, and common AV valve. [Native/post-repair]. [If repaired: assess for residual left AV valve regurgitation, subaortic stenosis, and heart block]. Strong association with Down syndrome."
    }
};

// Update template based on selected tab
function updateTemplate(lesion) {
    const data = templateData[lesion] || templateData.normal;
    
    const fields = ['situs', 'cavae', 'pv', 'atria', 'av', 'ventricles', 'va', 'coronary', 'aorta', 'pa', 'misc'];
    
    fields.forEach(field => {
        const element = document.getElementById(`temp-${field}`);
        if (element && data[field]) {
            element.textContent = data[field];
        }
    });
}

// Copy template to clipboard
function copyTemplate() {
    const template = document.getElementById('segmental-template');
    if (!template) return;
    
    // Get all the text content
    const sections = [
        'Situs: ' + document.getElementById('temp-situs').textContent,
        'Cavae: ' + document.getElementById('temp-cavae').textContent,
        'Pulmonary Veins: ' + document.getElementById('temp-pv').textContent,
        'Atria: ' + document.getElementById('temp-atria').textContent,
        'Atrioventricular Connection: ' + document.getElementById('temp-av').textContent,
        'Ventricles: ' + document.getElementById('temp-ventricles').textContent,
        'Ventriculoarterial Connection: ' + document.getElementById('temp-va').textContent,
        'Coronary Arteries: ' + document.getElementById('temp-coronary').textContent,
        'Aorta: ' + document.getElementById('temp-aorta').textContent,
        'Pulmonary Arteries: ' + document.getElementById('temp-pa').textContent,
        'Miscellaneous: ' + document.getElementById('temp-misc').textContent
    ];
    
    const textToCopy = 'SEGMENTAL ANALYSIS\n\n' + sections.join('\n\n');
    
    const btn = document.getElementById('copy-template-btn');
    const showCopied = () => {
        if (btn) {
            const orig = btn.innerHTML;
            btn.innerHTML = '<span class="copy-icon">✓</span> Copied!';
            btn.classList.add('copied');
            setTimeout(() => { 
                btn.innerHTML = orig; 
                btn.classList.remove('copied'); 
            }, 2000);
        }
    };
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(textToCopy).then(showCopied);
    } else {
        const ta = document.createElement('textarea');
        ta.value = textToCopy;
        ta.style.position = 'fixed';
        ta.style.left = '-999999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showCopied();
    }
}

// Initialize tab click handlers to update template
function initTemplateTabHandlers() {
    const tabButtons = document.querySelectorAll('.chd-tab-btn');
    
    tabButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const lesion = this.getAttribute('data-lesion');
            if (lesion) {
                updateTemplate(lesion);
            }
        });
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initTemplateTabHandlers();
    // Set default to normal template
    updateTemplate('normal');
});
