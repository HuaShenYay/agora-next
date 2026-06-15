"use client";
import { useState } from "react";
import { LANGUAGES } from "@/lib/utils/constants";

type Stage = "idle" | "uploading" | "fallback" | "success" | "error";

interface FallbackInfo {
  bookId: string;
  cacheKey: string;
  error: { kind: string; message: string; detail?: string };
  localPreview?: { chars: number };
}

export default function BookUploadForm() {
  const [file, setFile] = useState<File | null>(null);
  // 用户只填 1) 书名（必填作为兜底） 2) 简介（可选，作为 AI 抽不到时的兜底）
  // 原书名 / 原作者 / 分类 / 子标签 全部交给 AI 异步跑
  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState("en");
  const [description, setDescription] = useState("");
  const [stage, setStage] = useState<Stage>("idle");
  const [progress, setProgress] = useState({ percent: 0, message: "" });
  const [result, setResult] = useState<{
    success?: boolean;
    bookId?: string;
    error?: string;
    extractedChars?: number;
    via?: string;
  } | null>(null);
  const [fallback, setFallback] = useState<FallbackInfo | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const submitFile = async (mode: "auto" | "mineru" | "local", cacheKey?: string) => {
    if (!file || !title) return;
    setStage("uploading");
    setProgress({ percent: 0, message: "准备中…" });
    setResult(null);

    try {
      const uploadPwd = typeof window !== "undefined" ? sessionStorage.getItem("upload_password") ?? "" : "";
      let res: Response;
      if (cacheKey) {
        res = await fetch(`/api/upload/${encodeURIComponent(file.name)}/resume`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-upload-password": uploadPwd },
          body: JSON.stringify({ cacheKey, mode }),
        });
      } else {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("title", title);
        fd.append("author", title); // 兆底字段：DB 非空，AI 会纠正
        fd.append("language", language);
        fd.append("description", description);
        fd.append("preferred", mode);
        res = await fetch("/api/upload", { method: "POST", headers: { "x-upload-password": uploadPwd }, body: fd });
      }

      const data = await res.json();

      if (data.stage === "success") {
        setStage("success");
        setProgress({ percent: 100, message: "上传成功 · AI 正在优化元数据" });
        setResult({
          success: true,
          bookId: data.bookId,
          extractedChars: data.extractedChars,
          via: data.via,
        });
        return;
      }

      if (data.stage === "mineru-failed") {
        setStage("fallback");
        setFallback({
          bookId: data.bookId,
          cacheKey: data.cacheKey,
          error: data.error,
          localPreview: data.localPreview,
        });
        return;
      }

      setStage("error");
      setResult({ error: data.error || "上传失败" });
    } catch {
      setStage("error");
      setResult({ error: "网络错误，请重试" });
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitFile("auto");
  };

  const onChooseRetryMineru = () => fallback && submitFile("mineru", fallback.cacheKey);
  const onChooseLocal = () => fallback && submitFile("local", fallback.cacheKey);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer?.files?.[0];
    if (dropped) {
      setFile(dropped);
      if (!title) setTitle(dropped.name.replace(/\.[^.]+$/, ""));
    }
  };

  const resetForm = () => {
    setStage("idle");
    setResult(null);
    setFallback(null);
    setProgress({ percent: 0, message: "" });
    setFile(null);
    setTitle("");
    setDescription("");
  };

  // ===== 成功 =====
  if (stage === "success" && result?.success) {
    return (
      <div className="upload-success">
        <div className="upload-success-icon">✓</div>
        <h3>上传成功</h3>
        <p>文字已提取并保存到书库。</p>
        <p className="upload-success-extracted">
          提取了 {result.extractedChars?.toLocaleString() ?? 0} 个字符
          {result.via && (
            <span className="upload-success-via">
              · 来源：{result.via === "mineru" ? "MinerU 精准解析" : "本地提取"}
            </span>
          )}
        </p>
        <p className="upload-success-ai-hint">
          AI 正在异步优化书名 / 作者 / 子分类 · 几秒后刷新详情页可见
        </p>
        <div className="upload-success-actions">
          <a href={`/books/${result.bookId}`} className="btn-pixel btn-pixel--primary">
            查看书籍
          </a>
          <button type="button" className="btn-pixel btn-pixel--outline" onClick={resetForm}>
            继续上传
          </button>
        </div>
      </div>
    );
  }

  // ===== 降级 =====
  if (stage === "fallback" && fallback) {
    return (
      <div className="upload-stage upload-stage--fallback">
        <div className="upload-stage-icon upload-stage-icon--warn">!</div>
        <h3 className="upload-stage-title">MinerU 解析失败</h3>
        <p className="upload-stage-msg">错误：<code>{fallback.error.message}</code></p>
        {fallback.error.detail && <p className="upload-stage-detail">{fallback.error.detail}</p>}
        <div className="upload-fallback-options">
          <div className="upload-fallback-option">
            <div className="upload-fallback-label">RETRY MINERU</div>
            <p>再次尝试 MinerU</p>
            <button type="button" className="btn-pixel btn-pixel--primary" onClick={onChooseRetryMineru}>
              重试 MinerU
            </button>
          </div>
          <div className="upload-fallback-divider">或</div>
          <div className="upload-fallback-option">
            <div className="upload-fallback-label">USE LOCAL</div>
            <p>
              用本地提取
              {fallback.localPreview && (
                <> · 约 {fallback.localPreview.chars.toLocaleString()} 字（无排版）</>
              )}
            </p>
            <button type="button" className="btn-pixel btn-pixel--outline" onClick={onChooseLocal}>
              用本地提取
            </button>
          </div>
        </div>
        <button type="button" className="upload-stage-cancel" onClick={resetForm}>
          取消 · 重新选择文件
        </button>
      </div>
    );
  }

  // ===== 初始 / 上传中 / 错误 =====
  return (
    <form className="upload-form" onSubmit={onSubmit}>
      <div
        className={`upload-dropzone ${dragOver ? "drag-over" : ""} ${file ? "has-file" : ""} ${stage === "uploading" ? "is-disabled" : ""}`}
        onDragOver={(e) => { if (stage !== "uploading") { e.preventDefault(); setDragOver(true); } }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".pdf,.epub,.txt,.md,.markdown,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) {
              setFile(f);
              if (!title) setTitle(f.name.replace(/\.[^.]+$/, ""));
            }
          }}
          className="upload-file-input"
          disabled={stage === "uploading"}
        />
        {file ? (
          <div className="upload-file-info">
            <span className="upload-file-icon">📄</span>
            <span className="upload-file-name">{file.name}</span>
            <span className="upload-file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
            {stage !== "uploading" && (
              <button type="button" className="upload-file-remove" onClick={() => setFile(null)}>✕</button>
            )}
          </div>
        ) : (
          <div className="upload-dropzone-hint">
            <span className="upload-drop-icon">⬆</span>
            <p>拖拽文件到此处，或点击选择</p>
            <span className="upload-drop-formats">
              支持 PDF · EPUB · DOCX · PPTX · TXT · Markdown（≤50MB）
            </span>
          </div>
        )}
      </div>

      <div className="upload-fields">
        <div className="form-row">
          <div className="form-group">
            <label>书名 *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="如：理想国 / The Republic"
              required
              disabled={stage === "uploading"}
            />
            <p className="form-hint">仅作为兜底字段，AI 会从正文自动提取并纠正</p>
          </div>
          <div className="form-group">
            <label>原文语言（AI 参考）</label>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} disabled={stage === "uploading"}>
              {Object.entries(LANGUAGES).map(([code, name]) => (
                <option key={code} value={code}>{name}</option>
              ))}
            </select>
            <p className="form-hint">AI 也会自动判断</p>
          </div>
        </div>
        <div className="form-group">
          <label>简介（可选 · 兜底）</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="AI 抽不到时使用，建议留空让 AI 写"
            rows={2}
            disabled={stage === "uploading"}
          />
        </div>
      </div>

      {stage === "uploading" && (
        <div className="upload-progress" role="status" aria-live="polite">
          <div className="upload-progress-head">
            <span className="upload-progress-stage">PARSING</span>
            <span className="upload-progress-pct">{progress.percent}%</span>
          </div>
          <div className="upload-progress-track">
            <div className="upload-progress-bar" style={{ width: `${progress.percent}%` }} />
          </div>
          <div className="upload-progress-msg">
            {progress.message || "提取中…"}
            <span className="upload-extracting-dot">…</span>
          </div>
          <p className="upload-progress-hint">
            提取完成后，AI 将异步优化书名 / 作者 / 子分类 · 详情页可见
          </p>
        </div>
      )}

      {stage === "error" && result?.error && <div className="upload-error">{result.error}</div>}

      {stage !== "uploading" && (
        <button type="submit" className="upload-submit" disabled={!file || !title}>
          上传到书库
        </button>
      )}
    </form>
  );
}
