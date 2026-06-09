// ====================
// 书籍 PostgreSQL 存储操作（精简版：仅书库 + 上下传 + 阅读所需字段）
// ====================

import { getSupabase } from "@/lib/supabase/client";
import { storageList, storageDelete } from "@/lib/supabase/storage";
import type { Book, BookSummary } from "@/lib/utils/types";

// ====================
// 辅助函数：Supabase行数据转Book类型
// ====================

function rowToBook(row: Record<string, unknown>): Book {
  return {
    id: row.id as string,
    title: row.title as string,
    titleOriginal: (row.title_original as string) ?? (row.title as string),
    author: row.author as string,
    description: (row.description as string) ?? "",
    format: (row.format as Book["format"]) ?? "txt",
    language: (row.language as string) ?? "en",
    categories: (row.categories as string[]) ?? [],
    tags: (row.tags as string[]) ?? [],
    chapterCount: 0,
    uploaderId: (row.uploader_id as string) ?? "anonymous",
    forkCount: 0,
    prCount: 0,
    mergedPrCount: 0,
    status: (row.status as Book["status"]) ?? "active",
    classificationStatus: "pending",
    coverUrl: row.cover_url as string | undefined,
    createdAt: (row.created_at as string) ?? new Date().toISOString(),
    updatedAt: (row.updated_at as string) ?? new Date().toISOString(),
  };
}

// ====================
// CRUD 操作
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
    updated_at: new Date().toISOString(),
  };
  if (extras?.storagePath) row.storage_path = extras.storagePath;
  if (typeof extras?.sizeBytes === "number") row.size_bytes = extras.sizeBytes;
  const { error } = await supabase.from("books").upsert(row, { onConflict: "id" });
  if (error) throw new Error(`saveBook failed: ${error.message}`);
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
    // 忽略存储删除错误
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
  if (filters?.language) {
    query = query.eq("language", filters.language);
  }
  if (filters?.category) {
    query = query.contains("categories", [filters.category]);
  }
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
  if (error || !data) {
    return { books: [], total: 0 };
  }

  const books = data.map(rowToBook);
  return { books, total: count ?? 0 };
}

export async function getBookCount(status?: string): Promise<number> {
  const supabase = getSupabase();
  let query = supabase.from("books").select("*", { count: "exact", head: true });
  if (status) {
    query = query.eq("status", status);
  }
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
