// ====================
// 书籍 PostgreSQL 存储操作
// ====================

import { getSupabase } from "@/lib/supabase/client";
import { storageList, storageDelete } from "@/lib/supabase/storage";
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
// 辅助：Supabase 行 → Book 类型
// ====================

function rowToBook(row: Record<string, unknown>): Book {
  // AI 元数据优先覆盖原始字段
  const ai = (row.ai_metadata as AIMetadata | null | undefined) ?? {};
  const aiStatus = (row.ai_status as string) ?? "idle";

  // title：AI 优化的标题作为展示标题，原始标题作为 titleOriginal
  const rawTitle = (row.title as string) ?? "";
  const rawTitleOriginal = (row.title_original as string) ?? rawTitle;
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
    id: row.id as string,
    title: displayTitle,
    titleOriginal: displayTitleOriginal,
    author: (aiStatus === "done" && aiAuthor) ? aiAuthor : (row.author as string) ?? "",
    description: (aiStatus === "done" && aiDescription) ? aiDescription : (row.description as string) ?? "",
    shortDescription: (aiStatus === "done" && aiShortDesc) ? aiShortDesc : undefined,
    format: (row.format as Book["format"]) ?? "txt",
    language: (aiStatus === "done" && aiLanguage) ? aiLanguage : (row.language as string) ?? "en",
    categories: (aiStatus === "done" && aiCategories) ? aiCategories : (row.categories as string[]) ?? [],
    tags: (aiStatus === "done" && ai.subTags && ai.subTags.length > 0) ? ai.subTags : (row.tags as string[]) ?? [],
    chapterCount: 0,
    uploaderId: (row.uploader_id as string) ?? "anonymous",
    forkCount: 0,
    prCount: 0,
    mergedPrCount: 0,
    status: (row.status as Book["status"]) ?? "active",
    classificationStatus: "pending",
    coverUrl: row.cover_url as string | undefined,
    contentMarkdown: (row.content_markdown as string) ?? undefined,
    createdAt: (row.created_at as string) ?? new Date().toISOString(),
    updatedAt: (row.updated_at as string) ?? new Date().toISOString(),
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
  return rowToBook(data);
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
  const supabase = getSupabase();
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

export async function getBookStoragePath(bookId: string): Promise<string | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("books")
    .select("storage_path")
    .eq("id", bookId)
    .single();
  if (error || !data) return null;
  return (data.storage_path as string | null) ?? null;
}

export async function deleteBook(bookId: string): Promise<void> {
  const supabase = getSupabase();
  try {
    const files = await storageList(`${bookId}/`);
    for (const file of files) {
      await storageDelete(file);
    }
  } catch {
    // ignore
  }
  await supabase.from("books").delete().eq("id", bookId);
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
    query = query.or(
      `title.ilike.%${filters.search}%,title_original.ilike.%${filters.search}%,author.ilike.%${filters.search}%`,
    );
  }
  query = query.order("created_at", { ascending: false });
  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 20;
  const from = (page - 1) * pageSize;
  query = query.range(from, from + pageSize - 1);
  const { data, count, error } = await query;
  if (error || !data) return { books: [], total: 0 };
  return { books: data.map(rowToBook), total: count ?? 0 };
}

export async function getBookCount(status?: string): Promise<number> {
  const supabase = getSupabase();
  let query = supabase.from("books").select("*", { count: "exact", head: true });
  if (status) query = query.eq("status", status);
  const { count } = await query;
  return count ?? 0;
}

export async function getAllBooks(): Promise<Book[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("books")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map(rowToBook);
}
