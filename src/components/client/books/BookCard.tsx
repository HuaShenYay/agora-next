"use client";
import type { BookSummary } from "@/lib/utils/types";
import { DEFAULT_CATEGORIES, LANGUAGES } from "@/lib/utils/constants";

const categoryMap = Object.fromEntries(DEFAULT_CATEGORIES.map((c) => [c.id, c.name]));

export default function BookCard({ book }: { book: BookSummary }) {
  const categoryNames = book.categories.map((id) => categoryMap[id] ?? id).filter(Boolean);
  const languageName = LANGUAGES[book.language as keyof typeof LANGUAGES] ?? book.language;
  const statusLabels: Record<string, string> = { pending: "分类中...", processing: "AI分析中", done: "已分类", failed: "分类失败" };
  return (
    <a href={`/books/${book.id}`} className="book-card">
      <div className="book-card-header"><h3 className="book-card-title">{book.title}</h3>{book.titleOriginal !== book.title && <span className="book-card-original">{book.titleOriginal}</span>}</div>
      <div className="book-card-meta"><span className="book-card-author">{book.author}</span><span className="book-card-lang">{languageName}</span></div>
      {categoryNames.length > 0 && <div className="book-card-categories">{categoryNames.map((name) => <span key={name} className="book-card-tag">{name}</span>)}</div>}
      {book.tags.length > 0 && <div className="book-card-tags">{book.tags.slice(0, 3).map((tag) => <span key={tag} className="book-card-subtag">#{tag}</span>)}</div>}
      <div className="book-card-footer">
        <span className="book-card-chapters">{book.chapterCount} 章</span>
        {book.forkCount > 0 && <span className="book-card-forks">{book.forkCount} 次 Fork</span>}
        <span className={`book-card-status status-${book.classificationStatus}`}>{statusLabels[book.classificationStatus] ?? ""}</span>
      </div>
      {book.aiClassification?.summary && <p className="book-card-summary">{book.aiClassification.summary}</p>}
    </a>
  );
}
