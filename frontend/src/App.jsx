import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import UltrasoundViewer from './components/UltrasoundViewer';
import BiomarkerPanel from './components/BiomarkerPanel';
import DiagnosticGauge from './components/DiagnosticGauge';
import ClusterExplorer from './components/ClusterExplorer';
import ClinicalReportModal from './components/ClinicalReportModal';
import ArchitectureModal from './components/ArchitectureModal';
import PatientCohortModal from './components/PatientCohortModal';
import PatientIntakeTab from './components/PatientIntakeTab';
import PcosSuggestionsModal from './components/PcosSuggestionsModal';
import { SAMPLE_CASES as INITIAL_CASES, SUBTYPE_CLUSTERS } from './data/sampleCases';
import { runDiagnostics } from './services/inferenceService';
import { Brain, CheckCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('multimodal'); // 'multimodal' | 'intake'
  const [patientCases, setPatientCases] = useState(INITIAL_CASES);
  const [theme, setTheme] = useState('dark');
  const [selectedPresetId, setSelectedPresetId] = useState(INITIAL_CASES[0].id);
  const [currentCase, setCurrentCase] = useState(INITIAL_CASES[0]);
  const [biomarkers, setBiomarkers] = useState(INITIAL_CASES[0].biomarkers);
  const [scanUrl, setScanUrl] = useState(INITIAL_CASES[0].ultrasoundScanUrl);
  const [imageFile, setImageFile] = useState(null);
  
  // Modals state
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isArchOpen, setIsArchOpen] = useState(false);
  const [isCohortOpen, setIsCohortOpen] = useState(false);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [backendConnected, setBackendConnected] = useState(false);

  // Diagnostic inference state
  const [diagnosticResults, setDiagnosticResults] = useState({
    isValidUltrasound: true,
    validationResult: null,
    fusionRisk: 0.88,
    imageProbability: 0.92,
    tabularProbability: 0.84,
    verdict: 'PCOS Positive',
    riskCategory: 'high',
    clusterId: 1,
    recommendation: INITIAL_CASES[0].findings,
    follicleEstimate: 14,
    confidenceScore: 76,
    shapContributions: [
      { feature: 'AMH Serum Level', impact: +38, value: '8.45 ng/mL' },
      { feature: 'Ultrasound Morphology', impact: +32, value: '92.0% conf.' },
      { feature: 'Menstrual Cycle Days', impact: +18, value: '42 days' },
      { feature: 'β-HCG Profile', impact: +12, value: '420.5 mIU/mL' },
    ],
  });

  // Apply theme to html root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Check backend health
  useEffect(() => {
    fetch('/api/health')
      .then((res) => {
        if (res.ok) setBackendConnected(true);
      })
      .catch(() => setBackendConnected(false));
  }, []);

  // Run diagnostics with debounce
  const executeInference = useCallback(async (currentBio, currentScanUrl, currentImgFile) => {
    try {
      const results = await runDiagnostics({
        imageFile: currentImgFile,
        imagePreviewUrl: currentScanUrl,
        biomarkers: currentBio,
        isPresetScan: !currentImgFile,
      });
      setDiagnosticResults(results);
    } catch (err) {
      console.error('Inference error:', err);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      executeInference(biomarkers, scanUrl, imageFile);
    }, 150);
    return () => clearTimeout(timer);
  }, [biomarkers, scanUrl, imageFile, executeInference]);

  // Handle preset selection
  const handleSelectPreset = (presetId) => {
    const found = patientCases.find((c) => c.id === presetId);
    if (!found) return;
    setSelectedPresetId(presetId);
    setCurrentCase(found);
    setBiomarkers(found.biomarkers);
    setScanUrl(found.ultrasoundScanUrl);
    setImageFile(null);
  };

  // Add custom patient
  const handleAddCustomPatient = (newPatient) => {
    setPatientCases((prev) => [newPatient, ...prev]);
    setSelectedPresetId(newPatient.id);
    setCurrentCase(newPatient);
    setBiomarkers(newPatient.biomarkers);
    setScanUrl(newPatient.ultrasoundScanUrl);
    setImageFile(null);
  };

  // Handle custom image upload
  const handleImageChange = ({ file, previewUrl }) => {
    setImageFile(file);
    setScanUrl(previewUrl);
    setSelectedPresetId('custom-upload');
    setCurrentCase((prev) => ({
      ...prev,
      name: 'Custom Patient Scan',
      patientId: 'PT-UPLOAD',
    }));
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const currentCluster = SUBTYPE_CLUSTERS.find((c) => c.id === diagnosticResults.clusterId) || SUBTYPE_CLUSTERS[0];
  const fullReportData = {
    patientId: currentCase.patientId || 'PT-90412',
    name: currentCase.name || 'Clinical Case',
    age: currentCase.age || 26,
    timestamp: new Date().toISOString(),
    biomarkers,
    diagnosticResults,
    clusterAssignment: currentCluster,
    scanUrl,
  };

  return (
    <div className="app-layout">
      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        selectedPresetId={selectedPresetId}
        onSelectPreset={handleSelectPreset}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenReport={() => setIsReportOpen(true)}
        onOpenArch={() => setIsArchOpen(true)}
        onOpenCohort={() => setIsCohortOpen(true)}
        onOpenSuggestions={() => setIsSuggestionsOpen(true)}
        backendConnected={backendConnected}
        cohortCount={patientCases.length}
      />

      <main className="app-container">
        {/* Render Tab 1: Multimodal AI Lab */}
        {activeTab === 'multimodal' && (
          <>
            {/* Hero Clinical Banner */}
            <section className="hero-banner">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem' }}>
                  <span className="badge" style={{ background: 'rgba(56, 189, 248, 0.15)', color: 'var(--cyan-400)', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                    <Brain size={13} /> Multimodal Medical Deep Learning
                  </span>
                  <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--emerald-400)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                    <CheckCircle size={13} /> OOD Domain Validator Active
                  </span>
                </div>
                <h1 className="hero-title">
                  PCOS Diagnostic Hub & Phenotypic Subtype Intelligence
                </h1>
                <p className="hero-desc">
                  Synchronizing ultrasound computer vision with serum hormonal assays to deliver robust, explainable, Rotterdam-grade ovarian pathology assessments.
                </p>
              </div>

              <div className="hero-stats">
                <div className="hero-stat-card">
                  <div className="stat-value">{patientCases.length}</div>
                  <div className="stat-label">Patient Cohort</div>
                </div>
                <div className="hero-stat-card">
                  <div className="stat-value">92.4%</div>
                  <div className="stat-label">Vision Accuracy</div>
                </div>
                <div className="hero-stat-card">
                  <div className="stat-value">0.74</div>
                  <div className="stat-label">Tabular ROC-AUC</div>
                </div>
              </div>
            </section>

            {/* Primary Operational Grid: Ultrasound & Fusion Gauge */}
            <section className="main-grid">
              {/* Left: Pelvic Ultrasound Viewer */}
              <UltrasoundViewer
                scanUrl={scanUrl}
                onImageChange={handleImageChange}
                follicleCount={diagnosticResults.follicleEstimate}
                imageProbability={diagnosticResults.imageProbability}
                isValidUltrasound={diagnosticResults.isValidUltrasound}
                validationResult={diagnosticResults.validationResult}
                selectedPresetId={selectedPresetId}
                onSelectPreset={handleSelectPreset}
              />

              {/* Right: Multimodal Fusion & Risk Gauge */}
              <DiagnosticGauge
                fusionRisk={diagnosticResults.fusionRisk}
                imageProbability={diagnosticResults.imageProbability}
                tabularProbability={diagnosticResults.tabularProbability}
                verdict={diagnosticResults.verdict}
                riskCategory={diagnosticResults.riskCategory}
                recommendation={diagnosticResults.recommendation}
                shapContributions={diagnosticResults.shapContributions}
                isValidUltrasound={diagnosticResults.isValidUltrasound}
                onOpenSuggestions={() => setIsSuggestionsOpen(true)}
                onOpenReport={() => setIsReportOpen(true)}
              />
            </section>

            {/* Clinical & Hormonal Biomarker Sliders */}
            <section className="full-width-section">
              <BiomarkerPanel
                biomarkers={biomarkers}
                onChange={setBiomarkers}
              />
            </section>

            {/* Phenotypic Subtype Clustering (PCA) */}
            <section className="full-width-section">
              <ClusterExplorer
                currentClusterId={diagnosticResults.clusterId}
                biomarkers={biomarkers}
              />
            </section>
          </>
        )}

        {/* Render Tab 2: Patient Self-Assessment & Doctor Intake Dossier */}
        {activeTab === 'intake' && (
          <PatientIntakeTab />
        )}
      </main>

      {/* Patient Cohort Directory Modal (Multimodal Tab) */}
      <PatientCohortModal
        isOpen={isCohortOpen}
        onClose={() => setIsCohortOpen(false)}
        selectedPatientId={selectedPresetId}
        onSelectPatient={handleSelectPreset}
        onAddCustomPatient={handleAddCustomPatient}
      />

      {/* Clinical PDF / Print Report Modal (Multimodal Tab) */}
      <ClinicalReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        patientData={{
          ...currentCase,
          biomarkers,
        }}
        diagnosticResults={diagnosticResults}
        scanUrl={scanUrl}
        onOpenSuggestions={() => setIsSuggestionsOpen(true)}
      />

      {/* PCOS Lifestyle, Diet & Home Exercise Suggestions Modal */}
      <PcosSuggestionsModal
        isOpen={isSuggestionsOpen}
        onClose={() => setIsSuggestionsOpen(false)}
        reportData={fullReportData}
      />

      {/* Model Architecture Technical Modal */}
      <ArchitectureModal
        isOpen={isArchOpen}
        onClose={() => setIsArchOpen(false)}
      />
    </div>
  );
}
