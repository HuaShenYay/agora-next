"use client";
import { useState } from "react";

interface Chapter { id: string; bookId: string; index: number; title: string; wordCount: number; }
interface Props { bookId: string; chapterCount: number; onChapterSelect?: (index: number) => void; }

export default function ChapterList({ bookId, chapterCount, onChapterSelect }: Props) {
  const chapters: Chapter[] = Array.from({ length: chapterCount }, (_, i) => ({
    id: `${bookId}-ch-${i}`,
    bookId,
    index: i,
    title: `第 ${i + 1} 章`,
    wordCount: 0,
  }));
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [content, setContent] = useState<string | null>(null);
  const [loadingContent, setLoadingContent] = useState(false);

  const selectChapter = async (index: number) => {
    setSelectedIdx(index); setLoadingContent(true); setContent(null);
    onChapterSelect?.(index);
    try { const res = await fetch(`/api/books/${bookId}?chapter=${index}`); const data = await res.json(); setContent(data.chapterContent); }
    catch { setContent("加载失败"); } finally { setLoadingContent(false); }
  };

  return (
    <div className="chapter-list-container">
      <div className="chapter-sidebar">
        <h4>章节目录 ({chapterCount} 章)</h4>
        <ul className="chapter-list">
          {chapters.map((ch) => <li key={ch.id} className={`chapter-item ${selectedIdx === ch.index ? "active" : ""}`} onClick={() => selectChapter(ch.index)}><span className="chapter-index">{ch.index + 1}</span><span className="chapter-title">{ch.title}</span></li>)}
        </ul>
      </div>
      <div className="chapter-content">
        {selectedIdx === null ? <div className="chapter-placeholder">← 选择章节开始阅读</div> : loadingContent ? <div className="chapter-loading">加载中...</div> : (
          <div className="chapter-text">{content?.split("\n").map((line, i) => <p key={i} className={line.startsWith("##") ? "chapter-heading" : ""}>{line.startsWith("## ") ? line.slice(3) : line}</p>)}</div>
        )}
      </div>
    </div>
  );
}
