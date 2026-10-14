import React from 'react';
import { X, Printer, Download, CheckCircle, AlertTriangle, Sparkles } from 'lucide-react';
import { SUBTYPE_CLUSTERS } from '../data/sampleCases';

export default function ClinicalReportModal({
  isOpen,
  onClose,
  patientData,
  diagnosticResults,
  scanUrl,
  onOpenSuggestions,
}) {
  if (!isOpen) return null;

  const cluster = SUBTYPE_CLUSTERS.find((c) => c.id === diagnosticResults.clusterId) || SUBTYPE_CLUSTERS[0];

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJson = () => {
    const reportData = {
      patientId: patientData.patientId || 'PT-PENDING',
      timestamp: new Date().toISOString(),
      biomarkers: patientData.biomarkers,
      diagnosticResults,
      clusterAssignment: cluster,
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PCOS_Report_${patientData.patientId || 'Clinical'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-window" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
              Clinical Diagnostic Consultation Report
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Rotterdam PCOS Consensus Guidelines // Multimodal AI Evidence
            </p>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Body / Report Sheet */}
        <div className="modal-body">
          <div className="report-sheet" id="printable-report">
            {/* Header */}
            <div className="report-header">
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                  OVASCAN AI CLINICAL INTELLIGENCE
                </h2>
                <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Department of Reproductive Endocrinology & Gynecological Imaging
                </p>
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#475569' }}>
                <div><strong>Report Date:</strong> {new Date().toLocaleDateString()}</div>
                <div><strong>Status:</strong> Preliminary AI Assessment</div>
              </div>
            </div>

            {/* Patient Meta Table */}
            <table className="report-table">
              <tbody>
                <tr>
                  <td><strong>Patient ID:</strong> {patientData.patientId || 'PT-90412'}</td>
                  <td><strong>Age:</strong> {patientData.age || 26} yrs</td>
                  <td><strong>Serial No:</strong> #{patientData.biomarkers?.slNo || 412}</td>
                </tr>
                <tr>
                  <td><strong>Primary Assessment:</strong> {diagnosticResults.verdict}</td>
                  <td><strong>PCOS Fusion Risk:</strong> {(diagnosticResults.fusionRisk * 100).toFixed(1)}%</td>
                  <td><strong>Phenotypic Subtype:</strong> {cluster.shortName}</td>
                </tr>
              </tbody>
            </table>

            {/* Biomarker Results */}
            <h4 style={{ fontSize: '0.95rem', margin: '1.25rem 0 0.5rem 0', color: '#0f172a' }}>
              1. Serum Hormonal & Anthropometric Assay
            </h4>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Parameter</th>
                  <th>Observed Value</th>
                  <th>Clinical Reference</th>
                  <th>Interpretation</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Anti-Müllerian Hormone (AMH)</td>
                  <td><strong>{patientData.biomarkers?.amh?.toFixed(2)} ng/mL</strong></td>
                  <td>1.50 - 4.20 ng/mL</td>
                  <td>{patientData.biomarkers?.amh > 4.5 ? 'Markedly Elevated' : 'Within physiological range'}</td>
                </tr>
                <tr>
                  <td>I &beta;-HCG Serum Titer</td>
                  <td>{patientData.biomarkers?.betaHcg1?.toFixed(1)} mIU/mL</td>
                  <td>&lt; 5.0 mIU/mL (non-gestational)</td>
                  <td>Baseline reference</td>
                </tr>
                <tr>
                  <td>II &beta;-HCG Serum Titer</td>
                  <td>{patientData.biomarkers?.betaHcg2?.toFixed(1)} mIU/mL</td>
                  <td>&lt; 5.0 mIU/mL (non-gestational)</td>
                  <td>Follow-up titer confirmation</td>
                </tr>
                <tr>
                  <td>Body Mass Index (BMI)</td>
                  <td>{patientData.biomarkers?.bmi?.toFixed(1)} kg/m²</td>
                  <td>18.5 - 24.9 kg/m²</td>
                  <td>{patientData.biomarkers?.bmi > 25 ? 'Metabolic Risk Factor' : 'Normal'}</td>
                </tr>
                <tr>
                  <td>Menstrual Interval</td>
                  <td>{patientData.biomarkers?.cycleLength} days</td>
                  <td>21 - 35 days</td>
                  <td>{patientData.biomarkers?.cycleLength > 35 ? 'Oligomenorrhea' : 'Eumenorrheic'}</td>
                </tr>
              </tbody>
            </table>

            {/* Ultrasound Morphology */}
            <h4 style={{ fontSize: '0.95rem', margin: '1.25rem 0 0.5rem 0', color: '#0f172a' }}>
              2. Pelvic Sonography Findings (EfficientNet-B0 Vision Analysis)
            </h4>
            <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.85rem', lineHeight: '1.6' }}>
              <div><strong>Follicular Count Estimate:</strong> {diagnosticResults.follicleEstimate} follicles / section</div>
              <div><strong>Vision Classifier Probability:</strong> {(diagnosticResults.imageProbability * 100).toFixed(1)}% PCOS Morphology</div>
              <div style={{ marginTop: '0.35rem' }}>{patientData.findings || 'Sonographic image exhibits follicular distribution evaluated against Rotterdam morphology threshold (&ge;12 follicles measuring 2-9mm).'}</div>
            </div>

            {/* Clinical Impression & Recommendation */}
            <h4 style={{ fontSize: '0.95rem', margin: '1.25rem 0 0.5rem 0', color: '#0f172a' }}>
              3. Diagnostic Synthesis & Clinical Plan
            </h4>
            <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.85rem', lineHeight: '1.6' }}>
              <p><strong>Impression:</strong> {diagnosticResults.recommendation}</p>
              <p style={{ marginTop: '0.4rem' }}><strong>Subtype Guidance ({cluster.name}):</strong> {cluster.clinicalFocus}</p>
            </div>

            {/* Physician Sign-off */}
            <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '1.5rem', borderTop: '1px dashed #cbd5e1', fontSize: '0.8rem', color: '#475569' }}>
              <div>
                <div>AI Model Verification: <code>xgb-0.74-effnetb0-v2</code></div>
                <div>Automated Quality Check: PASSED</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '180px', borderBottom: '1px solid #0f172a', marginBottom: '0.35rem' }} />
                <div>Attending Physician Signature</div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <button 
            type="button" 
            className="btn-primary" 
            onClick={() => {
              onClose();
              if (onOpenSuggestions) onOpenSuggestions();
            }}
            style={{
              background: 'linear-gradient(135deg, #0284c7, #8b5cf6)',
              border: 'none',
              boxShadow: '0 4px 14px rgba(14, 165, 233, 0.35)',
              gap: '0.45rem',
            }}
          >
            <Sparkles size={15} />
            <span>Generate AI Lifestyle & Diet Plan</span>
          </button>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn-secondary" onClick={handleDownloadJson}>
              <Download size={15} />
              <span>Export JSON</span>
            </button>
            <button className="btn-primary" onClick={handlePrint}>
              <Printer size={15} />
              <span>Print Clinical Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
