import React from 'react';
import { 
  Activity, 
  Cpu, 
  Moon, 
  Sun, 
  FileText, 
  Users, 
  ClipboardList, 
  Stethoscope, 
  Sparkles
} from 'lucide-react';
import { SAMPLE_CASES } from '../data/sampleCases';

export default function Navbar({
  activeTab,
  onTabChange,
  selectedPresetId,
  onSelectPreset,
  theme,
  onToggleTheme,
  onOpenReport,
  onOpenArch,
  onOpenCohort,
  onOpenSuggestions,
  backendConnected,
  cohortCount = SAMPLE_CASES.length,
}) {

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <div className="brand-group">
          <div className="brand-icon-wrapper">
            <Activity size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="brand-name">OvaScan AI</span>
              <span className="brand-badge">CAPSTONE v2.5</span>
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Multimodal PCOS Diagnostic Intelligence Platform
            </p>
          </div>
        </div>

        {/* Center: Main Navigation Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0, 0, 0, 0.35)', padding: '0.3rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <button
            onClick={() => onTabChange('multimodal')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.45rem 0.95rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeTab === 'multimodal' ? 'var(--grad-primary)' : 'transparent',
              color: activeTab === 'multimodal' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.82rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Cpu size={15} />
            <span>Multimodal AI Lab</span>
          </button>

          <button
            onClick={() => onTabChange('intake')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.45rem 0.95rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeTab === 'intake' ? 'var(--grad-teal)' : 'transparent',
              color: activeTab === 'intake' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.82rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <ClipboardList size={15} />
            <span>Doctor Intake Dossier (No Scan)</span>
          </button>
        </div>

        {/* Right Actions */}
        <div className="nav-actions">
          {activeTab === 'multimodal' && (
            <>
              {/* AI Suggestions Quick Button */}
              <button
                type="button"
                className="btn-secondary"
                onClick={onOpenSuggestions}
                title="Generate 7-Day Diet & Home Workout Suggestions"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.15), rgba(139, 92, 246, 0.15))',
                  borderColor: 'rgba(14, 165, 233, 0.35)',
                }}
              >
                <Sparkles size={14} className="text-cyan" />
                <span style={{ fontSize: '0.78rem', color: '#fff' }}>AI Suggestions</span>
              </button>

              {/* Cohort Directory Button */}
              <button
                className="btn-secondary"
                onClick={onOpenCohort}
                title="Open Full Patient Cohort Directory"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Users size={15} className="text-cyan" />
                <span>Cohort ({cohortCount})</span>
              </button>

              {/* Quick Preset Selector */}
              <div className="preset-dropdown-container">
                <span className="preset-label">Patient:</span>
                <select
                  className="preset-select"
                  value={selectedPresetId}
                  onChange={(e) => onSelectPreset(e.target.value)}
                  aria-label="Select Clinical Case Preset"
                  style={{ maxWidth: '140px' }}
                >
                  {SAMPLE_CASES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.patientId} - {c.name.split(':')[0]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Report Button */}
              <button
                className="btn-primary"
                onClick={onOpenReport}
                title="Generate Clinical PDF / Print Report"
              >
                <FileText size={16} />
                <span>AI Report</span>
              </button>
            </>
          )}

          {activeTab === 'intake' && (
            <span className="badge" style={{ background: 'rgba(20, 184, 166, 0.12)', color: 'var(--teal-400)', border: '1px solid rgba(20, 184, 166, 0.25)' }}>
              <Stethoscope size={13} />
              <span>Direct Doctor Intake Mode</span>
            </span>
          )}

          {/* Theme Toggle */}
          <button
            className="btn-icon"
            onClick={onToggleTheme}
            aria-label="Toggle Dark/Light Mode"
            title="Switch Dark / Light Theme"
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </div>
      </div>
    </header>
  );
}
