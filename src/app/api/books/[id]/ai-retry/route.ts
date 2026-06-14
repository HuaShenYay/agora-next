// ====================
// POST /api/books/[id]/ai-retry
// 详情页「AI 失败 · 重试」按钮调用
// ====================

import { NextRequest, NextResponse } from "next/server";
import { retryEnrichJob } from "@/lib/services/ai-enrich";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  retryEnrichJob(id);
  return NextResponse.json({ success: true, bookId: id, status: "pending" });
}
