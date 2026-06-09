// ====================
// GET /api/translations/[translationId]
// PUT /api/translations/[translationId]
// ====================

import { NextRequest, NextResponse } from "next/server";
import { getTranslation, saveTranslation } from "@/lib/db/translations";
import { requireAuth } from "@/lib/auth/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ translationId: string }> }
) {
  const { translationId } = await params;
  const translation = await getTranslation("", translationId);
  if (!translation) {
    return NextResponse.json({ error: "Translation not found" }, { status: 404 });
  }
  return NextResponse.json(translation);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ translationId: string }> }
) {
  try {
    requireAuth(request);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { translationId } = await params;
  const body = await request.json();
  const translation = await getTranslation("", translationId);
  if (!translation) {
    return NextResponse.json({ error: "Translation not found" }, { status: 404 });
  }

  Object.assign(translation, body);
  await saveTranslation(translation.bookId, translation);
  return NextResponse.json(translation);
}
