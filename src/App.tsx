import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { OverviewPage } from './pages/OverviewPage';
import { FOHPage } from './pages/FOHPage';
import { BOHPage } from './pages/BOHPage';
import { EcosystemsPage } from './pages/EcosystemsPage';
import { ToolsPage } from './pages/ToolsPage';
import { GovernancePage } from './pages/GovernancePage';
import { ObservabilityPage } from './pages/ObservabilityPage';
import { RunbooksPage } from './pages/RunbooksPage';
import { DiagnosticsPage } from './pages/DiagnosticsPage';
import DottedGlowBackground from './components/DottedGlowBackground';

export default function App() {
  return (
    <BrowserRouter>
      <DottedGlowBackground
        glowColor="rgba(244, 114, 182, 0.6)"
        color="rgba(255, 255, 255, 0.08)"
        speedScale={0.5}
      />
      <AppShell>
        <Routes>
          <Route path="/" element={<OverviewPage />} />
          <Route path="/foh" element={<FOHPage />} />
          <Route path="/boh" element={<BOHPage />} />
          <Route path="/ecosystems" element={<EcosystemsPage />} />
          <Route path="/tools" element={<ToolsPage />} />
          <Route path="/governance" element={<GovernancePage />} />
          <Route path="/observability" element={<ObservabilityPage />} />
          <Route path="/runbooks" element={<RunbooksPage />} />
          <Route path="/diagnostics" element={<DiagnosticsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}
