"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { BookSummary } from "@/lib/utils/types";
import { DEFAULT_CATEGORIES } from "@/lib/utils/constants";
import BookCard from "./BookCard";

const categoryNames = Object.fromEntries(DEFAULT_CATEGORIES.map((c) => [c.id, c.name]));

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
  const activeCategoryLabel = category ? (categoryNames[category] ?? category) : "全部";

  return (
    <section className="lib">
      {/* ====== 顶部：索引栏 ====== */}
      <header className="lib-header">
        <div className="lib-header-row">
          <span className="lib-eyebrow">LIBRARY / INDEX</span>
          <span className="lib-count">{String(total).padStart(3, "0")} VOLUMES</span>
        </div>
        <h1 className="lib-title">学术书库</h1>
        <p className="lib-subtitle">
          开源、协作的经典学术翻译与阅读库 ——
          按学科筛选，或在搜索框中键入作者与书名。
        </p>
      </header>

      {/* ====== 工具区：搜索 + 过滤 ====== */}
      <div className="lib-toolbar">
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
        <span className="lib-toolbar-divider" aria-hidden />
        <div className="lib-filters">
          <button
            className={`lib-filter ${!category ? "is-active" : ""}`}
            onClick={() => { setCategory(""); setPage(1); }}
          >
            全部
          </button>
          {DEFAULT_CATEGORIES.map((c) => (
            <button
              key={c.id}
              className={`lib-filter ${category === c.id ? "is-active" : ""}`}
              onClick={() => { setCategory(c.id); setPage(1); }}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

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
        <div className="lib-state">LOADING…</div>
      ) : books.length === 0 ? (
        <div className="lib-state">
          <p className="lib-state-title">EMPTY SHELF</p>
          <p className="lib-state-desc">该筛选下还没有书籍。</p>
          <Link href="/books/upload" className="lib-state-cta">+ 上传第一本</Link>
        </div>
      ) : (
        <ol className="lib-grid" start={(page - 1) * 20 + 1}>
          {books.map((book, i) => (
            <BookCard key={book.id} book={book} index={(page - 1) * 20 + i + 1} />
          ))}
        </ol>
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
