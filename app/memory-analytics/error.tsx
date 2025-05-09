"use client"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "600px",
        margin: "40px auto",
        textAlign: "center",
      }}
    >
      <h2 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "16px" }}>Something went wrong!</h2>
      <p style={{ marginBottom: "20px" }}>We encountered an error while loading the memory analytics page.</p>
      <button
        onClick={reset}
        style={{
          padding: "8px 16px",
          backgroundColor: "#0f172a",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          marginRight: "8px",
        }}
      >
        Try again
      </button>
      <a
        href="/"
        style={{
          padding: "8px 16px",
          backgroundColor: "white",
          color: "#0f172a",
          border: "1px solid #0f172a",
          borderRadius: "4px",
          textDecoration: "none",
          display: "inline-block",
        }}
      >
        Return to Dashboard
      </a>
      {error.digest && (
        <p style={{ fontSize: "12px", color: "#64748b", marginTop: "20px" }}>Error ID: {error.digest}</p>
      )}
    </div>
  )
}
