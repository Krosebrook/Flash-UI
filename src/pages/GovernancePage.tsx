import { useState } from 'react';
import { CONFIG } from '../data/config';
import { Card, CardHeader, CardBody } from '../components/shared/Card';
import { Badge } from '../components/shared/Badge';
import { Callout } from '../components/shared/Callout';
import type { RiskLevel } from '../types';

export function GovernancePage() {
  return (
    <div className="page">
      <header className="page-header">
        <h1>🛡️ Approval + Policy Gates</h1>
        <p className="subtitle">Risk classification, approval workflows, and SOC2 tagging</p>
      </header>

      <Callout variant="info">
        Every workflow must be classified by risk level before execution.
        MED/HIGH actions require explicit human approval with evidence capture.
      </Callout>

      {/* Risk Calculator */}
      <section className="section">
        <h2>Risk Calculator</h2>
        <RiskCalculator />
      </section>

      {/* Risk Levels */}
      <section className="section">
        <h2>Risk Levels</h2>
        <div className="risk-grid">
          {CONFIG.governance.riskLevels.map((level) => (
            <Card key={level.level} className={`risk-card risk-${level.level.toLowerCase()}`}>
              <CardHeader>
                <Badge level={level.level}>{level.level}</Badge>
              </CardHeader>
              <CardBody>
                <p>{level.description}</p>
                <div className="risk-details">
                  <h4>Approvals Required</h4>
                  <ul>
                    {level.approvals.map((a, i) => <li key={i}>{a}</li>)}
                  </ul>
                  <h4>Required Controls</h4>
                  <ul>
                    {level.requiredControls.map((c, i) => <li key={i}>{c}</li>)}
                  </ul>
                  <h4>Examples</h4>
                  <ul className="example-list">
                    {level.examples.map((e, i) => <li key={i}>{e}</li>)}
                  </ul>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      {/* Approval Workflow */}
      <section className="section">
        <h2>8-Step Approval Workflow</h2>
        <div className="stepper">
          {CONFIG.governance.approvalSteps.map((step) => (
            <div key={step.n} className="step">
              <div className="step-number">{step.n}</div>
              <div className="step-content">
                <h4>{step.title}</h4>
                <p>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Evidence Bundle */}
      <section className="section">
        <h2>Audit Evidence Bundle</h2>
        <Card>
          <CardBody>
            <ul className="evidence-list">
              {CONFIG.governance.auditEvidenceBundle.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </section>

      {/* SOC2 Tagging */}
      <section className="section">
        <h2>SOC2 Tagging Schema</h2>
        <Card>
          <CardBody>
            <table className="soc2-table">
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Example Value</th>
                </tr>
              </thead>
              <tbody>
                {CONFIG.governance.soc2Tagging.fields.map((field) => (
                  <tr key={field.k}>
                    <td><code>{field.k}</code></td>
                    <td>{field.v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <h4>Guidance</h4>
            <ul>
              {CONFIG.governance.soc2Tagging.guidance.map((g, i) => (
                <li key={i}>{g}</li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </section>
    </div>
  );
}

// Risk Calculator Component
function RiskCalculator() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({ pii: false, sideEffects: false, external: false });
  const [result, setResult] = useState<{ level: RiskLevel; approvals: string[] } | null>(null);

  const questions = [
    { key: 'pii', question: 'Does this workflow involve PII or sensitive data?', yes: 'Yes, handles sensitive data', no: 'No, public/non-sensitive only' },
    { key: 'sideEffects', question: 'Does it have side effects (write/delete/deploy)?', yes: 'Yes, modifies data or systems', no: 'No, read-only' },
    { key: 'external', question: 'Is it customer-facing or external?', yes: 'Yes, customer-facing', no: 'No, internal only' },
  ];

  const handleAnswer = (value: boolean) => {
    const key = questions[step].key as keyof typeof answers;
    const newAnswers = { ...answers, [key]: value };
    setAnswers(newAnswers);

    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      calculateRisk(newAnswers);
    }
  };

  const calculateRisk = (ans: typeof answers) => {
    let level: RiskLevel = 'LOW';
    const approvals: string[] = [];

    if (ans.sideEffects && ans.pii) {
      level = 'HIGH';
      approvals.push('Service Owner + Security/Compliance');
    } else if (ans.sideEffects || ans.pii) {
      level = 'MEDIUM';
      approvals.push('Service Owner OR Team Lead');
    } else if (ans.external) {
      level = 'MEDIUM';
      approvals.push('Service Owner OR Team Lead');
    } else {
      approvals.push('None (auto)');
    }

    setResult({ level, approvals });
  };

  const reset = () => {
    setStep(0);
    setAnswers({ pii: false, sideEffects: false, external: false });
    setResult(null);
  };

  if (result) {
    return (
      <Card className="calculator-result" glow>
        <CardBody>
          <h3>Risk Assessment Result</h3>
          <div className="result-display">
            <Badge level={result.level}>{result.level}</Badge>
            <div className="approvals-required">
              <h4>Required Approvals:</h4>
              <ul>
                {result.approvals.map((a, i) => <li key={i}>{a}</li>)}
              </ul>
            </div>
          </div>
          <button className="reset-btn" onClick={reset}>Start Over</button>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="risk-calculator" glow>
      <CardBody>
        <div className="calculator-progress">
          Step {step + 1} of {questions.length}
        </div>
        <h3>{questions[step].question}</h3>
        <div className="calculator-buttons">
          <button className="calc-btn calc-btn--yes" onClick={() => handleAnswer(true)}>
            {questions[step].yes}
          </button>
          <button className="calc-btn calc-btn--no" onClick={() => handleAnswer(false)}>
            {questions[step].no}
          </button>
        </div>
      </CardBody>
    </Card>
  );
}
