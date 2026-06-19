// ====================
// GET /api/books — 书籍列表
// ====================

import { NextRequest, NextResponse } from "next/server";
import { listBooks } from "@/lib/db/books";

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl;
    const category = url.searchParams.get("category") ?? undefined;
    const language = url.searchParams.get("language") ?? undefined;
    const search = url.searchParams.get("search") ?? undefined;
    const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1") || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(url.searchParams.get("pageSize") ?? "20") || 20));

    const result = await listBooks({ category, language, search, page, pageSize });
    return NextResponse.json(result);
  } catch (err) {
    console.error("[api/books] error:", err);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
