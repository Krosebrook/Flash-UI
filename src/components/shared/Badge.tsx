import type { RiskLevel } from '../../types';

export interface BadgeProps {
  level: RiskLevel;
  children?: React.ReactNode;
}

export function Badge({ level, children }: BadgeProps) {
  const className = level === 'LOW' ? 'badge--good' : level === 'MEDIUM' ? 'badge--warn' : 'badge--bad';
  return <span className={`badge ${className}`}>{children || level}</span>;
}
