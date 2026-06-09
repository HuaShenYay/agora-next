"use client";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;
  const pages: (number | string)[] = [];
  const delta = 2;
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }
  return (
    <nav className="pagination" aria-label="分页导航">
      <button className="pagination-btn" disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}>&lsaquo; 上一页</button>
      <div className="pagination-pages">
        {pages.map((page, idx) =>
          typeof page === "string"
            ? <span key={`ellipsis-${idx}`} className="pagination-ellipsis">&hellip;</span>
            : <button key={page} className={`pagination-btn ${page === currentPage ? "active" : ""}`} onClick={() => onPageChange(page as number)}>{page}</button>
        )}
      </div>
      <button className="pagination-btn" disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)}>下一页 &rsaquo;</button>
    </nav>
  );
}
