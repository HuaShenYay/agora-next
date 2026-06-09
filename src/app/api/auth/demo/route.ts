// ====================
// 演示账号登录 API
// ====================

import { NextRequest, NextResponse } from "next/server";
import { getUserByUsername, getAllUsers } from "@/lib/db/users";
import { setUserCookie, clearUserCookie } from "@/lib/auth/auth";

export async function GET(_request: NextRequest) {
  const users = getAllUsers();
  return NextResponse.json({ users });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { role, action } = body;

  if (action === "logout") {
    const response = NextResponse.json({ success: true });
    response.headers.set("Set-Cookie", clearUserCookie());
    return response;
  }

  const user = getUserByUsername(role);
  if (!user) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const response = NextResponse.json({
    success: true,
    user: {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      role: user.role,
    },
  });
  response.headers.set("Set-Cookie", setUserCookie(user.id));
  return response;
}
