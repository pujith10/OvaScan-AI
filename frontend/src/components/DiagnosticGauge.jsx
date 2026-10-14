import React from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  TrendingUp, 
  GitMerge, 
  AlertOctagon,
  ShieldAlert,
  Sparkles,
  FileText
} from 'lucide-react';

export default function DiagnosticGauge({
  fusionRisk = 0.5,
  imageProbability = 0.5,
  tabularProbability = 0.5,
  verdict = 'Borderline',
  riskCategory = 'borderline',
  recommendation = '',
  shapContributions = [],
  isValidUltrasound = true,
  onOpenSuggestions,
  onOpenReport,
}) {
  const isInvalid = !isValidUltrasound || riskCategory === 'invalid-scan';
  const percentage = isInvalid ? 0 : Math.round(fusionRisk * 100);
  const radius = 76;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = isInvalid 
    ? circumference 
    : circumference - (percentage / 100) * circumference;

  let strokeColor = 'var(--cyan-400)';
  if (isInvalid) strokeColor = 'var(--rose-500)';
  else if (riskCategory === 'high') strokeColor = 'var(--rose-500)';
  else if (riskCategory === 'low') strokeColor = 'var(--emerald-400)';
  else strokeColor = 'var(--amber-400)';

  return (
    <div className="glass-card results-summary-card">
      <div className="card-header">
        <div className="card-title-group">
          <div className="card-title-icon" style={{ background: isInvalid ? 'rgba(244, 63, 94, 0.1)' : 'rgba(244, 63, 94, 0.1)', color: 'var(--rose-400)', borderColor: 'rgba(244, 63, 94, 0.2)' }}>
            <GitMerge size={20} />
          </div>
          <div>
            <h2 className="card-title">Multimodal Fusion & Risk Synthesis</h2>
            <p className="card-subtitle">
              Late Fusion Architecture (Keras Dense 64 &rarr; 32 &rarr; Sigmoid)
            </p>
          </div>
        </div>

        <span className="badge" style={{ 
          background: isInvalid ? 'rgba(244, 63, 94, 0.15)' : 'rgba(56, 189, 248, 0.1)', 
          color: isInvalid ? 'var(--rose-400)' : 'var(--cyan-400)',
          border: isInvalid ? '1px solid rgba(244, 63, 94, 0.3)' : 'none'
        }}>
          {isInvalid ? 'Domain Check: FAILED' : 'Rotterdam Clinical Criteria'}
        </span>
      </div>

      <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Main Gauge and Verdict Row */}
        <div className="gauge-row">
          {/* Animated Circular Gauge */}
          <div className="gauge-wrapper">
            <svg className="gauge-svg" viewBox="0 0 190 190">
              <circle
                cx="95"
                cy="95"
                r={radius}
                className="gauge-bg-circle"
              />
              <circle
                cx="95"
                cy="95"
                r={radius}
                className="gauge-progress-circle"
                stroke={strokeColor}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
              />
            </svg>
            <div className="gauge-inner-content">
              <span className="gauge-percentage" style={{ color: strokeColor }}>
                {isInvalid ? 'N/A' : `${percentage}%`}
              </span>
              <span className="gauge-label">
                {isInvalid ? 'Invalid Scan' : 'PCOS Risk'}
              </span>
            </div>
          </div>

          {/* Verdict Box */}
          <div className="verdict-box">
            <div
              className={`verdict-badge ${
                isInvalid
                  ? 'pcos-positive'
                  : riskCategory === 'high'
                  ? 'pcos-positive'
                  : riskCategory === 'low'
                  ? 'pcos-negative'
                  : 'pcos-borderline'
              }`}
            >
              {isInvalid && <AlertOctagon size={16} />}
              {!isInvalid && riskCategory === 'high' && <AlertTriangle size={16} />}
              {!isInvalid && riskCategory === 'low' && <CheckCircle2 size={16} />}
              {!isInvalid && riskCategory === 'borderline' && <HelpCircle size={16} />}
              <span>{verdict}</span>
            </div>

            <p className="verdict-summary" style={{ color: isInvalid ? 'var(--rose-400)' : 'var(--text-secondary)' }}>
              {recommendation}
            </p>
          </div>
        </div>

        {/* Modality Split Breakdown */}
        <div className="modality-breakdown-row">
          {/* Ultrasound Modality */}
          <div className="modality-card" style={{ borderColor: isInvalid ? 'rgba(244, 63, 94, 0.3)' : 'var(--border-subtle)' }}>
            <div className="modality-header">
              <span className="modality-name">
                <span className="pulse-dot" style={{ background: isInvalid ? 'var(--rose-400)' : 'var(--cyan-400)' }} />
                Ultrasound Image Vision
              </span>
              <span className="modality-score" style={{ color: isInvalid ? 'var(--rose-400)' : 'var(--cyan-400)' }}>
                {isInvalid ? 'REJECTED' : `${(imageProbability * 100).toFixed(1)}%`}
              </span>
            </div>
            <div className="modality-bar-bg">
              <div
                className="modality-bar-fill"
                style={{
                  width: isInvalid ? '0%' : `${imageProbability * 100}%`,
                  background: isInvalid ? 'var(--rose-400)' : 'var(--cyan-400)',
                }}
              />
            </div>
            <span style={{ fontSize: '0.7rem', color: isInvalid ? 'var(--rose-400)' : 'var(--text-muted)' }}>
              {isInvalid ? 'OOD: Non-sonogram color image detected' : 'Weight in Fusion: 55% (EfficientNet-B0)'}
            </span>
          </div>

          {/* Tabular Modality */}
          <div className="modality-card">
            <div className="modality-header">
              <span className="modality-name">
                <span className="pulse-dot" style={{ background: 'var(--indigo-400)' }} />
                Hormonal & Biomarkers
              </span>
              <span className="modality-score" style={{ color: 'var(--indigo-400)' }}>
                {tabularProbability !== null ? `${(tabularProbability * 100).toFixed(1)}%` : 'Standby'}
              </span>
            </div>
            <div className="modality-bar-bg">
              <div
                className="modality-bar-fill"
                style={{
                  width: tabularProbability !== null ? `${tabularProbability * 100}%` : '0%',
                  background: 'var(--indigo-400)',
                }}
              />
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Weight in Fusion: 45% (XGBoost Classifier)
            </span>
          </div>
        </div>

        {/* SHAP Feature Contribution Indicators */}
        {!isInvalid && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <TrendingUp size={13} /> SHAP Model Explainability Attribution
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                TreeExplainer Local Attribution
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.65rem' }}>
              {shapContributions.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.55rem 0.75rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 600 }}>{item.feature}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {item.value}
                    </div>
                  </div>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: item.impact >= 0 ? 'var(--rose-400)' : 'var(--emerald-400)',
                    }}
                  >
                    {item.impact >= 0 ? `+${item.impact}%` : `${item.impact}%`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Suggestions & Protocol Action Bar */}
        <div style={{ display: 'flex', gap: '0.65rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
          {onOpenSuggestions && (
            <button
              type="button"
              className="btn-primary"
              onClick={onOpenSuggestions}
              style={{
                flex: '1 1 240px',
                background: 'linear-gradient(135deg, #0284c7, #8b5cf6)',
                border: 'none',
                boxShadow: '0 4px 14px rgba(14, 165, 233, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
                padding: '0.7rem 1rem',
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
            >
              <Sparkles size={16} />
              <span>Generate 7-Day Diet & Home Workout Plan</span>
            </button>
          )}

          {onOpenReport && (
            <button
              type="button"
              className="btn-secondary"
              onClick={onOpenReport}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                fontSize: '0.82rem',
                padding: '0.7rem 1rem',
              }}
            >
              <FileText size={15} />
              <span>View Clinical Report</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
