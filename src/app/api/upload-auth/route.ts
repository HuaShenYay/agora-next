// POST /api/upload-auth — 验证上传密码
import { NextRequest, NextResponse } from "next/server";
import { safeEqual } from "@/lib/utils/crypto-safe";

export async function POST(request: NextRequest) {
  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "无效请求体" }, { status: 400 });
  }

  const correct = process.env.UPLOAD_PASSWORD;
  if (!correct) {
    // 未设置密码时，拒绝所有上传
    return NextResponse.json({ error: "上传功能已关闭" }, { status: 403 });
  }

  if (safeEqual(body.password ?? "", correct)) {
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "密码错误" }, { status: 401 });
}
