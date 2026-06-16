"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "80vh",
        fontFamily: "var(--font-pixel), monospace",
        color: "var(--text-primary, #2c2416)",
        textAlign: "center",
        padding: "2rem",
      }}
    >
      <div
        style={{
          fontSize: "3rem",
          marginBottom: "1rem",
        }}
      >
        ✕
      </div>
      <h1 style={{ fontSize: "1.6rem", margin: "0 0 0.8rem" }}>出了点问题</h1>
      <p
        style={{
          fontSize: "0.85rem",
          color: "var(--text-secondary, #5c4f3c)",
          maxWidth: "400px",
          lineHeight: 1.8,
          margin: "0 0 1.5rem",
        }}
      >
        {error.message || "页面加载时发生了未知错误。"}
      </p>
      <button
        onClick={reset}
        style={{
          fontFamily: "var(--font-pixel), monospace",
          fontSize: "0.9rem",
          padding: "0.7rem 2rem",
          background: "var(--accent-gold, #c9a86c)",
          color: "var(--text-primary, #2c2416)",
          border: "2px solid var(--text-primary, #2c2416)",
          borderRadius: 0,
          boxShadow: "3px 3px 0 0 var(--text-primary, #2c2416)",
          cursor: "pointer",
        }}
      >
        重试
      </button>
    </div>
  );
}
