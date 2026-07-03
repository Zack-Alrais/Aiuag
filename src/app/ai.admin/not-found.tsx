import Link from "next/link";

export default function AdminNotFound() {
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
        <h1
          style={{
            fontSize: "6rem",
            fontWeight: 900,
            lineHeight: 1,
            margin: 0,
            color: "#333",
          }}
        >
          404
        </h1>
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: 600,
            margin: "1rem 0 0.5rem",
            color: "#555",
          }}
        >
          Page Not Found
        </h2>
        <p
          style={{
            fontSize: "1rem",
            color: "#888",
            margin: "0 0 2rem",
          }}
        >
          The admin page you are looking for does not exist.
        </p>
        <Link
          href="/ai.admin"
          style={{
            display: "inline-block",
            padding: "0.75rem 1.5rem",
            background: "#333",
            color: "#fff",
            borderRadius: "6px",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
