# Changelog

All notable changes to AI Integration Map will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Calendar Versioning](https://calver.org/) (YYYY.MM.DD).

---

## [2025.12.29] - 2025-12-29 (Current)

### Major Refactor

Complete transformation from Flash UI (AI-powered UI generator) to AI Integration Map (enterprise AI operations control plane documentation).

### Added

- **Multi-Page Documentation Structure**
  - Overview page with system principles and ecosystem summary
  - FOH (Front-of-House) patterns for customer-facing workflows
  - BOH (Back-of-House) patterns for internal operations
  - Ecosystems deep-dive with integration bridges
  - Tool Atlas with categorized inventory
  - Governance section with risk levels and approval workflows
  - Observability documentation with audit event schemas
  - Runbooks for operational procedures
  - Diagnostics for system health validation

- **Four Ecosystem Coverage**
  - Microsoft 365 (Entra ID, Purview, Teams, SharePoint)
  - Google Workspace + Cloud (Admin Console, Drive, Cloud IAM)
  - OpenAI (ChatGPT Enterprise, API Platform)
  - Claude/Anthropic (Claude for Work, Claude Code)

- **Governance Framework**
  - Three-tier risk classification (LOW, MEDIUM, HIGH)
  - Eight-step approval workflow
  - SOC2 evidence tagging schema
  - Audit evidence bundle specification

- **Observability Schema**
  - Structured audit event format
  - Multi-sink log destinations
  - Dashboard recommendations
  - SLO guidance per workflow

- **Tool Atlas**
  - 40+ tools across categories
  - Ecosystem mapping per tool
  - Integration notes and guidance

- **New Component Library**
  - AppShell layout component
  - Card, Badge, Callout components
  - EmptyState for zero-content views
  - FloatingActionBar for contextual actions
  - Filter and search hooks

- **Custom React Hooks**
  - `useFilter` for filtering and search
  - `useLocalStorage` for persistence
  - `useMobileNav` for responsive navigation

- **Utility Functions**
  - `cn()` class name utility
  - `copyToClipboard()` with fallback
  - `escapeHtml()` for XSS prevention
  - Formatters for dates, numbers, badges

### Changed

- **Project Structure**: Reorganized to `src/` folder with separation of concerns
  - `src/components/` - Reusable UI components
  - `src/pages/` - Route-specific page components
  - `src/hooks/` - Custom React hooks
  - `src/data/` - Configuration and content
  - `src/types/` - TypeScript interfaces
  - `src/utils/` - Utility functions

- **Routing**: Implemented React Router 7 for multi-page navigation

- **Configuration**: Centralized all content in `src/data/config.ts`

- **Manifest**: Updated PWA manifest for AI Integration Map identity

### Removed

- Flash UI components (ArtifactCard, KeyManager, Terminal, GlobalLoading)
- StorageContext for session management
- Gemini AI integration
- IndexedDB/Dexie.js storage layer
- Crypto utilities for key encryption
- Service Worker with caching strategies

### Technical

- React 19.0.0
- TypeScript 5.8
- Vite 6.2
- React Router DOM 7.11.0

---

## Legacy Flash UI History

The following versions document the original Flash UI project before the transformation:

### [1.3.0] - Flash UI Secure Vault

- AES-256-GCM encryption for API keys
- PWA installation support
- Recovery code system
- Terminal enhancements

### [1.2.x] - Flash UI Multi-Framework

- Image generation with Gemini
- Material UI and Chakra UI support
- Design variations system
- Focus mode for artifacts

### [1.1.0] - Flash UI Streaming

- Real-time code streaming
- Session history management
- LocalStorage persistence

### [1.0.0] - Flash UI Initial

- Basic prompt-to-code generation
- Vanilla HTML/CSS support
- Gemini API integration

---

## Version Summary

| Version | Date | Description |
|---------|------|-------------|
| 2025.12.29 | 2025-12-29 | AI Integration Map - Complete documentation platform |
| 1.3.0 | 2025-01 | Flash UI - Secure Vault & PWA |
| 1.2.x | 2024-12 | Flash UI - Multi-framework support |
| 1.1.0 | 2024-10 | Flash UI - Streaming & history |
| 1.0.0 | 2024-09 | Flash UI - Initial release |

---

## Future Development

### Planned Features

- Interactive workflow diagrams
- Ecosystem status dashboard
- Integration health checks
- Runbook execution tracking
- Evidence bundle viewer
- Export to PDF/Markdown
- Dark/light mode toggle
- Search across all documentation
- Bookmark and annotation system

---

**[2025.12.29]**: https://github.com/Krosebrook/Flash-UI/releases/tag/v2025.12.29
