"use client";
import type { BookSummary } from "@/lib/utils/types";
import { DEFAULT_CATEGORIES, FLAT_CATEGORY_MAP, SUB_CATEGORY_MAP, LANGUAGES } from "@/lib/utils/constants";

const FORMAT_LABEL: Record<string, string> = {
  pdf: "PDF",
  epub: "EPUB",
  txt: "TXT",
  markdown: "MD",
};

function parentGroupOf(catId: string): string | null {
  const sub = SUB_CATEGORY_MAP[catId];
  return sub ? sub.parent : catId;
}

interface Props {
  book: BookSummary;
  index: number;
}

export default function BookCard({ book, index }: Props) {
  const categoryNames = book.categories
    .map((id) => FLAT_CATEGORY_MAP[id] ?? id)
    .filter(Boolean);
  const languageName = (LANGUAGES as Record<string, string>)[book.language] ?? book.language;
  const indexLabel = String(index).padStart(3, "0");

  const primaryGroup = book.categories.map(parentGroupOf).find(Boolean) ?? "";
  const primaryGroupName = DEFAULT_CATEGORIES.find((c) => c.id === primaryGroup)?.name ?? "";

  return (
    <li
      className="lib-card"
      data-cat={primaryGroup || undefined}
      style={{ animationDelay: `${((index - 1) % 20) * 40}ms` }}
    >
      <a href={`/books/${book.id}`} className="lib-card-link">
        {/* 左侧学科色书脊 */}
        <span className="lib-card-spine" aria-hidden>
          <span className="lib-card-spine-grain" aria-hidden />
        </span>

        {/* 钢印编号 */}
        <span className="lib-card-stamp" aria-hidden>
          <span className="lib-card-stamp-hash">№</span>
          {indexLabel}
        </span>

        {/* 主体 */}
        <div className="lib-card-body">
          {primaryGroupName && <span className="lib-card-dept">{primaryGroupName}</span>}
          <h3 className="lib-card-title">{book.title}</h3>
          {book.titleOriginal !== book.title && (
            <p className="lib-card-original">{book.titleOriginal}</p>
          )}
          <p className="lib-card-author">— {book.author}</p>
        </div>

        {/* 底部元数据 */}
        <footer className="lib-card-footer">
          {categoryNames.length > 0 && (
            <div className="lib-card-tags">
              {categoryNames.slice(0, 2).map((name) => (
                <span key={name} className="lib-card-tag">{name}</span>
              ))}
            </div>
          )}
          <div className="lib-card-meta">
            <span>{FORMAT_LABEL[book.format] ?? book.format.toUpperCase()}</span>
            <span className="lib-card-meta-dot" aria-hidden>·</span>
            <span>{languageName}</span>
            {book.chapterCount > 0 && (
              <>
                <span className="lib-card-meta-dot" aria-hidden>·</span>
                <span>{book.chapterCount}章</span>
              </>
            )}
          </div>
        </footer>

        {/* 悬停箭头 */}
        <span className="lib-card-arrow" aria-hidden>→</span>
      </a>
    </li>
  );
}
