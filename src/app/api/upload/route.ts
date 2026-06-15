// ====================
// POST /api/upload — 提交上传
// 流程：detectFormat → 走 MinerU 或本地 → 返回状态机结果
// 状态机：
//   success         → 前端跳转详情页
//   mineru-failed   → 前端展示「重试 MinerU / 用本地提取」两个按钮
//   error           → 前端展示错误
// ====================

import { NextRequest, NextResponse } from "next/server";
import { processUpload } from "@/lib/services/file-upload";

export const maxDuration = 180; // 3 分钟：MinerU 单本可能 1-2 分钟

export async function POST(request: NextRequest) {
  // 上传鉴权
  const uploadPassword = process.env.UPLOAD_PASSWORD;
  if (!uploadPassword) {
    return NextResponse.json({ error: "上传功能已关闭" }, { status: 403 });
  }
  const authHeader = request.headers.get("x-upload-password");
  if (authHeader !== uploadPassword) {
    return NextResponse.json({ error: "未授权：请提供上传密码" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const title = (formData.get("title") as string | null) ?? "";
  const titleOriginal = formData.get("titleOriginal") as string | null;
  const author = (formData.get("author") as string | null) ?? "";
  const description = formData.get("description") as string | null;
  const language = (formData.get("language") as string | null) ?? "en";
  const preferred = (formData.get("preferred") as string | null) ?? "auto";

  if (!file || !title || !author) {
    return NextResponse.json({ error: "缺少必填字段 (file/title/author)" }, { status: 400 });
  }

  try {
    const fileData = new Uint8Array(await file.arrayBuffer());
    const result = await processUpload({
      fileData,
      filename: file.name,
      mimeType: file.type,
      meta: {
        title,
        titleOriginal: titleOriginal ?? undefined,
        author,
        description: description ?? undefined,
        language,
      },
      preferred: (preferred === "mineru" || preferred === "local" ? preferred : "auto"),
    });

    // 状态机不同 → 不同 HTTP code
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
          meta: result.meta,
          format: result.format,
          sizeBytes: result.sizeBytes,
          filename: result.filename,
          error: result.error,
          localPreview: result.localPreview,
        },
        { status: 200 }, // 200 + stage，让前端能区分业务态
      );
    }
    return NextResponse.json({ error: "未知的上传状态" }, { status: 500 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "上传失败";
    const isNetwork =
      message.includes("fetch failed") ||
      message.includes("[supabase]") ||
      message.includes("ECONNRESET") ||
      message.includes("ETIMEDOUT") ||
      message.includes("AbortError");
    console.error("[api/upload] error:", message);
    return NextResponse.json(
      { error: message, retryable: isNetwork },
      { status: isNetwork ? 503 : 400 },
    );
  }
}
