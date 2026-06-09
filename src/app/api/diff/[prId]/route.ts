// ====================
// GET /api/diff/[prId] — 获取 PR 的 diff 数据
// ====================

import { NextRequest, NextResponse } from "next/server";
import { getPR } from "@/lib/db/prs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ prId: string }> }
) {
  const { prId } = await params;
  const pr = await getPR("", prId);
  if (!pr) {
    return NextResponse.json({ error: "PR not found" }, { status: 404 });
  }
  return NextResponse.json({ diffSnapshot: pr.diffSnapshot });
}
