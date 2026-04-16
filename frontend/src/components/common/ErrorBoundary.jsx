import { Component } from 'react'

/**
 * ErrorBoundary
 *
 * Wraps the whole app in App.jsx. If any child component throws
 * during render, this catches it and shows a friendly crash screen
 * instead of a blank white page.
 *
 * Usage (in main.jsx or App.jsx):
 *   <ErrorBoundary>
 *     <App />
 *   </ErrorBoundary>
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    // Log to console in dev; swap for a real logger (Sentry etc.) in prod
    console.error('React ErrorBoundary caught:', error, info.componentStack)
  }

  handleReload = () => {
    window.location.href = '/'
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: 'var(--gray-50, #f8fafc)',
        fontFamily: "'DM Sans', sans-serif",
        textAlign: 'center',
      }}>

        {/* Icon */}
        <div style={{ fontSize: 64, marginBottom: 16 }}>⚠️</div>

        {/* Heading */}
        <h1 style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: 28,
          fontWeight: 800,
          color: 'var(--gray-900, #0f172a)',
          marginBottom: 12,
        }}>
          Something went wrong
        </h1>

        {/* Subtext */}
        <p style={{
          fontSize: 15,
          color: 'var(--gray-500, #64748b)',
          maxWidth: 420,
          lineHeight: 1.7,
          marginBottom: 32,
        }}>
          An unexpected error occurred. This has been logged.
          Try going back to the home page — your work may have been saved.
        </p>

        {/* Error detail — only shown in dev (import.meta.env.DEV) */}
        {import.meta.env.DEV && this.state.error && (
          <pre style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            padding: '16px 20px',
            fontSize: 12,
            color: '#991b1b',
            maxWidth: 560,
            overflowX: 'auto',
            textAlign: 'left',
            marginBottom: 32,
            lineHeight: 1.6,
          }}>
            {this.state.error.toString()}
          </pre>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={this.handleReload}
            style={{
              padding: '12px 28px',
              background: 'var(--blue-600, #2563eb)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: 15,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            ← Go to Home
          </button>

          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 28px',
              background: 'white',
              color: 'var(--gray-700, #334155)',
              border: '1.5px solid var(--gray-200, #e2e8f0)',
              borderRadius: '12px',
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Try Again
          </button>
        </div>

      </div>
    )
  }
}