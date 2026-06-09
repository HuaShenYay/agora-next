import type { Metadata } from "next";
import Script from "next/script";
import NavBar from "@/components/client/shared/NavBar";
import "./globals.css";

export const metadata: Metadata = {
  title: "集市 Agora | 学术翻译协作平台",
  description: "集市 Agora - 开源学术经典书籍翻译协作平台",
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
        <NavBar />

        {/* 马赛克溶解载入动画（仅首页使用） */}
        <div id="mosaic-loader" className="mosaic-loader">
          <div className="mosaic-grid" id="mosaic-grid"></div>
        </div>

        {children}

        <Script src="/font-loader.js" strategy="beforeInteractive" />
        <Script src="/effects.js" strategy="lazyOnload" />
        <Script src="/loader.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
