"""
OvaScan AI — Comprehensive Model Strength & Diagnostic Validation Suite
Measures all requested supervised classification metrics and unsupervised clustering stability metrics:
- Supervised: Accuracy (Internal & CV), Sensitivity/Recall/TPR, Specificity/TNR, Precision/PPV, F1-Score, AUROC, AUPRC, 1000-iteration Bootstrap 95% CIs.
- Unsupervised: Silhouette Score, Calinski-Harabasz Index, Davies-Bouldin Index, Elbow Method (SSE k=2..10), Jaccard Stability Index (1000 bootstrap iterations), Adjusted Rand Index (ARI), and Cluster Prevalence (%).
Evaluates both the currently deployed 4-feature model and the full 42-marker clinical battery.
"""

import os
import json
import numpy as np
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split, StratifiedKFold
from sklearn.metrics import (
    accuracy_score,
    recall_score,
    precision_score,
    f1_score,
    roc_auc_score,
    average_precision_score,
    confusion_matrix,
    silhouette_score,
    calinski_harabasz_score,
    davies_bouldin_score,
    adjusted_rand_score
)
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans
from sklearn.mixture import GaussianMixture
from sklearn.impute import KNNImputer
import xgboost as xgb


def load_datasets():
    raw_dir = "data/raw"
    clinical_file = os.path.join(raw_dir, "PCOS_data_without_infertility.xlsx")
    inf_file = os.path.join(raw_dir, "PCOS_infertility.csv")

    # 1. Full Clinical Dataset (Sheet "Full_new")
    df_full_raw = pd.read_excel(clinical_file, sheet_name="Full_new")
    df_full_raw.columns = [str(c).strip().replace('\n', ' ') for c in df_full_raw.columns]
    
    # Clean identifiers
    drop_id_cols = ['Sl. No', 'Patient File No.', 'Unnamed: 44']
    df_full = df_full_raw.drop(columns=[c for c in drop_id_cols if c in df_full_raw.columns])
    for col in df_full.columns:
        df_full[col] = pd.to_numeric(df_full[col], errors='coerce')
    
    imputer = KNNImputer(n_neighbors=5)
    df_full_imputed = pd.DataFrame(imputer.fit_transform(df_full), columns=df_full.columns)
    df_full_imputed['PCOS (Y/N)'] = df_full_imputed['PCOS (Y/N)'].astype(int)

    # 2. Deployed 4-feature subset as used in original notebook
    features_deployed = ['Sl. No', 'I   beta-HCG(mIU/mL)', 'II    beta-HCG(mIU/mL)', 'AMH(ng/mL)']
    df_inf = pd.read_csv(inf_file)
    df_inf.columns = [str(c).strip().replace('\n', ' ') for c in df_inf.columns]
    
    # Merge for deployed
    df_inf['Patient_ID_Key'] = pd.to_numeric(df_inf.iloc[:, 1], errors='coerce')
    df_full_raw['Patient_ID_Key'] = pd.to_numeric(df_full_raw.iloc[:, 1], errors='coerce')
    df_m = pd.concat([df_full_raw.reset_index(drop=True), df_inf.reset_index(drop=True)], axis=1)
    df_m = df_m.loc[:, ~df_m.columns.duplicated()].copy()
    
    for c in features_deployed:
        if c in df_m.columns:
            df_m[c] = pd.to_numeric(df_m[c], errors='coerce')
    
    imputer_dep = KNNImputer(n_neighbors=5)
    dep_numeric = df_m[features_deployed + ['PCOS (Y/N)']].select_dtypes(include=[np.number])
    df_dep_imputed = pd.DataFrame(imputer_dep.fit_transform(dep_numeric), columns=dep_numeric.columns)
    df_dep_imputed['PCOS (Y/N)'] = df_dep_imputed['PCOS (Y/N)'].astype(int)

    return df_dep_imputed, df_full_imputed


