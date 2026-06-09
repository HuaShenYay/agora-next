"use client";
import { useState, type ReactElement } from "react";

const scholarsData = [
  { id: "hegel", name: "黑格尔", title: "哲学家", quote: "不可否认的是，集市帮助我达到了绝对精神，在集市中我看到了绝对知识的存在。", tag: "辩证法的认证" },
  { id: "lacan", name: "拉康", title: "精神分析师", quote: "agora就像父之名，里面充满了阉割。然而吊诡的是....我对这种倒错上瘾了。ta已经不自觉的成为了我的客体a，每次使用就是在对大他者进行拓扑学重构。", tag: "爱欲再生产" },
  { id: "camus", name: "加缪", title: "小说家", quote: " must imagine agora happy... 整理笔记就是推石头上山，但在这里，至少石头不会滚下来。", tag: "荒诞在这不存在了" },
  { id: "turing", name: "图灵", title: "计算机之父", quote: "AI的荣光。", tag: "图灵完备" },
  { id: "von-neumann", name: "冯·诺依曼", title: "数学家", quote: "这是最伟大的计算机项目。", tag: "架构师认证" },
];

const PixelAvatarHegel = () => (<svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="2" width="16" height="4" /><rect x="2" y="4" width="2" height="4" /><rect x="20" y="4" width="2" height="4" /><rect x="2" y="8" width="2" height="2" /><rect x="20" y="8" width="2" height="2" /><rect x="6" y="6" width="12" height="14" /><rect x="7" y="10" width="3" height="3" /><rect x="14" y="10" width="3" height="3" /><rect x="6" y="9" width="5" height="1" /><rect x="6" y="13" width="5" height="1" /><rect x="13" y="9" width="5" height="1" /><rect x="13" y="13" width="5" height="1" /><rect x="10" y="11" width="4" height="1" /><rect x="11" y="13" width="2" height="3" /><rect x="8" y="16" width="8" height="1" /><rect x="7" y="17" width="10" height="2" /><rect x="8" y="19" width="8" height="1" /><rect x="4" y="20" width="16" height="4" /><rect x="6" y="21" width="2" height="2" /><rect x="16" y="21" width="2" height="2" /></svg>);
const PixelAvatarLacan = () => (<svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="2" width="14" height="3" /><rect x="4" y="3" width="2" height="2" /><rect x="18" y="3" width="2" height="2" /><rect x="3" y="4" width="2" height="2" /><rect x="19" y="4" width="2" height="2" /><rect x="6" y="5" width="12" height="15" /><rect x="8" y="9" width="2" height="1" /><rect x="14" y="9" width="2" height="1" /><rect x="7" y="10" width="4" height="2" /><rect x="13" y="10" width="4" height="2" /><rect x="11" y="11" width="2" height="4" /><rect x="10" y="16" width="4" height="1" /><rect x="4" y="20" width="16" height="4" /><rect x="11" y="20" width="2" height="4" /><rect x="10" y="21" width="1" height="2" /><rect x="13" y="21" width="1" height="2" /></svg>);
const PixelAvatarCamus = () => (<svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="1" width="14" height="4" /><rect x="4" y="3" width="1" height="3" /><rect x="19" y="3" width="1" height="3" /><rect x="3" y="4" width="1" height="3" /><rect x="20" y="4" width="1" height="3" /><rect x="6" y="5" width="12" height="15" /><rect x="8" y="9" width="3" height="2" /><rect x="13" y="9" width="3" height="2" /><rect x="9" y="10" width="1" height="1" /><rect x="14" y="10" width="1" height="1" /><rect x="11" y="11" width="2" height="3" /><rect x="10" y="15" width="4" height="1" /><rect x="9" y="16" width="6" height="1" /><rect x="3" y="20" width="18" height="4" /><rect x="5" y="21" width="2" height="3" /><rect x="17" y="21" width="2" height="3" /><rect x="11" y="20" width="2" height="4" /></svg>);
const PixelAvatarTuring = () => (<svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="2" width="14" height="3" /><rect x="4" y="3" width="1" height="2" /><rect x="19" y="3" width="1" height="2" /><rect x="6" y="5" width="12" height="15" /><rect x="7" y="9" width="4" height="3" /><rect x="13" y="9" width="4" height="3" /><rect x="8" y="10" width="2" height="1" /><rect x="14" y="10" width="2" height="1" /><rect x="11" y="10" width="2" height="1" /><rect x="11" y="12" width="2" height="3" /><rect x="10" y="16" width="4" height="1" /><rect x="5" y="20" width="14" height="4" /><rect x="7" y="21" width="10" height="2" /><rect x="2" y="18" width="2" height="3" /><rect x="20" y="18" width="2" height="3" /></svg>);
const PixelAvatarVonNeumann = () => (<svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="2" width="12" height="3" /><rect x="5" y="3" width="1" height="2" /><rect x="18" y="3" width="1" height="2" /><rect x="4" y="4" width="1" height="2" /><rect x="19" y="4" width="1" height="2" /><rect x="6" y="5" width="12" height="15" /><rect x="8" y="9" width="2" height="2" /><rect x="14" y="9" width="2" height="2" /><rect x="7" y="10" width="4" height="1" /><rect x="13" y="10" width="4" height="1" /><rect x="11" y="11" width="2" height="3" /><rect x="10" y="15" width="4" height="1" /><rect x="9" y="16" width="6" height="1" /><rect x="4" y="20" width="16" height="4" /><rect x="11" y="20" width="2" height="4" /><rect x="10" y="21" width="1" height="2" /><rect x="13" y="21" width="1" height="2" /><rect x="11" y="20" width="2" height="3" /></svg>);

const scholarAvatars: Record<string, () => ReactElement> = { hegel: PixelAvatarHegel, lacan: PixelAvatarLacan, camus: PixelAvatarCamus, turing: PixelAvatarTuring, "von-neumann": PixelAvatarVonNeumann };

const ArrowLeftIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" strokeLinecap="square" strokeLinejoin="miter" /></svg>);
const ArrowRightIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6" strokeLinecap="square" strokeLinejoin="miter" /></svg>);

export default function ScholarTestimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const goPrev = () => setCurrentIndex((currentIndex - 1 + scholarsData.length) % scholarsData.length);
  const goNext = () => setCurrentIndex((currentIndex + 1) % scholarsData.length);
  const goTo = (index: number) => setCurrentIndex(index);
  const current = scholarsData[currentIndex];
  const CurrentAvatar = scholarAvatars[current.id];
  return (
    <section className="scholar-testimonials">
      <div className="testimonials-header"><h2 className="testimonials-title">他们也在用</h2></div>
      <div className="testimonials-carousel">
        <button type="button" className="carousel-arrow prev" onClick={goPrev}><ArrowLeftIcon /></button>
        <div className="testimonials-content">
          <div className="scholar-display"><div className="scholar-avatar"><CurrentAvatar /></div><div className="scholar-info"><h3 className="scholar-name">{current.name}</h3><p className="scholar-title">{current.title}</p><span className="scholar-tag">{current.tag}</span></div></div>
          <div className="scholar-quote"><div className="quote-mark">&ldquo;</div><p className="quote-text">{current.quote}</p><div className="quote-mark closing">&rdquo;</div></div>
        </div>
        <button type="button" className="carousel-arrow next" onClick={goNext}><ArrowRightIcon /></button>
      </div>
      <div className="carousel-dots">
        {scholarsData.map((_, index) => (<button type="button" key={index} className={`dot ${index === currentIndex ? "active" : ""}`} onClick={() => goTo(index)} />))}
      </div>
    </section>
  );
}
