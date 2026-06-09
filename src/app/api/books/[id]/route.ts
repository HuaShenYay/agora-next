// ====================
// GET /api/books/[id] — 单本书详情
// ====================

import { NextRequest, NextResponse } from "next/server";
import { getBook } from "@/lib/db/books";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const book = await getBook(id);
  if (!book) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }
  return NextResponse.json(book);
}
