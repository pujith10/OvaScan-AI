import React from 'react';
import { X, Layers, Cpu, Database, CheckCircle2, GitBranch } from 'lucide-react';

export default function ArchitectureModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-window" style={{ maxWidth: '840px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Cpu className="text-cyan" size={22} />
              Model Architecture & Training Provenance
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Trained on Google Colab // Dual-Modality Late-Fusion Pipeline
            </p>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ gap: '1.25rem' }}>
          {/* Datasets Provenance */}
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--cyan-400)' }}>
              <Database size={16} /> Integrated Datasets
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', fontSize: '0.82rem' }}>
              <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                <strong>1. Kottarathil PCOS Dataset</strong>
                <p style={{ color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  541 patient clinical & hormonal records with KNNImputer (k=5) and automated header matching.
                </p>
              </div>
              <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                <strong>2. Anagha Choudhari Ultrasound</strong>
                <p style={{ color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Pelvic ultrasound image dataset with corrupted file sanitization and 80/20 train/validation split.
                </p>
              </div>
              <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                <strong>3. PCOS-XAI Dataset</strong>
                <p style={{ color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  External validation cohort confirming out-of-distribution image generalization.
                </p>
              </div>
            </div>
          </div>

          {/* Model Branches */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {/* Image Branch */}
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
              <h4 style={{ fontSize: '0.95rem', color: 'var(--cyan-400)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Layers size={16} /> Image Branch: EfficientNetB0
              </h4>
              <ul style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', paddingLeft: '1.2rem', lineHeight: '1.6' }}>
                <li>Input: 224 &times; 224 &times; 3 RGB Ultrasound Scans</li>
                <li>Base: Pre-trained ImageNet weights (frozen)</li>
                <li>GlobalAveragePooling2D (1280-dim feature vector)</li>
                <li>Dense(128, ReLU) + Dropout(0.3)</li>
                <li>Dense(1, Sigmoid) binary cross-entropy</li>
                <li>Data augmentation: Rotation &plusmn;20&deg;, Horizontal Flip</li>
              </ul>
            </div>

            {/* Tabular Branch */}
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
              <h4 style={{ fontSize: '0.95rem', color: 'var(--indigo-400)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <GitBranch size={16} /> Tabular: XGBoost + SMOTE
              </h4>
              <ul style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', paddingLeft: '1.2rem', lineHeight: '1.6' }}>
                <li>Features: AMH, I &beta;-HCG, II &beta;-HCG, Sl. No</li>
                <li>Class Imbalance: SMOTE synthetic oversampling</li>
                <li>Hyperparams: n_estimators=100, max_depth=6, lr=0.05</li>
                <li>Metric: ROC-AUC: 0.7378 / Weighted F1: 0.69</li>
                <li>Explainability: SHAP TreeExplainer local attribution</li>
                <li>Subtype Clustering: PCA (90% var) + KMeans (k=3)</li>
              </ul>
            </div>
          </div>

          {/* Late Fusion Blueprint */}
          <div style={{ background: 'rgba(14, 165, 233, 0.05)', border: '1px solid rgba(14, 165, 233, 0.2)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
            <h4 style={{ fontSize: '0.95rem', color: 'var(--cyan-400)', marginBottom: '0.5rem' }}>
              Multimodal Late Fusion Head (Cell 6 Blueprint)
            </h4>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', background: '#020617', padding: '0.85rem', borderRadius: 'var(--radius-sm)', overflowX: 'auto', color: '#38bdf8' }}>
              <div>tabular_input (None, 4) &oplus; image_embedding (None, 1280) &rarr; concatenated (None, 1284)</div>
              <div>&darr; Dense(64, ReLU) &rarr; Dropout(0.2) &rarr; Dense(32, ReLU)</div>
              <div>&darr; Output: Dense(1, Sigmoid) &rarr; Unified PCOS Risk Score</div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
