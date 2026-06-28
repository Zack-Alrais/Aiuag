"use client";

import { useEffect } from "react";

export default function LangError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        color: "#ffffff",
        fontFamily: "var(--font-geist-sans, system-ui, sans-serif)",
        textAlign: "center",
        padding: "2rem",
      }}
    >
      <div>
        <div
          style={{
            fontSize: "4rem",
            marginBottom: "1rem",
          }}
        >
          ⚠️
        </div>
        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: 700,
            margin: "0 0 0.5rem",
          }}
        >
          حدث خطأ ما
        </h1>
        <p
          style={{
            fontSize: "1.15rem",
            color: "#a0a0b0",
            margin: "0 0 2rem",
          }}
        >
          Something went wrong
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={() => reset()}
            style={{
              padding: "0.875rem 2rem",
              background: "linear-gradient(135deg, #e94560, #ff6b6b)",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "1rem",
            }}
          >
            إعادة المحاولة / Try Again
          </button>
          <a
            href="mailto:support@aiuag.edu"
            style={{
              display: "inline-block",
              padding: "0.875rem 2rem",
              background: "transparent",
              color: "#e94560",
              border: "2px solid #e94560",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: "1rem",
            }}
          >
            تواصل مع الدعم / Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
