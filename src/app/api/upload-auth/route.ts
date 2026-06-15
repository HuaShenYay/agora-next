// POST /api/upload-auth — 验证上传密码
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { password } = await request.json();
  const correct = process.env.UPLOAD_PASSWORD;

  if (!correct) {
    // 未设置密码时，拒绝所有上传
    return NextResponse.json({ error: "上传功能已关闭" }, { status: 403 });
  }

  if (password === correct) {
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "密码错误" }, { status: 401 });
}
