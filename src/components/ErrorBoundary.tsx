// src/components/ErrorBoundary.tsx - Error boundary for Sacred Grid

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Sacred Grid Error Boundary caught an error:', error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: '#000',
          color: '#fff',
          fontFamily: 'Arial, sans-serif',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '600px',
            padding: '40px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '10px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <h1 style={{
              fontSize: '2.5rem',
              marginBottom: '20px',
              color: '#ff6b6b'
            }}>
              ⚠️ Sacred Grid Error
            </h1>
            
            <p style={{
              fontSize: '1.2rem',
              marginBottom: '30px',
              lineHeight: '1.6'
            }}>
              Something went wrong while rendering the sacred geometry visualization.
            </p>

            <div style={{
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              padding: '20px',
              borderRadius: '5px',
              marginBottom: '30px',
              textAlign: 'left',
              fontFamily: 'monospace',
              fontSize: '0.9rem',
              maxHeight: '200px',
              overflow: 'auto'
            }}>
              <strong>Error:</strong> {this.state.error?.message}
              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <>
                  <br /><br />
                  <strong>Stack Trace:</strong>
                  <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.8rem' }}>
                    {this.state.errorInfo.componentStack}
                  </pre>
                </>
              )}
            </div>

            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button
                onClick={this.handleReset}
                style={{
                  backgroundColor: '#0077ff',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  transition: 'background-color 0.3s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0055cc'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#0077ff'}
              >
                Try Again
              </button>
              
              <button
                onClick={() => window.location.reload()}
                style={{
                  backgroundColor: 'transparent',
                  color: '#fff',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  padding: '12px 24px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  transition: 'border-color 0.3s'
                }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.6)'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'}
              >
                Reload Page
              </button>
            </div>

            <p style={{
              marginTop: '30px',
              fontSize: '0.9rem',
              opacity: '0.7'
            }}>
              If this error persists, please check the browser console for more details
              or report the issue on our GitHub repository.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;