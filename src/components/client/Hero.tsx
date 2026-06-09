"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

const PixelFlower = ({ className = "" }: { className?: string }) => (
  <svg className={className} width="40" height="40" viewBox="0 0 12 12" fill="currentColor">
    <rect x="5" y="0" width="2" height="2" /><rect x="5" y="4" width="2" height="2" />
    <rect x="5" y="8" width="2" height="2" /><rect x="5" y="10" width="2" height="2" />
    <rect x="0" y="4" width="2" height="2" /><rect x="2" y="4" width="2" height="2" />
    <rect x="8" y="4" width="2" height="2" /><rect x="10" y="4" width="2" height="2" />
    <rect x="4" y="3" width="1" height="1" /><rect x="7" y="3" width="1" height="1" />
    <rect x="4" y="6" width="1" height="1" /><rect x="7" y="6" width="1" height="1" />
  </svg>
);

const PixelLightbulb = ({ className = "" }: { className?: string }) => (
  <svg className={className} width="36" height="36" viewBox="0 0 10 12" fill="currentColor">
    <rect x="3" y="0" width="4" height="1" /><rect x="2" y="1" width="6" height="1" />
    <rect x="1" y="2" width="8" height="3" /><rect x="2" y="5" width="6" height="1" />
    <rect x="3" y="6" width="4" height="1" /><rect x="3" y="7" width="4" height="1" />
    <rect x="4" y="8" width="2" height="2" /><rect x="3" y="10" width="4" height="2" />
  </svg>
);

const PixelArrowRight = ({ className = "" }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 8 8" fill="currentColor">
    <rect x="0" y="3" width="6" height="2" /><rect x="4" y="1" width="2" height="2" />
    <rect x="4" y="5" width="2" height="2" /><rect x="6" y="0" width="2" height="1" />
    <rect x="6" y="7" width="2" height="1" />
  </svg>
);

const AthensAcademy = ({ className = "" }: { className?: string }) => (
  <svg className={`icon-breathe ${className}`} width="48" height="40" viewBox="0 0 12 10" fill="currentColor">
    <rect x="5" y="0" width="2" height="1" className="temple-roof" />
    <rect x="4" y="1" width="4" height="1" className="temple-roof" />
    <rect x="2" y="2" width="8" height="1" /><rect x="1" y="3" width="10" height="1" />
    <rect x="2" y="4" width="1" height="4" className="column-1" />
    <rect x="4" y="4" width="1" height="4" className="column-2" />
    <rect x="7" y="4" width="1" height="4" className="column-3" />
    <rect x="9" y="4" width="1" height="4" className="column-4" />
    <rect x="1" y="8" width="10" height="2" />
  </svg>
);

const FlippingBook = ({ className = "" }: { className?: string }) => (
  <svg className={`icon-flip ${className}`} width="44" height="40" viewBox="0 0 11 10" fill="currentColor">
    <rect x="5" y="0" width="1" height="10" />
    <path d="M4,1 L1,2 L1,8 L4,9 Z" opacity="0.8" />
    <path d="M6,1 L9,2 L9,8 L6,9 Z" className="page-flip" />
    <rect x="2" y="3" width="2" height="1" opacity="0.5" />
    <rect x="7" y="3" width="2" height="1" opacity="0.5" />
  </svg>
);

const Megaphone = ({ className = "" }: { className?: string }) => (
  <svg className={`icon-shake ${className}`} width="44" height="40" viewBox="0 0 11 10" fill="currentColor">
    <rect x="1" y="3" width="2" height="4" /><rect x="3" y="2" width="2" height="6" />
    <rect x="5" y="1" width="3" height="8" />
    <rect x="9" y="3" width="1" height="1" className="sound-wave-1" />
    <rect x="10" y="2" width="1" height="1" className="sound-wave-2" />
    <rect x="9" y="6" width="1" height="1" className="sound-wave-1" />
    <rect x="10" y="7" width="1" height="1" className="sound-wave-2" />
  </svg>
);

