import React from 'react';

export interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  fadeOut?: boolean;
}

export function EmptyState({
  icon = '✨',
  title,
  description,
  action,
  fadeOut = false
}: EmptyStateProps) {
  return (
    <div className={`empty-state ${fadeOut ? 'fade-out' : ''}`}>
      <div className="empty-content">
        <div className="empty-icon">{icon}</div>
        <h1 className="empty-title">{title}</h1>
        {description && <p className="empty-description">{description}</p>}
        {action && (
          <button className="surprise-button" onClick={action.onClick}>
            {action.label}
            <span className="button-arrow">→</span>
          </button>
        )}
      </div>
    </div>
  );
}

// Loading skeleton for cards
export function CardSkeleton() {
  return (
    <div className="card-skeleton">
      <div className="skeleton-header">
        <div className="skeleton-icon skeleton-pulse" />
        <div className="skeleton-title skeleton-pulse" />
      </div>
      <div className="skeleton-body">
        <div className="skeleton-line skeleton-pulse" />
        <div className="skeleton-line skeleton-pulse" style={{ width: '80%' }} />
        <div className="skeleton-line skeleton-pulse" style={{ width: '60%' }} />
      </div>
    </div>
  );
}

// Animated dots loading indicator
export function LoadingDots() {
  return (
    <span className="loading-dots">
      <span className="dot">.</span>
      <span className="dot">.</span>
      <span className="dot">.</span>
    </span>
  );
}
