// ====================
// 书籍 PostgreSQL 存储操作
// ====================

import { getSupabase } from "@/lib/supabase/client";
import { getAdminSupabase } from "@/lib/supabase/admin";
import type { Book, BookSummary } from "@/lib/utils/types";

// ====================
// AI 元数据类型
// ====================

export interface AIMetadata {
  title?: string;
  author?: string;
  description?: string;
  shortDescription?: string;
  categories?: string[];
  subTags?: string[];
  language?: string;
}

// ====================
// Supabase 行类型（books 表）
// ====================

interface BookRow {
  id: string;
  title: string | null;
  title_original: string | null;
  author: string | null;
  description: string | null;
  format: Book["format"] | null;
  language: string | null;
  categories: string[] | null;
  tags: string[] | null;
  status: Book["status"] | null;
  uploader_id: string | null;
  cover_url: string | null;
  content_markdown: string | null;
  ai_status: string | null;
  ai_metadata: AIMetadata | null;
  created_at: string;
  updated_at: string;
}

// ====================
// 辅助：Supabase 行 → Book 类型
// ====================

function rowToBook(row: BookRow): Book {
  // AI 元数据优先覆盖原始字段
  const ai = row.ai_metadata ?? {};
  const aiStatus = row.ai_status ?? "idle";

  // title：AI 优化的标题作为展示标题，原始标题作为 titleOriginal
  const rawTitle = row.title ?? "";
  const rawTitleOriginal = row.title_original ?? rawTitle;
  const aiTitle = ai.title?.trim();
  const displayTitle = (aiStatus === "done" && aiTitle) ? aiTitle : rawTitle;
  const displayTitleOriginal = (aiStatus === "done" && aiTitle && aiTitle !== rawTitleOriginal)
    ? rawTitleOriginal
    : rawTitleOriginal;

  const aiAuthor = ai.author?.trim();
  const aiDescription = ai.description?.trim();
  const aiShortDesc = ai.shortDescription?.trim();
  const aiCategories = Array.isArray(ai.categories) && ai.categories.length > 0 ? ai.categories : undefined;
  const aiLanguage = ai.language?.trim();

  return {
    id: row.id,
    title: displayTitle,
    titleOriginal: displayTitleOriginal,
    author: (aiStatus === "done" && aiAuthor) ? aiAuthor : row.author ?? "",
    description: (aiStatus === "done" && aiDescription) ? aiDescription : row.description ?? "",
    shortDescription: (aiStatus === "done" && aiShortDesc) ? aiShortDesc : undefined,
    format: row.format ?? "txt",
    language: (aiStatus === "done" && aiLanguage) ? aiLanguage : row.language ?? "en",
    categories: (aiStatus === "done" && aiCategories) ? aiCategories : row.categories ?? [],
    tags: (aiStatus === "done" && ai.subTags && ai.subTags.length > 0) ? ai.subTags : row.tags ?? [],
    chapterCount: 0,
    uploaderId: row.uploader_id ?? "anonymous",
    forkCount: 0,
    prCount: 0,
    mergedPrCount: 0,
    status: row.status ?? "active",
    classificationStatus: "pending",
    coverUrl: row.cover_url ?? undefined,
    contentMarkdown: row.content_markdown ?? undefined,
    createdAt: row.created_at ?? new Date().toISOString(),
    updatedAt: row.updated_at ?? new Date().toISOString(),
  };
}

// ====================
// CRUD
// ====================

export async function getBook(bookId: string): Promise<Book | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("books")
    .select("*")
    .eq("id", bookId)
    .single();
  if (error || !data) return null;
  return rowToBook(data as unknown as BookRow);
}

export interface AIMetaRow {
  aiStatus: "idle" | "pending" | "done" | "failed";
  aiMetadata: AIMetadata | null;
  aiError: string | null;
  aiUpdatedAt: string | null;
}

export async function getBookAi(bookId: string): Promise<AIMetaRow | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("books")
    .select("ai_status, ai_metadata, ai_error, ai_updated_at")
    .eq("id", bookId)
    .single();
  if (error || !data) return null;
  return {
    aiStatus: ((data.ai_status as string) ?? "idle") as AIMetaRow["aiStatus"],
    aiMetadata: (data.ai_metadata as AIMetadata | null) ?? null,
    aiError: (data.ai_error as string | null) ?? null,
    aiUpdatedAt: (data.ai_updated_at as string | null) ?? null,
  };
}

export async function saveBook(
  book: Book,
  extras?: { storagePath?: string; sizeBytes?: number },
): Promise<void> {
  const supabase = getAdminSupabase();
  const row: Record<string, unknown> = {
    id: book.id,
    title: book.title,
    title_original: book.titleOriginal,
    author: book.author,
    description: book.description,
    format: book.format,
    language: book.language,
    categories: book.categories,
    tags: book.tags,
    uploader_id: book.uploaderId,
    status: book.status,
    cover_url: book.coverUrl,
    content_markdown: book.contentMarkdown ?? "",
    updated_at: new Date().toISOString(),
  };
  if (extras?.storagePath) row.storage_path = extras.storagePath;
  if (typeof extras?.sizeBytes === "number") row.size_bytes = extras.sizeBytes;
  const { error } = await supabase.from("books").upsert(row, { onConflict: "id" });
  if (error) {
    const detail = [
      error.message,
      error.details ? `details: ${error.details}` : "",
      error.hint ? `hint: ${error.hint}` : "",
      error.code ? `code: ${error.code}` : "",
    ].filter(Boolean).join(" | ");
    throw new Error(`saveBook failed: ${detail}`);
  }
}

/**
 * 把用户搜索词转成安全的 PostgREST `.or()` 过滤串。
 * 防止 `,` / `(` / `)` 等 PostgREST 元字符注入额外过滤子句，
 * 同时转义 ilike 模式里的 `%` / `_` 通配符。
 */
function buildSearchFilter(term: string): string {
  const safe = term
    // 转义 PostgREST 过滤语法元字符：先转反斜杠，再转逗号/圆括号
    .replace(/\\/g, "\\\\")
    .replace(/,/g, "\\,")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    // 转义 ilike 模式通配符
    .replace(/%/g, "\\%")
    .replace(/_/g, "\\_");
  return (
    `title.ilike.%${safe}%,` +
    `title_original.ilike.%${safe}%,` +
    `author.ilike.%${safe}%`
  );
}

export async function listBooks(filters?: {
  category?: string;
  language?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ books: BookSummary[]; total: number }> {
  const supabase = getSupabase();
  let query = supabase.from("books").select("*", { count: "exact" });
  query = query.eq("status", "active");
  if (filters?.language) query = query.eq("language", filters.language);
  if (filters?.category) query = query.contains("categories", [filters.category]);
  if (filters?.search) {
    query = query.or(buildSearchFilter(filters.search));
  }
  query = query.order("created_at", { ascending: false });
  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 20;
  const from = (page - 1) * pageSize;
  query = query.range(from, from + pageSize - 1);
  const { data, count, error } = await query;
  if (error || !data) return { books: [], total: 0 };
  return { books: data.map((d) => rowToBook(d as unknown as BookRow)), total: count ?? 0 };
}
