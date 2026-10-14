import React, { useState } from 'react';
import { Network, Sparkles, User, Crosshair, ChevronRight } from 'lucide-react';
import { SUBTYPE_CLUSTERS } from '../data/sampleCases';

// Pre-calculated representative points for the 3 PCA clusters (from Kottarathil 541 patients)
const SCATTER_POINTS = [
  // Cluster 0 (Baseline / Green)
  { x: 120, y: 160, c: 0 }, { x: 135, y: 175, c: 0 }, { x: 110, y: 190, c: 0 },
  { x: 140, y: 145, c: 0 }, { x: 160, y: 180, c: 0 }, { x: 95, y: 170, c: 0 },
  { x: 150, y: 210, c: 0 }, { x: 130, y: 130, c: 0 }, { x: 115, y: 220, c: 0 },
  // Cluster 1 (Hyperandrogenic / Cyan)
  { x: 280, y: 85, c: 1 }, { x: 295, y: 105, c: 1 }, { x: 310, y: 70, c: 1 },
  { x: 260, y: 120, c: 1 }, { x: 330, y: 95, c: 1 }, { x: 275, y: 65, c: 1 },
  { x: 320, y: 130, c: 1 }, { x: 345, y: 80, c: 1 }, { x: 250, y: 95, c: 1 },
  // Cluster 2 (Metabolic / Indigo)
  { x: 240, y: 240, c: 2 }, { x: 260, y: 260, c: 2 }, { x: 220, y: 275, c: 2 },
  { x: 275, y: 230, c: 2 }, { x: 210, y: 245, c: 2 }, { x: 250, y: 290, c: 2 },
  { x: 290, y: 270, c: 2 }, { x: 230, y: 220, c: 2 }, { x: 270, y: 285, c: 2 },
];

