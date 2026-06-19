// ====================
// GET /api/books/[id] — 单本书详情
// ====================

import { NextRequest, NextResponse } from "next/server";
import { getBook } from "@/lib/db/books";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const book = await getBook(id);
    if (!book) {
      return NextResponse.json({ error: "书籍不存在" }, { status: 404 });
    }
    return NextResponse.json(book);
  } catch (err) {
    console.error("[api/books/[id]] error:", err);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
