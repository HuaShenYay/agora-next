// ====================
// Supabase Admin 客户端 — 使用 Service Role Key
// 仅在服务端使用，绕过 RLS（用于上传、AI 标注等写操作）
// ====================

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _admin: SupabaseClient | null = null;

export function getAdminSupabase(): SupabaseClient {
  if (_admin) return _admin;

  const url = process.env.SUPABASE_URL ?? "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

  if (!url || !key) {
    // 显式抛错：写操作必须有 service role key。
    // 不再静默回退到 anon 客户端——那会让所有写操作在 RLS 下静默失败，
    // 产生难以排查的坏数据。MVP 取舍：宁可不工作，不要静默坏数据。
    throw new Error(
      "[supabase] SUPABASE_SERVICE_ROLE_KEY 未设置。写操作（上传、AI 标注）需要它。请检查环境变量配置。",
    );
  }

  _admin = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
  return _admin;
}
