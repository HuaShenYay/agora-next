import Link from "next/link";
import Hero from "@/components/client/Hero";
import ScholarTestimonials from "@/components/client/ScholarTestimonials";
import AnimatedSection from "@/components/client/AnimatedSection";
import PhilosophyNarrative from "@/components/client/PhilosophyNarrative";

// 联系邮箱（来自环境变量；未配置则页脚不渲染邮箱区块）
const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

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
          <h2 className="showcase-title">开源计划</h2>
          <p className="showcase-subtitle">用 AI 重译经典，让强译本取代晦涩旧译，然后免费开源</p>
        </AnimatedSection>
        <AnimatedSection animation="fade-up" className="feature-illustrated" spring>
          <div className="feature-illu-image img-hover-zoom"><img src="/images/abstract_scholar_community_1770135636103.png" alt="上传原典" /></div>
          <div className="feature-illu-content"><span className="status-badge">第一步</span><h3>上传原典</h3><p>上传 PDF、EPUB、TXT 格式的经典原著或现有译本。系统内置 AI 文字提取引擎，自动将文档转化为可编辑的 Markdown 文本，作为重译的起点。</p><div className="feature-tags"><span className="feature-tag">PDF提取</span><span className="feature-tag">EPUB解析</span><span className="feature-tag">自动排版</span></div></div>
        </AnimatedSection>
        <AnimatedSection animation="flip" delay={2} className="feature-illustrated" spring>
          <div className="feature-illu-image img-hover-zoom"><img src="/images/immersive_reading_1770135231682.png" alt="AI 重译" /></div>
          <div className="feature-illu-content"><span className="status-badge">第二步</span><h3>AI 重译</h3><p>借助 AI 对原文进行重新翻译和润色，超越晦涩难懂的学术旧译。不是机器的粗糙直译，而是忠于原意、可读、流畅的强译本。每一次重译都是对经典的一次新理解。</p><div className="feature-tags"><span className="feature-tag">AI 翻译</span><span className="feature-tag">超越旧译</span><span className="feature-tag">可读性强</span></div></div>
        </AnimatedSection>
        <AnimatedSection animation="elastic" delay={1} className="feature-illustrated reverse" spring>
          <div className="feature-illu-content"><span className="status-badge">愿景</span><h3>免费开源</h3><p>每一个强译本都将免费开源。任何人都可以 Fork 一本译本，提出翻译修改意见，提交 PR。就像 GitHub 上的代码协作一样——人人参与，人人改进，译本在社区的打磨中越来越好。</p><div className="feature-tags"><span className="feature-tag">Fork & PR</span><span className="feature-tag">社区协作</span><span className="feature-tag">知识平权</span></div></div>
          <div className="feature-illu-image img-hover-zoom"><img src="/images/abstract_thought_garden_1770135653032.png" alt="免费开源" /></div>
        </AnimatedSection>
      </section>
      <ScholarTestimonials />
      <AnimatedSection animation="fade-up" delay={1}>
        <section className="platform-cta" id="platform">
          <h2 className="platform-cta-title">加入开源重译计划</h2>
          <p className="platform-cta-desc">上传一本经典，用 AI 重译它，然后把强译本免费开源。</p>
          <div className="platform-cta-actions"><Link href="/books" className="cta-button"><span className="cta-text">进入书库</span></Link></div>
        </section>
      </AnimatedSection>
      <AnimatedSection animation="fade-up" delay={1}>
        <footer className="footer">
          <div className="footer-content">
            <div className="footer-col"><h4 className="footer-label">[工作室]</h4><p>Monji 映画</p><p>中国</p></div>
            {CONTACT_EMAIL ? (
              <div className="footer-col"><h4 className="footer-label">[邮箱]</h4><a href={`mailto:${CONTACT_EMAIL}`} className="footer-link link-animated">{CONTACT_EMAIL}</a></div>
            ) : null}
            <div className="footer-col center"><PixelLightbulb className="footer-icon pulse-subtle" /><span className="footer-initiate">启程</span></div>
            <div className="footer-col"><h4 className="footer-label">[连接]</h4><a href="https://space.bilibili.com/3546814865213878" className="footer-link link-animated">哔哩哔哩</a><a href="https://www.douyin.com/user/MS4wLjABAAAA_-Bxp3KGZqXg1k6RsbWb3c5uwPDMHmomY-UXbtidf0cpmMix0l_GXzP_ezMkz6NE?from_tab_name=main" className="footer-link link-animated">抖音</a></div>
          </div>
          <div className="footer-bottom"><span className="footer-logo">集市 AGORA</span><span className="footer-copy">© 2026 Monji. All Rights Reserved.</span></div>
        </footer>
      </AnimatedSection>
    </div>
  );
}
