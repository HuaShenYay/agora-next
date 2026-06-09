"use client";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, FormEvent } from "react";

function NewPRForm() {
  const searchParams = useSearchParams();
  const bookId = searchParams.get("bookId") ?? "";
  const translationId = searchParams.get("translationId") ?? "";
  const [chapterCount, setChapterCount] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!bookId) return;
    fetch("/api/books/" + bookId).then(r => r.json()).then(data => { if (data.book) setChapterCount(data.book.chapterCount); });
  }, [bookId]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const title = (form.querySelector("[name=title]") as HTMLInputElement).value;
    const description = (form.querySelector("[name=description]") as HTMLTextAreaElement).value;
    const checkboxes = form.querySelectorAll<HTMLInputElement>("[name=chapters]:checked");
    const chapterIndices = Array.from(checkboxes).map(cb => parseInt(cb.value));
    if (!title || chapterIndices.length === 0) { setError("请填写标题并至少选择一个章节"); return; }
    try {
      const res = await fetch("/api/prs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bookId, translationId, title, description, chapterIndices }) });
      const data = await res.json();
      if (res.ok) window.location.href = "/pr/" + data.prId + "?bookId=" + bookId;
      else setError(data.error || "创建失败");
    } catch { setError("网络错误"); }
  };

  if (!bookId || !translationId) return <div className="page-container"><p className="page-error">缺少 bookId 或 translationId 参数</p></div>;

  return (
    <div className="page-container">
      <div className="page-header"><h1>创建 Pull Request</h1><p>提交你的翻译稿件供审核</p></div>
      <form className="pr-new-form" onSubmit={handleSubmit}>
        <input type="hidden" name="bookId" value={bookId} />
        <input type="hidden" name="translationId" value={translationId} />
        <div className="form-group"><label>标题 *</label><input type="text" name="title" placeholder="如：完成前三章翻译" required /></div>
        <div className="form-group"><label>描述</label><textarea name="description" placeholder="说明翻译内容、翻译策略等..." rows={4} /></div>
        <div className="form-group"><label>包含章节</label><p className="form-hint">选择要提交的翻译章节（至少选择一个已翻译的章节）</p>
          <div className="chapter-checkbox-group">
            {Array.from({ length: chapterCount }, (_, i) => (
              <label key={i} className="chapter-checkbox-item"><input type="checkbox" name="chapters" value={i} defaultChecked /> 第 {i + 1} 章</label>
            ))}
          </div>
        </div>
        {error && <div className="upload-error">{error}</div>}
        <button type="submit" className="btn btn-primary btn-lg">创建 Pull Request</button>
      </form>
    </div>
  );
}

export default function NewPRPage() {
  return <Suspense fallback={<div className="page-container">加载中...</div>}><NewPRForm /></Suspense>;
}
