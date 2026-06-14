// ====================
// Supabase server client（基于 @supabase/ssr）
// 在 server components / server actions / route handlers 内使用
// 读 cookie 拿 session
// ====================

import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function getSupabaseServer() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.SUPABASE_URL ?? "",
    process.env.SUPABASE_ANON_KEY ?? "",
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options as CookieOptions);
            });
          } catch {
            // server component 内 set 会抛错，忽略即可（middleware 会写）
          }
        },
      },
    },
  );
}
