"use client";
import { useEffect, useState } from "react";
import type { BookSummary } from "@/lib/utils/types";
import { DEFAULT_CATEGORIES, FLAT_CATEGORY_MAP } from "@/lib/utils/constants";
import BookCard from "./BookCard";

/* ====== 像素 SVG 图标 ====== */
const IconHumanities = () => (
  <svg width="32" height="28" viewBox="0 0 12 10" fill="currentColor" aria-hidden>
    <rect x="0" y="1" width="1" height="7" opacity="0.5" />
    <rect x="1" y="0" width="5" height="1" />
    <rect x="1" y="0" width="1" height="8" opacity="0.3" />
    <rect x="5" y="0" width="1" height="8" />
    <rect x="1" y="7" width="5" height="1" />
    <rect x="2" y="2" width="2" height="1" opacity="0.2" />
    <rect x="2" y="4" width="3" height="1" opacity="0.15" />
    <rect x="8" y="1" width="2" height="2" />
    <rect x="9" y="0" width="1" height="1" opacity="0.6" />
    <rect x="7" y="3" width="4" height="1" />
    <rect x="8" y="4" width="2" height="4" opacity="0.6" />
    <rect x="7" y="8" width="4" height="1" opacity="0.4" />
  </svg>
);
const IconSocial = () => (
  <svg width="32" height="28" viewBox="0 0 12 10" fill="currentColor" aria-hidden>
    <rect x="1" y="0" width="3" height="1" />
    <rect x="0" y="1" width="5" height="1" />
    <rect x="0" y="2" width="1" height="2" />
    <rect x="4" y="2" width="1" height="2" />
    <rect x="1" y="4" width="3" height="1" opacity="0.6" />
    <rect x="2" y="2" width="1" height="1" opacity="0.3" />
    <rect x="8" y="0" width="3" height="1" />
    <rect x="9" y="1" width="1" height="7" opacity="0.6" />
    <rect x="7" y="8" width="5" height="1" />
    <rect x="8" y="9" width="3" height="1" opacity="0.4" />
  </svg>
);
const IconScience = () => (
  <svg width="32" height="28" viewBox="0 0 12 10" fill="currentColor" aria-hidden>
    <rect x="1" y="0" width="2" height="1" />
    <rect x="1" y="1" width="2" height="1" opacity="0.5" />
    <rect x="0" y="2" width="4" height="1" />
    <rect x="0" y="3" width="4" height="1" opacity="0.7" />
    <rect x="0" y="4" width="4" height="1" />
    <rect x="0" y="5" width="4" height="1" opacity="0.5" />
    <rect x="7" y="0" width="4" height="1" opacity="0.5" />
    <rect x="6" y="1" width="6" height="1" />
    <rect x="6" y="2" width="6" height="3" opacity="0.6" />
    <rect x="8" y="1" width="2" height="4" opacity="0.3" />
    <rect x="7" y="5" width="4" height="1" opacity="0.5" />
    <rect x="8" y="6" width="2" height="1" />
    <rect x="7" y="7" width="4" height="1" opacity="0.4" />
  </svg>
);

const GROUP_ICON: Record<string, () => React.JSX.Element> = {
  humanities: IconHumanities,
  "social-science": IconSocial,
  "natural-science": IconScience,
};

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
    <rect x="3" y="10" width="7" height="1" opacity="0.1" />
    <rect x="3" y="12" width="5" height="1" opacity="0.08" />
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

/* 空书架 */
const EmptyShelf = ({ className = "" }: { className?: string }) => (
  <svg className={className} width="80" height="64" viewBox="0 0 20 16" fill="currentColor" aria-hidden>
    <rect x="1" y="1" width="18" height="1" /><rect x="1" y="1" width="1" height="14" />
    <rect x="18" y="1" width="1" height="14" /><rect x="1" y="7" width="18" height="1" />
    <rect x="1" y="11" width="18" height="1" /><rect x="1" y="15" width="18" height="1" />
    <rect x="3" y="4" width="1" height="3" /><rect x="5" y="3" width="1" height="4" opacity="0.6" />
    <rect x="7" y="4" width="1" height="3" opacity="0.4" />
    <rect x="13" y="9" width="1" height="2" opacity="0.6" /><rect x="15" y="8" width="1" height="3" opacity="0.4" />
  </svg>
);

/* 一级门类 → 子分类 */
const SUB_CATEGORY_MAP_ROOT: Record<string, { id: string; name: string }[]> = {};
for (const cat of DEFAULT_CATEGORIES) {
  if (cat.children) SUB_CATEGORY_MAP_ROOT[cat.id] = cat.children;
}

interface Props {
  initialCategory?: string;
  initialSearch?: string;
}