def evaluate_classifier(X, y, model=None, model_name="Classifier"):
    print(f"\n--- Evaluating {model_name} (N={len(y)}, Features={X.shape[1]}) ---")
    
    # 80/20 Stratified Train/Test Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, stratify=y, random_state=42
    )

    if model is None:
        model = xgb.XGBClassifier(
            n_estimators=100, learning_rate=0.05, max_depth=4, random_state=42, eval_metric='logloss'
        )
        model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]

    tn, fp, fn, tp = confusion_matrix(y_test, y_pred).ravel()
    accuracy = accuracy_score(y_test, y_pred)
    sensitivity = recall_score(y_test, y_pred)
    specificity = tn / (tn + fp) if (tn + fp) > 0 else 0.0
    precision = precision_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    auroc = roc_auc_score(y_test, y_prob)
    auprc = average_precision_score(y_test, y_prob)

    print(f"Internal Test Set (N={len(y_test)}):")
    print(f"  • Accuracy:                      {accuracy*100:.2f}%")
    print(f"  • Sensitivity / Recall (TPR):    {sensitivity*100:.2f}%")
    print(f"  • Specificity / TNR:             {specificity*100:.2f}%")
    print(f"  • Precision / PPV:               {precision*100:.2f}%")
    print(f"  • F1-Score:                      {f1*100:.2f}%")
    print(f"  • ROC-AUC (AUROC):               {auroc:.4f}")
    print(f"  • PR-AUC (AUPRC):                {auprc:.4f}")
    print(f"  • Confusion Matrix:              TN={tn}, FP={fp}, FN={fn}, TP={tp}")

    # 1,000-Iteration Bootstrap 95% Confidence Intervals
    np.random.seed(42)
    boot = {'acc': [], 'sens': [], 'spec': [], 'prec': [], 'f1': [], 'auc': [], 'pr_auc': []}
    y_t_arr = np.array(y_test)
    y_p_arr = np.array(y_pred)
    y_pr_arr = np.array(y_prob)
    n = len(y_t_arr)

    for _ in range(1000):
        idx = np.random.choice(n, size=n, replace=True)
        if len(np.unique(y_t_arr[idx])) < 2:
            continue
        yt_b, yp_b, ypr_b = y_t_arr[idx], y_p_arr[idx], y_pr_arr[idx]
        b_cm = confusion_matrix(yt_b, yp_b, labels=[0, 1])
        b_tn, b_fp, b_fn, b_tp = b_cm.ravel()
        boot['acc'].append(accuracy_score(yt_b, yp_b))
        boot['sens'].append(recall_score(yt_b, yp_b, zero_division=0))
        boot['spec'].append(b_tn / (b_tn + b_fp) if (b_tn + b_fp) > 0 else 0)
        boot['prec'].append(precision_score(yt_b, yp_b, zero_division=0))
        boot['f1'].append(f1_score(yt_b, yp_b, zero_division=0))
        boot['auc'].append(roc_auc_score(yt_b, ypr_b))
        boot['pr_auc'].append(average_precision_score(yt_b, ypr_b))

    ci_95 = {}
    for k_name, key in [('Accuracy', 'acc'), ('Sensitivity', 'sens'), ('Specificity', 'spec'),
                        ('Precision', 'prec'), ('F1-Score', 'f1'), ('AUROC', 'auc'), ('AUPRC', 'pr_auc')]:
        vals = boot[key]
        mult = 100 if key not in ['auc', 'pr_auc'] else 1
        unit = "%" if key not in ['auc', 'pr_auc'] else ""
        ci_95[k_name] = {
            'lower': float(np.percentile(vals, 2.5)),
            'upper': float(np.percentile(vals, 97.5)),
            'mean': float(np.mean(vals)),
            'std': float(np.std(vals))
        }
        print(f"    95% CI {k_name:16}: [{ci_95[k_name]['lower']*mult:.2f}{unit} – {ci_95[k_name]['upper']*mult:.2f}{unit}]")

    # 5-Fold Stratified Cross-Validation (External validation proxy)
    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    cv_scores = {'acc': [], 'sens': [], 'spec': [], 'prec': [], 'f1': [], 'auc': [], 'pr_auc': []}
    for tr_idx, val_idx in skf.split(X, y):
        X_tr, X_val = X.iloc[tr_idx], X.iloc[val_idx]
        y_tr, y_val = y.iloc[tr_idx], y.iloc[val_idx]
        m = xgb.XGBClassifier(n_estimators=100, learning_rate=0.05, max_depth=4, random_state=42, eval_metric='logloss')
        m.fit(X_tr, y_tr)
        vp = m.predict(X_val)
        vpr = m.predict_proba(X_val)[:, 1]
        v_tn, v_fp, v_fn, v_tp = confusion_matrix(y_val, vp).ravel()
        cv_scores['acc'].append(accuracy_score(y_val, vp))
        cv_scores['sens'].append(recall_score(y_val, vp, zero_division=0))
        cv_scores['spec'].append(v_tn / (v_tn + v_fp) if (v_tn + v_fp) > 0 else 0)
        cv_scores['prec'].append(precision_score(y_val, vp, zero_division=0))
        cv_scores['f1'].append(f1_score(y_val, vp, zero_division=0))
        cv_scores['auc'].append(roc_auc_score(y_val, vpr))
        cv_scores['pr_auc'].append(average_precision_score(y_val, vpr))

    cv_summary = {}
    print("  5-Fold Cross-Validation Generalization (External Partition):")
    for k_name, key in [('Accuracy', 'acc'), ('Sensitivity', 'sens'), ('Specificity', 'spec'),
                        ('Precision', 'prec'), ('F1-Score', 'f1'), ('AUROC', 'auc'), ('AUPRC', 'pr_auc')]:
        v = cv_scores[key]
        mult = 100 if key not in ['auc', 'pr_auc'] else 1
        unit = "%" if key not in ['auc', 'pr_auc'] else ""
        cv_summary[k_name] = {'mean': float(np.mean(v)), 'std': float(np.std(v))}
        print(f"    CV {k_name:16}: {cv_summary[k_name]['mean']*mult:.2f}{unit} ± {cv_summary[k_name]['std']*mult:.2f}{unit}")

    return {
        'internal_test': {
            'accuracy': float(accuracy),
            'sensitivity_tpr': float(sensitivity),
            'specificity_tnr': float(specificity),
            'precision_ppv': float(precision),
            'f1_score': float(f1),
            'auroc': float(auroc),
            'auprc': float(auprc),
            'confusion_matrix': {'tn': int(tn), 'fp': int(fp), 'fn': int(fn), 'tp': int(tp)},
            'bootstrap_95ci': ci_95
        },
        'cross_validation_5fold': cv_summary
    }


