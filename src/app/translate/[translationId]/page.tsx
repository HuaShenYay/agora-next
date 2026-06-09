import Link from "next/link";
import { getTranslation } from "@/lib/db/translations";
import { getBook } from "@/lib/db/books";

export default async function TranslationWorkbench({ params, searchParams }: { params: Promise<{ translationId: string }>; searchParams: Promise<{ bookId?: string }> }) {
  const { translationId } = await params;
  const { bookId = "" } = await searchParams;

  let translation = null, book = null;
  if (bookId) {
    try { translation = await getTranslation(bookId, translationId); book = await getBook(bookId); } catch {}
  }

  if (!translation || !book) {
    return <div className="page-container"><div className="page-error"><h2>翻译项目不存在</h2><p>请确保 URL 中包含正确的 bookId 参数</p><Link href="/books" className="btn btn-outline">返回书库</Link></div></div>;
  }

  const chapters = Array.from({ length: book.chapterCount }, (_, i) => i);

  return (
    <div className="page-container translate-workbench">
      <div className="page-header"><h1>{translation.name}</h1><p>翻译 {book.title} → {translation.targetLanguage}</p></div>
      <div className="translate-progress"><div className="progress-bar"><div className="progress-fill" style={{ width: `${translation.progress}%` }} /></div><span className="progress-label">{translation.progress}% 完成</span></div>
      <div className="translate-chapters">
        <h3>章节</h3>
        <ul className="chapter-nav-list">
          {chapters.map((idx) => (
            <li key={idx} className="chapter-nav-item">
              <a href={`/translate/${translationId}/${idx}?bookId=${bookId}`} className="chapter-nav-link">
                <span className="chapter-nav-index">{idx + 1}</span><span className="chapter-nav-title">第 {idx + 1} 章</span><span className="chapter-nav-arrow">→</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div className="translate-actions">
        <a href={`/pr/new?bookId=${bookId}&translationId=${translationId}`} className="btn btn-primary">创建 Pull Request</a>
        <a href={`/books/${bookId}`} className="btn btn-outline">返回书籍</a>
      </div>
    </div>
  );
}
