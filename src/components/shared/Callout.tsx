export interface CalloutProps {
  variant?: 'info' | 'warn' | 'bad' | 'good';
  children: React.ReactNode;
}

export function Callout({ variant = 'info', children }: CalloutProps) {
  return (
    <div className={`callout callout--${variant}`}>
      {children}
    </div>
  );
}
