import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { CONFIG } from '../../data/config';

export interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const location = useLocation();

  const currentNav = CONFIG.nav.find(n => n.href === location.pathname);

  return (
    <div className="app-shell">
      {/* Mobile Header */}
      <header className="mobile-header">
        <button
          className="menu-toggle"
          onClick={() => setIsMobileNavOpen(true)}
          aria-label="Open navigation"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <span className="mobile-title">{currentNav?.label || 'AI Integration Map'}</span>
      </header>

      {/* Sidebar */}
      <aside className={`sidebar ${isMobileNavOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h1 className="logo">INT Inc</h1>
          <p className="logo-sub">AI Integration Map</p>
        </div>

        <nav className="sidebar-nav">
          {CONFIG.nav.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setIsMobileNavOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <p className="version">v{CONFIG.site.version}</p>
        </div>
      </aside>

      {/* Mobile Nav Overlay */}
      {isMobileNavOpen && (
        <div
          className="nav-scrim"
          onClick={() => setIsMobileNavOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main Content */}
      <main className="main-content">
        <div className="content-container">
          {children}
        </div>
      </main>
    </div>
  );
}
