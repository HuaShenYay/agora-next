import Link from "next/link";
import { notFound } from "next/navigation";
import { getBook, getBookStoragePath } from "@/lib/db/books";
import { storagePublicUrl } from "@/lib/supabase/storage";
import { LANGUAGES } from "@/lib/utils/constants";
import { DEFAULT_CATEGORIES } from "@/lib/utils/constants";

export default async function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [book, storagePath] = await Promise.all([
    getBook(id),
    getBookStoragePath(id),
  ]);

  if (!book) notFound();

  const categoryMap = Object.fromEntries(DEFAULT_CATEGORIES.map((c) => [c.id, c.name]));
  const categoryNames = book.categories.map((cid) => categoryMap[cid] ?? cid).filter(Boolean);
  const languageName = (LANGUAGES as Record<string, string>)[book.language] ?? book.language;
  const downloadUrl = storagePath ? storagePublicUrl(storagePath) : null;
  const canRead = book.format === "pdf" || book.format === "txt" || book.format === "markdown";

  return (
    <div className="page-container book-detail-page">
      <div className="book-detail-header">
        <div className="book-detail-info">
          <h1>{book.title}</h1>
          {book.titleOriginal !== book.title && (
            <h2 className="book-detail-original">{book.titleOriginal}</h2>
          )}
          <div className="book-detail-meta">
            <span className="meta-author">{book.author}</span>
            <span className="meta-lang">{languageName}</span>
            <span className="meta-format">{book.format.toUpperCase()}</span>
          </div>
          {book.description && <p className="book-detail-desc">{book.description}</p>}
          {categoryNames.length > 0 && (
            <div className="book-detail-categories">
              {categoryNames.map((name) => <span key={name} className="category-badge">{name}</span>)}
            </div>
          )}
          {book.tags.length > 0 && (
            <div className="book-detail-tags">
              {book.tags.map((tag) => <span key={tag} className="tag-badge">#{tag}</span>)}
            </div>
          )}
        </div>
        <div className="book-detail-actions">
          {canRead && downloadUrl && (
            <Link href={`/books/${book.id}/read`} className="btn btn-primary btn-lg">阅读</Link>
          )}
          {downloadUrl && (
            <a href={downloadUrl} download className="btn btn-outline">下载原文件</a>
          )}
        </div>
      </div>
      {!canRead && (
        <div className="book-detail-note">
          <p>该格式（{book.format.toUpperCase()}）暂不支持在线阅读，请下载原文件后用本地阅读器打开。</p>
        </div>
      )}
      {!downloadUrl && (
        <div className="book-detail-note">
          <p>未找到原文件存储记录，请联系管理员。</p>
        </div>
      )}
    </div>
  );
}
