"use client";
import { useEffect, useState } from "react";
import type { BookSummary } from "@/lib/utils/types";
import { DEFAULT_CATEGORIES, FLAT_CATEGORY_MAP } from "@/lib/utils/constants";
import BookCard from "./BookCard";

/* 像素书图标 */
const PixelBook = ({ className = "" }: { className?: string }) => (
  <svg className={className} width="48" height="56" viewBox="0 0 12 14" fill="currentColor" aria-hidden>
    <rect x="0" y="1" width="2" height="12" opacity="0.7" />
    <rect x="2" y="0" width="9" height="1" />
    <rect x="2" y="0" width="1" height="14" opacity="0.3" />
    <rect x="10" y="0" width="1" height="14" />
    <rect x="2" y="13" width="9" height="1" />
    <rect x="3" y="2" width="7" height="1" opacity="0.15" />
    <rect x="3" y="4" width="5" height="1" opacity="0.12" />
    <rect x="3" y="6" width="6" height="1" opacity="0.15" />
    <rect x="3" y="8" width="4" height="1" opacity="0.12" />
  </svg>
);

/* 空书架 */
const EmptyShelf = ({ className = "" }: { className?: string }) => (
  <svg className={className} width="80" height="64" viewBox="0 0 20 16" fill="currentColor" aria-hidden>
    <rect x="1" y="1" width="18" height="1" /><rect x="1" y="1" width="1" height="14" />
    <rect x="18" y="1" width="1" height="14" /><rect x="1" y="7" width="18" height="1" />
    <rect x="1" y="11" width="18" height="1" /><rect x="1" y="15" width="18" height="1" />
    <rect x="3" y="4" width="1" height="3" /><rect x="5" y="3" width="1" height="4" opacity="0.6" />
    <rect x="13" y="9" width="1" height="2" opacity="0.6" />
  </svg>
);

/* 像素放大镜 */
const PixelSearch = ({ className = "" }: { className?: string }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 8 8" fill="currentColor" aria-hidden>
    <rect x="1" y="0" width="3" height="1" /><rect x="0" y="1" width="5" height="1" />
    <rect x="0" y="2" width="1" height="3" /><rect x="4" y="2" width="1" height="3" />
    <rect x="1" y="5" width="3" height="1" />
    <rect x="4" y="4" width="1" height="1" /><rect x="5" y="5" width="1" height="1" />
    <rect x="5" y="6" width="1" height="1" /><rect x="6" y="7" width="2" height="1" />
  </svg>
);

interface Props {
  categorySlug: string;
}

