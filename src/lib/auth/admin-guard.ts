// ====================
// 管理员权限检查中间件
// ====================

import { NextResponse } from "next/server";
import type { User } from "@/lib/utils/types";
import { getCurrentUser } from "./auth";

export function requireAdminMiddleware(req: Request): User | NextResponse {
  const user = getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }
  if (user.role !== "admin") {
    return NextResponse.json({ error: "需要管理员权限" }, { status: 403 });
  }
  return user;
}
