// ====================
// BookReader — 完整阅读器
// 功能：toolbar / 三主题 / 字号 / TOC 侧栏 / 进度条 / 回到顶部 / 键盘快捷键
// ====================

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { marked } from "marked";
import ReaderToolbar, { type FontSize, type ReaderTheme } from "./ReaderToolbar";
import ReaderProgress from "./ReaderProgress";
import BookToc from "./BookToc";
import { extractChapters, injectHeadingIds, type Chapter } from "@/lib/utils/markdown";

interface Props {
  content: string;
  bookId: string;
  title: string;
  author: string;
}

const STORAGE_KEY = "agora:reader:prefs:v1";

interface PersistedPrefs {
  fontSize: FontSize;
  theme: ReaderTheme;
}

function loadPrefs(): PersistedPrefs {
  if (typeof window === "undefined") return { fontSize: 18, theme: "light" };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { fontSize: 18, theme: "light" };
    const p = JSON.parse(raw) as Partial<PersistedPrefs>;
    const fontSize = (p.fontSize ?? 18) as FontSize;
    const theme = (p.theme ?? "light") as ReaderTheme;
    return { fontSize, theme };
  } catch {
    return { fontSize: 18, theme: "light" };
  }
}

function savePrefs(p: PersistedPrefs) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    // ignore
  }
}

export default function BookReader({ content, bookId, title, author }: Props) {
  // 1. 解析章节
  const chapters: Chapter[] = useMemo(() => extractChapters(content), [content]);

  // 2. 注入 heading id 后渲染 HTML
  const html = useMemo(() => {
    try {
      const injected = injectHeadingIds(content, chapters);
      return marked.parse(injected, { breaks: true, gfm: true, async: false }) as string;
    } catch {
      return `<pre>${content}</pre>`;
    }
  }, [content, chapters]);

  // 3. 偏好（字号 + 主题）持久化
  const [fontSize, setFontSize] = useState<FontSize>(18);
  const [theme, setTheme] = useState<ReaderTheme>("light");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const p = loadPrefs();
    setFontSize(p.fontSize);
    setTheme(p.theme);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) savePrefs({ fontSize, theme });
  }, [fontSize, theme, hydrated]);

  // 4. 滚动进度
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      const doc = document.documentElement;
      const scrollTop = window.scrollY || doc.scrollTop;
      const max = doc.scrollHeight - window.innerHeight;
      const pct = max > 0 ? Math.min(100, Math.max(0, (scrollTop / max) * 100)) : 0;
      setProgress(pct);
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

  // 5. 当前激活章节（IntersectionObserver）
  const [activeId, setActiveId] = useState<string | null>(chapters[0]?.id ?? null);
  useEffect(() => {
    if (chapters.length === 0) return;
    const targets = chapters
      .map((c) => document.getElementById(c.id))
      .filter((el): el is HTMLElement => !!el);
    if (targets.length === 0) return;

    const visible = new Map<string, number>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          visible.set(entry.target.id, entry.intersectionRatio);
        });
        let bestId: string | null = null;
        let bestRatio = 0;
        visible.forEach((ratio, id) => {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestId = id;
          }
        });
        if (bestId) setActiveId(bestId);
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, [chapters]);

  // 6. 跳转章节
  const scrollToId = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 96; // 顶 toolbar 偏移
    window.scrollTo({ top: y, behavior: "smooth" });
  }, []);

  // 7. 回到顶部
  const toTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // 8. 键盘快捷键
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // 忽略在 input/textarea/contenteditable 中的按键
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) {
        return;
      }
      if (e.key === "+" || e.key === "=") {
        setFontSize((s) => Math.min(22, s + 2) as FontSize);
        e.preventDefault();
      } else if (e.key === "-" || e.key === "_") {
        setFontSize((s) => Math.max(14, s - 2) as FontSize);
        e.preventDefault();
      } else if (e.key === "t" || e.key === "T") {
        setTheme((th) => (th === "light" ? "sepia" : th === "sepia" ? "dark" : "light"));
      } else if (e.key === "g") {
        toTop();
      } else if (e.key === "G") {
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
      } else if (e.key === "ArrowDown" || e.key === "j") {
        window.scrollBy({ top: window.innerHeight * 0.85, behavior: "smooth" });
      } else if (e.key === "ArrowUp" || e.key === "k") {
        window.scrollBy({ top: -window.innerHeight * 0.85, behavior: "smooth" });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toTop]);

  // 9. 显示回到顶部（> 25% 滚动后）
  const showTop = progress > 8;

  const rootStyle = {
    ["--reader-font-size" as string]: `${fontSize}px`,
  } as React.CSSProperties;

  return (
    <div className={`reader reader-theme-${theme}`} style={rootStyle}>
      <ReaderProgress />
      <ReaderToolbar
        bookId={bookId}
        title={title}
        author={author}
        fontSize={fontSize}
        onFontSize={setFontSize}
        theme={theme}
        onTheme={setTheme}
        progress={progress}
      />

      <BookToc chapters={chapters} activeId={activeId} onJump={scrollToId} />

      <main className="reader-canvas">
        <article
          className="reader-text markdown-body"
          dangerouslySetInnerHTML={{ __html: html }}
        />
        <footer className="reader-end">
          <span className="reader-end-mark">■</span>
          <span className="reader-end-text">END OF TEXT</span>
        </footer>
      </main>

      {showTop && (
        <button
          onClick={toTop}
          className="reader-top"
          type="button"
          aria-label="回到顶部"
        >
          ↑
        </button>
      )}
    </div>
  );
}
