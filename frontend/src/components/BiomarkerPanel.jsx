import React from 'react';
import { Stethoscope, HelpCircle, Activity, Scale, Calendar, Hash } from 'lucide-react';

export default function BiomarkerPanel({ biomarkers, onChange }) {
  const updateField = (field, val) => {
    onChange({
      ...biomarkers,
      [field]: val === '' ? '' : Number(val),
    });
  };

  const getAmhStatus = (val) => {
    if (val < 1.0) return { label: 'Low Reserve', class: 'range-borderline' };
    if (val <= 4.2) return { label: 'Normal (Physiological)', class: 'range-normal' };
    if (val <= 6.5) return { label: 'Elevated (Mild PCO)', class: 'range-borderline' };
    return { label: 'Severely Elevated (PCOS)', class: 'range-elevated' };
  };

  const amhStatus = getAmhStatus(biomarkers.amh);

  return (
    <div className="glass-card">
      <div className="card-header">
        <div className="card-title-group">
          <div className="card-title-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--indigo-400)', borderColor: 'rgba(99, 102, 241, 0.2)' }}>
            <Stethoscope size={20} />
          </div>
          <div>
            <h2 className="card-title">Clinical & Hormonal Biomarkers</h2>
            <p className="card-subtitle">
              Tabular Feature Pipeline (XGBoost Classifier // SMOTE Balanced)
            </p>
          </div>
        </div>

        <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.12)', color: 'var(--indigo-400)' }}>
          ROC-AUC: 0.74
        </span>
      </div>

      <div className="card-body">
        <div className="biomarkers-grid">
          {/* AMH */}
          <div className="input-field-card" style={{ gridColumn: 'span 2' }}>
            <div className="input-header">
              <span className="input-title">
                <Activity size={15} className="text-cyan" />
                Anti-Müllerian Hormone (AMH)
              </span>
              <span className={`input-range-badge ${amhStatus.class}`}>
                {amhStatus.label}
              </span>
            </div>

            <div className="input-row">
              <input
                type="range"
                min="0.5"
                max="20.0"
                step="0.05"
                value={biomarkers.amh || 0}
                onChange={(e) => updateField('amh', e.target.value)}
                className="field-slider"
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <input
                  type="number"
                  min="0"
                  max="40"
                  step="0.1"
                  value={biomarkers.amh ?? ''}
                  onChange={(e) => updateField('amh', e.target.value)}
                  className="num-input"
                />
                <span className="input-unit">ng/mL</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="field-helper">
                Primary serum biomarker. Diagnostic reference: 1.5 - 4.2 ng/mL.
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Top SHAP Feature
              </span>
            </div>
          </div>

          {/* I beta-HCG */}
          <div className="input-field-card">
            <div className="input-header">
              <span className="input-title">
                I &beta;-HCG Reading
              </span>
              <span className="input-unit">mIU/mL</span>
            </div>

            <div className="input-row">
              <input
                type="range"
                min="0"
                max="1000"
                step="5"
                value={biomarkers.betaHcg1 || 0}
                onChange={(e) => updateField('betaHcg1', e.target.value)}
                className="field-slider"
              />
              <input
                type="number"
                min="0"
                max="2000"
                step="1"
                value={biomarkers.betaHcg1 ?? ''}
                onChange={(e) => updateField('betaHcg1', e.target.value)}
                className="num-input"
              />
            </div>
            <span className="field-helper">Baseline serum human chorionic gonadotropin.</span>
          </div>

          {/* II beta-HCG */}
          <div className="input-field-card">
            <div className="input-header">
              <span className="input-title">
                II &beta;-HCG Reading
              </span>
              <span className="input-unit">mIU/mL</span>
            </div>

            <div className="input-row">
              <input
                type="range"
                min="0"
                max="1000"
                step="5"
                value={biomarkers.betaHcg2 || 0}
                onChange={(e) => updateField('betaHcg2', e.target.value)}
                className="field-slider"
              />
              <input
                type="number"
                min="0"
                max="2000"
                step="1"
                value={biomarkers.betaHcg2 ?? ''}
                onChange={(e) => updateField('betaHcg2', e.target.value)}
                className="num-input"
              />
            </div>
            <span className="field-helper">Follow-up / confirmation titer measurement.</span>
          </div>

          {/* BMI */}
          <div className="input-field-card">
            <div className="input-header">
              <span className="input-title">
                <Scale size={14} className="text-teal" />
                Body Mass Index (BMI)
              </span>
              <span className="input-unit">kg/m²</span>
            </div>

            <div className="input-row">
              <input
                type="range"
                min="16"
                max="45"
                step="0.1"
                value={biomarkers.bmi || 22}
                onChange={(e) => updateField('bmi', e.target.value)}
                className="field-slider"
              />
              <input
                type="number"
                min="14"
                max="60"
                step="0.1"
                value={biomarkers.bmi ?? ''}
                onChange={(e) => updateField('bmi', e.target.value)}
                className="num-input"
              />
            </div>
            <span className="field-helper">
              {biomarkers.bmi > 25 ? 'Overweight / Metabolic Risk Factor' : 'Normal Weight Range'}
            </span>
          </div>

          {/* Menstrual Cycle Length */}
          <div className="input-field-card">
            <div className="input-header">
              <span className="input-title">
                <Calendar size={14} className="text-amber" />
                Cycle Interval
              </span>
              <span className="input-unit">Days</span>
            </div>

            <div className="input-row">
              <input
                type="range"
                min="20"
                max="90"
                step="1"
                value={biomarkers.cycleLength || 28}
                onChange={(e) => updateField('cycleLength', e.target.value)}
                className="field-slider"
              />
              <input
                type="number"
                min="15"
                max="120"
                step="1"
                value={biomarkers.cycleLength ?? ''}
                onChange={(e) => updateField('cycleLength', e.target.value)}
                className="num-input"
              />
            </div>
            <span className="field-helper">
              {biomarkers.cycleLength > 35 ? 'Oligomenorrhea (>35 days)' : 'Regular Cycle (21-35 days)'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
