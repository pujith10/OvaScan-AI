import React, { useState, useMemo } from 'react';
import { 
  ClipboardList, 
  User, 
  Calendar, 
  Sparkles, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Heart, 
  Scale, 
  Activity, 
  ShieldAlert,
  Printer,
  HelpCircle,
  Stethoscope,
  RotateCcw,
  Moon
} from 'lucide-react';
import PatientConsultationReportModal from './PatientConsultationReportModal';

export default function PatientIntakeTab() {
  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    age: 26,
    height: 165,
    weight: 68,
    bloodPressure: '120/80',
    chiefComplaint: 'Irregular menstrual cycles, persistent chin breakouts, and difficulty managing weight.',
    
    // Menstrual Cycle
    cycleRegularity: 'irregular', // regular, irregular, absent
    cycleLength: 42,
    periodDuration: 5,
    flowIntensity: 'Normal', // Light, Normal, Heavy
    crampSeverity: 6, // 1 - 10
    lmpDate: '',

    // Androgenic / Skin Symptoms
    hirsutism: 'moderate', // none, mild, moderate, severe
    hirsutismAreas: ['Chin / Jawline', 'Upper Lip'],
    acne: 'moderate', // none, mild, moderate, severe
    acneLocation: 'Jawline & Chin',
    hairLoss: 'mild', // none, mild, moderate, severe
    darkPatches: true, // Acanthosis Nigricans
    skinTags: false,

    // Metabolic & Energy
    weightPattern: 'Difficulty losing weight despite diet/exercise',
    sugarCravings: true,
    postMealCrash: true,
    sleepHours: 6.5,
    sleepIssues: 'Trouble falling asleep / occasional fatigue',
    energyLevel: 'Frequently fatigued / Brain fog',

    // Reproductive & Family History
    conceptionStatus: 'Not actively trying',
    hasOvarianCystHistory: 'Never had an ultrasound / Unsure',
    familyHistory: ['Mother with Type 2 Diabetes', 'Sister with irregular cycles'],
    currentMeds: 'Daily multivitamin, considering Myo-Inositol',

    // Optional past lab work
    hasPriorLabs: false,
    labAmh: '',
    labTestosterone: '',
    labGlucose: '',
    labTsh: '',
    labLhFsh: '',
  });

  const [isReportOpen, setIsReportOpen] = useState(false);

  // Field update helper
  const update = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const toggleArrayItem = (field, item) => {
    setFormData((prev) => {
      const current = prev[field] || [];
      if (current.includes(item)) {
        return { ...prev, [field]: current.filter((x) => x !== item) };
      } else {
        return { ...prev, [field]: [...current, item] };
      }
    });
  };

  // BMI calculation
  const bmi = useMemo(() => {
    if (!formData.height || !formData.weight) return 0;
    const hInMeters = formData.height / 100;
    return Number((formData.weight / (hInMeters * hInMeters)).toFixed(1));
  }, [formData.height, formData.weight]);

  const bmiCategory = useMemo(() => {
    if (bmi < 18.5) return { label: 'Underweight', color: 'var(--amber-400)' };
    if (bmi < 25) return { label: 'Normal Weight', color: 'var(--emerald-400)' };
    if (bmi < 30) return { label: 'Overweight', color: 'var(--amber-400)' };
    return { label: 'Obese (Metabolic Risk)', color: 'var(--rose-400)' };
  }, [bmi]);

  // Live Symptom Burden & Rotterdam Triage Analysis
  const triageAnalysis = useMemo(() => {
    let score = 0;

    // 1. Ovulatory Dysfunction (Rotterdam Criterion 1)
    let ovulatoryDysfunction = false;
    if (formData.cycleRegularity === 'absent') {
      score += 35;
      ovulatoryDysfunction = true;
    } else if (formData.cycleRegularity === 'irregular' || formData.cycleLength > 35) {
      score += 28;
      ovulatoryDysfunction = true;
    }

    // 2. Clinical Hyperandrogenism (Rotterdam Criterion 2)
    let hasHyperandrogenism = false;
    let androgenScore = 0;
    if (formData.hirsutism === 'severe') androgenScore += 22;
    else if (formData.hirsutism === 'moderate') androgenScore += 16;
    else if (formData.hirsutism === 'mild') androgenScore += 8;

    if (formData.acne === 'severe') androgenScore += 14;
    else if (formData.acne === 'moderate') androgenScore += 10;
    else if (formData.acne === 'mild') androgenScore += 4;

    if (formData.hairLoss === 'severe' || formData.hairLoss === 'moderate') androgenScore += 10;
    else if (formData.hairLoss === 'mild') androgenScore += 5;

    if (androgenScore >= 12) {
      hasHyperandrogenism = true;
      score += Math.min(35, androgenScore);
    } else {
      score += androgenScore;
    }

    // 3. Metabolic Factors (Hyperinsulinemia / Acanthosis Nigricans)
    let hasMetabolicSigns = false;
    if (formData.darkPatches) {
      score += 12;
      hasMetabolicSigns = true;
    }
    if (formData.sugarCravings && formData.postMealCrash) {
      score += 10;
      hasMetabolicSigns = true;
    }
    if (bmi >= 27) {
      score += 10;
      hasMetabolicSigns = true;
    }

    // 4. Family History
    if (formData.familyHistory?.length > 0) {
      score += 8;
    }

    const cappedScore = Math.min(96, Math.max(12, score));

    let riskLevel = 'low';
    let summary = '';
    if (cappedScore >= 60 || (ovulatoryDysfunction && hasHyperandrogenism)) {
      riskLevel = 'high';
      summary = 'Your reported symptom profile exhibits strong concordance with the Rotterdam Consensus diagnostic criteria for PCOS (both ovulatory irregularity and androgenic features reported). It is strongly advised to consult a physician with this dossier.';
    } else if (cappedScore >= 38) {
      riskLevel = 'moderate';
      summary = 'Several clinical markers of hormonal or metabolic imbalance are present. A comprehensive endocrine review and pelvic sonography are recommended.';
    } else {
      riskLevel = 'low';
      summary = 'Symptom burden appears physiological or mild. Discuss any ongoing cycle variations with your healthcare provider during your annual checkup.';
    }

    return {
      score: cappedScore,
      riskLevel,
      ovulatoryDysfunction,
      hasHyperandrogenism,
      hasMetabolicSigns,
      summary,
    };
  }, [formData, bmi]);

  // Demo Case Loader
  const handleLoadDemo = () => {
    setFormData({
      fullName: 'Ananya Sharma',
      age: 27,
      height: 163,
      weight: 71,
      bloodPressure: '122/82',
      chiefComplaint: 'Irregular periods (every 40-50 days), severe chin acne breakouts, and inability to lose weight.',
      cycleRegularity: 'irregular',
      cycleLength: 46,
      periodDuration: 6,
      flowIntensity: 'Heavy with occasional clots',
      crampSeverity: 7,
      lmpDate: '2026-08-14',
      hirsutism: 'moderate',
      hirsutismAreas: ['Chin / Jawline', 'Upper Lip', 'Lower Abdomen'],
      acne: 'moderate',
      acneLocation: 'Jawline & Neck (Cystic)',
      hairLoss: 'moderate',
      darkPatches: true,
      skinTags: true,
      weightPattern: 'Unexplained weight gain of 6kg over past year, highly resistant to calorie restriction',
      sugarCravings: true,
      postMealCrash: true,
      sleepHours: 5.5,
      sleepIssues: 'Waking up unrefreshed, restless sleep',
      energyLevel: 'Afternoon energy crashes, brain fog',
      conceptionStatus: 'Planning for pregnancy within 1-2 years',
      hasOvarianCystHistory: 'Never had an ultrasound scan',
      familyHistory: ['Mother with Type 2 Diabetes', 'Maternal aunt with PCOS'],
      currentMeds: 'None',
      hasPriorLabs: false,
      labAmh: '',
      labTestosterone: '',
      labGlucose: '',
      labTsh: '',
      labLhFsh: '',
    });
  };

  const handleReset = () => {
    setFormData({
      fullName: '',
      age: 25,
      height: 165,
      weight: 60,
      bloodPressure: '120/80',
      chiefComplaint: '',
      cycleRegularity: 'regular',
      cycleLength: 28,
      periodDuration: 4,
      flowIntensity: 'Normal',
      crampSeverity: 3,
      lmpDate: '',
      hirsutism: 'none',
      hirsutismAreas: [],
      acne: 'none',
      acneLocation: '',
      hairLoss: 'none',
      darkPatches: false,
      skinTags: false,
      weightPattern: 'Stable weight',
      sugarCravings: false,
      postMealCrash: false,
      sleepHours: 7.5,
      sleepIssues: 'Normal sleep',
      energyLevel: 'Normal energy',
      conceptionStatus: 'Not actively trying',
      hasOvarianCystHistory: 'Never had one',
      familyHistory: [],
      currentMeds: 'None',
      hasPriorLabs: false,
      labAmh: '',
      labTestosterone: '',
      labGlucose: '',
      labTsh: '',
      labLhFsh: '',
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Banner */}
      <section className="hero-banner" style={{ background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.12) 0%, rgba(14, 165, 233, 0.08) 50%, rgba(99, 102, 241, 0.06) 100%)', borderColor: 'var(--teal-400)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem' }}>
            <span className="badge" style={{ background: 'rgba(20, 184, 166, 0.15)', color: 'var(--teal-400)', border: '1px solid rgba(20, 184, 166, 0.3)' }}>
              <ClipboardList size={13} /> Patient Self-Assessment
            </span>
            <span className="badge" style={{ background: 'rgba(56, 189, 248, 0.15)', color: 'var(--cyan-400)', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
              <Stethoscope size={13} /> Zero Ultrasound Required
            </span>
          </div>
          <h1 className="hero-title">
            Patient Symptom Intake & Doctor Consultation Dossier
          </h1>
          <p className="hero-desc">
            No medical imaging needed. Enter your personal health details, menstrual cycle patterns, and physical symptoms to generate a structured, professional clinical report ready to hand directly to your doctor.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
          <button className="btn-secondary" onClick={handleLoadDemo} title="Populate realistic sample patient profile">
            <Sparkles size={14} className="text-teal" />
            <span>Load Sample Intake</span>
          </button>
          <button className="btn-icon" onClick={handleReset} title="Clear and reset all form inputs">
            <RotateCcw size={15} />
          </button>
        </div>
      </section>

      {/* Main Form + Live Triage Layout */}
      <div className="main-grid" style={{ alignItems: 'start' }}>
        {/* Left Column: Form Questionnaire Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Card 1: Demographics & Vitals */}
          <div className="glass-card">
            <div className="card-header">
              <div className="card-title-group">
                <div className="card-title-icon" style={{ background: 'rgba(14, 165, 233, 0.1)', color: 'var(--cyan-400)' }}>
                  <User size={18} />
                </div>
                <div>
                  <h3 className="card-title">1. Patient Demographics & Body Metrics</h3>
                  <p className="card-subtitle">Personal data and anthropometric baseline</p>
                </div>
              </div>
            </div>

            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                    Full Patient Name:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sarah Jenkins"
                    value={formData.fullName}
                    onChange={(e) => update('fullName', e.target.value)}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: '#fff' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                    Age (Years):
                  </label>
                  <input
                    type="number"
                    min="12"
                    max="65"
                    value={formData.age}
                    onChange={(e) => update('age', Number(e.target.value))}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: '#fff' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                    Height (cm):
                  </label>
                  <input
                    type="number"
                    min="120"
                    max="220"
                    value={formData.height}
                    onChange={(e) => update('height', Number(e.target.value))}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: '#fff' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                    Weight (kg):
                  </label>
                  <input
                    type="number"
                    min="30"
                    max="200"
                    value={formData.weight}
                    onChange={(e) => update('weight', Number(e.target.value))}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: '#fff' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                    Calculated BMI:
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', height: '42px', padding: '0 0.75rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{bmi}</span>
                    <span style={{ fontSize: '0.7rem', color: bmiCategory.color, fontWeight: 600 }}>{bmiCategory.label}</span>
                  </div>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                  Primary Concern / Reason for Doctor Appointment:
                </label>
                <textarea
                  rows="2"
                  placeholder="e.g. Periods have stopped for 3 months, sudden chin hair, feeling fatigued and unable to lose weight..."
                  value={formData.chiefComplaint}
                  onChange={(e) => update('chiefComplaint', e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: '#fff', resize: 'vertical' }}
                />
              </div>
            </div>
          </div>

          {/* Card 2: Menstrual Cycle Health */}
          <div className="glass-card">
            <div className="card-header">
              <div className="card-title-group">
                <div className="card-title-icon" style={{ background: 'rgba(244, 63, 94, 0.1)', color: 'var(--rose-400)' }}>
                  <Calendar size={18} />
                </div>
                <div>
                  <h3 className="card-title">2. Menstrual Cycle Pattern & Gynecological History</h3>
                  <p className="card-subtitle">Rotterdam Criterion 1 (Ovulatory Dysfunction)</p>
                </div>
              </div>
            </div>

            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>
                  Cycle Regularity:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                  {[
                    { id: 'regular', title: 'Regular (Every 21-35 days)', desc: 'Predictable monthly periods' },
                    { id: 'irregular', title: 'Irregular / Oligomenorrhea', desc: 'Cycles vary by >7-10+ days or >35 days' },
                    { id: 'absent', title: 'Absent / Amenorrhea', desc: 'No period for >3 to 6+ months' },
                  ].map((item) => (
                    <div
                      key={item.id}
                      onClick={() => update('cycleRegularity', item.id)}
                      style={{
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        border: `1px solid ${formData.cycleRegularity === item.id ? 'var(--cyan-400)' : 'var(--border-subtle)'}`,
                        background: formData.cycleRegularity === item.id ? 'rgba(14, 165, 233, 0.12)' : 'rgba(255,255,255,0.02)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: formData.cycleRegularity === item.id ? 'var(--cyan-400)' : '#fff' }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        {item.desc}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Typical Cycle Length:</label>
                    <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: formData.cycleLength > 35 ? 'var(--rose-400)' : 'var(--emerald-400)' }}>
                      {formData.cycleLength} Days
                    </span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="90"
                    value={formData.cycleLength}
                    onChange={(e) => update('cycleLength', Number(e.target.value))}
                    className="field-slider"
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Dysmenorrhea (Cramping Pain):</label>
                    <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                      {formData.crampSeverity}/10
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={formData.crampSeverity}
                    onChange={(e) => update('crampSeverity', Number(e.target.value))}
                    className="field-slider"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                    Period Bleeding Duration (Days):
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    value={formData.periodDuration}
                    onChange={(e) => update('periodDuration', Number(e.target.value))}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: '#fff' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                    Flow Intensity:
                  </label>
                  <select
                    value={formData.flowIntensity}
                    onChange={(e) => update('flowIntensity', e.target.value)}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', background: '#0b1329', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: '#fff' }}
                  >
                    <option value="Light / Spotting only">Light / Spotting only</option>
                    <option value="Normal">Normal</option>
                    <option value="Heavy with clots">Heavy with clots</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Physical & Androgenic Symptoms */}
          <div className="glass-card">
            <div className="card-header">
              <div className="card-title-group">
                <div className="card-title-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--amber-400)' }}>
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="card-title">3. Androgenic Signs & Dermatological Symptoms</h3>
                  <p className="card-subtitle">Rotterdam Criterion 2 (Clinical Hyperandrogenism)</p>
                </div>
              </div>
            </div>

            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Hirsutism */}
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '0.4rem' }}>
                  Excess Facial or Body Hair (Hirsutism):
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                  {['none', 'mild', 'moderate', 'severe'].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => update('hirsutism', lvl)}
                      className={`toggle-btn ${formData.hirsutism === lvl ? 'active' : ''}`}
                      style={{ textTransform: 'capitalize' }}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>

                {formData.hirsutism !== 'none' && (
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {['Chin / Jawline', 'Upper Lip', 'Sideburns', 'Chest / Breast', 'Stomach / Navel', 'Lower Back / Thighs'].map((area) => (
                      <span
                        key={area}
                        onClick={() => toggleArrayItem('hirsutismAreas', area)}
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.25rem 0.65rem',
                          borderRadius: 'var(--radius-full)',
                          cursor: 'pointer',
                          border: `1px solid ${formData.hirsutismAreas.includes(area) ? 'var(--cyan-400)' : 'var(--border-subtle)'}`,
                          background: formData.hirsutismAreas.includes(area) ? 'rgba(14, 165, 233, 0.15)' : 'rgba(255,255,255,0.02)',
                          color: formData.hirsutismAreas.includes(area) ? 'var(--cyan-400)' : 'var(--text-secondary)',
                        }}
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Acne */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                    Hormonal Acne Severity:
                  </label>
                  <select
                    value={formData.acne}
                    onChange={(e) => update('acne', e.target.value)}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', background: '#0b1329', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: '#fff' }}
                  >
                    <option value="none">None / Rare breakout</option>
                    <option value="mild">Mild (Occasional pre-menstrual)</option>
                    <option value="moderate">Moderate (Persistent jawline/chin)</option>
                    <option value="severe">Severe (Deep cystic nodules on jaw/back)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                    Scalp Hair Loss / Thinning:
                  </label>
                  <select
                    value={formData.hairLoss}
                    onChange={(e) => update('hairLoss', e.target.value)}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', background: '#0b1329', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: '#fff' }}
                  >
                    <option value="none">None / Normal shedding</option>
                    <option value="mild">Mild (Widening midline part)</option>
                    <option value="moderate">Moderate (Noticeable crown thinning)</option>
                    <option value="severe">Severe (Significant diffuse androgenic loss)</option>
                  </select>
                </div>
              </div>

              {/* Acanthosis Nigricans & Skin Tags */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>Acanthosis Nigricans</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Dark velvety patches on neck, underarms, or groin</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.darkPatches}
                    onChange={(e) => update('darkPatches', e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>Multiple Skin Tags</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Small skin tags around neck folds or bra line</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.skinTags}
                    onChange={(e) => update('skinTags', e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Metabolic, Energy & Family History */}
          <div className="glass-card">
            <div className="card-header">
              <div className="card-title-group">
                <div className="card-title-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--indigo-400)' }}>
                  <Heart size={18} />
                </div>
                <div>
                  <h3 className="card-title">4. Metabolic, Energy & Medical Background</h3>
                  <p className="card-subtitle">Insulin resistance and genetic predisposition</p>
                </div>
              </div>
            </div>

            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                  Weight Changes & Metabolic Pattern:
                </label>
                <select
                  value={formData.weightPattern}
                  onChange={(e) => update('weightPattern', e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', background: '#0b1329', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: '#fff' }}
                >
                  <option value="Stable weight">Stable weight (Easy to maintain)</option>
                  <option value="Difficulty losing weight despite diet/exercise">Difficulty losing weight despite calorie deficit</option>
                  <option value="Sudden rapid weight gain (>5-10kg)">Sudden rapid weight gain without lifestyle changes</option>
                  <option value="Underweight / Trouble gaining weight">Underweight / Lean phenotype</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>Intense Sugar Cravings</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Urgent cravings for simple carbohydrates</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.sugarCravings}
                    onChange={(e) => update('sugarCravings', e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>Post-Meal Energy Crashes</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Profound drowsiness after carbohydrate meals</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.postMealCrash}
                    onChange={(e) => update('postMealCrash', e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                </div>
              </div>

              {/* Daily Sleep Duration */}
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Moon size={15} style={{ color: 'var(--indigo-400)' }} />
                    <span>How many hours do you sleep per day?</span>
                  </label>
                  <span style={{ 
                    fontFamily: 'var(--font-mono)', 
                    fontSize: '0.82rem', 
                    fontWeight: 700, 
                    color: formData.sleepHours < 6 ? 'var(--rose-400)' : formData.sleepHours <= 8.5 ? 'var(--emerald-400)' : 'var(--amber-400)',
                    background: 'rgba(0,0,0,0.3)',
                    padding: '0.15rem 0.55rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)'
                  }}>
                    {formData.sleepHours} hrs/day
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.65rem' }}>
                  {[
                    { label: '< 5 hrs (Severe Deficit)', value: 4.5 },
                    { label: '5 - 6 hrs (Insufficient)', value: 5.5 },
                    { label: '6 - 7 hrs (Mild Deficit)', value: 6.5 },
                    { label: '7 - 8 hrs (Recommended)', value: 7.5 },
                    { label: '8 - 9 hrs (Optimal)', value: 8.5 },
                    { label: '> 9 hrs (Prolonged)', value: 9.5 },
                  ].map((chip) => (
                    <button
                      key={chip.label}
                      type="button"
                      onClick={() => update('sleepHours', chip.value)}
                      className={`toggle-btn ${Math.abs(formData.sleepHours - chip.value) < 0.4 ? 'active' : ''}`}
                      style={{ fontSize: '0.74rem', padding: '0.25rem 0.6rem' }}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', alignItems: 'center' }}>
                  <div>
                    <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                      Exact Sleep Hours:
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="3"
                      max="14"
                      value={formData.sleepHours}
                      onChange={(e) => update('sleepHours', parseFloat(e.target.value) || 7)}
                      style={{ width: '100%', padding: '0.45rem 0.65rem', background: '#0b1329', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '0.82rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                      Sleep Quality Pattern:
                    </label>
                    <select
                      value={formData.sleepIssues}
                      onChange={(e) => update('sleepIssues', e.target.value)}
                      style={{ width: '100%', padding: '0.45rem 0.65rem', background: '#0b1329', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '0.82rem' }}
                    >
                      <option value="Normal restful sleep">Normal restful sleep (Wake refreshed)</option>
                      <option value="Trouble falling asleep / occasional fatigue">Trouble falling asleep / Sleep latency &gt;30m</option>
                      <option value="Waking up unrefreshed, restless sleep">Frequent nighttime awakenings / Unrefreshed</option>
                      <option value="Daytime somnolence / Suspected sleep apnea">Daytime somnolence / Snoring (Sleep Apnea risk)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                  Family Health History (Check all that apply):
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {['Mother with PCOS', 'Sister with PCOS', 'Type 2 Diabetes in Family', 'Thyroid Disorder', 'Gestational Diabetes'].map((item) => (
                    <span
                      key={item}
                      onClick={() => toggleArrayItem('familyHistory', item)}
                      style={{
                        fontSize: '0.75rem',
                        padding: '0.25rem 0.65rem',
                        borderRadius: 'var(--radius-full)',
                        cursor: 'pointer',
                        border: `1px solid ${formData.familyHistory.includes(item) ? 'var(--indigo-400)' : 'var(--border-subtle)'}`,
                        background: formData.familyHistory.includes(item) ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.02)',
                        color: formData.familyHistory.includes(item) ? 'var(--indigo-400)' : 'var(--text-secondary)',
                      }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                  Current Medications, Oral Contraceptives, or Supplements:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Birth control pill, Metformin, Inositol, Spironolactone, Levothyroxine..."
                  value={formData.currentMeds}
                  onChange={(e) => update('currentMeds', e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: '#fff' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Triage Assessment & Doctor Summary (Sticky) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'sticky', top: '90px' }}>
          <div className="glass-card">
            <div className="card-header">
              <div className="card-title-group">
                <div className="card-title-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--emerald-400)' }}>
                  <Stethoscope size={18} />
                </div>
                <div>
                  <h3 className="card-title">Doctor Consultation Readiness</h3>
                  <p className="card-subtitle">Rotterdam Screening & Clinical Triage</p>
                </div>
              </div>
            </div>

            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Score Gauge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '0.5rem 0' }}>
                <div style={{ width: '85px', height: '85px', borderRadius: '50%', border: `4px solid ${triageAnalysis.riskLevel === 'high' ? 'var(--rose-400)' : triageAnalysis.riskLevel === 'moderate' ? 'var(--amber-400)' : 'var(--emerald-400)'}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: '1.45rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: triageAnalysis.riskLevel === 'high' ? 'var(--rose-400)' : triageAnalysis.riskLevel === 'moderate' ? 'var(--amber-400)' : 'var(--emerald-400)' }}>
                    {triageAnalysis.score}%
                  </span>
                  <span style={{ fontSize: '0.58rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
                    Burden
                  </span>
                </div>

                <div>
                  <span
                    className="badge"
                    style={{
                      background: triageAnalysis.riskLevel === 'high' ? 'rgba(244, 63, 94, 0.15)' : triageAnalysis.riskLevel === 'moderate' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                      color: triageAnalysis.riskLevel === 'high' ? 'var(--rose-400)' : triageAnalysis.riskLevel === 'moderate' ? 'var(--amber-400)' : 'var(--emerald-400)',
                      marginBottom: '0.4rem',
                    }}
                  >
                    {triageAnalysis.riskLevel === 'high' ? 'High Rotterdam Alignment' : triageAnalysis.riskLevel === 'moderate' ? 'Moderate Symptom Burden' : 'Mild / Low Correlation'}
                  </span>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
                    {triageAnalysis.summary}
                  </p>
                </div>
              </div>

              {/* 3 Rotterdam Criteria Checklist */}
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '0.85rem' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                  Rotterdam 2-of-3 Diagnostic Tracker:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {triageAnalysis.ovulatoryDysfunction ? (
                      <CheckCircle size={15} color="var(--rose-400)" />
                    ) : (
                      <CheckCircle size={15} color="var(--emerald-400)" />
                    )}
                    <span>
                      <strong>1. Ovulatory Dysfunction: </strong> 
                      {triageAnalysis.ovulatoryDysfunction ? 'Reported (Irregular/Absent)' : 'Regular monthly cycles'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {triageAnalysis.hasHyperandrogenism ? (
                      <CheckCircle size={15} color="var(--rose-400)" />
                    ) : (
                      <CheckCircle size={15} color="var(--emerald-400)" />
                    )}
                    <span>
                      <strong>2. Clinical Hyperandrogenism: </strong> 
                      {triageAnalysis.hasHyperandrogenism ? 'Reported (Hirsutism/Acne)' : 'Minimal/None reported'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                    <HelpCircle size={15} color="var(--cyan-400)" />
                    <span>
                      <strong>3. Polycystic Ovaries: </strong> 
                      Requires In-Clinic Pelvic Ultrasound
                    </span>
                  </div>
                </div>
              </div>

              {/* High-Impact Action: Generate Dossier */}
              <button
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', fontSize: '0.95rem' }}
                onClick={() => setIsReportOpen(true)}
              >
                <FileText size={18} />
                <span>Generate Doctor Consultation Dossier</span>
              </button>

              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: '1.4' }}>
                Creates a printable summary containing your timeline, symptom checklist, and recommended diagnostic blood tests to bring to your gynecologist.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Printable Consultation Report Modal */}
      <PatientConsultationReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        intakeData={formData}
        triageAnalysis={triageAnalysis}
      />
    </div>
  );
}
