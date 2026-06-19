"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { BookSummary } from "@/lib/utils/types";
import { DEFAULT_CATEGORIES, FLAT_CATEGORY_MAP } from "@/lib/utils/constants";
import BookCard from "./BookCard";

/* ====== 像素 SVG 插画库（与主页同源技法）====== */

/* 大型像素神殿 — Hero 主角，带列柱呼吸 + 屋顶 shimmer 动效 */
const GrandTemple = ({ className = "" }: { className?: string }) => (
  <svg className={className} width="140" height="112" viewBox="0 0 18 14" fill="currentColor" aria-hidden>
    {/* 屋顶 */}
    <rect x="8" y="0" width="2" height="1" className="temple-roof" />
    <rect x="6" y="1" width="6" height="1" className="temple-roof" />
    <rect x="4" y="2" width="10" height="1" className="temple-roof" />
    <rect x="2" y="3" width="14" height="1" className="temple-roof" />
    {/* 楣梁 */}
    <rect x="1" y="4" width="16" height="1" />
    {/* 列柱（呼吸动效）*/}
    <rect x="2" y="5" width="2" height="7" className="column-1" />
    <rect x="6" y="5" width="2" height="7" className="column-2" />
    <rect x="10" y="5" width="2" height="7" className="column-3" />
    <rect x="14" y="5" width="2" height="7" className="column-4" />
    {/* 基座 */}
    <rect x="1" y="12" width="16" height="1" />
    <rect x="0" y="13" width="18" height="1" />
  </svg>
);

/* 学科像素图标 */
const IconHumanities = () => (
  <svg width="16" height="14" viewBox="0 0 8 7" fill="currentColor" aria-hidden>
    {/* 悲剧/喜剧双面具 */}
    <rect x="1" y="1" width="2" height="1" /><rect x="2" y="2" width="1" height="1" />
    <rect x="1" y="3" width="3" height="1" /><rect x="2" y="4" width="1" height="1" />
    <rect x="5" y="1" width="2" height="1" /><rect x="5" y="2" width="1" height="1" />
    <rect x="4" y="3" width="3" height="1" /><rect x="5" y="4" width="1" height="1" />
    <rect x="2" y="6" width="4" height="1" opacity="0.5" />
  </svg>
);
const IconSocial = () => (
  <svg width="16" height="14" viewBox="0 0 8 7" fill="currentColor" aria-hidden>
    {/* 天平 */}
    <rect x="3" y="0" width="2" height="1" /><rect x="3" y="1" width="2" height="4" opacity="0.4" />
    <rect x="1" y="1" width="6" height="1" /><rect x="0" y="2" width="8" height="1" opacity="0.3" />
    <rect x="0" y="3" width="2" height="1" /><rect x="0" y="4" width="2" height="1" opacity="0.6" />
    <rect x="6" y="3" width="2" height="1" /><rect x="6" y="4" width="2" height="1" opacity="0.6" />
    <rect x="2" y="6" width="4" height="1" />
  </svg>
);
const IconScience = () => (
  <svg width="16" height="14" viewBox="0 0 8 7" fill="currentColor" aria-hidden>
    {/* 烧瓶 */}
    <rect x="3" y="0" width="2" height="1" /><rect x="3" y="1" width="2" height="1" opacity="0.5" />
    <rect x="2" y="2" width="4" height="1" /><rect x="1" y="3" width="6" height="1" />
    <rect x="1" y="4" width="6" height="1" opacity="0.7" /><rect x="1" y="5" width="6" height="1" />
    <rect x="0" y="6" width="8" height="1" />
    <rect x="2" y="4" width="1" height="1" className="lib-bubble-1" />
    <rect x="5" y="3" width="1" height="1" className="lib-bubble-2" />
  </svg>
);

const GROUP_ICON: Record<string, () => React.JSX.Element> = {
  "humanities": IconHumanities,
  "social-science": IconSocial,
  "natural-science": IconScience,
};

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

/* 空书架像素插画 */
const EmptyShelf = ({ className = "" }: { className?: string }) => (
  <svg className={className} width="80" height="64" viewBox="0 0 20 16" fill="currentColor" aria-hidden>
    <rect x="1" y="1" width="18" height="1" /><rect x="1" y="1" width="1" height="14" />
    <rect x="18" y="1" width="1" height="14" /><rect x="1" y="7" width="18" height="1" />
    <rect x="1" y="11" width="18" height="1" /><rect x="1" y="15" width="18" height="1" />
    {/* 几本斜倚小书 */}
    <rect x="3" y="4" width="1" height="3" /><rect x="5" y="3" width="1" height="4" opacity="0.6" />
    <rect x="7" y="4" width="1" height="3" opacity="0.4" />
    <rect x="13" y="9" width="1" height="2" opacity="0.6" /><rect x="15" y="8" width="1" height="3" opacity="0.4" />
  </svg>
);

