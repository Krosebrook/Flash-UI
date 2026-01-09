import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { OverviewPage } from './pages/OverviewPage';
import DottedGlowBackground from './components/DottedGlowBackground';
import { ErrorBoundary } from './components/ErrorBoundary';

// Lazy load page components for better performance
// Overview page is kept eagerly loaded as it's the landing page
const FOHPage = lazy(() => import('./pages/FOHPage').then(m => ({ default: m.FOHPage })));
const BOHPage = lazy(() => import('./pages/BOHPage').then(m => ({ default: m.BOHPage })));
const EcosystemsPage = lazy(() => import('./pages/EcosystemsPage').then(m => ({ default: m.EcosystemsPage })));
const ToolsPage = lazy(() => import('./pages/ToolsPage').then(m => ({ default: m.ToolsPage })));
const GovernancePage = lazy(() => import('./pages/GovernancePage').then(m => ({ default: m.GovernancePage })));
const ObservabilityPage = lazy(() => import('./pages/ObservabilityPage').then(m => ({ default: m.ObservabilityPage })));
const RunbooksPage = lazy(() => import('./pages/RunbooksPage').then(m => ({ default: m.RunbooksPage })));
const DiagnosticsPage = lazy(() => import('./pages/DiagnosticsPage').then(m => ({ default: m.DiagnosticsPage })));

// Loading fallback component
function PageLoader() {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '400px',
      color: 'rgba(255, 255, 255, 0.6)'
    }}>
      <div>Loading...</div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <DottedGlowBackground
          glowColor="rgba(244, 114, 182, 0.6)"
          color="rgba(255, 255, 255, 0.08)"
          speedScale={0.5}
        />
        <AppShell>
          <Suspense fallback={<PageLoader />}>
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
          </Suspense>
        </AppShell>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
