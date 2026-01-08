import React from 'react';

export interface ActionButton {
  icon: string;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'primary' | 'accent';
}

export interface FloatingActionBarProps {
  visible: boolean;
  actions: ActionButton[];
  position?: 'bottom' | 'bottom-right' | 'bottom-center';
}

export function FloatingActionBar({
  visible,
  actions,
  position = 'bottom-center'
}: FloatingActionBarProps) {
  const positionClass = {
    'bottom': 'fab-bottom',
    'bottom-right': 'fab-bottom-right',
    'bottom-center': 'fab-bottom-center',
  }[position];

  return (
    <div className={`floating-action-bar ${positionClass} ${visible ? 'visible' : ''}`}>
      <div className="fab-actions">
        {actions.map((action, index) => (
          <button
            key={index}
            className={`fab-btn fab-btn--${action.variant || 'default'}`}
            onClick={action.onClick}
          >
            <span className="fab-icon">{action.icon}</span>
            <span className="fab-label">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// Utility bar component (fixed position helpers)
export interface UtilityBarProps {
  children: React.ReactNode;
}

export function UtilityBar({ children }: UtilityBarProps) {
  return (
    <div className="utility-bar">
      {children}
    </div>
  );
}

export interface UtilityButtonProps {
  icon: string;
  label: string;
  onClick: () => void;
  badge?: number;
}

export function UtilityButton({ icon, label, onClick, badge }: UtilityButtonProps) {
  return (
    <button className="utility-btn" onClick={onClick}>
      <span className="utility-icon">{icon}</span>
      <span className="utility-label">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="utility-badge">{badge}</span>
      )}
    </button>
  );
}

// Navigation handle (left/right arrows)
export interface NavHandleProps {
  direction: 'left' | 'right';
  onClick: () => void;
  disabled?: boolean;
}

export function NavHandle({ direction, onClick, disabled }: NavHandleProps) {
  return (
    <button
      className={`nav-handle ${direction} ${disabled ? 'disabled' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {direction === 'left' ? '←' : '→'}
    </button>
  );
}
