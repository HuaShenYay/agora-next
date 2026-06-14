// ====================
// AI 客户端：OpenAI 兼容 chat completions
// 兼容 OpenAI 官方 / DeepSeek / 豆包 / Moonshot / Ollama(/v1)
// ====================

export type AIErrorKind =
  | "NO_KEY"
  | "TIMEOUT"
  | "RATE_LIMIT"
  | "QUOTA"
  | "REMOTE"
  | "NETWORK"
  | "PARSE";

export class AIError extends Error {
  kind: AIErrorKind;
  status?: number;
  detail?: string;
  constructor(kind: AIErrorKind, message: string, opts?: { status?: number; detail?: string }) {
    super(message);
    this.name = "AIError";
    this.kind = kind;
    if (opts?.status !== undefined) this.status = opts.status;
    if (opts?.detail) this.detail = opts.detail;
  }
}

// ====================
// 环境变量
// ====================

function envStr(key: string, fallback = ""): string {
  return (process.env[key] ?? fallback).trim();
}

function envInt(key: string, fallback: number): number {
  const v = process.env[key];
  if (!v) return fallback;
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

const BASE_URL = envStr("OPENAI_BASE_URL", "https://api.openai.com/v1") || "https://api.openai.com/v1";
const API_KEY = envStr("OPENAI_API_KEY");
const MODEL = envStr("OPENAI_MODEL", "gpt-4o-mini") || "gpt-4o-mini";
const TIMEOUT_MS = envInt("OPENAI_TIMEOUT_MS", 60_000);

export const AI_CONFIG = { BASE_URL, MODEL, TIMEOUT_MS, HAS_KEY: !!API_KEY };

// ====================
// Chat completion
// ====================

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatOptions {
  messages: ChatMessage[];
  /** 强制 JSON 输出（OpenAI 走 response_format json_object；其他厂商用 prompt 约束） */
  jsonMode?: boolean;
  temperature?: number;
  maxTokens?: number;
  signal?: AbortSignal;
}

export async function chatCompletion(opts: ChatOptions): Promise<string> {
  if (!API_KEY) {
    throw new AIError("NO_KEY", "OPENAI_API_KEY 未配置");
  }
  const url = BASE_URL.replace(/\/+$/, "") + "/chat/completions";
  const body: Record<string, unknown> = {
    model: MODEL,
    messages: opts.messages,
    temperature: opts.temperature ?? 0.2,
  };
  if (opts.maxTokens) body.max_tokens = opts.maxTokens;
  if (opts.jsonMode) {
    // OpenAI 官方与多数国产兼容
    body.response_format = { type: "json_object" };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const signal = mergeSignals(opts.signal, controller.signal);

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(body),
      signal,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("AbortError")) {
      throw new AIError("TIMEOUT", `AI 请求超时（>${TIMEOUT_MS}ms）`);
    }
    throw new AIError("NETWORK", `AI 网络错误: ${msg}`);
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    if (res.status === 401 || res.status === 403) {
      throw new AIError("NO_KEY", `AI 鉴权失败: HTTP ${res.status}`, { status: res.status, detail: text });
    }
    if (res.status === 429) {
      throw new AIError("RATE_LIMIT", "AI 频率受限", { status: res.status, detail: text });
    }
    if (res.status === 402 || res.status === 403 && text.includes("quota")) {
      throw new AIError("QUOTA", "AI 额度已用尽", { status: res.status, detail: text });
    }
    throw new AIError("REMOTE", `AI 业务错误: HTTP ${res.status}`, { status: res.status, detail: text });
  }

  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = json.choices?.[0]?.message?.content;
  if (!content) {
    throw new AIError("PARSE", "AI 返回内容为空", { detail: JSON.stringify(json).slice(0, 500) });
  }
  return content;
}

// ====================
// 工具
// ====================

function mergeSignals(a?: AbortSignal, b?: AbortSignal): AbortSignal | undefined {
  if (!a) return b;
  if (!b) return a;
  if (a.aborted) return a;
  if (b.aborted) return b;
  const ctrl = new AbortController();
  const onA = () => ctrl.abort(a.reason);
  const onB = () => ctrl.abort(b.reason);
  a.addEventListener("abort", onA, { once: true });
  b.addEventListener("abort", onB, { once: true });
  return ctrl.signal;
}

/** 截断 markdown 防止 prompt 超长 */
export function clipMarkdown(md: string, maxChars = 20_000): string {
  if (md.length <= maxChars) return md;
  // 优先保留前 70% + 后 30%（头尾通常含摘要/结论）
  const head = Math.floor(maxChars * 0.7);
  const tail = maxChars - head;
  return md.slice(0, head) + "\n\n[... 内容已截断 ...]\n\n" + md.slice(-tail);
}
