import { CONFIG } from '../data/config';
import { Card, CardHeader, CardBody } from '../components/shared/Card';
import { Callout } from '../components/shared/Callout';

export function EcosystemsPage() {
  return (
    <div className="page">
      <header className="page-header">
        <h1>🧬 Four Ecosystems Wiring</h1>
        <p className="subtitle">M365, Google, OpenAI, and Claude integration patterns</p>
      </header>

      <Callout variant="info">
        Each ecosystem has its own audit surfaces, API patterns, and approval hotspots.
        The goal is unified governance with ecosystem-specific implementation.
      </Callout>

      <section className="section">
        <div className="ecosystem-list">
          {CONFIG.ecosystems.map((eco) => (
            <Card key={eco.id} className="ecosystem-card" glow>
              <CardHeader>{eco.name}</CardHeader>
              <CardBody>
                <p className="ecosystem-summary">{eco.summary}</p>

                <div className="ecosystem-details">
                  <div className="detail-section">
                    <h4>Core Surfaces</h4>
                    <ul>
                      {eco.coreSurfaces.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>

                  <div className="detail-section">
                    <h4>Audit Log Sources</h4>
                    <ul>
                      {eco.auditLogSources.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>

                  <div className="detail-section">
                    <h4>API Surfaces</h4>
                    <ul>
                      {eco.apiSurfaces.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>

                  <div className="detail-section">
                    <h4>Approval Hotspots</h4>
                    <ul className="hotspot-list">
                      {eco.approvalHotspots.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>

                  <div className="detail-section">
                    <h4>Integration Bridge</h4>
                    <ul>
                      {eco.integrationBridge.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
