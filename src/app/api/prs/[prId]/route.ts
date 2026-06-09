// ====================
// GET /api/prs/[prId]
// PUT /api/prs/[prId]
// ====================

import { NextRequest, NextResponse } from "next/server";
import { getPR, savePR } from "@/lib/db/prs";
import { requireAuth, requireAdmin } from "@/lib/auth/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ prId: string }> }
) {
  const { prId } = await params;
  const pr = await getPR("", prId);
  if (!pr) {
    return NextResponse.json({ error: "PR not found" }, { status: 404 });
  }
  return NextResponse.json(pr);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ prId: string }> }
) {
  try {
    requireAuth(request);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { prId } = await params;
  const body = await request.json();
  const pr = await getPR("", prId);
  if (!pr) {
    return NextResponse.json({ error: "PR not found" }, { status: 404 });
  }

  // Merge 操作需要管理员权限
  if (body.status === "merged") {
    try {
      requireAdmin(request);
    } catch {
      return NextResponse.json({ error: "Admin required for merge" }, { status: 403 });
    }
    pr.mergedAt = new Date().toISOString();
    pr.mergedBy = requireAuth(request).id;
  }

  Object.assign(pr, body);
  await savePR(pr.bookId, pr);
  return NextResponse.json(pr);
}
