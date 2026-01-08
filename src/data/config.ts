import type { AppConfig } from '../types';

export const CONFIG: AppConfig = {
  site: {
    title: "INT Inc — AI Integration Map",
    subtitle: "FOH + BOH patterns • 4 ecosystems wired in • approvals + logging as first-class controls",
    version: "2025.12.29",
    lastUpdatedISO: "2025-12-29",
    principles: [
      "Policy-first: classify data + risk before any model call",
      "Human approval gates for medium/high-risk actions (and all destructive ops)",
      "Immutable audit trail for every decision, prompt, tool call, and outcome",
      "Least-privilege connectors + scoped tokens; rotate and revoke on schedule",
      "Fail-soft: if offline / missing creds → safe read-only mode, never crash",
      "Eval-driven: changes to prompts/chains must pass automated evals before deploy",
      "Model-agnostic routing: separate logic from model providers (Gateway pattern)"
    ],
    fourEcosystems: ["Microsoft 365", "Google (Workspace + Cloud)", "OpenAI (ChatGPT + API)", "Claude (Anthropic + Claude Code)"]
  },

  nav: [
    { href: "/",            label: "Overview",                 icon: "⎈" },
    { href: "/foh",         label: "FOH patterns",             icon: "🛎️" },
    { href: "/boh",         label: "BOH patterns",             icon: "🧰" },
    { href: "/ecosystems",  label: "4 ecosystems wiring",      icon: "🧬" },
    { href: "/tools",       label: "Tool atlas",               icon: "🧩" },
    { href: "/governance",  label: "Approval + policy gates",  icon: "🛡️" },
    { href: "/observability", label:"Logging + observability", icon: "🔭" },
    { href: "/runbooks",    label: "Ops runbooks",             icon: "📟" },
    { href: "/diagnostics", label: "Diagnostics",              icon: "✅" }
  ],

  ecosystems: [
    {
      id: "m365",
      name: "Microsoft 365 (Enterprise)",
      summary: "Identity, collaboration, compliance, and enterprise audit surfaces. Primary control points: Entra ID (SSO/CA), Purview (audit/DLP/eDiscovery), Teams/SharePoint/Outlook.",
      coreSurfaces: [
        "Entra ID (SSO, Conditional Access, MFA enforcement)",
        "Teams / Outlook / SharePoint / OneDrive (collab + content)",
        "Power Automate / Logic Apps (workflow execution)",
        "Purview (Audit, DLP, eDiscovery, retention)"
      ],
      auditLogSources: [
        "Microsoft Purview Audit (Standard/Premium) — unified audit log searches/exports",
        "Entra sign-in + directory logs (investigation + access monitoring)"
      ],
      apiSurfaces: [
        "Microsoft Graph (users, groups, mail, files, teams, etc.)",
        "Audit search/export via Purview / unified audit log tooling"
      ],
      approvalHotspots: [
        "SSO / Conditional Access policy changes",
        "DLP/retention policy changes",
        "Bulk user/group permission updates",
        "Mailbox/SharePoint permission grants"
      ],
      integrationBridge: [
        "Slack/Notion/GitHub event → ITSM ticket (Freshservice) → Power Automate workflow (approved) → audit evidence",
        "AI-generated drafts stored as docs (SharePoint) with retention + eDiscovery-ready metadata"
      ]
    },
    {
      id: "google",
      name: "Google (Workspace + Cloud)",
      summary: "Workspace collaboration plus Cloud execution. Primary control points: Admin audit logs, Workspace security investigation tooling, Cloud Audit Logs + IAM.",
      coreSurfaces: [
        "Google Admin console (users, groups, security settings)",
        "Gmail / Drive / Calendar / Chat (collab + comms)",
        "Google Cloud IAM + Cloud Logging/Audit Logs",
        "Cloud Run/Functions + Workflows (execution)"
      ],
      auditLogSources: [
        "Admin log events (Admin console actions)",
        "Workspace audit logs via Cloud Audit Logs / Admin Reports surfaces"
      ],
      apiSurfaces: [
        "Admin SDK / Reports API (activity events)",
        "Drive/Gmail/Calendar APIs",
        "Cloud Logging / Cloud Audit Logs"
      ],
      approvalHotspots: [
        "Domain-wide delegation changes / privileged scopes",
        "Gmail/Drive security policy changes",
        "IAM role grants at org/folder/project level"
      ],
      integrationBridge: [
        "Workspace event → central policy engine → (optional) Cloud Workflow execution → Cloud Audit Logs → SIEM",
        "NotebookLM knowledge workflows anchored to Drive folders with admin-approved sharing model"
      ]
    },
    {
      id: "openai",
      name: "OpenAI (ChatGPT Enterprise + API Platform)",
      summary: "Two sides: ChatGPT workspace controls + API org controls. Primary control points: SSO, workspace compliance tooling, API org audit logs, and key lifecycle governance.",
      coreSurfaces: [
        "ChatGPT workspace (Enterprise/Edu) with admin controls",
        "Compliance APIs for enterprise (workspace logs/metadata)",
        "API Platform org (keys, users, org configuration)",
        "Model routing + cost controls (per-project budgets)"
      ],
      auditLogSources: [
        "Audit Logs API for the API Platform (key lifecycle, invites, org events)",
        "Compliance API for ChatGPT workspace (logs/metadata for eDiscovery/DLP/SIEM)"
      ],
      apiSurfaces: [
        "OpenAI API platform (model calls, org projects, key management)",
        "ChatGPT workspace compliance surfaces (export/stream to governance tooling)"
      ],
      approvalHotspots: [
        "API key creation/rotation for production workloads",
        "Workspace sharing + connector enablement decisions",
        "Actions/Connectors that touch internal systems"
      ],
      integrationBridge: [
        "Approved prompts/actions → n8n/Zapier/Edge functions execution → log every tool call + response → evidence bundle",
        "Store-only redacted artifacts in Notion/SharePoint; keep raw data in governed systems"
      ]
    },
    {
      id: "claude",
      name: "Claude (Anthropic + Claude Code)",
      summary: "Claude for Work/Enterprise + Claude Code governance. Primary control points: admin controls, audit log export, policy enforcement around coding/automation agents.",
      coreSurfaces: [
        "Claude for Work/Enterprise admin console controls",
        "Audit log export (organization-level, recent window)",
        "Claude Code (team/enterprise controls + policy-driven IDE usage)",
        ".skills files + MCP-style connectors (scoped)"
      ],
      auditLogSources: [
        "Claude audit logs export (admin)",
        "Claude Code enterprise controls/audit surfaces (as available in plan)"
      ],
      apiSurfaces: [
        "Anthropic API (model calls)",
        "Claude workspace controls (admin/export)"
      ],
      approvalHotspots: [
        "Repo write permissions for agents",
        "Anything that can delete/overwrite infra or data",
        "Production deploy approvals"
      ],
      integrationBridge: [
        "Claude Code suggestions → Feature-to-PR agent → human review → merge → deployment pipeline → evidence retained",
        "Use read-only analysis mode when tokens/permissions are missing (fail-soft)"
      ]
    }
  ],

  governance: {
    riskLevels: [
      {
        level: "LOW",
        badge: "badge--good",
        description: "Read-only, no external side effects. Drafting, summarization, classification, or lookup with minimal sensitivity.",
        approvals: ["None (auto)"],
        requiredControls: [
          "PII redaction on inputs/outputs",
          "Prompt + retrieval sources logged",
          "Rate limits + cost caps"
        ],
        examples: ["Summarize a policy doc", "Draft an email", "Generate a checklist"]
      },
      {
        level: "MEDIUM",
        badge: "badge--warn",
        description: "Limited side effects or sensitive context. Creates tickets, opens PRs, posts messages, or updates non-critical records.",
        approvals: ["Service Owner OR Team Lead"],
        requiredControls: [
          "Ticket or change record required",
          "Explicit scope + allowlist for tools",
          "Dry-run preview before execution"
        ],
        examples: ["Create Freshservice ticket + summary", "Open PR with changes", "Post announcement to #ops"]
      },
      {
        level: "HIGH",
        badge: "badge--bad",
        description: "Destructive or high-impact actions: identity/access changes, production deploys, key rotation, policy changes, data deletion.",
        approvals: ["Service Owner AND Security/Compliance (or CAB/change window)"],
        requiredControls: [
          "Two-person rule",
          "Explicit typed confirmation phrase for destructive ops",
          "Rollback plan required + post-change verification",
          "Immutable audit evidence bundle"
        ],
        examples: ["Rotate production API keys", "Modify Conditional Access", "Deploy to production"]
      }
    ],

    approvalSteps: [
      { n: 1, title: "Intake", desc: "Slack/Teams/Email/Ticket → normalized request with requester identity + scope." },
      { n: 2, title: "Classify", desc: "FOH vs BOH + data sensitivity + risk level + required approvers." },
      { n: 3, title: "Redact + Package", desc: "Minimize data, apply PII/DLP rules, attach context references (not raw dumps)." },
      { n: 4, title: "Plan (Dry Run)", desc: "Generate an execution plan + diff/preview + estimated blast radius." },
      { n: 5, title: "Approve", desc: "Route to approvers (MED/HIGH). Capture explicit approvals + timestamps." },
      { n: 6, title: "Execute", desc: "Run via allowlisted tool plane (n8n/Zapier/Power Automate/Edge funcs). Enforce timeouts + retries." },
      { n: 7, title: "Verify", desc: "Automated post-checks + human spot check for HIGH. Confirm success criteria." },
      { n: 8, title: "Log + Close", desc: "Write immutable audit event + evidence bundle; close ticket/change with outcome." }
    ],

    auditEvidenceBundle: [
      "Request metadata (who/what/why/when)",
      "Risk classification + policy decisions",
      "Approvals (identities + timestamps)",
      "Prompt + tool call traces (redacted) + model outputs",
      "Execution results + diffs",
      "Post-verification checks + sign-off",
      "Retention tags (SOC2/ITSM linkage)"
    ],

    soc2Tagging: {
      fields: [
        { k: "control_id", v: "e.g., CC6.1 / CC7.2 mapped per your internal control library" },
        { k: "evidence_type", v: "change_record | access_review | incident | deployment | key_rotation" },
        { k: "ticket_id", v: "Freshservice/ITSM ticket reference" },
        { k: "repo_ref", v: "GitHub PR/commit for engineering changes" },
        { k: "retention_class", v: "standard | legal_hold | extended" }
      ],
      guidance: [
        "Tag at creation time (not retroactively).",
        "Evidence must be reproducible: include inputs/outputs/diffs.",
        "Prefer machine-verifiable checks for post-change validation."
      ]
    }
  },

  observability: {
    centralIdea: "Treat every workflow like a mini distributed system: trace IDs, structured logs, audit events, and measurable SLOs.",
    auditEventSchema: [
      { field: "event_id", type: "string (uuid)", desc: "Unique event ID" },
      { field: "timestamp", type: "string (ISO-8601)", desc: "Event time" },
      { field: "actor", type: "object", desc: "{ id, displayName, authProvider, role }" },
      { field: "tenant", type: "object", desc: "{ org, workspace, environment }" },
      { field: "request", type: "object", desc: "{ channel, ticket_id, correlation_id }" },
      { field: "risk", type: "string", desc: "LOW | MEDIUM | HIGH" },
      { field: "policy", type: "object", desc: "{ decisions: [], redaction_applied: true/false }" },
      { field: "tools", type: "array", desc: "Each tool call: { tool, action, allowlist, status, duration_ms }" },
      { field: "model", type: "object", desc: "{ provider, model, tokens_in, tokens_out, cost_estimate }" },
      { field: "outcome", type: "object", desc: "{ status, summary, diffs, verification }" },
      { field: "evidence", type: "object", desc: "{ bundle_id, retention_tags: [] }" }
    ],
    sinks: [
      { name: "Microsoft Purview Audit", why: "Unified audit log for M365 forensic/compliance investigations" },
      { name: "Google Workspace Admin/Audit logs", why: "Admin actions + workspace activity investigation trails" },
      { name: "OpenAI Audit Logs / Compliance APIs", why: "Org/workspace visibility for compliance + security review" },
      { name: "Claude audit logs export", why: "Org-level audit evidence for Claude usage + admin actions" },
      { name: "Sentry/Datadog/Logtail/OpenTelemetry", why: "App-level metrics/traces/logs for your own services" }
    ],
    dashboards: [
      "Workflow throughput (FOH/BOH) + error rates",
      "Approval latency (MED/HIGH) + bottlenecks by approver",
      "Cost & token usage by ecosystem and workflow",
      "High-risk action ledger (keys, access, policy, deploys)",
      "Evidence completeness score (SOC2 readiness)"
    ]
  },

  workflows: {
    foh: [
      {
        id: "foh-concierge",
        name: "FOH: Web/PWA Concierge (Customer-facing)",
        risk: "LOW",
        goal: "Answer questions, route to support, generate safe drafts, and reduce ticket load without leaking sensitive info.",
        intakeChannels: ["Website chat", "PWA help widget", "Email form → ticket"],
        dataSources: ["Public docs", "Approved KB snippets", "Product catalog (read-only)"],
        automations: ["Create Freshservice ticket (MED if auto-created)", "Post summary to Slack #support (MED)"],
        approvals: ["LOW: none", "MED: Support lead if auto-ticket creation is enabled"],
        auditEvents: ["prompt.logged", "retrieval.sources.logged", "ticket.created", "message.posted"],
        slo: "P95 response < 2s for cached KB; P95 < 6s for retrieval + model"
      },
      {
        id: "foh-onboarding",
        name: "FOH: Customer Onboarding Wizard",
        risk: "MEDIUM",
        goal: "Guide setup, collect minimal info, and create a structured onboarding plan + follow-ups.",
        intakeChannels: ["Web form", "Sales call notes", "Slack Connect (if used)"],
        dataSources: ["Onboarding templates", "Approved product docs", "CRM snapshot (sanitized)"],
        automations: ["Create onboarding task list in Notion", "Send email sequence draft (Outlook/Gmail)"],
        approvals: ["Service owner for outbound comms templates if regulated"],
        auditEvents: ["form.ingested", "plan.generated", "tasks.created", "email.draft.created"],
        slo: "P95 onboarding plan generation < 12s"
      },
      {
        id: "foh-content",
        name: "FOH: Marketing Content Studio (Guardrailed)",
        risk: "LOW",
        goal: "Generate ads, landing copy, FAQs, and A/B variants while keeping claims truthful and sources cited internally.",
        intakeChannels: ["Notion brief", "Slack brief", "GitHub issue"],
        dataSources: ["Brand kit", "Product facts sheet", "Approved claims list"],
        automations: ["Open PR with content changes (MED)", "Schedule posts via automation (MED)"],
        approvals: ["MED: Marketing lead for publish actions"],
        auditEvents: ["brief.logged", "variants.generated", "pr.opened", "publish.scheduled"],
        slo: "P95 content generation < 10s"
      }
    ],
    boh: [
      {
        id: "boh-it-triage",
        name: "BOH: ITSM Triage (Service Desk)",
        risk: "MEDIUM",
        goal: "Summarize tickets, detect category/priority, propose fixes, and create safe step-by-step runbooks.",
        intakeChannels: ["Freshservice tickets", "Slack #helpdesk", "Teams support channel"],
        dataSources: ["Runbooks", "Known error library", "Endpoint/tool logs (sanitized)"],
        automations: ["Create subtasks", "Suggest remediation commands (read-only)", "Escalate to on-call"],
        approvals: ["MED: Team lead if automation changes ticket state or notifies wide channels"],
        auditEvents: ["ticket.ingested", "classification.done", "runbook.suggested", "escalation.sent"],
        slo: "P95 ticket triage < 15s"
      },
      {
        id: "boh-access",
        name: "BOH: Identity & Access Ops (On/Offboarding)",
        risk: "HIGH",
        goal: "Generate a change plan for onboarding/offboarding, access reviews, and group membership with strict 2-person approvals.",
        intakeChannels: ["HR request → ticket", "Manager request → ITSM"],
        dataSources: ["Role-based access matrix", "Entra/Google directory snapshot (read-only)"],
        automations: ["Execute via Power Automate/Cloud workflows only after approvals"],
        approvals: ["HIGH: Service owner + Security/Compliance (two-person rule)"],
        auditEvents: ["access.plan.generated", "approvals.captured", "changes.executed", "postcheck.passed"],
        slo: "Plan generation < 20s; execution window controlled by CAB"
      },
      {
        id: "boh-deploy",
        name: "BOH: Feature-to-PR → Deploy (Engineering)",
        risk: "HIGH",
        goal: "Turn approved specs into PRs, run checks, and deploy with rollback & evidence capture.",
        intakeChannels: ["GitHub issues", "Notion specs", "Slack #eng requests"],
        dataSources: ["Repo", "CI configs", "Security policies", "Dependency lockfiles"],
        automations: ["Open PR", "Run CI", "Deploy via pipeline", "Rollback if health checks fail"],
        approvals: ["MED: PR review", "HIGH: Production deploy approval (CAB if required)"],
        auditEvents: ["pr.opened", "ci.ran", "deploy.started", "healthcheck.done", "rollback.invoked"],
        slo: "MTTR targets defined per service; deploy verification < 5 minutes"
      },
      {
        id: "boh-secrets",
        name: "BOH: Secrets & Key Rotation (Multi-ecosystem)",
        risk: "HIGH",
        goal: "Rotate keys/tokens safely across OpenAI/Claude/GCP/M365 integrations with zero downtime plan + verification.",
        intakeChannels: ["Scheduled rotation ticket", "Security incident", "Compliance requirement"],
        dataSources: ["Secret inventory", "Service dependency graph", "Runtime config map"],
        automations: ["Rotate keys", "Update deployments", "Invalidate old secrets", "Verify end-to-end"],
        approvals: ["HIGH: Service owner + Security"],
        auditEvents: ["rotation.planned", "rotation.executed", "old.revoked", "verification.passed"],
        slo: "No downtime; full verification before revocation"
      }
    ]
  },

  toolAtlas: [
    // Core execution + storage
    { name: "Supabase", category: "Data & Auth", ecosystems: ["openai","claude","google","m365","cross"], notes: "Postgres + RLS + Edge Functions; good for central policy/audit stores." },
    { name: "Firebase", category: "Data & App Platform", ecosystems: ["google","cross"], notes: "Firestore/Auth/Functions; good for app backends + realtime UI." },
    { name: "Redis (your Redis API)", category: "Caching & Queues", ecosystems: ["cross"], notes: "Use for rate limits, job queues, and idempotency keys for automations." },
    { name: "Vector DB (pgvector)", category: "Retrieval", ecosystems: ["cross"], notes: "RAG store for approved knowledge; pair with doc provenance logging." },

    // Automation planes
    { name: "n8n (your cloud)", category: "Automation", ecosystems: ["cross"], notes: "Primary execution plane for tool calls with approval webhooks." },
    { name: "Zapier", category: "Automation", ecosystems: ["cross"], notes: "Secondary automation plane for lightweight workflows." },
    { name: "Power Automate", category: "Automation (M365)", ecosystems: ["m365"], notes: "M365-native workflow execution and approvals." },
    { name: "IFTTT", category: "Automation", ecosystems: ["cross"], notes: "Consumer-grade triggers; keep scope LOW-risk only." },

    // Collaboration & knowledge
    { name: "Slack", category: "Collaboration", ecosystems: ["cross"], notes: "FOH/BOH intake, approvals, and notifications (log message IDs)." },
    { name: "Microsoft Teams", category: "Collaboration (M365)", ecosystems: ["m365"], notes: "M365-native intake and approvals; map to Purview audit." },
    { name: "Notion", category: "Knowledge Base", ecosystems: ["cross"], notes: "Specs, runbooks, evidence bundles; enforce access controls." },
    { name: "OneNote", category: "Knowledge Base", ecosystems: ["m365"], notes: "Personal/team notes; treat as medium sensitivity by default." },
    { name: "Google Drive", category: "Knowledge Base (Google)", ecosystems: ["google"], notes: "Approved docs + NotebookLM sources; tie to audit logs." },

    // Dev & source control
    { name: "GitHub", category: "Engineering", ecosystems: ["cross"], notes: "Issues/PRs as change records; link evidence bundles." },
    { name: "GitLab", category: "Engineering", ecosystems: ["cross"], notes: "Alt repo/CI surface; same approval/audit model." },
    { name: "Vercel", category: "Deployment", ecosystems: ["cross"], notes: "Deploy plane; require deploy approvals for production." },
    { name: "Netlify", category: "Deployment", ecosystems: ["cross"], notes: "Deploy plane for static/edge; same controls." },
    { name: "Sentry", category: "Observability", ecosystems: ["cross"], notes: "App error tracking; add release tags + trace IDs." },
    { name: "Datadog", category: "Observability", ecosystems: ["cross"], notes: "Metrics/logs/traces; map audit events to dashboards." },
    { name: "OpenTelemetry", category: "Observability", ecosystems: ["cross"], notes: "Standardize traces/metrics/logs across services." },

    // AI ecosystems (explicit)
    { name: "ChatGPT (Enterprise)", category: "AI (OpenAI)", ecosystems: ["openai"], notes: "Workspace governance + compliance surfaces." },
    { name: "OpenAI API Platform", category: "AI (OpenAI)", ecosystems: ["openai"], notes: "Org/project/key lifecycle + audit/compliance APIs." },
    { name: "Claude (Enterprise)", category: "AI (Claude)", ecosystems: ["claude"], notes: "Admin controls + audit logs export." },
    { name: "Claude Code", category: "AI Dev Tooling", ecosystems: ["claude","cross"], notes: "IDE agent; enforce read-only defaults + PR-based changes." },
    { name: "Gemini", category: "AI (Google)", ecosystems: ["google"], notes: "Model surface for Google ecosystem work." },
    { name: "NotebookLM", category: "AI (Google)", ecosystems: ["google"], notes: "Grounded synthesis from Drive sources." },

    // Your builder tools
    { name: "Lovable.dev", category: "App Builder", ecosystems: ["cross"], notes: "Next.js + Supabase workflows; keep outputs under governance." },
    { name: "Replit", category: "Dev Platform", ecosystems: ["cross"], notes: "If used: keep secrets out; treat as LOW/MED only unless hardened." },
    { name: "Google Antigravity", category: "IDE/Agent Workspace", ecosystems: ["google","cross"], notes: "Agent-first workflows; apply strict permission + approval gates." },
    { name: "Cursor", category: "IDE", ecosystems: ["cross"], notes: "Agentic coding; same PR + approval pattern." },

    // AI Engineering / MLOps
    { name: "Arize Phoenix", category: "Evals & Tracing", ecosystems: ["cross"], notes: "Trace traces and run continuous evals on prompt changes." },
    { name: "Portkey / Helicone", category: "AI Gateway", ecosystems: ["cross"], notes: "Model routing, fallbacks, and unified observability (latency/cost)." },

    // ITSM + operations
    { name: "Freshservice", category: "ITSM", ecosystems: ["cross"], notes: "System of record for approvals, changes, and incidents." },
    { name: "Duo", category: "Security", ecosystems: ["cross"], notes: "MFA; treat admin changes as HIGH-risk." },
    { name: "Bitdefender GravityZone", category: "Security", ecosystems: ["cross"], notes: "Endpoint alerts and investigations; log all actions." },
    { name: "Cisco AnyConnect", category: "Security", ecosystems: ["cross"], notes: "VPN; troubleshooting workflows live here." }
  ]
};
