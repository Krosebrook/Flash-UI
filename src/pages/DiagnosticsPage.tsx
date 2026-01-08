import { useState, useEffect } from 'react';
import { CONFIG } from '../data/config';
import { Card, CardHeader, CardBody } from '../components/shared/Card';
import { Callout } from '../components/shared/Callout';

interface DiagnosticResult {
  name: string;
  status: 'pass' | 'fail' | 'running';
  message: string;
}

export function DiagnosticsPage() {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    setResults([]);

    const checks: DiagnosticResult[] = [];

    // Check 1: CONFIG loaded
    await delay(200);
    checks.push({
      name: 'CONFIG loaded',
      status: CONFIG && CONFIG.site ? 'pass' : 'fail',
      message: CONFIG ? `Loaded v${CONFIG.site.version}` : 'CONFIG not found'
    });
    setResults([...checks]);

    // Check 2: All ecosystems defined
    await delay(200);
    checks.push({
      name: 'Ecosystems defined',
      status: CONFIG.ecosystems.length === 4 ? 'pass' : 'fail',
      message: `${CONFIG.ecosystems.length} ecosystems configured`
    });
    setResults([...checks]);

    // Check 3: Workflows defined
    await delay(200);
    const fohCount = CONFIG.workflows.foh.length;
    const bohCount = CONFIG.workflows.boh.length;
    checks.push({
      name: 'Workflows defined',
      status: fohCount > 0 && bohCount > 0 ? 'pass' : 'fail',
      message: `FOH: ${fohCount}, BOH: ${bohCount}`
    });
    setResults([...checks]);

    // Check 4: Tool atlas populated
    await delay(200);
    checks.push({
      name: 'Tool atlas populated',
      status: CONFIG.toolAtlas.length > 0 ? 'pass' : 'fail',
      message: `${CONFIG.toolAtlas.length} tools registered`
    });
    setResults([...checks]);

    // Check 5: Governance config
    await delay(200);
    checks.push({
      name: 'Governance config',
      status: CONFIG.governance.riskLevels.length === 3 ? 'pass' : 'fail',
      message: `${CONFIG.governance.riskLevels.length} risk levels, ${CONFIG.governance.approvalSteps.length} approval steps`
    });
    setResults([...checks]);

    // Check 6: Observability config
    await delay(200);
    checks.push({
      name: 'Observability config',
      status: CONFIG.observability.sinks.length > 0 ? 'pass' : 'fail',
      message: `${CONFIG.observability.sinks.length} log sinks, ${CONFIG.observability.auditEventSchema.length} schema fields`
    });
    setResults([...checks]);

    // Check 7: LocalStorage available
    await delay(200);
    let lsAvailable = false;
    try {
      localStorage.setItem('diag-test', 'ok');
      localStorage.removeItem('diag-test');
      lsAvailable = true;
    } catch { }
    checks.push({
      name: 'LocalStorage available',
      status: lsAvailable ? 'pass' : 'fail',
      message: lsAvailable ? 'Runbook persistence enabled' : 'LocalStorage blocked'
    });
    setResults([...checks]);

    // Check 8: Service Worker
    await delay(200);
    checks.push({
      name: 'Service Worker support',
      status: 'serviceWorker' in navigator ? 'pass' : 'fail',
      message: 'serviceWorker' in navigator ? 'PWA capable' : 'No SW support'
    });
    setResults([...checks]);

    setIsRunning(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const passCount = results.filter(r => r.status === 'pass').length;
  const failCount = results.filter(r => r.status === 'fail').length;

  return (
    <div className="page">
      <header className="page-header">
        <h1>✅ Diagnostics</h1>
        <p className="subtitle">Runtime health checks for the AI Integration Map</p>
      </header>

      <Callout variant="info">
        These checks verify that the application configuration is properly loaded
        and core features are functional.
      </Callout>

      <section className="section">
        <div className="diag-controls">
          <button
            className="run-btn"
            onClick={runDiagnostics}
            disabled={isRunning}
          >
            {isRunning ? 'Running...' : 'Run Diagnostics'}
          </button>
          {results.length > 0 && (
            <p className="diag-summary">
              <span className="pass-count">{passCount} passed</span>
              {failCount > 0 && <span className="fail-count">{failCount} failed</span>}
            </p>
          )}
        </div>

        <Card>
          <CardBody>
            <table className="diag-table">
              <thead>
                <tr>
                  <th>Check</th>
                  <th>Status</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result) => (
                  <tr key={result.name} className={`diag-row diag-${result.status}`}>
                    <td>{result.name}</td>
                    <td>
                      <span className={`status-badge status-${result.status}`}>
                        {result.status === 'pass' ? '✓' : result.status === 'fail' ? '✗' : '...'}
                      </span>
                    </td>
                    <td>{result.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      </section>
    </div>
  );
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
