import Link from "next/link";
import { getBook } from "@/lib/db/books";
import ChapterList from "@/components/client/books/ChapterList";

export default async function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const book = await getBook(id);

  if (!book) {
    return <div className="page-container"><div className="page-error"><h2>书籍不存在</h2><Link href="/books" className="btn btn-outline">返回书库</Link></div></div>;
  }

  const categoryNames: Record<string, string> = { philosophy:"哲学",history:"历史",literature:"文学",mathematics:"数学",physics:"物理学",cs:"计算机科学",sociology:"社会学",economics:"经济学",psychology:"心理学",linguistics:"语言学",law:"法学",education:"教育学" };
  const langNames: Record<string, string> = { en:"English","zh-CN":"简体中文","zh-TW":"繁體中文",ja:"日本語",de:"Deutsch",fr:"Français",es:"Español",la:"Latina",grc:"古希腊语" };

  return (
    <div className="page-container book-detail-page">
      <div className="book-detail-header">
        <div className="book-detail-info">
          <h1>{book.title}</h1>
          {book.titleOriginal !== book.title && <h2 className="book-detail-original">{book.titleOriginal}</h2>}
          <div className="book-detail-meta">
            <span className="meta-author">{book.author}</span>
            <span className="meta-lang">{langNames[book.language] ?? book.language}</span>
            <span className="meta-format">{book.format.toUpperCase()}</span>
            <span className="meta-chapters">{book.chapterCount} 章</span>
          </div>
          {book.description && <p className="book-detail-desc">{book.description}</p>}
          {book.categories.length > 0 && <div className="book-detail-categories">{book.categories.map((catId: string) => <span key={catId} className="category-badge">{categoryNames[catId] ?? catId}</span>)}</div>}
          {book.tags.length > 0 && <div className="book-detail-tags">{book.tags.map((tag: string) => <span key={tag} className="tag-badge">#{tag}</span>)}</div>}
          {book.aiClassification?.summary && <div className="book-detail-ai-summary"><span className="ai-label">AI 摘要</span><p>{book.aiClassification.summary}</p></div>}
        </div>
        <div className="book-detail-actions">
          <Link href={`/translate/new?bookId=${book.id}`} className="btn btn-primary btn-lg">Fork 翻译</Link>
          <Link href="/books" className="btn btn-outline">返回书库</Link>
        </div>
      </div>
      <div className="book-detail-chapters"><ChapterList bookId={book.id} chapterCount={book.chapterCount} /></div>
      <div className="book-detail-stats">
        <div className="stat-item"><span className="stat-value">{book.forkCount}</span><span className="stat-label">Fork</span></div>
        <div className="stat-item"><span className="stat-value">{book.prCount}</span><span className="stat-label">Pull Request</span></div>
        <div className="stat-item"><span className="stat-value">{book.mergedPrCount}</span><span className="stat-label">已合并</span></div>
      </div>
    </div>
  );
}
