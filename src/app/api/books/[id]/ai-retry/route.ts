// ====================
// POST /api/books/[id]/ai-retry
// 详情页「AI 失败 · 重试」按钮调用
// 需要上传密码鉴权
// ====================

import { NextRequest, NextResponse } from "next/server";
import { retryEnrichJob } from "@/lib/services/ai-enrich";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // 鉴权：复用上传密码
  const uploadPassword = process.env.UPLOAD_PASSWORD;
  if (!uploadPassword) {
    return NextResponse.json({ error: "功能已关闭" }, { status: 403 });
  }
  const authHeader = request.headers.get("x-upload-password");
  if (authHeader !== uploadPassword) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const { id } = await params;
  retryEnrichJob(id);
  return NextResponse.json({ success: true, bookId: id, status: "pending" });
}