export default function BookGrid({ initialCategory, initialSearch }: Props) {
  const [books, setBooks] = useState<BookSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState(initialCategory ?? "");
  const [subCategory, setSubCategory] = useState("");
  const [search, setSearch] = useState(initialSearch ?? "");
  const [searchInput, setSearchInput] = useState(initialSearch ?? "");

  // 获取书籍
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const params = new URLSearchParams();
        if (subCategory) params.set("category", subCategory);
        else if (category) params.set("category", category);
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
  }, [category, subCategory, search, page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSearch(searchInput);
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(total / 20));
  const activeCategoryLabel = subCategory
    ? (FLAT_CATEGORY_MAP[subCategory] ?? subCategory)
    : category
      ? (FLAT_CATEGORY_MAP[category] ?? category)
      : "全部";
  const progressPct = Math.round((page / totalPages) * 100);
  const showView = category || search || total > 0 || loading;

  return (
    <section className="lib" id="main-content" aria-label="书库">
      {/* 左雕像 */}
      <div className="lib-bust lib-bust-left" aria-hidden>
        <img src="/images/bust_left_library.png" alt="" />
      </div>
      <div className="lib-bust lib-bust-right" aria-hidden>
        <img src="/images/bust_right.png" alt="" />
      </div>

      {/* 全页像素纹理 */}
      <div className="lib-texture" aria-hidden />

      {/* ====== Header ====== */}
      <header className="lib-header">
        <div className="lib-header-bg" aria-hidden />
        <div className="lib-header-brand">
          <span className="lib-eyebrow">CATALOG · MMXXIV</span>
          <h1 className="lib-title">学术书库</h1>
          <p className="lib-subtitle">
            开源协作的经典学术翻译与阅读库。按学科筛选，或键入作者与书名。
          </p>
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

      {/* ====== 电鸣分类 ====== */}
      <div className="lib-categories-section">
        <h2 className="lib-section-title">
          <span className="lib-section-title-text">电鸣分类</span>
        </h2>
        <div className="lib-categories-grid">
          {DEFAULT_CATEGORIES.map((cat) => {
            const Icon = GROUP_ICON[cat.id];
            const isActive = category === cat.id;
            return (
              <button
                key={cat.id}
                className={`lib-cat-card${isActive ? " is-active" : ""}`}
                data-cat={cat.id}
                onClick={() => {
                  setLoading(true);
                  setCategory(cat.id === category ? "" : cat.id);
                  setSubCategory("");
                  setPage(1);
                }}
                aria-label={`浏览${cat.name}`}
                aria-pressed={isActive}
              >
                <div className="lib-cat-card-icon">
                  {Icon && <Icon />}
                </div>
                <div className="lib-cat-card-body">
                  <span className="lib-cat-card-emoji">{cat.emoji}</span>
                  <h3 className="lib-cat-card-name">{cat.name}</h3>
                  <div className="lib-cat-card-tags">
                    {cat.children?.slice(0, 2).map((sub) => (
                      <span key={sub.id} className="lib-cat-tag lib-cat-tag--static">
                        {sub.name}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ====== VIEW：选中分类后显示书列表 ====== */}
      {showView && (
        <div className="lib-view-section">
          <h2 className="lib-section-title">
            {category && (
              <button
                className="lib-back-btn"
                onClick={() => {
                  setLoading(true);
                  setCategory("");
                  setSubCategory("");
                  setPage(1);
                }}
                aria-label="返回全部分类"
                title="返回"
              >
                ←
              </button>
            )}
            <span className="lib-section-title-text">VIEW {activeCategoryLabel}</span>
            {search && (
              <span className="lib-section-query">/ &ldquo;{search}&rdquo;</span>
            )}
          </h2>

          {/* 子分类筛选 */}
          {category && (
            <div className="lib-subcats">
              {SUB_CATEGORY_MAP_ROOT[category]?.map((sub) => (
                <button
                  key={sub.id}
                  className={`lib-subcat ${subCategory === sub.id ? "is-active" : ""}`}
                  onClick={() => {
                    setLoading(true);
                    setSubCategory(sub.id);
                    setPage(1);
                  }}
                  aria-pressed={subCategory === sub.id}
                >
                  {sub.name}
                </button>
              ))}
              <button
                className={`lib-subcat lib-subcat--all ${subCategory === "" ? "is-active" : ""}`}
                onClick={() => {
                  setLoading(true);
                  setSubCategory("");
                  setPage(1);
                }}
                aria-pressed={subCategory === ""}
              >
                全部
              </button>
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
              <button
                disabled={page <= 1}
                onClick={() => { setLoading(true); setPage(page - 1); }}
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
                onClick={() => { setLoading(true); setPage(page + 1); }}
                className="lib-page-btn"
              >
                NEXT →
              </button>
            </nav>
          )}
        </div>
      )}
    </section>
  );
}
