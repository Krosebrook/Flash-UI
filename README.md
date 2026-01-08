# INT Inc — AI Integration Map

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Version](https://img.shields.io/badge/version-2025.12.29-blue.svg)](https://github.com/Krosebrook/Flash-UI)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6.svg)](https://www.typescriptlang.org)

> **Enterprise AI operations control plane documentation with FOH/BOH patterns, multi-ecosystem governance, and compliance-first workflows.**

---

## Overview

AI Integration Map is a comprehensive documentation platform for managing AI operations across enterprise environments. It provides structured patterns for Front-of-House (customer-facing) and Back-of-House (internal operations) workflows, with built-in governance controls for four major AI ecosystems.

### Core Principles

- **Policy-first**: Classify data and risk before any model call
- **Human approval gates**: Required for medium/high-risk actions and all destructive operations
- **Immutable audit trail**: Every decision, prompt, tool call, and outcome is logged
- **Least-privilege connectors**: Scoped tokens with scheduled rotation and revocation
- **Fail-soft**: Offline or missing credentials trigger safe read-only mode
- **Eval-driven**: Prompt and chain changes require automated evals before deployment
- **Model-agnostic routing**: Separate logic from model providers via Gateway pattern

---

## Supported Ecosystems

| Ecosystem | Primary Surfaces | Audit Sources |
|-----------|-----------------|---------------|
| **Microsoft 365** | Entra ID, Teams, SharePoint, Purview | Unified Audit Log, Sign-in Logs |
| **Google Workspace + Cloud** | Admin Console, Drive, Cloud IAM | Admin Logs, Cloud Audit Logs |
| **OpenAI** | ChatGPT Enterprise, API Platform | Audit Logs API, Compliance API |
| **Claude (Anthropic)** | Claude for Work, Claude Code | Audit Log Export, Enterprise Controls |

---

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
git clone https://github.com/Krosebrook/Flash-UI.git
cd Flash-UI

npm install
npm run dev
```

The application runs at `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview
```

---

## Documentation Sections

| Section | Path | Description |
|---------|------|-------------|
| **Overview** | `/` | System principles, ecosystem summary, quick navigation |
| **FOH Patterns** | `/foh` | Customer-facing workflows: concierge, onboarding, content studio |
| **BOH Patterns** | `/boh` | Internal workflows: IT triage, access ops, deployments, secrets |
| **Ecosystems** | `/ecosystems` | Deep-dive into each ecosystem's surfaces, APIs, and integration bridges |
| **Tool Atlas** | `/tools` | Categorized inventory of tools across data, automation, and observability |
| **Governance** | `/governance` | Risk levels, approval workflows, SOC2 tagging, evidence bundles |
| **Observability** | `/observability` | Audit event schema, log sinks, dashboards, SLO guidance |
| **Runbooks** | `/runbooks` | Operational procedures and step-by-step guides |
| **Diagnostics** | `/diagnostics` | System health checks and configuration validation |

---

## Architecture

### Technology Stack

| Layer | Technology |
|-------|------------|
| **Framework** | React 19 |
| **Language** | TypeScript 5.8 |
| **Build Tool** | Vite 6.2 |
| **Routing** | React Router 7 |
| **Styling** | CSS with CSS Variables |

### Project Structure

```
src/
├── components/
│   ├── layout/           # AppShell, navigation components
│   ├── shared/           # Reusable UI: Card, Badge, Callout, EmptyState
│   ├── DottedGlowBackground.tsx
│   └── Icons.tsx
├── pages/
│   ├── OverviewPage.tsx
│   ├── FOHPage.tsx
│   ├── BOHPage.tsx
│   ├── EcosystemsPage.tsx
│   ├── ToolsPage.tsx
│   ├── GovernancePage.tsx
│   ├── ObservabilityPage.tsx
│   ├── RunbooksPage.tsx
│   └── DiagnosticsPage.tsx
├── hooks/
│   ├── useFilter.ts      # Filtering and search logic
│   ├── useLocalStorage.ts
│   └── useMobileNav.ts
├── data/
│   └── config.ts         # Central configuration and content
├── types/
│   └── index.ts          # TypeScript interfaces
├── utils/
│   ├── cn.ts             # Class name utility
│   ├── copyToClipboard.ts
│   ├── escapeHtml.ts
│   └── formatters.ts
├── App.tsx
└── index.tsx
```

---

## Governance Model

### Risk Classification

| Level | Description | Approval Required |
|-------|-------------|-------------------|
| **LOW** | Read-only, no external side effects | None (auto-approved) |
| **MEDIUM** | Limited side effects: tickets, PRs, messages | Service Owner or Team Lead |
| **HIGH** | Destructive actions: access changes, deploys, key rotation | Service Owner AND Security/Compliance |

### Approval Workflow

1. **Intake** — Normalize request with requester identity and scope
2. **Classify** — Determine FOH/BOH, data sensitivity, risk level
3. **Redact + Package** — Apply PII/DLP rules, attach context references
4. **Plan (Dry Run)** — Generate execution plan with diff/preview
5. **Approve** — Route to required approvers, capture timestamps
6. **Execute** — Run via allowlisted tool plane with timeouts
7. **Verify** — Automated post-checks, human spot-check for HIGH
8. **Log + Close** — Write immutable audit event, close ticket

### Audit Evidence Bundle

Every governed action produces an evidence bundle containing:

- Request metadata (who/what/why/when)
- Risk classification and policy decisions
- Approvals with identities and timestamps
- Prompt and tool call traces (redacted)
- Execution results and diffs
- Post-verification checks
- SOC2/ITSM linkage tags

---

## Workflow Patterns

### Front-of-House (FOH)

| Workflow | Risk | Use Case |
|----------|------|----------|
| Web/PWA Concierge | LOW | Customer questions, support routing, draft generation |
| Onboarding Wizard | MEDIUM | Guided setup, task list creation, email sequences |
| Content Studio | LOW | Marketing copy, A/B variants, brand-compliant outputs |

### Back-of-House (BOH)

| Workflow | Risk | Use Case |
|----------|------|----------|
| ITSM Triage | MEDIUM | Ticket summarization, category detection, runbook suggestions |
| Identity & Access Ops | HIGH | On/offboarding, access reviews, group membership |
| Feature-to-PR Deploy | HIGH | Spec to PR, CI execution, production deployment |
| Secrets Rotation | HIGH | Multi-ecosystem key rotation with zero-downtime verification |

---

## Tool Atlas Categories

- **Data & Auth**: Supabase, Firebase
- **Caching & Queues**: Redis
- **Retrieval**: Vector DB (pgvector)
- **Automation**: n8n, Zapier, Power Automate, IFTTT
- **Collaboration**: Slack, Teams, Notion, OneNote, Google Drive
- **Engineering**: GitHub, GitLab, Vercel, Netlify
- **Observability**: Sentry, Datadog, OpenTelemetry
- **AI Platforms**: OpenAI, Claude, Gemini, NotebookLM
- **Builder Tools**: Lovable.dev, Replit, Cursor
- **ITSM & Security**: Freshservice, Duo, Bitdefender, Cisco AnyConnect

---

## Development

### Scripts

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run preview  # Preview production build
```

### Code Standards

- TypeScript strict mode enabled
- Functional React components with hooks
- PascalCase for components, camelCase for functions
- 2-space indentation
- CSS variables for theming

### Adding New Content

Configuration is centralized in `src/data/config.ts`. To add:

- **New ecosystem**: Add to `ecosystems` array
- **New workflow**: Add to `workflows.foh` or `workflows.boh`
- **New tool**: Add to `toolAtlas` array
- **New nav item**: Add to `nav` array

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/description`
3. Make changes following code standards
4. Test thoroughly in development
5. Commit with clear messages
6. Open a Pull Request

---

## License

Apache License 2.0 — see [LICENSE](LICENSE) for details.

---

## Support

- **Issues**: [GitHub Issues](https://github.com/Krosebrook/Flash-UI/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Krosebrook/Flash-UI/discussions)
