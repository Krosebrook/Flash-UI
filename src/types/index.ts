// Type definitions for AI Integration Map

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface NavItem {
  href: string;
  label: string;
  icon: string;
}

export interface Ecosystem {
  id: string;
  name: string;
  summary: string;
  coreSurfaces: string[];
  auditLogSources: string[];
  apiSurfaces: string[];
  approvalHotspots: string[];
  integrationBridge: string[];
}

export interface RiskLevelConfig {
  level: RiskLevel;
  badge: string;
  description: string;
  approvals: string[];
  requiredControls: string[];
  examples: string[];
}

export interface ApprovalStep {
  n: number;
  title: string;
  desc: string;
}

export interface SOC2Field {
  k: string;
  v: string;
}

export interface SOC2Tagging {
  fields: SOC2Field[];
  guidance: string[];
}

export interface Governance {
  riskLevels: RiskLevelConfig[];
  approvalSteps: ApprovalStep[];
  auditEvidenceBundle: string[];
  soc2Tagging: SOC2Tagging;
}

export interface AuditEventField {
  field: string;
  type: string;
  desc: string;
}

export interface LogSink {
  name: string;
  why: string;
}

export interface Observability {
  centralIdea: string;
  auditEventSchema: AuditEventField[];
  sinks: LogSink[];
  dashboards: string[];
}

export interface Workflow {
  id: string;
  name: string;
  risk: RiskLevel;
  goal: string;
  intakeChannels: string[];
  dataSources: string[];
  automations: string[];
  approvals: string[];
  auditEvents: string[];
  slo: string;
}

export interface Workflows {
  foh: Workflow[];
  boh: Workflow[];
}

export type EcosystemId = 'openai' | 'claude' | 'google' | 'm365' | 'cross';

export interface Tool {
  name: string;
  category: string;
  ecosystems: EcosystemId[];
  notes: string;
}

export interface SiteConfig {
  title: string;
  subtitle: string;
  version: string;
  lastUpdatedISO: string;
  principles: string[];
  fourEcosystems: string[];
}

export interface AppConfig {
  site: SiteConfig;
  nav: NavItem[];
  ecosystems: Ecosystem[];
  governance: Governance;
  observability: Observability;
  workflows: Workflows;
  toolAtlas: Tool[];
}
