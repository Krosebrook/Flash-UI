import { CONFIG } from '../data/config';
import { Card, CardHeader, CardBody } from '../components/shared/Card';
import { Callout } from '../components/shared/Callout';

export function ObservabilityPage() {
  return (
    <div className="page">
      <header className="page-header">
        <h1>🔭 Logging + Observability</h1>
        <p className="subtitle">Audit schemas, log sinks, and dashboards</p>
      </header>

      <Callout variant="info">
        <strong>{CONFIG.observability.centralIdea}</strong>
      </Callout>

      {/* Audit Event Schema */}
      <section className="section">
        <h2>Audit Event Schema</h2>
        <Card>
          <CardBody>
            <div className="schema-table-container">
              <table className="schema-table">
                <thead>
                  <tr>
                    <th>Field</th>
                    <th>Type</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {CONFIG.observability.auditEventSchema.map((field) => (
                    <tr key={field.field}>
                      <td><code>{field.field}</code></td>
                      <td className="type-cell">{field.type}</td>
                      <td>{field.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      </section>

      {/* Log Sinks */}
      <section className="section">
        <h2>Log Sinks</h2>
        <div className="sink-grid">
          {CONFIG.observability.sinks.map((sink) => (
            <Card key={sink.name}>
              <CardHeader>{sink.name}</CardHeader>
              <CardBody>
                <p>{sink.why}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      {/* Dashboards */}
      <section className="section">
        <h2>Recommended Dashboards</h2>
        <Card>
          <CardBody>
            <ul className="dashboard-list">
              {CONFIG.observability.dashboards.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </section>
    </div>
  );
}
