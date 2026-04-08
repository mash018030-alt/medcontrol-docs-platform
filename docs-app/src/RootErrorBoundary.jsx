import { Component } from 'react'

export default class RootErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { err: null }
  }

  static getDerivedStateFromError(err) {
    return { err }
  }

  componentDidCatch(err, info) {
    console.error('RootErrorBoundary:', err, info?.componentStack)
  }

  render() {
    if (this.state.err) {
      return (
        <div
          style={{
            fontFamily: 'system-ui, sans-serif',
            padding: '1.5rem',
            maxWidth: '42rem',
            margin: '2rem auto',
            lineHeight: 1.5,
          }}
        >
          <h1 style={{ fontSize: '1.25rem' }}>Ошибка при загрузке интерфейса</h1>
          <p style={{ color: '#64748b' }}>
            Откройте консоль разработчика (F12) — там полный текст ошибки. Ниже кратко:
          </p>
          <pre
            style={{
              background: '#f1f5f9',
              padding: '1rem',
              overflow: 'auto',
              fontSize: '0.875rem',
              borderRadius: '8px',
            }}
          >
            {String(this.state.err?.message || this.state.err)}
          </pre>
          <button
            type="button"
            style={{ marginTop: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}
            onClick={() => window.location.reload()}
          >
            Обновить страницу
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
