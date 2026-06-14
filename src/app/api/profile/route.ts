// ====================
// PATCH /api/profile — 更新当前用户的 profile
// GET /api/profile/[id] — 拉取任一用户（详情页用）
// ====================

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function PATCH(request: NextRequest) {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });

  let body: { displayName?: string; bio?: string; avatarUrl?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "无效请求体" }, { status: 400 });
  }

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (typeof body.displayName === "string") patch.display_name = body.displayName.slice(0, 64);
  if (typeof body.bio === "string") patch.bio = body.bio.slice(0, 500);
  if (typeof body.avatarUrl === "string") patch.avatar_url = body.avatarUrl.slice(0, 500);

  const { error } = await supabase.from("profiles").update(patch).eq("id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
