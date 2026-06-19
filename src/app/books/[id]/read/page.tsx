// ====================
// 阅读页 — 完整阅读器入口
// ====================

import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getBook } from "@/lib/db/books";
import BookReader from "@/components/client/books/BookReader";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const book = await getBook(id);
  if (!book) return { title: "书籍不存在" };
  return {
    title: `阅读: ${book.title}`,
    description: book.description
      ? `${book.title} — ${book.description.slice(0, 120)}`
      : `在线阅读 ${book.title}`,
    robots: { index: false, follow: false },
  };
}

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
          <Link href={`/books/${id}`} className="bd-btn bd-btn--outline" style={{ maxWidth: "16rem", margin: "1.5rem auto 0" }}>
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
