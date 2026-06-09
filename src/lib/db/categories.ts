// ====================
// 分类 PostgreSQL 存储操作
// ====================

import { getSupabase } from "@/lib/supabase/client";
import type { Category } from "@/lib/utils/types";
import { DEFAULT_CATEGORIES } from "@/lib/utils/constants";

function rowToCategory(row: Record<string, unknown>): Category {
  return {
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
    description: (row.description as string) ?? "",
    icon: row.icon as string | undefined,
    parentId: row.parent_id as string | undefined,
    sortOrder: (row.sort_order as number) ?? 99,
    featured: (row.featured as boolean) ?? false,
    createdAt: (row.created_at as string) ?? new Date().toISOString(),
  };
}

export async function getAllCategories(): Promise<Category[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(`getAllCategories failed: ${error.message}`);

  if (!data || data.length === 0) {
    const defaults: Category[] = DEFAULT_CATEGORIES.map((c) => ({
      ...c,
      parentId: undefined,
      featured: false,
      createdAt: new Date().toISOString(),
    }));
    for (const cat of defaults) {
      await saveCategory(cat);
    }
    return defaults;
  }

  return data.map(rowToCategory);
}

export async function saveCategory(category: Category): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from("categories").upsert({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    icon: category.icon,
    parent_id: category.parentId,
    sort_order: category.sortOrder,
    featured: category.featured ?? false,
  }, { onConflict: "id" });
  if (error) throw new Error(`saveCategory failed: ${error.message}`);
}

export async function deleteCategory(id: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw new Error(`deleteCategory failed: ${error.message}`);
}

export async function toggleFeatured(
  categoryId: string,
  _bookId?: string,
): Promise<void> {
  void _bookId;
  const supabase = getSupabase();
  const { data } = await supabase
    .from("categories")
    .select("featured")
    .eq("id", categoryId)
    .single();
  if (data) {
    await supabase
      .from("categories")
      .update({ featured: !(data.featured as boolean) })
      .eq("id", categoryId);
  }
}
