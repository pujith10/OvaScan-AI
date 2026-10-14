# Reporting Guidelines & Standards Compliance (GOV-03)

This checklist tracks adherence to international reporting guidelines for clinical AI systems.

## 1. TRIPOD+AI Checklist (Transparent Reporting of Machine Learning Prediction Models)

| Item | Description | Compliance Status | Source / Location in Repository |
| :--- | :--- | :--- | :--- |
| **Title** | Identify study as developing/validating ML prediction model | **DONE** | `PROJECT_DOCUMENTATION.md` §1 |
| **Abstract** | Structured summary of objectives, data, validation, performance | **DONE** | `README.md`, `docs/MODEL_CARD.md` |
| **Data Sources** | Describe source of data, dates, and eligibility criteria | **DONE** | `docs/DATA_SOURCES.md` |
| **Predictors** | Define all candidate predictors, measurement timing, and handling | **DONE** | `config/features.yaml`, `src/ovascan/data/schema.py` |
| **Data Leakage** | Explicit verification that test data is unexposed during preprocessing | **DONE** | `tests/audit/test_v1_findings.py`, `reports/leakage_audit.json` |
| **Missing Data** | Report proportions of missing data and imputation strategy | **DONE** | `src/ovascan/preprocessing/`, `reports/missingness.md` |
| **Evaluation** | Discrimination (AUROC/AUPRC) and calibration (ECE/Brier) with 95% CIs | **DONE** | `src/ovascan/tabular/`, `reports/` |
| **Explainability** | Local and global feature attribution reporting (SHAP/LIME) | **DONE** | `src/ovascan/tabular/`, `reports/` |

---

## 2. CLAIM / STARD-AI Checklist (AI in Medical Imaging)

| Item | Description | Compliance Status | Source / Location in Repository |
| :--- | :--- | :--- | :--- |
| **Imaging Protocol** | Transvaginal pelvic B-mode ultrasound technical specifications | **DONE** | `src/ovascan/vision/`, `thresholds.yaml` |
| **Deduplication** | Near-duplicate image clustering and group-based validation split | **DONE** | `src/ovascan/vision/dedup.py` |
| **External Cohort** | Validation on independent external imaging dataset | **DONE** | `reports/vision_external.md` |
| **Saliency Maps** | Gradient-based visual attribution with sanity randomization test | **DONE** | `src/ovascan/vision/gradcam.py` |
| **OOD Defense** | Multi-layer out-of-distribution rejection (chroma + Mahalanobis) | **DONE** | `src/ovascan/services/imageValidator.js`, `vision/ood.py` |