interface Props { initialCategory?: string; initialSearch?: string; }

export default function BookGrid({ initialCategory, initialSearch }: Props) {
  const [books, setBooks] = useState<BookSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState(initialCategory ?? "");
  const [search, setSearch] = useState(initialSearch ?? "");
  const [searchInput, setSearchInput] = useState(initialSearch ?? "");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const params = new URLSearchParams();
        if (category) params.set("category", category);
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
  }, [category, search, page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };
  const totalPages = Math.max(1, Math.ceil(total / 20));
  const activeCategoryLabel = category ? (FLAT_CATEGORY_MAP[category] ?? category) : "全部";
  const progressPct = Math.round((page / totalPages) * 100);

  return (
    <section className="lib" id="main-content" aria-label="书库">
      {/* ====== Hero：藏书殿 ====== */}
      <header className="lib-header">
        <div className="lib-header-bg" aria-hidden />
        <GrandTemple className="lib-header-temple" />

        <div className="lib-header-top">
          <div className="lib-header-brand">
            <span className="lib-eyebrow">CATALOG · MMXXVI</span>
            <h1 className="lib-title">
              学术<span className="lib-title-accent">书库</span>
            </h1>
            <p className="lib-subtitle">
              开源协作的经典学术翻译与阅读库。按学科筛选，或键入作者与书名。
            </p>
          </div>
          <div className="lib-stats">
            <div className="lib-stat">
              <span className="lib-stat-value">{loading ? "—" : total}</span>
              <span className="lib-stat-label">册藏书</span>
            </div>
            <div className="lib-stat">
              <span className="lib-stat-value">{DEFAULT_CATEGORIES.length}</span>
              <span className="lib-stat-label">学科</span>
            </div>
          </div>
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

        {/* 分类：三大学科殿 */}
        <div className="lib-categories">
          <button
            className={`lib-cat-all ${!category ? "is-active" : ""}`}
            onClick={() => { setCategory(""); setPage(1); }}
            aria-pressed={!category}
          >
            <span className="lib-cat-all-glyph">◆</span>全部
          </button>
          <div className="lib-cat-columns">
            {DEFAULT_CATEGORIES.map((cat) => {
              const Icon = GROUP_ICON[cat.id];
              return (
              <div key={cat.id} className="lib-cat-group" data-cat={cat.id}>
                <span className="lib-cat-group-label">
                  {Icon && <Icon />}
                  <em className="lib-cat-group-emoji">{cat.emoji}</em>{cat.name}
                </span>
                <div className="lib-cat-children">
                  {cat.children?.map((sub) => (
                    <button
                      key={sub.id}
                      className={`lib-cat-item ${category === sub.id ? "is-active" : ""}`}
                      onClick={() => { setCategory(sub.id); setPage(1); }}
                      aria-pressed={category === sub.id}
                    >
                      {sub.name}
                    </button>
                  ))}
                </div>
              </div>
              );
            })}
          </div>
        </div>
      </header>

      {/* 视图元数据 */}
      <div className="lib-meta">
        <span className="lib-meta-key">VIEW</span>
        <span className="lib-meta-val">{activeCategoryLabel}</span>
        {search && (
          <>
            <span className="lib-meta-sep">/</span>
            <span className="lib-meta-key">QUERY</span>
            <span className="lib-meta-val">&ldquo;{search}&rdquo;</span>
          </>
        )}
      </div>

      {/* 内容区 */}
      {loading ? (
        <div className="lib-grid lib-grid-skeleton" aria-hidden>
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="lib-card-skeleton" style={{ animationDelay: `${i * 60}ms` }}>
              <span className="lib-card-skeleton-band" />
              <div className="lib-card-skeleton-line w-40" />
              <div className="lib-card-skeleton-line w-80" />
              <div className="lib-card-skeleton-line w-60" />
              <div className="lib-card-skeleton-footer" />
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
        <ul className="lib-grid">
          {books.map((book, i) => (
            <BookCard key={book.id} book={book} index={(page - 1) * 20 + i + 1} />
          ))}
        </ul>
      )}

      {/* 分页 */}
      {totalPages > 1 && (
        <nav className="lib-pagination" aria-label="分页">
          <button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="lib-page-btn"
          >
            ← PREV
          </button>
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
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            className="lib-page-btn"
          >
            NEXT →
          </button>
        </nav>
      )}
    </section>
  );
}
