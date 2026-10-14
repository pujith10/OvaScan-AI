import matplotlib.pyplot as plt
import matplotlib.patches as patches

def draw_architecture():
    # Ultra-compact, publication-grade widescreen aspect ratio (15.5 x 4.2 inches)
    # This keeps height low (~1.2 inches in 2-column paper) while retaining 100% of the content.
    fig, ax = plt.subplots(figsize=(15.5, 4.25), dpi=300)
    ax.set_xlim(0, 15.5)
    ax.set_ylim(0, 4.25)
    ax.axis('off')

    # Color Palette: Clean, professional, clinical-grade medical AI theme
    c_input_bg = '#F8FAFC'
    c_input_border = '#64748B'
    c_input_title = '#0F172A'

    c_guard_bg = '#FFF1F2'
    c_guard_border = '#E11D48'
    c_guard_title = '#9F1239'

    c_vision_bg = '#F0F9FF'
    c_vision_border = '#0284C7'
    c_vision_title = '#075985'

    c_tab_bg = '#FEFCE8'
    c_tab_border = '#CA8A04'
    c_tab_title = '#854D0E'

    c_fusion_bg = '#FAF5FF'
    c_fusion_border = '#7E22CE'
    c_fusion_title = '#581C87'

    c_sub_bg = '#F0FDF4'
    c_sub_border = '#16A34A'
    c_sub_title = '#166534'

    def add_card(x, y, w, h, bg, border, title, lines, title_color='#0F172A', title_size=11.5, line_size=9.8):
        # Card container with smooth rounded corners
        rect = patches.FancyBboxPatch(
            (x, y), w, h,
            boxstyle="round,pad=0.04,rounding_size=0.14",
            linewidth=1.6, edgecolor=border, facecolor=bg
        )
        ax.add_patch(rect)
        
        # Header title
        ax.text(
            x + w/2.0, y + h - 0.28, title,
            ha='center', va='center',
            fontsize=title_size, fontweight='bold', color=title_color
        )
        
        # Subtle separator line
        ax.plot([x + 0.12, x + w - 0.12], [y + h - 0.48, y + h - 0.48], color=border, lw=0.75, alpha=0.45)
        
        # Content lines
        n_lines = len(lines)
        if n_lines > 0:
            usable_height = h - 0.65
            line_spacing = usable_height / max(n_lines, 1)
            start_y = y + h - 0.68
            for i, line in enumerate(lines):
                cur_y = start_y - (i * line_spacing) - 0.08
                ax.text(
                    x + w/2.0, cur_y, line,
                    ha='center', va='center',
                    fontsize=line_size, color='#1E293B', fontweight='medium'
                )

    card_w = 2.50
    card_h = 1.62
    y_top = 2.42
    y_bot = 0.66

    # ------------------ TOP STREAM: VISION ------------------
    add_card(
        0.35, y_top, card_w, card_h, c_input_bg, c_input_border,
        "Input Modality I",
        ["Transvaginal Sonography", "2D B-mode Pelvic Scans", "(224 × 224 × 3 RGB)"],
        title_color=c_input_title
    )

    add_card(
        3.10, y_top, card_w, card_h, c_guard_bg, c_guard_border,
        "Optical OOD Guard",
        ["Acoustic Sector Check", r"Chroma Rejection $\bar{C}(\mathbf{I}) > 15$", "Suppresses Non-Ultrasound"],
        title_color=c_guard_title
    )

    add_card(
        5.85, y_top, card_w, card_h, c_vision_bg, c_vision_border,
        "Vision Backbone",
        ["EfficientNet-B0 (Transfer)", "Global Average Pooling", "Dense Head (128, ReLU)"],
        title_color=c_vision_title
    )

    add_card(
        8.60, y_top, card_w, card_h, c_vision_bg, c_vision_border,
        "Vision Risk & XAI",
        [r"$P_{\rm vision} \in [0, 1]$", "PCOM Probability", "Grad-CAM Heatmaps"],
        title_color=c_vision_title
    )

    # ------------------ BOTTOM STREAM: TABULAR ------------------
    add_card(
        0.35, y_bot, card_w, card_h, c_input_bg, c_input_border,
        "Input Modality II",
        ["13 Rotterdam Biomarkers", "Follicles, AMH, LH/FSH", "BMI, Cycle, Skin/Hair"],
        title_color=c_input_title
    )

    add_card(
        3.10, y_bot, card_w, card_h, c_tab_bg, c_tab_border,
        "Preprocessing",
        ["k-NN Imputation (k=5)", "Z-score Standardization", "SMOTE Balancing (Train)"],
        title_color=c_tab_title
    )

    add_card(
        5.85, y_bot, card_w, card_h, c_tab_bg, c_tab_border,
        "Tabular Classifier",
        ["XGBoost Tree Ensemble", "Isotonic Calibration (PAVA)", r"$\gamma=0, \lambda=1.0$ L2 Penalty"],
        title_color=c_tab_title
    )

    add_card(
        8.60, y_bot, card_w, card_h, c_tab_bg, c_tab_border,
        "Tabular Risk & XAI",
        [r"$P_{\rm tabular} \in [0, 1]$ (Calibrated)", "SHAP TreeExplainer", "Local & Global Additivity"],
        title_color=c_tab_title
    )

    # ------------------ RIGHT HEAD: LATE FUSION ------------------
    fusion_w = 3.65
    fusion_h = y_top + card_h - y_bot  # exactly spans both streams
    add_card(
        11.45, y_bot, fusion_w, fusion_h, c_fusion_bg, c_fusion_border,
        "Late Decision Fusion",
        [
            r"Convex Combination:",
            r"$P_{\rm fusion} = 0.55 P_{\rm vis} + 0.45 P_{\rm tab}$",
            "",
            "Rotterdam Arbiter:",
            "• PCOM + HA / OD Criterion Verification",
            "• Missing-Modality Dynamic Fallback",
            "• Calibrated Multimodal Risk Score"
        ],
        title_color=c_fusion_title,
        title_size=12.2,
        line_size=9.8
    )

    # ------------------ BOTTOM BANNER: SUBTYPING ------------------
    banner_w = 10.70
    banner_h = 0.45
    rect_sub = patches.FancyBboxPatch(
        (0.35, 0.08), banner_w, banner_h,
        boxstyle="round,pad=0.03,rounding_size=0.10",
        linewidth=1.4, edgecolor=c_sub_border, facecolor=c_sub_bg
    )
    ax.add_patch(rect_sub)
    ax.text(
        0.35 + banner_w/2.0, 0.08 + banner_h/2.0,
        "Unsupervised Latent Subtyping: PCA (≥90% Variance)  →  GMM Clustering  →  3 Biotypes (Baseline, Reproductive, Metabolic)",
        ha='center', va='center', fontsize=9.6, fontweight='bold', color=c_sub_title
    )

    # ------------------ ARROWS: MODERN, CRISP ------------------
    arr = dict(arrowstyle="-|>", color="#334155", lw=1.8, mutation_scale=15)

    # Top stream arrows
    ax.annotate("", xy=(3.06, y_top + card_h/2.0), xytext=(2.87, y_top + card_h/2.0), arrowprops=arr)
    ax.annotate("", xy=(5.81, y_top + card_h/2.0), xytext=(5.62, y_top + card_h/2.0), arrowprops=arr)
    ax.annotate("", xy=(8.56, y_top + card_h/2.0), xytext=(8.37, y_top + card_h/2.0), arrowprops=arr)

    # Bottom stream arrows
    ax.annotate("", xy=(3.06, y_bot + card_h/2.0), xytext=(2.87, y_bot + card_h/2.0), arrowprops=arr)
    ax.annotate("", xy=(5.81, y_bot + card_h/2.0), xytext=(5.62, y_bot + card_h/2.0), arrowprops=arr)
    ax.annotate("", xy=(8.56, y_bot + card_h/2.0), xytext=(8.37, y_bot + card_h/2.0), arrowprops=arr)

    # Converging arrows to Decision Fusion
    ax.annotate("", xy=(11.41, y_top + 0.35), xytext=(11.12, y_top + card_h/2.0), arrowprops=arr)
    ax.annotate("", xy=(11.41, y_bot + card_h - 0.35), xytext=(11.12, y_bot + card_h/2.0), arrowprops=arr)

    plt.tight_layout(pad=0.15)
    plt.savefig('ovascan_system_architecture.png', dpi=300, bbox_inches='tight', pad_inches=0.03)
    plt.savefig('evaluation_results/ovascan_system_architecture.png', dpi=300, bbox_inches='tight', pad_inches=0.03)
    plt.close()
    print("Architecture diagram successfully regenerated in ultra-compact, professional format!")

if __name__ == '__main__':
    draw_architecture()
