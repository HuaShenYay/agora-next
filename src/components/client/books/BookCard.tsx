"use client";
import type { BookSummary } from "@/lib/utils/types";
import { FLAT_CATEGORY_MAP, LANGUAGES } from "@/lib/utils/constants";

const FORMAT_LABEL: Record<string, string> = {
  pdf: "PDF",
  epub: "EPUB",
  txt: "TXT",
  markdown: "MD",
};

interface Props {
  book: BookSummary;
  index: number;
  PixelBookIcon: React.ComponentType<{ className?: string }>;
}

export default function BookCard({ book, index, PixelBookIcon }: Props) {
  const categoryNames = book.categories
    .map((id) => FLAT_CATEGORY_MAP[id] ?? id)
    .filter(Boolean);
  const languageName = (LANGUAGES as Record<string, string>)[book.language] ?? book.language;
  const indexLabel = String(index).padStart(3, "0");

  return (
    <li
      className="lib-card-h"
      style={{ animationDelay: `${((index - 1) % 20) * 40}ms` }}
    >
      <a href={`/books/${book.id}`} className="lib-card-h-link">
        {/* 左侧像素书图标 */}
        <div className="lib-card-h-icon">
          <PixelBookIcon className="lib-card-h-pixel-book" />
          <span className="lib-card-h-index">No {indexLabel}</span>
        </div>

        {/* 右侧内容 */}
        <div className="lib-card-h-content">
          <h3 className="lib-card-h-title">
            {book.title}
          </h3>
          {book.description && (
            <p className="lib-card-h-desc">{book.shortDescription || book.description}</p>
          )}
          <div className="lib-card-h-tags">
            {categoryNames.slice(0, 2).map((name) => (
              <span key={name} className="lib-card-h-tag">{name}</span>
            ))}
            <span className="lib-card-h-tag lib-card-h-tag--accent">
              {FORMAT_LABEL[book.format] ?? book.format.toUpperCase()}
            </span>
            <span className="lib-card-h-tag">{languageName}</span>
          </div>
        </div>
      </a>
    </li>
  );
}
