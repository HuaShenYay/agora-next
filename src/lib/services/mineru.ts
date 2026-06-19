// ====================
// MinerU 精准解析 API 客户端（v4 批量上传流程）
// 文档：https://mineru.net/apiManage/docs
// 免费额度：每账号每天 1000 页最高优先级（超过降速，不一定停服）
// 限制：单文件 200MB / 200 页 / PDF/Word/PPT/Excel/图片/HTML
//
// 流程：
//   1. POST /api/v4/file-urls/batch  → 拿到 batch_id + file_urls[]
//   2. PUT 文件到 file_urls[0]（无需 Content-Type）
//   3. 系统自动检测上传完成并开始解析
//   4. GET /api/v4/extract-results/batch/{batch_id} 轮询
//   5. done 后从 full_zip_url 下载 zip，提取 full.md
//
// 超过 200 页时：自动分批，每批 ≤200 页，逐批处理并合并 markdown
// ====================

// ====================
// 错误分类
// ====================

export type MinerUErrorKind =
  | "NO_TOKEN"        // 未配置 MINERU_TOKEN
  | "NOT_SUPPORTED"   // 文件格式不在 MinerU 支持范围（EPUB / TXT / MD）
  | "TOO_LARGE"       // 文件大小 / 页数超限
  | "TIMEOUT"         // 任务超过总超时
  | "QUOTA_EXCEEDED"  // 每日额度用尽
  | "REMOTE"          // MinerU 服务端业务错误（4xx）
  | "NETWORK";        // 网络/解析/超时（fetch failed / 5xx）

export class MinerUError extends Error {
  kind: MinerUErrorKind;
  status?: number;
  detail?: string;
  constructor(kind: MinerUErrorKind, message: string, opts?: { status?: number; detail?: string }) {
    super(message);
    this.name = "MinerUError";
    this.kind = kind;
    if (opts?.status !== undefined) this.status = opts.status;
    if (opts?.detail) this.detail = opts.detail;
  }
}

// ====================
// 环境变量
// ====================

function envInt(key: string, fallback: number): number {
  const v = process.env[key];
  if (!v) return fallback;
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function getBaseUrl(): string {
  return (process.env.MINERU_BASE_URL || "https://mineru.net").replace(/\/+$/, "");
}

function getToken(): string {
  return (process.env.MINERU_TOKEN || "").trim();
}

const TIMEOUT_MS = envInt("MINERU_TIMEOUT_MS", 120_000);
const POLL_INTERVAL_MS = envInt("MINERU_POLL_INTERVAL_MS", 3_000);
const MAX_PAGES = envInt("MINERU_MAX_PAGES", 200);

export const MINERU_CONFIG = { TIMEOUT_MS, POLL_INTERVAL_MS, MAX_PAGES };

// ====================
// 适配：本地格式 → MinerU 支持格式
// ====================

const MINERU_MIME: Record<string, string> = {
  pdf: "application/pdf",
};

export function isMinerUSupported(format: string, sizeBytes: number): boolean {
  if (!getToken()) return false;
  if (!MINERU_MIME[format]) return false;
  if (sizeBytes > 200 * 1024 * 1024) return false;
  return true;
}

// ====================
// PDF 页数检测（用于决定是否分批）
// ====================

async function countPdfPages(fileData: Uint8Array): Promise<number> {
  try {
    const { getDocumentProxy } = await import("unpdf");
    const pdf = await getDocumentProxy(fileData);
    return pdf.numPages;
  } catch {
    // 无法检测页数，保守返回 201（走分批逻辑）
    return 201;
  }
}

// ====================
// Fetch 工具（带超时 + 重试）
// ====================

interface FetchOpts {
  timeoutMs?: number;
  retries?: number;
  body?: BodyInit;
  headers?: Record<string, string>;
  method?: string;
}

async function mineruFetch(path: string, opts: FetchOpts = {}): Promise<Response> {
  const token = getToken();
  if (!token) throw new MinerUError("NO_TOKEN", "MINERU_TOKEN 未配置");

  const url = getBaseUrl() + path;
  const timeoutMs = opts.timeoutMs ?? 30_000;
  const retries = opts.retries ?? 2;

  let lastErr: unknown = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const method = opts.method ?? (opts.body ? "POST" : "GET");
      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          ...(opts.body && method === "POST" ? { "Content-Type": "application/json" } : {}),
          ...(opts.headers ?? {}),
        },
        body: opts.body,
        signal: controller.signal,
      });
      clearTimeout(timer);

      // 5xx 重试
      if (res.status >= 500 && res.status <= 599 && attempt < retries) {
        lastErr = new Error(`HTTP ${res.status}`);
        await sleep(600 * Math.pow(2, attempt));
        continue;
      }
      return res;
    } catch (err) {
      clearTimeout(timer);
      lastErr = err;
      const isLast = attempt === retries;
      const msg = err instanceof Error ? err.message : String(err);
      const retryable =
        msg === "fetch failed" ||
        msg.includes("ECONNRESET") ||
        msg.includes("ETIMEDOUT") ||
        msg.includes("EAI_AGAIN") ||
        msg.includes("AbortError");
      if (!retryable || isLast) {
        throw new MinerUError("NETWORK", `MinerU 请求失败: ${msg}`);
      }
      await sleep(600 * Math.pow(2, attempt));
    }
  }
  throw new MinerUError("NETWORK", `MinerU 请求失败: ${lastErr instanceof Error ? lastErr.message : "unknown"}`);
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// ====================
// 1) 申请上传 URL（拿 batch_id + file_urls[]）
// ====================

