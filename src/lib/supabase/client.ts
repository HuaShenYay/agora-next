// ====================
// Supabase 客户端封装 (Node.js / Next.js)
// ====================

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

function getEnv(key: string): string {
  return process.env[key] ?? "";
}

export function getSupabase(): SupabaseClient {
  if (_client) return _client;
  _client = createClient(
    getEnv("SUPABASE_URL"),
    getEnv("SUPABASE_ANON_KEY"),
  );
  return _client;
}
