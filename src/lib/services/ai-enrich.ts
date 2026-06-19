// ====================
// AI 富化任务（异步）
// 入库后异步跑，状态写入 books.ai_status
// 进度用进程内 EventEmitter 广播，前端可轮询 GET /api/books/[id]/ai-status
// ====================

import { EventEmitter } from "node:events";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { chatCompletion, AIError } from "./ai";
import { parseEnrichResult, SYSTEM_PROMPT, USER_PROMPT_TEMPLATE } from "./ai-prompts";
import { getBook } from "@/lib/db/books";

/**
 * 只提取封面、目录和序言部分——元数据提取只需这部分，无需全文。
 * 策略：取前 5000 字符（封面+版权+目录+序言通常在此范围内），
 * 再查找第一个 "第一章/第1章/Chapter 1" 等正文标记截断。
 */
function extractFrontMatter(fullMd: string): string {
  const HEAD_CHARS = 5000;
  const head = fullMd.slice(0, HEAD_CHARS);

  // 常见正文开始标记（中文/英文书）
  const bodyPattern = /(?:^|\n)\s*(?:第[一二三四五六七八九十百零\d]+[章节篇部]|Chapter\s+\d+|PART\s+[IVX\d]+)\s/gi;
  const match = bodyPattern.exec(head);
  if (match && match.index > 200) {
    // 找到正文开头，截取到此处
    return head.slice(0, match.index).trim();
  }

  // 没找到明显分界，返回前 5000 字符
  return head.trim();
}

export type EnrichStatus = "idle" | "pending" | "done" | "failed";

export interface EnrichProgress {
  bookId: string;
  status: EnrichStatus;
  stage: "queued" | "reading" | "calling" | "parsing" | "writing" | "done" | "failed";
  message?: string;
  error?: string;
  startedAt: number;
  finishedAt?: number;
  result?: {
    title: string;
    author: string;
    description: string;
    shortDescription: string;
    categories: string[];
    subTags: string[];
    language: string;
  };
}

// ====================
// 进程内状态
// ====================

const bus = new EventEmitter();
bus.setMaxListeners(0);

const jobs = new Map<string, EnrichProgress>();

const TTL_MS = 60 * 60 * 1000; // 1 小时后清

setInterval(() => {
  const now = Date.now();
  for (const [k, v] of jobs.entries()) {
    if (v.finishedAt && now - v.finishedAt > TTL_MS) jobs.delete(k);
  }
}, 10 * 60 * 1000).unref?.();

export function getEnrichStatus(bookId: string): EnrichProgress | null {
  return jobs.get(bookId) ?? null;
}

function emit(p: EnrichProgress) {
  jobs.set(p.bookId, p);
  bus.emit(`enrich:${p.bookId}`, p);
  bus.emit("enrich:any", p);
}

async function updateBookAiStatus(
  bookId: string,
  patch: {
    ai_status?: EnrichStatus;
    ai_metadata?: Record<string, unknown> | null;
    ai_error?: string | null;
    ai_updated_at?: string;
  },
): Promise<void> {
  const supabase = getAdminSupabase();
  const { error } = await supabase
    .from("books")
    .update({ ...patch, ai_updated_at: patch.ai_updated_at ?? new Date().toISOString() })
    .eq("id", bookId);
  if (error) {
    throw new Error(`更新 books.ai_status 失败: ${error.message}`);
  }
}

// ====================
// 启动富化
// ====================

export function startEnrichJob(bookId: string): void {
  if (jobs.has(bookId)) return; // 已有任务在跑（内存级防重）

  // fire-and-forget（含 DB 防重）
  void runEnrichJob(bookId).catch((err) => {
    const msg = err instanceof Error ? err.message : String(err);
    emit({
      bookId,
      status: "failed",
      stage: "failed",
      error: msg,
      startedAt: Date.now(),
      finishedAt: Date.now(),
    });
  });
}

async function runEnrichJob(bookId: string): Promise<void> {
  const progress: EnrichProgress = {
    bookId,
    status: "pending",
    stage: "queued",
    startedAt: Date.now(),
  };
  emit(progress);

  const update = (patch: Partial<EnrichProgress>) => {
    Object.assign(progress, patch);
    emit(progress);
  };

  // ---- DB 防重：已成功识别过的书不再跑 ----
  update({ stage: "reading", message: "检查 AI 状态" });
  const supabase = getAdminSupabase();
  const { data: row } = await supabase
    .from("books")
    .select("ai_status, ai_metadata")
    .eq("id", bookId)
    .single();

  if (row?.ai_status === "done" && row?.ai_metadata) {
    // 已有成功的 AI 结果，直接跳过
    update({
      status: "done",
      stage: "done",
      message: "已识别，跳过重复调用",
      finishedAt: Date.now(),
    });
    return;
  }

  if (row?.ai_status === "pending") {
    // 另一个进程/实例正在处理
    update({
      status: "pending",
      stage: "queued",
      message: "任务已在处理中",
    });
    return;
  }

  // 1. 拉书籍内容（只取封面 + 目录 + 序言，无需全文）
  update({ stage: "reading", message: "读取书籍内容" });
  const book = await getBook(bookId);
  if (!book || !book.contentMarkdown) {
    throw new Error("书籍不存在或无 markdown 内容");
  }
  const md = extractFrontMatter(book.contentMarkdown);

  // 2. 调 AI
  update({ stage: "calling", message: "AI 解析中" });
  let result: ReturnType<typeof parseEnrichResult>;
  try {
    await updateBookAiStatus(bookId, { ai_status: "pending" });
    const raw = await chatCompletion({
      jsonMode: true,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: USER_PROMPT_TEMPLATE(md) },
      ],
    });
    update({ stage: "parsing", message: "解析 AI 返回" });
    result = parseEnrichResult(raw);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const kind = err instanceof AIError ? err.kind : "REMOTE";
    await updateBookAiStatus(bookId, {
      ai_status: "failed",
      ai_error: `${kind}: ${msg}`.slice(0, 1000),
    }).catch(() => undefined);
    throw err;
  }

  // 3. 写回
  update({ stage: "writing", message: "写入数据库" });
  await updateBookAiStatus(bookId, {
    ai_status: "done",
    ai_metadata: {
      title: result.title,
      author: result.author,
      description: result.description,
      shortDescription: result.shortDescription,
      categories: result.categories,
      subTags: result.subTags,
      language: result.language,
    },
  });

  update({
    status: "done",
    stage: "done",
    message: "AI 优化完成",
    finishedAt: Date.now(),
    result: result,
  });
}

// ====================
// 重试入口（详情页「AI 重试」按钮调用）
// ====================

export function retryEnrichJob(bookId: string): void {
  // 清旧任务，强制重启
  jobs.delete(bookId);
  // 立刻把 DB 状态清回 idle
  void updateBookAiStatus(bookId, {
    ai_status: "idle",
    ai_error: null,
  }).catch(() => undefined);
  startEnrichJob(bookId);
}
