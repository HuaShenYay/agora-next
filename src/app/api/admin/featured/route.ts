// ====================
// GET /api/admin/featured — 获取推荐书籍列表（通过 featured 分类）
// POST /api/admin/featured — 占位（推荐逻辑通过分类 featured 标记控制）
// ====================

import { NextRequest, NextResponse } from "next/server";
import { requireAdminMiddleware } from "@/lib/auth/admin-guard";
import { getAllCategories } from "@/lib/db/categories";
import { getAllBooks } from "@/lib/db/books";

export async function GET(req: NextRequest) {
  const auth = requireAdminMiddleware(req);
  if (auth instanceof NextResponse) return auth;

  const categories = await getAllCategories();
  const featuredCats = categories.filter((c) => c.featured).map((c) => c.id);

  const allBooks = await getAllBooks();
  const featured = allBooks.filter((b) =>
    b.categories.some((c: string) => featuredCats.includes(c))
  );

  return NextResponse.json({ featured });
}

export async function POST(req: NextRequest) {
  const auth = requireAdminMiddleware(req);
  if (auth instanceof NextResponse) return auth;

  // 推荐位通过分类的 featured 标记控制
  return NextResponse.json({ success: true });
}
