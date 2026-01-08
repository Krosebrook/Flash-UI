import { Link } from 'react-router-dom';
import { CONFIG } from '../data/config';
import { ArtifactCard, ArtifactGrid } from '../components/shared/ArtifactCard';
import { Callout } from '../components/shared/Callout';
import { Badge } from '../components/shared/Badge';

export function OverviewPage() {
  return (
    <div className="page">
      {/* Hero section with Flash-UI styling */}
      <header className="page-header hero-header">
        <div className="hero-badge">AI Operations Control Plane</div>
        <h1 className="hero-title">{CONFIG.site.title}</h1>
        <p className="hero-subtitle">{CONFIG.site.subtitle}</p>
      </header>

      <Callout variant="info">
        <strong>Policy-first AI governance:</strong> Every workflow classifies data + risk before execution.
        MED/HIGH actions require human approval. All decisions are logged with SOC2-ready evidence bundles.
      </Callout>

      <section className="section">
        <h2>Core Principles</h2>
        <div className="principles-grid">
          {CONFIG.site.principles.map((p, i) => (
            <div key={i} className="principle-card">
              <span className="principle-number">{i + 1}</span>
              <span className="principle-text">{p}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <h2>Four Ecosystems Wired</h2>
        <ArtifactGrid className="ecosystem-artifact-grid">
          {CONFIG.ecosystems.map((eco) => (
            <ArtifactCard key={eco.id} title={eco.name}>
              <p className="ecosystem-summary">{eco.summary}</p>
              <div className="ecosystem-meta">
                <span className="meta-item">
                  <strong>{eco.coreSurfaces.length}</strong> surfaces
                </span>
                <span className="meta-item">
                  <strong>{eco.approvalHotspots?.length || 0}</strong> hotspots
                </span>
              </div>
              <Link to="/ecosystems" className="artifact-link">
                Explore ecosystem →
              </Link>
            </ArtifactCard>
          ))}
        </ArtifactGrid>
      </section>

      <section className="section">
        <h2>Sample Workflows</h2>
        <div className="workflow-grid">
          <ArtifactCard title="FOH: Web Concierge" icon="🛎️">
            <div className="workflow-meta">
              <Badge level="LOW" />
            </div>
            <p className="workflow-desc">Answer questions, route to support, generate drafts.</p>
            <div className="workflow-tags">
              <span className="workflow-tag">Customer-facing</span>
              <span className="workflow-tag">Auto-approve</span>
            </div>
            <Link to="/foh" className="artifact-link">View FOH patterns →</Link>
          </ArtifactCard>

          <ArtifactCard title="BOH: Identity Ops" icon="🧰">
            <div className="workflow-meta">
              <Badge level="HIGH" />
            </div>
            <p className="workflow-desc">Access reviews, on/offboarding with two-person approval.</p>
            <div className="workflow-tags">
              <span className="workflow-tag">Internal</span>
              <span className="workflow-tag">Two-person rule</span>
            </div>
            <Link to="/boh" className="artifact-link">View BOH patterns →</Link>
          </ArtifactCard>
        </div>
      </section>

      <section className="section">
        <h2>Quick Navigation</h2>
        <div className="nav-grid">
          {CONFIG.nav.slice(1).map((item) => (
            <Link key={item.href} to={item.href} className="nav-card">
              <span className="nav-card-icon">{item.icon}</span>
              <span className="nav-card-label">{item.label}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
