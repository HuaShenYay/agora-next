// ====================
// POST /api/upload/[id]/resume
// 当 MinerU 失败后，前端用这个端点让用户选「重试 MinerU / 用本地提取」
// Body: { cacheKey: string, mode: 'retry-mineru' | 'use-local' }
// ====================

import { NextRequest, NextResponse } from "next/server";
import { resumeUpload } from "@/lib/services/file-upload";

export const maxDuration = 180;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: bookId } = await params;
  let body: { cacheKey?: string; mode?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "无效的请求体" }, { status: 400 });
  }

  const { cacheKey, mode } = body;
  if (!cacheKey) {
    return NextResponse.json({ error: "缺少 cacheKey" }, { status: 400 });
  }
  if (mode !== "retry-mineru" && mode !== "use-local") {
    return NextResponse.json({ error: "mode 必须是 retry-mineru 或 use-local" }, { status: 400 });
  }

  try {
    const result = await resumeUpload({
      cacheKey,
      mode,
    });

    if (result.stage === "error") {
      return NextResponse.json({ error: result.error.message }, { status: 400 });
    }
    if (result.stage === "success") {
      return NextResponse.json({
        success: true,
        stage: "success",
        bookId: result.book.id,
        book: result.book,
        extractedChars: result.extractedChars,
        via: result.via,
      });
    }
    if (result.stage === "mineru-failed") {
      return NextResponse.json(
        {
          success: false,
          stage: "mineru-failed",
          bookId: result.bookId,
          cacheKey: result.cacheKey,
          error: result.error,
          localPreview: result.localPreview,
        },
        { status: 200 },
      );
    }
    return NextResponse.json({ error: "未知的 resume 状态" }, { status: 500 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "resume 失败";
    console.error("[api/upload/resume] error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
