// ====================
// 章节 PostgreSQL + Storage 存储操作
// ====================

import { getSupabase } from "@/lib/supabase/client";
import { storageUpload, storageDownload, storageList } from "@/lib/supabase/storage";
import { STORAGE_PATHS } from "@/lib/utils/constants";
import type { Chapter } from "@/lib/utils/types";

export async function getChapterContent(
  bookId: string,
  chapterIndex: number,
): Promise<string | null> {
  return await storageDownload(
    STORAGE_PATHS.chapterFile(bookId, chapterIndex),
  );
}

export async function saveChapterContent(
  bookId: string,
  chapterIndex: number,
  content: string,
): Promise<void> {
  await storageUpload(
    STORAGE_PATHS.chapterFile(bookId, chapterIndex),
    content,
    "text/markdown",
  );
}

export async function listChapterFiles(
  bookId: string,
): Promise<string[]> {
  return await storageList(`${bookId}/chapters`);
}

export async function getChapterCount(bookId: string): Promise<number> {
  const supabase = getSupabase();
  const { count } = await supabase
    .from("chapters")
    .select("*", { count: "exact", head: true })
    .eq("book_id", bookId);
  return count ?? 0;
}

export async function saveChapterMeta(chapter: Chapter): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from("chapters").upsert({
    id: chapter.id,
    book_id: chapter.bookId,
    index: chapter.index,
    title: chapter.title,
    word_count: chapter.wordCount,
  }, { onConflict: "id" });
  if (error) throw new Error(`saveChapterMeta failed: ${error.message}`);
}

export async function getChaptersForBook(bookId: string): Promise<Chapter[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("chapters")
    .select("*")
    .eq("book_id", bookId)
    .order("index", { ascending: true });
  if (error || !data) return [];
  return data.map((row) => ({
    id: row.id as string,
    bookId: row.book_id as string,
    index: row.index as number,
    title: (row.title as string) ?? "",
    wordCount: (row.word_count as number) ?? 0,
  }));
}

export async function deleteChaptersForBook(bookId: string): Promise<void> {
  const supabase = getSupabase();
  await supabase.from("chapters").delete().eq("book_id", bookId);
}
