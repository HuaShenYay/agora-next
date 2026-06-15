"use client";
import { useCallback, useEffect, useRef, useState } from "react";

interface Beat { id: string; text: string; type: "title" | "quote" | "text" | "highlight" | "editorial"; }
const APPLE_EASING = "cubic-bezier(0.22, 1, 0.36, 1)";

export default function PhilosophyNarrative() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const rafRef = useRef<number | null>(null);

  const beats: Beat[] = [
    { id: "1", text: "未经审视的人生不值得一过", type: "title" },
    { id: "2", text: "苏格拉底说这句话的时候，没有人替他把希腊文翻译成晦涩的学术黑话。", type: "text" },
    { id: "3", text: "但今天，大多数经典著作的中译本，读起来像是在惩罚读者。", type: "text" },
    { id: "4", text: "冗长的从句、僵硬的术语、学阀式的注脚——翻译本应是桥梁，却成了围墙。", type: "quote" },
    { id: "5", text: "如果每个人都能借助 AI，自己重译一本经典呢？", type: "highlight" },
    { id: "6", text: "不是功利的，不是学术生产的，而是忠于原意的、可读的、活的译本。", type: "text" },
    { id: "7", text: "然后，把它免费开源。任何人都能 Fork、修改、提交更好的翻译。", type: "text" },
    { id: "8", text: "这就是集市 Agora——用 AI 重译经典，让强译本回归公共领域。", type: "editorial" },
  ];

  const updateActiveBeat = useCallback(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const scrollTop = -rect.top;
    const containerHeight = rect.height;
    const totalScrollable = containerHeight - viewportHeight;
    if (totalScrollable <= 0) return;
    const progress = Math.max(0, Math.min(1, scrollTop / totalScrollable));
    setScrollProgress(progress);
    const beatProgress = progress * beats.length;
    setActiveIndex(Math.min(beats.length - 1, Math.floor(beatProgress)));
  }, [beats.length]);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) { rafRef.current = requestAnimationFrame(() => { updateActiveBeat(); ticking = false; }); ticking = true; }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    updateActiveBeat();
    return () => { window.removeEventListener("scroll", handleScroll); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [updateActiveBeat]);

  const getBeatVisibility = (index: number) => {
    const beatProgress = scrollProgress * beats.length;
    const distance = beatProgress - index;
    if (distance < -0.3 || distance > 1.3) return { opacity: 0, scale: 0.9, translateY: 50, zIndex: index };
    let opacity = 1, scale = 1, translateY = 0;
    if (distance < 0) { opacity = (distance + 0.3) / 0.3; scale = 0.95 + opacity * 0.05; translateY = (1 - opacity) * 40; }
    else if (distance > 0.7) { opacity = 1 - (distance - 0.7) / 0.6; scale = 0.95 + opacity * 0.05; translateY = (1 - opacity) * -40; }
    opacity = Math.max(0, Math.min(1, opacity));
    return { opacity, scale, translateY, zIndex: index };
  };

  const getBeatStyle = (beat: Beat, visibility: { opacity: number; scale: number; translateY: number }) => {
    const baseStyle: Record<string, string | number> = {
      opacity: visibility.opacity, transform: `translateY(${visibility.translateY}px) scale(${visibility.scale})`,
      transition: `opacity 0.4s ${APPLE_EASING}, transform 0.4s ${APPLE_EASING}`, willChange: "opacity, transform",
    };
    switch (beat.type) {
      case "title": return { ...baseStyle, fontFamily: "var(--font-hero)", fontSize: "clamp(2rem, 4.5vw, 3.5rem)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, color: "var(--text-primary)", textAlign: "center" as const, marginBottom: "2rem", maxWidth: "95vw" };
      case "quote": return { ...baseStyle, fontSize: "clamp(1.8rem, 4vw, 3rem)", fontStyle: "italic", color: "var(--accent-gold)", borderLeft: "4px solid var(--accent-gold)", paddingLeft: "2rem", margin: "2rem auto", maxWidth: "80vw", opacity: visibility.opacity * 0.95 };
      case "highlight": return { ...baseStyle, fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 600, color: "var(--accent-gold)", textAlign: "center" as const, margin: "2rem auto", maxWidth: "85vw" };
      case "editorial": return { ...baseStyle, fontFamily: "var(--font-hero)", fontSize: "clamp(2rem, 4.5vw, 3.5rem)", fontWeight: 500, lineHeight: 1.5, color: "var(--text-primary)", textAlign: "center" as const, maxWidth: "85vw", margin: "2rem auto", letterSpacing: "0.02em" };
      default: return { ...baseStyle, fontSize: "clamp(1.5rem, 3vw, 2.2rem)", lineHeight: 1.8, color: "var(--text-secondary)", maxWidth: "80vw", margin: "1.5rem auto" };
    }
  };

  return (
    <section ref={containerRef} className="philosophy-narrative" id="philosophy" style={{ minHeight: `${beats.length * 100}vh`, background: "var(--bg-secondary)", position: "relative" }}>
      <div className="narrative-content" style={{ position: "sticky", top: 0, height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        <div className="narrative-bg" style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 50%, rgba(201, 168, 108, 0.05) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(180, 123, 92, 0.03) 0%, transparent 40%)", pointerEvents: "none" }} />
        <div className="progress-dots" style={{ position: "absolute", right: "2rem", top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: "0.75rem", zIndex: 100 }}>
          {beats.map((_, index) => {
            const isActive = index === activeIndex; const isPast = index < activeIndex;
            return <div key={index} className="progress-dot" style={{ width: "8px", height: "8px", borderRadius: "50%", background: isActive || isPast ? "var(--accent-gold)" : "var(--border-medium)", transform: isActive ? "scale(1.4)" : "scale(1)", opacity: isActive ? 1 : isPast ? 0.7 : 0.4, transition: `all 0.3s ${APPLE_EASING}` }} />;
          })}
        </div>
        <div className="beats-container" style={{ position: "relative", width: "100%", maxWidth: "1200px", padding: "0 2rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "70vh" }}>
          {beats.map((beat, index) => {
            const visibility = getBeatVisibility(index);
            if (visibility.opacity <= 0.02) return null;
            return <div key={beat.id} className={`beat beat-${beat.type}`} style={{ position: "absolute", textAlign: "center" as const, width: "100%", zIndex: visibility.zIndex, ...getBeatStyle(beat, visibility) }}>{beat.text}</div>;
          })}
        </div>
        {activeIndex < beats.length - 1 && (
          <div className="scroll-hint" style={{ position: "absolute", bottom: "3rem", left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", opacity: 0.5, animation: "fadeInOut 2s infinite" }}>
            <span style={{ fontSize: "0.7rem", letterSpacing: "0.15em", color: "var(--text-tertiary)", textTransform: "uppercase" }}>滑动继续</span>
            <div style={{ width: "20px", height: "32px", border: "2px solid var(--text-tertiary)", borderRadius: "10px", display: "flex", justifyContent: "center", paddingTop: "6px" }}>
              <div style={{ width: "3px", height: "6px", background: "var(--text-tertiary)", borderRadius: "2px", animation: "scrollBounce 2s infinite" }} />
            </div>
          </div>
        )}
      </div>
      <div style={{ height: `${(beats.length - 1) * 100}vh` }} />
      <style>{`
        @keyframes scrollBounce { 0%, 100% { transform: translateY(0); opacity: 1; } 50% { transform: translateY(4px); opacity: 0.5; } }
        @keyframes fadeInOut { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.6; } }
        .beat { pointer-events: none; }
        @media (prefers-reduced-motion: reduce) { .beat { transition: opacity 0.2s ease !important; transform: none !important; } .scroll-hint { display: none !important; } }
        @media (max-width: 768px) { .progress-dots { display: none !important; } .beats-container { padding: 0 1.5rem !important; } .beat-title { font-size: clamp(1.6rem, 4vw, 2.5rem) !important; } }
      `}</style>
    </section>
  );
}
