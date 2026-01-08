import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody } from '../components/shared/Card';
import { Callout } from '../components/shared/Callout';

interface Runbook {
  id: string;
  title: string;
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
  steps: string[];
}

const RUNBOOKS: Runbook[] = [
  {
    id: 'incident-response',
    title: 'Incident Response',
    risk: 'HIGH',
    steps: [
      'Acknowledge incident in Slack #incidents',
      'Assess severity (SEV1-4)',
      'Page on-call if SEV1/2',
      'Create incident ticket in Freshservice',
      'Begin investigation log',
      'Communicate status to stakeholders',
      'Implement fix or mitigation',
      'Verify resolution',
      'Write post-incident report',
      'Schedule post-mortem if SEV1/2'
    ]
  },
  {
    id: 'key-rotation',
    title: 'API Key Rotation',
    risk: 'HIGH',
    steps: [
      'Create rotation ticket with justification',
      'Identify all services using the key',
      'Generate new key in provider console',
      'Update secrets in deployment (staged)',
      'Verify new key works in staging',
      'Deploy to production with new key',
      'Verify production health',
      'Revoke old key',
      'Update documentation',
      'Close rotation ticket with evidence'
    ]
  },
  {
    id: 'access-review',
    title: 'Quarterly Access Review',
    risk: 'MEDIUM',
    steps: [
      'Export current access matrix',
      'Compare against role definitions',
      'Identify stale accounts (90+ days)',
      'Flag over-privileged accounts',
      'Send review requests to managers',
      'Collect approvals/removals',
      'Execute access changes',
      'Verify changes applied',
      'Archive evidence bundle',
      'Update compliance dashboard'
    ]
  },
  {
    id: 'rollback',
    title: 'Production Rollback',
    risk: 'HIGH',
    steps: [
      'Confirm rollback is necessary',
      'Notify stakeholders in #engineering',
      'Identify last known good version',
      'Trigger rollback deployment',
      'Monitor health checks',
      'Verify core functionality',
      'Check error rates returning to baseline',
      'Update incident ticket',
      'Communicate resolution',
      'Schedule follow-up to fix forward'
    ]
  }
];

export function RunbooksPage() {
  return (
    <div className="page">
      <header className="page-header">
        <h1>📟 Ops Runbooks</h1>
        <p className="subtitle">Step-by-step operational procedures with progress tracking</p>
      </header>

      <Callout variant="info">
        Runbook progress is saved locally. Use these during incidents to track your progress.
        Click the reset button to start over.
      </Callout>

      <section className="section">
        <div className="runbook-grid">
          {RUNBOOKS.map((runbook) => (
            <LiveRunbook key={runbook.id} runbook={runbook} />
          ))}
        </div>
      </section>
    </div>
  );
}

function LiveRunbook({ runbook }: { runbook: Runbook }) {
  const storageKey = `runbook-${runbook.id}`;
  const [checked, setChecked] = useState<boolean[]>(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return runbook.steps.map(() => false);
      }
    }
    return runbook.steps.map(() => false);
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(checked));
  }, [checked, storageKey]);

  const toggleStep = (index: number) => {
    setChecked((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  const reset = () => {
    setChecked(runbook.steps.map(() => false));
  };

  const completedCount = checked.filter(Boolean).length;
  const progress = Math.round((completedCount / runbook.steps.length) * 100);

  return (
    <Card className={`runbook-card risk-${runbook.risk.toLowerCase()}`}>
      <CardHeader>
        <div className="runbook-header">
          <span>{runbook.title}</span>
          <span className={`risk-badge risk-${runbook.risk.toLowerCase()}`}>{runbook.risk}</span>
        </div>
      </CardHeader>
      <CardBody>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <p className="progress-text">{completedCount} / {runbook.steps.length} steps ({progress}%)</p>

        <ol className="runbook-steps">
          {runbook.steps.map((step, i) => (
            <li key={i} className={`runbook-step ${checked[i] ? 'completed' : ''}`}>
              <label>
                <input
                  type="checkbox"
                  checked={checked[i]}
                  onChange={() => toggleStep(i)}
                />
                <span>{step}</span>
              </label>
            </li>
          ))}
        </ol>

        <button className="reset-btn" onClick={reset}>
          Reset Runbook
        </button>
      </CardBody>
    </Card>
  );
}
