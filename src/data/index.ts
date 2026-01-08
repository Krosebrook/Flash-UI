// Data module exports for AI Integration Map
// Re-exports all configuration data and provides convenient accessors

export { CONFIG } from './config';

// Re-export types for convenience
export type {
  AppConfig,
  SiteConfig,
  NavItem,
  Ecosystem,
  RiskLevel,
  RiskLevelConfig,
  ApprovalStep,
  SOC2Field,
  SOC2Tagging,
  Governance,
  AuditEventField,
  LogSink,
  Observability,
  Workflow,
  Workflows,
  EcosystemId,
  Tool,
} from '../types';

// Convenience accessors for commonly used data subsets
import { CONFIG } from './config';

/** Site metadata and principles */
export const siteConfig = CONFIG.site;

/** Navigation items */
export const navItems = CONFIG.nav;

/** All ecosystem configurations */
export const ecosystems = CONFIG.ecosystems;

/** Governance configuration (risk levels, approval steps, etc.) */
export const governance = CONFIG.governance;

/** Observability configuration (audit schema, sinks, dashboards) */
export const observability = CONFIG.observability;

/** Workflow definitions (FOH and BOH) */
export const workflows = CONFIG.workflows;

/** Tool atlas entries */
export const toolAtlas = CONFIG.toolAtlas;

// Helper functions for data access

/**
 * Get an ecosystem by its ID
 */
export function getEcosystemById(id: string) {
  return ecosystems.find(e => e.id === id);
}

/**
 * Get workflows by risk level
 */
export function getWorkflowsByRisk(risk: 'LOW' | 'MEDIUM' | 'HIGH') {
  return {
    foh: workflows.foh.filter(w => w.risk === risk),
    boh: workflows.boh.filter(w => w.risk === risk),
  };
}

/**
 * Get tools by ecosystem ID
 */
export function getToolsByEcosystem(ecosystemId: string) {
  return toolAtlas.filter(t => t.ecosystems.includes(ecosystemId as any));
}

/**
 * Get tools by category
 */
export function getToolsByCategory(category: string) {
  return toolAtlas.filter(t => t.category === category);
}

/**
 * Get all unique tool categories
 */
export function getToolCategories(): string[] {
  return [...new Set(toolAtlas.map(t => t.category))].sort();
}

/**
 * Get risk level configuration by level
 */
export function getRiskLevelConfig(level: 'LOW' | 'MEDIUM' | 'HIGH') {
  return governance.riskLevels.find(r => r.level === level);
}
