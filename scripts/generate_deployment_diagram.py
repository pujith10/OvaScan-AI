import matplotlib.pyplot as plt
import matplotlib.patches as patches

def generate_diagram():
    fig, ax = plt.subplots(figsize=(13, 5.0), dpi=300)
    ax.set_xlim(0, 13)
    ax.set_ylim(0, 5.0)
    ax.axis('off')

    # Color palette
    c_bg1 = '#F8FAFC'
    c_border1 = '#64748B'
    c_bg2 = '#EFF6FF'
    c_border2 = '#2563EB'
    c_bg3 = '#FAF5FF'
    c_border3 = '#7C3AED'
    c_bg4 = '#ECFDF5'
    c_border4 = '#059669'

    def draw_phase(x, y, w, h, bg, border, num, title, items, badge_col):
        rect = patches.FancyBboxPatch(
            (x, y), w, h,
            boxstyle='round,pad=0.06,rounding_size=0.16',
            linewidth=1.6, edgecolor=border, facecolor=bg
        )
        ax.add_patch(rect)
        
        # Header Badge
        badge = patches.Circle((x + 0.35, y + h - 0.38), 0.22, facecolor=badge_col, edgecolor='none')
        ax.add_patch(badge)
        ax.text(x + 0.35, y + h - 0.38, str(num), ha='center', va='center', color='white', fontsize=11, fontweight='bold')
        
        # Title
        ax.text(x + 0.72, y + h - 0.38, title, ha='left', va='center', color='#0F172A', fontsize=11.5, fontweight='bold')
        
        # Divider line
        ax.plot([x + 0.15, x + w - 0.15], [y + h - 0.70, y + h - 0.70], color=border, lw=0.8, alpha=0.4)
        
        # Item bullets
        start_y = y + h - 1.05
        for i, itm in enumerate(items):
            ax.text(x + 0.20, start_y - i * 0.42, itm, ha='left', va='center', color='#334155', fontsize=9.2, fontweight='medium')

    # 4 Sequential Phases
    # 1. Patient Intake & Community Triage
    draw_phase(
        0.3, 0.35, 2.85, 4.3, c_bg1, c_border1, 1, 'Patient Intake & Triage',
        [
            r'• Zero-Ultrasound Symptom Mode',
            r'• Live BMI & Menstrual History',
            r'• Rotterdam 2-of-3 Criteria Check',
            r'• Hirsutism & Metabolic Survey',
            r'• Printable Doctor Consultation Dossier',
            r'• Bridges Community-to-Clinic Care',
            r'• Eliminates Early Referral Delays'
        ],
        '#475569'
    )

    # 2. Point-of-Care Multimodal AI Lab
    draw_phase(
        3.5, 0.35, 2.85, 4.3, c_bg2, c_border2, 2, 'Multimodal Diagnostics',
        [
            r'• Optical Chroma Guard ($\bar{C} \leq 15.0$)',
            r'• EfficientNet-B0 TVUS Vision',
            r'• 13-Biomarker Endocrine Panel',
            r'• Fold-Isolated Isotonic Calibration',
            r'• 99.08% Internal Accuracy, 0.9992 AUC',
            r'• 0.9573 External Hospital AUROC',
            r'• Zero False-Positive Overdiagnosis'
        ],
        '#2563EB'
    )

    # 3. Subtyping & Dual Explainability
    draw_phase(
        6.7, 0.35, 2.85, 4.3, c_bg3, c_border3, 3, 'Subtyping & Explainability',
        [
            r'• Multimodal Fusion ($0.55V + 0.45T$)',
            r'• SHAP TreeExplainer Local Attribution',
            r'• CNN Grad-CAM Follicular Maps',
            r'• Unsupervised PCA-GMM Clustering',
            r'• 3 Continuous Physiological Endotypes',
            r'• High Bootstrap Stability (ARI = 0.865)',
            r'• Replaces Forced Hard $k$-Means'
        ],
        '#7C3AED'
    )

    # 4. Stratified Therapeutics & EHR Care Pathway
    draw_phase(
        9.9, 0.35, 2.85, 4.3, c_bg4, c_border4, 4, 'Stratified Therapeutics',
        [
            r'• Normoandrogenic: Lifestyle/Diet',
            r'• Reproductive: Letrozole / IVF Focus',
            r'• Metabolic: Metformin / GLP-1 RA',
            r'• Longitudinal Cardiometabolic Tracking',
            r'• HL7 / FHIR Standard EHR Export',
            r'• ONNX Edge Runtime for Rural Clinics',
            r'• Non-Autonomous Clinical Governance'
        ],
        '#059669'
    )

    # Arrows between columns
    for arr_x in [3.27, 6.47, 9.67]:
        ax.annotate(
            '', xy=(arr_x + 0.18, 2.5), xytext=(arr_x - 0.08, 2.5),
            arrowprops=dict(arrowstyle='->', lw=2.2, color='#64748B')
        )

    plt.savefig('ovascan_clinical_deployment_framework.png', bbox_inches='tight', dpi=300)
    print("Successfully generated ovascan_clinical_deployment_framework.png")

if __name__ == '__main__':
    generate_diagram()
