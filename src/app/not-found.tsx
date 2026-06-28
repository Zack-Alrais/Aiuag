"use client";

import Link from "next/link";

export default function NotFound() {
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
        <h1
          style={{
            fontSize: "8rem",
            fontWeight: 900,
            lineHeight: 1,
            margin: 0,
            background: "linear-gradient(135deg, #e94560, #ff6b6b)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          404
        </h1>
        <h2
          style={{
            fontSize: "2rem",
            fontWeight: 700,
            margin: "1rem 0 0.5rem",
          }}
        >
          الصفحة غير موجودة
        </h2>
        <p
          style={{
            fontSize: "1.25rem",
            color: "#a0a0b0",
            margin: "0 0 2rem",
          }}
        >
          Page Not Found
        </p>
        <Link
          href="/ar"
          style={{
            display: "inline-block",
            padding: "0.875rem 2rem",
            background: "linear-gradient(135deg, #e94560, #ff6b6b)",
            color: "#fff",
            borderRadius: "8px",
            textDecoration: "none",
            fontWeight: 600,
            fontSize: "1rem",
            transition: "transform 0.2s, box-shadow 0.2s",
          }}
        >
          العودة للرئيسية
        </Link>
      </div>
    </div>
  );
}
