export default function Loading() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        fontFamily: "var(--font-pixel), monospace",
        color: "var(--text-tertiary, #9a8b76)",
        fontSize: "0.9rem",
        gap: "0.8rem",
      }}
    >
      <span
        style={{
          display: "inline-block",
          width: 8,
          height: 8,
          background: "var(--accent-gold, #c9a86c)",
          animation: "loadPulse 1s steps(2) infinite",
        }}
      />
      <span>加载中</span>
      <style>{`
        @keyframes loadPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.2; }
        }
      `}</style>
    </div>
  );
}