interface ApplyUploadResp {
  code: number;
  msg?: string;
  data?: {
    batch_id?: string;
    file_urls?: string[];
  };
}

async function applyUploadUrls(
  filename: string,
  sizeBytes: number,
  pageRange?: string,
): Promise<{ batchId: string; urls: string[] }> {
  const res = await mineruFetch("/api/v4/file-urls/batch", {
    timeoutMs: 15_000,
    body: JSON.stringify({
      files: [
        {
          name: filename,
          is_ocr: true,
          ...(pageRange ? { page_ranges: pageRange } : {}),
        },
      ],
      model_version: "vlm",
      enable_formula: true,
      enable_table: true,
      language: "auto",
    }),
  });
  const json = (await res.json()) as ApplyUploadResp;
  if (json.code !== 0 || !json.data?.file_urls?.length || !json.data?.batch_id) {
    if (res.status === 401 || res.status === 403) {
      throw new MinerUError("NO_TOKEN", `鉴权失败: ${json.msg ?? res.status}`, {
        status: res.status,
        detail: json.msg,
      });
    }
    if (res.status === 429) {
      throw new MinerUError("QUOTA_EXCEEDED", `今日额度用尽: ${json.msg ?? ""}`, {
        status: res.status,
        detail: json.msg,
      });
    }
    throw new MinerUError("REMOTE", `申请上传链接失败: ${json.msg ?? res.status}`, {
      status: res.status,
      detail: json.msg,
    });
  }
  return {
    batchId: json.data.batch_id,
    urls: json.data.file_urls,
  };
}

// ====================
// 2) 把文件 PUT 到 OSS（用签名 URL，无需 Content-Type）
// ====================

async function putToOss(uploadUrl: string, fileData: Uint8Array): Promise<void> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 60_000);
  try {
    // 签名 URL 已包含所有鉴权信息，不能加 Content-Type 否则签名不匹配 → 403
    // 每次用 Buffer.from 做独立副本，防止 fetch 消费 body 后 ArrayBuffer detach
    const body = Buffer.from(fileData);
    const res = await fetch(uploadUrl, {
      method: "PUT",
      body,
      signal: controller.signal,
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`OSS PUT 失败: HTTP ${res.status} ${body.slice(0, 200)}`);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("AbortError")) {
      throw new MinerUError("TIMEOUT", "OSS 上传超时");
    }
    throw new MinerUError("NETWORK", `OSS 上传失败: ${msg}`);
  } finally {
    clearTimeout(timer);
  }
}

// ====================
// 3) 轮询批量任务结果
// ====================

export type TaskState = "waiting-file" | "pending" | "running" | "converting" | "done" | "failed";

interface ExtractResultItem {
  file_name?: string;
  state?: TaskState;
  err_msg?: string;
  full_zip_url?: string;
  extract_progress?: {
    extracted_pages?: number;
    total_pages?: number;
    start_time?: string;
  };
}

interface BatchResultResp {
  code: number;
  msg?: string;
  data?: {
    batch_id?: string;
    extract_result?: ExtractResultItem[];
  };
}

