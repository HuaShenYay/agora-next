import Link from "next/link";
import { getTranslation } from "@/lib/db/translations";
import { getBook } from "@/lib/db/books";
import TranslationEditor from "@/components/client/translate/TranslationEditor";

export default async function ChapterEditor({ params, searchParams }: { params: Promise<{ translationId: string; chapterId: string }>; searchParams: Promise<{ bookId?: string }> }) {
  const { translationId, chapterId } = await params;
  const { bookId = "" } = await searchParams;
  const chapterIndex = parseInt(chapterId);

  let book = null, translation = null;
  if (bookId) {
    try { translation = await getTranslation(bookId, translationId); book = await getBook(bookId); } catch {}
  }

  if (!book || !translation || isNaN(chapterIndex) || chapterIndex >= book.chapterCount) {
    return <div className="page-container"><div className="page-error"><h2>页面不存在</h2><Link href="/books" className="btn btn-outline">返回书库</Link></div></div>;
  }

  return (
    <div className="page-container chapter-editor-page">
      <div className="editor-page-header">
        <h2>{book.title} — {translation.name}</h2>
        <a href={`/translate/${translationId}?bookId=${bookId}`} className="btn btn-sm btn-outline">← 返回工作台</a>
      </div>
      <TranslationEditor bookId={bookId} translationId={translationId} chapterIndex={chapterIndex} totalChapters={book.chapterCount} />
    </div>
  );
}
