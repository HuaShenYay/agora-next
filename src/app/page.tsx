import Link from "next/link";
import Hero from "@/components/client/Hero";
import ScholarTestimonials from "@/components/client/ScholarTestimonials";
import AnimatedSection from "@/components/client/AnimatedSection";
import PhilosophyNarrative from "@/components/client/PhilosophyNarrative";

const PixelLightbulb = ({ className = "" }: { className?: string }) => (
  <svg className={className} width="36" height="36" viewBox="0 0 10 12" fill="currentColor">
    <rect x="3" y="0" width="4" height="1" /><rect x="2" y="1" width="6" height="1" />
    <rect x="1" y="2" width="8" height="3" /><rect x="2" y="5" width="6" height="1" />
    <rect x="3" y="6" width="4" height="1" /><rect x="3" y="7" width="4" height="1" />
    <rect x="4" y="8" width="2" height="2" /><rect x="3" y="10" width="4" height="2" />
  </svg>
);

export default function Home() {
  return (
    <div className="page">
      <Hero />
      <PhilosophyNarrative />
      <section className="features-showcase" id="features">
        <AnimatedSection animation="blur-in" className="showcase-header" spring>
          <h2 className="showcase-title">核心场域</h2>
          <p className="showcase-subtitle">从沉思到对话，从孤岛到群落</p>
        </AnimatedSection>
        <AnimatedSection animation="fade-up" className="feature-illustrated" spring>
          <div className="feature-illu-image img-hover-zoom"><img src="/images/abstract_scholar_community_1770135636103.png" alt="学苑社区" /></div>
          <div className="feature-illu-content"><span className="status-badge">自然生长</span><h3>学苑社区</h3><p>去中心化的，自由的，发表个人学术见解和对经典文本的解读。0算法干扰，在这里，每个人都是思想的贡献者且没有等级制度区分。</p><div className="feature-tags"><span className="feature-tag">文本笔记</span><span className="feature-tag">论坛互动</span></div></div>
        </AnimatedSection>
        <AnimatedSection animation="flip" delay={2} className="feature-illustrated" spring>
          <div className="feature-illu-image img-hover-zoom"><img src="/images/immersive_reading_1770135231682.png" alt="沉浸阅读" /></div>
          <div className="feature-illu-content"><span className="status-badge">绝对聚焦</span><h3>沉浸阅读</h3><p>极简的界面、排版布局经过神经科学优化，ADHD友好，为您提供长篇文本的马拉松式阅读体验。让阅读再次成为一种庄重的入定仪式。</p><div className="feature-tags"><span className="feature-tag">卷轴模式</span><span className="feature-tag">无干扰设计</span><span className="feature-tag">专注美学</span></div></div>
        </AnimatedSection>
        <AnimatedSection animation="elastic" delay={1} className="feature-illustrated reverse" spring>
          <div className="feature-illu-content"><span className="status-badge">核心功能</span><h3>思想花园</h3><p>在这里，您阅读的文本中的互动，ai会自然而然帮您建立语义双链＋双向图谱。因此，您可以轻松的在社区发表文章时引用原文自然段，同时您的文章在被引用时，也会呈现谱系。思想花园能让您的想法如植物般自然连接与生长。</p><div className="feature-tags"><span className="feature-tag">原子笔记</span><span className="feature-tag">语义联想</span><span className="feature-tag">图谱可视化</span></div></div>
          <div className="feature-illu-image img-hover-zoom"><img src="/images/abstract_thought_garden_1770135653032.png" alt="思想花园" /></div>
        </AnimatedSection>
      </section>
      <ScholarTestimonials />
      <AnimatedSection animation="fade-up" delay={1}>
        <section className="platform-cta" id="platform">
          <h2 className="platform-cta-title">学术经典翻译协作平台</h2>
          <p className="platform-cta-desc">开源、协作、AI 驱动。上传书籍，自动归类，社区协作翻译。</p>
          <div className="platform-cta-actions"><Link href="/books" className="cta-button"><span className="cta-text">进入书库</span></Link><Link href="/books/upload" className="cta-button outline"><span className="cta-text">上传书籍</span></Link></div>
        </section>
      </AnimatedSection>
      <AnimatedSection animation="fade-up" delay={1}>
        <footer className="footer">
          <div className="footer-content">
            <div className="footer-col"><h4 className="footer-label">[工作室]</h4><p>Monji 映画</p><p>中国</p></div>
            <div className="footer-col"><h4 className="footer-label">[邮箱]</h4><a href="mailto:bigdickgod@icloud.com" className="footer-link link-animated">bigdickgod@icloud.com</a></div>
            <div className="footer-col center"><PixelLightbulb className="footer-icon pulse-subtle" /><span className="footer-initiate">启程</span></div>
            <div className="footer-col"><h4 className="footer-label">[连接]</h4><a href="https://space.bilibili.com/3546814865213878" className="footer-link link-animated">哔哩哔哩</a><a href="https://www.douyin.com/user/MS4wLjABAAAA_-Bxp3KGZqXg1k6RsbWb3c5uwPDMHmomY-UXbtidf0cpmMix0l_GXzP_ezMkz6NE?from_tab_name=main" className="footer-link link-animated">抖音</a></div>
          </div>
          <div className="footer-bottom"><span className="footer-logo">集市 AGORA</span><span className="footer-copy">© 2026 Monji. All Rights Reserved.</span></div>
        </footer>
      </AnimatedSection>
    </div>
  );
}
