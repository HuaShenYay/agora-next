// ====================
// Supabase 客户端封装 (Node.js / Next.js)
// 带 fetch 重试 + 超时，缓解到 Supabase (Cloudflare CDN) 的网络抖动
// ====================

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

function getEnv(key: string): string {
  return process.env[key] ?? "";
}

// ====================
// 1. 带超时 + 指数退避的 fetch
// 网络层瞬时失败（fetch failed / socket hang up / ECONNRESET）会被自动重试
// 4xx / 5xx 业务错误不重试，由调用方处理
// ====================

const DEFAULT_TIMEOUT_MS = 25_000;
const MAX_RETRIES = 4;
const BASE_DELAY_MS = 600;

function isRetryable(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const name = err.name || "";
  const msg = err.message || "";
  if (
    name === "AbortError" ||
    msg === "fetch failed" ||
    msg === "socket hang up" ||
    msg.includes("ECONNRESET") ||
    msg.includes("ETIMEDOUT") ||
    msg.includes("EAI_AGAIN") ||
    msg.includes("ENOTFOUND") ||
    msg.includes("UND_ERR_SOCKET") ||
    msg.includes("network")
  ) {
    return true;
  }
  return false;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function createRetryingFetch(timeoutMs: number = DEFAULT_TIMEOUT_MS) {
  return async function fetchWithRetry(
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> {
    let lastErr: unknown;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        // 把外部 signal 与我们的超时 controller 合并
        const mergedInit: RequestInit = {
          ...init,
          signal: init?.signal
            ? mergeSignals(init.signal, controller.signal)
            : controller.signal,
        };
        const res = await fetch(input, mergedInit);
        clearTimeout(timer);
        // 5xx 才重试；4xx 是业务错误，透传上去让调用方处理
        if (res.status >= 500 && res.status <= 599 && attempt < MAX_RETRIES) {
          lastErr = new Error(`HTTP ${res.status} from Supabase`);
          const delay = BASE_DELAY_MS * Math.pow(2, attempt) + Math.random() * 200;
          await sleep(delay);
          continue;
        }
        return res;
      } catch (err) {
        clearTimeout(timer);
        lastErr = err;
        if (!isRetryable(err) || attempt === MAX_RETRIES) {
          // 不可重试或已用尽最后一次
          const reason =
            err instanceof Error
              ? `${err.name}: ${err.message}`
              : String(err);
          throw new Error(
            `[supabase] fetch failed after ${attempt + 1} attempt(s): ${reason}`,
          );
        }
        const delay = BASE_DELAY_MS * Math.pow(2, attempt) + Math.random() * 200;
        await sleep(delay);
      }
    }
    // 走到这里说明全部 5xx 走完，抛出最后一次
    const reason =
      lastErr instanceof Error
        ? `${lastErr.name}: ${lastErr.message}`
        : String(lastErr);
    throw new Error(`[supabase] fetch failed: ${reason}`);
  };
}

function mergeSignals(a: AbortSignal, b: AbortSignal): AbortSignal {
  if (a.aborted) return a;
  if (b.aborted) return b;
  const ctrl = new AbortController();
  const onA = () => ctrl.abort(a.reason);
  const onB = () => ctrl.abort(b.reason);
  a.addEventListener("abort", onA, { once: true });
  b.addEventListener("abort", onB, { once: true });
  return ctrl.signal;
}

// ====================
// 2. Supabase 客户端（单例）
// ====================

export function getSupabase(): SupabaseClient {
  if (_client) return _client;
  const url = getEnv("SUPABASE_URL");
  const key = getEnv("SUPABASE_ANON_KEY");
  if (!url || !key) {
    throw new Error(
      `[supabase] env missing: SUPABASE_URL=${!!url} SUPABASE_ANON_KEY=${!!key}`,
    );
  }
  _client = createClient(url, key, {
    global: {
      fetch: createRetryingFetch(),
    },
    auth: {
      // 上传接口是 server-side 走 service role 时也用同一个 client，避免双实例
      persistSession: false,
      autoRefreshToken: false,
    },
  });
  return _client;
}
