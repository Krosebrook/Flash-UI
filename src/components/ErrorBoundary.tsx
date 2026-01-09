/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Component, ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component to catch and handle React errors gracefully
 * Prevents entire app crashes by displaying fallback UI
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render shows the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback or default error UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          style={{
            padding: '2rem',
            maxWidth: '600px',
            margin: '4rem auto',
            textAlign: 'center',
            color: 'rgba(255, 255, 255, 0.9)',
          }}
        >
          <div
            style={{
              fontSize: '3rem',
              marginBottom: '1rem',
            }}
          >
            ⚠️
          </div>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>
            Something went wrong
          </h2>
          <p
            style={{
              marginBottom: '1.5rem',
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '0.95rem',
            }}
          >
            We encountered an unexpected error. Please try refreshing the page.
          </p>
          {this.state.error && (
            <details
              style={{
                marginTop: '1.5rem',
                padding: '1rem',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
                textAlign: 'left',
                fontSize: '0.875rem',
                fontFamily: 'monospace',
                color: 'rgba(255, 255, 255, 0.5)',
              }}
            >
              <summary style={{ cursor: 'pointer', marginBottom: '0.5rem' }}>
                Error Details
              </summary>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {this.state.error.toString()}
              </pre>
            </details>
          )}
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '1.5rem',
              padding: '0.75rem 1.5rem',
              background: 'rgba(244, 114, 182, 0.2)',
              border: '1px solid rgba(244, 114, 182, 0.4)',
              borderRadius: '8px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '0.95rem',
              fontWeight: '500',
            }}
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
