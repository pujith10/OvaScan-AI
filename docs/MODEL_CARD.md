# OvaScan AI v2 — Clinical Model Card

## 1. Intended Use
- **Primary Purpose**: Clinical decision-support and educational risk stratification for suspected Polycystic Ovary Syndrome (PCOS).
- **Target Users**: Healthcare practitioners (General Physicians, Gynecologists, Reproductive Endocrinologists) and patients seeking structured consultation summaries.
- **Out-of-Scope**: Standalone autonomous medical diagnosis, pediatric patients under 12 years old without gynecological history, and acute pelvic pain emergencies (e.g., ovarian torsion).

## 2. Model Architecture Summary
- **Vision Branch**: EfficientNetB0 Convolutional Neural Network ($224 \times 224 \times 3$), fine-tuned with Grad-CAM++ interpretability and temperature calibration.
- **Tabular Branch**: Tiered classifiers (Tier A: Clinical/Anthropometrics, Tier B: Standard Labs, Tier C: Full AMH Endocrine Panel) trained on leak-free pipelines with isotonic calibration and conformal prediction intervals.
- **Phenotypic Subtyping**: Soft Gaussian Mixture Model (GMM) with an explicit "Indeterminate" class for patients straddling cluster boundaries.
- **Rule Engine**: Deterministic Rotterdam 2003 / International Evidence-Based 2023 Guidelines.

## 3. Data & Validation Performance
- **Tabular ROC-AUC**: 0.738 (95% CI: [0.68, 0.79])
- **Vision External Accuracy**: Cross-evaluated on PCOS-XAI benchmark.
- **Cluster Stability**: Consensus GMM with soft probabilistic assignments.

## 4. Known Limitations ([DOCUMENT])
1. **Cross-Sectional Only**: No longitudinal cardiovascular or metabolic outcome tracking.
2. **Single-Source Primary Cohort**: Collected from South Indian clinical centers (Kottarathil cohort); multi-ethnic external validation is ongoing.
3. **No Paired Patient Modalities**: Ultrasound images and blood laboratory values originate from separate cohorts. Multimodal late fusion is explicitly labeled **EXPERIMENTAL**.
4. **Not a Regulated Medical Device**: Investigational decision-support aid.
