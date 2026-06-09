// ====================
// POST /api/upload — 文件上传
// ====================

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/auth";
import { processUpload } from "@/lib/services/file-upload";

export async function POST(request: NextRequest) {
  try {
    requireAuth(request);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const title = formData.get("title") as string;
  const titleOriginal = formData.get("titleOriginal") as string | null;
  const author = formData.get("author") as string;
  const description = formData.get("description") as string | null;
  const language = formData.get("language") as string;

  if (!file || !title || !author || !language) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const fileData = new Uint8Array(await file.arrayBuffer());
  const user = requireAuth(request);

  const result = await processUpload(fileData, file.name, file.type, {
    title,
    titleOriginal: titleOriginal ?? undefined,
    author,
    description: description ?? undefined,
    language,
    uploaderId: user.id,
  });

  return NextResponse.json({ success: true, book: result.book, chapters: result.chapters });
}
