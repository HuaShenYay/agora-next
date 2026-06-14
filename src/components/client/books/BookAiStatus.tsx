// ====================
// BookAiStatus — 详情页「AI 优化」面板
// 轮询 /api/books/[id]/ai-status · 失败可重试
// ====================

"use client";

import { useEffect, useRef, useState } from "react";

type Status = "idle" | "pending" | "done" | "failed";

interface ResultData {
  title?: string;
  author?: string;
  description?: string;
  shortDescription?: string;
  categories?: string[];
  subTags?: string[];
  language?: string;
}

interface State {
  status: Status;
  stage: string;
  message?: string;
  error?: string;
  result?: ResultData | null;
}

interface Props {
  bookId: string;
  initial: State;
}

export default function BookAiStatus({ bookId, initial }: Props) {
  const [state, setState] = useState<State>(initial);
  const [retrying, setRetrying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (state.status === "pending") {
      timerRef.current = setInterval(async () => {
        try {
          const res = await fetch(`/api/books/${bookId}/ai-status`);
          const data = await res.json();
          setState({
            status: (data.status ?? "idle") as Status,
            stage: data.stage ?? "queued",
            message: data.message,
            error: data.error,
            result: data.result,
          });
        } catch {
          // ignore
        }
      }, 2000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.status, bookId]);

  const onRetry = async () => {
    setRetrying(true);
    try {
      await fetch(`/api/books/${bookId}/ai-retry`, { method: "POST" });
      setState({ ...state, status: "pending", stage: "queued", message: "AI 重新优化中", error: undefined });
    } finally {
      setRetrying(false);
    }
  };

  if (state.status === "pending") {
    return (
      <div className="bd-ai bd-ai--pending">
        <div className="bd-ai-icon">⚙</div>
        <div className="bd-ai-title">AI 优化元数据中…</div>
        <div className="bd-ai-msg">{state.message ?? "从正文提取书名 / 作者 / 子分类"}<span className="bd-ai-dot">…</span></div>
        <div className="bd-ai-progress">
          <div className="bd-ai-progress-bar" />
        </div>
      </div>
    );
  }

  if (state.status === "failed") {
    return (
      <div className="bd-ai bd-ai--failed">
        <div className="bd-ai-icon">!</div>
        <div className="bd-ai-title">AI 优化失败</div>
        <div className="bd-ai-msg">{state.error ?? "未知错误"}</div>
        <button className="btn-pixel btn-pixel--outline" onClick={onRetry} disabled={retrying}>
          {retrying ? "重试中…" : "重试"}
        </button>
      </div>
    );
  }

  if (state.status === "done" && state.result) {
    return (
      <div className="bd-ai bd-ai--done">
        <div className="bd-ai-icon">✓</div>
        <div className="bd-ai-title">AI 已优化</div>
        {state.result.shortDescription && (
          <p className="bd-ai-short">{state.result.shortDescription}</p>
        )}
        {state.result.subTags && state.result.subTags.length > 0 && (
          <div className="bd-ai-subtags">
            <div className="bd-ai-subtags-head">SUB-TAGS</div>
            <div className="bd-ai-subtags-list">
              {state.result.subTags.map((t) => (
                <span key={t} className="bd-ai-subtag">{t}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // idle 状态：AI 还没启动（理论上不会发生，但兜底显示「启动中」）
  return (
    <div className="bd-ai bd-ai--idle">
      <div className="bd-ai-icon">○</div>
      <div className="bd-ai-title">AI 优化尚未启动</div>
    </div>
  );
}