const Clock = () => {
  const [time, setTime] = useState("");
  useEffect(() => {
    const update = () => {
      setTime(new Date().toLocaleTimeString("zh-CN", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);
  return <span className="hero-clock">{time}</span>;
};

const EmailModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSending) return;
    setIsSending(true);
    try {
      const resp = await fetch("/api/greeting", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      if (resp.ok) {
        setSubmitted(true);
        setTimeout(() => { setSubmitted(false); setEmail(""); setName(""); setMessage(""); onClose(); }, 3000);
      } else {
        const errData = await resp.json().catch(() => ({}));
        alert(`提交失败: ${errData.error || "提交失败，请稍后重试。"}`);
      }
    } catch {
      alert("网络错误，请检查您的连接。");
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal professional-modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose}>×</button>
        {submitted ? (
          <div className="modal-success">
            <div className="modal-icon"><PixelLightbulb className="pulse" /></div>
            <h3 className="modal-title">申请已发送</h3>
            <p className="modal-text">感谢您的关注，我们会在评估后与您联系。</p>
          </div>
        ) : (
          <>
            <div className="modal-icon"><PixelFlower className="spin" /></div>
            <h3 className="modal-title">提交申请</h3>
            <p className="modal-text">请留下您的联系方式，我们将为您开启集市的专业研讨体验。</p>
            <form onSubmit={handleSubmit} className="modal-form">
              <input type="text" placeholder="您的称呼 / Name" value={name} onChange={(e) => setName(e.target.value)} required className="modal-input" />
              <input type="email" placeholder="您的邮箱 / Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="modal-input" />
              <textarea placeholder="申请理由 / Message (Optional)" value={message} onChange={(e) => setMessage(e.target.value)} className="modal-input modal-textarea" />
              <button type="submit" className="modal-button professional-button">发送申请 <PixelArrowRight /></button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default function Hero() {
  const [modalOpen, setModalOpen] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const hero = heroRef.current;
      if (hero && scrolled < window.innerHeight) {
        const rows = hero.querySelectorAll(".hero-row");
        rows.forEach((row, i) => {
          const speed = 0.05 * (i + 1);
          (row as HTMLElement).style.transform = `translateY(${scrolled * speed}px)`;
        });
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <style>{`
        @keyframes flicker { 0%, 100% { opacity: 1; } 3%, 100% { opacity: 1; } 3.1% { opacity: 0; } 6% { opacity: 1; } 6.1% { opacity: 0; } 9% { opacity: 1; } 9.1% { opacity: 0; } 12% { opacity: 1; } }
        .animate-flicker { animation: flicker 6.2s linear infinite; }
        @keyframes colorCycle { 0%, 100% { color: #2c2416; } 50% { color: var(--cycle-color, #d4b87a); } }
        @keyframes gentleBounce { 0%, 100% { transform: translateY(0) skewX(0); } 50% { transform: translateY(-2px) skewX(-1deg); } }
        .animate-gentle-bounce { animation: gentleBounce 4s ease-in-out infinite; }
        @keyframes blurCycle { 0% { opacity: 0; transform: scale(0.9) translateY(5px); filter: blur(8px); } 20% { opacity: 1; transform: scale(1) translateY(0); filter: blur(0px); } 80% { opacity: 1; transform: scale(1) translateY(0); filter: blur(0px); } 100% { opacity: 0; transform: scale(1.1) translateY(-5px); filter: blur(8px); } }
        .animate-blur-cycle { animation: blurCycle 5s ease-in-out infinite; }
        @keyframes scrollText { 0% { transform: translateY(0); } 10% { transform: translateY(120%); } 12% { transform: translateY(120%); } 13% { transform: translateY(-120%); } 15% { transform: translateY(-120%); } 40% { transform: translateY(0); } 100% { transform: translateY(0); } }
        .animate-scroll-text { animation: scrollText 5s ease-in-out infinite; }
      `}</style>
      <main className="main" ref={heroRef}>
        <div className="hero-typography">
          <div className="hero-row hero-row-top">
            <div className="hero-header-left"><PixelFlower className="logo-icon" /><span className="logo-text">集市 AGORA</span></div>
            <Clock />
            <div className="hero-header-right">
              <a href="#about" className="header-link">[关于]</a>
              <a href="#features" className="header-link">[功能]</a>
            </div>
          </div>
          <div className="hero-row hero-row-1">
            <span className="hero-word animate-flicker">您好 我们是</span>
            <AthensAcademy className="hero-icon-tight" />
            <div className="hero-brand-motion">
              {[{ l: "A", c: "#d4b87a" }, { l: "G", c: "#a84c32" }, { l: "O", c: "#6b7a5a" }, { l: "R", c: "#8c4a32" }, { l: "A", c: "#a88a5c" }].map((item, i) => (
                <span key={i} className="hero-word-large" style={{ animation: `colorCycle 3s infinite ${i * 0.15}s ease-in-out`, "--cycle-color": item.c } as React.CSSProperties}>{item.l}</span>
              ))}
            </div>
          </div>
          <div className="hero-row hero-row-2">
            <span className="hero-word animate-gentle-bounce">思想的</span>
            <PixelFlower className="hero-icon-tight" />
            <div style={{ position: "relative", width: "125px", height: "1.2em", display: "flex", alignItems: "center", justifyContent: "center", marginLeft: "1.25rem" }}>
              <span className="hero-word animate-blur-cycle">缪斯园地</span>
            </div>
            <FlippingBook className="hero-icon-tight" />
          </div>
          <div className="hero-row hero-row-3">
            <div className="hero-word-large" style={{ overflow: "hidden", height: "1.1em", position: "relative" }}>
              <div className="animate-scroll-text"><div style={{ height: "1.1em" }}>新人文</div></div>
            </div>
            <span className="hero-word">的解放</span>
            <Megaphone className="hero-icon-tight" />
          </div>
          <div className="hero-row hero-row-4">
            <PixelLightbulb className="hero-icon-tight pulse-subtle" />
            <span className="hero-word">交流与求知的乐土</span>
          </div>
        </div>
        <div className="cta-section">
          <Link href="/books" className="cta-button">
            <span className="cta-text">进入书库</span>
            <PixelArrowRight className="cta-icon" />
          </Link>
          <button type="button" className="cta-button outline btn-apple" onClick={() => setModalOpen(true)}>
            <span className="cta-text">发送问候 / 提交个人申请</span>
            <PixelArrowRight className="cta-icon" />
          </button>
        </div>
      </main>
      <EmailModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
