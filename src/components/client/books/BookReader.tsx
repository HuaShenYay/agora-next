"use client";
import { useEffect, useRef, useState } from "react";
import type { BookFormat } from "@/lib/utils/types";

interface Props {
  format: BookFormat;
  fileUrl: string;
}

type Status = "loading" | "ready" | "error";

export default function BookReader({ format, fileUrl }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [page, setPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [textContent, setTextContent] = useState("");

  // 加载 PDF 或纯文本
  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    setErrorMsg("");

    if (format === "pdf") {
      // 动态导入 pdfjs-dist 避免 SSR 报错
      (async () => {
        try {
          const pdfjs = await import("pdfjs-dist");
          // 设定 worker（CDN 路径）
          (pdfjs as unknown as { GlobalWorkerOptions: { workerSrc: string } }).GlobalWorkerOptions.workerSrc =
            `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

          const loadingTask = pdfjs.getDocument({ url: fileUrl });
          const pdf = await loadingTask.promise;
          if (cancelled) return;
          setNumPages(pdf.numPages);
          await renderPage(pdf, 1);
          if (!cancelled) setStatus("ready");
        } catch (err) {
          if (cancelled) return;
          setErrorMsg(err instanceof Error ? err.message : "PDF 加载失败");
          setStatus("error");
        }
      })();
    } else if (format === "txt" || format === "markdown") {
      fetch(fileUrl)
        .then((r) => r.text())
        .then((t) => { if (!cancelled) { setTextContent(t); setStatus("ready"); } })
        .catch((err) => { if (!cancelled) { setErrorMsg(String(err)); setStatus("error"); } });
    } else {
      setErrorMsg(`暂不支持在线阅读 ${format.toUpperCase()} 格式，请下载后用本地阅读器打开。`);
      setStatus("error");
    }

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [format, fileUrl]);

  // 翻页
  const renderPage = async (pdf: import("pdfjs-dist").PDFDocumentProxy, pageNumber: number) => {
    const pageObj = await pdf.getPage(pageNumber);
    const viewport = pageObj.getViewport({ scale: 1.4 });
    const container = containerRef.current;
    if (!container) return;
    container.innerHTML = "";
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    canvas.className = "pdf-page-canvas";
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    container.appendChild(canvas);
    await pageObj.render({ canvasContext: ctx, viewport, canvas }).promise;
  };

  const goPrev = async () => {
    if (page <= 1) return;
    const next = page - 1;
    setPage(next);
    const pdfjs = await import("pdfjs-dist");
    const pdf = await pdfjs.getDocument({ url: fileUrl }).promise;
    renderPage(pdf, next);
  };
  const goNext = async () => {
    if (page >= numPages) return;
    const next = page + 1;
    setPage(next);
    const pdfjs = await import("pdfjs-dist");
    const pdf = await pdfjs.getDocument({ url: fileUrl }).promise;
    renderPage(pdf, next);
  };

  return (
    <div className="book-reader">
      {format === "pdf" && status === "ready" && (
        <>
          <div className="book-reader-toolbar">
            <button type="button" className="btn btn-sm" onClick={goPrev} disabled={page <= 1}>上一页</button>
            <span className="page-indicator">第 {page} / {numPages} 页</span>
            <button type="button" className="btn btn-sm" onClick={goNext} disabled={page >= numPages}>下一页</button>
          </div>
          <div ref={containerRef} className="book-reader-canvas-wrap" />
        </>
      )}
      {(format === "txt" || format === "markdown") && status === "ready" && (
        <article className="book-reader-text">
          {format === "markdown" ? (
            <pre className="markdown-body">{textContent}</pre>
          ) : (
            textContent.split("\n").map((line, i) => <p key={i}>{line || "\u00a0"}</p>)
          )}
        </article>
      )}
      {status === "loading" && <div className="book-reader-status">加载中…</div>}
      {status === "error" && (
        <div className="book-reader-status error">
          <p>{errorMsg}</p>
          <a href={fileUrl} download className="btn btn-primary">下载原文件</a>
        </div>
      )}
    </div>
  );
}
