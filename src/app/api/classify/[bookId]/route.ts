// ====================
// POST /api/classify/[bookId] — AI 分类
// GET /api/classify/[bookId] — 获取分类状态
// ====================

import { NextRequest, NextResponse } from "next/server";
import { getBook, updateBookPartial } from "@/lib/db/books";
import { classifyBook } from "@/lib/services/ai-classifier";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  const { bookId } = await params;
  const book = await getBook(bookId);
  if (!book) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }
  return NextResponse.json({
    classificationStatus: book.classificationStatus,
    aiClassification: book.aiClassification,
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  const { bookId } = await params;
  const book = await getBook(bookId);
  if (!book) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }

  try {
    const classification = await classifyBook(bookId);
    if (!classification) {
      return NextResponse.json({ error: "Classification failed" }, { status: 500 });
    }
    await updateBookPartial(bookId, {
      classificationStatus: "done",
      aiClassification: classification,
      categories: [classification.primary, ...classification.suggested].slice(0, 3),
      tags: classification.tags,
    });
    return NextResponse.json({ success: true, classification });
  } catch {
    await updateBookPartial(bookId, { classificationStatus: "failed" });
    return NextResponse.json({ error: "Classification failed" }, { status: 500 });
  }
}
