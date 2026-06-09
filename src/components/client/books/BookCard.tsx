"use client";
import type { BookSummary } from "@/lib/utils/types";
import { DEFAULT_CATEGORIES, LANGUAGES } from "@/lib/utils/constants";

const categoryMap = Object.fromEntries(DEFAULT_CATEGORIES.map((c) => [c.id, c.name]));

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
  const categoryNames = book.categories.map((id) => categoryMap[id] ?? id).filter(Boolean);
  const languageName = (LANGUAGES as Record<string, string>)[book.language] ?? book.language;
  const indexLabel = String(index).padStart(3, "0");
  const year = book.createdAt ? new Date(book.createdAt).getFullYear() : "—";

  return (
    <li className="lib-card">
      <a href={`/books/${book.id}`} className="lib-card-link">
        <div className="lib-card-index">{indexLabel}</div>
        <div className="lib-card-body">
          <h3 className="lib-card-title">{book.title}</h3>
          {book.titleOriginal !== book.title && (
            <p className="lib-card-original">{book.titleOriginal}</p>
          )}
          <p className="lib-card-author">{book.author}</p>
        </div>
        <dl className="lib-card-meta">
          <div className="lib-card-meta-row">
            <dt>LANG</dt>
            <dd>{languageName}</dd>
          </div>
          <div className="lib-card-meta-row">
            <dt>FORMAT</dt>
            <dd>{FORMAT_LABEL[book.format] ?? book.format.toUpperCase()}</dd>
          </div>
          <div className="lib-card-meta-row">
            <dt>YEAR</dt>
            <dd>{year}</dd>
          </div>
        </dl>
        {categoryNames.length > 0 && (
          <div className="lib-card-tags">
            {categoryNames.slice(0, 2).map((name) => (
              <span key={name} className="lib-card-tag">{name}</span>
            ))}
          </div>
        )}
        <span className="lib-card-arrow" aria-hidden>→</span>
      </a>
    </li>
  );
}
