import Link from "next/link";
import { notFound } from "next/navigation";
import { getBook, getBookStoragePath } from "@/lib/db/books";
import { storagePublicUrl } from "@/lib/supabase/storage";
import BookReader from "@/components/client/books/BookReader";

export default async function ReadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [book, storagePath] = await Promise.all([
    getBook(id),
    getBookStoragePath(id),
  ]);

  if (!book) notFound();
  if (!storagePath) {
    return (
      <div className="page-container">
        <div className="page-error">
          <h2>未找到原文件</h2>
          <Link href={`/books/${id}`} className="btn btn-outline">返回书籍详情</Link>
        </div>
      </div>
    );
  }

  const fileUrl = storagePublicUrl(storagePath);

  return (
    <div className="page-container book-reader-page">
      <div className="book-reader-header">
        <Link href={`/books/${id}`} className="back-link">← 返回详情</Link>
        <h1 className="book-reader-title">{book.title}</h1>
        <span className="book-reader-author">{book.author}</span>
      </div>
      <BookReader format={book.format} fileUrl={fileUrl} />
    </div>
  );
}
