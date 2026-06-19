import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "集市 Agora | 开源 AI 重译经典计划",
    template: "%s | 集市 Agora",
  },
  description:
    "用 AI 重译经典书籍，让强译本取代晦涩旧译，然后免费开源。任何人都能 Fork、修改、提交更好的翻译。",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName: "集市 Agora",
    title: "集市 Agora | 开源 AI 重译经典计划",
    description: "用 AI 重译经典，让强译本取代晦涩旧译，然后免费开源。",
  },
  twitter: {
    card: "summary_large_image",
    title: "集市 Agora | 开源 AI 重译经典计划",
    description: "用 AI 重译经典，让强译本取代晦涩旧译，然后免费开源。",
  },
  robots: {
    index: true,
    follow: true,
  },
  keywords: ["开源翻译", "AI重译", "经典书籍", "公共知识库", "协作翻译"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <link
          rel="preload"
          as="font"
          type="font/truetype"
          href="/fonts/ChillBitmap_16px.ttf"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          as="font"
          type="font/truetype"
          href="/fonts/ChillBitmap_7px.ttf"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        {/* Skip link for keyboard/screen reader users */}
        <a
          href="#main-content"
          className="skip-link"
        >
          跳到主要内容
        </a>

        {/* 马赛克溶解载入动画（仅首页使用） */}
        <div id="mosaic-loader" className="mosaic-loader" aria-hidden="true">
          <div className="mosaic-grid" id="mosaic-grid"></div>
        </div>

        {children}

        <Script src="/effects.js" strategy="lazyOnload" />
        <Script src="/loader.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