export interface TaskResult {
  state: TaskState;
  progress: number; // 0-100
  zipUrl?: string;
  errMsg?: string;
  extractedPages?: number;
  totalPages?: number;
}

export async function pollTask(
  batchId: string,
  opts?: { signal?: AbortSignal; onProgress?: (p: TaskResult) => void },
): Promise<TaskResult> {
  const deadline = Date.now() + TIMEOUT_MS;
  let lastProgress = 0;
  while (Date.now() < deadline) {
    if (opts?.signal?.aborted) {
      throw new MinerUError("TIMEOUT", "轮询被中止");
    }
    const res = await mineruFetch(`/api/v4/extract-results/batch/${encodeURIComponent(batchId)}`, {
      timeoutMs: 15_000,
    });
    const json = (await res.json()) as BatchResultResp;
    if (json.code !== 0 || !json.data?.extract_result?.length) {
      throw new MinerUError("REMOTE", `查询任务失败: ${json.msg ?? res.status}`, {
        status: res.status,
        detail: json.msg,
      });
    }
    const item = json.data.extract_result[0]!;
    const state = (item.state ?? "pending") as TaskState;

    let progress = lastProgress;
    if (state === "waiting-file") progress = 5;
    else if (state === "pending") progress = 10;
    else if (state === "running" && item.extract_progress) {
      const { extracted_pages = 0, total_pages = 0 } = item.extract_progress;
      progress = total_pages > 0 ? Math.round((extracted_pages / total_pages) * 80) + 10 : 30;
    } else if (state === "converting") progress = 90;
    else if (state === "done") progress = 100;
    lastProgress = progress;

    const result: TaskResult = {
      state,
      progress,
      zipUrl: item.full_zip_url,
      errMsg: item.err_msg,
      extractedPages: item.extract_progress?.extracted_pages,
      totalPages: item.extract_progress?.total_pages,
    };
    opts?.onProgress?.(result);

    if (state === "done") return result;
    if (state === "failed") {
      throw new MinerUError("REMOTE", item.err_msg || "MinerU 解析失败", { detail: item.err_msg });
    }
    await sleep(POLL_INTERVAL_MS);
  }
  throw new MinerUError("TIMEOUT", `MinerU 任务超时（>${TIMEOUT_MS}ms）`);
}

// ====================
// 4) 下载 zip 并提取 full.md
// ====================

async function downloadAndExtractMarkdown(zipUrl: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30_000);
  try {
    const res = await fetch(zipUrl, { signal: controller.signal });
    if (!res.ok) {
      throw new Error(`下载 zip 失败: HTTP ${res.status}`);
    }
    const arrayBuffer = await res.arrayBuffer();
    const JSZip = (await import("jszip") as unknown as { default: typeof import("jszip") }).default;
    const zip = await JSZip.loadAsync(arrayBuffer);

    // 在 zip 中查找 full.md
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let mdFile: any = null;
    zip.forEach((relativePath: string, file: any) => {
      if (!file.dir && relativePath.endsWith("full.md")) {
        mdFile = file;
      }
    });

    if (!mdFile) {
      const entries: string[] = [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      zip.forEach((p: string, f: any) => { if (!f.dir) entries.push(p); });
      throw new MinerUError("REMOTE", `zip 中未找到 full.md，内容: ${entries.join(", ")}`);
    }

    const markdown: string = await mdFile.async("string");
    return markdown;
  } catch (err) {
    if (err instanceof MinerUError) throw err;
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("AbortError")) {
      throw new MinerUError("TIMEOUT", "下载解析结果超时");
    }
    throw new MinerUError("NETWORK", `下载解析结果失败: ${msg}`);
  } finally {
    clearTimeout(timer);
  }
}

// ====================
// 单批处理：上传 + 轮询 + 提取
// ====================

