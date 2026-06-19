// ====================
// GET /api/books/[id]/ai-status
// 详情页轮询 AI 优化状态
// 优先读进程内 jobs（实时），否则读 DB
// ====================

import { NextRequest, NextResponse } from "next/server";
import { getEnrichStatus } from "@/lib/services/ai-enrich";
import { getSupabase } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // 1) 进程内最新进度
    const live = getEnrichStatus(id);
    if (live) {
      return NextResponse.json(live);
    }

    // 2) DB 兜底（任务结束 / 跨进程）
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("books")
      .select("ai_status, ai_metadata, ai_error, ai_updated_at")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "书籍不存在" }, { status: 404 });
    }

    return NextResponse.json({
      bookId: id,
      status: (data.ai_status ?? "idle") as string,
      stage: (data.ai_status === "done" ? "done" : data.ai_status === "failed" ? "failed" : "queued") as string,
      message: data.ai_status === "done" ? "AI 优化完成" : data.ai_status === "failed" ? "AI 优化失败" : "等待中",
      error: data.ai_error ?? undefined,
      finishedAt: data.ai_updated_at ? new Date(data.ai_updated_at).getTime() : undefined,
      result: data.ai_metadata ?? null,
    });
  } catch (err) {
    console.error("[api/books/[id]/ai-status] error:", err);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
