// ====================
// Proxy（Next.js 16 新约定；旧名 middleware）
// 1. 刷 session cookie + 已登录用户访问 /login 或 /signup 自动跳到 /books
// 2. API 基础速率限制
// ====================

import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

// ====================
// 速率限制
// ====================

const RATE_LIMITS: Record<string, { windowMs: number; max: number }> = {
  "/api/greeting": { windowMs: 60_000, max: 3 },
  "/api/upload": { windowMs: 60_000, max: 5 },
  "/api/books": { windowMs: 60_000, max: 60 },
};

const buckets = new Map<string, { count: number; resetAt: number }>();

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

function checkRateLimit(req: NextRequest): NextResponse | null {
  const { pathname } = req.nextUrl;
  const matchRoute = Object.keys(RATE_LIMITS).find((r) => pathname.startsWith(r));
  if (!matchRoute) return null;

  const limit = RATE_LIMITS[matchRoute];
  const ip = getClientIp(req);
  const key = `${matchRoute}:${ip}`;
  const now = Date.now();

  let bucket = buckets.get(key);
  if (!bucket || now >= bucket.resetAt) {
    bucket = { count: 0, resetAt: now + limit.windowMs };
    buckets.set(key, bucket);
  }

  bucket.count++;
  if (bucket.count > limit.max) {
    return NextResponse.json(
      { error: "请求过于频繁，请稍后再试" },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((bucket.resetAt - now) / 1000)),
        },
      },
    );
  }
  return null;
}

// ====================
// 主 proxy 函数
// ====================

export async function proxy(request: NextRequest) {
  // API 速率限制
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const rateLimited = checkRateLimit(request);
    if (rateLimited) return rateLimited;
    return NextResponse.next();
  }

  // Auth: 刷 session cookie
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
    "/((?!_next/static|_next/image|favicon.ico|fonts).*)",
  ],
};
