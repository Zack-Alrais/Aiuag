"use client";

import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin error:", error);
  }, [error]);

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
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: 700,
            margin: "0 0 0.5rem",
            color: "#333",
          }}
        >
          Error
        </h1>
        <p
          style={{
            fontSize: "1rem",
            color: "#888",
            margin: "0 0 2rem",
          }}
        >
          An error occurred in the admin panel.
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={() => reset()}
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
          <a
            href="/ai.admin"
            style={{
              display: "inline-block",
              padding: "0.75rem 1.5rem",
              background: "transparent",
              color: "#333",
              border: "2px solid #333",
              borderRadius: "6px",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
