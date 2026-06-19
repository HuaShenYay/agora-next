// ====================
// 文件上传服务（状态机版本）
// 流程：parseStage 决定走 MinerU 还是本地 → 提取 → 入库
// MinerU 失败时：返回 mineru-failed 阶段，附带错误，前端决定重试 / 降级
// ====================

import { saveBook } from "@/lib/db/books";
import {
  decideExtractPath,
  extractLocal,
  extractViaMinerU,
} from "@/lib/services/text-extract";
import { MinerUError } from "@/lib/services/mineru";
import { detectFormat, validateFile } from "@/lib/utils/upload-utils";
import type { Book } from "@/lib/utils/types";
import { getSupabaseServer } from "@/lib/supabase/server";

export type ExtractStage =
  | "pending"        // 初始：等待客户端选择
  | "mineru-pending" // MinerU 任务已提交，前端开始轮询
  | "mineru-failed"  // MinerU 失败，前端决定重试 / 降级
  | "processing"     // 本地提取中
  | "success"        // 入库成功
  | "error";         // 业务错误（无法重试）

export interface ProgressEvent {
  stage: string;
  progress: number; // 0-100
  message?: string;
}

export interface UploadMetadata {
  title: string;
  titleOriginal?: string;
  author: string;
  description?: string;
  language: string;
}

export interface UploadSuccess {
  stage: "success";
  book: Book;
  extractedChars: number;
  via: "mineru" | "local";
}

export interface MineruPending {
  stage: "mineru-pending";
  // 客户端拿到这个后开始轮询 /api/upload/[bookId]/status?taskId=xxx
  bookId: string;
  taskId: string;
  fileDataBase64: string; // 临时存入服务端内存/缓存，轮询时复用
  meta: UploadMetadata;
  format: string;
  sizeBytes: number;
  filename: string;
  mimeType: string;
  // 注意：fileData 不直接传出（太大）。改用服务端缓存键。
  cacheKey: string;
}

export interface MineruFailed {
  stage: "mineru-failed";
  bookId: string;
  cacheKey: string;
  meta: UploadMetadata;
  format: string;
  sizeBytes: number;
  filename: string;
  mimeType: string;
  error: { kind: string; message: string; detail?: string };
  // 关键：本地提取的预演结果（可能成功），让前端能展示「如果降级会拿到什么」
  localPreview?: { chars: number };
}

export interface UploadError {
  stage: "error";
  error: { message: string };
}

export type UploadResult = UploadSuccess | MineruPending | MineruFailed | UploadError;

// ====================
// 内存缓存：MinerU 任务期间临时存 fileData
// 30 分钟后自动过期；token 限流；大小限制 200MB
// ====================

const MAX_CACHE_ENTRIES = 10;
const CACHE_TTL_MS = 30 * 60 * 1000;

interface CacheEntry {
  bookId: string;
  meta: UploadMetadata;
  format: string;
  sizeBytes: number;
  filename: string;
  mimeType: string;
  fileData: Uint8Array;
  taskId?: string;
  createdAt: number;
}

const cache = new Map<string, CacheEntry>();

function putCache(key: string, entry: CacheEntry): void {
  if (cache.size >= MAX_CACHE_ENTRIES) {
    // 删最旧的
    const oldest = [...cache.entries()].sort((a, b) => a[1].createdAt - b[1].createdAt)[0];
    if (oldest) cache.delete(oldest[0]);
  }
  cache.set(key, entry);
}

function getCache(key: string): CacheEntry | null {
  const e = cache.get(key);
  if (!e) return null;
  if (Date.now() - e.createdAt > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return e;
}

function delCache(key: string): void {
  cache.delete(key);
}

// 定期清理
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of cache.entries()) {
    if (now - v.createdAt > CACHE_TTL_MS) cache.delete(k);
  }
}, 5 * 60 * 1000).unref?.();

// ====================
// 步骤 1: 提交（POST /api/upload 调用）
// ====================

export interface ProcessUploadInput {
  fileData: Uint8Array;
  filename: string;
  mimeType: string;
  meta: UploadMetadata;
  /** "mineru" 走精准 API；"local" 强制本地；"auto" 自动决定 */
  preferred?: "mineru" | "local" | "auto";
  onProgress?: (e: ProgressEvent) => void;
}

export async function processUpload(input: ProcessUploadInput): Promise<UploadResult> {
  const { fileData, filename, mimeType, meta, preferred = "auto", onProgress } = input;

  let format: string;
  try {
    format = detectFormat(mimeType, filename);
    validateFile(fileData, format as never);
  } catch (err) {
    return {
      stage: "error",
      error: { message: err instanceof Error ? err.message : "文件格式错误" },
    };
  }

  // 非 MinerU 支持格式 → 直接本地
  if (preferred === "local" || decideExtractPath(format as never, fileData.byteLength).via === "local" || preferred === "auto" && !["pdf"].includes(format)) {
    return runLocal(fileData, format as never, meta, filename, mimeType, onProgress);
  }

  // MinerU 路径：先在服务端跑提交 + 短轮询；客户端再长轮询
  return startMineru(fileData, format, meta, filename, mimeType, onProgress);
}

// ====================
// 路径 A: 本地（同步完成）
// ====================

async function runLocal(
  fileData: Uint8Array,
  format: "pdf" | "epub" | "txt" | "markdown",
  meta: UploadMetadata,
  filename: string,
  mimeType: string,
  onProgress?: (e: ProgressEvent) => void,
): Promise<UploadResult> {
  onProgress?.({ stage: "processing", progress: 50, message: "本地提取中…" });
  let contentMarkdown: string;
  try {
    contentMarkdown = await extractLocal(fileData, format);
  } catch (err) {
    return {
      stage: "error",
      error: { message: err instanceof Error ? err.message : "本地提取失败" },
    };
  }
  if (!contentMarkdown || contentMarkdown.trim().length === 0) {
    return {
      stage: "error",
      error: { message: "提取为空，请检查文件是否包含可读文本" },
    };
  }
  onProgress?.({ stage: "saving", progress: 85, message: "正在入库" });
  const result = await persistBook({
    fileData,
    filename,
    mimeType,
    meta,
    contentMarkdown,
  });
  onProgress?.({ stage: "done", progress: 100 });
  return result;
}

