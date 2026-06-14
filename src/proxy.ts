// ====================
// Proxy（Next.js 16 新约定；旧名 middleware）
// 刷 session cookie + 已登录用户访问 /login 或 /signup 自动跳到 /books
// ====================

import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options as CookieOptions);
          });
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();

  // 登录/注册页：已登录则跳到 /books
  if ((request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/signup") && user) {
    return NextResponse.redirect(new URL("/books", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * 匹配所有路径除了：
     * - _next/static, _next/image, favicon.ico
     * - 公共资源
     */
    "/((?!_next/static|_next/image|favicon.ico|fonts|api).*)",
  ],
};