export default function ClusterExplorer({ currentClusterId, biomarkers }) {
  const [hoveredCluster, setHoveredCluster] = useState(null);

  // Compute current patient position in PCA space dynamically
  const amh = biomarkers.amh || 4.2;
  const bmi = biomarkers.bmi || 23;
  
  // Mapping logic to PCA canvas coordinates (400x320)
  let ptX = 130 + (amh / 15) * 160;
  let ptY = 220 - ((amh - 3) * 12) + ((bmi - 24) * 5);
  ptX = Math.min(360, Math.max(70, ptX));
  ptY = Math.min(290, Math.max(50, ptY));

  return (
    <div className="glass-card full-width-section">
      <div className="card-header">
        <div className="card-title-group">
          <div className="card-title-icon" style={{ background: 'rgba(45, 212, 191, 0.1)', color: 'var(--teal-400)', borderColor: 'rgba(45, 212, 191, 0.2)' }}>
            <Network size={20} />
          </div>
          <div>
            <h2 className="card-title">Phenotypic Subtype Clustering Explorer</h2>
            <p className="card-subtitle">
              Unsupervised PCA Dimensionality Reduction & K-Means (Silhouette Score: 0.5894)
            </p>
          </div>
        </div>

        <span className="badge" style={{ background: 'rgba(45, 212, 191, 0.12)', color: 'var(--teal-400)' }}>
          K-Means k=3 Clusters
        </span>
      </div>

      <div className="card-body">
        <div className="cluster-grid">
          {/* Interactive PCA Projection Scatter Plot */}
          <div className="cluster-plot-container">
            <svg
              className="cluster-plot-svg"
              viewBox="0 0 400 320"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Grid Lines */}
              <line x1="40" y1="280" x2="380" y2="280" stroke="rgba(148, 163, 184, 0.15)" strokeWidth="1" />
              <line x1="40" y1="40" x2="40" y2="280" stroke="rgba(148, 163, 184, 0.15)" strokeWidth="1" />
              <line x1="200" y1="40" x2="200" y2="280" stroke="rgba(148, 163, 184, 0.08)" strokeDasharray="3 3" />
              <line x1="40" y1="160" x2="380" y2="160" stroke="rgba(148, 163, 184, 0.08)" strokeDasharray="3 3" />

              {/* Axis labels */}
              <text x="360" y="295" fill="var(--text-muted)" fontSize="10" fontFamily="var(--font-mono)" textAnchor="end">
                Principal Component 1 (Variance: 54.2%) &rarr;
              </text>
              <text x="50" y="55" fill="var(--text-muted)" fontSize="10" fontFamily="var(--font-mono)">
                &uarr; PC 2 (36.1%)
              </text>

              {/* Cluster Centroid Halo Envelopes */}
              <ellipse cx="130" cy="170" rx="55" ry="50" fill="rgba(16, 185, 129, 0.08)" stroke="rgba(16, 185, 129, 0.3)" strokeDasharray="4 2" />
              <ellipse cx="295" cy="95" rx="60" ry="45" fill="rgba(14, 165, 233, 0.08)" stroke="rgba(14, 165, 233, 0.3)" strokeDasharray="4 2" />
              <ellipse cx="250" cy="255" rx="55" ry="45" fill="rgba(129, 140, 248, 0.08)" stroke="rgba(129, 140, 248, 0.3)" strokeDasharray="4 2" />

              {/* Scatter Points */}
              {SCATTER_POINTS.map((pt, i) => {
                const clusterInfo = SUBTYPE_CLUSTERS[pt.c];
                const isClusterHovered = hoveredCluster === pt.c;
                return (
                  <circle
                    key={i}
                    cx={pt.x}
                    cy={pt.y}
                    r={isClusterHovered ? 5.5 : 4}
                    fill={clusterInfo.color}
                    opacity={isClusterHovered || hoveredCluster === null ? 0.85 : 0.3}
                    style={{ transition: 'all 0.2s' }}
                  />
                );
              })}

              {/* Current Patient Interactive Marker */}
              <g transform={`translate(${ptX}, ${ptY})`}>
                <circle cx="0" cy="0" r="14" fill="none" stroke="var(--cyan-400)" strokeWidth="1.5" strokeDasharray="3 3">
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from="0"
                    to="360"
                    dur="6s"
                    repeatCount="indefinite"
                  />
                </circle>
                <circle cx="0" cy="0" r="5" fill="#f43f5e" stroke="#ffffff" strokeWidth="1.5" />
                <rect x="-45" y="-32" width="90" height="20" rx="4" fill="rgba(2, 6, 23, 0.9)" stroke="var(--cyan-400)" strokeWidth="1" />
                <text x="0" y="-18" fill="#ffffff" fontSize="9" fontWeight="700" fontFamily="var(--font-mono)" textAnchor="middle">
                  PATIENT LOCUS
                </text>
              </g>
            </svg>
          </div>

          {/* Subtype Profiles Stack */}
          <div className="cluster-cards-stack">
            {SUBTYPE_CLUSTERS.map((cluster) => {
              const isCurrent = currentClusterId === cluster.id;
              return (
                <div
                  key={cluster.id}
                  className={`subtype-card ${isCurrent ? 'current-cluster' : ''}`}
                  onMouseEnter={() => setHoveredCluster(cluster.id)}
                  onMouseLeave={() => setHoveredCluster(null)}
                >
                  <div className="subtype-header">
                    <span
                      className="subtype-dot"
                      style={{ background: cluster.color, boxShadow: `0 0 8px ${cluster.color}` }}
                    />
                    <span className="subtype-name">{cluster.name}</span>
                  </div>

                  <p className="subtype-desc">{cluster.description}</p>

                  <div className="subtype-biomarkers">
                    {cluster.features.map((f, idx) => (
                      <span key={idx} className="subtype-pill">
                        {f}
                      </span>
                    ))}
                  </div>

                  <div style={{ marginTop: '0.65rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <strong style={{ color: 'var(--text-primary)' }}>Targeted Clinical Protocol: </strong>
                    {cluster.clinicalFocus}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