export default function BookCategoryView({ categorySlug }: Props) {
  const cat = DEFAULT_CATEGORIES.find((c) => c.id === categorySlug);
  const subCategories = cat?.children ?? [];
  const categoryName = cat?.name ?? categorySlug;

  const [books, setBooks] = useState<BookSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [subCategory, setSubCategory] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const load = async () => {
      try {
        const params = new URLSearchParams();
        if (subCategory) params.set("category", subCategory);
        else params.set("category", categorySlug);
        if (search) params.set("search", search);
        params.set("page", String(page));
        params.set("pageSize", "20");
        const res = await fetch(`/api/books?${params}`);
        const data = await res.json();
        if (!cancelled) {
          setBooks(data.books ?? []);
          setTotal(data.total ?? 0);
          setLoading(false);
        }
      } catch {
        if (!cancelled) { setBooks([]); setLoading(false); }
      }
    };
    load();
    return () => { cancelled = true; };
  }, [categorySlug, subCategory, search, page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };
  const totalPages = Math.max(1, Math.ceil(total / 20));
  const activeLabel = subCategory ? (FLAT_CATEGORY_MAP[subCategory] ?? subCategory) : categoryName;
  const progressPct = Math.round((page / totalPages) * 100);

  return (
    <section className="lib" aria-label={`${categoryName}分类`}>
      {/* 全页像素纹理 */}
      <div className="lib-texture" aria-hidden />

      {/* Header */}
      <header className="lib-header lib-header--category">
        <div className="lib-header-bg" aria-hidden />
        <div className="lib-header-brand">
          <a href="/books" className="lib-back-link">← 返回书库</a>
          <h1 className="lib-title">{categoryName}</h1>
        </div>

        {/* 搜索 */}
        <form className="lib-search" onSubmit={handleSearch}>
          <PixelSearch className="lib-search-mark" />
          <input
            type="search"
            placeholder="搜索书名 / 作者"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="lib-search-input"
            aria-label="搜索书名或作者"
          />
          <button type="submit" className="lib-search-btn" aria-label="检索">检索</button>
        </form>

        {/* 统计 */}
        <div className="lib-stats-compact">
          <div className="lib-stats-value">
            <span className="lib-stats-num">{loading ? "—" : total}</span>
            <span className="lib-stats-divider">|</span>
            <span className="lib-stats-num">{totalPages}</span>
          </div>
          <div className="lib-stats-labels">
            <span>统计数</span>
            <span className="lib-stats-gap" />
            <span>次数</span>
          </div>
        </div>
      </header>

      {/* 子分类筛选 */}
      <div className="lib-view-section">
        <h2 className="lib-section-title">
          <span className="lib-section-title-text">VIEW {activeLabel}</span>
          {search && (
            <span className="lib-section-query">/ &ldquo;{search}&rdquo;</span>
          )}
        </h2>

        {subCategories.length > 0 && (
          <div className="lib-subcats">
            <button
              className={`lib-subcat ${subCategory === "" ? "is-active" : ""}`}
              onClick={() => { setSubCategory(""); setPage(1); }}
              aria-pressed={subCategory === ""}
            >
              全部
            </button>
            {subCategories.map((sub) => (
              <button
                key={sub.id}
                className={`lib-subcat ${subCategory === sub.id ? "is-active" : ""}`}
                onClick={() => { setSubCategory(sub.id); setPage(1); }}
                aria-pressed={subCategory === sub.id}
              >
                {sub.name}
              </button>
            ))}
          </div>
        )}

        {/* 内容区 */}
        {loading ? (
          <div className="lib-list lib-list-skeleton" aria-hidden>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="lib-card-h-skeleton" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="lib-card-h-skeleton-icon" />
                <div className="lib-card-h-skeleton-body">
                  <div className="lib-card-h-skeleton-line w-60" />
                  <div className="lib-card-h-skeleton-line w-100" />
                  <div className="lib-card-h-skeleton-line w-40" />
                </div>
              </div>
            ))}
          </div>
        ) : books.length === 0 ? (
          <div className="lib-state">
            <EmptyShelf className="lib-state-icon" />
            <p className="lib-state-title">空殿</p>
            <p className="lib-state-desc">此筛选下尚无藏书。</p>
          </div>
        ) : (
          <ul className="lib-list">
            {books.map((book, i) => (
              <BookCard
                key={book.id}
                book={book}
                index={(page - 1) * 20 + i + 1}
                PixelBookIcon={PixelBook}
              />
            ))}
          </ul>
        )}

        {/* 分页 */}
        {totalPages > 1 && (
          <nav className="lib-pagination" aria-label="分页">
            <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="lib-page-btn">← PREV</button>
            <div className="lib-page-center">
              <span className="lib-page-indicator">
                <span className="lib-page-current">{String(page).padStart(2, "0")}</span>
                <span className="lib-page-divider">/</span>
                <span className="lib-page-total">{String(totalPages).padStart(2, "0")}</span>
              </span>
              <div className="lib-page-progress" aria-hidden>
                <div className="lib-page-progress-fill" style={{ width: `${progressPct}%` }} />
              </div>
            </div>
            <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="lib-page-btn">NEXT →</button>
          </nav>
        )}
      </div>
    </section>
  );
}
