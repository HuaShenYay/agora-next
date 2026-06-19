// ====================
// ReaderToolbar — sticky 顶部工具条
// 返回 / 书名 / 作者 / 字号 A- A+ / 主题切换 / 进度百分比
// ====================

"use client";

import Link from "next/link";

export type ReaderTheme = "light" | "sepia" | "dark";
export type FontSize = 14 | 16 | 18 | 20 | 22;

const SIZES: FontSize[] = [14, 16, 18, 20, 22];
const THEMES: { key: ReaderTheme; label: string; mark: string }[] = [
  { key: "light", label: "LIGHT", mark: "☀" },
  { key: "sepia", label: "SEPIA", mark: "✦" },
  { key: "dark", label: "DARK", mark: "☾" },
];

interface Props {
  bookId: string;
  title: string;
  author: string;
  fontSize: FontSize;
  onFontSize: (s: FontSize) => void;
  theme: ReaderTheme;
  onTheme: (t: ReaderTheme) => void;
  progress: number; // 0-100
}

export default function ReaderToolbar({
  bookId,
  title,
  author,
  fontSize,
  onFontSize,
  theme,
  onTheme,
  progress,
}: Props) {
  const idx = SIZES.indexOf(fontSize);
  const canSmaller = idx > 0;
  const canLarger = idx < SIZES.length - 1;

  return (
    <div className="reader-toolbar" role="banner">
      <div className="reader-toolbar-row">
        <Link
          href={`/books/${bookId}`}
          className="reader-back"
          aria-label="返回详情"
        >
          ← <span className="reader-back-text">BACK</span>
        </Link>

        <div className="reader-meta">
          <h1 className="reader-title">{title}</h1>
          <span className="reader-author">{author}</span>
        </div>

        <div className="reader-tools">
          {/* 字号 */}
          <div className="reader-font" role="group" aria-label="字号">
            <button
              className="reader-icon-btn"
              onClick={() => canSmaller && onFontSize(SIZES[idx - 1]!)}
              disabled={!canSmaller}
              aria-label="缩小字号"
              type="button"
            >
              A−
            </button>
            <span className="reader-font-value">{fontSize}px</span>
            <button
              className="reader-icon-btn"
              onClick={() => canLarger && onFontSize(SIZES[idx + 1]!)}
              disabled={!canLarger}
              aria-label="放大字号"
              type="button"
            >
              A+
            </button>
          </div>

          {/* 主题 */}
          <div className="reader-themes" role="group" aria-label="主题">
            {THEMES.map((t) => (
              <button
                key={t.key}
                onClick={() => onTheme(t.key)}
                className={`reader-theme-btn ${
                  theme === t.key ? "is-active" : ""
                }`}
                type="button"
                aria-pressed={theme === t.key}
                title={t.label}
              >
                <span className="reader-theme-mark">{t.mark}</span>
                <span className="reader-theme-label">{t.label}</span>
              </button>
            ))}
          </div>

          {/* 进度 */}
          <div className="reader-progress-pct" aria-live="polite">
            <span className="reader-progress-no">
              {String(Math.round(progress)).padStart(2, "0")}
            </span>
            <span className="reader-progress-pct-mark">%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
