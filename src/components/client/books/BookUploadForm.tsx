"use client";
import { useState } from "react";
import { LANGUAGES } from "@/lib/utils/constants";

export default function BookUploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [titleOriginal, setTitleOriginal] = useState("");
  const [author, setAuthor] = useState("");
  const [language, setLanguage] = useState("en");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; bookId?: string; error?: string } | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title || !author) return;
    setUploading(true); setResult(null);
    try {
      const formData = new FormData();
      formData.append("file", file); formData.append("title", title); formData.append("titleOriginal", titleOriginal || title);
      formData.append("author", author); formData.append("language", language); formData.append("description", description);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) { setResult({ success: true, bookId: data.bookId }); fetch(`/api/classify/${data.bookId}`, { method: "POST" }).catch(() => {}); }
      else { setResult({ error: data.error || "上传失败" }); }
    } catch { setResult({ error: "网络错误，请重试" }); } finally { setUploading(false); }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const dropped = e.dataTransfer?.files?.[0];
    if (dropped) { setFile(dropped); if (!title) setTitle(dropped.name.replace(/\.[^.]+$/, "")); }
  };

  if (result?.success) {
    return (
      <div className="upload-success">
        <div className="upload-success-icon">✓</div><h3>上传成功</h3><p>已解析并存储，AI 正在自动分类中...</p>
        <div className="upload-success-actions">
          <a href={`/books/${result.bookId}`} className="btn btn-primary">查看书籍</a>
          <button className="btn btn-outline" onClick={() => { setResult(null); setFile(null); setTitle(""); setAuthor(""); }}>继续上传</button>
        </div>
      </div>
    );
  }

  return (
    <form className="upload-form" onSubmit={handleSubmit}>
      <div className={`upload-dropzone ${dragOver ? "drag-over" : ""} ${file ? "has-file" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={handleDrop}>
        <input type="file" accept=".pdf,.epub,.txt,.md,.markdown" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setFile(f); if (!title) setTitle(f.name.replace(/\.[^.]+$/, "")); } }} className="upload-file-input" />
        {file ? (
          <div className="upload-file-info"><span className="upload-file-icon">📄</span><span className="upload-file-name">{file.name}</span><span className="upload-file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</span><button type="button" className="upload-file-remove" onClick={() => setFile(null)}>✕</button></div>
        ) : (
          <div className="upload-dropzone-hint"><span className="upload-drop-icon">⬆</span><p>拖拽文件到此处，或点击选择</p><span className="upload-drop-formats">支持 PDF、EPUB、TXT、Markdown</span></div>
        )}
      </div>
      <div className="upload-fields">
        <div className="form-row">
          <div className="form-group"><label>书名 *</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="如：理想国" required /></div>
          <div className="form-group"><label>原文书名</label><input type="text" value={titleOriginal} onChange={(e) => setTitleOriginal(e.target.value)} placeholder="如：The Republic" /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>作者 *</label><input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="如：柏拉图 / Plato" required /></div>
          <div className="form-group"><label>原文语言</label><select value={language} onChange={(e) => setLanguage(e.target.value)}>{Object.entries(LANGUAGES).map(([code, name]) => <option key={code} value={code}>{name}</option>)}</select></div>
        </div>
        <div className="form-group"><label>简介</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="简要描述这本书的内容..." rows={3} /></div>
      </div>
      {result?.error && <div className="upload-error">{result.error}</div>}
      <button type="submit" className="btn btn-primary btn-lg upload-submit" disabled={!file || !title || !author || uploading}>{uploading ? "上传解析中..." : "上传并解析"}</button>
    </form>
  );
}
