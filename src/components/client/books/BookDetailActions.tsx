// ====================
// BookDetailActions — 详情页右侧操作面板
// 阅读 / 复制链接 / 分类标签 / 标签云
// ====================

"use client";

import Link from "next/link";
import { useState } from "react";
import type { Book } from "@/lib/utils/types";
import { DEFAULT_CATEGORIES, SUB_CATEGORY_MAP, LANGUAGES } from "@/lib/utils/constants";

interface Props {
  book: Book;
  canRead: boolean;
}

export default function BookDetailActions({ book, canRead }: Props) {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // 老浏览器或非安全上下文：降级
      const ta = document.createElement("textarea");
      ta.value = window.location.href;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  const languageName = (LANGUAGES as Record<string, string>)[book.language] ?? book.language;
  const categoryNames = book.categories.map((id) => SUB_CATEGORY_MAP[id]?.name ?? id).filter(Boolean);
  // 获取顶级分类 emoji
  const topCategoryEmoji = (catId: string) => {
    const sub = SUB_CATEGORY_MAP[catId];
    if (!sub) return "";
    const top = DEFAULT_CATEGORIES.find((c) => c.id === sub.parent);
    return top?.emoji ?? "";
  };

  return (
    <aside className="bd-actions" aria-label="操作与元数据">
      {/* —— 主操作 —— */}
      <div className="bd-actions-primary">
        {canRead ? (
          <Link
            href={`/books/${book.id}/read`}
            className="bd-btn bd-btn--primary"
          >
            <span className="bd-btn-icon" aria-hidden>▶</span>
            开始阅读
          </Link>
        ) : (
          <div className="bd-btn bd-btn--disabled">
            <span className="bd-btn-icon" aria-hidden>✕</span>
            内容未提取
          </div>
        )}
        <Link href="/books" className="bd-btn bd-btn--outline">
          <span className="bd-btn-icon" aria-hidden>←</span>
          返回书库
        </Link>
      </div>

      {/* —— 元数据表 —— */}
      <div className="bd-actions-card">
        <div className="bd-actions-card-head">元数据</div>
        <dl className="bd-actions-list">
          <div className="bd-actions-row">
            <dt>作者</dt>
            <dd>{book.author}</dd>
          </div>
          <div className="bd-actions-row">
            <dt>语言</dt>
            <dd>{languageName}</dd>
          </div>
          <div className="bd-actions-row">
            <dt>上传日期</dt>
            <dd>{new Date(book.createdAt).toISOString().slice(0, 10)}</dd>
          </div>
          <div className="bd-actions-row">
            <dt>更新日期</dt>
            <dd>{new Date(book.updatedAt).toISOString().slice(0, 10)}</dd>
          </div>
        </dl>
      </div>

      {/* —— 分类与标签 —— */}
      {categoryNames.length > 0 && (
        <div className="bd-actions-card">
          <div className="bd-actions-card-head">分类</div>
          <div className="bd-actions-tags">
            {categoryNames.map((name, i) => {
              const emoji = topCategoryEmoji(book.categories[i] ?? "");
              return (
                <span key={name} className="bd-tag">
                  {emoji && <em className="bd-tag-emoji">{emoji}</em>}
                  {name}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {book.tags.length > 0 && (
        <div className="bd-actions-card">
          <div className="bd-actions-card-head">标签</div>
          <div className="bd-actions-tags">
            {book.tags.map((t) => (
              <span key={t} className="bd-tag bd-tag--hash">#{t}</span>
            ))}
          </div>
        </div>
      )}

      {/* —— 分享 —— */}
      <button onClick={copyLink} className="bd-copy-link" type="button">
        <span aria-hidden>⎘</span>
        {copied ? "已复制 ✓" : "复制链接"}
      </button>
    </aside>
  );
}
