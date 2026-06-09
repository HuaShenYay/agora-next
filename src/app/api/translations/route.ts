// ====================
// GET /api/translations — 翻译项目列表
// POST /api/translations — 创建翻译项目（Fork）
// ====================

import { NextRequest, NextResponse } from "next/server";
import { listTranslations } from "@/lib/db/translations";
import { requireAuth } from "@/lib/auth/auth";
import { forkBook } from "@/lib/services/fork-service";

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const bookId = url.searchParams.get("bookId");
  if (!bookId) {
    return NextResponse.json({ error: "bookId required" }, { status: 400 });
  }
  const translations = await listTranslations(bookId);
  return NextResponse.json({ translations });
}

export async function POST(request: NextRequest) {
  try {
    requireAuth(request);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { bookId, targetLanguage, name, description } = body;
  const user = requireAuth(request);

  const translation = await forkBook(bookId, user.id, {
    targetLanguage,
    name,
    description,
  });

  return NextResponse.json({ success: true, translation });
}
