"use client";
import { useEffect, useState } from "react";

interface Props { bookId: string; translationId: string; chapterIndex: number; totalChapters: number; }

export default function TranslationEditor({ bookId, translationId, chapterIndex, totalChapters }: Props) {
  const [original, setOriginal] = useState("");
  const [translated, setTranslated] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`/api/chapters/${translationId}/${chapterIndex}?bookId=${bookId}`);
        const data = await res.json();
        if (!cancelled) {
          setOriginal(data.original ?? "");
          setTranslated(data.translated ?? "");
        }
      } catch {
        if (!cancelled) setError("加载失败");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [bookId, translationId, chapterIndex]);

  const save = async () => {
    setSaving(true); setError(null);
    try {
      const res = await fetch(`/api/chapters/${translationId}/${chapterIndex}?bookId=${bookId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: translated }) });
      const data = await res.json();
      if (res.ok) setLastSaved(new Date().toLocaleTimeString()); else setError(data.error ?? "保存失败");
    } catch { setError("网络错误"); } finally { setSaving(false); }
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key === "s") { e.preventDefault(); save(); } };
    document.addEventListener("keydown", handleKey); return () => document.removeEventListener("keydown", handleKey);
  }, [translated]);

  if (loading) return <div className="editor-loading">加载章节中...</div>;

  return (
    <div className="translation-editor">
      <div className="editor-toolbar">
        <div className="editor-nav">
          {chapterIndex > 0 && <a href={`/translate/${translationId}/${chapterIndex - 1}?bookId=${bookId}`} className="btn btn-sm btn-outline">← 上一章</a>}
          <span className="editor-chapter-label">第 {chapterIndex + 1} / {totalChapters} 章</span>
          {chapterIndex < totalChapters - 1 && <a href={`/translate/${translationId}/${chapterIndex + 1}?bookId=${bookId}`} className="btn btn-sm btn-outline">下一章 →</a>}
        </div>
        <div className="editor-actions">
          {lastSaved && <span className="editor-saved">已保存 {lastSaved}</span>}
          {error && <span className="editor-error">{error}</span>}
          <button onClick={save} disabled={saving} className="btn btn-primary btn-sm">{saving ? "保存中..." : "保存 (Ctrl+S)"}</button>
        </div>
      </div>
      <div className="editor-panels">
        <div className="editor-panel editor-panel-original">
          <div className="panel-header">原文</div>
          <div className="panel-content">{original.split("\n").map((line, i) => <p key={i} className="editor-line">{line || "\u00A0"}</p>)}</div>
        </div>
        <div className="editor-panel editor-panel-translation">
          <div className="panel-header">译文</div>
          <textarea className="panel-textarea" value={translated} onChange={(e) => setTranslated(e.target.value)} placeholder="在此输入翻译..." />
        </div>
      </div>
    </div>
  );
}
