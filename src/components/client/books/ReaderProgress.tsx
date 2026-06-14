// ====================
// ReaderProgress — 顶部 fixed 进度条
// 根据 scrollTop / scrollHeight 计算百分比
// ====================

"use client";

import { useEffect, useState } from "react";

export default function ReaderProgress() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      const doc = document.documentElement;
      const scrollTop = window.scrollY || doc.scrollTop;
      const max = (doc.scrollHeight - window.innerHeight) || 1;
      setPct(Math.min(100, Math.max(0, (scrollTop / max) * 100)));
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        update();
      });
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="reader-progress" aria-hidden>
      <div
        className="reader-progress-bar"
        style={{ transform: `scaleX(${pct / 100})` }}
      />
    </div>
  );
}
