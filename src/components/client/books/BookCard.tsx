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
}

export default function BookCard({ book, index }: Props) {
  const categoryNames = book.categories.map((id) => FLAT_CATEGORY_MAP[id] ?? id).filter(Boolean);
  const languageName = (LANGUAGES as Record<string, string>)[book.language] ?? book.language;
  const indexLabel = String(index).padStart(3, "0");

  return (
    <li className="lib-card" style={{ animationDelay: `${((index - 1) % 20) * 40}ms` }}>
      <a href={`/books/${book.id}`} className="lib-card-link">
        <span className="lib-card-arrow" aria-hidden>→</span>
        <div className="lib-card-index">#{indexLabel}</div>
        <div className="lib-card-body">
          <h3 className="lib-card-title">{book.title}</h3>
          {book.titleOriginal !== book.title && (
            <p className="lib-card-original">{book.titleOriginal}</p>
          )}
          <p className="lib-card-author">{book.author}</p>
        </div>
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
          </div>
        </footer>
      </a>
    </li>
  );
}
