import React from 'react';

export interface ArtifactCardProps {
  children: React.ReactNode;
  title?: string;
  icon?: string;
  generating?: boolean;
  error?: string;
  focused?: boolean;
  className?: string;
  onClick?: () => void;
}

export function ArtifactCard({
  children,
  title,
  icon,
  generating = false,
  error,
  focused = false,
  className = '',
  onClick,
}: ArtifactCardProps) {
  return (
    <div
      className={`artifact-card ${generating ? 'generating' : ''} ${focused ? 'focused' : ''} ${error ? 'has-error' : ''} ${className}`}
      onClick={onClick}
    >
      {/* Glow overlay for generating state */}
      {generating && (
        <div className="generating-overlay">
          <div className="generating-spinner" />
          <span className="generating-text">Generating...</span>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="error-overlay">
          <span className="error-icon">⚠</span>
          <span className="error-text">{error}</span>
        </div>
      )}

      {/* Card header */}
      {(title || icon) && (
        <div className="artifact-header">
          {icon && <span className="artifact-icon">{icon}</span>}
          {title && <h3 className="artifact-title">{title}</h3>}
        </div>
      )}

      {/* Card content */}
      <div className="artifact-content">
        {children}
      </div>

      {/* Bottom glow effect */}
      <div className="artifact-glow" />
    </div>
  );
}

export interface ArtifactGridProps {
  children: React.ReactNode;
  className?: string;
}

export function ArtifactGrid({ children, className = '' }: ArtifactGridProps) {
  return (
    <div className={`artifact-grid ${className}`}>
      {children}
    </div>
  );
}

// Preview card for code/content streaming
export interface PreviewCardProps {
  content: string;
  language?: string;
  streaming?: boolean;
}

export function PreviewCard({ content, language = 'text', streaming = false }: PreviewCardProps) {
  return (
    <div className={`preview-card ${streaming ? 'streaming' : ''}`}>
      <div className="preview-header">
        <span className="preview-language">{language}</span>
        {streaming && <span className="streaming-indicator" />}
      </div>
      <pre className="preview-content">
        <code>{content}</code>
      </pre>
    </div>
  );
}