def evaluate_unsupervised_clustering(df):
    print("\n" + "=" * 70)
    print("UNSUPERVISED CLUSTERING & PHENOTYPE STABILITY SUITE")
    print("=" * 70)

    features = df.drop(columns=['PCOS (Y/N)', 'Cluster'], errors='ignore')
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(features)

    # PCA 90% variance
    pca = PCA(n_components=0.90, random_state=42)
    X_pca = pca.fit_transform(X_scaled)
    var_exp = float(np.sum(pca.explained_variance_ratio_))
    n_comp = int(pca.n_components_)
    print(f"PCA: Reduced {features.shape[1]} features to {n_comp} PCs (Retaining {var_exp*100:.2f}% variance)")

    # 1. Elbow Method & Sum of Squared Errors (SSE / Inertia) across k in [2..10]
    print("\nElbow Method Analysis (k=2..10):")
    k_vals = list(range(2, 11))
    sse_list = []
    sil_by_k = {}
    for k in k_vals:
        km = KMeans(n_clusters=k, n_init=10, random_state=42)
        km.fit(X_pca)
        sse_list.append(float(km.inertia_))
        sil = float(silhouette_score(X_pca, km.labels_))
        sil_by_k[k] = sil
        print(f"  k={k:2d}: SSE (Inertia) = {km.inertia_:10.2f} | Silhouette = {sil:.4f}")

    # Primary Phenotype Clustering at k=3
    k = 3
    kmeans = KMeans(n_clusters=k, n_init=10, random_state=42)
    labels = kmeans.fit_predict(X_pca)

    # 2. Geometric Quality Metrics
    sil = float(silhouette_score(X_pca, labels))
    ch = float(calinski_harabasz_score(X_pca, labels))
    db = float(davies_bouldin_score(X_pca, labels))

    print(f"\nClustering Quality Metrics for k={k} Phenotypes:")
    print(f"  • Silhouette Score / Coefficient:           {sil:.4f} (Geometric Separation & Cohesion)")
    print(f"  • Calinski-Harabasz Index (Variance Ratio): {ch:.2f} (Between/Within Variance Criterion)")
    print(f"  • Davies-Bouldin Index:                     {db:.4f} (Cluster Similarity - Lower is Better)")

    # 3. Cluster Prevalence Percentage (%)
    u_labels, counts = np.unique(labels, return_counts=True)
    total_n = len(labels)
    prevalence = {}
    print("\nCluster Prevalence (% of Total Cohort N=541):")
    for cid, cnt in zip(u_labels, counts):
        pct = float((cnt / total_n) * 100)
        prevalence[int(cid)] = {'count': int(cnt), 'percentage': round(pct, 2)}
        print(f"  • Phenotype Cluster {cid}: {cnt:4d} patients ({pct:.2f}%)")

    # 4. Jaccard Stability Index across 1,000 Bootstrap Perturbations
    print("\nComputing Jaccard Stability Index across 1,000 Bootstrap Perturbations (80% Subsampling)...")
    np.random.seed(42)
    n_iter = 1000
    sub_size = int(total_n * 0.80)
    jaccard_scores = {cid: [] for cid in range(k)}
    ari_perturbation_scores = []

    for _ in range(n_iter):
        sub_idx = np.random.choice(total_n, size=sub_size, replace=False)
        X_sub = X_pca[sub_idx]
        orig_sub = labels[sub_idx]

        km_sub = KMeans(n_clusters=k, n_init=5, random_state=None)
        new_sub = km_sub.fit_predict(X_sub)

        ari_perturbation_scores.append(adjusted_rand_score(orig_sub, new_sub))

        for cid in range(k):
            orig_set = set(np.where(orig_sub == cid)[0])
            if not orig_set:
                continue
            best_j = 0.0
            for new_cid in range(k):
                new_set = set(np.where(new_sub == new_cid)[0])
                if not new_set:
                    continue
                intersection = len(orig_set.intersection(new_set))
                union = len(orig_set.union(new_set))
                j = intersection / union if union > 0 else 0.0
                if j > best_j:
                    best_j = j
            jaccard_scores[cid].append(best_j)

    jaccard_summary = {}
    for cid in range(k):
        vals = jaccard_scores[cid]
        jaccard_summary[int(cid)] = {
            'mean_jaccard': float(np.mean(vals)),
            'std_jaccard': float(np.std(vals)),
            'ci_95': [float(np.percentile(vals, 2.5)), float(np.percentile(vals, 97.5))]
        }
        print(f"  • Cluster {cid} Jaccard Stability: {jaccard_summary[cid]['mean_jaccard']:.4f} "
              f"± {jaccard_summary[cid]['std_jaccard']:.4f} (95% CI: [{jaccard_summary[cid]['ci_95'][0]:.4f} – {jaccard_summary[cid]['ci_95'][1]:.4f}])")

    mean_jaccard = float(np.mean([np.mean(jaccard_scores[cid]) for cid in range(k)]))
    print(f"  • Overall Mean Jaccard Stability:   {mean_jaccard:.4f}")

    # 5. Adjusted Rand Index (ARI)
    mean_ari = float(np.mean(ari_perturbation_scores))
    std_ari = float(np.std(ari_perturbation_scores))
    gmm = GaussianMixture(n_components=k, random_state=42)
    gmm_labels = gmm.fit_predict(X_pca)
    cross_algo_ari = float(adjusted_rand_score(labels, gmm_labels))
    diag_ari = float(adjusted_rand_score(df['PCOS (Y/N)'].astype(int), labels))

    print(f"\nAdjusted Rand Index (ARI) Metrics:")
    print(f"  • Bootstrapped Resampling Stability ARI:        {mean_ari:.4f} ± {std_ari:.4f}")
    print(f"  • Cross-Algorithm Concordance (K-Means vs GMM): {cross_algo_ari:.4f}")
    print(f"  • Clinical Concordance (Clusters vs Rotterdam): {diag_ari:.4f}")

    return {
        'pca': {'components': n_comp, 'variance_explained': var_exp},
        'elbow_analysis': {'k_range': k_vals, 'sse_inertia': sse_list, 'silhouette_by_k': sil_by_k},
        'geometric_scores': {'silhouette_score': sil, 'calinski_harabasz_index': ch, 'davies_bouldin_index': db},
        'prevalence_percentages': prevalence,
        'jaccard_stability_1000_iterations': {'overall_mean': mean_jaccard, 'per_cluster': jaccard_summary},
        'adjusted_rand_index': {
            'bootstrap_stability_ari_mean': mean_ari,
            'bootstrap_stability_ari_std': std_ari,
            'cross_algorithm_ari_kmeans_vs_gmm': cross_algo_ari,
            'clinical_concordance_ari': diag_ari
        }
    }


