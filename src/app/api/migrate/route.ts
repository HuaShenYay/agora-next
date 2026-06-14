// ====================
// POST /api/migrate — 运行数据库迁移（演示阶段用，后续应删除）
// 执行 ALTER TABLE 添加新列
// ====================

import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase/client";

export async function POST() {
  const supabase = getSupabase();
  const results: string[] = [];

  // 迁移 1: 添加 content_markdown 列
  try {
    const { error } = await supabase.rpc("exec_sql", {
      sql: "ALTER TABLE books ADD COLUMN IF NOT EXISTS content_markdown TEXT DEFAULT ''",
    });
    if (error) {
      // 如果 exec_sql 函数不存在，尝试用 raw 方式
      results.push(`content_markdown: ${error.message} — 请手动在 Supabase SQL Editor 中执行: ALTER TABLE books ADD COLUMN IF NOT EXISTS content_markdown TEXT DEFAULT ''`);
    } else {
      results.push("content_markdown 列已添加");
    }
  } catch (e) {
    results.push(`content_markdown 迁移异常: ${e instanceof Error ? e.message : String(e)}`);
  }

  return NextResponse.json({ results });
}
