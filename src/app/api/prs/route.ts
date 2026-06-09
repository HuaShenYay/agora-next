// ====================
// GET /api/prs — PR 列表
// POST /api/prs — 创建 PR
// ====================

import { NextRequest, NextResponse } from "next/server";
import { listPRs } from "@/lib/db/prs";
import { requireAuth } from "@/lib/auth/auth";
import { savePR } from "@/lib/db/prs";
import type { PullRequest } from "@/lib/utils/types";

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const bookId = url.searchParams.get("bookId");
  if (!bookId) {
    return NextResponse.json({ error: "bookId required" }, { status: 400 });
  }
  const prs = await listPRs(bookId);
  return NextResponse.json({ prs });
}

export async function POST(request: NextRequest) {
  try {
    requireAuth(request);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const user = requireAuth(request);

  const pr: PullRequest = {
    id: crypto.randomUUID(),
    bookId: body.bookId,
    translationId: body.translationId,
    title: body.title,
    description: body.description ?? "",
    authorId: user.id,
    chapterIds: body.chapterIds ?? [],
    status: "open",
    diffSnapshot: body.diffSnapshot ?? [],
    reviewComments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await savePR(pr.bookId, pr);
  return NextResponse.json({ success: true, pr });
}
