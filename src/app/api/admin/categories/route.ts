// ====================
// GET /api/admin/categories — 获取所有分类
// POST /api/admin/categories — 创建/更新分类
// DELETE /api/admin/categories — 删除分类
// ====================

import { NextRequest, NextResponse } from "next/server";
import { requireAdminMiddleware } from "@/lib/auth/admin-guard";
import {
  getAllCategories,
  saveCategory,
  deleteCategory,
  toggleFeatured,
} from "@/lib/db/categories";

export async function GET(req: NextRequest) {
  const auth = requireAdminMiddleware(req);
  if (auth instanceof NextResponse) return auth;

  const categories = await getAllCategories();
  return NextResponse.json({ categories });
}

export async function POST(req: NextRequest) {
  const auth = requireAdminMiddleware(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const data = await req.json();

    if (data.action === "toggle-featured") {
      await toggleFeatured(data.categoryId);
      return NextResponse.json({ success: true });
    }

    const { id, name, slug, description } = data;
    if (!id || !name || !slug) {
      return NextResponse.json(
        { error: "id, name, slug 为必填项" },
        { status: 400 }
      );
    }

    const categories = await getAllCategories();
    const existing = categories.find((c) => c.id === id);

    const category = {
      id,
      name,
      slug,
      description: description ?? "",
      icon: data.icon ?? existing?.icon,
      parentId: data.parentId ?? existing?.parentId,
      sortOrder: data.sortOrder ?? existing?.sortOrder ?? 99,
      featured: data.featured ?? existing?.featured ?? false,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    };

    await saveCategory(category);
    return NextResponse.json({ success: true, category });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const auth = requireAdminMiddleware(req);
  if (auth instanceof NextResponse) return auth;

  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "缺少 id 参数" }, { status: 400 });
  }

  await deleteCategory(id);
  return NextResponse.json({ success: true });
}