// ====================
// 路径 B: MinerU（异步）
// ====================

async function startMineru(
  fileData: Uint8Array,
  format: string,
  meta: UploadMetadata,
  filename: string,
  mimeType: string,
  onProgress?: (e: ProgressEvent) => void,
): Promise<UploadResult> {
  const bookId = crypto.randomUUID();
  const cacheKey = `${bookId}.${Date.now()}`;

  // 缓存 fileData
  putCache(cacheKey, {
    bookId,
    meta,
    format,
    sizeBytes: fileData.byteLength,
    filename,
    mimeType,
    fileData,
    createdAt: Date.now(),
  });

  let taskId: string;
  try {
    onProgress?.({ stage: "mineru-uploading", progress: 5, message: "正在提交到 MinerU" });
    const { apply } = await import("./mineru");
    const r = await apply({
      filename,
      format,
      sizeBytes: fileData.byteLength,
      fileData,
      onProgress: (p) => onProgress?.({
        stage: p.stage,
        progress: p.progress,
        message: p.message,
      }),
    });
    taskId = r.taskId;

    // 成功路径：直接持久化
    onProgress?.({ stage: "saving", progress: 95, message: "正在入库" });
    const cached = getCache(cacheKey);
    if (!cached) {
      return {
        stage: "error",
        error: { message: "内部缓存失效，请重试" },
      };
    }
    const result = await persistBook({
      fileData: cached.fileData,
      filename,
      mimeType,
      meta,
      contentMarkdown: r.markdown,
    });
    delCache(cacheKey);
    onProgress?.({ stage: "done", progress: 100 });
    return result;
  } catch (err) {
    if (err instanceof MinerUError) {
      // 失败：保留缓存 + 返回 fallback 决定权
      onProgress?.({ stage: "mineru-failed", progress: 0, message: err.message });
      // 尝试本地预演（PDF 走 unpdf），让前端能展示降级预览
      let localPreview: { chars: number } | undefined;
      if (format === "pdf") {
        try {
          const md = await extractLocal(fileData, "pdf");
          localPreview = { chars: md.length };
        } catch {
          localPreview = undefined;
        }
      }
      return {
        stage: "mineru-failed",
        bookId,
        cacheKey,
        meta,
        format,
        sizeBytes: fileData.byteLength,
        filename,
        mimeType,
        error: { kind: err.kind, message: err.message, detail: err.detail },
        localPreview,
      };
    }
    return {
      stage: "error",
      error: { message: err instanceof Error ? err.message : "未知错误" },
    };
  }
}

// ====================
// 步骤 2: resume 模式
// 给 GET /api/upload/[bookId]/resume 复用
// ====================

export type ResumeMode = "retry-mineru" | "use-local";

export interface ResumeInput {
  cacheKey: string;
  mode: ResumeMode;
  onProgress?: (e: ProgressEvent) => void;
}

export async function resumeUpload(input: ResumeInput): Promise<UploadResult> {
  const entry = getCache(input.cacheKey);
  if (!entry) {
    return { stage: "error", error: { message: "上传会话已过期（30 分钟），请重新上传文件" } };
  }
  if (input.mode === "use-local") {
    const r = await runLocal(entry.fileData, entry.format as never, entry.meta, entry.filename, entry.mimeType, input.onProgress);
    if ("stage" in r && r.stage === "success") delCache(input.cacheKey);
    return r;
  }
  // retry-mineru
  const r = await startMineru(entry.fileData, entry.format, entry.meta, entry.filename, entry.mimeType, input.onProgress);
  if ("stage" in r && r.stage === "success") delCache(input.cacheKey);
  return r;
}

// ====================
// 持久化
// ====================

interface PersistInput {
  fileData: Uint8Array;
  filename: string;
  mimeType: string;
  meta: UploadMetadata;
  contentMarkdown: string;
}

async function persistBook(input: PersistInput): Promise<UploadSuccess> {
  const bookId = crypto.randomUUID();
  const now = new Date().toISOString();

  // 读取当前登录用户（异步但 inline：auth.getUser 走 cookie 读 session）
  let uploaderId = "anonymous";
  try {
    const supabase = await getSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id) uploaderId = user.id;
  } catch {
    // 未登录或 cookie 解析失败 → 兜底 anonymous
  }

  const book: Book = {
    id: bookId,
    title: input.meta.title,
    titleOriginal: input.meta.titleOriginal ?? input.meta.title,
    author: input.meta.author,
    description: input.meta.description ?? "",
    format: "markdown", // 入库时统一为 markdown
    language: input.meta.language,
    categories: [],
    tags: [],
    chapterCount: 0,
    uploaderId,
    forkCount: 0,
    prCount: 0,
    mergedPrCount: 0,
    status: "active",
    classificationStatus: "pending",
    contentMarkdown: input.contentMarkdown,
    createdAt: now,
    updatedAt: now,
  };

  await saveBook(book, { sizeBytes: input.fileData.byteLength });

  // 入库成功后立刻异步触发 AI 富化（不阻塞响应）
  try {
    const { startEnrichJob } = await import("./ai-enrich");
    startEnrichJob(bookId);
  } catch {
    // ignore
  }

  return { stage: "success", book, extractedChars: input.contentMarkdown.length, via: "markdown" as never };
}
