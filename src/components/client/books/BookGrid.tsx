"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { BookSummary } from "@/lib/utils/types";
import BookCard from "./BookCard";

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

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setSearch(searchInput); setPage(1); };
  const totalPages = Math.ceil(total / 20);

  return (
    <div className="book-grid-container">
      <div className="book-grid-toolbar">
        <form className="book-search-form" onSubmit={handleSearch}>
          <input type="text" placeholder="搜索书名、作者、标签..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="book-search-input" />
          <button type="submit" className="btn btn-sm">搜索</button>
        </form>
        <span className="book-grid-total">{total} 本书籍</span>
      </div>
      <div className="book-grid-filters">
        <button className={`filter-chip ${!category ? "active" : ""}`} onClick={() => { setCategory(""); setPage(1); }}>全部</button>
        {["philosophy","history","literature","mathematics","physics","cs","sociology","economics","psychology","linguistics","law","education"].map((id) => {
          const names: Record<string,string> = { philosophy:"哲学",history:"历史",literature:"文学",mathematics:"数学",physics:"物理学",cs:"计算机",sociology:"社会学",economics:"经济学",psychology:"心理学",linguistics:"语言学",law:"法学",education:"教育学" };
          return <button key={id} className={`filter-chip ${category === id ? "active" : ""}`} onClick={() => { setCategory(id); setPage(1); }}>{names[id] ?? id}</button>;
        })}
      </div>
      {loading ? <div className="book-grid-loading">加载中...</div> : books.length === 0 ? (
        <div className="book-grid-empty"><p>暂无书籍</p><Link href="/books/upload" className="btn btn-primary">上传第一本书</Link></div>
      ) : <div className="book-grid">{books.map((book) => <BookCard key={book.id} book={book} />)}</div>}
      {totalPages > 1 && (
        <div className="book-grid-pagination">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="btn btn-sm">上一页</button>
          <span>{page} / {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="btn btn-sm">下一页</button>
        </div>
      )}
    </div>
  );
}
