import React, { useState, useRef, useEffect } from 'react';
import { 
  Scan, 
  Upload, 
  Eye, 
  Sliders, 
  Layers, 
  Maximize2, 
  RotateCcw,
  Sparkles,
  AlertOctagon,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { SAMPLE_CASES } from '../data/sampleCases';

export default function UltrasoundViewer({
  scanUrl,
  onImageChange,
  follicleCount,
  imageProbability,
  isValidUltrasound = true,
  validationResult,
  selectedPresetId,
  onSelectPreset,
}) {
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [zoom, setZoom] = useState(1);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  // Draw simulated follicular activation heatmap (only if valid ultrasound)
  useEffect(() => {
    if (!showHeatmap || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    if (!isValidUltrasound || imageProbability === null) {
      // Don't draw heatmap on burgers/invalid images
      return;
    }

    const isPcosHigh = imageProbability > 0.5;
    const numPoints = isPcosHigh ? 12 : 3;

    for (let i = 0; i < numPoints; i++) {
      let x, y, r;
      if (isPcosHigh) {
        const angle = (i / numPoints) * Math.PI * 2;
        x = width / 2 + Math.cos(angle) * (width * 0.32);
        y = height / 2 + Math.sin(angle) * (height * 0.28);
        r = 28;
      } else {
        x = width * (0.35 + i * 0.15);
        y = height * (0.4 + i * 0.1);
        r = 32;
      }

      const grad = ctx.createRadialGradient(x, y, 2, x, y, r);
      if (isPcosHigh) {
        grad.addColorStop(0, 'rgba(244, 63, 94, 0.7)');
        grad.addColorStop(0.4, 'rgba(245, 158, 11, 0.45)');
        grad.addColorStop(0.8, 'rgba(56, 189, 248, 0.2)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else {
        grad.addColorStop(0, 'rgba(16, 185, 129, 0.55)');
        grad.addColorStop(0.5, 'rgba(56, 189, 248, 0.3)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      }

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [showHeatmap, imageProbability, scanUrl, isValidUltrasound]);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, DICOM).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      onImageChange({
        file,
        previewUrl: event.target.result,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleResetFilters = () => {
    setBrightness(100);
    setContrast(100);
    setZoom(1);
  };

  return (
    <div className="glass-card ultrasound-container">
      {/* Card Header */}
      <div className="card-header">
        <div className="card-title-group">
          <div className="card-title-icon">
            <Scan size={20} />
          </div>
          <div>
            <h2 className="card-title">Pelvic Ultrasound Computer Vision</h2>
            <p className="card-subtitle">
              Deep Learning Module (EfficientNetB0 Backbone + OOD Domain Validator)
            </p>
          </div>
        </div>

        {/* Upload Trigger */}
        <button
          className="btn-secondary"
          onClick={() => fileInputRef.current?.click()}
          title="Upload Patient Ultrasound Scan"
        >
          <Upload size={15} />
          <span>Upload Scan</span>
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*"
          style={{ display: 'none' }}
        />
      </div>

      <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Viewport Frame */}
        <div className="viewport-frame" style={{ borderColor: isValidUltrasound ? 'rgba(56, 189, 248, 0.2)' : 'var(--rose-500)' }}>
          <img
            src={scanUrl}
            alt="Transvaginal Pelvic Ultrasound Scan"
            className="scan-image"
            style={{
              filter: `brightness(${brightness}%) contrast(${contrast}%)`,
              transform: `scale(${zoom})`,
            }}
          />

          {/* Attention Heatmap Overlay */}
          {showHeatmap && isValidUltrasound && (
            <canvas
              ref={canvasRef}
              width={400}
              height={300}
              className="heatmap-canvas-overlay"
            />
          )}

          {/* Clinical Reticle / HUD */}
          <div className="scan-reticle">
            <div className="reticle-corner reticle-top-left" />
            <div className="reticle-corner reticle-top-right" />
            <div className="reticle-corner reticle-bottom-left" />
            <div className="reticle-corner reticle-bottom-right" />
          </div>

          {/* OOD Rejection Warning Overlay if Invalid Scan */}
          {!isValidUltrasound && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(15, 23, 42, 0.88)',
                backdropFilter: 'blur(6px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                textAlign: 'center',
                zIndex: 10,
              }}
            >
              <AlertOctagon size={48} color="var(--rose-400)" style={{ marginBottom: '0.75rem' }} />
              <h3 style={{ fontSize: '1.2rem', color: 'var(--rose-400)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>
                OUT-OF-DISTRIBUTION IMAGE REJECTED
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#cbd5e1', maxWidth: '420px', lineHeight: '1.5', marginBottom: '0.75rem' }}>
                <strong>Non-Ultrasound Detected:</strong> {validationResult?.reason || 'The uploaded file is a natural color photo (e.g. food/burger/object), not a clinical B-mode pelvic sonogram.'}
              </p>
              <div style={{ background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', color: 'var(--rose-400)', fontFamily: 'var(--font-mono)' }}>
                PREVENTION: PCOS Vision inference inhibited to prevent false diagnostic scoring
              </div>
            </div>
          )}

          {/* Viewport Status Badge */}
          <div className="viewport-badge" style={{ borderColor: isValidUltrasound ? 'rgba(56, 189, 248, 0.3)' : 'var(--rose-500)', color: isValidUltrasound ? 'var(--cyan-400)' : 'var(--rose-400)' }}>
            <span className="pulse-dot" style={{ background: isValidUltrasound ? 'var(--cyan-400)' : 'var(--rose-400)' }} />
            <span>
              {isValidUltrasound 
                ? `AI SCAN ACTIVE // CONF: ${(imageProbability * 100).toFixed(1)}%` 
                : 'SCAN INELIGIBLE // OUT-OF-DISTRIBUTION'}
            </span>
          </div>

          {/* Follicle Count Tag */}
          <div
            style={{
              position: 'absolute',
              bottom: 16,
              right: 16,
              background: 'rgba(2, 6, 23, 0.88)',
              backdropFilter: 'blur(8px)',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              zIndex: 11,
            }}
          >
            <span style={{ color: 'var(--text-muted)' }}>Follicle Estimate:</span>
            <span
              style={{
                color: !isValidUltrasound ? 'var(--rose-400)' : follicleCount >= 10 ? 'var(--rose-400)' : 'var(--emerald-400)',
                fontWeight: 700,
              }}
            >
              {!isValidUltrasound ? 'N/A (Invalid Scan)' : `${follicleCount} ${follicleCount >= 10 ? '(Polycystic Pattern)' : '(Normal)'}`}
            </span>
          </div>
        </div>

        {/* Viewport Controls Bar */}
        <div className="viewport-controls-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div className="control-slider-group">
              <span className="control-label">
                <Sliders size={13} /> Brightness
              </span>
              <input
                type="range"
                min="50"
                max="180"
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="control-slider"
              />
              <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', width: '32px' }}>
                {brightness}%
              </span>
            </div>

            <div className="control-slider-group">
              <span className="control-label">Contrast</span>
              <input
                type="range"
                min="50"
                max="200"
                value={contrast}
                onChange={(e) => setContrast(Number(e.target.value))}
                className="control-slider"
              />
              <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', width: '32px' }}>
                {contrast}%
              </span>
            </div>

            <div className="control-slider-group">
              <span className="control-label">
                <Maximize2 size={13} /> Zoom
              </span>
              <input
                type="range"
                min="1"
                max="2"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="control-slider"
                style={{ width: '70px' }}
              />
              <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)' }}>
                {zoom}x
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              className={`toggle-btn ${showHeatmap ? 'active' : ''}`}
              onClick={() => setShowHeatmap(!showHeatmap)}
              disabled={!isValidUltrasound}
              title="Toggle Attention / Follicular Heatmap"
            >
              <Eye size={13} />
              <span>Grad-CAM Overlay</span>
            </button>

            <button
              className="btn-icon"
              style={{ width: '2rem', height: '2rem' }}
              onClick={handleResetFilters}
              title="Reset Viewport Filters"
            >
              <RotateCcw size={13} />
            </button>
          </div>
        </div>

        {/* Clinical Scan Library */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Quick Clinical Scan Library ({SAMPLE_CASES.length} Cases):
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Rotterdam Morphology: &ge;12 follicles / ovary
            </span>
          </div>

          <div className="sample-scans-row" style={{ overflowX: 'auto', paddingBottom: '0.35rem' }}>
            {SAMPLE_CASES.map((c) => (
              <div
                key={c.id}
                className={`sample-scan-thumb ${selectedPresetId === c.id ? 'selected' : ''}`}
                onClick={() => onSelectPreset(c.id)}
                title={`${c.name} (${c.diagnosis})`}
                style={{ flexShrink: 0 }}
              >
                <img src={c.ultrasoundScanUrl} alt={c.name} />
                <span className={`thumb-tag ${c.riskLevel === 'high' ? 'tag-pcos' : c.riskLevel === 'low' ? 'tag-normal' : 'tag-border'}`}>
                  {c.riskLevel === 'high' ? 'PCOS' : c.riskLevel === 'low' ? 'Normal' : 'Border'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
