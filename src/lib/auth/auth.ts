// ====================
// Cookie-based 演示账号鉴权
// ====================

import type { User } from "@/lib/utils/types";
import { getUserById } from "@/lib/db/users";
import { cookies } from "next/headers";

const COOKIE_NAME = "agora_user";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// Route Handler 通用版本（从 Request header 读取）
export function getCurrentUser(req: Request): User | null {
  const cookie = req.headers.get("cookie") ?? "";
  const match = cookie.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  if (!match) return null;
  return getUserById(decodeURIComponent(match[1])) ?? null;
}

// Server Component 版本（使用 next/headers）
export async function getCurrentUserServer(): Promise<User | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(COOKIE_NAME)?.value;
  if (!value) return null;
  return getUserById(decodeURIComponent(value)) ?? null;
}

export function setUserCookie(userId: string): string {
  return `${COOKIE_NAME}=${encodeURIComponent(userId)}; Path=/; Max-Age=${COOKIE_MAX_AGE}; HttpOnly; SameSite=Lax`;
}

export function clearUserCookie(): string {
  return `${COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`;
}

export function requireAuth(req: Request): User {
  const user = getCurrentUser(req);
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export function requireAdmin(req: Request): User {
  const user = requireAuth(req);
  if (user.role !== "admin") {
    throw new Error("Forbidden");
  }
  return user;
}