async function applyOneBatch(
  opts: ApplyOptions,
  pageRange: string,
  emit: (stage: string, progress: number, message?: string) => void,
): Promise<{ markdown: string; batchId: string }> {
  // 1) 申请上传链接
  const { batchId, urls } = await applyUploadUrls(opts.filename, opts.sizeBytes, pageRange);
  const uploadUrl = urls[0];
  if (!uploadUrl) throw new MinerUError("REMOTE", "MinerU 未返回上传 URL");

  // 2) PUT 文件到 OSS
  await putToOss(uploadUrl, opts.fileData);

  // 3) 轮询
  const result = await pollTask(batchId, {
    signal: opts.signal,
    onProgress: (r) => emit("parsing", r.progress, `MinerU 解析中（${r.progress}%）`),
  });

  // 4) 下载 zip 提取 full.md
  if (!result.zipUrl) {
    throw new MinerUError("REMOTE", "MinerU 任务完成但未返回结果下载链接");
  }
  const markdown = await downloadAndExtractMarkdown(result.zipUrl);
  return { markdown, batchId };
}

// ====================
// 顶层：apply() 一站式
// ≤200 页：单批处理
// >200 页：自动分批，逐批上传+解析，合并 markdown
// ====================

export interface ApplyOptions {
  filename: string;
  format: string;
  sizeBytes: number;
  fileData: Uint8Array;
  signal?: AbortSignal;
  onProgress?: (r: { stage: string; progress: number; message?: string }) => void;
}

export interface ApplyResult {
  markdown: string;
  taskId: string;
  totalPages?: number; // PDF 总页数（可选，供前端展示）
}

export async function apply(opts: ApplyOptions): Promise<ApplyResult> {
  const token = getToken();
  if (!token) {
    throw new MinerUError("NO_TOKEN", "MINERU_TOKEN 未配置，无法使用 MinerU");
  }
  if (!MINERU_MIME[opts.format]) {
    throw new MinerUError("NOT_SUPPORTED", `MinerU 不支持格式: ${opts.format}`);
  }
  if (opts.sizeBytes > 200 * 1024 * 1024) {
    throw new MinerUError("TOO_LARGE", `文件超过 MinerU 200MB 上限`);
  }

  // 稳定副本：fetch 消费 body 后 ArrayBuffer 会 detach，分批时需多次读取
  const stableData = Buffer.from(opts.fileData);

  const emit = (stage: string, progress: number, message?: string) =>
    opts.onProgress?.({ stage, progress, message });

  // ---- 检测 PDF 页数 ----
  emit("counting", 2, "正在检测页数");
  const totalPages = await countPdfPages(stableData);

  const batchOpts = { ...opts, fileData: stableData };

  // ---- ≤ 200 页：单批 ----
  if (totalPages <= MAX_PAGES) {
    emit("uploading", 5, `共 ${totalPages} 页，单批处理`);
    const pageRange = `1-${totalPages}`;
    const { markdown, batchId } = await applyOneBatch(batchOpts, pageRange, (s, p, m) => {
      emit(s, 5 + Math.round(p * 0.9), m);
    });
    emit("done", 100, "解析完成");
    return { markdown, taskId: batchId, totalPages };
  }

  // ---- > 200 页：分批 ----
  const batchCount = Math.ceil(totalPages / MAX_PAGES);
  emit("uploading", 3, `共 ${totalPages} 页，分 ${batchCount} 批处理`);

  const parts: string[] = [];
  let lastBatchId = "";

  for (let i = 0; i < batchCount; i++) {
    const start = i * MAX_PAGES + 1;
    const end = Math.min((i + 1) * MAX_PAGES, totalPages);
    const pageRange = `${start}-${end}`;
    const batchLabel = `第 ${i + 1}/${batchCount} 批（第 ${start}-${end} 页）`;

    emit("parsing", Math.round((i / batchCount) * 100), `${batchLabel} 开始`);

    const { markdown, batchId } = await applyOneBatch(batchOpts, pageRange, (s, p, m) => {
      const batchBase = Math.round((i / batchCount) * 100);
      const batchWeight = 100 / batchCount;
      const globalProgress = Math.min(99, Math.round(batchBase + (p / 100) * batchWeight));
      emit(s, globalProgress, m ? `${batchLabel}：${m}` : batchLabel);
    });

    if (markdown.trim()) {
      parts.push(markdown.trim());
    }
    lastBatchId = batchId;

    emit("parsing", Math.round(((i + 1) / batchCount) * 100), `${batchLabel} 完成`);
  }

  const mergedMarkdown = parts.join("\n\n---\n\n");
  emit("done", 100, `全部 ${batchCount} 批解析完成（共 ${totalPages} 页）`);

  return { markdown: mergedMarkdown, taskId: lastBatchId, totalPages };
}
