// ====================
// POST /api/upload — 文件上传（极简版）
// 不做章节拆分、不做 AI 分类，原文件存到 Supabase Storage
// ====================

import { NextRequest, NextResponse } from "next/server";
import { processUpload } from "@/lib/services/file-upload";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const title = (formData.get("title") as string | null) ?? "";
  const titleOriginal = formData.get("titleOriginal") as string | null;
  const author = (formData.get("author") as string | null) ?? "";
  const description = formData.get("description") as string | null;
  const language = (formData.get("language") as string | null) ?? "en";

  if (!file || !title || !author) {
    return NextResponse.json({ error: "缺少必填字段 (file/title/author)" }, { status: 400 });
  }

  try {
    const fileData = new Uint8Array(await file.arrayBuffer());
    const result = await processUpload(fileData, file.name, file.type, {
      title,
      titleOriginal: titleOriginal ?? undefined,
      author,
      description: description ?? undefined,
      language,
    });
    return NextResponse.json({ success: true, bookId: result.book.id, book: result.book });
  } catch (err) {
    const message = err instanceof Error ? err.message : "上传失败";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
