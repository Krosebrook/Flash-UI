import { CONFIG } from '../data/config';
import { Card, CardHeader, CardBody } from '../components/shared/Card';
import { Badge } from '../components/shared/Badge';
import { Callout } from '../components/shared/Callout';

export function FOHPage() {
  return (
    <div className="page">
      <header className="page-header">
        <h1>🛎️ Front of House (FOH) Patterns</h1>
        <p className="subtitle">Customer-facing workflows with guardrails</p>
      </header>

      <Callout variant="info">
        <strong>FOH workflows</strong> handle customer interactions: support, onboarding, content generation.
        Most are LOW risk (read-only) with MED risk for actions that create tickets or send communications.
      </Callout>

      <section className="section">
        <div className="workflow-list">
          {CONFIG.workflows.foh.map((workflow) => (
            <Card key={workflow.id} className="workflow-card">
              <CardHeader>
                <div className="workflow-header">
                  <span>{workflow.name}</span>
                  <Badge level={workflow.risk} />
                </div>
              </CardHeader>
              <CardBody>
                <p className="workflow-goal">{workflow.goal}</p>

                <div className="workflow-details">
                  <div className="detail-group">
                    <h4>Intake Channels</h4>
                    <ul>
                      {workflow.intakeChannels.map((c, i) => <li key={i}>{c}</li>)}
                    </ul>
                  </div>

                  <div className="detail-group">
                    <h4>Data Sources</h4>
                    <ul>
                      {workflow.dataSources.map((d, i) => <li key={i}>{d}</li>)}
                    </ul>
                  </div>

                  <div className="detail-group">
                    <h4>Automations</h4>
                    <ul>
                      {workflow.automations.map((a, i) => <li key={i}>{a}</li>)}
                    </ul>
                  </div>

                  <div className="detail-group">
                    <h4>Approvals</h4>
                    <ul>
                      {workflow.approvals.map((a, i) => <li key={i}>{a}</li>)}
                    </ul>
                  </div>

                  <div className="detail-group">
                    <h4>Audit Events</h4>
                    <div className="tag-list">
                      {workflow.auditEvents.map((e, i) => (
                        <code key={i} className="tag">{e}</code>
                      ))}
                    </div>
                  </div>

                  <div className="detail-group">
                    <h4>SLO</h4>
                    <p className="slo">{workflow.slo}</p>
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
