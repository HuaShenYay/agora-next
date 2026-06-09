// ====================
// GET /api/books — 书籍列表
// POST /api/books — 创建书籍
// ====================

import { NextRequest, NextResponse } from "next/server";
import { listBooks } from "@/lib/db/books";

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const category = url.searchParams.get("category") ?? undefined;
  const language = url.searchParams.get("language") ?? undefined;
  const search = url.searchParams.get("search") ?? undefined;
  const page = parseInt(url.searchParams.get("page") ?? "1");
  const pageSize = parseInt(url.searchParams.get("pageSize") ?? "20");

  const result = await listBooks({ category, language, search, page, pageSize });
  return NextResponse.json(result);
}

export async function POST(_request: NextRequest) {
  // 书籍创建通过 /api/upload 处理（multipart）
  return NextResponse.json({ error: "Use /api/upload for book creation" }, { status: 400 });
}
