// ====================
// GET /api/chapters/[translationId]/[chapterId]
// PUT /api/chapters/[translationId]/[chapterId]
// ====================

import { NextRequest, NextResponse } from "next/server";
import { getTranslationChapterContent, saveTranslationChapterContent } from "@/lib/db/translations";
import { requireAuth } from "@/lib/auth/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ translationId: string; chapterId: string }> }
) {
  const { translationId, chapterId } = await params;
  const chapterIndex = parseInt(chapterId);
  const content = await getTranslationChapterContent("", translationId, chapterIndex);
  return NextResponse.json({ content });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ translationId: string; chapterId: string }> }
) {
  try {
    requireAuth(request);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { translationId, chapterId } = await params;
  const body = await request.json();
  const chapterIndex = parseInt(chapterId);

  await saveTranslationChapterContent("", translationId, chapterIndex, body.content);
  return NextResponse.json({ success: true });
}
