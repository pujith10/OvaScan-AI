# OvaScan AI — v1 Baseline Security & Methodological Audit

**Audit Date**: 2026-10-04  
**Audit Standard**: PCOS ML Literature Gap Specification & Reproducibility Protocol

## Summary of Findings

| ID | Finding | Status in v1 | Evidence |
| :--- | :--- | :--- | :--- |
| **A1** | `Sl. No` is an input feature | **CONFIRMED** | `pcos_scaler.joblib` and `pcos_imputer.joblib` contain `Sl. No` in `feature_names_in_`. |
| **A2** | Uninformative β-HCG dominance | **CONFIRMED** | Features include `I beta-HCG` and `II beta-HCG` which are pregnancy markers, not non-gestational PCOS indicators. |
| **A3** | Preprocessing leakage before split | **CONFIRMED** | `KNNImputer.fit_transform` occurs in Cell 1 on `df_final` prior to `train_test_split` in Cell 2. |
| **A4** | SMOTE outside CV pipeline | **CONFIRMED** | `SMOTE.fit_resample` is executed in a single train split rather than nested inside CV pipeline folds. |
| **A5** | Hard K-Means partitioning without stability check | **CONFIRMED** | Hard K-Means (k=3) deployed without bootstrap stability metrics or null-hypothesis test. |
| **A6** | Unvalidated hard-coded late fusion | **CONFIRMED** | Ultrasound images and clinical records derive from different cohorts; late fusion was heuristic. |
| **A7** | Vision validation split risk | **CONFIRMED** | Kaggle ultrasound dataset trained with random `validation_split=0.2` without perceptual hash deduplication. |
| **A8** | Grad-CAM UI visualization was synthetic | **CONFIRMED** | Client canvas simulated radial heatmaps rather than server-computed gradient backprop. |
| **A9** | Heuristic OOD gate bypassed by grayscale | **CONFIRMED** | Pure chroma threshold fails on grayscale non-ultrasound photos. |
| **A10** | Simulated fallback in frontend | **CONFIRMED** | `inferenceService.js` contained client math simulation when backend was inactive. |
| **A11** | Fixed Rotterdam PCOM thresholds | **CONFIRMED** | Hardcoded ≥12 follicle threshold without adult AMH alternative or mimic exclusions. |
| **A12** | Uncalibrated binary probabilities | **CONFIRMED** | Direct sigmoid probabilities reported without isotonic/temperature calibration or conformal bounds. |
| **A13** | Monolithic unversioned backend script | **CONFIRMED** | `server.py` lacked schemas, test coverage, and MLOps tracking. |

## Recommendation
Execute Phase 1 through Phase 11 of `OvaScan_AI_Gap_Remediation_Plan.md` sequentially.
