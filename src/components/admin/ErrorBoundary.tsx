"use client"

import { Component, ReactNode } from "react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error) {
    console.error("ErrorBoundary caught:", error)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#f5f5f5",
            fontFamily: "var(--font-geist-sans, system-ui, sans-serif)",
            textAlign: "center",
            padding: "2rem",
          }}
        >
          <div>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>&#x26A0;&#xFE0F;</div>
            <h1 style={{ fontSize: "2rem", fontWeight: 700, margin: "0 0 0.5rem", color: "#333" }}>
              Error
            </h1>
            <p style={{ fontSize: "1rem", color: "#888", margin: "0 0 2rem" }}>
              An unexpected error occurred.
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: undefined })}
              style={{
                padding: "0.75rem 1.5rem",
                background: "#333",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