def main():
    print("======================================================================")
    print("OVASCAN AI — COMPREHENSIVE MODEL STRENGTH & EVALUATION SUITE")
    print("======================================================================")

    df_dep, df_full = load_datasets()
    print(f"Loaded Datasets: Deployed subset ({df_dep.shape}), Full Clinical Battery ({df_full.shape})")

    # Evaluate Track 1: Deployed 4-Feature Tabular Model
    features_dep = ['Sl. No', 'I   beta-HCG(mIU/mL)', 'II    beta-HCG(mIU/mL)', 'AMH(ng/mL)']
    model_dep = joblib.load("pcos_tabular_model.joblib") if os.path.exists("pcos_tabular_model.joblib") else None
    res_deployed = evaluate_classifier(
        df_dep[features_dep], df_dep['PCOS (Y/N)'], model=model_dep, model_name="Track A: Deployed Tabular Model (4 Features)"
    )

    # Evaluate Track 2: Comprehensive Multi-Marker Clinical Battery (42 Clinical Markers)
    features_full = df_full.drop(columns=['PCOS (Y/N)'])
    res_full = evaluate_classifier(
        features_full, df_full['PCOS (Y/N)'], model=None, model_name="Track B: Full Multi-Marker Clinical Battery (42 Features)"
    )

    # Evaluate Unsupervised Clustering Suite on Full Clinical Battery
    clust_metrics = evaluate_unsupervised_clustering(df_full)

    report_payload = {
        'metadata': {
            'cohort_size': len(df_full),
            'timestamp': pd.Timestamp.now().isoformat(),
            'notes': 'Empirical validation metrics computed directly on actual PCOS cohort'
        },
        'supervised_metrics': {
            'deployed_model_4_features': res_deployed,
            'full_clinical_battery_42_features': res_full
        },
        'unsupervised_clustering_metrics': clust_metrics
    }

    output_json = "reports/model_evaluation_metrics.json"
    with open(output_json, "w") as f:
        json.dump(report_payload, f, indent=2)

    print("\n" + "=" * 70)
    print(f"✅ METRIC SUITE COMPLETED SUCCESSFULLY")
    print(f"Artifact written to: {output_json}")
    print("=" * 70)


if __name__ == "__main__":
    main()
