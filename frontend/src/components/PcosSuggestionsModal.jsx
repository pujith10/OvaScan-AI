import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  Sparkles, 
  Copy, 
  Check, 
  Key, 
  Code, 
  FileText, 
  AlertCircle,
  RefreshCw,
  Utensils,
  Dumbbell,
  Moon,
  Calendar
} from 'lucide-react';
import { marked } from 'marked';
import { 
  buildPcosPrompt, 
  callLlmApi, 
  getStoredConfig, 
  getSampleDemonstrationPlan 
} from '../services/llmService';

export default function PcosSuggestionsModal({
  isOpen,
  onClose,
  reportData,
}) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('report'); // 'report' | 'prompt' | 'json'
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [usedModel, setUsedModel] = useState('');
  const [apiNotice, setApiNotice] = useState(null);

  const promptText = useMemo(() => buildPcosPrompt(reportData), [reportData]);

  // Run generation on open or when patient changes
  const handleGenerate = async (forceRegen = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const resp = await fetch('/api/llm/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          patientData: reportData,
        }),
      });

      if (resp.ok) {
        const data = await resp.json();
        if (data.success && data.content) {
          setContent(data.content);
          setUsedModel(data.model || 'NVIDIA Nemotron');
          setIsDemoMode(false);
          setApiNotice(null);
          setIsLoading(false);
          return;
        }

        // If backend indicated quota / rate limit or model failures
        const rawErr = data.errors?.[0] || data.message || 'LLM API service unavailable';
        let cleanReason = 'Token credits or quota limit reached ($0.00)';
        if (rawErr.toLowerCase().includes('credit') || rawErr.toLowerCase().includes('quota') || rawErr.includes('403')) {
          cleanReason = 'TokenRouter account credit limit ($0.00)';
        } else if (rawErr.includes('429')) {
          cleanReason = 'Provider rate limit exceeded';
        } else if (rawErr.toLowerCase().includes('timeout')) {
          cleanReason = 'Upstream LLM network timeout';
        }

        setApiNotice({
          reason: cleanReason,
          rawError: rawErr,
        });
      } else {
        setApiNotice({
          reason: `API HTTP ${resp.status}`,
          rawError: 'Backend communication error',
        });
      }
      
      // Fallback: Evidence-based clinical protocol tailored specifically to this patient
      setIsDemoMode(true);
      setUsedModel('Clinical Guideline Engine (Baseline)');
      setContent(getSampleDemonstrationPlan(reportData));
    } catch (err) {
      console.warn('Backend LLM endpoint notice:', err);
      setIsDemoMode(true);
      setUsedModel('Clinical Guideline Engine (Baseline)');
      setApiNotice({
        reason: 'Network or server connection issue',
        rawError: err.message,
      });
      setContent(getSampleDemonstrationPlan(reportData));
    } finally {
      setIsLoading(false);
    }
  };

  // Re-run whenever modal opens or active patient changes
  useEffect(() => {
    if (isOpen) {
      handleGenerate();
    }
  }, [isOpen, reportData?.patientId]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PCOS_Lifestyle_Diet_Plan_${reportData?.patientId || 'Patient'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJson = () => {
    const combinedData = {
      ...reportData,
      generatedSuggestionsPlan: {
        timestamp: new Date().toISOString(),
        model: usedModel || 'Clinical Protocol Baseline',
        mode: isDemoMode ? 'clinical_guideline_fallback' : 'live_llm_generated',
        planMarkdown: content,
      },
    };
    const blob = new Blob([JSON.stringify(combinedData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PCOS_Complete_Clinical_Record_${reportData?.patientId || 'Patient'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Render markdown HTML
  const renderedHtml = useMemo(() => {
    if (!content) return '';
    return marked.parse(content, { gfm: true, breaks: true });
  }, [content]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-window" 
        style={{ maxWidth: '980px', width: '95vw', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="modal-header" style={{ flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="card-title-icon" style={{ background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(14, 165, 233, 0.2))', color: 'var(--cyan-400)' }}>
              <Sparkles size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                  PCOS Lifestyle, Diet & Home Exercise Prescription
                </h3>
                {!isDemoMode && usedModel ? (
                  <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--emerald-400)', fontSize: '0.7rem' }}>
                    LIVE AI: {usedModel}
                  </span>
                ) : (
                  <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', fontSize: '0.7rem' }}>
                    CLINICAL PROTOCOL
                  </span>
                )}
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Personalized 7-Day Anti-Inflammatory Meal Table • Home Workouts (Zero Equipment) • Sleep Optimization
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <button className="btn-icon" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Sub-header navigation / tabs */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '0.5rem 1.25rem', 
          background: 'rgba(0,0,0,0.25)', 
          borderBottom: '1px solid var(--border-subtle)',
          flexShrink: 0
        }}>
          {/* Tab buttons */}
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <button
              type="button"
              onClick={() => setActiveTab('report')}
              className={`toggle-btn ${activeTab === 'report' ? 'active' : ''}`}
              style={{ fontSize: '0.78rem', padding: '0.3rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <FileText size={13} />
              <span>Formatted Plan</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('prompt')}
              className={`toggle-btn ${activeTab === 'prompt' ? 'active' : ''}`}
              style={{ fontSize: '0.78rem', padding: '0.3rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Code size={13} />
              <span>Inspect Prompt Sent</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('json')}
              className={`toggle-btn ${activeTab === 'json' ? 'active' : ''}`}
              style={{ fontSize: '0.78rem', padding: '0.3rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Code size={13} />
              <span>Patient JSON Payload</span>
            </button>
          </div>

          {/* Quick regenerate & copy */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => handleGenerate(true)}
              disabled={isLoading}
              style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', gap: '0.3rem' }}
            >
              <RefreshCw size={12} className={isLoading ? 'spin-animation' : ''} />
              <span>{isLoading ? 'Generating...' : 'Regenerate'}</span>
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={handleCopy}
              style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', gap: '0.3rem' }}
            >
              {copied ? <Check size={12} style={{ color: 'var(--emerald-400)' }} /> : <Copy size={12} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Notice banner */}
        {/* Respective Notice banner shown only when LLM API is encountering issues */}
        {isDemoMode && (
          <div style={{ 
            background: 'linear-gradient(90deg, rgba(245, 158, 11, 0.14), rgba(239, 68, 68, 0.09))', 
            borderBottom: '1px solid rgba(245, 158, 11, 0.3)', 
            padding: '0.65rem 1.25rem',
            fontSize: '0.78rem',
            color: '#fef3c7',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.6rem',
            flexShrink: 0
          }}>
            <AlertCircle size={16} style={{ color: '#fbbf24', flexShrink: 0, marginTop: '2px' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: '#fde68a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span>Notice: Live LLM Provider Issue ({apiNotice?.reason || 'Service limit / quota reached'})</span>
              </div>
              <div style={{ color: 'rgba(254, 243, 199, 0.85)', fontSize: '0.74rem', marginTop: '2px', lineHeight: 1.45 }}>
                External AI models could not complete live generation ({apiNotice?.rawError ? String(apiNotice.rawError).slice(0, 95) : 'TokenRouter account quota is $0.00 / Rate limited'}). Displaying OvaScan's evidence-based <strong>Clinical Lifestyle &amp; Diet Prescription</strong> dynamically customized for <strong>{reportData?.patientId || 'this patient'}</strong>.
              </div>
            </div>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="modal-body" style={{ flex: '1 1 auto', overflowY: 'auto', padding: '1.25rem' }}>
          {/* TAB 1: Rendered Formatted Report */}
          {activeTab === 'report' && (
            <div>
              {isLoading ? (
                <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
                  <div className="spin-animation" style={{ display: 'inline-block', marginBottom: '1rem' }}>
                    <Sparkles size={36} style={{ color: 'var(--cyan-400)' }} />
                  </div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff' }}>
                    Synthesizing PCOS Prescription Protocol...
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem', maxWidth: '440px', margin: '0.35rem auto 0' }}>
                    Integrating patient hormonal biomarkers, ultrasound follicle density, and glycemic targets into a 7-day meal table and home workout regimen.
                  </p>
                </div>
              ) : (
                <div 
                  className="suggestions-rendered-container" 
                  id="printable-suggestions"
                  dangerouslySetInnerHTML={{ __html: renderedHtml }} 
                />
              )}
            </div>
          )}

          {/* TAB 2: Prompt Inspector */}
          {activeTab === 'prompt' && (
            <div>
              <div style={{ marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Exact Instruction & Payload Transmitted to AI Model ({usedModel || 'Active LLM'}):
                </span>
                <span className="badge" style={{ fontSize: '0.7rem' }}>
                  {promptText.length} characters
                </span>
              </div>
              <pre style={{
                background: '#070d1e',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '1rem',
                fontSize: '0.78rem',
                lineHeight: '1.55',
                color: 'var(--cyan-300)',
                overflowX: 'auto',
                whiteSpace: 'pre-wrap',
                fontFamily: 'monospace',
              }}>
                {promptText}
              </pre>
            </div>
          )}

          {/* TAB 3: Raw JSON Inspector */}
          {activeTab === 'json' && (
            <div>
              <div style={{ marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Raw Input JSON Exported from AI Assessment:
                </span>
              </div>
              <pre style={{
                background: '#070d1e',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '1rem',
                fontSize: '0.78rem',
                lineHeight: '1.5',
                color: 'var(--emerald-400)',
                overflowX: 'auto',
                fontFamily: 'monospace',
              }}>
                {JSON.stringify(reportData, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer" style={{ flexShrink: 0, justifyContent: 'space-between' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>Target Duration: <strong>3–6 Months</strong></span> • <span>Home Workouts Only</span> • <span>Low-GI Anti-Inflammatory</span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="button" className="btn-secondary" onClick={handleDownloadJson} style={{ fontSize: '0.8rem' }}>
              <Download size={14} />
              <span>Export Full JSON</span>
            </button>
            <button type="button" className="btn-secondary" onClick={handleDownloadMarkdown} style={{ fontSize: '0.8rem' }}>
              <Download size={14} />
              <span>Download Plan (.md)</span>
            </button>
            <button type="button" className="btn-primary" onClick={handlePrint} style={{ fontSize: '0.8rem' }}>
              <Printer size={14} />
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
