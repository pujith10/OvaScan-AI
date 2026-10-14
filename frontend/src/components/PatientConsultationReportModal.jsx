import React from 'react';
import { X, Printer, Download, Stethoscope, AlertTriangle, CheckCircle, FileText } from 'lucide-react';

export default function PatientConsultationReportModal({
  isOpen,
  onClose,
  intakeData,
  triageAnalysis,
}) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJson = () => {
    const dataToSave = {
      reportType: 'Patient Self-Assessment & Doctor Consultation Dossier',
      timestamp: new Date().toISOString(),
      intakeData,
      triageAnalysis,
    };
    const blob = new Blob([JSON.stringify(dataToSave, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PCOS_Consultation_Dossier_${intakeData.fullName?.replace(/\s+/g, '_') || 'Patient'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const bmi = intakeData.weight && intakeData.height 
    ? (intakeData.weight / Math.pow(intakeData.height / 100, 2)).toFixed(1)
    : 'N/A';

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-window" style={{ maxWidth: '860px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div className="card-title-icon" style={{ background: 'rgba(14, 165, 233, 0.1)', color: 'var(--cyan-400)' }}>
              <Stethoscope size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                Doctor Consultation Intake Dossier
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Structured Clinical Summary for Gynecologist / Endocrinologist Visit
              </p>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Body / Printable Sheet */}
        <div className="modal-body">
          <div className="report-sheet" id="printable-consultation-dossier">
            {/* Header banner */}
            <div className="report-header">
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                  PCOS CLINICAL INTAKE & SYMPTOM DOSSIER
                </h2>
                <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
                  Patient-Reported Medical History // Prepared for Physician Consultation
                </p>
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#475569' }}>
                <div><strong>Dossier Date:</strong> {new Date().toLocaleDateString()}</div>
                <div><strong>Consultation Type:</strong> Initial Diagnostic Triage</div>
              </div>
            </div>

            {/* Demographics / Patient Banner */}
            <table className="report-table">
              <tbody>
                <tr>
                  <td><strong>Patient Name:</strong> {intakeData.fullName || 'Not specified'}</td>
                  <td><strong>Age:</strong> {intakeData.age ? `${intakeData.age} years` : 'N/A'}</td>
                  <td><strong>LMP (Last Period):</strong> {intakeData.lmpDate || 'Not recorded'}</td>
                </tr>
                <tr>
                  <td><strong>Height / Weight:</strong> {intakeData.height || '--'} cm / {intakeData.weight || '--'} kg</td>
                  <td><strong>Calculated BMI:</strong> {bmi} kg/m²</td>
                  <td><strong>Blood Pressure:</strong> {intakeData.bloodPressure || 'Not measured'}</td>
                </tr>
                <tr>
                  <td colSpan="3">
                    <strong>Primary Reason for Consultation: </strong> 
                    {intakeData.chiefComplaint || 'Evaluation for suspected polycystic ovary syndrome (PCOS) and cycle irregularity'}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Triage & Rotterdam Criteria Check */}
            <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '1rem', margin: '1rem 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
                  Rotterdam Diagnostic Criteria Self-Assessment
                </span>
                <span style={{ 
                  background: triageAnalysis.riskLevel === 'high' ? '#fee2e2' : triageAnalysis.riskLevel === 'moderate' ? '#fef3c7' : '#ecfdf5',
                  color: triageAnalysis.riskLevel === 'high' ? '#b91c1c' : triageAnalysis.riskLevel === 'moderate' ? '#b45309' : '#047857',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '999px',
                  fontWeight: 700,
                  fontSize: '0.75rem'
                }}>
                  {triageAnalysis.riskLevel === 'high' ? 'High Symptom Correlation' : triageAnalysis.riskLevel === 'moderate' ? 'Moderate Symptom Burden' : 'Mild / Low Correlation'}
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: '1.5', margin: 0 }}>
                {triageAnalysis.summary}
              </p>
              <div style={{ marginTop: '0.65rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem' }}>
                <div>&bull; <strong>Ovulatory Dysfunction: </strong> {intakeData.cycleRegularity !== 'regular' ? 'YES (Reported)' : 'Regular'}</div>
                <div>&bull; <strong>Hyperandrogenism Signs: </strong> {triageAnalysis.hasHyperandrogenism ? 'YES (Hirsutism/Acne/Hair Loss)' : 'None reported'}</div>
                <div>&bull; <strong>Metabolic / Weight Factors: </strong> {triageAnalysis.hasMetabolicSigns ? 'Present' : 'Not reported'}</div>
                <div>&bull; <strong>Pelvic Ultrasound: </strong> Pending Physician Order</div>
              </div>
            </div>

            {/* Menstrual Cycle History */}
            <h4 style={{ fontSize: '0.92rem', color: '#0f172a', margin: '1.25rem 0 0.4rem 0' }}>
              1. Gynecological & Menstrual History
            </h4>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Cycle Regularity</th>
                  <th>Typical Interval</th>
                  <th>Flow Duration</th>
                  <th>Flow Volume</th>
                  <th>Dysmenorrhea (Cramping)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 600, color: intakeData.cycleRegularity !== 'regular' ? '#b91c1c' : '#0f172a' }}>
                    {intakeData.cycleRegularity === 'absent' 
                      ? 'Absent / Amenorrhea (>3 mos)' 
                      : intakeData.cycleRegularity === 'irregular' 
                      ? 'Irregular / Unpredictable' 
                      : 'Regular (21-35 days)'}
                  </td>
                  <td>{intakeData.cycleLength ? `${intakeData.cycleLength} days` : 'Variable'}</td>
                  <td>{intakeData.periodDuration ? `${intakeData.periodDuration} days` : '3-5 days'}</td>
                  <td>{intakeData.flowIntensity || 'Normal'}</td>
                  <td>{intakeData.crampSeverity ? `Score ${intakeData.crampSeverity}/10` : 'Mild'}</td>
                </tr>
              </tbody>
            </table>

            {/* Physical & Androgenic Symptoms */}
            <h4 style={{ fontSize: '0.92rem', color: '#0f172a', margin: '1.25rem 0 0.4rem 0' }}>
              2. Androgenic & Cutaneous Manifestations
            </h4>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Clinical Sign</th>
                  <th>Reported Severity</th>
                  <th>Specific Locations / Details</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Facial & Body Hirsutism</strong></td>
                  <td style={{ color: intakeData.hirsutism !== 'none' ? '#b91c1c' : '#0f172a', fontWeight: 600 }}>
                    {intakeData.hirsutism || 'None'}
                  </td>
                  <td>{intakeData.hirsutismAreas?.join(', ') || 'N/A'}</td>
                </tr>
                <tr>
                  <td><strong>Hormonal Acne</strong></td>
                  <td style={{ color: intakeData.acne !== 'none' ? '#b91c1c' : '#0f172a', fontWeight: 600 }}>
                    {intakeData.acne || 'None'}
                  </td>
                  <td>{intakeData.acneLocation || 'Jawline/chin distribution'}</td>
                </tr>
                <tr>
                  <td><strong>Scalp Hair Loss / Alopecia</strong></td>
                  <td>{intakeData.hairLoss || 'None'}</td>
                  <td>Androgenic crown/part thinning</td>
                </tr>
                <tr>
                  <td><strong>Acanthosis Nigricans (Dark Patches)</strong></td>
                  <td>{intakeData.darkPatches ? 'Present (Neck/Armpits)' : 'Absent'}</td>
                  <td>Marker for hyperinsulinemia</td>
                </tr>
                <tr>
                  <td><strong>Skin Tags</strong></td>
                  <td>{intakeData.skinTags ? 'Present' : 'Absent'}</td>
                  <td>Insulin resistance associated</td>
                </tr>
              </tbody>
            </table>

            {/* Metabolic, Energy & Family History */}
            <h4 style={{ fontSize: '0.92rem', color: '#0f172a', margin: '1.25rem 0 0.4rem 0' }}>
              3. Metabolic Profile, Lifestyle & Family History
            </h4>
            <table className="report-table">
              <tbody>
                <tr>
                  <td style={{ width: '35%' }}><strong>Weight Pattern:</strong></td>
                  <td>{intakeData.weightPattern || 'Stable'}</td>
                </tr>
                <tr>
                  <td><strong>Daily Sleep Duration:</strong></td>
                  <td>
                    <strong>{intakeData.sleepHours || 7.5} hours / day</strong> 
                    <span style={{ marginLeft: '0.5rem', color: (intakeData.sleepHours || 7.5) < 6 ? '#b91c1c' : (intakeData.sleepHours || 7.5) <= 8.5 ? '#047857' : '#b45309', fontWeight: 600 }}>
                      ({(intakeData.sleepHours || 7.5) < 6 ? 'Short Sleep / Cortisol Dysregulation Risk' : (intakeData.sleepHours || 7.5) < 7 ? 'Sub-optimal Sleep Duration' : (intakeData.sleepHours || 7.5) <= 8.5 ? 'Optimal Sleep Duration' : 'Prolonged Sleep Duration'})
                    </span>
                    <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '0.15rem' }}>
                      Reported Quality: {intakeData.sleepIssues || 'Normal restful sleep'}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td><strong>Metabolic Signs:</strong></td>
                  <td>
                    Sugar cravings: {intakeData.sugarCravings ? 'Frequent / Intense' : 'Normal'} | 
                    Post-meal fatigue: {intakeData.postMealCrash ? 'Yes (Reactive)' : 'No'}
                  </td>
                </tr>
                <tr>
                  <td><strong>Fertility / Conception Status:</strong></td>
                  <td>{intakeData.conceptionStatus || 'Not actively trying'}</td>
                </tr>
                <tr>
                  <td><strong>Family Medical History:</strong></td>
                  <td>{intakeData.familyHistory?.join(', ') || 'No known family history reported'}</td>
                </tr>
                <tr>
                  <td><strong>Current Medications / Supplements:</strong></td>
                  <td>{intakeData.currentMeds || 'None reported'}</td>
                </tr>
              </tbody>
            </table>

            {/* Self-reported Known Labs */}
            {intakeData.hasPriorLabs && (
              <>
                <h4 style={{ fontSize: '0.92rem', color: '#0f172a', margin: '1.25rem 0 0.4rem 0' }}>
                  4. Patient-Supplied Prior Lab Values (Self-Reported)
                </h4>
                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                  {intakeData.labAmh && <div><strong>AMH:</strong> {intakeData.labAmh} ng/mL</div>}
                  {intakeData.labTestosterone && <div><strong>Total Testosterone:</strong> {intakeData.labTestosterone} ng/dL</div>}
                  {intakeData.labGlucose && <div><strong>Fasting Glucose:</strong> {intakeData.labGlucose} mg/dL</div>}
                  {intakeData.labTsh && <div><strong>TSH:</strong> {intakeData.labTsh} mIU/L</div>}
                  {intakeData.labLhFsh && <div><strong>LH/FSH Ratio:</strong> {intakeData.labLhFsh}</div>}
                </div>
              </>
            )}

            {/* Structured Questions for Attending Doctor */}
            <div style={{ marginTop: '1.5rem', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '1rem' }}>
              <h4 style={{ fontSize: '0.88rem', color: '#1e40af', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Stethoscope size={15} /> Questions Prepared for Attending Physician
              </h4>
              <ol style={{ fontSize: '0.8rem', color: '#1e3a8a', paddingLeft: '1.2rem', lineHeight: '1.6', margin: 0 }}>
                <li>Based on my reported cycle interval ({intakeData.cycleLength || 'variable'} days) and symptoms, do my signs warrant formal diagnosis under the Rotterdam Criteria?</li>
                <li>Should we order a baseline androgen and metabolic panel (Total/Free Testosterone, DHEA-S, 75g 2-hour Oral Glucose Tolerance Test, Lipid Panel, Fasting Insulin)?</li>
                <li>Is a pelvic ultrasound scan recommended to evaluate ovarian follicular volume and endometrial thickness?</li>
                <li>Would targeted therapies such as Myo-Inositol, Metformin, or cycle-regulating interventions be suitable for my phenotypic presentation?</li>
              </ol>
            </div>

            {/* Doctor Sign-off Block */}
            <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '1.5rem', borderTop: '1px dashed #cbd5e1', fontSize: '0.8rem', color: '#475569' }}>
              <div>
                <div>Dossier Generated via OvaScan Health Intake</div>
                <div>Rotterdam Diagnostic Support Aid</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '180px', borderBottom: '1px solid #0f172a', marginBottom: '0.35rem' }} />
                <div>Physician Review & Clinical Notes</div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button className="btn-secondary" onClick={handleDownloadJson}>
            <Download size={15} />
            <span>Download JSON Dossier</span>
          </button>
          <button className="btn-primary" onClick={handlePrint}>
            <Printer size={15} />
            <span>Print Clinical Dossier for Doctor</span>
          </button>
        </div>
      </div>
    </div>
  );
}
