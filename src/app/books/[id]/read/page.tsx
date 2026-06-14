// ====================
// 阅读页 — 完整阅读器入口
// ====================

import Link from "next/link";
import { notFound } from "next/navigation";
import { getBook } from "@/lib/db/books";
import BookReader from "@/components/client/books/BookReader";

export default async function ReadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const book = await getBook(id);

  if (!book) notFound();

  if (!book.contentMarkdown) {
    return (
      <div className="page-container">
        <div className="page-error">
          <h2>暂无内容</h2>
          <p>该书籍尚未提取文字内容。</p>
          <Link href={`/books/${id}`} className="btn-pixel btn-pixel--outline">
            返回书籍详情
          </Link>
        </div>
      </div>
    );
  }

  return (
    <BookReader
      bookId={book.id}
      title={book.title}
      author={book.author}
      content={book.contentMarkdown}
    />
  );
}
