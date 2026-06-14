// ====================
// GET /api/profile/[id] — 拉取任一用户 profile（详情页用）
// ====================

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, bio, created_at")
    .eq("id", id)
    .single();
  if (error || !data) {
    return NextResponse.json({ error: "PROFILE_NOT_FOUND" }, { status: 404 });
  }
  return NextResponse.json(data);
}
