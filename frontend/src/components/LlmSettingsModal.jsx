import React, { useState, useEffect } from 'react';
import { X, Key, Check, ExternalLink, Sparkles, AlertCircle, ShieldCheck } from 'lucide-react';
import { LLM_PROVIDERS, getStoredConfig, saveStoredConfig } from '../services/llmService';

export default function LlmSettingsModal({ isOpen, onClose, onConfigSaved }) {
  if (!isOpen) return null;

  const currentConfig = getStoredConfig();
  const [provider, setProvider] = useState(currentConfig.provider || 'gemini');
  const [apiKey, setApiKey] = useState(currentConfig.apiKey || '');
  const [model, setModel] = useState(currentConfig.model || 'gemini-1.5-flash');
  const [customEndpoint, setCustomEndpoint] = useState(currentConfig.customEndpoint || '');
  const [isSaved, setIsSaved] = useState(false);
  const [testStatus, setTestStatus] = useState(null); // null | 'testing' | 'success' | 'error'
  const [testMessage, setTestMessage] = useState('');

  const activeProviderMeta = LLM_PROVIDERS.find((p) => p.id === provider) || LLM_PROVIDERS[0];

  useEffect(() => {
    // When provider changes, update model to default if not compatible
    if (activeProviderMeta.models && !activeProviderMeta.models.includes(model)) {
      setModel(activeProviderMeta.defaultModel);
    }
  }, [provider]);

  const handleSave = () => {
    saveStoredConfig({
      apiKey,
      provider,
      model,
      customEndpoint,
    });
    setIsSaved(true);
    if (onConfigSaved) onConfigSaved({ apiKey, provider, model, customEndpoint });
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 800);
  };

  const handleTestKey = async () => {
    if (!apiKey && provider !== 'custom') {
      setTestStatus('error');
      setTestMessage('Please enter an API key first.');
      return;
    }

    setTestStatus('testing');
    setTestMessage('Contacting API endpoint...');

    try {
      if (provider === 'gemini') {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Respond with the word "CONNECTED"' }] }],
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.error?.message || `HTTP ${res.status}`);
        }
        setTestStatus('success');
        setTestMessage('Gemini API verified successfully!');
      } else if (provider === 'tokenrouter' || provider === 'openai' || provider === 'groq' || provider === 'custom') {
        const url = provider === 'tokenrouter'
          ? (customEndpoint || 'https://api.tokenrouter.io/v1/chat/completions')
          : provider === 'groq'
          ? (customEndpoint || 'https://api.groq.com/openai/v1/chat/completions')
          : (customEndpoint || 'https://api.openai.com/v1/chat/completions');

        try {
          const res = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey.trim()}`,
            },
            body: JSON.stringify({
              model: model || 'anthropic/claude-3.5-sonnet',
              messages: [{ role: 'user', content: 'Say OK' }],
              max_tokens: 5,
            }),
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err?.error?.message || err?.message || `HTTP ${res.status}`);
          }
          setTestStatus('success');
          setTestMessage(`${activeProviderMeta.name} connected successfully!`);
        } catch (fetchErr) {
          // Attempt backend proxy verification in case browser CORS intercepts direct fetch
          try {
            const bResp = await fetch('/api/llm/suggestions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                prompt: 'Respond with OK',
                apiKey: apiKey.trim(),
                provider,
                model: model || 'anthropic/claude-3.5-sonnet',
                endpoint: url,
              }),
            });
            if (bResp.ok) {
              setTestStatus('success');
              setTestMessage(`${activeProviderMeta.name} connected successfully (via backend proxy)!`);
            } else {
              const bErr = await bResp.json().catch(() => ({}));
              throw new Error(bErr?.error || fetchErr.message);
            }
          } catch (proxyErr) {
            throw new Error(proxyErr.message || fetchErr.message);
          }
        }
      }
    } catch (err) {
      setTestStatus('error');
      setTestMessage(`Connection failed: ${err.message}`);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-window" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div className="card-title-icon" style={{ background: 'rgba(14, 165, 233, 0.1)', color: 'var(--cyan-400)' }}>
              <Key size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                LLM API Configuration
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Connect Gemini or OpenAI to power AI Lifestyle & Diet Suggestions
              </p>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ padding: '1.25rem' }}>
          {/* Provider Selection */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>
              Select AI Provider:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
              {LLM_PROVIDERS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setProvider(p.id)}
                  style={{
                    padding: '0.65rem 0.85rem',
                    textAlign: 'left',
                    borderRadius: 'var(--radius-sm)',
                    border: `1px solid ${provider === p.id ? 'var(--cyan-400)' : 'var(--border-subtle)'}`,
                    background: provider === p.id ? 'rgba(14, 165, 233, 0.12)' : 'rgba(255,255,255,0.02)',
                    color: provider === p.id ? '#fff' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: '0.82rem',
                    fontWeight: provider === p.id ? 600 : 400,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>{p.name}</span>
                    {provider === p.id && <Sparkles size={13} style={{ color: 'var(--cyan-400)' }} />}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    {p.info}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Model Selection */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Model Architecture / Identifier:
              </label>
              {provider === 'tokenrouter' && (
                <span style={{ fontSize: '0.7rem', color: 'var(--cyan-400)' }}>
                  Claude 3.5, GPT-4o, Llama 3, etc.
                </span>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g. anthropic/claude-3.5-sonnet or gpt-4o"
                style={{
                  flex: 1,
                  padding: '0.6rem 0.8rem',
                  background: '#0b1329',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  color: '#fff',
                  fontSize: '0.85rem',
                  fontFamily: 'monospace',
                }}
              />
              {activeProviderMeta.models && activeProviderMeta.models.length > 0 && (
                <select
                  value={activeProviderMeta.models.includes(model) ? model : ''}
                  onChange={(e) => {
                    if (e.target.value) setModel(e.target.value);
                  }}
                  style={{
                    padding: '0.6rem 0.8rem',
                    background: '#0b1329',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-secondary)',
                    fontSize: '0.82rem',
                    maxWidth: '160px',
                  }}
                >
                  <option value="">Presets...</option>
                  {activeProviderMeta.models.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              You can type or paste any exact model name provided by your TokenRouter dashboard.
            </p>
          </div>

          {/* API Key Input */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Paste Your {activeProviderMeta.name} API Key:
              </label>
              {activeProviderMeta.docsUrl && (
                <a
                  href={activeProviderMeta.docsUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: '0.72rem', color: 'var(--cyan-400)', display: 'flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'none' }}
                >
                  <span>Website</span>
                  <ExternalLink size={11} />
                </a>
              )}
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                placeholder={activeProviderMeta.placeholder}
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setTestStatus(null);
                }}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  paddingLeft: '2.2rem',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  color: '#fff',
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                }}
              />
              <Key size={14} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              <ShieldCheck size={12} style={{ display: 'inline', verticalAlign: '-1px', color: 'var(--emerald-400)', marginRight: '4px' }} />
              Stored locally in your browser. Automatic backend fallback prevents CORS blocking.
            </p>
          </div>

          {/* Endpoint URL (for TokenRouter & Custom) */}
          {(provider === 'tokenrouter' || provider === 'custom') && (
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>
                  {provider === 'tokenrouter' ? 'TokenRouter Endpoint URL:' : 'Custom Endpoint URL:'}
                </label>
                {provider === 'tokenrouter' && (
                  <button
                    type="button"
                    onClick={() => setCustomEndpoint('https://api.tokenrouter.io/v1/chat/completions')}
                    style={{ background: 'none', border: 'none', color: 'var(--cyan-400)', fontSize: '0.7rem', cursor: 'pointer' }}
                  >
                    Reset to Default
                  </button>
                )}
              </div>
              <input
                type="text"
                placeholder={provider === 'tokenrouter' ? 'https://api.tokenrouter.io/v1/chat/completions' : 'http://localhost:11434/v1/chat/completions'}
                value={customEndpoint}
                onChange={(e) => setCustomEndpoint(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.8rem',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  color: '#fff',
                  fontSize: '0.82rem',
                  fontFamily: 'monospace',
                }}
              />
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                {provider === 'tokenrouter' 
                  ? 'Default: https://api.tokenrouter.io/v1/chat/completions (If TokenRouter gave you another base URL like https://tokenrouter.ai/v1/chat/completions, paste it above).'
                  : 'Specify the full OpenAI-compatible /chat/completions URL.'}
              </p>
            </div>
          )}

          {/* Connection Test Output */}
          {testStatus && (
            <div
              style={{
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '1rem',
                fontSize: '0.78rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: testStatus === 'success' ? 'rgba(16, 185, 129, 0.15)' : testStatus === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(14, 165, 233, 0.15)',
                color: testStatus === 'success' ? 'var(--emerald-400)' : testStatus === 'error' ? 'var(--rose-400)' : 'var(--cyan-400)',
                border: `1px solid ${testStatus === 'success' ? 'rgba(16, 185, 129, 0.3)' : testStatus === 'error' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(14, 165, 233, 0.3)'}`,
              }}
            >
              {testStatus === 'success' ? <Check size={14} /> : testStatus === 'error' ? <AlertCircle size={14} /> : <Sparkles size={14} />}
              <span>{testMessage}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={handleTestKey}
            disabled={testStatus === 'testing'}
            style={{ fontSize: '0.8rem' }}
          >
            {testStatus === 'testing' ? 'Testing Connection...' : 'Test Connection'}
          </button>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={handleSave}
              style={{ minWidth: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
            >
              {isSaved ? <Check size={15} /> : <Key size={15} />}
              <span>{isSaved ? 'Saved!' : 'Save Key'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
