"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { BookSummary } from "@/lib/utils/types";
import { DEFAULT_CATEGORIES, FLAT_CATEGORY_MAP } from "@/lib/utils/constants";
import BookCard from "./BookCard";

/* Pixel Temple — 与主页同源的像素雅典神殿 SVG */
const PixelTemple = ({ className = "" }: { className?: string }) => (
  <svg className={className} width="80" height="64" viewBox="0 0 20 16" fill="currentColor">
    <rect x="9" y="0" width="2" height="1" />
    <rect x="7" y="1" width="6" height="1" />
    <rect x="5" y="2" width="10" height="1" />
    <rect x="3" y="3" width="14" height="1" />
    <rect x="2" y="4" width="16" height="1" />
    <rect x="3" y="5" width="2" height="7" />
    <rect x="7" y="5" width="2" height="7" />
    <rect x="11" y="5" width="2" height="7" />
    <rect x="15" y="5" width="2" height="7" />
    <rect x="2" y="12" width="16" height="1" />
    <rect x="1" y="13" width="18" height="1" />
    <rect x="0" y="14" width="20" height="2" />
  </svg>
);

// 扁平化所有分类：门类标题 + 子分类按钮
const flatCategories: Array<{ type: "group"; id: string; name: string; emoji: string } | { type: "item"; id: string; name: string }> = [];
for (const cat of DEFAULT_CATEGORIES) {
  flatCategories.push({ type: "group", id: cat.id, name: cat.name, emoji: cat.emoji });
  if (cat.children) {
    for (const sub of cat.children) {
      flatCategories.push({ type: "item", id: sub.id, name: sub.name });
    }
  }
}

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
  const totalPages = Math.ceil(total / 20);
  const activeCategoryLabel = category ? (FLAT_CATEGORY_MAP[category] ?? category) : "全部";

  return (
    <section className="lib">
      {/* ====== Hero 头部（含搜索 + 分类） ====== */}
      <header className="lib-header">
        {/* 顶部栏：标识 + 统计 */}
        <div className="lib-header-top">
          <div className="lib-header-brand">
            <PixelTemple className="lib-header-temple" />
            <div>
              <span className="lib-eyebrow">LIBRARY / 书库</span>
              <h1 className="lib-title">
                学术<span className="lib-title-accent">书库</span>
              </h1>
            </div>
          </div>
          <div className="lib-stats">
            <div className="lib-stat">
              <span className="lib-stat-value">{loading ? "—" : total}</span>
              <span className="lib-stat-label">册藏书</span>
            </div>
            <div className="lib-stat">
              <span className="lib-stat-value">{DEFAULT_CATEGORIES.length}</span>
              <span className="lib-stat-label">个学科</span>
            </div>
          </div>
        </div>

        {/* 副标题 */}
        <p className="lib-subtitle">
          开源、协作的经典学术翻译与阅读库 —— 按学科筛选，或在搜索框中键入作者与书名。
        </p>

        {/* 搜索栏（嵌入 header） */}
        <form className="lib-search" onSubmit={handleSearch}>
          <span className="lib-search-mark">⌕</span>
          <input
            type="text"
            placeholder="搜索书名 / 作者"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="lib-search-input"
          />
          <button type="submit" className="lib-search-btn">GO</button>
        </form>

        {/* 分类栏：门类标题 + 子分类全部展开 */}
        <div className="lib-categories">
          <button
            className={`lib-cat-item lib-cat-all ${!category ? "is-active" : ""}`}
            onClick={() => { setCategory(""); setPage(1); }}
          >
            📚 全部
          </button>
          {DEFAULT_CATEGORIES.map((cat) => (
            <div key={cat.id} className="lib-cat-group">
              <span className="lib-cat-group-label">
                <em className="lib-cat-group-emoji">{cat.emoji}</em>{cat.name}
              </span>
              <div className="lib-cat-children">
                {cat.children?.map((sub) => (
                  <button
                    key={sub.id}
                    className={`lib-cat-item ${category === sub.id ? "is-active" : ""}`}
                    onClick={() => { setCategory(sub.id); setPage(1); }}
                  >
                    {sub.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </header>

      {/* ====== 当前视图元数据 ====== */}
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

      {/* ====== 内容区 ====== */}
      {loading ? (
        <div className="lib-state">
          <p className="lib-state-title">LOADING…</p>
          <p className="lib-state-desc">正在加载书库索引。</p>
        </div>
      ) : books.length === 0 ? (
        <div className="lib-state">
          <p className="lib-state-title">EMPTY SHELF</p>
          <p className="lib-state-desc">该筛选下还没有书籍。</p>
          <Link href="/books/upload" className="lib-state-cta">+ 上传第一本</Link>
        </div>
      ) : (
        <div className="lib-grid">
          {books.map((book, i) => (
            <BookCard key={book.id} book={book} index={(page - 1) * 20 + i + 1} />
          ))}
        </div>
      )}

      {/* ====== 分页 ====== */}
      {totalPages > 1 && (
        <nav className="lib-pagination" aria-label="分页">
          <button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="lib-page-btn"
          >
            ← PREV
          </button>
          <span className="lib-page-indicator">
            <span className="lib-page-current">{String(page).padStart(2, "0")}</span>
            <span className="lib-page-divider">/</span>
            <span className="lib-page-total">{String(totalPages).padStart(2, "0")}</span>
          </span>
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
