export interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

export function Card({ children, className = '', glow = false }: CardProps) {
  return (
    <div className={`card ${glow ? 'card--glow' : ''} ${className}`}>
      {children}
    </div>
  );
}

export interface CardHeaderProps {
  children: React.ReactNode;
  icon?: string;
}

export function CardHeader({ children, icon }: CardHeaderProps) {
  return (
    <div className="card-header">
      {icon && <span className="card-icon">{icon}</span>}
      <h3 className="card-title">{children}</h3>
    </div>
  );
}

export interface CardBodyProps {
  children: React.ReactNode;
}

export function CardBody({ children }: CardBodyProps) {
  return <div className="card-body">{children}</div>;
}
